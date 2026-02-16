"use server";

import { db } from "@/db";
import { bankBrands, bankingApps, banks } from "@/db/schema/banks";
import {
  contributions,
  ContributionStatus,
  ContributionType,
  NewContribution,
} from "@/db/schema/contributions";
import { merchants } from "@/db/schema/merchants";
import { auth } from "@/lib/auth";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { headers } from "next/headers";
import z from "zod";

const merchantContributionSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("add"),
    data: createInsertSchema(merchants).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    }),
  }),
  z.strictObject({
    action: z.union([z.literal("edit"), z.literal("delete")]),
    data: createSelectSchema(merchants).omit({
      createdAt: true,
      updatedAt: true,
    }),
    reason: z.string().max(2000),
  }),
]);
type MerchantContribution = z.infer<typeof merchantContributionSchema>;

export async function createMerchantContribution(
  contribution: MerchantContribution,
): Promise<{ success: boolean; message: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, message: "Unauthorized" };
  }

  const result = merchantContributionSchema.safeParse(contribution);
  if (!result.success) {
    return {
      success: false,
      message: "Invalid contribution data: " + result.error.message,
    };
  }

  let previousData = null;
  if (contribution.action === "edit" || contribution.action === "delete") {
    const existing = await db.query.merchants.findFirst({
      where: (m, { eq }) => eq(m.id, contribution.data.id),
    });
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...rest } = existing;
      previousData = rest;
    }
  }

  const newContribution: NewContribution = {
    type: "merchant",
    action: contribution.action,
    status: "pending",
    data: contribution.data,
    previousData,
    reason: "reason" in contribution ? contribution.reason : null,
    userId: session.user.id,
  };
  await db.insert(contributions).values(newContribution);

  return { success: true, message: "Contribution submitted successfully" };
}

const bankBrandContributionSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("add"),
    data: z.strictObject({
      brand: createInsertSchema(bankBrands).omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }),
      banks: z.array(
        createInsertSchema(banks).omit({
          id: true,
          createdAt: true,
          updatedAt: true,
        }),
      ),
      apps: z.array(
        createInsertSchema(bankingApps).omit({
          id: true,
          createdAt: true,
          updatedAt: true,
        }),
      ),
    }),
  }),
  z.strictObject({
    action: z.union([z.literal("edit"), z.literal("delete")]),
    data: z.strictObject({
      brand: createSelectSchema(bankBrands).omit({
        createdAt: true,
        updatedAt: true,
      }),
      banks: z.array(
        createSelectSchema(banks).omit({
          createdAt: true,
          updatedAt: true,
        }),
      ),
      apps: z.array(
        createSelectSchema(bankingApps).omit({
          createdAt: true,
          updatedAt: true,
        }),
      ),
    }),
    reason: z.string().max(2000),
  }),
]);
type BankBrandContribution = z.infer<typeof bankBrandContributionSchema>;

export async function createBankBrandContribution(
  contribution: BankBrandContribution,
): Promise<{ success: boolean; message: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, message: "Unauthorized" };
  }

  const result = bankBrandContributionSchema.safeParse(contribution);
  if (!result.success) {
    return {
      success: false,
      message: "Invalid contribution data: " + result.error.message,
    };
  }

  let previousData = null;
  if (contribution.action === "edit" || contribution.action === "delete") {
    const existing = await db.query.bankBrands.findFirst({
      where: (b, { eq }) => eq(b.id, contribution.data.brand.id),
      with: {
        banks: {
          with: {
            bankingAppsToBanks: {
              with: { bankingApp: true },
            },
          },
        },
      },
    });
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, banks: existingBanks, ...brand } = existing;
      const allApps = new Map<
        string,
        (typeof existingBanks)[number]["bankingAppsToBanks"][number]["bankingApp"]
      >();
      for (const bank of existingBanks) {
        for (const link of bank.bankingAppsToBanks) {
          allApps.set(link.bankingApp.id, link.bankingApp);
        }
      }
      previousData = {
        brand,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        banks: existingBanks.map(
          ({ createdAt, updatedAt, bankingAppsToBanks, ...rest }) => rest,
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        apps: [...allApps.values()].map(
          ({ createdAt, updatedAt, ...rest }) => rest,
        ),
      };
    }
  }

  const newContribution: NewContribution = {
    type: "bank-brand",
    action: contribution.action,
    status: "pending",
    data: contribution.data,
    previousData,
    reason: "reason" in contribution ? contribution.reason : null,
    userId: session.user.id,
  };
  await db.insert(contributions).values(newContribution);
  return { success: true, message: "Contribution submitted successfully" };
}

export async function listContributions(
  status?: ContributionStatus,
  type?: ContributionType,
) {
  return await db.query.contributions.findMany({
    where: (c, { and, eq }) => {
      const conditions = [];
      if (status) {
        conditions.push(eq(c.status, status));
      }
      if (type) {
        conditions.push(eq(c.type, type));
      }
      return conditions.length > 0 ? and(...conditions) : undefined;
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
      reviewer: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });
}
