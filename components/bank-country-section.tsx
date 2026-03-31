"use client";

import { Bankitem } from "./bank-item";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CountryFlag } from "./country-flag";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { WeroData } from "@/app/page";

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

  useEffect(() => {
    setIsOpen(defaultExpanded);
  }, [defaultExpanded]);

  const supportedCount = banks.filter(
    (b) => b.weroSupport === "supported",
  ).length;
  const announcedCount = banks.filter(
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
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="p-px">
            <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
              {banks.map((bank) => (
                <Bankitem key={bank.id} bank={bank} />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
