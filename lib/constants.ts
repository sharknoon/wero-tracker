import type { Merchant } from "@/db/schema/merchants";
import type { SupportStatus } from "@/db/schema/support";
import { CircleCheck, CircleQuestionMark, CircleX, Clock } from "lucide-react";
import { BaseSupportStatus } from "@/lib/status-helper";

// List of all eu countries + EuroPA countries (+ NO)
export const countries: string[] = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
];

// All available support statuses
export const baseSupportStatusOptions: {
  icon: React.ElementType;
  iconColor: string;
  value: BaseSupportStatus;
  label: string;
}[] = [
  {
    icon: CircleCheck,
    iconColor: "text-status-supported",
    value: "supported",
    label: "Supported",
  },
  {
    icon: Clock,
    iconColor: "text-status-announced",
    value: "announced",
    label: "Announced",
  },
  {
    icon: CircleX,
    iconColor: "text-status-unsupported",
    value: "unsupported",
    label: "Unsupported",
  },
  {
    icon: CircleQuestionMark,
    iconColor: "text-status-unknown",
    value: "unknown",
    label: "Unknown",
  },
];

// Merchant category options
export const merchantCategoryOptions: {
  emoji: string;
  color: string;
  value: Merchant["category"];
  label: string;
}[] = [
  {
    emoji: "👗",
    color: "bg-pink-500/10 text-pink-500",
    value: "fashion",
    label: "Fashion & Apparel",
  },
  {
    emoji: "📱",
    color: "bg-blue-500/10 text-blue-500",
    value: "electronics",
    label: "Electronics",
  },
  {
    emoji: "🍕",
    color: "bg-orange-500/10 text-orange-500",
    value: "food-delivery",
    label: "Food Delivery",
  },
  {
    emoji: "🛒",
    color: "bg-green-500/10 text-green-500",
    value: "groceries",
    label: "Groceries",
  },
  {
    emoji: "✈️",
    color: "bg-purple-500/10 text-purple-500",
    value: "travel",
    label: "Travel & Booking",
  },
  {
    emoji: "🎬",
    color: "bg-yellow-500/10 text-yellow-500",
    value: "entertainment",
    label: "Entertainment",
  },
  {
    emoji: "🔧",
    color: "bg-cyan-500/10 text-cyan-500",
    value: "services",
    label: "Services",
  },
  {
    emoji: "📦",
    color: "bg-gray-500/10 text-gray-500",
    value: "other",
    label: "Other",
  },
];

// All available partner systems (EuroPA alliance)
export type PartnerSystem =
  "bizum" | "bancomat" | "mb-way" | "vipps" | "mobilepay" | "blik" | "iris";
export const partnerSystemOptions: Record<
  PartnerSystem,
  {
    icon: string;
    value: PartnerSystem;
    label: string;
    countries: string[]; // List of country codes where this system is available
  }
> = {
  bizum: {
    icon: "icons/bizum.svg",
    value: "bizum",
    label: "Bizum",
    countries: ["ES"],
  },
  bancomat: {
    icon: "icons/bancomat.svg",
    value: "bancomat",
    label: "BANCOMAT Pay",
    countries: ["IT"],
  },
  "mb-way": {
    icon: "icons/mb-way.svg",
    value: "mb-way",
    label: "MB WAY",
    countries: ["PT"],
  },
  vipps: {
    icon: "icons/vipps.svg",
    value: "vipps",
    label: "Vipps",
    countries: ["NO"],
  },
  mobilepay: {
    icon: "icons/mobilepay.svg",
    value: "mobilepay",
    label: "MobilePay",
    countries: ["DK", "FI"],
  },
  blik: {
    icon: "icons/blik.svg",
    value: "blik",
    label: "BLIK",
    countries: ["PL"],
  },
  iris: {
    icon: "icons/iris.svg",
    value: "iris",
    label: "IRIS",
    countries: ["GR"],
  },
};
export type PartnerSystemOption =
  (typeof partnerSystemOptions)[keyof typeof partnerSystemOptions];

/**
 * Returns support status options filtered for a specific country.
 * When a country is provided, inserts partner-system-specific options
 * (e.g. "Supported via Bizum") after their base status.
 * When no country is given, returns only the 4 base options.
 */
export function getStatusOptionsForCountry(country?: string) {
  if (!country) return baseSupportStatusOptions;

  const partners = Object.values(partnerSystemOptions).filter((p) =>
    p.countries.includes(country),
  );
  if (partners.length === 0) return baseSupportStatusOptions;

  type StatusOptions = (Omit<
    (typeof baseSupportStatusOptions)[number],
    "value"
  > & {
    value: SupportStatus;
  })[];

  const result: StatusOptions = [];
  for (const opt of baseSupportStatusOptions) {
    result.push(opt);
    if (opt.value === "supported") {
      for (const p of partners) {
        result.push({
          icon: CircleCheck,
          iconColor: "text-status-supported",
          value: `supported-via-${p.value}` as SupportStatus,
          label: `Supported via ${p.label}`,
        });
      }
    } else if (opt.value === "announced") {
      for (const p of partners) {
        result.push({
          icon: Clock,
          iconColor: "text-status-announced",
          value: `announced-via-${p.value}` as SupportStatus,
          label: `Announced via ${p.label}`,
        });
      }
    }
  }
  return result;
}
