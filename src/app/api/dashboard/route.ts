import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

type CompletedInterview = {
  id: string;
  interviewType: string;
  topic: string | null;
  difficulty: string | null;
  totalScore: number | null;
  averageScore: number | null;
  startedAt: Date;
  completedAt: Date | null;
};

type InterviewAnswerWeakness = {
  weaknesses: string[];
};

type ResumeAnalysisSummary = {
  id: string;
  targetRole: string;
  score: number;
  atsScore: number;
  skillsMatch: number;
  keywordMatch: number;
  createdAt: Date;
};

type WeakArea = {
  name: string;
  count: number;
  percent: number;
};

type RecentActivity = {
  title: string;
  subtitle: string;
  score: string;
  date: string;
  type: "INTERVIEW" | "RESUME_ANALYSIS";
};

type RecentActivityWithTimestamp = RecentActivity & {
  sortTimestamp: number;
};

type InterviewResult = {
  id: string;
  interviewType: string;
  topic: string | null;
  difficulty: string | null;
  score: number;
  totalScore: number;
  averageScore: number;
  createdAt: Date;
};

type ResumeResult = {
  id: string;
  targetRole: string;
  score: number;
  atsScore: number;
  skillsMatch: number;
  keywordMatch: number;
  createdAt: Date;
};

const fallbackDashboard = {
  totalInterviews: 0,
  averageScore: 0,
  dsaSolved: 0,
  resumeAtsScore: 0,
  weakAreas: [] as WeakArea[],
  recentActivity: [] as RecentActivity[],
  resumeResults: [] as ResumeResult[],
  interviewResults: [] as InterviewResult[],
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Dashboard request timeout")), ms)
    ),
  ]);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error occurred.";
}

function formatDate(date?: Date | null) {
  if (!date) return "Recently";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function buildWeakAreas(answers: InterviewAnswerWeakness[]): WeakArea[] {
  const weaknessMap = new Map<string, number>();

  for (const answer of answers) {
    for (const weakness of answer.weaknesses || []) {
      const cleanWeakness = weakness.trim();

      if (!cleanWeakness) continue;

      weaknessMap.set(cleanWeakness, (weaknessMap.get(cleanWeakness) || 0) + 1);
    }
  }

  const totalWeaknessCount = Array.from(weaknessMap.values()).reduce(
    (sum: number, count: number) => sum + count,
    0
  );

  if (totalWeaknessCount === 0) return [];

  return Array.from(weaknessMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / totalWeaknessCount) * 100),
    }));
}

async function getPostgresDashboard() {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return {
      ...fallbackDashboard,
      error: "Unauthorized. Please login first.",
    };
  }

  const [
    completedInterviewsData,
    allInterviewAnswersData,
    latestResumeAnalysis,
    resumeAnalysesData,
  ] = await Promise.all([
    prisma.interviewSession.findMany({
      where: {
        userId: dbUser.id,
        completedAt: {
          not: null,
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        interviewType: true,
        topic: true,
        difficulty: true,
        totalScore: true,
        averageScore: true,
        startedAt: true,
        completedAt: true,
      },
    }),

    prisma.interviewAnswer.findMany({
      where: {
        session: {
          userId: dbUser.id,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      select: {
        weaknesses: true,
      },
    }),

    prisma.resumeAnalysis.findFirst({
      where: {
        userId: dbUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        atsScore: true,
      },
    }),

    prisma.resumeAnalysis.findMany({
      where: {
        userId: dbUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        targetRole: true,
        score: true,
        atsScore: true,
        skillsMatch: true,
        keywordMatch: true,
        createdAt: true,
      },
    }),
  ]);

  const completedInterviews =
    completedInterviewsData as CompletedInterview[];

  const allInterviewAnswers =
    allInterviewAnswersData as InterviewAnswerWeakness[];

  const resumeAnalyses = resumeAnalysesData as ResumeAnalysisSummary[];

  const totalInterviews = completedInterviews.length;

  const scoredInterviews = completedInterviews.filter(
    (session: CompletedInterview) => session.averageScore !== null
  );

  const averageScore =
    scoredInterviews.length > 0
      ? Number(
          (
            scoredInterviews.reduce(
              (sum: number, session: CompletedInterview) =>
                sum + Number(session.averageScore || 0),
              0
            ) / scoredInterviews.length
          ).toFixed(1)
        )
      : 0;

  const dsaSolved = completedInterviews.filter(
    (session: CompletedInterview) => session.interviewType === "DSA"
  ).length;

  const resumeAtsScore =
    typeof latestResumeAnalysis?.atsScore === "number"
      ? Math.round(latestResumeAnalysis.atsScore)
      : 0;

  const interviewResults: InterviewResult[] = completedInterviews.map(
    (session: CompletedInterview) => ({
      id: session.id,
      interviewType: session.interviewType,
      topic: session.topic,
      difficulty: session.difficulty,
      score: session.averageScore || 0,
      totalScore: session.totalScore || 0,
      averageScore: session.averageScore || 0,
      createdAt: session.completedAt || session.startedAt,
    })
  );

  const resumeResults: ResumeResult[] = resumeAnalyses.map(
    (analysis: ResumeAnalysisSummary) => ({
      id: analysis.id,
      targetRole: analysis.targetRole,
      score: analysis.score,
      atsScore: analysis.atsScore,
      skillsMatch: analysis.skillsMatch,
      keywordMatch: analysis.keywordMatch,
      createdAt: analysis.createdAt,
    })
  );

  const interviewActivities: RecentActivityWithTimestamp[] = completedInterviews
    .slice(0, 5)
    .map((session: CompletedInterview) => {
      const activityDate = session.completedAt || session.startedAt;

      return {
        title: `${session.interviewType} Interview`,
        subtitle: `${session.topic || "General"} • ${
          session.difficulty || "Easy"
        }`,
        score: `${session.averageScore || 0}/10`,
        date: formatDate(activityDate),
        type: "INTERVIEW",
        sortTimestamp: activityDate.getTime(),
      };
    });

  const resumeActivities: RecentActivityWithTimestamp[] = resumeAnalyses
    .slice(0, 5)
    .map((analysis: ResumeAnalysisSummary) => ({
      title: "Resume Analysis",
      subtitle: analysis.targetRole,
      score: `${Math.round(analysis.atsScore || 0)}% ATS`,
      date: formatDate(analysis.createdAt),
      type: "RESUME_ANALYSIS",
      sortTimestamp: analysis.createdAt.getTime(),
    }));

  const recentActivity: RecentActivity[] = [
    ...interviewActivities,
    ...resumeActivities,
  ]
    .sort(
      (a: RecentActivityWithTimestamp, b: RecentActivityWithTimestamp) =>
        b.sortTimestamp - a.sortTimestamp
    )
    .slice(0, 8)
    .map(({ sortTimestamp, ...activity }) => activity);

  return {
    totalInterviews,
    averageScore,
    dsaSolved,
    resumeAtsScore,
    weakAreas: buildWeakAreas(allInterviewAnswers),
    recentActivity,
    resumeResults,
    interviewResults,
  };
}

export async function GET() {
  try {
    const dashboard = await withTimeout(getPostgresDashboard(), 7000);

    return NextResponse.json(dashboard, { status: 200 });
  } catch (error: unknown) {
    console.error("DASHBOARD API ERROR:", getErrorMessage(error));

    return NextResponse.json(
      {
        ...fallbackDashboard,
        error: getErrorMessage(error),
      },
      { status: 200 }
    );
  }
}