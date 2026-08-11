import {
  index,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { supportStatuses } from "./support";
import { createInsertSchema } from "drizzle-zod";

export const categories = pgEnum("categories", [
  "fashion",
  "electronics",
  "food-delivery",
  "groceries",
  "travel",
  "entertainment",
  "services",
  "public-sector",
  "other",
]);
export type MerchantCategory = (typeof categories.enumValues)[number];

export const merchants = pgTable(
  "merchants",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    aliases: json().$type<string[]>().default([]).notNull(),
    website: text("website").notNull(),
    logoUrl: text("logo_url").notNull(),
    logoChecksum: text("logo_checksum").notNull(),
    category: categories("category").notNull(),
    weroSupport: supportStatuses("wero_support").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("merchants_updated_at_idx").on(table.updatedAt)],
);
export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;
export const newMerchantSchema = createInsertSchema(merchants);
