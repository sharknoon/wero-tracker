"use client"

import { useState, useMemo } from "react"
import type { WeroData, SupportStatus } from "@/lib/types"
import { Header } from "./header"
import { StatsOverview } from "./stats-overview"
import { FilterBar } from "./filter-bar"
import { Legend } from "./legend"
import { CountrySection } from "./country-section"

interface WeroTrackerProps {
  data: WeroData
}

export function WeroTracker({ data }: WeroTrackerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<SupportStatus[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])

  const filteredData = useMemo(() => {
    return {
      ...data,
      countries: data.countries
        .filter((country) => {
          if (selectedCountries.length > 0 && !selectedCountries.includes(country.code)) {
            return false
          }
          return true
        })
        .map((country) => ({
          ...country,
          banks: country.banks.filter((bank) => {
            // Search filter
            if (searchQuery) {
              const query = searchQuery.toLowerCase()
              if (!bank.name.toLowerCase().includes(query)) {
                return false
              }
            }
            // Status filter
            if (selectedStatuses.length > 0 && !selectedStatuses.includes(bank.overallStatus)) {
              return false
            }
            return true
          }),
        }))
        .filter((country) => country.banks.length > 0),
    }
  }, [data, searchQuery, selectedStatuses, selectedCountries])

  const availableCountries = data.countries.map((c) => ({
    code: c.code,
    name: c.name,
    flag: c.flag,
  }))

  return (
    <div className="min-h-screen bg-background">
      <Header dataSource={data.dataSource} lastUpdated={data.lastUpdated} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <StatsOverview data={data} />

        <div className="space-y-4">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedStatuses={selectedStatuses}
            onStatusChange={setSelectedStatuses}
            selectedCountries={selectedCountries}
            onCountryChange={setSelectedCountries}
            availableCountries={availableCountries}
          />
          <Legend />
        </div>

        <div className="space-y-6">
          {filteredData.countries.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No banks found matching your filters.</p>
            </div>
          ) : (
            filteredData.countries.map((country, index) => (
              <CountrySection key={country.code} country={country} defaultExpanded={index < 2} />
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-8 pb-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl">
              This tracker is community-driven. Data is sourced from official bank announcements, Wero press releases,
              and verified user reports. Help us keep it accurate by contributing via GitHub.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a
                href="https://www.wero.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Official Wero Website
              </a>
              <span>•</span>
              <a
                href={data.dataSource}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Data Repository
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
