import { db } from "@/db";
import { contributions } from "@/db/schema/contributions";
import { users } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/contributions/[id] - Update contribution (approve/reject/edit)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check user role
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user || !["admin"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db.query.contributions.findFirst({
    where: eq(contributions.id, id),
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Contribution not found" },
      { status: 404 },
    );
  }

  const body = await request.json();
  const { status, reviewNote, data } = body;

  const updateData: Record<string, unknown> = {};

  // Collaborators and admins can edit the data
  if (data !== undefined) {
    updateData.data = data;
  }

  // Only admins can approve/reject
  if (status && ["approved", "rejected"].includes(status)) {
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can approve or reject contributions" },
        { status: 403 },
      );
    }
    updateData.status = status;
    updateData.reviewerId = session.user.id;
  }

  if (reviewNote !== undefined) {
    updateData.reviewNote = reviewNote;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(contributions)
    .set(updateData)
    .where(eq(contributions.id, id))
    .returning();

  return NextResponse.json(updated);
}

// DELETE /api/contributions/[id] - Delete a contribution (admin only, or own pending)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.query.contributions.findFirst({
    where: eq(contributions.id, id),
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Contribution not found" },
      { status: 404 },
    );
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  // Allow: admin always, or own pending contribution
  const isAdmin = user?.role === "admin";
  const isOwnPending =
    existing.userId === session.user.id && existing.status === "pending";

  if (!isAdmin && !isOwnPending) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(contributions).where(eq(contributions.id, id));

  return NextResponse.json({ success: true });
}
