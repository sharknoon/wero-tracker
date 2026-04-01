import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CircleCheck, CircleX, Clock, Flag, Store } from "lucide-react";
import { euCountries } from "@/lib/constants";
import { WeroData } from "@/app/page";

interface StatsOverviewProps {
  data: WeroData;
  activeView: "banks" | "merchants";
}

export function StatsOverview({ data, activeView }: StatsOverviewProps) {
  const bankStats = useMemo(() => {
    const supportedBanks = data.banks.filter(
      (b) => b.weroSupport === "supported",
    );
    const announcedBanks = data.banks.filter(
      (b) => b.weroSupport === "announced",
    );

    const supportedBankCountries = supportedBanks.reduce((acc, bank) => {
      bank.countries.forEach((country) => acc.add(country));
      return acc;
    }, new Set<string>());

    const announcedBankCountries = announcedBanks.reduce((acc, bank) => {
      bank.countries.forEach((country) => acc.add(country));
      return acc;
    }, new Set<string>());

    const additionallyAnnouncedBankCountries = Array.from(
      announcedBankCountries,
    ).filter((country) => !supportedBankCountries.has(country));

    return [
      {
        label: "Countries",
        value: supportedBankCountries.size,
        subtext: `of ${euCountries.length} countries (+${additionallyAnnouncedBankCountries.length} announced)`,
        icon: Flag,
        color: "text-primary",
      },
      {
        label: "Supported Banks",
        value: supportedBanks.length,
        subtext: `${data.banks.length > 0 ? Math.round((supportedBanks.length / data.banks.length) * 100) : 0}% of tracked banks (${data.banks.length} total)`,
        icon: CircleCheck,
        color: "text-status-supported",
      },
      {
        label: "Announced Banks",
        value: announcedBanks.length,
        subtext: "that have announced support, but not yet launched",
        icon: Clock,
        color: "text-status-announced",
      },
      {
        label: "Unsupported Banks",
        value:
          data.banks.length - supportedBanks.length - announcedBanks.length,
        subtext: `that have not announced support yet`,
        icon: CircleX,
        color: "text-status-unsupported",
      },
    ];
  }, [data.banks]);

  const merchantStats = useMemo(() => {
    const supportedMerchants = data.merchants.filter(
      (m) => m.weroSupport === "supported",
    );
    const announcedMerchants = data.merchants.filter(
      (m) => m.weroSupport === "announced",
    );

    return [
      {
        label: "Total Shops",
        value: data.merchants.length,
        subtext: "online shops tracked",
        icon: Store,
        color: "text-primary",
      },
      {
        label: "Supported Shops",
        value: supportedMerchants.length,
        subtext: `${data.merchants.length > 0 ? Math.round((supportedMerchants.length / data.merchants.length) * 100) : 0}% of tracked shops`,
        icon: CircleCheck,
        color: "text-status-supported",
      },
      {
        label: "Announced Shops",
        value: announcedMerchants.length,
        subtext: "that have announced support, but not yet launched",
        icon: Clock,
        color: "text-status-announced",
      },
      {
        label: "Unsupported Shops",
        value:
          data.merchants.length -
          supportedMerchants.length -
          announcedMerchants.length,
        subtext: `that have not announced support yet`,
        icon: CircleX,
        color: "text-status-unsupported",
      },
    ];
  }, [data.merchants]);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {(activeView === "banks" ? bankStats : merchantStats).map((stat) => (
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
