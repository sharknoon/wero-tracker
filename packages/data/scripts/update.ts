import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import zod from "zod";
import {
  type Bank,
  type BanksData,
  bankBrandsSchema,
} from "./common/schema.ts";
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

const ecommerceSchema = zod.array(
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
        appIds: zod.array(
          zod.union([zod.uuid(), zod.literal("STANDALONE_APP_ID")])
        ),
        aliases: zod.array(zod.string()).optional(),
        countries: zod.array(zod.string().length(2)).optional(),
        logoUrl: zod.url(),
        supportsStandaloneApp: zod.boolean(),
        fieldTesting: zod.boolean(),
        supportedPaymentUseCases: zod.array(
          zod.union([
            zod.literal("SingleP2P"),
            zod.literal("SingleImmediatePayments"),
            zod.literal("EventDependentPayments"),
          ])
        ),
        apps: zod.array(
          zod.strictObject({
            id: zod.union([zod.uuid(), zod.literal("STANDALONE_APP_ID")]),
            name: zod.string(),
            iconUrl: zod.url(),
            universalLink: zod.url(),
            useCases: zod
              .array(zod.union([zod.literal("ecom"), zod.literal("mcom")]))
              .optional(),
            supportsDesktop: zod.boolean().optional(),
            bankName: zod.string(),
          })
        ),
      })
    ),
    // Yes, I know, somehow Wero decided to have two duplicate app lists
    apps: zod.array(
      zod.strictObject({
        id: zod.union([zod.uuid(), zod.literal("STANDALONE_APP_ID")]),
        name: zod.string(),
        iconUrl: zod.url(),
        universalLink: zod.url(),
        useCases: zod
          .array(zod.union([zod.literal("ecom"), zod.literal("mcom")]))
          .default([]),
        supportsDesktop: zod.boolean().optional(),
      })
    ),
  })
);

const p2pData = await fetch(process.env.DATA_WERO_P2P_API_URL ?? "").then(
  (res) => res.json()
);
const ecommerceData = await fetch(
  process.env.DATA_WERO_ECOM_API_URL ?? ""
).then((res) => res.json());

const p2pResult = await p2pSchema.safeParseAsync(p2pData);
const ecommerceResult = await ecommerceSchema.safeParseAsync(ecommerceData);

if (!p2pResult.success) {
  error(zod.prettifyError(p2pResult.error));
  process.exit(1);
}
if (!ecommerceResult.success) {
  error(zod.prettifyError(ecommerceResult.error));
  process.exit(1);
}

const weroData = p2pResult.data.data;

export let existingBanksData: BanksData = {
  brands: [],
  standaloneAppResource: { name: "", iconUrl: "", universalLink: "" },
};

if (await exists(path.join(rootDir, "banks.json"))) {
  const fileContent = await fs.readFile(
    path.join(rootDir, "banks.json"),
    "utf-8"
  );
  const data = JSON.parse(fileContent);
  existingBanksData = bankBrandsSchema.parse(data);
}

const banksData: BanksData = {
  brands: [],
  standaloneAppResource: {
    name: weroData.standaloneAppResource.name,
    iconUrl: await saveAsset(weroData.standaloneAppResource.iconUrl),
    universalLink: weroData.standaloneAppResource.universalLink,
  },
};

for (const brand of weroData.brands) {
  const existingBrandData = existingBanksData.brands.find(
    (b) => b.id === brand.id
  );
  const banks: Bank[] = [];
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
        existingBankData?.eCommercePaymentsSupport ??
        ecommerceResult.data!.some((br) =>
          br.banks.some((ba) => ba.id === bank.id)
        )
          ? "supported"
          : "unsupported",
      POSPaymentsSupport: existingBankData?.POSPaymentsSupport ?? "unknown",
    });
  }

  banksData.brands.push({
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
    notes: existingBrandData?.notes ?? "",
  });
}

const weroBrandIds = new Set(weroData.brands.map((b) => b.id));
const additionalBrandIds =
  existingBanksData.brands
    .filter((b) => !weroBrandIds.has(b.id))
    .map((b) => b.id) ?? [];
for (const brandId of additionalBrandIds) {
  const brand = existingBanksData.brands.find((b) => b.id === brandId)!;
  banksData.brands.push(brand);
}

banksData.brands.sort((a, b) => a.name.localeCompare(b.name));

await fs.writeFile(
  path.join(rootDir, "banks.json"),
  JSON.stringify(banksData, null, 2),
  "utf-8"
);

success("Wero bank data updated successfully.");
