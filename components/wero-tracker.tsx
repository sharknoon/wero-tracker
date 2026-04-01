"use client";

import {
  useState,
  useMemo,
  useSyncExternalStore,
  useCallback,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "./header";
import { StatsOverview } from "./stats-overview";
import { FilterBar } from "./filter-bar";
import { Legend } from "./legend";
import { BankCountrySection } from "./bank-country-section";
import { Bankitem } from "./bank-item";
import { MerchantCategorySection } from "./merchant-category-section";
import { MerchantItem } from "./merchant-item";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, Plus, SearchX, Store } from "lucide-react";
import { Button } from "./ui/button";
import {
  ContributionProvider,
  useContribution,
} from "@/lib/contribution-context";
import { euCountries } from "@/lib/constants";
import { MerchantDialog } from "./merchant-dialog";
import { BankDialog } from "./bank-dialog";
import { Merchant } from "@/db/schema/merchants";
import { SupportStatus } from "@/db/schema/support";
import { WeroData } from "@/app/page";

type ViewType = "banks" | "merchants";

interface WeroTrackerProps {
  data: WeroData;
}

export function WeroTracker({ data }: WeroTrackerProps) {
  return (
    <ContributionProvider>
      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <WeroTrackerContent data={data} />
      </Suspense>
      <MerchantDialog />
      <BankDialog />
    </ContributionProvider>
  );
}

function WeroTrackerContent({ data }: WeroTrackerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<SupportStatus[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const { openContributionDialog } = useContribution();
  const searchParams = useSearchParams();
  const router = useRouter();

  const viewFromParams: ViewType =
    searchParams.get("view") === "merchants" ? "merchants" : "banks";
  const [activeView, setActiveViewState] = useState<ViewType>(viewFromParams);
  const setActiveView = useCallback(
    (view: ViewType) => {
      setActiveViewState(view);
      const params = new URLSearchParams(searchParams);
      if (view === "banks") {
        params.delete("view");
      } else {
        params.set("view", view);
      }
      router.replace(`?${params}`, { scroll: false });
    },
    [searchParams, router],
  );

  const sourceRepository = "https://github.com/sharknoon/wero-tracker";
  const ownerGitHub = "https://github.com/sharknoon";
  const contributionGuidelines =
    "https://github.com/sharknoon/wero-tracker/blob/main/README.md#contribution";
  const officialWeroWebsite = "https://wero-wallet.eu";

  const filteredData: WeroData = useMemo(() => {
    if (activeView === "banks") {
      return {
        banks: data.banks.filter((bank) => {
          // Search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const bankNames = [
              bank.name.toLowerCase(),
              ...bank.aliases.map((a) => a.toLowerCase()),
            ];
            const matchesName = bankNames.some((name) => name.includes(query));
            if (!matchesName) {
              return false;
            }
          }
          // Status filter
          if (
            selectedStatuses.length > 0 &&
            !selectedStatuses.includes(bank.weroSupport)
          ) {
            return false;
          }
          // Country filter
          if (selectedCountries.length > 0) {
            const hasCountry = bank.countries.some((country) =>
              selectedCountries.includes(country),
            );
            if (!hasCountry) {
              return false;
            }
          }
          return true;
        }),
        merchants: [],
        lastUpdated: data.lastUpdated,
      };
    } else {
      return {
        banks: [],
        merchants: data.merchants.filter((merchant) => {
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
          return true;
        }),
        lastUpdated: data.lastUpdated,
      };
    }
  }, [
    activeView,
    data.banks,
    data.lastUpdated,
    data.merchants,
    searchQuery,
    selectedStatuses,
    selectedCountries,
  ]);

  const availableCountries = useMemo(() => {
    // Only banks have countries, merchants don't
    if (activeView !== "banks") {
      return [];
    }
    const countries = data.banks.flatMap((bank) => bank.countries);
    const filteredCountries = countries.filter((code) =>
      euCountries.includes(code),
    );
    return Array.from(new Set(filteredCountries)).sort();
  }, [activeView, data.banks]);

  // Get user's country from browser locale (using useSyncExternalStore to avoid hydration mismatch)
  const userCountry = useSyncExternalStore(
    () => () => {}, // No subscription needed for static value
    () => {
      // Client: extract country from browser locale
      const locale = navigator.language || navigator.languages?.[0];
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
    const countryMap = new Map<string, WeroData["banks"][number][]>();

    filteredData.banks.forEach((bank) => {
      bank.countries
        .filter(
          (code) =>
            (selectedCountries.length === 0 ||
              selectedCountries.includes(code)) &&
            euCountries.includes(code),
        )
        .forEach((countryCode) => {
          if (!countryMap.has(countryCode)) {
            countryMap.set(countryCode, []);
          }
          countryMap.get(countryCode)!.push(bank);
        });
    });

    return countryMap;
  }, [filteredData.banks, selectedCountries]);

  // Group merchants by category
  const filteredMerchantCategories = useMemo(() => {
    const categoryMap = new Map<Merchant["category"], Merchant[]>();

    filteredData.merchants.forEach((merchant) => {
      if (!categoryMap.has(merchant.category)) {
        categoryMap.set(merchant.category, []);
      }
      categoryMap.get(merchant.category)!.push(merchant);
    });

    return categoryMap;
  }, [filteredData.merchants]);

  // Category order for display
  const categoryOrder: Merchant["category"][] = [
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
        lastUpdated={data.lastUpdated}
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
            {filteredData.banks.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchX />
                  </EmptyMedia>
                  <EmptyTitle>No banks found</EmptyTitle>
                  <EmptyDescription>
                    No banks found matching your filters. You can help by adding
                    missing banks.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        openContributionDialog({
                          type: "bank",
                          action: "add",
                        })
                      }
                    >
                      <Plus />
                      Add missing bank
                    </Button>
                  </div>
                </EmptyContent>
              </Empty>
            ) : searchQuery ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredData.banks.map((bank) => (
                  <Bankitem key={bank.id} bank={bank} />
                ))}
              </div>
            ) : (
              [...filteredBankCountries]
                .sort(([a], [b]) => {
                  if (userCountry) {
                    if (a === userCountry) return -1;
                    if (b === userCountry) return 1;
                  }
                  return a.localeCompare(b);
                })
                .map(([code, banks]) => (
                  <BankCountrySection
                    key={code}
                    countryCode={code}
                    banks={banks}
                    defaultExpanded={code === userCountry}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="merchants" className="space-y-6">
            {filteredData.merchants.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchX />
                  </EmptyMedia>
                  <EmptyTitle>No online shops found</EmptyTitle>
                  <EmptyDescription>
                    No online shops found matching your filters. You can help by
                    adding missing shops.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        openContributionDialog({
                          type: "merchant",
                          action: "add",
                        })
                      }
                    >
                      <Plus />
                      Add missing shop
                    </Button>
                  </div>
                </EmptyContent>
              </Empty>
            ) : searchQuery ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredData.merchants.map((merchant) => (
                  <MerchantItem key={merchant.id} merchant={merchant} />
                ))}
              </div>
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
          <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
            <p className="text-sm max-w-2xl">
              This tracker is community-driven. Data is sourced from official
              announcements, verified user reports, and public sources. Help us
              keep it accurate by contributing to the project!
            </p>
            <div className="flex gap-4 text-xs">
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
            <p className="text-sm mt-8">
              Made with ❤️ by{" "}
              <a
                href={ownerGitHub}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Sharknoon
              </a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
