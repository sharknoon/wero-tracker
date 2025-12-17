import { cn } from "@/lib/utils"
import type { SupportStatus, SourceLink } from "@/lib/types"
import { Check, Clock, Calendar, Minus, ExternalLink } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StatusBadgeProps {
  status: SupportStatus
  sources?: SourceLink[]
  notes?: string
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

const statusConfig: Record<SupportStatus, { label: string; icon: typeof Check; className: string }> = {
  supported: {
    label: "Supported",
    icon: Check,
    className: "bg-status-supported/20 text-status-supported border-status-supported/30",
  },
  announced: {
    label: "Announced",
    icon: Calendar,
    className: "bg-status-announced/20 text-status-announced border-status-announced/30",
  },
  "coming-soon": {
    label: "Coming Soon",
    icon: Clock,
    className: "bg-status-coming/20 text-status-coming border-status-coming/30",
  },
  none: {
    label: "Not Available",
    icon: Minus,
    className: "bg-status-none/20 text-status-none border-status-none/30",
  },
}

export function StatusBadge({ status, sources, notes, showLabel = false, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: "h-5 w-5 text-xs",
    md: "h-6 w-6 text-sm",
    lg: "h-8 w-8 text-base",
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }

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
  )

  if (!sources?.length && !notes) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{badge}</div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-card border-border">
          <div className="space-y-2">
            {notes && <p className="text-sm text-muted-foreground">{notes}</p>}
            {sources && sources.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Sources:</p>
                {sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
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
  )
}

export function StatusDot({ status }: { status: SupportStatus }) {
  const colorClasses: Record<SupportStatus, string> = {
    supported: "bg-status-supported",
    announced: "bg-status-announced",
    "coming-soon": "bg-status-coming",
    none: "bg-status-none",
  }

  return <span className={cn("inline-block h-2 w-2 rounded-full", colorClasses[status])} />
}
