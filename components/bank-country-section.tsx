"use client";

import { Bankitem } from "./bank-item";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CountryFlag } from "./country-flag";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { WeroData } from "@/app/page";
import { calculateWeroSupport } from "@/lib/bank-helper";
import { baseStatus } from "@/lib/status-helper";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

interface BankCountrySectionProps {
  countryCode: string;
  banks: WeroData["banks"];
  defaultExpanded?: boolean;
}

export function BankCountrySection({
  countryCode,
  banks,
  defaultExpanded = true,
}: BankCountrySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [initialDefaultExpanded, setInitialDefaultExpanded] =
    useState(defaultExpanded);

  // defaultExpanded changes after the first render, based on the country resolution
  if (defaultExpanded !== initialDefaultExpanded) {
    setInitialDefaultExpanded(defaultExpanded);
    setIsOpen(defaultExpanded);
  }

  let supportedCount = 0;
  let announcedCount = 0;
  for (const bank of banks) {
    const support = baseStatus(calculateWeroSupport(bank, countryCode));
    if (support === "supported") supportedCount++;
    if (support === "announced") announcedCount++;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between rounded-lg bg-secondary/50 px-4 py-3 hover:bg-secondary transition-colors">
        <div className="flex items-center gap-3">
          <CountryFlag countryCode={countryCode} size="md" />
          <div className="text-start">
            <h2 className="font-semibold text-foreground">
              {regionNames.of(countryCode)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {banks.length} banks • {supportedCount} supported •{" "}
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
      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="p-px">
          <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
            {banks.map((bank) => (
              <Bankitem key={bank.id} bank={bank} countryCode={countryCode} />
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
