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

export async function DELETE() {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          deletedCount: 0,
          error: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    const result = await prisma.interviewSession.deleteMany({
      where: {
        userId: dbUser.id,
        completedAt: null,
        answers: {
          none: {},
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        deletedCount: result.count,
        message: `${result.count} incomplete interview session(s) cleaned.`,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("INTERVIEW CLEANUP ERROR:", getErrorMessage(error));

    return NextResponse.json(
      {
        success: false,
        deletedCount: 0,
        error: getErrorMessage(error),
      },
      { status: 200 }
    );
  }
}