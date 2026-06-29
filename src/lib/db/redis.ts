declare const __non_webpack_require__: (path: string) => unknown;

// Redis is optional infra (rate-limit + session cache). On failure,
// degrade to in-memory and alert ops. Expose a lazy client that resolves
// to null when no REDIS_URL is configured or the connection fails — callers fall
// back to an in-memory shim (see lib/cache.ts).

type RedisClient = import("ioredis").default;
const globalForRedis = globalThis as unknown as { __passifyRedis?: RedisClient | null };

function createRedis(): RedisClient | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    // Dynamic require to keep webpack bundle clean — ioredis uses net/stream/crypto
    const ioredisMod = __non_webpack_require__("ioredis") as { default: new (url: string, opts: Record<string, unknown>) => { on: (ev: string, cb: () => void) => void; status: string } };
    const client = new ioredisMod.default(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: false,
      retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 200, 1000)),
    });
    client.on("error", () => {
      /* swallow — degrade to in-memory */
    });
    return client as unknown as RedisClient;
  } catch {
    return null;
  }
}

export const redis: RedisClient | null = globalForRedis.__passifyRedis ?? createRedis();
if (process.env.NODE_ENV !== "production") globalForRedis.__passifyRedis = redis;
