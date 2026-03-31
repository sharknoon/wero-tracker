import { db } from "@/db";
import { Bank, banks } from "@/db/schema/banks";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";
import { PgTable } from "drizzle-orm/pg-core";
import { getTableColumns, sql, type SQL } from "drizzle-orm";
import { toSnakeCase } from "drizzle-orm/casing";
import { createBankContribution } from "@/actions/contribution-actions";
import { deepEqual } from "@/lib/myutils";
import { downloadFile } from "@/lib/download";

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

export async function GET() {
  const cronSecret = process.env.CRON_SECRET;
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const providedSecret = authHeader?.replace(/Bearer\s+/i, "").trim();

  if (!cronSecret || providedSecret !== cronSecret) {
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

  const banksToUpsert: Map<
    string,
    {
      existing: boolean;
      bank: Omit<Bank, "createdAt" | "updatedAt">;
    }
  > = new Map();

  for (const brand of p2pData.brands) {
    if (brand.banks.length > 0) {
      const firstBank = brand.banks[0];

      // Find matching ecommerce bank data
      const ecommerceBankData = ecommerceData
        .flatMap((b) => b.banks)
        .find((b) => b.id === firstBank.id);

      // Get existing bank data for preserving manual fields
      const existingBank = await db.query.banks.findFirst({
        where: eq(banks.id, brand.id),
        columns: {
          createdAt: false,
          updatedAt: false,
        },
      });

      // Merge apps
      const existingApps = existingBank?.bankingApps || [];
      const newApps = await Promise.all(
        brand.apps.map(async (app) => {
          const existingApp = existingApps.find((a) => a.id === app.id);

          const newIconChecksum = (await downloadFile(app.iconUrl)).checksum;
          const existingIconChecksum = existingApp?.iconChecksum;
          const iconChanged = newIconChecksum !== existingIconChecksum;

          return {
            id: app.id,
            name: app.name,
            iconUrl: iconChanged
              ? app.iconUrl
              : (existingApp?.iconUrl ?? app.iconUrl),
            iconChecksum: iconChanged
              ? newIconChecksum
              : (existingApp?.iconChecksum ?? newIconChecksum),
            universalLink: app.universalLink,
            supportsDesktop: app.supportsDesktop,
            weroSupport: "supported" as const,
          };
        }),
      );

      const existingAppIds = new Set(existingApps.map((app) => app.id));
      const mergedApps = [
        ...existingApps,
        ...newApps.filter((app) => !existingAppIds.has(app.id)),
      ];

      const newLogoChecksum = (await downloadFile(brand.logoUrl)).checksum;
      const oldLogoChecksum = existingBank?.logoChecksum;
      const logoChanged = newLogoChecksum !== oldLogoChecksum;

      const possibleBankToUpsert: Omit<Bank, "createdAt" | "updatedAt"> = {
        id: brand.id,
        name: brand.name,
        website: existingBank?.website || "https://example.com",
        aliases: brand.aliases,
        countries: brand.countries,
        logoUrl: logoChanged
          ? brand.logoUrl
          : (existingBank?.logoUrl ?? brand.logoUrl),
        logoChecksum: logoChanged
          ? newLogoChecksum
          : (existingBank?.logoChecksum ?? newLogoChecksum),
        standaloneAppSupport: firstBank.supportsStandaloneApp
          ? "supported"
          : existingBank?.standaloneAppSupport || "unsupported",
        p2pPaymentsSupport: "supported",
        eCommercePaymentsSupport:
          ecommerceBankData?.supportedPaymentUseCases.includes(
            "SingleImmediatePayments",
          )
            ? "supported"
            : existingBank?.eCommercePaymentsSupport || "unsupported",
        posPaymentsSupport: existingBank?.posPaymentsSupport || "unknown",
        bankingApps: mergedApps,
        notes: existingBank?.notes || "Automatically imported from Wero API",
      };

      if (!deepEqual(possibleBankToUpsert, existingBank)) {
        banksToUpsert.set(brand.id, {
          existing: !!existingBank,
          bank: possibleBankToUpsert,
        });
      }
    }
  }

  const errors: string[] = [];
  for (const { existing, bank } of banksToUpsert.values()) {
    if (existing) {
      const { success, message } = await createBankContribution(
        {
          action: "edit",
          data: bank,
          reason: "Automated update from Wero API",
        },
        "system",
      );
      if (!success) {
        errors.push(
          `Failed to create contribution for bank ${bank.name}: ${message}`,
        );
      }
    } else {
      const { success, message } = await createBankContribution(
        {
          action: "add",
          data: bank,
          reason: "Automated addition from Wero API",
        },
        "system",
      );
      if (!success) {
        errors.push(
          `Failed to create contribution for bank ${bank.name}: ${message}`,
        );
      }
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Some contributions failed to create",
        errors,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
  });
}
