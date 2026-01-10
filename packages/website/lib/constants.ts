import { MerchantCategory, SupportStatus } from "@/lib/schema";
import { CircleCheck, CircleQuestionMark, CircleX, Clock } from "lucide-react";

// List of all eu countries
export const euCountries: string[] = [
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
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
];

// All available support statuses
export const supportStatusOptions: {
  icon: React.ElementType;
  iconColor: string;
  value: SupportStatus;
  label: string;
  description: string;
}[] = [
  {
    icon: CircleCheck,
    iconColor: "text-status-supported",
    value: "supported",
    label: "Supported",
    description: "Wero is fully supported",
  },
  {
    icon: Clock,
    iconColor: "text-status-announced",
    value: "announced",
    label: "Announced",
    description: "Support has been announced but not yet available",
  },
  {
    icon: CircleX,
    iconColor: "text-status-unsupported",
    value: "unsupported",
    label: "Unsupported",
    description: "Wero is not supported",
  },
  {
    icon: CircleQuestionMark,
    iconColor: "text-status-unknown",
    value: "unknown",
    label: "Unknown",
    description: "Support status is unknown",
  },
];

// Merchant category options
export const merchantCategoryOptions: {
  emoji: string;
  color: string;
  value: MerchantCategory;
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
