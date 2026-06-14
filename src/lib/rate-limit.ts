import { NextResponse } from "next/server";
import { safeRedis } from "@/lib/redis";

type RateLimitInput = {
  key: string;
  limit?: number;
  windowSeconds?: number;
  prefix?: string;
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
};

function sanitizeKey(key: string) {
  return key.replace(/[^a-zA-Z0-9:_@.-]/g, "_");
}

export async function rateLimit({
  key,
  limit = 10,
  windowSeconds = 60,
  prefix = "rate-limit",
}: RateLimitInput): Promise<RateLimitResult> {
  const safeKey = sanitizeKey(key);
  const redisKey = `${prefix}:${safeKey}`;

  return safeRedis<RateLimitResult>(
    async (client) => {
      const count = await client.incr(redisKey);

      if (count === 1) {
        await client.expire(redisKey, windowSeconds);
      }

      const ttl = await client.ttl(redisKey);
      const retryAfter = ttl > 0 ? ttl : windowSeconds;
      const reset = Math.floor(Date.now() / 1000) + retryAfter;

      return {
        success: count <= limit,
        limit,
        remaining: Math.max(limit - count, 0),
        reset,
        retryAfter: count > limit ? retryAfter : 0,
      };
    },
    {
      // If Redis is down, do not break the app.
      // We allow the request and log error from safeRedis.
      success: true,
      limit,
      remaining: limit,
      reset: Math.floor(Date.now() / 1000) + windowSeconds,
      retryAfter: 0,
    }
  );
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
    ...(result.retryAfter > 0
      ? { "Retry-After": String(result.retryAfter) }
      : {}),
  };
}

export function tooManyRequestsResponse(result: RateLimitResult) {
  return NextResponse.json(
    {
      error: "Too many requests. Please try again after some time.",
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers: rateLimitHeaders(result),
    }
  );
}