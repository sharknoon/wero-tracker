import {
  boolean,
  index,
  json,
  pgTable,
  text,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { supportStatuses } from "./support";
import { relations } from "drizzle-orm";

export const bankBrands = pgTable(
  "bank_brands",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    aliases: json("aliases").$type<string[]>().default([]).notNull(),
    weroSupport: supportStatuses("wero_support").notNull(),
    countries: json("countries").$type<string[]>().default([]).notNull(),
    logoUrl: text("logo_url").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("bank_brands_updated_at_idx").on(table.updatedAt)],
);
export type BankBrand = typeof bankBrands.$inferSelect;
export type NewBankBrand = typeof bankBrands.$inferInsert;

export const banks = pgTable(
  "banks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => bankBrands.id, { onDelete: "cascade" }),
    website: text("website").notNull(),
    bankContext: text("bank_context"),
    aliases: json("aliases").$type<string[]>().default([]).notNull(),
    countries: json("countries").$type<string[]>().default([]).notNull(),
    logoUrl: text("logo_url"),
    standaloneAppSupport: supportStatuses("standalone_app_support").notNull(),
    p2pPaymentsSupport: supportStatuses("p2p_payments_support").notNull(),
    eCommercePaymentsSupport: supportStatuses(
      "e_commerce_payments_support",
    ).notNull(),
    posPaymentsSupport: supportStatuses("pos_payments_support").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("banks_brandId_idx").on(table.brandId),
    index("banks_updated_at_idx").on(table.updatedAt),
  ],
);
export type Bank = typeof banks.$inferSelect;
export type NewBank = typeof banks.$inferInsert;

export const bankingApps = pgTable(
  "banking_apps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
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

export const bankingAppsToBanks = pgTable(
  "banking_apps_to_banks",
  {
    bankId: uuid("bank_id")
      .notNull()
      .references(() => banks.id, { onDelete: "cascade" }),
    appId: uuid("app_id")
      .notNull()
      .references(() => bankingApps.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.bankId, t.appId] })],
);
export type BankingAppsToBanks = typeof bankingAppsToBanks.$inferSelect;
export type NewBankingAppsToBanks = typeof bankingAppsToBanks.$inferInsert;

export const bankBrandsRelations = relations(bankBrands, ({ many }) => ({
  banks: many(banks),
}));

export const banksRelations = relations(banks, ({ one, many }) => ({
  brand: one(bankBrands, {
    fields: [banks.brandId],
    references: [bankBrands.id],
  }),
  bankingAppsToBanks: many(bankingAppsToBanks),
}));

export const bankingAppsRelations = relations(bankingApps, ({ many }) => ({
  bankingAppsToBanks: many(bankingAppsToBanks),
}));

export const bankingAppsToBanksRelations = relations(
  bankingAppsToBanks,
  ({ one }) => ({
    bank: one(banks, {
      fields: [bankingAppsToBanks.bankId],
      references: [banks.id],
    }),
    bankingApp: one(bankingApps, {
      fields: [bankingAppsToBanks.appId],
      references: [bankingApps.id],
    }),
  }),
);
