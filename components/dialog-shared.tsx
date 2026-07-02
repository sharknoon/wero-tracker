"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SupportStatus } from "@/db/schema/support";
import { ChevronRight, ExternalLink, Plus, X } from "lucide-react";
import { CountryFlag } from "./country-flag";
import {
  baseSupportStatusOptions,
  countries as allCountries,
  getStatusOptionsForCountry,
} from "@/lib/constants";
import { Bank, CountryOverride } from "@/db/schema/banks";
import { baseStatus } from "@/lib/status-helper";
import { useState } from "react";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

// ============================================================================
// Override <-> Per-country helpers
// ============================================================================

/** Resolve a CountryOverride into a per-country map (using the default for
 *  countries that don't have an explicit override). */
function expandOverride<T>(
  value: CountryOverride<T>,
  countries: string[],
): Record<string, T> {
  const result: Record<string, T> = {};
  for (const c of countries) {
    result[c] = c in value ? (value[c] as T) : value.default;
  }
  return result;
}

/** Collapse a per-country map back into a CountryOverride: the most common
 *  value becomes `default`, and the remaining countries become overrides.
 *  Ties are broken by preferring the previous default. */
function collapseOverride<T>(
  perCountry: Record<string, T>,
  countries: string[],
  previousDefault: T,
  equals: (a: T, b: T) => boolean = (a, b) => a === b,
): CountryOverride<T> {
  if (countries.length === 0) {
    return { default: previousDefault };
  }

  const groups: { value: T; count: number }[] = [];
  for (const c of countries) {
    const v = perCountry[c];
    const g = groups.find((g) => equals(g.value, v));
    if (g) g.count++;
    else groups.push({ value: v, count: 1 });
  }
  groups.sort((a, b) => b.count - a.count);
  const topCount = groups[0].count;
  const tied = groups.filter((g) => g.count === topCount);
  // Prefer the previous default if it is still among the most-common values,
  // to avoid the default flipping unnecessarily as the user edits.
  const newDefault =
    tied.find((g) => equals(g.value, previousDefault))?.value ?? tied[0].value;

  const result: CountryOverride<T> = { default: newDefault };
  for (const c of countries) {
    if (!equals(perCountry[c], newDefault)) {
      result[c] = perCountry[c];
    }
  }
  return result;
}

/** Sort a list of country codes by their localized display name. */
function sortCountries(countries: string[]): string[] {
  return [...countries].sort((a, b) =>
    (regionNames.of(a) ?? a).localeCompare(regionNames.of(b) ?? b),
  );
}

function CountryRowLabel({ country }: { country: string }) {
  return (
    <div className="flex items-center gap-1.5 w-24 shrink-0 text-sm text-muted-foreground">
      <CountryFlag countryCode={country} size="sm" />
      <span className="truncate">{regionNames.of(country) ?? country}</span>
    </div>
  );
}

/** Count how many of `countries` have a value that differs from the default. */
function countOverrides<T>(
  value: CountryOverride<T>,
  countries: string[],
  equals: (a: T, b: T) => boolean = (a, b) => a === b,
): number {
  let n = 0;
  for (const c of countries) {
    if (c in value && !equals(value[c] as T, value.default)) n++;
  }
  return n;
}

// ============================================================================
// Per-Country Dialog
// ============================================================================

/** A dialog that hosts a per-country list of inputs. The trigger renders
 *  whatever summary the caller provides. */
function PerCountryDialog({
  label,
  trigger,
  children,
}: {
  label: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className="w-full text-left"
      >
        {trigger}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden grid-rows-[auto_1fr_auto] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              Set a value for each country. The most common value is used as the
              default; others are stored as overrides automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto">
            <div className="space-y-2 py-2">{children}</div>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OverrideBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="shrink-0 rounded-sm bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
      +{count} customized
    </span>
  );
}

function TriggerSurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs hover:bg-accent transition-colors">
      {children}
      <ChevronRight
        size={14}
        className="ml-auto shrink-0 text-muted-foreground"
      />
    </div>
  );
}

// ============================================================================
// Website Input Component
// ============================================================================

export interface WebsiteInputProps {
  website: Bank["website"];
  onWebsiteChange: (value: Bank["website"]) => void;
  countries: string[];
  label?: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
}

