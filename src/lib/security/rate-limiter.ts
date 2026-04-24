type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function purgeExpired(): void {
  const now = Date.now();
  for (const [key, b] of Array.from(buckets.entries())) {
    if (now > b.resetAt) {
      buckets.delete(key);
    }
  }
}

if (typeof globalThis !== "undefined") {
  const timer = setInterval(purgeExpired, CLEANUP_INTERVAL_MS);
  if (typeof timer === "object" && "unref" in timer) {
    timer.unref();
  }
}

export function consumeRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  if (b.count >= max) {
    return false;
  }
  b.count += 1;
  return true;
}
