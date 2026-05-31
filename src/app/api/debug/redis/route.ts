import { NextResponse } from "next/server";
import { safeRedis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RedisDebugResult = {
  connected: boolean;
  ping: string | null;
  keys: string[];
};

export async function GET() {
  const result = await safeRedis<RedisDebugResult>(
    async (redis) => {
      const ping = await redis.ping();
      const keys = await redis.keys("placementprep:*");

      return {
        connected: true,
        ping,
        keys,
      };
    },
    {
      connected: false,
      ping: null,
      keys: [],
    }
  );

  return NextResponse.json(result);
}