"use server";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import mime from "mime-types";
import { Readable } from "node:stream";

const blobs = new S3Client({
  region: process.env.S3_REGION as string,
  endpoint: process.env.S3_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
  // fix Cloudflare R2 issues
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const bucket = process.env.S3_BUCKET as string;

export const put = async (
  key: string,
  file: string | Uint8Array | Buffer | Readable,
  options: { access: "public" | "private" },
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

  return process.env.S3_PUBLIC_ACCESS_ENDPOINT + "/" + key;
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
