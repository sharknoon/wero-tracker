import { Card, CardContent } from "@/components/ui/card";
import { CircleCheck, CircleX, Clock, Flag, Landmark } from "lucide-react";
import { WeroData } from "@/lib/schema";

interface StatsOverviewProps {
  data: WeroData;
}

export function StatsOverview({ data }: StatsOverviewProps) {
  const supportedBrands = data.brands.filter(
    (b) => b.weroSupport === "supported",
  );
  const announcedBrands = data.brands.filter(
    (b) => b.weroSupport === "announced",
  );

  const supportedCountries = supportedBrands.reduce((acc, brand) => {
    brand.countries.forEach((country) => acc.add(country));
    return acc;
  }, new Set<string>());
  const announcedCountries = announcedBrands.reduce((acc, brand) => {
    brand.countries.forEach((country) => acc.add(country));
    return acc;
  }, new Set<string>());
  const additionallyAnnouncedCountries = Array.from(announcedCountries).filter(
    (country) => !supportedCountries.has(country),
  );
  const numberOfSupportedBrands = supportedBrands.length;
  const numberOfAnnouncedBrands = announcedBrands.length;
  const euMemberCountries = 27;

  const stats = [
    {
      label: "Countries",
      value: supportedCountries.size,
      subtext: `of ${euMemberCountries} countries (+${additionallyAnnouncedCountries.length} announced)`,
      icon: Flag,
      color: "text-primary",
    },
    {
      label: "Supported Banks",
      value: numberOfSupportedBrands,
      subtext: `${data.brands.length > 0 ? Math.round((numberOfSupportedBrands / data.brands.length) * 100) : 0}% of tracked banks (${data.brands.length} total)`,
      icon: CircleCheck,
      color: "text-status-supported",
    },
    {
      label: "Announced Banks",
      value: numberOfAnnouncedBrands,
      subtext: "that have announced support, but not yet launched",
      icon: Clock,
      color: "text-status-announced",
    },
    {
      label: "Unsupported Banks",
      value:
        data.brands.length - numberOfSupportedBrands - numberOfAnnouncedBrands,
      subtext: `that have not announced support yet`,
      icon: CircleX,
      color: "text-status-unsupported",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtext}
                </p>
              </div>
              <stat.icon className={`${stat.color}`} size={24} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
