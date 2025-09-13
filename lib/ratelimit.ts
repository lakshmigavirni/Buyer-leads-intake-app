// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- In-memory fallback (works without Redis for local/demo) ---
class MemoryRateLimiter {
  private hits = new Map<string, { count: number; timestamp: number }>();
  private windowMs: number;
  private maxHits: number;

  constructor(maxHits: number, windowMs: number) {
    this.maxHits = maxHits;
    this.windowMs = windowMs;
  }

  async limit(identifier: string) {
    const now = Date.now();
    const record = this.hits.get(identifier);

    if (!record || now - record.timestamp > this.windowMs) {
      this.hits.set(identifier, { count: 1, timestamp: now });
      return { success: true };
    }

    if (record.count < this.maxHits) {
      record.count++;
      return { success: true };
    }

    return { success: false };
  }
}

// --- Try to connect to Redis (Upstash) ---
let ratelimit: Ratelimit | MemoryRateLimiter;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests/min
      analytics: true,
    });

    console.log("✅ Using Upstash Redis for rate limiting");
  } else {
    throw new Error("Missing Redis env vars");
  }
} catch (err) {
  console.warn("⚠️ Using in-memory rate limiter (no Redis detected)");
  ratelimit = new MemoryRateLimiter(5, 60 * 1000); // 5 requests/minute
}

export { ratelimit };
