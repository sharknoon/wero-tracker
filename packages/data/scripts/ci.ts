import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import {
  bankBrandsSchema,
  merchantBrandsSchema,
  merchantBrandSchema,
  bankBrandSchema,
  bankSchema,
  bankingAppSchema,
} from "./common/schema.ts";
import { exists, rootDir } from "./common/fs.ts";
import zod from "zod";
import { saveAsset } from "./common/assets.ts";

// ============================================================================
// TYPE DEFINITIONS FOR JSON INPUT
// ============================================================================

const contributionSchema = zod
  .strictObject({
    contribution: zod.union([
      zod.strictObject({
        id: zod.uuid(),
        type: zod.literal("bank-brand"),
        action: zod.literal("add"),
        reason: zod.string().optional(),
        data: bankBrandSchema
          .omit({ id: true, banks: true, apps: true })
          .extend({
            banks: zod.array(bankSchema.omit({ id: true })),
            apps: zod.array(bankingAppSchema.omit({ id: true })),
          }),
      }),
      zod.strictObject({
        id: zod.uuid(),
        type: zod.literal("bank-brand"),
        action: zod.enum(["edit", "delete"]),
        reason: zod.string(),
        data: bankBrandSchema,
      }),
      zod.strictObject({
        id: zod.uuid(),
        type: zod.literal("merchant"),
        action: zod.literal("add"),
        reason: zod.string().optional(),
        data: merchantBrandSchema.omit({ id: true }),
      }),
      zod.strictObject({
        id: zod.uuid(),
        type: zod.literal("merchant"),
        action: zod.enum(["edit", "delete"]),
        reason: zod.string(),
        data: merchantBrandSchema,
      }),
    ]),
    timestamp: zod.string(),
  })
  .refine();

// ============================================================================
// MAIN LOGIC
// ============================================================================

// Load existing data
if (!(await exists(path.join(rootDir, "banks.json")))) {
  console.error('No existing banks data found. Run "npm run update" first.');
  process.exit(1);
}
if (!(await exists(path.join(rootDir, "merchants.json")))) {
  await fs.writeFile(
    path.join(rootDir, "merchants.json"),
    JSON.stringify({ brands: [] }, null, 2),
    "utf-8"
  );
}

const banksFileContent = await fs.readFile(
  path.join(rootDir, "banks.json"),
  "utf-8"
);
const banksJson = JSON.parse(banksFileContent);
const banksData = bankBrandsSchema.parse(banksJson);

const merchantsFileContent = await fs.readFile(
  path.join(rootDir, "merchants.json"),
  "utf-8"
);
const merchantsJson = JSON.parse(merchantsFileContent);
const merchantsData = merchantBrandsSchema.parse(merchantsJson);

// Check if JSON input is provided via command line argument
const jsonInput = process.argv[2];

if (!jsonInput) {
  console.error(
    "No JSON input provided. Please provide contribution data as JSON."
  );
  process.exit(1);
}

const assetCache = new Map<string, string>();
const saveAssetCached = async (url: string) => {
  if (assetCache.has(url)) {
    return assetCache.get(url)!;
  }
  const savedUrl = await saveAsset(url, crypto.randomUUID());
  assetCache.set(url, savedUrl);
  return savedUrl;
};

