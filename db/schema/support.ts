import { pgEnum } from "drizzle-orm/pg-core";
import z from "zod";

export const supportStatuses = pgEnum("support_statuses", [
  "supported",
  "announced",
  "unsupported",
  "unknown",
]);
export type SupportStatus = (typeof supportStatuses.enumValues)[number];
export const supportStatusesSchema = z.enum(supportStatuses.enumValues);
