import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import {
  type WeroApp,
  weroDataSchema,
  type SupportStatus,
} from "./common/schema.ts";
import { exists, rootDir } from "./common/fs.ts";
import { saveAsset } from "./common/assets.ts";
import {
  confirm,
  error,
  info,
  multiselect,
  select,
  success,
  text,
  warn,
} from "./common/prompt.ts";

async function searchWebsite(
  bankName: string,
  countries: string[]
): Promise<string> {
  const url = new URL(`https://www.googleapis.com/customsearch/v1`);
  url.searchParams.set("key", process.env.GOOGLE_API_KEY ?? "");
  url.searchParams.set("cx", process.env.GOOGLE_CSE_ID ?? "");
  url.searchParams.set("q", `bank ${bankName}`);

  const data = await fetch(url).then((res) => res.json());

  if (data.items.length === 0) {
    return await text(
      `No website found for bank "${bankName}" (${countries.join(
        ", "
      )}). Please enter the website manually: `
    );
  }

  const result = await select(
    `Pick a website for bank "${bankName}" (${countries.join(", ")})`,
    [
      ...data.items.slice(0, 5).flatMap((item: any) => {
        const url = new URL(item.link);
        const urlWithoutPath = `${url.protocol}//${url.hostname}/`;
        return [
          {
            value: urlWithoutPath,
            label: urlWithoutPath,
            hint: item.title ? item.title + " (without Path)" : "",
          },
          {
            value: url,
            label: url,
            hint: item.title || "",
          },
        ];
      }),
      { value: "manual", label: "Enter manually" },
    ]
  );

  if (result === "manual") {
    return await text(
      `Please enter the website for "${bankName}" (${countries.join(", ")}): `
    );
  }

  return String(result);
}

if (!(await exists(path.join(rootDir, "data.json")))) {
  error('No existing data found. Run "npm run update-wero-data" first.');
  process.exit(1);
}

const fileContent = await fs.readFile(path.join(rootDir, "data.json"), "utf-8");
const json = JSON.parse(fileContent);
const data = weroDataSchema.parse(json);

for (const brand of data.brands) {
  // Check for missing websites
  for (const bank of brand.banks) {
    if (
      !bank.website ||
      bank.website.trim() === "" ||
      bank.website.startsWith("https://example.com")
    ) {
      const website = await searchWebsite(
        bank.name,
        bank.countries ?? brand.countries
      );
      bank.website = website;
    }
  }
  // Check for missing apps
  if (brand.apps.length === 0) {
    warn(`Brand "${brand.name}" has no banking apps listed.`);
    const confirmAddApps = await confirm(
      `Does the brand "${brand.name}" (${brand.countries.join(
        ", "
      )}) have any banking apps?`
    );
    if (confirmAddApps) {
      const newApp: WeroApp = {
        id: crypto.randomUUID(),
        name: "",
        iconUrl: "",
        universalLink: "",
        supportsDesktop: false,
        weroSupport: "unknown",
      };
      newApp.name = await text(`Enter the name of the banking app:`);
      const iconUrl = await text(`Enter the icon URL of the banking app:`);
      newApp.iconUrl = await saveAsset(iconUrl, crypto.randomUUID());
      newApp.universalLink = await text(
        `Enter the link where users can download the iOS and Android versions of the banking app (universal link):`
      );
      newApp.supportsDesktop = await confirm(
        `Is the app "${newApp.name}" supported on desktop?`
      );
      newApp.weroSupport = await select<SupportStatus>(
        `Does the app "${newApp.name}" support Wero payments?`,
        [
          { value: "supported", label: "Supported" },
          { value: "announced", label: "Announced" },
          { value: "unsupported", label: "Unsupported" },
          { value: "unknown", label: "Unknown" },
        ]
      );
      brand.apps.push(newApp);

      if (
        brand.banks.length === 1 &&
        !brand.banks[0].appIds.includes(newApp.id)
      ) {
        brand.banks[0].appIds.push(newApp.id);
      }

      if (brand.banks.length >= 2) {
        const selectedBankIds = await multiselect(
          `Which banks of the brand "${brand.name}" support the app "${newApp.name}"?`,
          brand.banks.map((bank) => ({
            value: bank.id,
            label: bank.name,
          }))
        );

        for (const bankId of selectedBankIds) {
          const bank = brand.banks.find((b) => b.id === bankId);
          if (bank && !bank.appIds.includes(newApp.id)) {
            bank.appIds.push(newApp.id);
          }
        }
      }
    }
  }
}

data.brands.sort((a, b) => a.name.localeCompare(b.name));

await fs.writeFile(
  path.join(rootDir, "data.json"),
  JSON.stringify(data, null, 2),
  "utf-8"
);

// Check if there are unused assets
const usedAssets = new Set<string>();
usedAssets.add(
  new URL(data.standaloneAppResource.iconUrl).pathname.split("/").pop()!
);
for (const brand of data.brands) {
  if (brand.logoUrl) {
    usedAssets.add(new URL(brand.logoUrl).pathname.split("/").pop()!);
  }
  for (const bank of brand.banks) {
    if (bank.logoUrl) {
      usedAssets.add(new URL(bank.logoUrl).pathname.split("/").pop()!);
    }
  }
  for (const app of brand.apps) {
    if (app.iconUrl) {
      usedAssets.add(new URL(app.iconUrl).pathname.split("/").pop()!);
    }
  }
}

const allAssets = await fs.readdir(path.join(rootDir, "assets"));
for (const asset of allAssets) {
  if (!usedAssets.has(asset)) {
    warn(`Asset "assets/${asset}" is unused.`);
    const confirmDelete = await confirm(
      `Do you want to delete the unused asset "assets/${asset}"?`
    );
    if (confirmDelete) {
      await fs.unlink(path.join(rootDir, "assets", asset));
      info(`Deleted asset "assets/${asset}".`);
    }
  }
}

success("Linting finished successfully.");
