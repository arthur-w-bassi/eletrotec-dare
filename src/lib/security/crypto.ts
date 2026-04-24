import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

export function generateSessionTokenBytes(): Buffer {
  return randomBytes(32);
}

export function bufferToHex(buf: Buffer): string {
  return buf.toString("hex");
}

export function sha256HexFromBuffer(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

export function sha256HexFromUtf8(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function hexTimingSafeEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) {
      return false;
    }
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export function generateSixDigitCode(): string {
  const n = randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}
