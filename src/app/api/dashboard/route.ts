import { NextResponse } from "next/server";
import { getDashboardProgress } from "@/lib/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const progress = await getDashboardProgress();

    return NextResponse.json(progress, { status: 200 });
  } catch (error: any) {
    console.error("DASHBOARD API ERROR:", error);

    return NextResponse.json(
      {
        totalInterviews: 0,
        averageScore: 0,
        dsaSolved: 0,
        resumeAtsScore: 0,
        weakAreas: [],
        recentActivity: [],
        resumeResults: [],
        interviewResults: [],
        error: error?.message || "Failed to load dashboard progress",
      },
      { status: 200 }
    );
  }
}