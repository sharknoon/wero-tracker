"use client";

import type { SupportStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, CircleCheck, Clock, CircleX } from "lucide-react";
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
  InputGroupInput,
} from "@/components/ui/input-group";
import { CountryFlag } from "./country-flag";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatuses: SupportStatus[];
  onStatusChange: (statuses: SupportStatus[]) => void;
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
  availableCountries: { code: string; name: string }[];
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  selectedCountries,
  onCountryChange,
  availableCountries,
}: FilterBarProps) {
  const statuses: {
    icon: React.ElementType;
    iconColor: string;
    value: SupportStatus;
    label: string;
  }[] = [
    {
      icon: CircleCheck,
      iconColor: "text-status-supported",
      value: "supported",
      label: "Supported",
    },
    {
      icon: Clock,
      iconColor: "text-status-announced",
      value: "announced",
      label: "Announced",
    },
    {
      icon: CircleX,
      iconColor: "text-status-none",
      value: "none",
      label: "Not Available",
    },
  ];

  const toggleStatus = (status: SupportStatus) => {
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
          placeholder="Search banks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
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
          {statuses.map((status) => (
            <DropdownMenuCheckboxItem
              key={status.value}
              checked={selectedStatuses.includes(status.value)}
              onCheckedChange={() => toggleStatus(status.value)}
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
              key={country.code}
              checked={selectedCountries.includes(country.code)}
              onCheckedChange={() => toggleCountry(country.code)}
            >
              <CountryFlag countryCode={country.code} size="sm" />
              {country.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
