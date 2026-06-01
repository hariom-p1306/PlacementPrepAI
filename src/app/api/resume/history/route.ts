import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error occurred.";
}

export async function GET() {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first.", analyses: [] },
        { status: 401 }
      );
    }

    const analyses = await prisma.resumeAnalysis.findMany({
      where: {
        userId: dbUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
      select: {
        id: true,
        targetRole: true,
        score: true,
        atsScore: true,
        skillsMatch: true,
        keywordMatch: true,
        strengths: true,
        weaknesses: true,
        missingSkills: true,
        suggestions: true,
        recommendedRoadmap: true,
        roleFitSummary: true,
        atsNote: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        analyses,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("RESUME HISTORY API ERROR:", getErrorMessage(error));

    return NextResponse.json(
      {
        analyses: [],
        error: getErrorMessage(error),
      },
      { status: 200 }
    );
  }
}