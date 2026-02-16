import {
  index,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { Merchant, NewMerchant } from "./merchants";
import {
  Bank,
  BankBrand,
  BankingApp,
  NewBank,
  NewBankBrand,
  NewBankingApp,
} from "./banks";

export const contributionTypes = pgEnum("contribution_types", [
  "bank-brand",
  "merchant",
]);
export type ContributionType = (typeof contributionTypes.enumValues)[number];

export const contributionActions = pgEnum("contribution_actions", [
  "add",
  "edit",
  "delete",
]);
export type ContributionAction =
  (typeof contributionActions.enumValues)[number];

export const contributionStatuses = pgEnum("contribution_statuses", [
  "pending",
  "approved",
  "rejected",
]);
export type ContributionStatus =
  (typeof contributionStatuses.enumValues)[number];

export type AddMerchantContribution = Omit<
  NewMerchant,
  "id" | "createdAt" | "updatedAt"
>;
export type EditOrDeleteMerchantContribution = Omit<
  Merchant,
  "createdAt" | "updatedAt"
>;
export type MerchantContribution =
  | AddMerchantContribution
  | EditOrDeleteMerchantContribution;

export type AddBankBrandContribution = {
  brand: Omit<NewBankBrand, "id" | "createdAt" | "updatedAt">;
  banks: Omit<NewBank, "id" | "createdAt" | "updatedAt">[];
  apps: Omit<NewBankingApp, "id" | "createdAt" | "updatedAt">[];
};
export type EditOrDeleteBankBrandContribution = {
  brand: Omit<BankBrand, "createdAt" | "updatedAt">;
  banks: Omit<Bank, "createdAt" | "updatedAt">[];
  apps: Omit<BankingApp, "createdAt" | "updatedAt">[];
};
export type BankBrandContribution =
  | AddBankBrandContribution
  | EditOrDeleteBankBrandContribution;

export const contributions = pgTable(
  "contributions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: contributionTypes("type").notNull(),
    action: contributionActions("action").notNull(),
    status: contributionStatuses("status").default("pending").notNull(),
    data: json("data")
      .$type<BankBrandContribution | MerchantContribution>()
      .notNull(),
    previousData: json("previous_data").$type<
      BankBrandContribution | MerchantContribution
    >(),
    reason: text("reason"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    reviewerId: text("reviewer_id").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewNote: text("review_note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("contributions_status_idx").on(table.status),
    index("contributions_type_idx").on(table.type),
    index("contributions_user_id_idx").on(table.userId),
    index("contributions_created_at_idx").on(table.createdAt),
  ],
);
export type Contribution = typeof contributions.$inferSelect;
export type NewContribution = typeof contributions.$inferInsert;

export const contributionsRelations = relations(contributions, ({ one }) => ({
  user: one(users, {
    fields: [contributions.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [contributions.reviewerId],
    references: [users.id],
  }),
}));
