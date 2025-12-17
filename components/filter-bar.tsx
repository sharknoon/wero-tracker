"use client"

import type { SupportStatus } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedStatuses: SupportStatus[]
  onStatusChange: (statuses: SupportStatus[]) => void
  selectedCountries: string[]
  onCountryChange: (countries: string[]) => void
  availableCountries: { code: string; name: string; flag: string }[]
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
  const statuses: { value: SupportStatus; label: string }[] = [
    { value: "supported", label: "Supported" },
    { value: "announced", label: "Announced" },
    { value: "coming-soon", label: "Coming Soon" },
    { value: "none", label: "Not Available" },
  ]

  const toggleStatus = (status: SupportStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status))
    } else {
      onStatusChange([...selectedStatuses, status])
    }
  }

  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      onCountryChange(selectedCountries.filter((c) => c !== code))
    } else {
      onCountryChange([...selectedCountries, code])
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search banks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-secondary border-border">
              <Filter size={16} />
              Status
              {selectedStatuses.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {selectedStatuses.length}
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
                {status.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-secondary border-border">
              Countries
              {selectedCountries.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {selectedCountries.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border max-h-64 overflow-auto">
            <DropdownMenuLabel>Filter by Country</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableCountries.map((country) => (
              <DropdownMenuCheckboxItem
                key={country.code}
                checked={selectedCountries.includes(country.code)}
                onCheckedChange={() => toggleCountry(country.code)}
              >
                <span className="mr-2">{country.flag}</span>
                {country.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
