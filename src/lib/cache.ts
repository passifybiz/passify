// Tiny in-memory cache + rate-limit shim used when Redis is unavailable.
// TRD failure strategy: "Degrade to in-memory, alert ops."

const store = new Map<string, { value: string; expiresAt: number }>();
const counters = new Map<string, { count: number; resetsAt: number }>();

const now = () => Date.now();

async function redisGet(key: string): Promise<string | null> {
  const { redis } = await import("./db/redis");
  if (redis) {
    try {
      return await redis.get(key);
    } catch {
      /* fall through to in-memory */
    }
  }
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= now()) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

async function redisSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const { redis } = await import("./db/redis");
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
      return;
    } catch {
      /* fall through */
    }
  }
  store.set(key, { value, expiresAt: now() + ttlSeconds * 1000 });
}

// Fixed-window rate limiter. Returns whether the action is allowed and the
// remaining quota in the current window.
export async function rateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<{ ok: boolean; remaining: number; limit: number }> {
  const { redis } = await import("./db/redis");
  if (redis) {
    try {
      const key = `rl:${bucket}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSeconds);
      return { ok: count <= limit, remaining: Math.max(0, limit - count), limit };
    } catch {
      // In production without Redis, fail-closed (deny) to prevent bypass
      if (process.env.NODE_ENV === "production") {
        console.error("[rate-limit] Redis unavailable in production — denying request");
        return { ok: false, remaining: 0, limit };
      }
      /* fall through to in-memory in dev */
    }
  } else if (process.env.NODE_ENV === "production") {
    console.error("[rate-limit] Redis not configured in production — denying request");
    return { ok: false, remaining: 0, limit };
  }
  const key = `rl:${bucket}`;
  const w = counters.get(key);
  if (!w || w.resetsAt <= now()) {
    counters.set(key, { count: 1, resetsAt: now() + windowSeconds * 1000 });
    return { ok: limit >= 1, remaining: Math.max(0, limit - 1), limit };
  }
  w.count += 1;
  return { ok: w.count <= limit, remaining: Math.max(0, limit - w.count), limit };
}

export const cache = {
  get: redisGet,
  set: redisSet,
};
