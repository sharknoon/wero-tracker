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
import { SupportStatus } from "@/lib/schema";
import { Plus, X } from "lucide-react";
import { CountryFlag } from "./country-flag";
import { euCountries, supportStatusOptions } from "@/lib/constants";

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
}

export function CountrySelector({
  countries,
  onToggleCountry,
  required = true,
}: CountrySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>
        Countries {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
        {euCountries.map((country) => (
          <button
            key={country}
            type="button"
            onClick={() => onToggleCountry(country)}
            className={`flex items-center gap-2 px-2 py-1 text-sm rounded-md transition-colors ${
              countries.includes(country)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            }`}
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
  label: string;
  value: SupportStatus;
  onChange: (value: SupportStatus) => void;
  disabled?: boolean;
  required?: boolean;
}

export function SupportStatusSelect({
  label,
  value,
  onChange,
  disabled,
  required,
}: SupportStatusSelectProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as SupportStatus)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {supportStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <option.icon className={option.iconColor} size={16} />
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
