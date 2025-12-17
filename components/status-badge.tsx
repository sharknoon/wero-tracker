import { cn } from "@/lib/utils";
import type { SupportStatus, SourceLink } from "@/lib/types";
import {
  Check,
  ExternalLink,
  Info,
  CircleCheck,
  Clock,
  CircleX,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatusBadgeProps {
  status: SupportStatus;
  sources?: SourceLink[];
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
  none: {
    label: "Not Available",
    icon: CircleX,
    className: "bg-status-none/20 text-status-none border-status-none/30",
  },
};

export function StatusBadge({
  status,
  sources,
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

  if (!sources?.length && !notes) {
    return badge;
  }

  return (
    <TooltipProvider>
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
            {sources && sources.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium">Sources:</p>
                {sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs hover:underline"
                  >
                    <ExternalLink size={10} />
                    {source.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function StatusDot({ status }: { status: SupportStatus }) {
  const colorClasses: Record<SupportStatus, string> = {
    supported: "bg-status-supported",
    announced: "bg-status-announced",
    none: "bg-status-none",
  };

  return (
    <span
      className={cn("inline-block size-2 rounded-full", colorClasses[status])}
    />
  );
}
