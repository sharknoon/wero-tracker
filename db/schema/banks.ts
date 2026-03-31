import {
  index,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  SupportStatus,
  supportStatuses,
  supportStatusesSchema,
} from "@/db/schema/support";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

export const banks = pgTable(
  "banks",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    aliases: json("aliases").$type<string[]>().default([]).notNull(),
    website: text("website").notNull(),
    countries: json("countries").$type<string[]>().default([]).notNull(),
    logoUrl: text("logo_url").notNull(),
    logoChecksum: text("logo_checksum").notNull(),
    p2pPaymentsSupport: supportStatuses("p2p_payments_support").notNull(),
    eCommercePaymentsSupport: supportStatuses(
      "e_commerce_payments_support",
    ).notNull(),
    posPaymentsSupport: supportStatuses("pos_payments_support").notNull(),
    standaloneAppSupport: supportStatuses("standalone_app_support").notNull(),
    bankingApps: json("banking_apps")
      .$type<
        {
          id: string;
          name: string;
          iconUrl: string;
          iconChecksum: string;
          universalLink: string;
          weroSupport: SupportStatus;
        }[]
      >()
      .default([])
      .notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("banks_updated_at_idx").on(table.updatedAt)],
);
export type Bank = typeof banks.$inferSelect;
export type NewBank = typeof banks.$inferInsert;
export const newBankSchema = createInsertSchema(banks).extend({
  bankingApps: z.array(
    z.strictObject({
      id: z.string(),
      name: z.string(),
      iconUrl: z.url(),
      iconChecksum: z.string(),
      universalLink: z.url(),
      weroSupport: supportStatusesSchema,
    }),
  ),
});
