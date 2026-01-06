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
} from "./common/prompt.ts";

// Load existing data
if (!(await exists(path.join(rootDir, "data.json")))) {
  error('No existing data found. Run "npm run update" first.');
  process.exit(1);
}

const fileContent = await fs.readFile(path.join(rootDir, "data.json"), "utf-8");
const json = JSON.parse(fileContent);
const data = weroDataSchema.parse(json);

info("Welcome to the bank addition wizard!");

// Ask if adding to existing brand or creating new brand
const brandChoice = await select("What would you like to do?", [
  {
    value: "new-brand",
    label: "Add a new brand with a new bank (if unsure, use this one)",
  },
  {
    value: "existing-brand",
    label:
      "Add a new bank to an existing brand (for example a new Volksbank or Sparda bank)",
  },
]);

let selectedBrand: (typeof data.brands)[number];

if (brandChoice === "existing-brand") {
  // Select existing brand
  const brandId = await select(
    "Select the brand to add a bank to:",
    data.brands.map((brand) => ({
      value: brand.id,
      label: brand.name,
      hint: `${brand.countries.join(", ")} - ${brand.banks.length} bank(s)`,
    }))
  );

  selectedBrand = data.brands.find((b) => b.id === brandId)!;
  info(`Adding a new bank to brand "${selectedBrand.name}".`);
} else {
  // Create new brand
  info("Creating a new brand.");

  const name = await text("Enter the name of the brand:");

  const aliasesInput = await text(
    "Enter brand aliases separated by comma (or leave empty). These will be most likely abbreviations and help with search:"
  );
  const aliases = aliasesInput
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0);

  const weroSupport = await select<SupportStatus>(
    "What is the Wero support status of this brand?",
    [
      {
        value: "supported",
        label: "Supported",
        hint: "Wero is fully supported",
      },
      {
        value: "announced",
        label: "Announced",
        hint: "Wero support has been announced but not yet available",
      },
      {
        value: "unsupported",
        label: "Unsupported",
        hint: "Wero is not supported",
      },
      {
        value: "unknown",
        label: "Unknown",
        hint: "Wero support status is unknown",
      },
    ]
  );

  const countriesInput = await text(
    "Enter 2-letter country codes separated by comma (e.g., DE, FR, BE):"
  );
  const countries = countriesInput
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => c.length === 2);

  if (countries.length === 0) {
    error("At least one valid country code is required.");
    process.exit(1);
  }

  const logoUrlInput = await text("Enter the logo URL of the brand:");
  const logoUrl = await saveAsset(logoUrlInput, crypto.randomUUID());

  selectedBrand = {
    id: crypto.randomUUID(),
    name,
    aliases,
    weroSupport,
    countries,
    logoUrl,
    banks: [],
    apps: [],
  };

  data.brands.push(selectedBrand);
  info(`Created new brand "${name}".`);
}

// Now add the bank
info("Now let's add the bank details.");

const useBankName = await confirm(
  `Do you want to use the same name for the bank as the brand ("${selectedBrand.name}")?`
);
let bankName: string;
if (useBankName) {
  bankName = selectedBrand.name;
} else {
  bankName = await text(
    "Enter the name of the bank (can be the same as the brand):"
  );
}

const bankWebsite = await text(
  "Enter the website URL of the bank without any unnecessary pathname (e.g., https://bank.com):"
);

const bankContextInput = await text("Enter the bank context/BIC:");
const bankContext = bankContextInput.trim();

const bankAliasesInput = await text(
  "Enter bank aliases separated by comma (or leave empty). These will be most likely abbreviations and help with search:"
);
const bankAliases = bankAliasesInput
  .split(",")
  .map((a) => a.trim())
  .filter((a) => a.length > 0);

// Ask for bank-specific countries if different from brand
const useBrandCountries = await confirm(
  `Use the same countries as the brand (${selectedBrand.countries.join(", ")})?`
);

let bankCountries: string[];
if (useBrandCountries) {
  bankCountries = selectedBrand.countries;
} else {
  bankCountries = await multiselect(
    "Select the countries this bank operates in:",
    [
      ...selectedBrand.countries.map((country) => ({
        value: country,
        label: country,
      })),
    ]
  );
}

// Ask for bank-specific logo
const useBrandLogo = await confirm("Use the same logo as the brand?");

let bankLogoUrl: string;
if (useBrandLogo) {
  bankLogoUrl = selectedBrand.logoUrl;
} else {
  const bankLogoInput = await text("Enter the logo URL for this bank:");
  bankLogoUrl = await saveAsset(bankLogoInput, crypto.randomUUID());
}

