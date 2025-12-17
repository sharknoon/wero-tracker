import type { WeroData } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, CheckCircle, Clock, Globe } from "lucide-react"

interface StatsOverviewProps {
  data: WeroData
}

export function StatsOverview({ data }: StatsOverviewProps) {
  const totalBanks = data.countries.reduce((acc, c) => acc + c.banks.length, 0)
  const supportedBanks = data.countries.reduce(
    (acc, c) => acc + c.banks.filter((b) => b.overallStatus === "supported").length,
    0,
  )
  const announcedBanks = data.countries.reduce(
    (acc, c) => acc + c.banks.filter((b) => b.overallStatus === "announced").length,
    0,
  )
  const countriesWithSupport = data.countries.filter((c) => c.banks.some((b) => b.overallStatus === "supported")).length

  const stats = [
    {
      label: "Countries",
      value: data.countries.length,
      subtext: `${countriesWithSupport} with active support`,
      icon: Globe,
      color: "text-primary",
    },
    {
      label: "Total Banks",
      value: totalBanks,
      subtext: "Tracked institutions",
      icon: Building2,
      color: "text-accent",
    },
    {
      label: "Supported",
      value: supportedBanks,
      subtext: `${Math.round((supportedBanks / totalBanks) * 100)}% of tracked banks`,
      icon: CheckCircle,
      color: "text-status-supported",
    },
    {
      label: "Announced",
      value: announcedBanks,
      subtext: "Coming soon",
      icon: Clock,
      color: "text-status-announced",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
              </div>
              <stat.icon className={`${stat.color} opacity-50`} size={24} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
