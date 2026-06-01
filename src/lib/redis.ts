import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn("REDIS_URL is missing.");
}

let redisClient: Redis | null = null;

function createRedisClient() {
  const url = redisUrl || "redis://localhost:6379";
  const isTls = url.startsWith("rediss://");

  const client = new Redis(url, {
    tls: isTls ? {} : undefined,

    // Important for serverless + Upstash
    lazyConnect: true,
    enableReadyCheck: false,
    enableOfflineQueue: true,

    maxRetriesPerRequest: 1,
    connectTimeout: 10000,
    commandTimeout: 10000,

    retryStrategy(times) {
      if (times > 2) return null;
      return Math.min(times * 300, 1000);
    },
  });

  client.on("connect", () => {
    console.log("Redis connected successfully");
  });

  client.on("ready", () => {
    console.log("Redis ready");
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

async function ensureRedisConnected(client: Redis) {
  if (client.status === "ready") return;

  if (client.status === "wait" || client.status === "end" || client.status === "close") {
    await client.connect();
    return;
  }

  // If connection is already connecting, wait briefly until it becomes ready
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Redis ready timeout"));
    }, 5000);

    client.once("ready", () => {
      clearTimeout(timeout);
      resolve();
    });

    client.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

export async function safeRedis<T>(
  callback: (client: Redis) => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const client = getRedisClient();

    return await Promise.race([
      (async () => {
        await ensureRedisConnected(client);
        return callback(client);
      })(),

      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Redis operation timeout")), 10000)
      ),
    ]);
  } catch (error: any) {
    console.error("SAFE REDIS ERROR:", error?.message || error);
    return fallback;
  }
}