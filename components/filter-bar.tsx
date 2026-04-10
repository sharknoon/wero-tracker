"use client";

import { Button } from "@/components/ui/button";
import { Search, Filter, X, Flag, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { CountryFlag } from "./country-flag";
import { BaseSupportStatus } from "@/lib/status-helper";
import { countries, baseSupportStatusOptions } from "@/lib/constants";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatuses: BaseSupportStatus[];
  onStatusChange: (statuses: BaseSupportStatus[]) => void;
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
  activeView: "banks" | "merchants";
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  selectedCountries,
  onCountryChange,
  activeView,
}: FilterBarProps) {
  const toggleSupportStatus = (status: BaseSupportStatus) => {
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
          spellCheck={false}
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
        <DropdownMenuContent className="w-48" align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Info />
              Status
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {baseSupportStatusOptions.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status.value}
                    checked={selectedStatuses.includes(status.value)}
                    onCheckedChange={() => toggleSupportStatus(status.value)}
                  >
                    <status.icon className={status.iconColor} size={16} />
                    {status.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {activeView === "banks" && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Flag />
                  Countries
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-h-(--radix-dropdown-menu-content-available-height) overflow-y-auto">
                    {countries.map((country) => (
                      <DropdownMenuCheckboxItem
                        key={country}
                        checked={selectedCountries.includes(country)}
                        onCheckedChange={() => toggleCountry(country)}
                      >
                        <CountryFlag countryCode={country} size="sm" />
                        {new Intl.DisplayNames(["en"], { type: "region" }).of(
                          country,
                        )}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              onStatusChange([]);
              onCountryChange([]);
            }}
          >
            <X className="mr-2" />
            Clear All Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
