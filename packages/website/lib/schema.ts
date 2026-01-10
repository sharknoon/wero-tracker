import zod from "zod";

export const supportStatusSchema = zod.enum([
  "supported",
  "announced",
  "unsupported",
  "unknown",
]);
export type SupportStatus = zod.infer<typeof supportStatusSchema>;

export const banksSchema = zod.strictObject({
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
      notes: zod.string().optional(),
    }),
  ),
  standaloneAppResource: zod.strictObject({
    name: zod.string(),
    iconUrl: zod.url(),
    universalLink: zod.url(),
  }),
});

export const merchantsSchema = zod.strictObject({
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
      notes: zod.string().optional(),
    }),
  ),
});

export const dataSchema = zod.strictObject({
  banks: banksSchema,
  merchants: merchantsSchema,
});

export type Data = zod.infer<typeof dataSchema>;
export type BanksData = zod.infer<typeof banksSchema>;
export type MerchantsData = zod.infer<typeof merchantsSchema>;
export type BankBrand = BanksData["brands"][number];
export type Bank = BankBrand["banks"][number];
export type BankingApp = BankBrand["apps"][number];
export type MerchantBrand = MerchantsData["brands"][number];
export type MerchantCategory = MerchantBrand["category"];

export type Source = {
  label: string;
  url: string;
};
