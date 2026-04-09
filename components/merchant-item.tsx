"use client";

import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./status-badge";
import { NotesText } from "./notes-text";
import { ExternalLink, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
import { useEditor } from "@/lib/editor-context";
import { merchantCategoryOptions } from "@/lib/constants";
import { Merchant } from "@/db/schema/merchants";
import { ContributionAction } from "@/db/schema/contributions";
import { redirect, usePathname, useSearchParams } from "next/navigation";

interface MerchantItemProps {
  merchant: Merchant;
}

export function MerchantItem({ merchant }: MerchantItemProps) {
  const { openEditorDialog } = useEditor();
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = merchantCategoryOptions.find(
    (option) => option.value === merchant.category,
  );

  function handleEditOrDelete(type: Exclude<ContributionAction, "add">) {
    if (!session?.user) {
      const target = searchParams?.size
        ? `${pathname}?${searchParams}`
        : pathname;
      redirect(`/sign-in?redirect=${encodeURIComponent(target)}`);
    }

    openEditorDialog({
      type: "merchant",
      action: type,
      entity: merchant,
      submit: session.user.role === "admin" ? "admin" : "contribution",
    });
  }

  return (
    <>
      <Item variant="outline">
        <ItemMedia>
          <Avatar className="size-10 after:rounded-lg">
            <AvatarImage
              src={merchant.logoUrl}
              className="bg-white p-1 object-contain rounded-lg"
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
          <StatusBadge status={merchant.weroSupport} showLabel />
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
            <DropdownMenuContent align="end" className="w-40">
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
              <DropdownMenuItem onClick={() => handleEditOrDelete("edit")}>
                <Pencil size={14} />
                {session?.user.role === "admin" ? "Edit" : "Suggest Edit"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditOrDelete("delete")}>
                <Trash2 size={14} />
                {session?.user.role === "admin" ? "Delete" : "Suggest Deletion"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </Item>
    </>
  );
}
