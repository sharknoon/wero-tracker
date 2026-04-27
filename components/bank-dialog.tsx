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
import { useEditor } from "@/lib/editor-context";
import { AlertTriangle, Copy, Loader2, Plus, Trash2 } from "lucide-react";
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
  AliasInput,
  CountrySelector,
  NotesInput,
  SupportStatusSelect,
  WebsiteInput,
} from "./dialog-shared";
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
import { createBankContribution } from "@/actions/contribution-actions";
import { ContributionAction } from "@/db/schema/contributions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Bank, BankingApp, CountryOverride, NewBank } from "@/db/schema/banks";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createBank,
  deleteBank,
  findDuplicateBanks,
  updateBank,
} from "@/actions/bank-actions";
import { CountryFlag } from "./country-flag";

function createEmptyApp(supportedCountries: string[]): BankingApp {
  return {
    id: crypto.randomUUID(),
    name: "",
    iconUrl: "",
    iconChecksum: "WILL BE CALCULATED ON REVIEW",
    universalLink: { default: "" },
    weroSupport: { default: "unknown" },
    supportedCountries,
  };
}

function stripCountryFromOverride<T>(
  override: CountryOverride<T>,
  country: string,
): CountryOverride<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [country]: _, ...rest } = override;
  return rest as CountryOverride<T>;
}

// ============================================================================
// Delete Mode Content Component
// ============================================================================

interface DeleteModeContentProps {
  bankName: string;
  submitType: "contribution" | "admin";
  reason: string;
  onReasonChange: (value: string) => void;
}

