import { db } from "@/db";
import {
  contributionInsertSchema,
  contributions,
  NewContribution,
} from "@/db/schema/contributions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// POST /api/contributions - Create a new contribution
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, action, entityId, data, reason } = body;

  if (!type || !action || !data) {
    return NextResponse.json(
      { error: "Missing required fields: type, action, data" },
      { status: 400 },
    );
  }

  if (!["bank-brand", "merchant"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (!["add", "edit", "delete"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const parseResult = contributionInsertSchema.safeParse(data);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parseResult.error },
      { status: 400 },
    );
  }

  const contribution: NewContribution = {
    id: crypto.randomUUID(),
    type,
    action,
    status: "pending",
    entityId: entityId ?? null,
    data,
    reason: reason ?? null,
    userId: session.user.id,
  };

  const [inserted] = await db
    .insert(contributions)
    .values(contribution)
    .returning();

  return NextResponse.json(inserted, { status: 201 });
}

// GET /api/contributions - List contributions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  const results = await db.query.contributions.findMany({
    where: (c, { and, eq }) => {
      const conditions = [];
      if (status && ["pending", "approved", "rejected"].includes(status)) {
        conditions.push(
          eq(c.status, status as "pending" | "approved" | "rejected"),
        );
      }
      if (type && ["bank-brand", "merchant"].includes(type)) {
        conditions.push(eq(c.type, type as "bank-brand" | "merchant"));
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

  return NextResponse.json(results);
}
