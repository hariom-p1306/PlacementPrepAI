import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | undefined;
}

function createRedisClient() {
  if (!redisUrl) {
    console.warn("REDIS_URL is not defined. Redis will use local fallback.");
  }

  return new Redis(redisUrl || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    connectTimeout: 10000,

    retryStrategy(times) {
      if (times > 2) return null;
      return Math.min(times * 200, 1000);
    },
  });
}

export const redis = global.redisClient || createRedisClient();

if (process.env.NODE_ENV !== "production") {
  global.redisClient = redis;
}

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});