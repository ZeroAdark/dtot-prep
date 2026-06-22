// Lightweight in-memory rate limiter for the authentication endpoints. The app
// runs as a single Node process, so a module-level Map is sufficient (state
// resets on restart, which is acceptable for brute-force throttling). Failed
// attempts accrue per key; once the cap is hit the key is locked out for a
// cooldown window. A successful auth clears the key.

interface Bucket {
  count: number;
  resetAt: number;
  lockedUntil: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000; // rolling window for counting failures
const MAX_FAILURES = 10; // failures allowed per window before lockout
const LOCKOUT_MS = 15 * 60 * 1000; // cooldown once tripped

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

function sweep(now: number) {
  // Only walk the map when it has grown large, to keep this O(1) amortized.
  if (buckets.size < 5000) return;
  for (const [key, b] of buckets) {
    if (b.lockedUntil < now && b.resetAt < now) buckets.delete(key);
  }
}

/** Check (without consuming) whether an action is currently allowed for a key. */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (b && b.lockedUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((b.lockedUntil - now) / 1000) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

/** Record a failed attempt; locks the key once failures exceed the cap. */
export function registerFailure(key: string): void {
  const now = Date.now();
  sweep(now);
  let b = buckets.get(key);
  if (!b || b.resetAt < now) {
    b = { count: 0, resetAt: now + WINDOW_MS, lockedUntil: 0 };
    buckets.set(key, b);
  }
  b.count += 1;
  if (b.count >= MAX_FAILURES) {
    b.lockedUntil = now + LOCKOUT_MS;
    b.count = 0;
    b.resetAt = now + WINDOW_MS;
  }
}

/** Clear a key after a successful auth. */
export function clearRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * Best-effort client IP. Behind the Cloudflare Tunnel the real client is in
 * CF-Connecting-IP; behind the LAN Caddy edge it's the first X-Forwarded-For
 * entry. Both are set by trusted proxies in this deployment. Falls back to a
 * shared bucket when neither is present.
 */
export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}
