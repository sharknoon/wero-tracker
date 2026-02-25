"use client";

import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge, StatusDot } from "./status-badge";
import { NotesText } from "./notes-text";
import {
  ExternalLink,
  Landmark,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContribution } from "@/lib/contribution-context";
import { WeroData } from "@/app/page";
import { SupportStatus } from "@/db/schema/support";
import { redirect, usePathname, useSearchParams } from "next/navigation";
import { ContributionAction } from "@/db/schema/contributions";

interface BankItemProps {
  bank: WeroData["banks"][number];
}

export function Bankitem({ bank }: BankItemProps) {
  const { openContributionDialog } = useContribution();
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleEditOrDelete(type: Exclude<ContributionAction, "add">) {
    if (!session?.user) {
      redirect(
        `/sign-in?redirect=${encodeURIComponent(pathname + (searchParams ? "?" + searchParams.toString() : ""))}`,
      );
    }

    openContributionDialog({
      type: "bank",
      action: type,
      entity: bank,
    });
  }

  return (
    <Card className="bg-transparent py-4">
      <CardHeader className="px-4">
        <div className="flex items-start gap-3 overflow-hidden">
          <Avatar className="size-10 rounded-lg">
            <AvatarImage
              src={bank.logoUrl}
              className="bg-white p-1 object-contain"
            />
            <AvatarFallback className="rounded-lg">
              {bank.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 grow self-center">
            <div className="flex items-center gap-2">
              <h3
                className="font-semibold text-foreground truncate"
                title={bank.name}
              >
                {bank.name}
              </h3>
              {bank.notes && <NotesText notes={bank.notes} />}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={bank.weroSupport} showLabel />
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
                <DropdownMenuItem asChild>
                  <a
                    href={bank.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={14} />
                    Open Website
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditOrDelete("edit")}>
                  <Pencil size={14} />
                  Suggest Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditOrDelete("delete")}>
                  <Trash2 size={14} />
                  Suggest Deletion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 space-y-4">
        {/* Features Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Payment Features
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <FeatureItem label="P2P" status={bank.p2pPaymentsSupport} />
            <FeatureItem
              label="eCommerce"
              status={bank.eCommercePaymentsSupport}
            />
            <FeatureItem label="POS" status={bank.posPaymentsSupport} />
          </div>
        </div>

        {/* App Availability */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            App Availability
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <AppBadge
              iconUrl="/wero-app.png"
              name="Wero"
              status={bank.standaloneAppSupport}
              link="https://app.weropay.eu/"
            />
            {bank.bankingApps.map((bankingApp) => (
              <AppBadge
                key={bankingApp.id}
                iconUrl={bankingApp.iconUrl}
                name={bankingApp.name}
                status={bankingApp.weroSupport}
                link={bankingApp.universalLink}
              />
            ))}
            {bank.bankingApps.length === 0 && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm flex-1 bg-secondary/50 text-muted-foreground",
                )}
              >
                <div className="bg-white size-8 rounded-lg grid place-items-center">
                  <Landmark size={20} />
                </div>
                <span className="text-xs">Banking App</span>
                <StatusDot status={"unsupported"} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureItem({
  label,
  status,
}: {
  label: string;
  status: SupportStatus;
}) {
  return (
    <div className="flex flex-col justify-between items-center gap-1.5 rounded-lg bg-secondary/50 p-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <StatusBadge status={status} size="sm" />
    </div>
  );
}

function AppBadge({
  iconUrl,
  name,
  status,
  link,
}: {
  iconUrl: string;
  name: string;
  status: SupportStatus;
  link: string;
}) {
  return (
    <a
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm flex-1 bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors",
      )}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Avatar className="size-8 rounded-lg shrink-0">
        <AvatarImage src={iconUrl} className="bg-white object-contain" />
        <AvatarFallback className="rounded-lg">
          {name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs truncate">{name}</span>
      <StatusDot status={status} className="shrink-0" />
    </a>
  );
}
