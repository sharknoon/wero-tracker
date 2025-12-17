import type { Bank } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge, StatusDot } from "./status-badge";
import { ExternalLink, Smartphone, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BankCardProps {
  bank: Bank;
}

export function BankCard({ bank }: BankCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground font-semibold text-sm shrink-0">
              {bank.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {bank.name}
                </h3>
                {bank.website && (
                  <a
                    href={bank.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Updated {new Date(bank.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>
          <StatusBadge
            status={bank.overallStatus}
            sources={bank.statusSources}
            showLabel
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Features Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Payment Features
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <FeatureItem label="P2P" feature={bank.features.p2p} />
            <FeatureItem
              label="Online"
              feature={bank.features.onlinePayments}
            />
            <FeatureItem label="Local" feature={bank.features.localPayments} />
          </div>
        </div>

        {/* App Availability */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            App Availability
          </h4>
          <div className="flex gap-3">
            <AppBadge
              icon={Smartphone}
              label="Wero App"
              feature={bank.appAvailability.weroApp}
            />
            <AppBadge
              icon={Building2}
              label="Bank App"
              feature={bank.appAvailability.bankingApp}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureItem({
  label,
  feature,
}: {
  label: string;
  feature: Bank["features"]["p2p"];
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg bg-secondary/50 p-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <StatusBadge
        status={feature.status}
        sources={feature.sources}
        notes={feature.notes}
        size="sm"
      />
    </div>
  );
}

function AppBadge({
  icon: Icon,
  label,
  feature,
}: {
  icon: typeof Smartphone;
  label: string;
  feature: Bank["appAvailability"]["weroApp"];
}) {
  const isAvailable = feature.status === "supported";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm flex-1",
        isAvailable
          ? "bg-status-supported/10 text-status-supported"
          : "bg-secondary/50 text-muted-foreground",
      )}
    >
      <Icon size={16} />
      <span className="text-xs">{label}</span>
      <StatusDot status={feature.status} />
    </div>
  );
}
