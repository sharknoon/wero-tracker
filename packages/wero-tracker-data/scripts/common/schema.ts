import zod from "zod";

export const supportStatusSchema = zod.enum([
  "supported",
  "announced",
  "unsupported",
  "unknown",
]);
export type SupportStatus = zod.infer<typeof supportStatusSchema>;

export const weroDataSchema = zod.strictObject({
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
        })
      ),
      apps: zod.array(
        zod.strictObject({
          id: zod.uuid(),
          name: zod.string(),
          iconUrl: zod.url(),
          universalLink: zod.url(),
          supportsDesktop: zod.boolean(),
          weroSupport: supportStatusSchema,
        })
      ),
    })
  ),
  standaloneAppResource: zod.strictObject({
    name: zod.string(),
    iconUrl: zod.url(),
    universalLink: zod.url(),
  }),
});
export type WeroData = zod.infer<typeof weroDataSchema>;
export type WeroBrand = WeroData["brands"][number];
export type WeroApp = WeroBrand["apps"][number];
