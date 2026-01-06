"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { Header } from "./header";
import { StatsOverview } from "./stats-overview";
import { FilterBar } from "./filter-bar";
import { Legend } from "./legend";
import { CountrySection } from "./country-section";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SupportStatus, WeroData } from "@/lib/schema";
import { Plus, SearchX } from "lucide-react";
import { Button } from "./ui/button";

interface WeroTrackerProps {
  data: WeroData;
}

export function WeroTracker({ data }: WeroTrackerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<SupportStatus[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // This site will be prerendered, so we can use a fixed date for "last updated"
  const lastUpdated = new Date();

  const sourceRepository = process.env.NEXT_PUBLIC_WT_SOURCE_REPOSITORY ?? "#";
  const dataRepository = process.env.NEXT_PUBLIC_WT_DATA_REPOSITORY ?? "#";
  const contributionGuidelines =
    process.env.NEXT_PUBLIC_WT_CONTRIBUTION_GUIDELINES ?? "#";
  const newBankLink = process.env.NEXT_PUBLIC_WT_NEW_BANK_LINK ?? "#";
  const officialWeroWebsite =
    process.env.NEXT_PUBLIC_WT_OFFICIAL_WERO_WEBSITE ?? "#";

  const filteredData = useMemo(() => {
    return {
      brands: data.brands.filter((brand) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const brandNames = [
            brand.name.toLowerCase(),
            ...brand.aliases.map((a) => a.toLowerCase()),
          ];
          const matchesName = brandNames.some((name) => name.includes(query));
          if (!matchesName) {
            return false;
          }
        }
        // Status filter
        if (
          selectedStatuses.length > 0 &&
          !selectedStatuses.includes(brand.weroSupport)
        ) {
          return false;
        }
        // Country filter
        if (selectedCountries.length > 0) {
          const hasCountry = brand.countries.some((country) =>
            selectedCountries.includes(country),
          );
          if (!hasCountry) {
            return false;
          }
        }
        return true;
      }),
      standaloneAppResource: data.standaloneAppResource,
    };
  }, [data, searchQuery, selectedStatuses, selectedCountries]);

  const availableCountries = Array.from(
    data.brands.reduce((set, brand) => {
      brand.countries.forEach((country) => set.add(country));
      return set;
    }, new Set<string>()),
  ).sort();

  // Get user's country from browser locale (using useSyncExternalStore to avoid hydration mismatch)
  const userCountry = useSyncExternalStore(
    () => () => {}, // No subscription needed for static value
    () => {
      // Client: extract country from browser locale
      const locale = navigator.language || navigator.languages?.[0];
      console.log("Locale detected:", locale);
      if (locale) {
        const parts = locale.split("-");
        if (parts.length === 1 && parts[0].length === 2) {
          return parts[0].toUpperCase();
        } else if (parts.length > 1 && parts[1].length === 2) {
          return parts[1].toUpperCase();
        }
      }
      return null;
    },
    () => null, // Server: return null to avoid hydration mismatch
  );

  const filteredCountries = useMemo(() => {
    const countryMap = new Map<string, typeof data.brands>();

    filteredData.brands.forEach((brand) => {
      brand.countries
        .filter(
          (code) =>
            selectedCountries.length === 0 || selectedCountries.includes(code),
        )
        .forEach((countryCode) => {
          if (!countryMap.has(countryCode)) {
            countryMap.set(countryCode, []);
          }
          countryMap.get(countryCode)!.push(brand);
        });
    });

    return countryMap;
  }, [data, filteredData.brands, selectedCountries]);

  return (
    <div className="min-h-screen">
      <Header
        sourceRepository={sourceRepository}
        contributionGuidelines={contributionGuidelines}
        lastUpdated={lastUpdated}
      />

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
          {filteredData.brands.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>No banks found</EmptyTitle>
                <EmptyDescription>
                  No banks found matching your filters. You can help by adding
                  missing banks via the data repository.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Button asChild>
                    <a
                      href={newBankLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Plus />
                      Add missing bank
                    </a>
                  </Button>
                </div>
              </EmptyContent>
            </Empty>
          ) : (
            [...filteredCountries]
              .sort(([a], [b]) => {
                if (userCountry) {
                  if (a === userCountry) return -1;
                  if (b === userCountry) return 1;
                }
                return a.localeCompare(b);
              })
              .map(([code, brands]) => (
                <CountrySection
                  key={code}
                  countryCode={code}
                  brands={brands}
                  weroApp={data.standaloneAppResource}
                />
              ))
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-8 pb-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl">
              This tracker is community-driven. Data is sourced from official
              bank announcements, Wero press releases, and verified user
              reports. Help us keep it accurate by contributing via GitHub.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a
                href={officialWeroWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Official Wero Website
              </a>
              <span>•</span>
              <a
                href={sourceRepository}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Source Repository
              </a>
              <span>•</span>
              <a
                href={dataRepository}
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
  );
}
