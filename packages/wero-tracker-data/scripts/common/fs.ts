import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

export const rootDir = path.dirname(
  path.dirname(path.dirname(url.fileURLToPath(import.meta.url)))
);
export const assetDir =
  (await fs.mkdir(path.join(rootDir, "assets"), { recursive: true })) ??
  path.join(rootDir, "assets");

export async function exists(path: string): Promise<boolean> {
  try {
    await fs.stat(path);
    return true;
  } catch {
    return false;
  }
}