try {
  const payload = JSON.parse(jsonInput);
  const { contribution } = contributionSchema.parse(payload);
  const { type, action, data } = contribution;

  if (type === "merchant") {
    if (action === "add") {
      const newMerchant = {
        ...data,
        id: crypto.randomUUID(),
        logoUrl: await saveAsset(data.logoUrl, crypto.randomUUID()),
      };
      merchantsData.brands.push(newMerchant);
    } else if (action === "edit") {
      const index = merchantsData.brands.findIndex((b) => b.id === data.id);
      if (index === -1) {
        console.error(`Merchant with ID "${data.id}" not found.`);
        process.exit(1);
      }
      merchantsData.brands[index] = {
        ...data,
        logoUrl:
          merchantsData.brands[index].logoUrl === data.logoUrl
            ? data.logoUrl
            : await saveAsset(data.logoUrl, crypto.randomUUID()),
      };
    } else if (action === "delete") {
      const index = merchantsData.brands.findIndex((b) => b.id === data.id);
      if (index === -1) {
        console.error(`Merchant with ID "${data.id}" not found.`);
        process.exit(1);
      }
      await fs.rm(
        path.join(
          rootDir,
          "assets",
          path.basename(merchantsData.brands[index].logoUrl)
        )
      );
      merchantsData.brands.splice(index, 1);
    }

    merchantsData.brands.sort((a, b) => a.name.localeCompare(b.name));
    const validatedMerchantsData = merchantBrandsSchema.parse(merchantsData);
    await fs.writeFile(
      path.join(rootDir, "merchants.json"),
      JSON.stringify(validatedMerchantsData, null, 2) + "\n",
      "utf-8"
    );
  } else if (type === "bank-brand") {
    if (action === "add") {
      const newBankBrand = {
        ...data,
        id: crypto.randomUUID(),
        logoUrl: await saveAssetCached(data.logoUrl),
        banks: await Promise.all(
          data.banks.map(async (bank) => ({
            ...bank,
            id: crypto.randomUUID(),
            logoUrl: bank.logoUrl
              ? await saveAssetCached(bank.logoUrl)
              : undefined,
          }))
        ),
        apps: await Promise.all(
          data.apps.map(async (app) => ({
            ...app,
            id: crypto.randomUUID(),
            iconUrl: await saveAssetCached(app.iconUrl),
          }))
        ),
      };
      // Add app ids to banks
      const appIds = Array.from(
        new Set(newBankBrand.apps.map((app) => app.id))
      );
      for (const bank of newBankBrand.banks) {
        bank.appIds = appIds;
      }
      banksData.brands.push(newBankBrand);
    } else if (action === "edit") {
      const index = banksData.brands.findIndex((b) => b.id === data.id);
      if (index === -1) {
        console.error(`Bank brand with ID "${data.id}" not found.`);
        process.exit(1);
      }
      banksData.brands[index] = {
        ...data,
        logoUrl:
          banksData.brands[index].logoUrl === data.logoUrl
            ? data.logoUrl
            : await saveAssetCached(data.logoUrl),
        banks: await Promise.all(
          data.banks.map(async (bank) => {
            const existingBank = banksData.brands[index].banks.find(
              (b) => b.id === bank.id
            );
            return {
              ...bank,
              logoUrl:
                existingBank && existingBank.logoUrl === bank.logoUrl
                  ? bank.logoUrl
                  : bank.logoUrl
                  ? await saveAssetCached(bank.logoUrl)
                  : undefined,
            };
          })
        ),
        apps: await Promise.all(
          data.apps.map(async (app) => {
            const existingApp = banksData.brands[index].apps.find(
              (a) => a.id === app.id
            );
            return {
              ...app,
              iconUrl:
                existingApp && existingApp.iconUrl === app.iconUrl
                  ? app.iconUrl
                  : await saveAssetCached(app.iconUrl),
            };
          })
        ),
      };
    } else if (action === "delete") {
      const index = banksData.brands.findIndex((b) => b.id === data.id);
      if (index === -1) {
        console.error(`Bank brand with ID "${data.id}" not found.`);
        process.exit(1);
      }
      await fs.rm(
        path.join(
          rootDir,
          "assets",
          path.basename(banksData.brands[index].logoUrl)
        )
      );
      for (const bank of banksData.brands[index].banks) {
        if (bank.logoUrl) {
          await fs.rm(
            path.join(rootDir, "assets", path.basename(bank.logoUrl))
          );
        }
      }
      for (const app of banksData.brands[index].apps) {
        await fs.rm(path.join(rootDir, "assets", path.basename(app.iconUrl)));
      }
      banksData.brands.splice(index, 1);
    }

    banksData.brands.sort((a, b) => a.name.localeCompare(b.name));
    const validatedBanksData = bankBrandsSchema.parse(banksData);
    await fs.writeFile(
      path.join(rootDir, "banks.json"),
      JSON.stringify(validatedBanksData, null, 2) + "\n",
      "utf-8"
    );
  } else {
    console.error(`Unknown contribution type: ${type}`);
    process.exit(1);
  }
} catch (err) {
  console.error(`Failed to parse JSON input: ${err}`);
  process.exit(1);
}
