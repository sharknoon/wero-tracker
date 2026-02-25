import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import assert from "node:assert";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function deepEqual(a: unknown, b: unknown): boolean {
  try {
    assert.deepStrictEqual(a, b);
    return true;
  } catch {
    return false;
  }
}
