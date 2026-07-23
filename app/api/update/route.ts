import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { runWeroImport } from "@/lib/wero-import";

export async function GET() {
  const cronSecret = process.env.CRON_SECRET;
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const providedSecret = authHeader?.replace(/Bearer\s+/i, "").trim();

  if (!cronSecret || providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runWeroImport();

  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
