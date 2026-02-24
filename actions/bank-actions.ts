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
import { eq, asc } from "drizzle-orm";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

export async function getAllBanks() {
  "use cache";
  cacheLife("minutes");
  cacheTag("wero-data");

  return db.select().from(banksTable).orderBy(asc(banksTable.name));
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
  const value: NewBank = {
    ...bank,
    id,
    logoUrl: await mirrorUrl(bank.logoUrl, id),
    createdAt: new Date(),
    updatedAt: new Date(),
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

  const value: NewBank = {
    ...bank,
    logoUrl: bank.logoUrl.startsWith(process.env.S3_PUBLIC_ACCESS_ENDPOINT!)
      ? bank.logoUrl
      : await mirrorUrl(bank.logoUrl, bank.id),
    createdAt: new Date(),
    updatedAt: new Date(),
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
