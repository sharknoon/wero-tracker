import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge, StatusDot } from "./status-badge";
import { Check, ChevronDown, ExternalLink, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bank, Brand, SupportStatus, WeroData } from "@/lib/schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface BrandCardProps {
  brand: Brand;
  weroApp: WeroData["standaloneAppResource"];
}

export function BrandCard({ brand, weroApp }: BrandCardProps) {
  const [selectedBank, setSelectedBank] = useState<Bank>(brand.banks[0]);
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-10 rounded-lg">
              <AvatarImage
                src={selectedBank.logoUrl ?? brand.logoUrl}
                className="bg-white p-1 object-contain"
              />
              <AvatarFallback className="rounded-lg">
                {brand.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className="font-semibold text-foreground truncate"
                  title={brand.name}
                >
                  {brand.name}
                </h3>
                {selectedBank.website && (
                  <a
                    href={selectedBank.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              {brand.banks.length > 1 && (
                <BankSelectorComboBox
                  banks={brand.banks}
                  selectedBank={selectedBank.id}
                  setSelectedBank={(id) =>
                    setSelectedBank(brand.banks.find((bank) => bank.id === id)!)
                  }
                />
              )}
            </div>
          </div>
          <StatusBadge status={brand.weroSupport} sources={[]} showLabel />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Features Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Payment Features
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <FeatureItem label="P2P" status={selectedBank.P2PPaymentsSupport} />
            <FeatureItem
              label="eCommerce"
              status={selectedBank.eCommercePaymentsSupport}
            />
            <FeatureItem label="POS" status={selectedBank.POSPaymentsSupport} />
          </div>
        </div>

        {/* App Availability */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            App Availability
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <AppBadge
              iconUrl={weroApp.iconUrl}
              name={weroApp.name}
              status={selectedBank.standaloneAppSupport}
              link={weroApp.universalLink}
            />
            {selectedBank.appIds.map((appId) => {
              const app = brand.apps.find((a) => a.id === appId);
              if (!app) return null;
              return (
                <AppBadge
                  key={app.id}
                  iconUrl={app.iconUrl}
                  name={app.name}
                  status={app.weroSupport}
                  link={app.universalLink}
                />
              );
            })}
            {selectedBank.appIds.length === 0 && (
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

function BankSelectorComboBox({
  banks,
  selectedBank,
  setSelectedBank,
}: {
  banks: Bank[];
  selectedBank: Bank["id"];
  setSelectedBank: (id: Bank["id"]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex gap-1 items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors">
          {selectedBank
            ? banks.find((bank) => bank.id === selectedBank)?.name
            : "Select bank..."}
          <ChevronDown className="opacity-50 size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 sm:w-96 p-0">
        <Command>
          <CommandInput placeholder="Search bank..." className="h-9" />
          <CommandList>
            <CommandEmpty>No bank found.</CommandEmpty>
            <CommandGroup>
              {banks.map((bank) => (
                <CommandItem
                  key={bank.id}
                  value={bank.id}
                  keywords={[bank.name]}
                  onSelect={(currentValue) => {
                    setSelectedBank(currentValue);
                    setOpen(false);
                  }}
                >
                  {bank.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedBank === bank.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
      <Avatar className="size-8 rounded-lg">
        <AvatarImage src={iconUrl} className="bg-white p-1 object-contain" />
        <AvatarFallback className="rounded-lg">
          {name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs">{name}</span>
      <StatusDot status={status} />
    </a>
  );
}