export function WebsiteInput({
  website,
  onWebsiteChange,
  countries,
  label = "Website",
  id = "website",
  placeholder = "https://example.com",
  required,
}: WebsiteInputProps) {
  const setForCountry = (country: string, value: string) => {
    const expanded = expandOverride(website, countries);
    expanded[country] = value;
    onWebsiteChange(collapseOverride(expanded, countries, website.default));
  };

  const renderUrlInput = (
    inputId: string,
    value: string,
    onChange: (v: string) => void,
  ) => (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <Input
        id={inputId}
        type="url"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button
        variant="outline"
        size="icon"
        className="shrink-0"
        asChild
        disabled={!value}
      >
        <a
          href={value || "#"}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={value ? 0 : -1}
        >
          <ExternalLink size={14} />
        </a>
      </Button>
    </div>
  );

  const overrideCount = countOverrides(website, countries);

  const list = (
    <div className="space-y-2">
      {sortCountries(countries).map((c) => (
        <div key={c} className="flex items-center gap-2">
          <CountryRowLabel country={c} />
          {renderUrlInput(`${id}-${c}`, website[c] ?? website.default, (v) =>
            setForCountry(c, v),
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {countries.length === 0 &&
        renderUrlInput(id, website.default, (v) =>
          onWebsiteChange({ ...website, default: v }),
        )}
      {countries.length === 1 &&
        renderUrlInput(
          `${id}-${countries[0]}`,
          website[countries[0]] ?? website.default,
          (v) => setForCountry(countries[0], v),
        )}
      {countries.length >= 2 && (
        <PerCountryDialog
          label={label}
          trigger={
            <TriggerSurface>
              <span className="truncate text-muted-foreground">
                {website.default || <span className="italic">Not set</span>}
              </span>
              <OverrideBadge count={overrideCount} />
            </TriggerSurface>
          }
        >
          {list}
        </PerCountryDialog>
      )}
    </div>
  );
}

// ============================================================================
// Alias Input Component
// ============================================================================

export interface AliasInputProps {
  aliases: string[];
  aliasInput: string;
  onAliasInputChange: (value: string) => void;
  onAddAlias: () => void;
  onRemoveAlias: (alias: string) => void;
  placeholder?: string;
}

export function AliasInput({
  aliases,
  aliasInput,
  onAliasInputChange,
  onAddAlias,
  onRemoveAlias,
  placeholder = "Add alias",
}: AliasInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="aliases">Aliases</Label>
      <div className="flex gap-2">
        <Input
          id="aliases"
          placeholder={placeholder}
          value={aliasInput}
          onChange={(e) => onAliasInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddAlias();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onAddAlias}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {aliases.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {aliases.map((alias) => (
            <span
              key={alias}
              className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
            >
              {alias}
              <button
                type="button"
                onClick={() => onRemoveAlias(alias)}
                className="hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Country Selector Component
// ============================================================================

export interface CountrySelectorProps {
  countries: string[];
  onToggleCountry: (country: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export function CountrySelector({
  countries,
  onToggleCountry,
  required = true,
  disabled,
}: CountrySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>
        Countries {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
        {allCountries.map((country) => (
          <button
            key={country}
            type="button"
            onClick={() => onToggleCountry(country)}
            disabled={disabled}
            className={`flex items-center gap-2 px-2 py-1 text-sm rounded-md transition-colors ${
              countries.includes(country)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <CountryFlag countryCode={country} size="sm" />
            {regionNames.of(country)}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Selected: {countries.join(", ") || "None"}
      </p>
    </div>
  );
}

// ============================================================================
// Support Status Select Component
// ============================================================================

export interface SupportStatusSelectProps {
  supportStatus: CountryOverride<SupportStatus>;
  onSupportStatusChange: (value: CountryOverride<SupportStatus>) => void;
  countries: string[];
  label: string;
  includePartnerSystems?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export function SupportStatusSelect({
  supportStatus,
  onSupportStatusChange,
  countries,
  label,
  includePartnerSystems,
  disabled,
  required,
}: SupportStatusSelectProps) {
  const setForCountry = (country: string, value: SupportStatus) => {
    const expanded = expandOverride(supportStatus, countries);
    expanded[country] = value;
    onSupportStatusChange(
      collapseOverride(expanded, countries, supportStatus.default),
    );
  };

  const renderSelect = (
    value: SupportStatus,
    onChange: (v: SupportStatus) => void,
    country: string | undefined,
  ) => {
    const options = getStatusOptionsForCountry(
      includePartnerSystems ? country : undefined,
    );
    return (
      <Select
        value={value}
        onValueChange={(v) => onChange(v as SupportStatus)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <option.icon className={option.iconColor} size={16} />
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const overrideCount = countOverrides(supportStatus, countries);
  const defaultBase = baseStatus(supportStatus.default);
  const defaultOption = baseSupportStatusOptions.find(
    (o) => o.value === defaultBase,
  );

  const list = (
    <div className="space-y-2">
      {sortCountries(countries).map((c) => (
        <div key={c} className="flex items-center gap-2">
          <CountryRowLabel country={c} />
          <div className="flex-1 min-w-0">
            {renderSelect(
              supportStatus[c] ?? supportStatus.default,
              (v) => setForCountry(c, v),
              c,
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {countries.length === 0 &&
        renderSelect(
          supportStatus.default,
          (v) => onSupportStatusChange({ ...supportStatus, default: v }),
          undefined,
        )}
      {countries.length === 1 &&
        renderSelect(
          supportStatus[countries[0]] ?? supportStatus.default,
          (v) => setForCountry(countries[0], v),
          countries[0],
        )}
      {countries.length >= 2 && (
        <PerCountryDialog
          label={label}
          trigger={
            <TriggerSurface>
              {defaultOption && (
                <defaultOption.icon
                  className={defaultOption.iconColor}
                  size={16}
                />
              )}
              <span className="truncate">
                {defaultOption?.label ?? supportStatus.default}
              </span>
              <OverrideBadge count={overrideCount} />
            </TriggerSurface>
          }
        >
          {list}
        </PerCountryDialog>
      )}
    </div>
  );
}

// ============================================================================
// Notes Input Component
// ============================================================================

export function NotesInput({
  notes,
  onNotesChange,
  countries,
}: {
  notes: CountryOverride<string | null>;
  onNotesChange: (value: CountryOverride<string | null>) => void;
  countries: string[];
}) {
  // Treat null and "" as equivalent so an empty textarea doesn't create
  // a spurious override against a null default.
  const eq = (a: string | null, b: string | null) => (a ?? "") === (b ?? "");

  const setForCountry = (country: string, value: string) => {
    const expanded = expandOverride(notes, countries);
    expanded[country] = value;
    onNotesChange(collapseOverride(expanded, countries, notes.default, eq));
  };

  const overrideCount = countOverrides(notes, countries, eq);
  const defaultPreview = (notes.default ?? "").trim();

  const list = (
    <div className="space-y-2">
      {sortCountries(countries).map((c) => (
        <div key={c} className="flex items-start gap-2">
          <div className="pt-2">
            <CountryRowLabel country={c} />
          </div>
          <div className="flex-1 min-w-0">
            <InputGroup>
              <InputGroupTextarea
                id={`notes-${c}`}
                placeholder="Any additional information..."
                value={notes[c] ?? notes.default ?? ""}
                onChange={(e) => setForCountry(c, e.target.value)}
              />
            </InputGroup>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      {countries.length === 0 && (
        <InputGroup>
          <InputGroupTextarea
            id="notes"
            placeholder="Any additional information..."
            value={notes.default ?? ""}
            onChange={(e) =>
              onNotesChange({ ...notes, default: e.target.value })
            }
          />
        </InputGroup>
      )}
      {countries.length === 1 && (
        <InputGroup>
          <InputGroupTextarea
            id={`notes-${countries[0]}`}
            placeholder="Any additional information..."
            value={notes[countries[0]] ?? notes.default ?? ""}
            onChange={(e) => setForCountry(countries[0], e.target.value)}
          />
        </InputGroup>
      )}
      {countries.length >= 2 && (
        <PerCountryDialog
          label="Notes"
          trigger={
            <TriggerSurface>
              <span className="truncate text-muted-foreground">
                {defaultPreview ? (
                  defaultPreview
                ) : (
                  <span className="italic">No notes</span>
                )}
              </span>
              <OverrideBadge count={overrideCount} />
            </TriggerSurface>
          }
        >
          {list}
        </PerCountryDialog>
      )}
      <p className="text-xs text-muted-foreground">
        Notes are being displayed in a popover on the bank card
      </p>
    </div>
  );
}
