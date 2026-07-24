export const RECENCY_THRESHOLD_DAYS = 7;

export type RecencyStatus = "new" | "updated" | null;

export function getRecencyStatus(
  createdAt: Date,
  updatedAt: Date,
): RecencyStatus {
  const thresholdMs = RECENCY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();

  if (now - createdAt.getTime() < thresholdMs) {
    return "new";
  }

  if (now - updatedAt.getTime() < thresholdMs) {
    return "updated";
  }

  return null;
}
