"use server";

import { db } from "@/db";
import {
  Bank,
  banks as banksTable,
  NewBank,
  newBankSchema,
} from "@/db/schema/banks";
import { del, mirrorUrl } from "@/lib/s3";
import { requireAdmin } from "@/actions/session-actions";
import { eq, asc, sql } from "drizzle-orm";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { downloadFile } from "@/lib/download";

export async function getAllBanks() {
  "use cache";
  cacheLife("minutes");
  cacheTag("wero-data");

  return db.select().from(banksTable).orderBy(asc(sql`lower(${banksTable.name})`));
}

export async function createBank(
  bank: Omit<NewBank, "id" | "createdAt" | "updatedAt">,
): Promise<Bank> {
  await requireAdmin();

  newBankSchema
    .strict()
    .omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    })
    .parse(bank);

  const id = crypto.randomUUID();
  const mirroredLogo = await mirrorUrl(bank.logoUrl, id);
  const value: NewBank = {
    ...bank,
    id,
    logoUrl: mirroredLogo.url,
    logoChecksum: mirroredLogo.checksum,
    bankingApps: bank.bankingApps
      ? await Promise.all(
          bank.bankingApps.map(async (app) => {
            const mirroredIcon = await mirrorUrl(app.iconUrl, app.id);
            return {
              ...app,
              iconUrl: mirroredIcon.url,
              iconChecksum: mirroredIcon.checksum,
            };
          }),
        )
      : undefined,
  };

  const result = await db
    .insert(banksTable)
    .values(value)
    .returning()
    .then(([inserted]) => inserted);

  revalidateTag("wero-data", "max");

  return result;
}

export async function updateBank(
  bank: Omit<NewBank, "createdAt" | "updatedAt">,
): Promise<Bank> {
  await requireAdmin();

  newBankSchema
    .strict()
    .omit({
      createdAt: true,
      updatedAt: true,
    })
    .parse(bank);

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

  const existingLogoChecksum = existingBank.logoChecksum;
  const { checksum: newLogoChecksum } = await downloadFile(bank.logoUrl);
  const mirroredLogo =
    existingLogoChecksum !== newLogoChecksum
      ? await mirrorUrl(bank.logoUrl, bank.id)
      : { url: existingBank.logoUrl, checksum: existingBank.logoChecksum };

  const value: NewBank = {
    ...bank,
    logoUrl: mirroredLogo.url,
    logoChecksum: mirroredLogo.checksum,
    bankingApps: bank.bankingApps
      ? await Promise.all(
          bank.bankingApps.map(async (app) => {
            const existingApp = existingBank.bankingApps.find(
              (a) => a.id === app.id,
            );
            const existingIconChecksum = existingApp?.iconChecksum;
            const { checksum: newIconChecksum } = await downloadFile(
              app.iconUrl,
            );
            const mirroredIcon =
              existingIconChecksum !== newIconChecksum
                ? await mirrorUrl(app.iconUrl, app.id)
                : {
                    url: existingApp!.iconUrl,
                    checksum: existingApp!.iconChecksum,
                  };

            return {
              ...app,
              iconUrl: mirroredIcon.url,
              iconChecksum: mirroredIcon.checksum,
            };
          }),
        )
      : undefined,
  };

  const result = await db
    .update(banksTable)
    .set(value)
    .where(eq(banksTable.id, bank.id))
    .returning()
    .then(([updated]) => updated);

  revalidateTag("wero-data", "max");

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

  revalidateTag("wero-data", "max");
}
