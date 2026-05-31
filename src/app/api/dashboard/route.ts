import { NextResponse } from "next/server";
import { getDashboardProgress } from "@/lib/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const fallbackDashboard = {
  totalInterviews: 0,
  averageScore: 0,
  dsaSolved: 0,
  resumeAtsScore: 0,
  weakAreas: [],
  recentActivity: [],
  resumeResults: [],
  interviewResults: [],
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Dashboard request timeout")), ms)
    ),
  ]);
}

export async function GET() {
  try {
    const progress = await withTimeout(getDashboardProgress(), 5000);

    return NextResponse.json(progress, { status: 200 });
  } catch (error: any) {
    console.error("DASHBOARD API ERROR:", error?.message || error);

    return NextResponse.json(
      {
        ...fallbackDashboard,
        error: error?.message || "Failed to load dashboard progress",
      },
      { status: 200 }
    );
  }
}