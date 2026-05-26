import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  await redis.set("placementprep-test", "Redis is working in PlacementPrep-AI");

  const value = await redis.get("placementprep-test");

  return NextResponse.json({
    success: true,
    message: value,
  });
}