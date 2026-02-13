import { cn } from "@/lib/utils";
import {
  Check,
  Info,
  CircleCheck,
  Clock,
  CircleX,
  CircleQuestionMark,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SupportStatus } from "@/db/schema/support";

interface StatusBadgeProps {
  status: SupportStatus;
  notes?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  SupportStatus,
  { label: string; icon: typeof Check; className: string }
> = {
  supported: {
    label: "Supported",
    icon: CircleCheck,
    className:
      "bg-status-supported/20 text-status-supported border-status-supported/30",
  },
  announced: {
    label: "Announced",
    icon: Clock,
    className:
      "bg-status-announced/20 text-status-announced border-status-announced/30",
  },
  unsupported: {
    label: "Not Available",
    icon: CircleX,
    className:
      "bg-status-unsupported/20 text-status-unsupported border-status-unsupported/30",
  },
  unknown: {
    label: "Unknown",
    icon: CircleQuestionMark,
    className:
      "bg-status-unknown/20 text-status-unknown border-status-unknown/30",
  },
};

export function StatusBadge({
  status,
  notes,
  showLabel = false,
  size = "md",
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "min-w-5 h-5 text-xs",
    md: "min-w-6 h-6 text-sm",
    lg: "min-w-8 h-8 text-base",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const badge = (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-medium",
        config.className,
        showLabel ? "" : sizeClasses[size],
      )}
    >
      <Icon size={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );

  if (!notes) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-help">{badge}</div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-2">
          {notes && (
            <p className="flex items-center gap-2 text-sm">
              <Info size={14} />
              {notes}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function StatusDot({
  status,
  className,
}: {
  status: SupportStatus;
  className?: string;
}) {
  const colorClasses: Record<SupportStatus, string> = {
    supported: "bg-status-supported",
    announced: "bg-status-announced",
    unsupported: "bg-status-unsupported",
    unknown: "bg-status-unknown",
  };

  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        colorClasses[status],
        className,
      )}
    />
  );
}
