import crypto from "node:crypto";

export const downloadFile = async (
  url: string,
): Promise<{ data: Uint8Array; checksum: string; contentType: string }> => {
  const response = await fetch(url);
  const contentType =
    response.headers.get("Content-Type") || "application/octet-stream";
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  const checksum = computeChecksum(data);
  return { data, checksum, contentType };
};

export const computeChecksum = (data: Uint8Array): string => {
  return crypto.createHash("sha256").update(data).digest("hex");
};
