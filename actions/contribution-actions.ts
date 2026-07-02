"use server";

import { db } from "@/db";
import { banks } from "@/db/schema/banks";
import {
  AddBankContributionData as AddBankContributionData,
  AddMerchantContributionData,
  Contribution,
  contributions,
  ContributionStatus,
  ContributionType,
  EditOrDeleteBankContributionData,
  EditOrDeleteMerchantContributionData,
  NewContribution,
} from "@/db/schema/contributions";
import { merchants } from "@/db/schema/merchants";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { headers } from "next/headers";
import z from "zod";
import { cacheTag, revalidateTag, updateTag } from "next/cache";
import { createBank, deleteBank, updateBank } from "./bank-actions";
import {
  createMerchant,
  deleteMerchant,
  updateMerchant,
} from "./merchant-actions";
import { requireAdmin, requireSession } from "./session-actions";
import { downloadFile } from "@/lib/download";

const merchantContributionSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("add"),
    data: createInsertSchema(merchants).strict().omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    }),
  }),
  z.strictObject({
    action: z.union([z.literal("edit"), z.literal("delete")]),
    data: createSelectSchema(merchants).strict().omit({
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
      message: "Invalid contribution data: " + z.prettifyError(result.error),
    };
  }

  let previousData = null;
  if (contribution.action === "edit" || contribution.action === "delete") {
    // Recalculate checksum for logo to detect changes
    const { checksum } = await downloadFile(contribution.data.logoUrl);
    contribution.data.logoChecksum = checksum;

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

  revalidateTag("contributions", "max");

  return { success: true, message: "Contribution submitted successfully" };
}

const bankContributionSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("add"),
    data: createInsertSchema(banks).strict().omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    }),
    reason: z.string().max(2000).optional(),
  }),
  z.strictObject({
    action: z.union([z.literal("edit"), z.literal("delete")]),
    data: createSelectSchema(banks).strict().omit({
      createdAt: true,
      updatedAt: true,
    }),
    reason: z.string().max(2000),
  }),
]);
type BankContribution = z.infer<typeof bankContributionSchema>;

export async function createBankContribution(
  contribution: BankContribution,
  userId?: string,
): Promise<{ success: boolean; message: string }> {
  if (!userId) {
    const session = await requireSession();
    userId = session.user.id;
  }

  const result = bankContributionSchema.safeParse(contribution);
  if (!result.success) {
    return {
      success: false,
      message: "Invalid contribution data: " + z.prettifyError(result.error),
    };
  }

  let previousData = null;
  if (contribution.action === "edit" || contribution.action === "delete") {
    // Recalculate checksum for logo to detect changes
    const { checksum } = await downloadFile(contribution.data.logoUrl);
    contribution.data.logoChecksum = checksum;
    for (const app of contribution.data.bankingApps) {
      const { checksum: appIconChecksum } = await downloadFile(app.iconUrl);
      app.iconChecksum = appIconChecksum;
    }

    const existing = await db.query.banks.findFirst({
      where: (b, { eq }) => eq(b.id, contribution.data.id),
    });
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...bank } = existing;

      previousData = bank;
    }
  }

  const newContribution: NewContribution = {
    type: "bank",
    action: contribution.action,
    status: "pending",
    data: contribution.data,
    previousData,
    reason: contribution.reason || null,
    userId,
  };
  await db.insert(contributions).values(newContribution);

  revalidateTag("contributions", "max");

  return { success: true, message: "Contribution submitted successfully" };
}

export type ContributionWithRelations = Awaited<
  ReturnType<typeof getAllContributions>
>[number];
export async function getAllContributions(
  status?: ContributionStatus,
  type?: ContributionType,
) {
  "use cache";
  cacheTag("contributions");

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

export async function rejectOrApproveContribution(
  id: string,
  action: Exclude<ContributionStatus, "pending">,
  reviewNote: string,
): Promise<{ success: boolean; message: string }> {
  const session = await requireAdmin();

  const existing = await db.query.contributions.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });

  if (!existing) {
    return { success: false, message: "Contribution not found" };
  }

  if (existing.status !== "pending") {
    return {
      success: false,
      message: "Only pending contributions can be approved or rejected",
    };
  }

  await db.transaction(async (tx) => {
    const updateData: Partial<Contribution> = {
      status: action,
      reviewNote,
      reviewerId: session.user.id,
    };

    await tx
      .update(contributions)
      .set(updateData)
      .where(eq(contributions.id, id));

    if (action === "approved") {
      if (existing.type === "merchant") {
        if (existing.action === "add") {
          const addData = existing.data as AddMerchantContributionData;
          await createMerchant(addData);
        } else if (existing.action === "edit") {
          const editData =
            existing.data as EditOrDeleteMerchantContributionData;
          await updateMerchant(editData);
        } else if (existing.action === "delete") {
          const deleteData =
            existing.data as EditOrDeleteMerchantContributionData;
          await deleteMerchant(deleteData.id);
        }
      } else if (existing.type === "bank") {
        if (existing.action === "add") {
          const addData = existing.data as AddBankContributionData;
          await createBank(addData);
        } else if (existing.action === "edit") {
          const editData = existing.data as EditOrDeleteBankContributionData;
          await updateBank(editData);
        } else if (existing.action === "delete") {
          const deleteData = existing.data as EditOrDeleteBankContributionData;
          await deleteBank(deleteData.id);
        }
      }
    }
  });

  updateTag("contributions");

  return {
    success: true,
    message: `Contribution ${action} successfully`,
  };
}
