import { cn } from "@/lib/utils";
import {
  Check,
  CircleCheck,
  Clock,
  CircleX,
  CircleQuestionMark,
} from "lucide-react";
import { SupportStatus } from "@/db/schema/support";

interface StatusBadgeProps {
  status: SupportStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  SupportStatus,
  {
    label: string;
    icon: typeof Check;
    colorCSSVar: string;
  }
> = {
  supported: {
    label: "Supported",
    icon: CircleCheck,
    colorCSSVar: "--status-supported",
  },
  announced: {
    label: "Announced",
    icon: Clock,
    colorCSSVar: "--status-announced",
  },
  unsupported: {
    label: "Not Available",
    icon: CircleX,
    colorCSSVar: "--status-unsupported",
  },
  unknown: {
    label: "Unknown",
    icon: CircleQuestionMark,
    colorCSSVar: "--status-unknown",
  },
};

export function StatusBadge({
  status,
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

  return (
    <div
      className="flex flex-col outline rounded-md overflow-hidden my-px"
      style={{
        outlineColor: `var(${config.colorCSSVar})`,
        backgroundColor: `var(${config.colorCSSVar})`,
      }}
    >
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 outline rounded-md",
          showLabel ? "" : sizeClasses[size],
        )}
        style={{
          outlineColor: `var(${config.colorCSSVar})`,
          backgroundColor: `color-mix(in oklab, var(${config.colorCSSVar}) 37%, black)`,
          color: `var(${config.colorCSSVar})`,
        }}
      >
        <Icon size={iconSizes[size]} />
        {showLabel && <span>{config.label}</span>}
      </div>
      {/*partner && (status === "announced" || status === "supported") && (
        <div
          className="flex justify-center items-center px-2 py-0.5 text-[10px]"
          style={{
            color: `color-mix(in oklab, var(${config.colorCSSVar}) 37%, black)`,
          }}
        >
          <span>via&nbsp;</span>
          <Image
            src={`/${partner.icon}`}
            alt={partner.label}
            width={12}
            height={12}
            className="bg-white rounded-[3px]"
          />
          <span>&nbsp;{partner.label}</span>
        </div>
      )*/}
    </div>
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
