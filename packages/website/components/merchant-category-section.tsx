"use client";

import { MerchantBrandItem } from "./merchant-brand-item";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MerchantBrand, MerchantCategory } from "@/lib/schema";
import { merchantCategoryOptions } from "@/lib/constants";

interface MerchantCategorySectionProps {
  category: MerchantCategory;
  merchants: MerchantBrand[];
  defaultExpanded?: boolean;
}

export function MerchantCategorySection({
  category: c,
  merchants,
  defaultExpanded = true,
}: MerchantCategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const category = merchantCategoryOptions.find((o) => o.value === c);

  const supportedCount = merchants.filter(
    (m) => m.weroSupport === "supported",
  ).length;
  const announcedCount = merchants.filter(
    (m) => m.weroSupport === "announced",
  ).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-secondary/50 px-4 py-3 hover:bg-secondary transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label={category?.label}>
            {category?.emoji}
          </span>
          <div className="text-start">
            <h2 className="font-semibold text-foreground">{category?.label}</h2>
            <p className="text-xs text-muted-foreground">
              {merchants.length} shops • {supportedCount} supported •{" "}
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
          {merchants.map((merchant) => (
            <MerchantBrandItem key={merchant.id} merchant={merchant} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
