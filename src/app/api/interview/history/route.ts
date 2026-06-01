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
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const sessions = await prisma.interviewSession.findMany({
      where: {
        userId: dbUser.id,
        completedAt: {
          not: null,
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 30,
      select: {
        id: true,
        interviewType: true,
        topic: true,
        difficulty: true,
        totalScore: true,
        averageScore: true,
        startedAt: true,
        completedAt: true,
        answers: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            question: true,
            answer: true,
            score: true,
            strengths: true,
            weaknesses: true,
            improvementTips: true,
            idealAnswer: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        sessions,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("INTERVIEW HISTORY API ERROR:", getErrorMessage(error));

    return NextResponse.json(
      {
        sessions: [],
        error: getErrorMessage(error),
      },
      { status: 200 }
    );
  }
}