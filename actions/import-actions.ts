"use server";

import { requireAdmin } from "./session-actions";
import { runWeroImport, WeroImportResult } from "@/lib/wero-import";

/**
 * Manually triggers the Wero API import. Admin-only.
 */
export async function triggerWeroImport(): Promise<WeroImportResult> {
  await requireAdmin();
  return runWeroImport();
}
