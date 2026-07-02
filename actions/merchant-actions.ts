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
import { eq, asc, sql, ilike, and, ne } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { downloadFile } from "@/lib/download";
import { getDomain } from "tldts";

export async function getAllMerchants() {
  "use cache";
  cacheLife("minutes");
  cacheTag("wero-data");

  return db
    .select()
    .from(merchantsTable)
    .orderBy(asc(sql`lower(${merchantsTable.name})`));
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
  const mirroredLogo = await mirrorUrl(merchant.logoUrl, id);
  const value: NewMerchant = {
    ...merchant,
    id,
    logoUrl: mirroredLogo.url,
    logoChecksum: mirroredLogo.checksum,
  };

  const result = await db
    .insert(merchantsTable)
    .values(value)
    .returning()
    .then(([inserted]) => inserted);

  updateTag("wero-data");

  return result;
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

  // Fetch existing merchant to detect changed logos
  const existingMerchant = await db
    .select()
    .from(merchantsTable)
    .where(eq(merchantsTable.id, merchant.id))
    .then(([m]) => m);

  const existingLogoChecksum = existingMerchant.logoChecksum;
  const { checksum: newLogoChecksum } = await downloadFile(merchant.logoUrl);
  const mirroredLogo =
    existingLogoChecksum !== newLogoChecksum
      ? await mirrorUrl(merchant.logoUrl, merchant.id)
      : {
          url: existingMerchant.logoUrl,
          checksum: existingMerchant.logoChecksum,
        };

  const value: NewMerchant = {
    ...merchant,
    logoUrl: mirroredLogo.url,
    logoChecksum: mirroredLogo.checksum,
  };

  const result = await db
    .update(merchantsTable)
    .set(value)
    .where(eq(merchantsTable.id, merchant.id))
    .returning()
    .then(([updated]) => updated);

  updateTag("wero-data");

  return result;
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

  updateTag("wero-data");
}

/**
 * Find merchants whose registrable domain matches the candidate's website.
 * `excludeId` skips a specific merchant (useful when editing).
 */
export async function findDuplicateMerchants(
  candidate: Pick<Merchant, "website">,
  excludeId?: string,
): Promise<Merchant[]> {
  const targetDomain = getDomain(candidate.website)?.toLowerCase();
  if (!targetDomain) return [];

  const duplicateMerchants = await db
    .select()
    .from(merchantsTable)
    .where(
      and(
        ilike(merchantsTable.website, `%${targetDomain}%`),
        excludeId ? ne(merchantsTable.id, excludeId) : undefined,
      ),
    )
    .then((merchants) =>
      merchants.filter((m) => {
        return getDomain(m.website)?.toLowerCase() === targetDomain;
      }),
    );

  return duplicateMerchants;
}
