import { SupportStatus } from "@/db/schema/support";

export type BaseSupportStatus = Extract<
  SupportStatus,
  "supported" | "announced" | "unsupported" | "unknown"
>;

/** Extract the base status and optional partner system from a compound status. */
export function parseStatus(status: SupportStatus): {
  base: BaseSupportStatus;
  partner?: string;
} {
  const match = status.match(/^(supported|announced)-via-(.+)$/);
  if (match) return { base: match[1] as BaseSupportStatus, partner: match[2] };
  return { base: status as BaseSupportStatus };
}

/** Return just the base status (supported, announced, unsupported, unknown). */
export function baseStatus(status: SupportStatus): BaseSupportStatus {
  return parseStatus(status).base;
}
