"use client"

import type { Country } from "@/lib/types"
import { BankCard } from "./bank-card"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface CountrySectionProps {
  country: Country
  defaultExpanded?: boolean
}

export function CountrySection({ country, defaultExpanded = true }: CountrySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const supportedCount = country.banks.filter((b) => b.overallStatus === "supported").length
  const announcedCount = country.banks.filter((b) => b.overallStatus === "announced").length

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-lg bg-secondary/50 px-4 py-3 hover:bg-secondary transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{country.flag}</span>
          <div className="text-left">
            <h2 className="font-semibold text-foreground">{country.name}</h2>
            <p className="text-xs text-muted-foreground">
              {country.banks.length} banks • {supportedCount} supported • {announcedCount} announced
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      <div
        className={cn(
          "grid gap-4 transition-all duration-300",
          "md:grid-cols-2 lg:grid-cols-3",
          isExpanded ? "opacity-100" : "hidden opacity-0",
        )}
      >
        {country.banks.map((bank) => (
          <BankCard key={bank.id} bank={bank} />
        ))}
      </div>
    </div>
  )
}
