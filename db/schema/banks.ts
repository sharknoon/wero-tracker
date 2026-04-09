import {
  index,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { SupportStatus, supportStatusesSchema } from "@/db/schema/support";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

export type CountryOverride<T> = {
  default: T;
} & {
  [countryCode: string]: T;
};

export const banks = pgTable(
  "banks",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    aliases: json("aliases").$type<string[]>().default([]).notNull(),
    website: json("website").$type<CountryOverride<string>>().notNull(),
    countries: json("countries").$type<string[]>().default([]).notNull(),
    logoUrl: text("logo_url").notNull(),
    logoChecksum: text("logo_checksum").notNull(),
    p2pPaymentsSupport: json("p2p_payments_support")
      .$type<CountryOverride<SupportStatus>>()
      .notNull(),
    eCommercePaymentsSupport: json("e_commerce_payments_support")
      .$type<CountryOverride<SupportStatus>>()
      .notNull(),
    posPaymentsSupport: json("pos_payments_support")
      .$type<CountryOverride<SupportStatus>>()
      .notNull(),
    standaloneAppSupport: json("standalone_app_support")
      .$type<CountryOverride<SupportStatus>>()
      .notNull(),
    bankingApps: json("banking_apps")
      .$type<
        {
          id: string;
          name: string;
          iconUrl: string;
          iconChecksum: string;
          universalLink: CountryOverride<string>;
          weroSupport: CountryOverride<SupportStatus>;
          supportedCountries: string[];
        }[]
      >()
      .default([])
      .notNull(),
    notes: json("notes").$type<CountryOverride<string | null>>().notNull(),
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
export type BankingApp = Bank["bankingApps"][number];
function countryOverrideSchema<T>(valueSchema: z.ZodType<T>) {
  return z
    .strictObject({
      default: valueSchema,
    })
    .catchall(valueSchema)
    .refine(
      (obj) =>
        Object.keys(obj).every((k) => k === "default" || /^[A-Z]{2}$/.test(k)),
      { message: "Additional keys must be 2-letter country codes" },
    );
}
const baseBankSchema = createInsertSchema(banks).extend({
  website: countryOverrideSchema(z.url()),
  p2pPaymentsSupport: countryOverrideSchema(supportStatusesSchema),
  eCommercePaymentsSupport: countryOverrideSchema(supportStatusesSchema),
  posPaymentsSupport: countryOverrideSchema(supportStatusesSchema),
  standaloneAppSupport: countryOverrideSchema(supportStatusesSchema),
  bankingApps: z.array(
    z.strictObject({
      id: z.string(),
      name: z.string(),
      iconUrl: z.url(),
      iconChecksum: z.string(),
      universalLink: countryOverrideSchema(z.url()),
      weroSupport: countryOverrideSchema(supportStatusesSchema),
      supportedCountries: z.array(z.string().regex(/^[A-Z]{2}$/)).min(1),
    }),
  ),
  notes: countryOverrideSchema(z.string().nullable()),
});
const bankRefinement = z.superRefine<
  Omit<NewBank, "id" | "createdAt" | "updatedAt">
>((bank, ctx) => {
  const countries = bank.countries ?? [];

  // Check that all country-specific overrides only contain countries in the bank's countries list
  const overrideFields = {
    website: "websites",
    p2pPaymentsSupport: "P2P payment support entries",
    eCommercePaymentsSupport: "eCommerce payment support entries",
    posPaymentsSupport: "POS payment support entries",
    standaloneAppSupport: "standalone Wero app support entries",
    notes: "notes",
  } as const;

  for (const [field, label] of Object.entries(overrideFields)) {
    if (
      !Object.keys(bank[field as keyof typeof overrideFields])
        .filter((k) => k !== "default")
        .every((c) => countries.includes(c))
    ) {
      ctx.addIssue({
        code: "custom",
        message: `All country-specific ${label} must be in the countries list`,
      });
    }
  }

  // Check that all banking app overrides only contain countries in the app's supportedCountries
  for (const app of bank.bankingApps ?? []) {
    if (
      !Object.keys(app.universalLink)
        .filter((k) => k !== "default")
        .every((c) => app.supportedCountries.includes(c))
    ) {
      ctx.addIssue({
        code: "custom",
        message: `Banking app "${app.name}" has universal link overrides for countries not in its supported countries list`,
      });
    }
    if (
      !Object.keys(app.weroSupport)
        .filter((k) => k !== "default")
        .every((c) => app.supportedCountries.includes(c))
    ) {
      ctx.addIssue({
        code: "custom",
        message: `Banking app "${app.name}" has wero support overrides for countries not in its supported countries list`,
      });
    }
  }

  // Check that all banking app supported countries are in the bank's countries list
  if (
    !(bank.bankingApps ?? [])
      .flatMap((a) => a.supportedCountries)
      .every((c) => countries.includes(c))
  ) {
    ctx.addIssue({
      code: "custom",
      message:
        "All banking app supported countries must be in the bank's countries list",
    });
  }
});
export const newBankSchema = baseBankSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .check(bankRefinement);
export const updateBankSchema = baseBankSchema
  .omit({ createdAt: true, updatedAt: true })
  .check(bankRefinement);
