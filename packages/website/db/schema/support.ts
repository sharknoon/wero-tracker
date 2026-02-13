import { pgEnum } from "drizzle-orm/pg-core";

export const supportStatuses = pgEnum("support_statuses", [
  "supported",
  "announced",
  "unsupported",
  "unknown",
]);
export type SupportStatus = (typeof supportStatuses.enumValues)[number];
