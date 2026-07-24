import { cn } from "@/lib/utils";
import { getRecencyStatus } from "@/lib/recency-helper";

interface RecencyBadgeProps {
  createdAt: Date;
  updatedAt: Date;
  className?: string;
}

/**
 * Small pill badge shown in the top right corner of a card to indicate
 * that the entity was recently added or recently updated.
 */
export function RecencyBadge({
  createdAt,
  updatedAt,
  className,
}: RecencyBadgeProps) {
  const status = getRecencyStatus(createdAt, updatedAt);

  if (!status) {
    return null;
  }

  return (
    <span
      className={cn(
        "absolute -top-2 -right-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm ring-1 ring-black/5",
        status === "new"
          ? "bg-status-supported text-white"
          : "bg-blue-500 text-white",
        className,
      )}
    >
      {status === "new" ? "New" : "Updated"}
    </span>
  );
}
