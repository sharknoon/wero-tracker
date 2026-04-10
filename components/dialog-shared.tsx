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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { SupportStatus } from "@/db/schema/support";
import { ExternalLink, Globe, Plus, Trash2, X } from "lucide-react";
import { CountryFlag } from "./country-flag";
import {
  countries as allCountries,
  getStatusOptionsForCountry,
} from "@/lib/constants";
import { Bank, CountryOverride } from "@/db/schema/banks";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <InputGroup>
          <InputGroupInput
            id={id}
            type="url"
            placeholder={placeholder}
            value={website.default}
            onChange={(e) =>
              onWebsiteChange({ ...website, default: e.target.value })
            }
          />
          <InputGroupAddon align="inline-end">
            <OverrideIndicator
              value={website}
              onChange={onWebsiteChange}
              label={label}
              allCountries={countries}
              input={(c) => (
                <Input
                  type="url"
                  placeholder={placeholder}
                  value={website[c] ?? website.default}
                  onChange={(e) =>
                    onWebsiteChange({ ...website, [c]: e.target.value })
                  }
                />
              )}
            />
          </InputGroupAddon>
        </InputGroup>
        <Button variant="outline" size="icon" className="shrink-0" asChild>
          <a href={website.default} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} />
          </a>
        </Button>
      </div>
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
            {new Intl.DisplayNames(["en"], { type: "region" }).of(country)}
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
  const defaultOptions = getStatusOptionsForCountry(
    countries.length === 1 && includePartnerSystems ? countries[0] : undefined,
  );

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex items-center gap-1">
        <Select
          value={supportStatus.default}
          onValueChange={(v) =>
            onSupportStatusChange({
              ...supportStatus,
              default: v as SupportStatus,
            })
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {defaultOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <option.icon className={option.iconColor} size={16} />
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <OverrideIndicator
          value={supportStatus}
          onChange={onSupportStatusChange}
          label={label}
          allCountries={countries}
          input={(c) => {
            const overrideOptions = getStatusOptionsForCountry(
              includePartnerSystems ? c : undefined,
            );
            return (
              <Select
                value={supportStatus[c] ?? supportStatus.default}
                onValueChange={(v) =>
                  onSupportStatusChange({
                    ...supportStatus,
                    [c]: v as SupportStatus,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {overrideOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <option.icon className={option.iconColor} size={16} />
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }}
        />
      </div>
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
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      <InputGroup>
        <InputGroupTextarea
          id="notes"
          placeholder="Any additional information..."
          value={notes.default || ""}
          onChange={(e) => onNotesChange({ ...notes, default: e.target.value })}
        />
        <InputGroupAddon align="inline-end">
          <OverrideIndicator
            value={notes}
            onChange={onNotesChange}
            label="Notes"
            allCountries={countries}
            input={(c) => (
              <InputGroupTextarea
                placeholder="Any additional information..."
                value={notes[c] || notes.default || ""}
                onChange={(e) =>
                  onNotesChange({ ...notes, [c]: e.target.value })
                }
              />
            )}
          />
        </InputGroupAddon>
      </InputGroup>
      <p className="text-xs text-muted-foreground">
        Notes are being displayed in a popover on the bank card
      </p>
    </div>
  );
}

// ============================================================================
// Field Override System
// ============================================================================

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function OverrideIndicator<T>({
  value,
  onChange,
  label,
  allCountries,
  input,
}: {
  value: CountryOverride<T>;
  onChange: (value: CountryOverride<T>) => void;
  label: string;
  allCountries: string[];
  input: (countryCode: string) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const overriddenCountries = Object.entries(value)
    .filter(([key]) => key !== "default")
    .map(([key]) => key);

  const availableCountries = allCountries.filter(
    (c) => !overriddenCountries.includes(c),
  );

  const count = overriddenCountries.length;

  if (allCountries.length <= 1) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "inline-flex items-center gap-0.5 shrink-0 rounded-sm p-1 transition-colors hover:bg-accent",
          count > 0 ? "text-primary" : "text-muted-foreground",
        )}
        title={
          count > 0
            ? `${count} country override${count !== 1 ? "s" : ""}`
            : "Add country override"
        }
      >
        {count > 0 ? (
          <>
            {overriddenCountries.slice(0, 3).map((c) => (
              <CountryFlag key={c} countryCode={c} size="sm" />
            ))}
            {count > 3 && (
              <span className="text-xs font-medium">+{count - 3}</span>
            )}
          </>
        ) : (
          <Globe size={14} />
        )}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden grid-rows-[auto_1fr_auto] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{label} Overrides</DialogTitle>
            <DialogDescription>
              Set different values for specific countries. Countries without
              overrides inherit the base value.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 min-h-0 overflow-y-auto">
            {overriddenCountries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No country overrides yet. Select a country below to add one.
              </p>
            )}

            {overriddenCountries.map((c) => (
              <div key={c} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CountryFlag countryCode={c} size="sm" />
                    <span className="text-sm font-medium">
                      {regionNames.of(c)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { [c]: _, ...rest } = value;
                      onChange(rest as CountryOverride<T>);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                {input(c)}
              </div>
            ))}

            <div className="flex flex-wrap gap-1">
              {availableCountries.map((c) => (
                <Button
                  key={c}
                  variant="secondary"
                  onClick={() => {
                    onChange({ ...value, [c]: value.default });
                  }}
                >
                  <Plus />
                  <CountryFlag countryCode={c} size="sm" />
                  {regionNames.of(c)}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
