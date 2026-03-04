import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminEditor } from "./admin-editor";
import { getAllBanks } from "@/actions/bank-actions";
import { getAllMerchants } from "@/actions/merchant-actions";
import { Suspense } from "react";

export const metadata = {
  title: "Admin Editor - Wero Tracker",
  description: "Edit banks, merchants and banking apps.",
};

export async function AdminRoute() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const [banks, merchants] = await Promise.all([
    getAllBanks(),
    getAllMerchants(),
  ]);

  return <AdminEditor banks={banks} merchants={merchants} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading admin editor...</div>}>
      <AdminRoute />
    </Suspense>
  );
}
