import zod from "zod";

export const supportStatusSchema = zod.enum([
  "supported",
  "announced",
  "unsupported",
  "unknown",
]);
export type SupportStatus = zod.infer<typeof supportStatusSchema>;

export const dataSchema = zod.strictObject({
  banks: zod.strictObject({
    brands: zod.array(
      zod.strictObject({
        id: zod.uuid(),
        name: zod.string(),
        aliases: zod.array(zod.string()),
        weroSupport: supportStatusSchema,
        countries: zod.array(zod.string().length(2)),
        logoUrl: zod.url(),
        banks: zod.array(
          zod.strictObject({
            id: zod.uuid(),
            name: zod.string(),
            website: zod.url(),
            bankContext: zod.string().optional(),
            appIds: zod.array(zod.string()),
            aliases: zod.array(zod.string()).default([]),
            countries: zod.array(zod.string().length(2)).optional(),
            logoUrl: zod.url().optional(),
            standaloneAppSupport: supportStatusSchema,
            P2PPaymentsSupport: supportStatusSchema,
            eCommercePaymentsSupport: supportStatusSchema,
            POSPaymentsSupport: supportStatusSchema,
          }),
        ),
        apps: zod.array(
          zod.strictObject({
            id: zod.uuid(),
            name: zod.string(),
            iconUrl: zod.url(),
            universalLink: zod.url(),
            supportsDesktop: zod.boolean(),
            weroSupport: supportStatusSchema,
          }),
        ),
      }),
    ),
    standaloneAppResource: zod.strictObject({
      name: zod.string(),
      iconUrl: zod.url(),
      universalLink: zod.url(),
    }),
  }),
  merchants: zod.strictObject({
    brands: zod.array(
      zod.strictObject({
        id: zod.uuid(),
        name: zod.string(),
        aliases: zod.array(zod.string()),
        website: zod.url(),
        logoUrl: zod.url(),
        category: zod.enum([
          "fashion",
          "electronics",
          "food-delivery",
          "groceries",
          "travel",
          "entertainment",
          "services",
          "other",
        ]),
        countries: zod.array(zod.string().length(2)),
        weroSupport: supportStatusSchema,
      }),
    ),
  }),
});

export type Data = zod.infer<typeof dataSchema>;
export type BankBrand = Data["banks"]["brands"][number];
export type Bank = Data["banks"]["brands"][number]["banks"][number];
export type BankingApp = Data["banks"]["brands"][number]["apps"][number];
export type MerchantBrand = Data["merchants"]["brands"][number];
export type MerchantCategory = MerchantBrand["category"];

export type Source = {
  label: string;
  url: string;
};
