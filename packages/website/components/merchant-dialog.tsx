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
import { MerchantContribution } from "@/lib/contribution-types";
import { SupportStatus, MerchantCategory } from "@/lib/schema";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { merchantCategoryOptions } from "@/lib/constants";
import {
  AliasInput,
  CountrySelector,
  SupportStatusSelect,
} from "./dialog-shared";

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
  value: MerchantCategory;
  onChange: (value: MerchantCategory) => void;
}

function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="category">
        Category <span className="text-destructive">*</span>
      </Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as MerchantCategory)}
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
  category: MerchantCategory;
  onCategoryChange: (value: MerchantCategory) => void;
  countries: string[];
  onToggleCountry: (country: string) => void;
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
  countries,
  onToggleCountry,
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

      <CountrySelector
        countries={countries}
        onToggleCountry={onToggleCountry}
      />

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
  const {
    isDialogOpen,
    dialogType,
    dialogAction,
    existingMerchant,
    closeDialog,
    submitContribution,
  } = useContribution();

  const isOpen = isDialogOpen && dialogType === "merchant";
  const isEdit = dialogAction === "edit";
  const isDelete = dialogAction === "delete";

  // Form state
  const [name, setName] = useState("");
  const [aliases, setAliases] = useState<string[]>([]);
  const [aliasInput, setAliasInput] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [category, setCategory] = useState<MerchantCategory>("other");
  const [countries, setCountries] = useState<string[]>([]);
  const [weroSupport, setWeroSupport] = useState<SupportStatus>("unknown");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");

  const resetForm = () => {
    setName("");
    setAliases([]);
    setAliasInput("");
    setWebsite("");
    setLogoUrl("");
    setCategory("other");
    setCountries([]);
    setWeroSupport("unknown");
    setNotes("");
    setReason("");
  };

  // Populate form with existing data for edit/delete
  useEffect(() => {
    if (isOpen && existingMerchant && (isEdit || isDelete)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Form initialization in dialog is a valid pattern
      setName(existingMerchant.name);
      setAliases(existingMerchant.aliases);
      setWebsite(existingMerchant.website);
      setLogoUrl(existingMerchant.logoUrl);
      setCategory(existingMerchant.category);
      setCountries(existingMerchant.countries);
      setWeroSupport(existingMerchant.weroSupport);
      setNotes(existingMerchant.notes || "");
    } else if (isOpen && !isEdit && !isDelete) {
      resetForm();
    }
  }, [isOpen, existingMerchant, isEdit, isDelete]);

  const handleAddAlias = () => {
    if (aliasInput.trim() && !aliases.includes(aliasInput.trim())) {
      setAliases([...aliases, aliasInput.trim()]);
      setAliasInput("");
    }
  };

  const handleRemoveAlias = (alias: string) => {
    setAliases(aliases.filter((a) => a !== alias));
  };

  const handleToggleCountry = (country: string) => {
    if (countries.includes(country)) {
      setCountries(countries.filter((c) => c !== country));
    } else {
      setCountries([...countries, country]);
    }
  };

  const handleSubmit = async () => {
    const contribution: MerchantContribution = {
      id: crypto.randomUUID(),
      type: "merchant",
      action: dialogAction!,
      reason: reason,
      data: {
        id: existingMerchant?.id,
        name,
        aliases,
        website,
        logoUrl,
        category,
        countries,
        weroSupport,
        notes: notes,
      },
    };

    submitContribution(contribution);
    resetForm();
    closeDialog();
  };

  const handleClose = () => {
    resetForm();
    closeDialog();
  };

  const getTitle = () => {
    if (isDelete) return "Suggest Deletion";
    if (isEdit) return "Suggest Edit";
    return "Add New Merchant";
  };

  const getDescription = () => {
    if (isDelete)
      return `Request to remove "${existingMerchant?.name}" from the tracker.`;
    if (isEdit) return `Suggest changes to "${existingMerchant?.name}".`;
    return "Submit a new merchant to be added to the tracker. Your submission will be reviewed before being published.";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4 -mr-4 **:max-w-[calc(100vw-5rem)] sm:**:max-w-116">
          <div className="space-y-4 py-2">
            {isDelete ? (
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
                countries={countries}
                onToggleCountry={handleToggleCountry}
                weroSupport={weroSupport}
                onWeroSupportChange={setWeroSupport}
                notes={notes}
                onNotesChange={setNotes}
                isEdit={isEdit}
                reason={reason}
                onReasonChange={setReason}
              />
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              (!isDelete &&
                (!name || !website || !logoUrl || countries.length === 0)) ||
              !reason
            }
            variant={isDelete ? "destructive" : "default"}
          >
            {isDelete ? "Submit Deletion Request" : "Submit for Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
