import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient: Redis | null = null;

function createRedisClient() {
  const isTls = redisUrl.startsWith("rediss://");

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    enableReadyCheck: false,
    connectTimeout: 3000,
    commandTimeout: 3000,
    lazyConnect: false,
    tls: isTls ? {} : undefined,
    retryStrategy(times) {
      if (times > 1) return null;
      return 300;
    },
  });

  client.on("connect", () => {
    console.log("Redis connected successfully");
  });

  client.on("error", (error) => {
    console.error("Redis connection error:", error.message);
  });

  client.on("end", () => {
    console.warn("Redis connection ended");
  });

  return client;
}

export function getRedisClient() {
  if (
    !redisClient ||
    redisClient.status === "end" ||
    redisClient.status === "close"
  ) {
    redisClient = createRedisClient();
  }

  return redisClient;
}

export async function safeRedis<T>(
  callback: (client: Redis) => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const client = getRedisClient();

    return await Promise.race([
      callback(client),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Redis operation timeout")), 3000)
      ),
    ]);
  } catch (error: any) {
    console.error("SAFE REDIS ERROR:", error?.message || error);
    return fallback;
  }
}