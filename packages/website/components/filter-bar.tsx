"use client";

import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { CountryFlag } from "./country-flag";
import { SupportStatus } from "@/lib/schema";
import { supportStatusOptions } from "@/lib/constants";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatuses: SupportStatus[];
  onStatusChange: (statuses: SupportStatus[]) => void;
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
  availableCountries: string[];
  activeView: "banks" | "merchants";
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  selectedCountries,
  onCountryChange,
  availableCountries,
  activeView,
}: FilterBarProps) {
  const toggleSupportStatus = (status: SupportStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      onCountryChange(selectedCountries.filter((c) => c !== code));
    } else {
      onCountryChange([...selectedCountries, code]);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <InputGroup>
        <InputGroupInput
          placeholder={
            activeView === "banks"
              ? "Search banks..."
              : "Search online shops..."
          }
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        {searchQuery && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Clear"
              title="Clear"
              size="icon-xs"
              onClick={() => onSearchChange("")}
            >
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Filter size={16} />
            Filter
            {selectedStatuses.length + selectedCountries.length > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {selectedStatuses.length + selectedCountries.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card border-border">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {supportStatusOptions.map((status) => (
            <DropdownMenuCheckboxItem
              key={status.value}
              checked={selectedStatuses.includes(status.value)}
              onCheckedChange={() => toggleSupportStatus(status.value)}
            >
              <status.icon className={status.iconColor} size={16} />
              {status.label}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Country</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableCountries.map((country) => (
            <DropdownMenuCheckboxItem
              key={country}
              checked={selectedCountries.includes(country)}
              onCheckedChange={() => toggleCountry(country)}
            >
              <CountryFlag countryCode={country} size="sm" />
              {new Intl.DisplayNames(["en"], { type: "region" }).of(country)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
