"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContribution } from "@/lib/contribution-context";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { merchantCategoryOptions } from "@/lib/constants";
import { AliasInput, SupportStatusSelect } from "./dialog-shared";
import { isValidUrl } from "@/lib/utils";
import { Merchant } from "@/db/schema/merchants";
import { SupportStatus } from "@/db/schema/support";
import { createMerchantContribution } from "@/actions/contribution-actions";
import { ContributionAction } from "@/db/schema/contributions";

// ============================================================================
// Delete Mode Content Component
// ============================================================================

interface DeleteModeContentProps {
  merchantName: string;
  reason: string;
  onReasonChange: (value: string) => void;
}

function DeleteModeContent({
  merchantName,
  reason,
  onReasonChange,
}: DeleteModeContentProps) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle className="font-bold">Confirm Deletion Request</AlertTitle>
        <AlertDescription>
          <p>
            You are requesting to remove{" "}
            <span className="font-bold">{merchantName}</span> from the tracker.
            Please provide a reason for this request.
          </p>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="reason">
          Reason for deletion <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="reason"
          placeholder="Why should this merchant be removed?"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
}

// ============================================================================
// Category Select Component
// ============================================================================

interface CategorySelectProps {
  value: Merchant["category"];
  onChange: (value: Merchant["category"]) => void;
}

