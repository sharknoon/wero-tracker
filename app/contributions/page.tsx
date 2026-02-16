import { db } from "@/db";
import { ContributionsPage } from "./contributions-page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";

export const metadata = {
  title: "Contributions - Wero Tracker",
  description: "Review and manage community contributions to the Wero Tracker.",
};

async function getContributions() {
  return db.query.contributions.findMany({
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

async function getCurrentUserRole() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  return {
    id: session.user.id,
    role: session.user.role,
  };
}

export type ContributionWithRelations = Awaited<
  ReturnType<typeof getContributions>
>[number];

async function ContributionsRoute() {
  const [contributions, currentUser] = await Promise.all([
    getContributions(),
    getCurrentUserRole(),
  ]);

  return (
    <ContributionsPage
      contributions={contributions}
      currentUser={currentUser}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading contributions...</div>}>
      <ContributionsRoute />
    </Suspense>
  );
}
