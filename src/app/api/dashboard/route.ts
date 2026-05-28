import { NextResponse } from "next/server";
import { getDashboardProgress } from "@/lib/progress";

export const runtime = "nodejs";

export async function GET() {
  try {
    const progress = await getDashboardProgress();

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error("DASHBOARD API ERROR:", error.message);

    return NextResponse.json(
      { error: "Failed to load dashboard progress" },
      { status: 500 }
    );
  }
}