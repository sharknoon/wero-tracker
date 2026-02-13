import { db } from "@/db";
import {
  bankBrands,
  bankingApps,
  bankingAppsToBanks,
  banks,
  NewBank,
  NewBankBrand,
  NewBankingApp,
  NewBankingAppsToBanks,
} from "@/db/schema/banks";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";
import { PgTable } from "drizzle-orm/pg-core";
import { getTableColumns, sql, type SQL } from "drizzle-orm";
import { toSnakeCase } from "drizzle-orm/casing";
import { put } from "@/lib/s3";

/**
 * Builds an object mapping column names to their excluded values for upsert operations.
 * Automatically includes all columns except the ones specified in excludeColumns.
 * Based on: https://orm.drizzle.team/docs/guides/upsert
 */
export function buildConflictUpdateColumnsExcept<
  T extends PgTable,
  Q extends keyof T["_"]["columns"],
>(table: T, excludeColumns: Q[]) {
  const cls = getTableColumns(table);
  const excludeSet = new Set<string>(excludeColumns as string[]);
  return Object.keys(cls).reduce(
    (acc, column) => {
      if (!excludeSet.has(column)) {
        acc[column] = sql.raw(`excluded.${toSnakeCase(cls[column].name)}`);
      }
      return acc;
    },
    {} as Record<string, SQL>,
  );
}

const p2pSchema = z.strictObject({
  data: z.strictObject({
    type: z.literal("p2p"),
    brands: z.array(
      z.strictObject({
        id: z.uuid(),
        name: z.string(),
        aliases: z.array(z.string()),
        countries: z.array(z.string().length(2)),
        logoUrl: z.url(),
        banks: z.array(
          z.strictObject({
            id: z.uuid(),
            name: z.string(),
            bankContext: z.string().optional(),
            appIds: z.array(z.string()),
            aliases: z.array(z.string()).default([]),
            countries: z.array(z.string().length(2)).optional(),
            logoUrl: z.url().optional(),
            supportsStandaloneApp: z.boolean(),
          }),
        ),
        apps: z.array(
          z.strictObject({
            id: z.uuid(),
            name: z.string(),
            iconUrl: z.url(),
            universalLink: z.url(),
            useCases: z.array(
              z.union([z.literal("share"), z.literal("market")]),
            ),
            supportsDesktop: z.boolean(),
          }),
        ),
      }),
    ),
    standaloneAppResource: z.strictObject({
      name: z.literal("Wero"),
      iconUrl: z.url(),
      universalLink: z.literal("https://app.weropay.eu"),
    }),
  }),
});

const ecommerceSchema = z.array(
  z.strictObject({
    id: z.uuid(),
    name: z.string(),
    aliases: z.array(z.string()),
    countries: z.array(z.string().length(2)),
    logoUrl: z.url(),
    banks: z.array(
      z.strictObject({
        id: z.uuid(),
        name: z.string(),
        bankContext: z.string().optional(),
        appIds: z.array(z.union([z.uuid(), z.literal("STANDALONE_APP_ID")])),
        aliases: z.array(z.string()).optional(),
        countries: z.array(z.string().length(2)).optional(),
        logoUrl: z.url(),
        supportsStandaloneApp: z.boolean(),
        fieldTesting: z.boolean(),
        supportedPaymentUseCases: z.array(
          z.union([
            z.literal("SingleP2P"),
            z.literal("SingleImmediatePayments"),
            z.literal("EventDependentPayments"),
          ]),
        ),
        apps: z.array(
          z.strictObject({
            id: z.union([z.uuid(), z.literal("STANDALONE_APP_ID")]),
            name: z.string(),
            iconUrl: z.url(),
            universalLink: z.url(),
            useCases: z
              .array(z.union([z.literal("ecom"), z.literal("mcom")]))
              .optional(),
            supportsDesktop: z.boolean().optional(),
            bankName: z.string(),
          }),
        ),
      }),
    ),
    // Yes, I know, somehow Wero decided to have two duplicate app lists
    apps: z.array(
      z.strictObject({
        id: z.union([z.uuid(), z.literal("STANDALONE_APP_ID")]),
        name: z.string(),
        iconUrl: z.url(),
        universalLink: z.url(),
        useCases: z
          .array(z.union([z.literal("ecom"), z.literal("mcom")]))
          .default([]),
        supportsDesktop: z.boolean().optional(),
      }),
    ),
  }),
);

async function mirrorUrl(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  return await put(url.split("/").pop()!, uint8Array, {
    access: "public",
  });
}

