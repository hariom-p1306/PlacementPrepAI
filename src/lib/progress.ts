import { safeRedis } from "@/lib/redis";

const USER_ID = "demo-user";

const keys = {
  resumeResults: `placementprep:${USER_ID}:resume_results`,
  interviewResults: `placementprep:${USER_ID}:interview_results`,
};

export type ResumeProgressPayload = {
  targetRole: string;
  score?: number;
  ats_score?: number;
  skills_match?: number;
  keyword_match?: number;
  strengths?: string[];
  weaknesses?: string[];
  missing_skills?: string[];
  suggestions?: string;
  recommended_roadmap?: string[];
};

export type InterviewProgressPayload = {
  interviewType: string;
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  improvement_tips?: string[];
  question?: string;
};

type ResumeProgressItem = ResumeProgressPayload & {
  type: "RESUME_ANALYSIS";
  createdAt: string;
};

type InterviewProgressItem = InterviewProgressPayload & {
  type: "INTERVIEW";
  createdAt: string;
};

function safeParseJson<T>(item: string): T | null {
  try {
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function saveResumeProgress(data: ResumeProgressPayload) {
  const payload: ResumeProgressItem = {
    type: "RESUME_ANALYSIS",
    ...data,
    createdAt: new Date().toISOString(),
  };

  await safeRedis(
    async (redis) => {
      await redis.lpush(keys.resumeResults, JSON.stringify(payload));
      await redis.ltrim(keys.resumeResults, 0, 49);
      return true;
    },
    false
  );

  return payload;
}

export async function saveInterviewProgress(data: InterviewProgressPayload) {
  const payload: InterviewProgressItem = {
    type: "INTERVIEW",
    ...data,
    createdAt: new Date().toISOString(),
  };

  await safeRedis(
    async (redis) => {
      await redis.lpush(keys.interviewResults, JSON.stringify(payload));
      await redis.ltrim(keys.interviewResults, 0, 99);
      return true;
    },
    false
  );

  return payload;
}

export async function getDashboardProgress() {
  const resumeRaw = await safeRedis(
    async (redis) => redis.lrange(keys.resumeResults, 0, 49),
    [] as string[]
  );

  const interviewRaw = await safeRedis(
    async (redis) => redis.lrange(keys.interviewResults, 0, 99),
    [] as string[]
  );

  const resumeResults = resumeRaw
    .map((item) => safeParseJson<ResumeProgressItem>(item))
    .filter((item): item is ResumeProgressItem => Boolean(item));

  const interviewResults = interviewRaw
    .map((item) => safeParseJson<InterviewProgressItem>(item))
    .filter((item): item is InterviewProgressItem => Boolean(item));

  const totalInterviews = interviewResults.length;

  const averageScore =
    totalInterviews > 0
      ? Number(
          (
            interviewResults.reduce(
              (sum, item) => sum + Number(item.score || 0),
              0
            ) / totalInterviews
          ).toFixed(1)
        )
      : 0;

  const dsaSolved = interviewResults.filter(
    (item) => String(item.interviewType || "").toLowerCase() === "dsa"
  ).length;

  const latestResume = resumeResults[0] || null;

  const resumeAtsScore = Number(latestResume?.ats_score || 0);

  const weakAreaMap: Record<string, number> = {};

  interviewResults.forEach((item) => {
    const weaknesses = normalizeArray(item.weaknesses);

    weaknesses.forEach((weakness) => {
      const key = normalizeWeakArea(weakness);
      weakAreaMap[key] = (weakAreaMap[key] || 0) + 1;
    });
  });

  resumeResults.forEach((item) => {
    const missingSkills = normalizeArray(item.missing_skills);

    missingSkills.forEach((skill) => {
      const key = normalizeWeakArea(skill);
      weakAreaMap[key] = (weakAreaMap[key] || 0) + 1;
    });
  });

  const weakAreas = Object.entries(weakAreaMap)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.min(30 + count * 15, 90),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentActivity = [
    ...interviewResults.map((item) => ({
      title: `${item.interviewType || "General"} Interview`,
      subtitle: item.question || "Practice session",
      score: `${item.score || 0}/10`,
      date: item.createdAt,
      type: "INTERVIEW" as const,
    })),

    ...resumeResults.map((item) => ({
      title: "Resume Analysis",
      subtitle: item.targetRole || "Resume feedback",
      score: `${item.ats_score || 0}%`,
      date: item.createdAt,
      type: "RESUME_ANALYSIS" as const,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return {
    totalInterviews,
    averageScore,
    dsaSolved,
    resumeAtsScore,
    weakAreas,
    recentActivity,
    latestResume,
    resumeResults,
    interviewResults,
  };
}

function normalizeWeakArea(text: string) {
  const value = text.toLowerCase();

  if (value.includes("dp") || value.includes("dynamic")) return "DP";
  if (value.includes("oops") || value.includes("object")) return "OOPS";
  if (value.includes("dbms") || value.includes("sql")) return "DBMS";
  if (value.includes("communication") || value.includes("english")) {
    return "Communication";
  }
  if (value.includes("docker")) return "Docker";
  if (value.includes("cloud") || value.includes("aws")) return "Cloud";
  if (value.includes("testing")) return "Testing";
  if (value.includes("system design")) return "System Design";
  if (value.includes("frontend")) return "Frontend";
  if (value.includes("backend")) return "Backend";

  return text.length > 22 ? `${text.slice(0, 22)}...` : text;
}