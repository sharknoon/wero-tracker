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
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContribution } from "@/lib/contribution-context";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  AliasInput,
  CountrySelector,
  SupportStatusSelect,
} from "./dialog-shared";
import { isValidUrl } from "@/lib/utils";
import { SupportStatus } from "@/db/schema/support";
import { createBankContribution } from "@/actions/contribution-actions";
import { ContributionAction } from "@/db/schema/contributions";
import { WeroData } from "@/app/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BankEntity = WeroData["banks"][number];

type AppFormData = {
  id?: string;
  name: string;
  bankId: string;
  iconUrl: string;
  universalLink: string;
  supportsDesktop: boolean;
  weroSupport: SupportStatus;
};

function createEmptyApp(bankId: string): AppFormData {
  return {
    name: "",
    bankId,
    iconUrl: "",
    universalLink: "",
    supportsDesktop: false,
    weroSupport: "unknown",
  };
}

// ============================================================================
// Delete Mode Content Component
// ============================================================================

interface DeleteModeContentProps {
  bankName: string;
  reason: string;
  onReasonChange: (value: string) => void;
}

function DeleteModeContent({
  bankName,
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
            <span className="font-bold">{bankName}</span> from the tracker.
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
          placeholder="Why should this bank be removed?"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
}

// ============================================================================
// Banking App Form Component
// ============================================================================

interface BankingAppFormProps {
  app: AppFormData;
  index: number;
  onChange: (index: number, app: AppFormData) => void;
  onRemove: (index: number) => void;
}

function BankingAppForm({
  app,
  index,
  onChange,
  onRemove,
}: BankingAppFormProps) {
  return (
    <Card className="bg-secondary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            Banking App {index + 1}
            {app.name ? `: ${app.name}` : ""}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor={`app-name-${index}`}>
            App Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`app-name-${index}`}
            placeholder="e.g., Sparkasse"
            value={app.name}
            onChange={(e) => onChange(index, { ...app, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`app-icon-${index}`}>
            Icon URL <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`app-icon-${index}`}
            type="url"
            placeholder="https://example.com/icon.png"
            value={app.iconUrl}
            onChange={(e) =>
              onChange(index, { ...app, iconUrl: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`app-link-${index}`}>
            Universal Link <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`app-link-${index}`}
            type="url"
            placeholder="https://example.com/app"
            value={app.universalLink}
            onChange={(e) =>
              onChange(index, { ...app, universalLink: e.target.value })
            }
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id={`app-desktop-${index}`}
            checked={app.supportsDesktop}
            onCheckedChange={(checked) =>
              onChange(index, { ...app, supportsDesktop: checked })
            }
          />
          <Label htmlFor={`app-desktop-${index}`}>Supports Desktop</Label>
        </div>

        <SupportStatusSelect
          label="Wero Support Status"
          value={app.weroSupport}
          onChange={(value) => onChange(index, { ...app, weroSupport: value })}
          required
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Bank Form Content Component
// ============================================================================

interface BankFormContentProps {
  name: string;
  onNameChange: (value: string) => void;
  aliases: string[];
  aliasInput: string;
  onAliasInputChange: (value: string) => void;
  onAddAlias: () => void;
  onRemoveAlias: (alias: string) => void;
  website: string;
  onWebsiteChange: (value: string) => void;
  countries: string[];
  onToggleCountry: (country: string) => void;
  weroSupport: SupportStatus;
  onWeroSupportChange: (value: SupportStatus) => void;
  p2pPaymentsSupport: SupportStatus;
  onP2pPaymentsSupportChange: (value: SupportStatus) => void;
  eCommercePaymentsSupport: SupportStatus;
  onECommercePaymentsSupportChange: (value: SupportStatus) => void;
  posPaymentsSupport: SupportStatus;
  onPosPaymentsSupportChange: (value: SupportStatus) => void;
  standaloneAppSupport: SupportStatus;
  onStandaloneAppSupportChange: (value: SupportStatus) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  apps: AppFormData[];
  onAppsChange: (apps: AppFormData[]) => void;
  bankId: string;
  isEdit: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
}

function BankFormContent({
  name,
  onNameChange,
  aliases,
  aliasInput,
  onAliasInputChange,
  onAddAlias,
  onRemoveAlias,
  website,
  onWebsiteChange,
  countries,
  onToggleCountry,
  weroSupport,
  onWeroSupportChange,
  p2pPaymentsSupport,
  onP2pPaymentsSupportChange,
  eCommercePaymentsSupport,
  onECommercePaymentsSupportChange,
  posPaymentsSupport,
  onPosPaymentsSupportChange,
  standaloneAppSupport,
  onStandaloneAppSupportChange,
  notes,
  onNotesChange,
  apps,
  onAppsChange,
  bankId,
  isEdit,
  reason,
  onReasonChange,
}: BankFormContentProps) {
  const handleAppChange = (index: number, app: AppFormData) => {
    const newApps = [...apps];
    newApps[index] = app;
    onAppsChange(newApps);
  };

  const handleRemoveApp = (index: number) => {
    onAppsChange(apps.filter((_, i) => i !== index));
  };

  const handleAddApp = () => {
    onAppsChange([...apps, createEmptyApp(bankId)]);
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">
          Bank Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Deutsche Bank"
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
          placeholder="https://bank.com"
          value={website}
          onChange={(e) => onWebsiteChange(e.target.value)}
          required
        />
      </div>

      <CountrySelector
        countries={countries}
        onToggleCountry={onToggleCountry}
        required
      />

      <Separator />

      <SupportStatusSelect
        label="Wero Support Status"
        value={weroSupport}
        onChange={onWeroSupportChange}
        required
      />

      <SupportStatusSelect
        label="P2P Payments Support"
        value={p2pPaymentsSupport}
        onChange={onP2pPaymentsSupportChange}
        required
      />

      <SupportStatusSelect
        label="eCommerce Payments Support"
        value={eCommercePaymentsSupport}
        onChange={onECommercePaymentsSupportChange}
        required
      />

      <SupportStatusSelect
        label="POS Payments Support"
        value={posPaymentsSupport}
        onChange={onPosPaymentsSupportChange}
        required
      />

      <SupportStatusSelect
        label="Standalone App Support"
        value={standaloneAppSupport}
        onChange={onStandaloneAppSupportChange}
        required
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about this bank..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Notes are being displayed in a tooltip on the bank card
        </p>
      </div>

      <Separator />

      {/* Banking Apps Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Banking Apps</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddApp}
          >
            <Plus className="size-3.5 mr-1" />
            Add App
          </Button>
        </div>
        {apps.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No banking apps added yet. Click &quot;Add App&quot; to add one.
          </p>
        )}
        {apps.map((app, i) => (
          <BankingAppForm
            key={i}
            app={app}
            index={i}
            onChange={handleAppChange}
            onRemove={handleRemoveApp}
          />
        ))}
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

export function BankDialog() {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<ContributionAction>("add");
  const [existingBank, setExistingBank] = useState<BankEntity | null>(null);
  const [submitError, setSubmitError] = useState("");
  const { onOpenContributionDialog } = useContribution();

  // Form state
  const [name, setName] = useState("");
  const [aliases, setAliases] = useState<string[]>([]);
  const [aliasInput, setAliasInput] = useState("");
  const [website, setWebsite] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [weroSupport, setWeroSupport] = useState<SupportStatus>("unknown");
  const [p2pPaymentsSupport, setP2pPaymentsSupport] =
    useState<SupportStatus>("unknown");
  const [eCommercePaymentsSupport, setECommercePaymentsSupport] =
    useState<SupportStatus>("unknown");
  const [posPaymentsSupport, setPosPaymentsSupport] =
    useState<SupportStatus>("unknown");
  const [standaloneAppSupport, setStandaloneAppSupport] =
    useState<SupportStatus>("unknown");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [apps, setApps] = useState<AppFormData[]>([]);

  const resetForm = () => {
    setSubmitError("");
    setName("");
    setAliases([]);
    setAliasInput("");
    setWebsite("");
    setCountries([]);
    setWeroSupport("unknown");
    setP2pPaymentsSupport("unknown");
    setECommercePaymentsSupport("unknown");
    setPosPaymentsSupport("unknown");
    setStandaloneAppSupport("unknown");
    setNotes("");
    setReason("");
    setApps([]);
  };

  useEffect(() => {
    onOpenContributionDialog((options) => {
      if (options.type === "bank") {
        setOpen(true);
        setAction(options.action);
        if (options.action === "edit" || options.action === "delete") {
          setExistingBank(options.entity);
        } else {
          setExistingBank(null);
          resetForm();
        }
      }
    });
  }, [onOpenContributionDialog]);

  // Populate form with existing data for edit/delete
  useEffect(() => {
    if (open && existingBank) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Form initialization in dialog is a valid pattern
      setName(existingBank.name);
      setAliases(existingBank.aliases);
      setWebsite(existingBank.website);
      setCountries(existingBank.countries);
      setWeroSupport(existingBank.weroSupport);
      setP2pPaymentsSupport(existingBank.p2pPaymentsSupport);
      setECommercePaymentsSupport(existingBank.eCommercePaymentsSupport);
      setPosPaymentsSupport(existingBank.posPaymentsSupport);
      setStandaloneAppSupport(existingBank.standaloneAppSupport);
      setNotes(existingBank.notes || "");
      setApps(
        existingBank.bankingApps.map((app) => ({
          id: app.id,
          name: app.name,
          bankId: app.bankId,
          iconUrl: app.iconUrl,
          universalLink: app.universalLink,
          supportsDesktop: app.supportsDesktop,
          weroSupport: app.weroSupport,
        })),
      );
    }
  }, [open, existingBank, action]);

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
    setCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country],
    );
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
    if (!name.trim()) errors.push("Bank name");
    if (!website.trim() || !isValidUrl(website.trim())) errors.push("Website");
    if (countries.length === 0) errors.push("Countries");
    if (action === "edit" && !reason.trim()) errors.push("Reason for changes");

    // Validate apps
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      if (!app.name.trim()) errors.push(`App ${i + 1} name`);
      if (!app.iconUrl.trim() || !isValidUrl(app.iconUrl.trim()))
        errors.push(`App ${i + 1} icon URL`);
      if (!app.universalLink.trim() || !isValidUrl(app.universalLink.trim()))
        errors.push(`App ${i + 1} universal link`);
    }

    if (errors.length > 0) {
      return { valid: false, message: `Missing: ${errors.join(", ")}` };
    }

    return { valid: true, message: "" };
  };

  const validation = getSubmitValidation();

  // Use a stable bankId for new apps — empty string for "add", actual id for edit
  const bankId = existingBank?.id ?? "";

  const handleSubmit = async () => {
    if (!validation.valid) return;

    if (action === "add") {
      const { success, message } = await createBankContribution({
        action,
        data: {
          bank: {
            name,
            aliases,
            website,
            logoUrl: `https://www.google.com/s2/favicons?domain=${new URL(website).hostname}&sz=64`,
            countries,
            weroSupport,
            p2pPaymentsSupport,
            eCommercePaymentsSupport,
            posPaymentsSupport,
            standaloneAppSupport,
            notes,
          },
          apps: apps.map((app) => ({
            name: app.name,
            bankId: app.bankId,
            iconUrl: app.iconUrl,
            universalLink: app.universalLink,
            supportsDesktop: app.supportsDesktop,
            weroSupport: app.weroSupport,
          })),
        },
      });
      if (!success) {
        setSubmitError(message);
      } else {
        setOpen(false);
      }
    } else {
      const { success, message } = await createBankContribution({
        action,
        data: {
          bank: {
            id: existingBank!.id,
            name,
            aliases,
            website,
            logoUrl: existingBank!.logoUrl,
            countries,
            weroSupport,
            p2pPaymentsSupport,
            eCommercePaymentsSupport,
            posPaymentsSupport,
            standaloneAppSupport,
            notes,
          },
          apps: apps.map((app) => ({
            id: app.id!,
            name: app.name,
            bankId: existingBank!.id,
            iconUrl: app.iconUrl,
            universalLink: app.universalLink,
            supportsDesktop: app.supportsDesktop,
            weroSupport: app.weroSupport,
          })),
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
    return "Add New Bank";
  };

  const getDescription = () => {
    if (action === "delete")
      return `Request to remove "${existingBank?.name}" from the tracker.`;
    if (action === "edit") return `Suggest changes to "${existingBank?.name}".`;
    return "Submit a new bank to be added to the tracker. Your submission will be reviewed before being published.";
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
                bankName={existingBank?.name || ""}
                reason={reason}
                onReasonChange={setReason}
              />
            ) : (
              <BankFormContent
                name={name}
                onNameChange={setName}
                aliases={aliases}
                aliasInput={aliasInput}
                onAliasInputChange={setAliasInput}
                onAddAlias={handleAddAlias}
                onRemoveAlias={handleRemoveAlias}
                website={website}
                onWebsiteChange={setWebsite}
                countries={countries}
                onToggleCountry={handleToggleCountry}
                weroSupport={weroSupport}
                onWeroSupportChange={setWeroSupport}
                p2pPaymentsSupport={p2pPaymentsSupport}
                onP2pPaymentsSupportChange={setP2pPaymentsSupport}
                eCommercePaymentsSupport={eCommercePaymentsSupport}
                onECommercePaymentsSupportChange={setECommercePaymentsSupport}
                posPaymentsSupport={posPaymentsSupport}
                onPosPaymentsSupportChange={setPosPaymentsSupport}
                standaloneAppSupport={standaloneAppSupport}
                onStandaloneAppSupportChange={setStandaloneAppSupport}
                notes={notes}
                onNotesChange={setNotes}
                apps={apps}
                onAppsChange={setApps}
                bankId={bankId}
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
