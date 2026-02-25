"use server";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import mime from "mime-types";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import { downloadFile } from "./download";

const S3_REGION = process.env.S3_REGION as string;
const S3_ENDPOINT = process.env.S3_ENDPOINT as string;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID as string;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY as string;
const S3_BUCKET = process.env.S3_BUCKET as string;
const S3_PUBLIC_ACCESS_ENDPOINT = process.env
  .S3_PUBLIC_ACCESS_ENDPOINT as string;

if (
  !S3_REGION ||
  !S3_ENDPOINT ||
  !S3_ACCESS_KEY_ID ||
  !S3_SECRET_ACCESS_KEY ||
  !S3_BUCKET ||
  !S3_PUBLIC_ACCESS_ENDPOINT
) {
  throw new Error("Missing S3 configuration in environment variables");
}

const blobs = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  // fix Cloudflare R2 issues
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const bucket = S3_BUCKET;

export const put = async (
  key: string,
  file: string | Uint8Array | Buffer | Readable,
  options: { access: "public" | "private" } = { access: "public" },
) => {
  await blobs.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ACL: options.access === "public" ? "public-read" : "private",
      ContentType: mime.lookup(key) || "application/octet-stream",
    }),
  );

  return S3_PUBLIC_ACCESS_ENDPOINT + "/" + key;
};

export const del = async (url: string) => {
  const paths = new URL(url).pathname.split("/");
  const key = paths.pop()!;
  return await blobs.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};

export const mirrorUrl = async (
  url: string,
  basename?: string,
  options?: { access: "public" | "private" },
): Promise<{ url: string; checksum: string }> => {
  const { data, checksum, contentType } = await downloadFile(url);
  const ext = mime.extension(contentType) || "bin";
  const key = (basename || crypto.randomUUID()) + "." + ext;
  const resultUrl = await put(key, data, options);
  return { url: resultUrl, checksum };
};