export async function GET() {
  const apiSecret = process.env.API_SECRET;
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const providedSecret = authHeader?.replace(/Bearer\s+/i, "").trim();

  if (!apiSecret || providedSecret !== apiSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const p2pApiUrl = "https://start.weropay.eu/api/brands";
  const ecommerceApiUrl = "https://pay.weropay.eu/api/brands";

  const rawP2pData = await fetch(p2pApiUrl).then((res) => res.json());
  const rawEcommerceData = await fetch(ecommerceApiUrl).then((res) =>
    res.json(),
  );

  const p2pResult = await p2pSchema.safeParseAsync(rawP2pData);
  const ecommerceResult =
    await ecommerceSchema.safeParseAsync(rawEcommerceData);

  if (!p2pResult.success) {
    const error = z.prettifyError(p2pResult.error);
    return NextResponse.json(
      { error: "Invalid P2P data", details: error },
      {
        status: 500,
      },
    );
  }
  if (!ecommerceResult.success) {
    const error = z.prettifyError(ecommerceResult.error);
    return NextResponse.json(
      { error: "Invalid eCommerce data", details: error },
      {
        status: 500,
      },
    );
  }

  const p2pData = p2pResult.data.data;
  const ecommerceData = ecommerceResult.data;

  await db.transaction(async (tx) => {
    const brandsToUpsert: Map<string, NewBankBrand> = new Map();
    const appsToUpsert: Map<string, NewBankingApp> = new Map();
    const banksToUpsert: Map<string, NewBank> = new Map();
    const appsToBankRelationsToUpsert: Map<string, NewBankingAppsToBanks> =
      new Map();

    for (const brand of p2pData.brands) {
      brandsToUpsert.set(brand.id, {
        id: brand.id,
        name: brand.name,
        aliases: brand.aliases,
        weroSupport: "supported",
        countries: brand.countries,
        logoUrl: await mirrorUrl(brand.logoUrl),
      });

      for (const app of brand.apps) {
        appsToUpsert.set(app.id, {
          id: app.id,
          name: app.name,
          iconUrl: await mirrorUrl(app.iconUrl),
          universalLink: app.universalLink,
          supportsDesktop: app.supportsDesktop,
          weroSupport: "supported",
        });
      }

      // Upsert banks for this brand
      for (const bank of brand.banks) {
        // Find matching ecommerce bank data
        const ecommerceBankData = ecommerceData
          .flatMap((brand) => brand.banks)
          .find((bank) => bank.id === bank.id);

        // Get existing bank data for preserving manual fields
        const existingBank = await tx.query.banks.findFirst({
          where: eq(banks.id, bank.id),
        });

        banksToUpsert.set(bank.id, {
          id: bank.id,
          name: bank.name,
          brandId: brand.id,
          website: existingBank?.website || "https://example.com",
          bankContext: bank.bankContext,
          aliases: bank.aliases,
          countries: bank.countries,
          logoUrl: bank.logoUrl ? await mirrorUrl(bank.logoUrl) : undefined,
          standaloneAppSupport: bank.supportsStandaloneApp
            ? "supported"
            : existingBank?.standaloneAppSupport || "unsupported",
          p2pPaymentsSupport: "supported",
          eCommercePaymentsSupport:
            ecommerceBankData?.supportedPaymentUseCases.includes(
              "SingleImmediatePayments",
            )
              ? "supported"
              : "unsupported",
          posPaymentsSupport: existingBank?.posPaymentsSupport || "unknown",
        });

        for (const appId of bank.appIds) {
          appsToBankRelationsToUpsert.set(`${bank.id}-${appId}`, {
            bankId: bank.id,
            appId: appId,
          });
        }
      }
    }

    // Upsert the bank brand
    await tx
      .insert(bankBrands)
      .values(Array.from(brandsToUpsert.values()))
      .onConflictDoUpdate({
        target: bankBrands.id,
        set: buildConflictUpdateColumnsExcept(bankBrands, ["id"]),
      });

    // Upsert the banking apps
    await tx
      .insert(bankingApps)
      .values(Array.from(appsToUpsert.values()))
      .onConflictDoUpdate({
        target: bankingApps.id,
        set: buildConflictUpdateColumnsExcept(bankingApps, ["id"]),
      });

    // Upsert the banks
    await tx
      .insert(banks)
      .values(Array.from(banksToUpsert.values()))
      .onConflictDoUpdate({
        target: banks.id,
        set: buildConflictUpdateColumnsExcept(banks, ["id", "website"]),
      });

    // Upsert the bankingAppsToBanks
    await tx
      .insert(bankingAppsToBanks)
      .values(Array.from(appsToBankRelationsToUpsert.values()))
      .onConflictDoNothing();
  });

  return NextResponse.json({
    success: true,
  });
}
