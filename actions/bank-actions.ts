"use server";

import { db } from "@/db";
import {
  Bank,
  BankingApp,
  bankingApps as bankingAppsTable,
  banks as banksTable,
  NewBank,
  NewBankingApp,
  newBankingAppSchema,
  newBankSchema,
} from "@/db/schema/banks";
import { del, mirrorUrl } from "@/lib/s3";
import { requireAdmin } from "@/actions/session-actions";
import { eq, asc } from "drizzle-orm";

export async function getAllBanks() {
  return db.select().from(banksTable).orderBy(asc(banksTable.name));
}

export async function getAllBankingApps() {
  return db.select().from(bankingAppsTable).orderBy(asc(bankingAppsTable.name));
}

export async function createBank(
  bank: Omit<NewBank, "id" | "createdAt" | "updatedAt">,
  bankingApps: Omit<NewBankingApp, "id" | "createdAt" | "updatedAt">[],
): Promise<{ bank: Bank; bankingApps: BankingApp[] }> {
  await requireAdmin();

  newBankSchema
    .strict()
    .omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    })
    .parse(bank);
  newBankingAppSchema
    .strict()
    .omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    })
    .parse(bankingApps);

  return await db.transaction(async (tx) => {
    const id = crypto.randomUUID();
    const value: NewBank = {
      ...bank,
      id,
      logoUrl: await mirrorUrl(bank.logoUrl, id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertedBank = await tx
      .insert(banksTable)
      .values(value)
      .returning()
      .then(([inserted]) => inserted);

    const insertedBankingApps = await Promise.all(
      bankingApps.map(async (app) => {
        const appId = crypto.randomUUID();
        const appValue: BankingApp = {
          ...app,
          id: appId,
          bankId: insertedBank.id,
          iconUrl: await mirrorUrl(app.iconUrl, appId),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return tx
          .insert(bankingAppsTable)
          .values(appValue)
          .returning()
          .then(([inserted]) => inserted);
      }),
    );

    return { bank: insertedBank, bankingApps: insertedBankingApps };
  });
}

export async function updateBank(
  bank: Omit<NewBank, "createdAt" | "updatedAt">,
  bankingApps: Omit<NewBankingApp, "createdAt" | "updatedAt">[],
): Promise<{ bank: Bank; bankingApps: BankingApp[] }> {
  await requireAdmin();

  newBankSchema
    .strict()
    .omit({
      createdAt: true,
      updatedAt: true,
    })
    .parse(bank);
  newBankingAppSchema
    .strict()
    .omit({
      createdAt: true,
      updatedAt: true,
    })
    .parse(bankingApps);

  return await db.transaction(async (tx) => {
    const value: NewBank = {
      ...bank,
      logoUrl: bank.logoUrl.startsWith(process.env.S3_PUBLIC_ACCESS_ENDPOINT!)
        ? bank.logoUrl
        : await mirrorUrl(bank.logoUrl, bank.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertedBank = await tx
      .insert(banksTable)
      .values(value)
      .returning()
      .then(([inserted]) => inserted);

    const insertedBankingApps = await Promise.all(
      bankingApps.map(async (app) => {
        const appValue: BankingApp = {
          ...app,
          bankId: insertedBank.id,
          iconUrl: app.iconUrl.startsWith(
            process.env.S3_PUBLIC_ACCESS_ENDPOINT!,
          )
            ? app.iconUrl
            : await mirrorUrl(app.iconUrl, app.id),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return tx
          .insert(bankingAppsTable)
          .values(appValue)
          .returning()
          .then(([inserted]) => inserted);
      }),
    );

    return { bank: insertedBank, bankingApps: insertedBankingApps };
  });
}

export async function deleteBank(id: string): Promise<void> {
  await requireAdmin();

  await db.transaction(async (tx) => {
    const deletedBankingApps = await tx
      .delete(bankingAppsTable)
      .where(eq(bankingAppsTable.bankId, id))
      .returning({
        id: bankingAppsTable.id,
        iconUrl: bankingAppsTable.iconUrl,
      });
    const deletedBanks = await tx
      .delete(banksTable)
      .where(eq(banksTable.id, id))
      .returning({ id: banksTable.id, logoUrl: banksTable.logoUrl });

    for (const app of deletedBankingApps) {
      if (app.iconUrl) {
        await del(app.iconUrl);
      }
    }
    for (const bank of deletedBanks) {
      if (bank.logoUrl) {
        await del(bank.logoUrl);
      }
    }
  });
}
