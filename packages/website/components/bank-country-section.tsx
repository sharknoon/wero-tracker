"use client";

import { BankBrandItem } from "./bank-brand-item";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CountryFlag } from "./country-flag";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BankBrand, Data } from "@/lib/schema";

interface BankCountrySectionProps {
  countryCode: string;
  brands: BankBrand[];
  weroApp: Data["banks"]["standaloneAppResource"];
  defaultExpanded?: boolean;
}

export function BankCountrySection({
  countryCode,
  brands,
  weroApp,
  defaultExpanded = true,
}: BankCountrySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const supportedCount = brands.filter(
    (b) => b.weroSupport === "supported",
  ).length;
  const announcedCount = brands.filter(
    (b) => b.weroSupport === "announced",
  ).length;

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-secondary/50 px-4 py-3 hover:bg-secondary transition-colors">
          <div className="flex items-center gap-3">
            <CountryFlag countryCode={countryCode} size="md" />
            <div className="text-start">
              <h2 className="font-semibold text-foreground">
                {new Intl.DisplayNames(["en"], { type: "region" }).of(
                  countryCode,
                )}
              </h2>
              <p className="text-xs text-muted-foreground">
                {brands.length} banks • {supportedCount} supported •{" "}
                {announcedCount} announced
              </p>
            </div>
          </div>
          <ChevronDown
            size={20}
            className={cn(
              isOpen ? "rotate-0" : "-rotate-90",
              "transition-transform text-muted-foreground",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <BankBrandItem key={brand.id} brand={brand} weroApp={weroApp} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
