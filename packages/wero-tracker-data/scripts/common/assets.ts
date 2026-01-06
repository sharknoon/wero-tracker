import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import mime from "mime-types";
import { assetDir } from "./fs.ts";

export async function saveAsset(
  url: string,
  filenameWithoutExt?: string
): Promise<string> {
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const urlObj = new URL(url);
  const fn =
    filenameWithoutExt ??
    urlObj.pathname
      .split("/")
      .pop()
      ?.replace(/\.[^/.]+$/, "") ??
    crypto.randomUUID();
  const ext =
    mime.extension(response.headers.get("content-type") || "image/png") ||
    "png";
  const assetPath = path.join(assetDir, `${fn}.${ext}`);
  await fs.writeFile(assetPath, buffer);
  return `https://raw.githubusercontent.com/${process.env.GITHUB_ORG}/${process.env.GITHUB_REPO}/${process.env.GITHUB_REF}/${process.env.ASSET_PATH}/${fn}.${ext}`;
}
