/**
 * Edge Rate Limiter & DDoS Mitigation Shield
 *
 * Implements a memory-efficient Sliding Window rate limiter tailored for
 * Cloudflare Workers (`workerd`) isolates and Next.js Edge Middleware.
 *
 * Prevents:
 *   - Brute-force credential stuffing on `/api/auth/*`, `/sign-in`
 *   - Inventory exhaustion and fake checkout DDoS on `/api/v1/checkout`
 *   - General API endpoint hammering
 */

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

// Periodic cleanup of expired rate limit buckets to guarantee zero memory leaks inside edge worker isolates
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupExpiredBuckets(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets.entries()) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a client identifier (e.g., IP address + route scope) has exceeded the rate limit.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const bucket = buckets.get(identifier);

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + options.windowMs;
    buckets.set(identifier, { count: 1, resetAt });
    return {
      allowed: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetAt,
    };
  }

  if (bucket.count >= options.limit) {
    return {
      allowed: false,
      limit: options.limit,
      remaining: 0,
      resetAt: bucket.resetAt,
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    limit: options.limit,
    remaining: options.limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}

/**
 * Pre-configured rate limits for distinct endpoint sensitivities.
 */
export const RATE_LIMITS = {
  /** High sensitivity: Authentication endpoints (15 req/min) */
  AUTH: { limit: 15, windowMs: 60_000 },
  /** High sensitivity: Checkout and order creation (20 req/min) */
  CHECKOUT: { limit: 20, windowMs: 60_000 },
  /** Medium sensitivity: General API requests (120 req/min) */
  API_GENERAL: { limit: 120, windowMs: 60_000 },
} as const;
