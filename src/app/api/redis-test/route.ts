import { NextResponse } from "next/server";
import { safeRedis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await safeRedis(
    async (redis) => {
      await redis.set("placementprep-test", "Redis is working in PlacementPrep AI");
      const value = await redis.get("placementprep-test");

      return {
        success: true,
        message: "Redis connected successfully",
        value,
      };
    },
    {
      success: false,
      message: "Redis connection failed",
      value: null,
    }
  );

  return NextResponse.json(result);
}