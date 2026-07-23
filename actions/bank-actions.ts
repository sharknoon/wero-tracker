"use server";

import { db } from "@/db";
import {
  Bank,
  banks as banksTable,
  NewBank,
  newBankSchema,
  updateBankSchema,
} from "@/db/schema/banks";
import { del, mirrorUrl } from "@/lib/s3";
import { requireAdmin } from "@/actions/session-actions";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { downloadFile } from "@/lib/download";
import { getDomain } from "tldts";

export async function getAllBanks() {
  "use cache";
  cacheLife("minutes");
  cacheTag("wero-data");

  return db
    .select()
    .from(banksTable)
    .orderBy(asc(sql`lower(${banksTable.name})`));
}

export async function createBank(
  bank: Omit<NewBank, "id" | "createdAt" | "updatedAt"> & { id?: string },
): Promise<Bank> {
  await requireAdmin();

  newBankSchema.strict().parse(bank);

  const newBank: NewBank = { ...bank, id: bank.id ?? crypto.randomUUID() };

  // Mirror bank logo to S3
  const mirroredLogo = await mirrorUrl(bank.logoUrl, newBank.id);
  bank.logoUrl = mirroredLogo.url;
  bank.logoChecksum = mirroredLogo.checksum;

  // Mirror banking app icons to S3
  if (bank.bankingApps) {
    bank.bankingApps = await Promise.all(
      bank.bankingApps.map(async (app) => {
        const mirroredIcon = await mirrorUrl(app.iconUrl, app.id);
        return {
          ...app,
          iconUrl: mirroredIcon.url,
          iconChecksum: mirroredIcon.checksum,
        };
      }),
    );
  }

  const result = await db
    .insert(banksTable)
    .values(newBank)
    .returning()
    .then(([inserted]) => inserted);

  updateTag("wero-data");

  return result;
}

export async function updateBank(
  bank: Omit<NewBank, "createdAt" | "updatedAt">,
): Promise<Bank> {
  await requireAdmin();

  updateBankSchema.strict().parse(bank);

  // Fetch existing bank to detect removed banking apps and changed logos
  const existingBank = await db
    .select()
    .from(banksTable)
    .where(eq(banksTable.id, bank.id))
    .then(([b]) => b);

  // Delete S3 logos for removed banking apps
  if (existingBank.bankingApps) {
    const newAppIds = new Set(bank.bankingApps?.map((app) => app.id) ?? []);
    for (const oldApp of existingBank.bankingApps) {
      if (!newAppIds.has(oldApp.id) && oldApp.iconUrl) {
        await del(oldApp.iconUrl);
      }
    }
  }

  const updatedBank: NewBank = bank;

  // Mirror new bank logo to S3 if changed
  const existingLogoChecksum = existingBank.logoChecksum;
  const { checksum: newLogoChecksum } = await downloadFile(bank.logoUrl);
  if (existingLogoChecksum !== newLogoChecksum) {
    const mirroredLogo = await mirrorUrl(bank.logoUrl, bank.id);
    updatedBank.logoUrl = mirroredLogo.url;
    updatedBank.logoChecksum = mirroredLogo.checksum;
  }

  // Mirror new banking app icons to S3 if changed
  if (bank.bankingApps) {
    bank.bankingApps = await Promise.all(
      bank.bankingApps.map(async (app) => {
        const existingApp = existingBank.bankingApps.find(
          (a) => a.id === app.id,
        );
        const existingIconChecksum = existingApp?.iconChecksum;
        const { checksum: newIconChecksum } = await downloadFile(app.iconUrl);
        if (existingIconChecksum !== newIconChecksum) {
          const mirroredIcon = await mirrorUrl(app.iconUrl, app.id);
          return {
            ...app,
            iconUrl: mirroredIcon.url,
            iconChecksum: mirroredIcon.checksum,
          };
        }
        return app;
      }),
    );
  }

  const result = await db
    .update(banksTable)
    .set(updatedBank)
    .where(eq(banksTable.id, bank.id))
    .returning()
    .then(([updated]) => updated);

  updateTag("wero-data");

  return result;
}

export async function deleteBank(id: string): Promise<void> {
  await requireAdmin();

  const deletedBanks = await db
    .delete(banksTable)
    .where(eq(banksTable.id, id))
    .returning({ id: banksTable.id, logoUrl: banksTable.logoUrl });

  for (const bank of deletedBanks) {
    if (bank.logoUrl) {
      await del(bank.logoUrl);
    }
  }

  updateTag("wero-data");
}

/**
 * Find banks whose registrable domain matches any of the websites used by
 * `candidate`. `excludeId` skips a specific bank (useful when editing).
 */
export async function findDuplicateBanks(
  candidate: Pick<Bank, "website">,
  excludeId?: string,
): Promise<Bank[]> {
  const targetDomains = new Set(
    Object.values(candidate.website)
      .map((url) => getDomain(url)?.toLowerCase())
      .filter((d): d is string => !!d),
  );
  if (targetDomains.size === 0) return [];

  const patterns = Array.from(targetDomains, (d) => `%${d}%`);

  const duplicateBanks = await db
    .select()
    .from(banksTable)
    .where(
      and(
        sql`${banksTable.website}::text ILIKE ANY (ARRAY[${sql.join(patterns, sql`, `)}])`,
        excludeId ? ne(banksTable.id, excludeId) : undefined,
      ),
    )
    .then((banks) =>
      banks.filter((b) =>
        Object.values(b.website).some((url) => {
          const domain = getDomain(url)?.toLowerCase();
          return domain ? targetDomains.has(domain) : false;
        }),
      ),
    );

  return duplicateBanks;
}
