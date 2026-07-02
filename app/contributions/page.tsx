import { getAllContributions } from "@/actions/contribution-actions";
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
  const [contributions, currentUser] = await Promise.all([
    getAllContributions(),
    getCurrentUserRole(),
  ]);

  // sleep for 5 seconds for debug
  await new Promise((resolve) => setTimeout(resolve, 5000));

  return (
    <ContributionsPage
      contributions={contributions}
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
