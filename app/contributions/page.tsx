import {
  getContributions,
  getContributionCounts,
} from "@/actions/contribution-actions";
import { ContributionsPage } from "./contributions-page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";

export const metadata = {
  title: "Contributions - Wero Tracker",
  description: "Review and manage community contributions to the Wero Tracker.",
};

async function getCurrentUserRole() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  return {
    id: session.user.id,
    role: session.user.role,
  };
}

async function ContributionsRoute() {
  const [{ contributions, totalCount }, counts, currentUser] =
    await Promise.all([
      getContributions("pending"),
      getContributionCounts(),
      getCurrentUserRole(),
    ]);

  return (
    <ContributionsPage
      initialContributions={contributions}
      initialTotalCount={totalCount}
      initialCounts={counts}
      currentUser={currentUser}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ContributionsPage loading />}>
      <ContributionsRoute />
    </Suspense>
  );
}
