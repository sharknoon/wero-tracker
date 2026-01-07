"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { Header } from "./header";
import { StatsOverview } from "./stats-overview";
import { FilterBar } from "./filter-bar";
import { Legend } from "./legend";
import { BankCountrySection } from "./bank-country-section";
import { MerchantCategorySection } from "./merchant-category-section";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MerchantCategory, SupportStatus, Data } from "@/lib/schema";
import { Landmark, Plus, SearchX, Store } from "lucide-react";
import { Button } from "./ui/button";

type ViewType = "banks" | "merchants";

interface WeroTrackerProps {
  data: Data;
}

export function WeroTracker({ data }: WeroTrackerProps) {
  const [activeView, setActiveView] = useState<ViewType>("banks");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<SupportStatus[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // This site will be prerendered, so we can use a fixed date for "last updated"
  const lastUpdated = new Date();

  const sourceRepository =
    process.env.NEXT_PUBLIC_WEBSITE_SOURCE_REPOSITORY ?? "#";
  const contributionGuidelines =
    process.env.NEXT_PUBLIC_WEBSITE_CONTRIBUTION_GUIDELINES ?? "#";
  const newBankLink = process.env.NEXT_PUBLIC_WEBSITE_NEW_BANK_LINK ?? "#";
  const officialWeroWebsite =
    process.env.NEXT_PUBLIC_WEBSITE_OFFICIAL_WERO_WEBSITE ?? "#";

  const filteredData = useMemo(() => {
    if (activeView === "banks") {
      return {
        banks: {
          brands: data.banks.brands.filter((brand) => {
            // Search filter
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              const brandNames = [
                brand.name.toLowerCase(),
                ...brand.aliases.map((a) => a.toLowerCase()),
              ];
              const matchesName = brandNames.some((name) =>
                name.includes(query),
              );
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
        },
        merchants: { brands: [] },
      };
    } else {
      return {
        banks: { brands: [] },
        merchants: {
          brands: data.merchants.brands.filter((merchant) => {
            // Search filter
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              const merchantNames = [
                merchant.name.toLowerCase(),
                ...merchant.aliases.map((a) => a.toLowerCase()),
              ];
              const matchesName = merchantNames.some((name) =>
                name.includes(query),
              );
              if (!matchesName) {
                return false;
              }
            }
            // Status filter
            if (
              selectedStatuses.length > 0 &&
              !selectedStatuses.includes(merchant.weroSupport)
            ) {
              return false;
            }
            // Country filter
            if (selectedCountries.length > 0) {
              const hasCountry = merchant.countries.some((country) =>
                selectedCountries.includes(country),
              );
              if (!hasCountry) {
                return false;
              }
            }
            return true;
          }),
        },
      };
    }
  }, [
    activeView,
    data.banks.brands,
    data.merchants.brands,
    searchQuery,
    selectedStatuses,
    selectedCountries,
  ]);

  const availableCountries = useMemo(() => {
    let countries;
    if (activeView === "banks") {
      countries = data.banks.brands.flatMap((brand) => brand.countries);
    } else {
      countries = data.merchants.brands.flatMap(
        (merchant) => merchant.countries,
      );
    }
    return Array.from(new Set(countries)).sort();
  }, [activeView, data.banks.brands, data.merchants.brands]);

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

  // Group banks by country
  const filteredBankCountries = useMemo(() => {
    const countryMap = new Map<string, typeof data.banks.brands>();

    filteredData.banks.brands.forEach((brand) => {
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
  }, [data, filteredData.banks.brands, selectedCountries]);

  // Group merchants by category
  const filteredMerchantCategories = useMemo(() => {
    const categoryMap = new Map<
      MerchantCategory,
      typeof data.merchants.brands
    >();

    filteredData.merchants.brands.forEach((merchant) => {
      if (!categoryMap.has(merchant.category)) {
        categoryMap.set(merchant.category, []);
      }
      categoryMap.get(merchant.category)!.push(merchant);
    });

    return categoryMap;
  }, [data, filteredData.merchants.brands]);

  // Category order for display
  const categoryOrder: MerchantCategory[] = [
    "fashion",
    "electronics",
    "food-delivery",
    "groceries",
    "travel",
    "entertainment",
    "services",
    "other",
  ];

  // Handle tab change and clear filters
  const handleViewChange = (view: string) => {
    setActiveView(view as ViewType);
    setSearchQuery("");
    setSelectedStatuses([]);
    setSelectedCountries([]);
  };

  return (
    <div className="min-h-screen">
      <Header
        sourceRepository={sourceRepository}
        contributionGuidelines={contributionGuidelines}
        lastUpdated={lastUpdated}
      />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <StatsOverview data={data} activeView={activeView} />

        <Tabs
          value={activeView}
          onValueChange={handleViewChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 h-10">
            <TabsTrigger value="banks" className="gap-2">
              <Landmark size={16} />
              Banks
            </TabsTrigger>
            <TabsTrigger value="merchants" className="gap-2">
              <Store size={16} />
              Online Shops
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatuses={selectedStatuses}
              onStatusChange={setSelectedStatuses}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
              availableCountries={availableCountries}
              activeView={activeView}
            />
            <Legend />
          </div>

          <TabsContent value="banks" className="space-y-6">
            {filteredData.banks.brands.length === 0 ? (
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
              [...filteredBankCountries]
                .sort(([a], [b]) => {
                  if (userCountry) {
                    if (a === userCountry) return -1;
                    if (b === userCountry) return 1;
                  }
                  return a.localeCompare(b);
                })
                .map(([code, brands]) => (
                  <BankCountrySection
                    key={code}
                    countryCode={code}
                    brands={brands}
                    weroApp={data.banks.standaloneAppResource}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="merchants" className="space-y-6">
            {filteredData.merchants.brands.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchX />
                  </EmptyMedia>
                  <EmptyTitle>No online shops found</EmptyTitle>
                  <EmptyDescription>
                    No online shops found matching your filters. You can help by
                    adding missing shops via the data repository.
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
                        Add missing shop
                      </a>
                    </Button>
                  </div>
                </EmptyContent>
              </Empty>
            ) : (
              categoryOrder
                .filter((category) => filteredMerchantCategories.has(category))
                .map((category) => (
                  <MerchantCategorySection
                    key={category}
                    category={category}
                    merchants={filteredMerchantCategories.get(category)!}
                  />
                ))
            )}
          </TabsContent>
        </Tabs>

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
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
