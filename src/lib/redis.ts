import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | undefined;
}

export const redis =
  global.redisClient ||
  new Redis(redisUrl || "redis://localhost:6379", {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 2) return null;
      return Math.min(times * 100, 1000);
    },
  });

if (process.env.NODE_ENV !== "production") {
  global.redisClient = redis;
}

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});