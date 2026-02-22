"use server";

import { db } from "@/db";
import {
  Merchant,
  merchants as merchantsTable,
  NewMerchant,
  newMerchantSchema,
} from "@/db/schema/merchants";
import { del, mirrorUrl } from "@/lib/s3";
import { requireAdmin } from "@/actions/session-actions";
import { eq, asc } from "drizzle-orm";

export async function getAllMerchants() {
  return db.select().from(merchantsTable).orderBy(asc(merchantsTable.name));
}

export async function createMerchant(
  merchant: Omit<NewMerchant, "id" | "createdAt" | "updatedAt">,
): Promise<Merchant> {
  await requireAdmin();

  newMerchantSchema
    .strict()
    .omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    })
    .parse(merchant);

  const id = crypto.randomUUID();
  const value: NewMerchant = {
    ...merchant,
    id,
    logoUrl: await mirrorUrl(merchant.logoUrl, id),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return db
    .insert(merchantsTable)
    .values(value)
    .returning()
    .then(([inserted]) => inserted);
}

export async function updateMerchant(
  merchant: Omit<NewMerchant, "createdAt" | "updatedAt">,
): Promise<Merchant> {
  await requireAdmin();

  newMerchantSchema
    .strict()
    .omit({
      createdAt: true,
      updatedAt: true,
    })
    .parse(merchant);

  const value: NewMerchant = {
    ...merchant,
    logoUrl: merchant.logoUrl.startsWith(process.env.S3_PUBLIC_ACCESS_ENDPOINT!)
      ? merchant.logoUrl
      : await mirrorUrl(merchant.logoUrl, merchant.id),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return db
    .insert(merchantsTable)
    .values(value)
    .returning()
    .then(([inserted]) => inserted);
}

export async function deleteMerchant(id: string): Promise<void> {
  await requireAdmin();

  const deletedMerchants = await db
    .delete(merchantsTable)
    .where(eq(merchantsTable.id, id))
    .returning({ id: merchantsTable.id, logoUrl: merchantsTable.logoUrl });

  for (const merchant of deletedMerchants) {
    if (merchant.logoUrl) {
      await del(merchant.logoUrl);
    }
  }
}
