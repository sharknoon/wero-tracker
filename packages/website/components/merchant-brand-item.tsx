import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./status-badge";
import { ExternalLink } from "lucide-react";
import { MerchantBrand, MerchantCategory } from "@/lib/schema";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "./ui/item";

interface MerchantBrandItemProps {
  merchant: MerchantBrand;
}

const categoryLabels: Record<MerchantCategory, string> = {
  fashion: "Fashion & Apparel",
  electronics: "Electronics",
  "food-delivery": "Food Delivery",
  groceries: "Groceries",
  travel: "Travel & Booking",
  entertainment: "Entertainment",
  services: "Services",
  other: "Other",
};

const categoryColors: Record<MerchantCategory, string> = {
  fashion: "bg-pink-500/10 text-pink-500",
  electronics: "bg-blue-500/10 text-blue-500",
  "food-delivery": "bg-orange-500/10 text-orange-500",
  groceries: "bg-green-500/10 text-green-500",
  travel: "bg-purple-500/10 text-purple-500",
  entertainment: "bg-yellow-500/10 text-yellow-500",
  services: "bg-cyan-500/10 text-cyan-500",
  other: "bg-gray-500/10 text-gray-500",
};

export function MerchantBrandItem({ merchant }: MerchantBrandItemProps) {
  return (
    <>
      <Item variant="outline">
        <ItemMedia>
          <Avatar className="size-10 rounded-lg">
            <AvatarImage
              src={merchant.logoUrl}
              className="bg-white p-1 object-contain"
            />
            <AvatarFallback className="rounded-lg">
              {merchant.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            {merchant.name}{" "}
            <a
              href={merchant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors shrink-0"
            >
              <ExternalLink size={14} />
            </a>
          </ItemTitle>
          <ItemDescription>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[merchant.category]}`}
            >
              {categoryLabels[merchant.category]}
            </span>
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <StatusBadge status={merchant.weroSupport} sources={[]} showLabel />
        </ItemActions>
      </Item>
    </>
  );
}

export { categoryLabels, categoryColors };
