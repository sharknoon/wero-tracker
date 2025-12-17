"use client";

import type { Country } from "@/lib/types";
import { BankCard } from "./bank-card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CountryFlag } from "./country-flag";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CountrySectionProps {
  country: Country;
  defaultExpanded?: boolean;
}

export function CountrySection({
  country,
  defaultExpanded = true,
}: CountrySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const supportedCount = country.banks.filter(
    (b) => b.overallStatus === "supported",
  ).length;
  const announcedCount = country.banks.filter(
    (b) => b.overallStatus === "announced",
  ).length;

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-secondary/50 px-4 py-3 hover:bg-secondary transition-colors">
          <div className="flex items-center gap-3">
            <CountryFlag countryCode={country.code} size="md" />
            <div className="text-start">
              <h2 className="font-semibold text-foreground">{country.name}</h2>
              <p className="text-xs text-muted-foreground">
                {country.banks.length} banks • {supportedCount} supported •{" "}
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
            {country.banks.map((bank) => (
              <BankCard key={bank.id} bank={bank} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