// Support statuses
const standaloneAppSupport = await select<SupportStatus>(
  "What is the standalone Wero app support status?",
  [
    { value: "supported", label: "Supported" },
    { value: "announced", label: "Announced" },
    { value: "unsupported", label: "Unsupported" },
    { value: "unknown", label: "Unknown" },
  ]
);

const P2PPaymentsSupport = await select<SupportStatus>(
  "What is the P2P (peer to peer) payments support status?",
  [
    { value: "supported", label: "Supported" },
    { value: "announced", label: "Announced" },
    { value: "unsupported", label: "Unsupported" },
    { value: "unknown", label: "Unknown" },
  ]
);

const eCommercePaymentsSupport = await select<SupportStatus>(
  "What is the e-commerce payments support status?",
  [
    { value: "supported", label: "Supported" },
    { value: "announced", label: "Announced" },
    { value: "unsupported", label: "Unsupported" },
    { value: "unknown", label: "Unknown" },
  ]
);

const POSPaymentsSupport = await select<SupportStatus>(
  "What is the POS (point of sale) payments support status?",
  [
    { value: "supported", label: "Supported" },
    { value: "announced", label: "Announced" },
    { value: "unsupported", label: "Unsupported" },
    { value: "unknown", label: "Unknown" },
  ]
);

// Create the new bank
const newBank = {
  id: crypto.randomUUID(),
  name: bankName,
  website: bankWebsite,
  bankContext: bankContext,
  appIds: [] as string[],
  aliases: bankAliases,
  countries: bankCountries,
  ...(bankLogoUrl && { logoUrl: bankLogoUrl }),
  standaloneAppSupport,
  P2PPaymentsSupport,
  eCommercePaymentsSupport,
  POSPaymentsSupport,
};

// Handle app assignment
if (selectedBrand.apps.length > 0) {
  const assignExistingApps = await confirm(
    "Do you want to assign existing apps from this brand to the new bank?"
  );

  if (assignExistingApps) {
    const selectedAppIds = await multiselect(
      "Select the apps this bank supports:",
      selectedBrand.apps.map((app) => ({
        value: app.id,
        label: app.name,
      }))
    );
    newBank.appIds.push(...selectedAppIds);
  }
}

// Ask if user wants to add a new app
const addNewApp = await confirm(
  "Do you want to add a new banking app for this bank?"
);

if (addNewApp) {
  const newApp: WeroApp = {
    id: crypto.randomUUID(),
    name: "",
    iconUrl: "",
    universalLink: "",
    supportsDesktop: false,
    weroSupport: "unknown",
  };

  newApp.name = await text("Enter the name of the banking app:");

  const appIconUrl = await text("Enter the icon URL of the banking app:");
  newApp.iconUrl = await saveAsset(appIconUrl, crypto.randomUUID());

  newApp.universalLink = await text(
    "Enter the universal link where users can download the app:"
  );

  newApp.supportsDesktop = await confirm(
    `Does the app "${newApp.name}" support desktop?`
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

  selectedBrand.apps.push(newApp);
  newBank.appIds.push(newApp.id);

  // If there are other banks in the brand, ask if they should also get this app
  if (selectedBrand.banks.length > 0) {
    const assignToOtherBanks = await confirm(
      "Do you want to assign this new app to other banks in this brand?"
    );

    if (assignToOtherBanks) {
      const selectedBankIds = await multiselect(
        `Which other banks should also have the app "${newApp.name}"?`,
        selectedBrand.banks.map((bank) => ({
          value: bank.id,
          label: bank.name,
        }))
      );

      for (const bankId of selectedBankIds) {
        const bank = selectedBrand.banks.find((b) => b.id === bankId);
        if (bank && !bank.appIds.includes(newApp.id)) {
          bank.appIds.push(newApp.id);
        }
      }
    }
  }

  info(`Added new app "${newApp.name}".`);
}

// Add the bank to the brand
selectedBrand.banks.push(newBank);

// Sort brands by name
data.brands.sort((a, b) => a.name.localeCompare(b.name));

// Save the data
await fs.writeFile(
  path.join(rootDir, "data.json"),
  JSON.stringify(data, null, 2),
  "utf-8"
);

success(
  `Successfully added bank "${bankName}" to brand "${selectedBrand.name}"!`
);
info(`Brand ID: ${selectedBrand.id}`);
info(`Bank ID: ${newBank.id}`);
