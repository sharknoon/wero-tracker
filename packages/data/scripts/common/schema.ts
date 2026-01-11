import zod from "zod";

export const supportStatusSchema = zod.enum([
  "supported",
  "announced",
  "unsupported",
  "unknown",
]);
export type SupportStatus = zod.infer<typeof supportStatusSchema>;

export const bankSchema = zod.strictObject({
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
});

export const bankingAppSchema = zod.strictObject({
  id: zod.uuid(),
  name: zod.string(),
  iconUrl: zod.url(),
  universalLink: zod.url(),
  supportsDesktop: zod.boolean(),
  weroSupport: supportStatusSchema,
});

export const bankBrandSchema = zod.strictObject({
  id: zod.uuid(),
  name: zod.string(),
  aliases: zod.array(zod.string()),
  weroSupport: supportStatusSchema,
  countries: zod.array(zod.string().length(2)),
  logoUrl: zod.url(),
  banks: zod.array(bankSchema),
  apps: zod.array(bankingAppSchema),
  notes: zod.string().optional(),
});

export const bankBrandsSchema = zod.strictObject({
  brands: zod.array(bankBrandSchema),
  standaloneAppResource: zod.strictObject({
    name: zod.string(),
    iconUrl: zod.url(),
    universalLink: zod.url(),
  }),
});

export const merchantBrandSchema = zod.strictObject({
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
});

export const merchantBrandsSchema = zod.strictObject({
  brands: zod.array(merchantBrandSchema),
});

export const dataSchema = zod.strictObject({
  banks: bankBrandsSchema,
  merchants: merchantBrandsSchema,
});

export type Data = zod.infer<typeof dataSchema>;
export type BanksData = zod.infer<typeof bankBrandsSchema>;
export type MerchantsData = zod.infer<typeof merchantBrandsSchema>;
export type BankBrand = BanksData["brands"][number];
export type Bank = BankBrand["banks"][number];
export type BankingApp = BankBrand["apps"][number];
export type MerchantBrand = MerchantsData["brands"][number];
export type MerchantCategory = MerchantBrand["category"];
