import { cn } from "@/lib/utils";
import {
  Check,
  CircleCheck,
  Clock,
  CircleX,
  CircleQuestionMark,
} from "lucide-react";
import { SupportStatus } from "@/db/schema/support";
import { partnerSystemOptions, PartnerSystem } from "@/lib/constants";
import Image from "next/image";
import {
  baseStatus,
  BaseSupportStatus,
  parseStatus,
} from "@/lib/status-helper";

interface StatusBadgeProps {
  status: SupportStatus;
  compact?: boolean;
}

const statusConfig: Record<
  BaseSupportStatus,
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

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const { base, partner } = parseStatus(status);
  const config = statusConfig[base];
  const partnerInfo = partner
    ? partnerSystemOptions[partner as PartnerSystem]
    : undefined;
  const Icon = config.icon;

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
          compact ? "min-w-5 h-5 text-xs" : "min-w-6 h-6 text-sm",
        )}
        style={{
          outlineColor: `var(${config.colorCSSVar})`,
          backgroundColor: `color-mix(in oklab, var(${config.colorCSSVar}) 37%, black)`,
          color: `var(${config.colorCSSVar})`,
        }}
      >
        <Icon size={compact ? 12 : 14} />
        {compact && partnerInfo && (
          <>
            <span className="text-[10px]">via </span>
            <Image
              src={`/${partnerInfo.icon}`}
              alt={partnerInfo.label}
              width={12}
              height={12}
              className="bg-white rounded-[3px]"
            />
          </>
        )}
        {!compact && <span>{config.label}</span>}
      </div>
      {!compact &&
        partnerInfo &&
        (base === "announced" || base === "supported") && (
          <div
            className="flex justify-center items-center px-2 py-0.5 text-[10px]"
            style={{
              color: `color-mix(in oklab, var(${config.colorCSSVar}) 37%, black)`,
            }}
          >
            <span>via&nbsp;</span>
            <Image
              src={`/${partnerInfo.icon}`}
              alt={partnerInfo.label}
              width={12}
              height={12}
              className="bg-white rounded-[3px]"
            />
            <span>&nbsp;{partnerInfo.label}</span>
          </div>
        )}
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
  const colorClasses: Record<BaseSupportStatus, string> = {
    supported: "bg-status-supported",
    announced: "bg-status-announced",
    unsupported: "bg-status-unsupported",
    unknown: "bg-status-unknown",
  };

  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        colorClasses[baseStatus(status)],
        className,
      )}
    />
  );
}
