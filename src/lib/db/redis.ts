import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as { __passifyRedis?: Redis | null };

function createRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    const restUrl = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (restUrl && token) {
      return new Redis({ url: restUrl, token });
    }
    return null;
  } catch {
    return null;
  }
}

export const redis: Redis | null = globalForRedis.__passifyRedis ?? createRedis();
if (process.env.NODE_ENV !== "production") globalForRedis.__passifyRedis = redis;
