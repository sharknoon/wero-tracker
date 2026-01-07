import { Card, CardContent } from "@/components/ui/card";
import { CircleCheck, CircleX, Clock, Flag, Store } from "lucide-react";
import { Data } from "@/lib/schema";

interface StatsOverviewProps {
  data: Data;
  activeView: "banks" | "merchants";
}

export function StatsOverview({ data, activeView }: StatsOverviewProps) {
  const supportedBanks =
    activeView === "banks"
      ? data.banks.brands.filter((b) => b.weroSupport === "supported")
      : [];
  const announcedBanks =
    activeView === "banks"
      ? data.banks.brands.filter((b) => b.weroSupport === "announced")
      : [];

  const supportedMerchants =
    activeView === "merchants"
      ? data.merchants.brands.filter((m) => m.weroSupport === "supported")
      : [];
  const announcedMerchants =
    activeView === "merchants"
      ? data.merchants.brands.filter((m) => m.weroSupport === "announced")
      : [];

  const supportedBankCountries =
    activeView === "banks"
      ? supportedBanks.reduce((acc, brand) => {
          brand.countries.forEach((country) => acc.add(country));
          return acc;
        }, new Set<string>())
      : new Set<string>();

  const announcedBankCountries =
    activeView === "banks"
      ? announcedBanks.reduce((acc, brand) => {
          brand.countries.forEach((country) => acc.add(country));
          return acc;
        }, new Set<string>())
      : new Set<string>();

  const additionallyAnnouncedBankCountries = Array.from(
    announcedBankCountries,
  ).filter((country) => !supportedBankCountries.has(country));
  const numberOfSupportedBanks = supportedBanks.length;
  const numberOfAnnouncedBanks = announcedBanks.length;
  const numberOfSupportedMerchants = supportedMerchants.length;
  const numberOfAnnouncedMerchants = announcedMerchants.length;
  const euMemberCountries = 27;

  const bankStats = [
    {
      label: "Countries",
      value: supportedBankCountries.size,
      subtext: `of ${euMemberCountries} countries (+${additionallyAnnouncedBankCountries.length} announced)`,
      icon: Flag,
      color: "text-primary",
    },
    {
      label: "Supported Banks",
      value: numberOfSupportedBanks,
      subtext: `${data.banks.brands.length > 0 ? Math.round((numberOfSupportedBanks / data.banks.brands.length) * 100) : 0}% of tracked banks (${data.banks.brands.length} total)`,
      icon: CircleCheck,
      color: "text-status-supported",
    },
    {
      label: "Announced Banks",
      value: numberOfAnnouncedBanks,
      subtext: "that have announced support, but not yet launched",
      icon: Clock,
      color: "text-status-announced",
    },
    {
      label: "Unsupported Banks",
      value:
        data.banks.brands.length -
        numberOfSupportedBanks -
        numberOfAnnouncedBanks,
      subtext: `that have not announced support yet`,
      icon: CircleX,
      color: "text-status-unsupported",
    },
  ];

  const merchantStats = [
    {
      label: "Total Shops",
      value: data.merchants.brands.length,
      subtext: "online shops tracked",
      icon: Store,
      color: "text-primary",
    },
    {
      label: "Supported Shops",
      value: numberOfSupportedMerchants,
      subtext: `${data.merchants.brands.length > 0 ? Math.round((numberOfSupportedMerchants / data.merchants.brands.length) * 100) : 0}% of tracked shops`,
      icon: CircleCheck,
      color: "text-status-supported",
    },
    {
      label: "Announced Shops",
      value: numberOfAnnouncedMerchants,
      subtext: "that have announced support, but not yet launched",
      icon: Clock,
      color: "text-status-announced",
    },
    {
      label: "Unsupported Shops",
      value:
        data.merchants.brands.length -
        numberOfSupportedMerchants -
        numberOfAnnouncedMerchants,
      subtext: `that have not announced support yet`,
      icon: CircleX,
      color: "text-status-unsupported",
    },
  ];

  const stats = activeView === "banks" ? bankStats : merchantStats;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
              <stat.icon className={`${stat.color}`} size={24} />
            </div>

            <p className={`-mt-2 text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
