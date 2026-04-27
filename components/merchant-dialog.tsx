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
import { useEditor } from "@/lib/editor-context";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  merchantCategoryOptions,
  baseSupportStatusOptions,
} from "@/lib/constants";
import { AliasInput } from "./dialog-shared";
import { isValidUrl } from "@/lib/myutils";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Merchant, NewMerchant } from "@/db/schema/merchants";
import { SupportStatus } from "@/db/schema/support";
import { createMerchantContribution } from "@/actions/contribution-actions";
import { ContributionAction } from "@/db/schema/contributions";
import { toast } from "sonner";
import {
  createMerchant,
  deleteMerchant,
  findDuplicateMerchants,
  updateMerchant,
} from "@/actions/merchant-actions";

// ============================================================================
// Delete Mode Content Component
// ============================================================================

interface DeleteModeContentProps {
  merchantName: string;
  submitType: "contribution" | "admin";
  reason: string;
  onReasonChange: (value: string) => void;
}

function DeleteModeContent({
  merchantName,
  submitType,
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

      {submitType === "contribution" && (
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
      )}
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
  logoUrl: string;
  onLogoUrlChange: (value: string) => void;
  website: string;
  onWebsiteChange: (value: string) => void;
  category: Merchant["category"];
  onCategoryChange: (value: Merchant["category"]) => void;
  weroSupport: SupportStatus;
  onWeroSupportChange: (value: SupportStatus) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  isEdit: boolean;
  submitType: "contribution" | "admin";
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
  logoUrl,
  onLogoUrlChange,
  website,
  onWebsiteChange,
  category,
  onCategoryChange,
  weroSupport,
  onWeroSupportChange,
  notes,
  onNotesChange,
  isEdit,
  submitType,
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

      {submitType === "admin" && (
        <div className="space-y-2">
          <Label htmlFor="bank-logo">
            Logo URL <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            {logoUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoUrl}
                alt="Icon preview"
                className="size-8 shrink-0 rounded-md object-contain bg-white"
              />
            )}
            <Input
              id="bank-logo"
              type="url"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => onLogoUrlChange(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="website">
          Website <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="website"
            type="url"
            placeholder="https://merchant.com"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
          />
          <Button variant="outline" size="icon" className="shrink-0" asChild>
            <a href={website} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} />
            </a>
          </Button>
        </div>
      </div>

      <CategorySelect value={category} onChange={onCategoryChange} />

      <div className="space-y-2">
        <Label>
          Wero Support Status <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-1">
          <Select
            value={weroSupport}
            onValueChange={(v) => onWeroSupportChange(v as SupportStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {baseSupportStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <option.icon className={option.iconColor} size={16} />
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about this merchant..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Notes are being displayed in a popover on the merchant card
        </p>
      </div>

      {isEdit && submitType === "contribution" && (
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
  const [submitType, setSubmitType] = useState<"contribution" | "admin">(
    "contribution",
  );
  const [existingMerchant, setExistingMerchant] = useState<Merchant | null>(
    null,
  );
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<Merchant[]>([]);
  const { onOpenEditorDialog, openEditorDialog } = useEditor();

  // Form state
  const [name, setName] = useState("");
  const [aliases, setAliases] = useState<string[]>([]);
  const [aliasInput, setAliasInput] = useState("");
  const [logoUrl, setLogoUrl] = useState<Merchant["logoUrl"]>("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState<Merchant["category"]>("other");
  const [weroSupport, setWeroSupport] = useState<SupportStatus>("unknown");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");

  const resetForm = () => {
    setSubmitError("");
    setName("");
    setAliases([]);
    setAliasInput("");
    setLogoUrl("");
    setWebsite("");
    setCategory("other");
    setWeroSupport("unknown");
    setNotes("");
    setReason("");
  };

  useEffect(() => {
    onOpenEditorDialog((options) => {
      if (options.type === "merchant") {
        resetForm();
        setOpen(true);
        setAction(options.action);
        setSubmitType(options.submit);
        if (options.action === "edit" || options.action === "delete") {
          setExistingMerchant(options.entity);
        } else {
          setExistingMerchant(null);
        }
      }
    });
  }, [onOpenEditorDialog]);

  // Populate form with existing data for edit/delete
  useEffect(() => {
    if (open && existingMerchant) {
      setName(existingMerchant.name);
      setAliases(existingMerchant.aliases);
      setLogoUrl(existingMerchant.logoUrl);
      setWebsite(existingMerchant.website);
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
    if (action === "delete" && submitType === "contribution") {
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
    if (action === "edit" && submitType === "contribution" && !reason.trim()) {
      errors.push("Reason for changes");
    }

    if (errors.length > 0) {
      return { valid: false, message: `Missing: ${errors.join(", ")}` };
    }

    return { valid: true, message: "" };
  };

  const validation = getSubmitValidation();

  const handleSubmit = async (overrideDuplicateCheck = false) => {
    if (!validation.valid) return;
    if (action === "add" && !overrideDuplicateCheck) {
      const duplicates = await findDuplicateMerchants({ website });
      if (duplicates.length > 0) {
        setDuplicateMatches(duplicates);
        return;
      }
    }
    setIsSubmitting(true);
    try {
      if (action === "add") {
        const newMerchant: Omit<NewMerchant, "id"> = {
          name,
          aliases,
          website,
          logoUrl: `https://www.google.com/s2/favicons?domain=${new URL(website).hostname}&sz=64`,
          logoChecksum: "WILL BE CALCULATED ON REVIEW",
          category,
          weroSupport,
          notes,
        };
        if (submitType === "contribution") {
          const { success, message } = await createMerchantContribution({
            action,
            data: newMerchant,
          });
          if (!success) {
            setSubmitError(message);
          } else {
            setOpen(false);
            toast.success("Merchant contribution submitted successfully!");
          }
        } else {
          await createMerchant(newMerchant);
          setOpen(false);
          toast.success("Merchant created successfully!");
        }
      } else {
        const updatedMerchant: Omit<Merchant, "createdAt" | "updatedAt"> = {
          id: existingMerchant!.id,
          name,
          aliases,
          website,
          logoUrl: logoUrl,
          logoChecksum:
            existingMerchant!.logoUrl === logoUrl
              ? existingMerchant!.logoChecksum
              : "WILL BE CALCULATED ON REVIEW",
          category,
          weroSupport,
          notes,
        };
        if (submitType === "contribution") {
          const { success, message } = await createMerchantContribution({
            action,
            data: updatedMerchant,
            reason,
          });
          if (!success) {
            setSubmitError(message);
          } else {
            setOpen(false);
            toast.success(
              `Merchant ${action === "edit" ? "edit" : "deletion"} contribution submitted successfully!`,
            );
          }
        } else {
          if (action === "delete") {
            await deleteMerchant(existingMerchant!.id);
            toast.success("Merchant deleted successfully!");
          } else {
            await updateMerchant(updatedMerchant);
            toast.success("Merchant updated successfully!");
          }
          setOpen(false);
        }
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = (submitType: "contribution" | "admin") => {
    if (action === "delete") {
      if (submitType === "contribution") {
        return `Suggest Deletion`;
      } else {
        return `Delete Merchant`;
      }
    } else if (action === "edit") {
      if (submitType === "contribution") {
        return `Suggest Edit`;
      } else {
        return `Edit Merchant`;
      }
    } else {
      if (submitType === "admin") {
        return "Add New Merchant";
      } else {
        return "Suggest New Merchant";
      }
    }
  };

  const getDescription = (submitType: "contribution" | "admin") => {
    if (action === "delete") {
      if (submitType === "contribution") {
        return `Request to remove "${existingMerchant?.name}" from the tracker.`;
      } else {
        return `Remove "${existingMerchant?.name}" from the tracker.`;
      }
    } else if (action === "edit") {
      if (submitType === "contribution") {
        return `Suggest changes to "${existingMerchant?.name}".`;
      } else {
        return `Edit "${existingMerchant?.name}".`;
      }
    } else {
      if (submitType === "admin") {
        return "Add a new merchant to the tracker.";
      } else {
        return "Submit a new merchant to be added to the tracker. Your submission will be reviewed before being published.";
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden grid-rows-[auto_1fr_auto]">
        <DialogHeader>
          <DialogTitle>{getTitle(submitType)}</DialogTitle>
          <DialogDescription>{getDescription(submitType)}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto **:max-w-[calc(100vw-4rem)] sm:**:max-w-120">
          <div className="space-y-4 py-2">
            {action === "delete" ? (
              <DeleteModeContent
                merchantName={existingMerchant?.name || ""}
                submitType={submitType}
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
                logoUrl={logoUrl}
                onLogoUrlChange={setLogoUrl}
                website={website}
                onWebsiteChange={setWebsite}
                category={category}
                onCategoryChange={setCategory}
                weroSupport={weroSupport}
                onWeroSupportChange={setWeroSupport}
                notes={notes}
                onNotesChange={setNotes}
                isEdit={action === "edit"}
                submitType={submitType}
                reason={reason}
                onReasonChange={setReason}
              />
            )}
          </div>
        </div>

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
              onClick={() => handleSubmit(false)}
              disabled={!validation.valid || isSubmitting}
              variant={action === "delete" ? "destructive" : "default"}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {action === "delete"
                ? submitType === "contribution"
                  ? "Submit Deletion Request"
                  : "Delete"
                : submitType === "contribution"
                  ? "Submit for Review"
                  : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <AlertDialog
        open={duplicateMatches.length > 0}
        onOpenChange={(o) => {
          if (!o) setDuplicateMatches([]);
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" size={18} />
              Possible duplicate
            </AlertDialogTitle>
            <AlertDialogDescription>
              A merchant with the same domain already exists. Please consider
              editing the existing entry instead of creating a duplicate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ItemGroup>
            {duplicateMatches.map((m) => (
              <Item key={m.id} variant="outline" size="sm">
                <ItemMedia variant="image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.logoUrl} alt="" className="bg-white" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{m.name}</ItemTitle>
                  <ItemDescription>{m.website}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDuplicateMatches([]);
                      setOpen(false);
                      openEditorDialog({
                        type: "merchant",
                        action: "edit",
                        entity: m,
                        submit: submitType,
                      });
                    }}
                  >
                    Edit
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDuplicateMatches([]);
                handleSubmit(true);
              }}
            >
              Submit anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
