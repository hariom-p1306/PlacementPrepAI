import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | undefined;
}

export const redis =
  global.redisClient ||
  new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
  });

if (process.env.NODE_ENV !== "production") {
  global.redisClient = redis;
}

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});