function DeleteModeContent({
  bankName,
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
            <span className="font-bold">{bankName}</span> from the tracker.
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
            placeholder="Why should this bank be removed?"
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
// Banking App Form Component
// ============================================================================

interface BankingAppFormProps {
  app: BankingApp;
  index: number;
  availableCountries: string[];
  onChange: (index: number, app: BankingApp) => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
}

function BankingAppForm({
  app,
  index,
  availableCountries,
  onChange,
  onDuplicate,
  onRemove,
}: BankingAppFormProps) {
  const handleToggleCountry = (country: string) => {
    const current = app.supportedCountries;
    const isRemoving = current.includes(country);
    const updated = isRemoving
      ? current.filter((c) => c !== country)
      : [...current, country];
    if (isRemoving) {
      onChange(index, {
        ...app,
        supportedCountries: updated,
        universalLink: stripCountryFromOverride(app.universalLink, country),
        weroSupport: stripCountryFromOverride(app.weroSupport, country),
      });
    } else {
      onChange(index, { ...app, supportedCountries: updated });
    }
  };

  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  const availableCountryOptions = availableCountries
    .map((country) => ({
      value: country,
      label: regionNames.of(country) ?? country,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <Card className="bg-secondary/30 m-px">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            Banking App {index + 1}
            {app.name ? `: ${app.name}` : ""}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              title="Duplicate App"
              onClick={() => onDuplicate(index)}
            >
              <Copy className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              title="Remove App"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
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
          <div className="flex items-center gap-2">
            {app.iconUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={app.iconUrl}
                alt="Icon preview"
                className="size-8 shrink-0 rounded-md object-contain bg-white"
              />
            )}
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
          <p className="text-xs text-muted-foreground">
            The icon URL can be copied from the Google Play Store website.
          </p>
        </div>

        <WebsiteInput
          website={app.universalLink}
          onWebsiteChange={(v) => onChange(index, { ...app, universalLink: v })}
          countries={app.supportedCountries}
          label="Universal Link"
          id={`app-link-${index}`}
          placeholder="https://example.com/app"
          required
        />
        <p className="text-xs text-muted-foreground">
          This should be the bank&apos;s website that links to both the Google
          Play Store and the App Store.
        </p>

        <div className="grid sm:grid-cols-2 gap-2">
          <SupportStatusSelect
            supportStatus={app.weroSupport}
            onSupportStatusChange={(v) =>
              onChange(index, { ...app, weroSupport: v })
            }
            countries={app.supportedCountries}
            label="Wero Support Status"
            includePartnerSystems
            required
          />

          <div className="space-y-2">
            <Label>
              Supported Countries <span className="text-destructive">*</span>
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal"
                >
                  {app.supportedCountries.length > 0 ? (
                    <span className="flex items-center gap-1 truncate">
                      {app.supportedCountries
                        .sort((a, b) =>
                          regionNames.of(a)!.localeCompare(regionNames.of(b)!),
                        )
                        .slice(0, 3)
                        .map((c) => (
                          <CountryFlag key={c} countryCode={c} size="sm" />
                        ))}
                      {app.supportedCountries.length > 3 && (
                        <span className="ml-1 text-muted-foreground">
                          +{app.supportedCountries.length - 3} more
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Select countries...
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="max-h-60 overflow-y-auto"
              >
                {availableCountryOptions.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={app.supportedCountries.includes(option.value)}
                    onCheckedChange={() => handleToggleCountry(option.value)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <CountryFlag countryCode={option.value} size="sm" />
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
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
  logoUrl: string;
  onLogoUrlChange: (value: string) => void;
  website: Bank["website"];
  onWebsiteChange: (value: Bank["website"]) => void;
  countries: string[];
  onToggleCountry: (country: string) => void;
  p2pPaymentsSupport: Bank["p2pPaymentsSupport"];
  onP2pPaymentsSupportChange: (value: Bank["p2pPaymentsSupport"]) => void;
  eCommercePaymentsSupport: Bank["eCommercePaymentsSupport"];
  onECommercePaymentsSupportChange: (
    value: Bank["eCommercePaymentsSupport"],
  ) => void;
  posPaymentsSupport: Bank["posPaymentsSupport"];
  onPosPaymentsSupportChange: (value: Bank["posPaymentsSupport"]) => void;
  standaloneAppSupport: Bank["standaloneAppSupport"];
  onStandaloneAppSupportChange: (value: Bank["standaloneAppSupport"]) => void;
  notes: Bank["notes"];
  onNotesChange: (value: Bank["notes"]) => void;
  apps: Bank["bankingApps"];
  onAppsChange: (apps: Bank["bankingApps"]) => void;
  isEdit: boolean;
  submitType: "contribution" | "admin";
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
  logoUrl,
  onLogoUrlChange,
  website,
  onWebsiteChange,
  countries,
  onToggleCountry,
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
  isEdit,
  submitType,
  reason,
  onReasonChange,
}: BankFormContentProps) {
  const handleAppChange = (index: number, app: Bank["bankingApps"][number]) => {
    const newApps = [...apps];
    newApps[index] = app;
    onAppsChange(newApps);
  };

  const handleDuplicateApp = (index: number) => {
    const source = apps[index];
    const duplicate = { ...source, id: crypto.randomUUID() };
    const newApps = [...apps];
    newApps.splice(index + 1, 0, duplicate);
    onAppsChange(newApps);
  };

  const handleRemoveApp = (index: number) => {
    onAppsChange(apps.filter((_, i) => i !== index));
  };

  const handleAddApp = () => {
    onAppsChange([...apps, createEmptyApp(countries)]);
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
        <p className="text-xs text-muted-foreground">
          Use the brand name, not the company name.
        </p>
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
            Icon URL <span className="text-destructive">*</span>
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
              placeholder="https://example.com/icon.png"
              value={logoUrl}
              onChange={(e) => onLogoUrlChange(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      <WebsiteInput
        website={website}
        onWebsiteChange={onWebsiteChange}
        countries={countries}
        placeholder="https://bank.com"
        required
      />

      <CountrySelector
        countries={countries}
        onToggleCountry={onToggleCountry}
        required
      />

      <Separator />

      <div className="grid sm:grid-cols-2 gap-4">
        <SupportStatusSelect
          supportStatus={p2pPaymentsSupport}
          onSupportStatusChange={onP2pPaymentsSupportChange}
          countries={countries}
          label="P2P Payments Support"
          includePartnerSystems
          required
        />

        <SupportStatusSelect
          supportStatus={eCommercePaymentsSupport}
          onSupportStatusChange={onECommercePaymentsSupportChange}
          countries={countries}
          label="eCommerce Payments Support"
          includePartnerSystems
          required
        />

        <SupportStatusSelect
          supportStatus={posPaymentsSupport}
          onSupportStatusChange={onPosPaymentsSupportChange}
          countries={countries}
          label="POS Payments Support"
          includePartnerSystems
          required
        />

        <SupportStatusSelect
          supportStatus={standaloneAppSupport}
          onSupportStatusChange={onStandaloneAppSupportChange}
          countries={countries}
          label="Standalone Wero App Support"
          required
        />
      </div>

      <Separator />

      <NotesInput
        notes={notes}
        onNotesChange={onNotesChange}
        countries={countries}
      />

      <Separator />

      {/* Banking Apps Section */}
      <div className="space-y-3!">
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
            If this bank has a banking app, it must be added.
          </p>
        )}
        {apps.map((app, i) => (
          <BankingAppForm
            key={i}
            app={app}
            index={i}
            availableCountries={countries}
            onChange={handleAppChange}
            onDuplicate={handleDuplicateApp}
            onRemove={handleRemoveApp}
          />
        ))}
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

export function BankDialog() {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<ContributionAction>("add");
  const [submitType, setSubmitType] = useState<"contribution" | "admin">(
    "contribution",
  );
  const [existingBank, setExistingBank] = useState<Bank | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<Bank[]>([]);
  const { onOpenEditorDialog, openEditorDialog } = useEditor();

  // Form state
  const [name, setName] = useState<Bank["name"]>("");
  const [aliases, setAliases] = useState<Bank["aliases"]>([]);
  const [aliasInput, setAliasInput] = useState<Bank["aliases"][number]>("");
  const [logoUrl, setLogoUrl] = useState<Bank["logoUrl"]>("");
  const [website, setWebsite] = useState<Bank["website"]>({
    default: "",
  });
  const [countries, setCountries] = useState<Bank["countries"]>([]);
  const [p2pPaymentsSupport, setP2pPaymentsSupport] = useState<
    Bank["p2pPaymentsSupport"]
  >({ default: "unknown" });
  const [eCommercePaymentsSupport, setECommercePaymentsSupport] = useState<
    Bank["eCommercePaymentsSupport"]
  >({ default: "unknown" });
  const [posPaymentsSupport, setPosPaymentsSupport] = useState<
    Bank["posPaymentsSupport"]
  >({ default: "unknown" });
  const [standaloneAppSupport, setStandaloneAppSupport] = useState<
    Bank["standaloneAppSupport"]
  >({ default: "unknown" });
  const [apps, setApps] = useState<Bank["bankingApps"]>([]);
  const [notes, setNotes] = useState<Bank["notes"]>({ default: "" });
  const [reason, setReason] = useState<string>("");

  const resetForm = () => {
    setSubmitError("");
    setName("");
    setAliases([]);
    setAliasInput("");
    setLogoUrl("");
    setWebsite({ default: "" });
    setCountries([]);
    setP2pPaymentsSupport({ default: "unknown" });
    setECommercePaymentsSupport({ default: "unknown" });
    setPosPaymentsSupport({ default: "unknown" });
    setStandaloneAppSupport({ default: "unknown" });
    setNotes({ default: "" });
    setReason("");
    setApps([]);
  };

  useEffect(() => {
    onOpenEditorDialog((options) => {
      if (options.type === "bank") {
        resetForm();
        setOpen(true);
        setAction(options.action);
        setSubmitType(options.submit);
        if (options.action === "edit" || options.action === "delete") {
          setExistingBank(options.entity);
        } else {
          setExistingBank(null);
        }
      }
    });
  }, [onOpenEditorDialog]);

  // Populate form with existing data for edit/delete
  useEffect(() => {
    if (open && existingBank) {
      setName(existingBank.name);
      setAliases(existingBank.aliases);
      setLogoUrl(existingBank.logoUrl);
      setWebsite(existingBank.website);
      setCountries(existingBank.countries);
      setP2pPaymentsSupport(existingBank.p2pPaymentsSupport);
      setECommercePaymentsSupport(existingBank.eCommercePaymentsSupport);
      setPosPaymentsSupport(existingBank.posPaymentsSupport);
      setStandaloneAppSupport(existingBank.standaloneAppSupport);
      setNotes(existingBank.notes);
      setApps(existingBank.bankingApps);
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
    setCountries((prev) => {
      const isRemoving = prev.includes(country);
      if (isRemoving) {
        // Clean up country-specific overrides from all CountryOverride fields
        setWebsite((v) => stripCountryFromOverride(v, country));
        setP2pPaymentsSupport((v) => stripCountryFromOverride(v, country));
        setECommercePaymentsSupport((v) =>
          stripCountryFromOverride(v, country),
        );
        setPosPaymentsSupport((v) => stripCountryFromOverride(v, country));
        setStandaloneAppSupport((v) => stripCountryFromOverride(v, country));
        setNotes((v) => stripCountryFromOverride(v, country));
        // Clean up banking apps: remove country from supportedCountries and their overrides
        setApps((prevApps) =>
          prevApps.map((app) =>
            app.supportedCountries.includes(country)
              ? {
                  ...app,
                  supportedCountries: app.supportedCountries.filter(
                    (c) => c !== country,
                  ),
                  universalLink: stripCountryFromOverride(
                    app.universalLink,
                    country,
                  ),
                  weroSupport: stripCountryFromOverride(
                    app.weroSupport,
                    country,
                  ),
                }
              : app,
          ),
        );
        return prev.filter((c) => c !== country);
      }
      return [...prev, country];
    });
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
    if (!name.trim()) errors.push("Bank name");
    if (
      !Object.values(website).every(
        (url) => url.trim() && isValidUrl(url.trim()),
      )
    ) {
      errors.push("Website");
    }
    if (countries.length === 0) errors.push("Countries");
    if (action === "edit" && submitType === "contribution" && !reason.trim()) {
      errors.push("Reason for changes");
    }

    // Validate apps
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      if (!app.name.trim()) errors.push(`App ${i + 1} name`);
      if (!app.iconUrl.trim() || !isValidUrl(app.iconUrl.trim()))
        errors.push(`App ${i + 1} icon URL`);
      if (
        !Object.values(app.universalLink).every(
          (url) => url.trim() && isValidUrl(url.trim()),
        )
      )
        errors.push(`App ${i + 1} universal link`);
      if (app.supportedCountries.length === 0)
        errors.push(`App ${i + 1} supported countries`);
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
      const duplicates = await findDuplicateBanks({ website });
      if (duplicates.length > 0) {
        setDuplicateMatches(duplicates);
        return;
      }
    }
    setIsSubmitting(true);
    try {
      if (action === "add") {
        const newBank: Omit<NewBank, "id"> = {
          name,
          aliases,
          website,
          logoUrl: `https://www.google.com/s2/favicons?domain=${new URL(website.default).hostname}&sz=64`,
          logoChecksum: "WILL BE CALCULATED ON REVIEW",
          countries,
          p2pPaymentsSupport,
          eCommercePaymentsSupport,
          posPaymentsSupport,
          standaloneAppSupport,
          bankingApps: apps.map((app) => ({
            ...app,
            iconChecksum: "WILL BE CALCULATED ON REVIEW",
          })),
          notes,
        };
        if (submitType === "contribution") {
          const { success, message } = await createBankContribution({
            action,
            data: newBank,
          });
          if (!success) {
            setSubmitError(message);
          } else {
            setOpen(false);
            toast.success("Bank contribution submitted successfully!");
          }
        } else {
          await createBank(newBank);
          setOpen(false);
          toast.success("Bank created successfully!");
        }
      } else {
        const updatedBank: Omit<Bank, "createdAt" | "updatedAt"> = {
          id: existingBank!.id,
          name,
          aliases,
          website,
          logoUrl,
          logoChecksum: existingBank!.logoChecksum,
          countries,
          p2pPaymentsSupport,
          eCommercePaymentsSupport,
          posPaymentsSupport,
          standaloneAppSupport,
          bankingApps: apps.map((app) => ({
            ...app,
            iconChecksum:
              existingBank!.bankingApps.find((a) => a.id === app.id)
                ?.iconChecksum || "WILL BE CALCULATED ON REVIEW",
          })),
          notes,
        };
        if (submitType === "contribution") {
          const { success, message } = await createBankContribution({
            action,
            data: updatedBank,
            reason,
          });
          if (!success) {
            setSubmitError(message);
          } else {
            setOpen(false);
            toast.success(
              `Bank ${action === "edit" ? "edit" : "deletion"} contribution submitted successfully!`,
            );
          }
        } else {
          if (action === "delete") {
            await deleteBank(existingBank!.id);
            toast.success("Bank deleted successfully!");
          } else {
            await updateBank(updatedBank);
            toast.success("Bank updated successfully!");
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
        return `Delete Bank`;
      }
    } else if (action === "edit") {
      if (submitType === "contribution") {
        return `Suggest Edit`;
      } else {
        return `Edit Bank`;
      }
    } else {
      if (submitType === "admin") {
        return "Add New Bank";
      } else {
        return "Suggest New Bank";
      }
    }
  };

  const getDescription = (submitType: "contribution" | "admin") => {
    if (action === "delete") {
      if (submitType === "contribution") {
        return `Request to remove "${existingBank?.name}" from the tracker.`;
      } else {
        return `Remove "${existingBank?.name}" from the tracker.`;
      }
    } else if (action === "edit") {
      if (submitType === "contribution") {
        return `Suggest changes to "${existingBank?.name}".`;
      } else {
        return `Edit "${existingBank?.name}".`;
      }
    } else {
      if (submitType === "admin") {
        return "Add a new bank to the tracker.";
      } else {
        return "Submit a new bank to be added to the tracker. Your submission will be reviewed before being published.";
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden grid-rows-[auto_1fr_auto] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{getTitle(submitType)}</DialogTitle>
          <DialogDescription>{getDescription(submitType)}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto **:max-w-[calc(100vw-4rem)] sm:**:max-w-136">
          <div className="space-y-4 py-2">
            {action === "delete" ? (
              <DeleteModeContent
                bankName={existingBank?.name || ""}
                submitType={submitType}
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
                logoUrl={logoUrl}
                onLogoUrlChange={setLogoUrl}
                website={website}
                onWebsiteChange={setWebsite}
                countries={countries}
                onToggleCountry={handleToggleCountry}
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
              A bank with the same domain already exists. Please consider
              editing the existing entry instead of creating a duplicate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ItemGroup>
            {duplicateMatches.map((b) => (
              <Item key={b.id} variant="outline" size="sm">
                <ItemMedia variant="image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.logoUrl}
                    alt=""
                    className="bg-white p-1 object-contain!"
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{b.name}</ItemTitle>
                  <ItemDescription>{b.website.default}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDuplicateMatches([]);
                      setOpen(false);
                      openEditorDialog({
                        type: "bank",
                        action: "edit",
                        entity: b,
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
