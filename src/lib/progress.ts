import { redis } from "@/lib/redis";

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

export async function saveResumeProgress(data: ResumeProgressPayload) {
  const payload = {
    type: "RESUME_ANALYSIS",
    ...data,
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(keys.resumeResults, JSON.stringify(payload));
  await redis.ltrim(keys.resumeResults, 0, 49);

  return payload;
}

export async function saveInterviewProgress(data: InterviewProgressPayload) {
  const payload = {
    type: "INTERVIEW",
    ...data,
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(keys.interviewResults, JSON.stringify(payload));
  await redis.ltrim(keys.interviewResults, 0, 99);

  return payload;
}

export async function getDashboardProgress() {
  const resumeRaw = await redis.lrange(keys.resumeResults, 0, 49);
  const interviewRaw = await redis.lrange(keys.interviewResults, 0, 99);

  const resumeResults = resumeRaw
    .map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const interviewResults = interviewRaw
    .map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

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
    (item) => item.interviewType === "DSA"
  ).length;

  const latestResume = resumeResults[0];

  const resumeAtsScore = latestResume?.ats_score || 0;

  const weakAreaMap: Record<string, number> = {};

  interviewResults.forEach((item) => {
    const weaknesses = item.weaknesses || [];

    weaknesses.forEach((weakness: string) => {
      const key = normalizeWeakArea(weakness);
      weakAreaMap[key] = (weakAreaMap[key] || 0) + 1;
    });
  });

  resumeResults.forEach((item) => {
    const missingSkills = item.missing_skills || [];

    missingSkills.forEach((skill: string) => {
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
      title: `${item.interviewType} Interview`,
      subtitle: item.question || "Practice session",
      score: `${item.score || 0}/10`,
      date: item.createdAt,
      type: "INTERVIEW",
    })),
    ...resumeResults.map((item) => ({
      title: "Resume Analysis",
      subtitle: item.targetRole || "Resume feedback",
      score: `${item.ats_score || 0}%`,
      date: item.createdAt,
      type: "RESUME_ANALYSIS",
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
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
  if (value.includes("communication") || value.includes("english"))
    return "Communication";
  if (value.includes("docker")) return "Docker";
  if (value.includes("cloud") || value.includes("aws")) return "Cloud";
  if (value.includes("testing")) return "Testing";
  if (value.includes("system design")) return "System Design";
  if (value.includes("frontend")) return "Frontend";
  if (value.includes("backend")) return "Backend";

  return text.length > 22 ? `${text.slice(0, 22)}...` : text;
}