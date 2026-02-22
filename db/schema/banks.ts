import {
  boolean,
  index,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { supportStatuses } from "./support";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const banks = pgTable(
  "banks",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    aliases: json("aliases").$type<string[]>().default([]).notNull(),
    website: text("website").notNull(),
    weroSupport: supportStatuses("wero_support").notNull(),
    countries: json("countries").$type<string[]>().default([]).notNull(),
    logoUrl: text("logo_url").notNull(),
    p2pPaymentsSupport: supportStatuses("p2p_payments_support").notNull(),
    eCommercePaymentsSupport: supportStatuses(
      "e_commerce_payments_support",
    ).notNull(),
    posPaymentsSupport: supportStatuses("pos_payments_support").notNull(),
    standaloneAppSupport: supportStatuses("standalone_app_support").notNull(),
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
export const newBankSchema = createInsertSchema(banks);

export const bankingApps = pgTable(
  "banking_apps",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    bankId: uuid("bank_id")
      .notNull()
      .references(() => banks.id, { onDelete: "cascade" }),
    iconUrl: text("icon_url").notNull(),
    universalLink: text("universal_link").notNull(),
    supportsDesktop: boolean("supports_desktop").notNull(),
    weroSupport: supportStatuses("wero_support").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("banking_apps_updated_at_idx").on(table.updatedAt)],
);
export type BankingApp = typeof bankingApps.$inferSelect;
export type NewBankingApp = typeof bankingApps.$inferInsert;
export const newBankingAppSchema = createInsertSchema(bankingApps);

export const banksRelations = relations(banks, ({ many }) => ({
  bankingApps: many(bankingApps),
}));

export const bankingAppsRelations = relations(bankingApps, ({ one }) => ({
  bank: one(banks, {
    fields: [bankingApps.bankId],
    references: [banks.id],
  }),
}));
