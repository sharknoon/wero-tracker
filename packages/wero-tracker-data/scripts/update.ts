import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import zod from "zod";
import { type WeroData, weroDataSchema } from "./common/schema.ts";
import { exists, rootDir } from "./common/fs.ts";
import { saveAsset } from "./common/assets.ts";
import { error, success } from "./common/prompt.ts";

const p2pSchema = zod.strictObject({
  data: zod.strictObject({
    type: zod.literal("p2p"),
    brands: zod.array(
      zod.strictObject({
        id: zod.uuid(),
        name: zod.string(),
        aliases: zod.array(zod.string()),
        countries: zod.array(zod.string().length(2)),
        logoUrl: zod.url(),
        banks: zod.array(
          zod.strictObject({
            id: zod.uuid(),
            name: zod.string(),
            bankContext: zod.string().optional(),
            appIds: zod.array(zod.string()),
            aliases: zod.array(zod.string()).default([]),
            countries: zod.array(zod.string().length(2)).optional(),
            logoUrl: zod.url().optional(),
            supportsStandaloneApp: zod.boolean(),
          })
        ),
        apps: zod.array(
          zod.strictObject({
            id: zod.uuid(),
            name: zod.string(),
            iconUrl: zod.url(),
            universalLink: zod.url(),
            useCases: zod.array(
              zod.union([zod.literal("share"), zod.literal("market")])
            ),
            supportsDesktop: zod.boolean(),
          })
        ),
      })
    ),
    standaloneAppResource: zod.strictObject({
      name: zod.literal("Wero"),
      iconUrl: zod.url(),
      universalLink: zod.literal("https://app.weropay.eu"),
    }),
  }),
});

const p2pData = await fetch(process.env.WERO_API_URL ?? "").then((res) =>
  res.json()
);

const result = await p2pSchema.safeParseAsync(p2pData);

if (!result.success) {
  error(zod.prettifyError(result.error));
  process.exit(1);
}

const weroData = result.data.data;

export let existingData: WeroData = {
  brands: [],
  standaloneAppResource: { name: "", iconUrl: "", universalLink: "" },
};
if (await exists(path.join(rootDir, "data.json"))) {
  const fileContent = await fs.readFile(
    path.join(rootDir, "data.json"),
    "utf-8"
  );
  const data = JSON.parse(fileContent);
  existingData = weroDataSchema.parse(data);
}

const data: WeroData = {
  brands: [],
  standaloneAppResource: {
    name: weroData.standaloneAppResource.name,
    iconUrl: await saveAsset(weroData.standaloneAppResource.iconUrl),
    universalLink: weroData.standaloneAppResource.universalLink,
  },
};

for (const brand of weroData.brands) {
  const existingBrandData = existingData.brands.find((b) => b.id === brand.id);
  const banks = [];
  for (const bank of brand.banks) {
    const existingBankData = existingBrandData?.banks.find(
      (b) => b.id === bank.id
    );

    banks.push({
      id: bank.id,
      name: bank.name,
      website: existingBankData?.website ?? "https://example.com",
      bankContext: bank.bankContext,
      appIds:
        bank.appIds.length === 0 ? existingBankData?.appIds ?? [] : bank.appIds,
      aliases: bank.aliases,
      countries: bank.countries,
      logoUrl: bank.logoUrl ? await saveAsset(bank.logoUrl) : undefined,
      // Could be "announced"
      standaloneAppSupport: bank.supportsStandaloneApp
        ? "supported"
        : existingBankData?.standaloneAppSupport ?? "unsupported",
      P2PPaymentsSupport: "supported" as const,
      eCommercePaymentsSupport:
        existingBankData?.eCommercePaymentsSupport ?? "unknown",
      POSPaymentsSupport: existingBankData?.POSPaymentsSupport ?? "unknown",
    });
  }

  data.brands.push({
    id: brand.id,
    name: brand.name,
    aliases: brand.aliases,
    weroSupport: "supported" as const,
    countries: brand.countries,
    logoUrl: await saveAsset(brand.logoUrl),
    banks,
    apps:
      brand.apps.length === 0
        ? existingBrandData?.apps ?? []
        : await Promise.all(
            brand.apps.map(async (app) => ({
              id: app.id,
              name: app.name,
              iconUrl: await saveAsset(app.iconUrl),
              universalLink: app.universalLink,
              supportsDesktop: app.supportsDesktop,
              weroSupport: "supported",
            }))
          ),
  });
}

const weroBrandIds = new Set(weroData.brands.map((b) => b.id));
const additionalBrandIds =
  existingData.brands.filter((b) => !weroBrandIds.has(b.id)).map((b) => b.id) ??
  [];
for (const brandId of additionalBrandIds) {
  const brand = existingData.brands.find((b) => b.id === brandId)!;
  data.brands.push(brand);
}

data.brands.sort((a, b) => a.name.localeCompare(b.name));

await fs.writeFile(
  path.join(rootDir, "data.json"),
  JSON.stringify(data, null, 2),
  "utf-8"
);

success("Wero data updated successfully.");