function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="category">
        Category <span className="text-destructive">*</span>
      </Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as Merchant["category"])}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {merchantCategoryOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.emoji} {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ============================================================================
// Merchant Form Content Component
// ============================================================================

interface MerchantFormContentProps {
  name: string;
  onNameChange: (value: string) => void;
  aliases: string[];
  aliasInput: string;
  onAliasInputChange: (value: string) => void;
  onAddAlias: () => void;
  onRemoveAlias: (alias: string) => void;
  website: string;
  onWebsiteChange: (value: string) => void;
  logoUrl: string;
  onLogoUrlChange: (value: string) => void;
  category: Merchant["category"];
  onCategoryChange: (value: Merchant["category"]) => void;
  weroSupport: SupportStatus;
  onWeroSupportChange: (value: SupportStatus) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  isEdit: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
}

function MerchantFormContent({
  name,
  onNameChange,
  aliases,
  aliasInput,
  onAliasInputChange,
  onAddAlias,
  onRemoveAlias,
  website,
  onWebsiteChange,
  logoUrl,
  onLogoUrlChange,
  category,
  onCategoryChange,
  weroSupport,
  onWeroSupportChange,
  notes,
  onNotesChange,
  isEdit,
  reason,
  onReasonChange,
}: MerchantFormContentProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">
          Merchant Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Amazon"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>

      <AliasInput
        aliases={aliases}
        aliasInput={aliasInput}
        onAliasInputChange={onAliasInputChange}
        onAddAlias={onAddAlias}
        onRemoveAlias={onRemoveAlias}
        placeholder="Add alias (helps with search)"
      />

      <div className="space-y-2">
        <Label htmlFor="website">
          Website <span className="text-destructive">*</span>
        </Label>
        <Input
          id="website"
          type="url"
          placeholder="https://merchant.com"
          value={website}
          onChange={(e) => onWebsiteChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoUrl">
          Logo URL <span className="text-destructive">*</span>
        </Label>
        <Input
          id="logoUrl"
          type="url"
          placeholder="https://example.com/logo.png"
          value={logoUrl}
          onChange={(e) => onLogoUrlChange(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Provide a direct link to the merchant&apos;s logo image
        </p>
      </div>

      <CategorySelect value={category} onChange={onCategoryChange} />

      <SupportStatusSelect
        label="Wero Support Status"
        value={weroSupport}
        onChange={onWeroSupportChange}
        required
      />

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about this merchant..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Notes are being displayed in a tooltip on the merchant card
        </p>
      </div>

      {isEdit && (
        <>
          <Separator />

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for change <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Why are you suggesting this change?"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              required
            />
          </div>
        </>
      )}
    </>
  );
}

// ============================================================================
// Main Dialog Component
// ============================================================================

export function MerchantDialog() {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<ContributionAction>("add");
  const [existingMerchant, setExistingMerchant] = useState<Merchant | null>(
    null,
  );
  const [submitError, setSubmitError] = useState("");
  const { onOpenContributionDialog } = useContribution();

  // Form state
  const [name, setName] = useState("");
  const [aliases, setAliases] = useState<string[]>([]);
  const [aliasInput, setAliasInput] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [category, setCategory] = useState<Merchant["category"]>("other");
  const [weroSupport, setWeroSupport] = useState<SupportStatus>("unknown");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");

  const resetForm = () => {
    setSubmitError("");
    setName("");
    setAliases([]);
    setAliasInput("");
    setWebsite("");
    setLogoUrl("");
    setCategory("other");
    setWeroSupport("unknown");
    setNotes("");
    setReason("");
  };

  useEffect(() => {
    onOpenContributionDialog((options) => {
      if (options.type === "merchant") {
        setOpen(true);
        setAction(options.action);
        if (options.action === "edit" || options.action === "delete") {
          setExistingMerchant(options.entity);
        } else {
          setExistingMerchant(null);
          resetForm();
        }
      }
    });
  }, [onOpenContributionDialog]);

  // Populate form with existing data for edit/delete
  useEffect(() => {
    if (open && existingMerchant) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Form initialization in dialog is a valid pattern
      setName(existingMerchant.name);
      setAliases(existingMerchant.aliases);
      setWebsite(existingMerchant.website);
      setLogoUrl(existingMerchant.logoUrl);
      setCategory(existingMerchant.category);
      setWeroSupport(existingMerchant.weroSupport);
      setNotes(existingMerchant.notes || "");
    }
  }, [open, existingMerchant, action]);

  const handleAddAlias = () => {
    if (aliasInput.trim() && !aliases.includes(aliasInput.trim())) {
      setAliases([...aliases, aliasInput.trim()]);
      setAliasInput("");
    }
  };

  const handleRemoveAlias = (alias: string) => {
    setAliases(aliases.filter((a) => a !== alias));
  };

  const getSubmitValidation = () => {
    if (action === "delete") {
      const hasReason = reason.trim().length > 0;

      if (!hasReason)
        return {
          valid: false,
          message: "Please provide a reason for deletion",
        };

      return { valid: true, message: "" };
    }

    const errors: string[] = [];
    if (!name.trim()) errors.push("Merchant name");
    if (!website.trim() || !isValidUrl(website.trim())) errors.push("Website");
    if (!logoUrl.trim() || !isValidUrl(logoUrl.trim())) errors.push("Logo URL");
    if (action === "edit" && !reason.trim()) errors.push("Reason for changes");

    if (errors.length > 0) {
      return { valid: false, message: `Missing: ${errors.join(", ")}` };
    }

    return { valid: true, message: "" };
  };

  const validation = getSubmitValidation();

  const handleSubmit = async () => {
    if (!validation.valid) return;

    if (action === "add") {
      const { success, message } = await createMerchantContribution({
        action,
        data: {
          name,
          aliases,
          website,
          logoUrl,
          category,
          weroSupport,
          notes,
        },
      });
      if (!success) {
        setSubmitError(message);
      } else {
        setOpen(false);
      }
    } else {
      const { success, message } = await createMerchantContribution({
        action,
        data: {
          id: existingMerchant!.id,
          name,
          aliases,
          website,
          logoUrl,
          category,
          weroSupport,
          notes,
        },
        reason,
      });
      if (!success) {
        setSubmitError(message);
      } else {
        setOpen(false);
      }
    }
  };

  const getTitle = () => {
    if (action === "delete") return "Suggest Deletion";
    if (action === "edit") return "Suggest Edit";
    return "Add New Merchant";
  };

  const getDescription = () => {
    if (action === "delete")
      return `Request to remove "${existingMerchant?.name}" from the tracker.`;
    if (action === "edit")
      return `Suggest changes to "${existingMerchant?.name}".`;
    return "Submit a new merchant to be added to the tracker. Your submission will be reviewed before being published.";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4 -mr-4 **:max-w-[calc(100vw-5rem)] sm:**:max-w-116">
          <div className="space-y-4 py-2">
            {action === "delete" ? (
              <DeleteModeContent
                merchantName={existingMerchant?.name || ""}
                reason={reason}
                onReasonChange={setReason}
              />
            ) : (
              <MerchantFormContent
                name={name}
                onNameChange={setName}
                aliases={aliases}
                aliasInput={aliasInput}
                onAliasInputChange={setAliasInput}
                onAddAlias={handleAddAlias}
                onRemoveAlias={handleRemoveAlias}
                website={website}
                onWebsiteChange={setWebsite}
                logoUrl={logoUrl}
                onLogoUrlChange={setLogoUrl}
                category={category}
                onCategoryChange={setCategory}
                weroSupport={weroSupport}
                onWeroSupportChange={setWeroSupport}
                notes={notes}
                onNotesChange={setNotes}
                isEdit={action === "edit"}
                reason={reason}
                onReasonChange={setReason}
              />
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center">
          {submitError && (
            <p className="text-xs text-destructive mr-auto">{submitError}</p>
          )}
          {!validation.valid && validation.message && (
            <p className="text-xs text-muted-foreground mr-auto">
              {validation.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!validation.valid}
              variant={action === "delete" ? "destructive" : "default"}
            >
              {action === "delete"
                ? "Submit Deletion Request"
                : "Submit for Review"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
