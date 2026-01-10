import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./status-badge";
import { NotesText } from "./notes-text";
import { ExternalLink, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { MerchantBrand } from "@/lib/schema";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "./ui/item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContribution } from "@/lib/contribution-context";
import { merchantCategoryOptions } from "@/lib/constants";

interface MerchantBrandItemProps {
  merchant: MerchantBrand;
}

export function MerchantBrandItem({ merchant }: MerchantBrandItemProps) {
  const { openEditMerchantDialog, openDeleteMerchantDialog } =
    useContribution();
  const category = merchantCategoryOptions.find(
    (option) => option.value === merchant.category,
  );

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
            {merchant.notes && <NotesText notes={merchant.notes} />}
          </ItemTitle>
          <ItemDescription>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${category?.color}`}
            >
              {category?.label}
            </span>
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <StatusBadge status={merchant.weroSupport} sources={[]} showLabel />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="More options"
              >
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {merchant.website && (
                <DropdownMenuItem asChild>
                  <a
                    href={merchant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={14} />
                    Open Website
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => openEditMerchantDialog(merchant)}
              >
                <Pencil size={14} />
                Suggest Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteMerchantDialog(merchant)}
              >
                <Trash2 size={14} />
                Suggest Deletion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </Item>
    </>
  );
}
