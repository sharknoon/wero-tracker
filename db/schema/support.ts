import { pgEnum } from "drizzle-orm/pg-core";
import z from "zod";

export const supportStatuses = pgEnum("support_statuses", [
  "supported",
  "supported-via-bizum",
  "supported-via-bancomat",
  "supported-via-mb-way",
  "supported-via-vipps",
  "supported-via-mobilepay",
  "supported-via-blik",
  "supported-via-iris",
  "announced",
  "announced-via-bizum",
  "announced-via-bancomat",
  "announced-via-mb-way",
  "announced-via-vipps",
  "announced-via-mobilepay",
  "announced-via-blik",
  "announced-via-iris",
  "unsupported",
  "unknown",
]);
export type SupportStatus = (typeof supportStatuses.enumValues)[number];
export const supportStatusesSchema = z.enum(supportStatuses.enumValues);
