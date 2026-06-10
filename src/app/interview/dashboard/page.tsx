"use client";

import { useEffect, useMemo, useState } from "react";

type WeakArea = {
  name: string;
  count?: number;
  percent: number;
};

type RecentActivity = {
  title: string;
  subtitle: string;
  score: string;
  date: string;
  type: "INTERVIEW" | "RESUME_ANALYSIS";
};

type DashboardData = {
  totalInterviews: number;
  averageScore: number;
  dsaSolved: number;
  resumeAtsScore: number;
  weakAreas: WeakArea[];
  recentActivity: RecentActivity[];
  resumeResults?: any[];
  interviewResults?: any[];
};

const fallbackData: DashboardData = {
  totalInterviews: 0,
  averageScore: 0,
  dsaSolved: 0,
  resumeAtsScore: 0,
  weakAreas: [],
  recentActivity: [],
  resumeResults: [],
  interviewResults: [],
};

const performanceData = [
  { date: "May 15", score: 0 },
  { date: "May 16", score: 0 },
  { date: "May 17", score: 0 },
  { date: "May 18", score: 0 },
  { date: "May 19", score: 0 },
  { date: "May 20", score: 0 },
  { date: "May 21", score: 0 },
];

const nextSteps = [
  {
    title: "Practice weak DSA topics",
    desc: "Focus on topics appearing in weak areas",
    icon: "💻",
  },
  {
    title: "Improve interview answers",
    desc: "Revise answers where score is low",
    icon: "🗣️",
  },
  {
    title: "Optimize resume keywords",
    desc: "Add role-specific skills for ATS",
    icon: "📄",
  },
  {
    title: "Review recommended roadmap",
    desc: "Follow the roadmap generated from your resume",
    icon: "🧭",
  },
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData>(fallbackData);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 20000);

    try {
      setLoading(true);

      const res = await fetch("/api/dashboard", {
        cache: "no-store",
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Dashboard API failed:", data);
        setDashboard(fallbackData);
        return;
      }

      setDashboard({
        ...fallbackData,
        ...data,
      });
    } catch (error: any) {
      if (error?.name === "AbortError") {
        console.error("Dashboard request timed out");
      } else {
        console.error("Dashboard fetch error:", error);
      }

      setDashboard(fallbackData);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = useMemo(
    () => [
      {
        title: "Total Interviews",
        value: String(dashboard.totalInterviews || 0),
        change:
          dashboard.totalInterviews > 0
            ? "Tracked from your sessions"
            : "No interview tracked yet",
        icon: "👤",
        color: "blue",
      },
      {
        title: "Average Score",
        value: `${dashboard.averageScore || 0}/10`,
        change:
          dashboard.averageScore > 0
            ? "Based on interview feedback"
            : "Submit an interview to update",
        icon: "📈",
        color: "green",
      },
      {
        title: "DSA Solved",
        value: String(dashboard.dsaSolved || 0),
        change:
          dashboard.dsaSolved > 0
            ? "DSA sessions completed"
            : "No DSA session tracked yet",
        icon: "💻",
        color: "purple",
      },
      {
        title: "Resume ATS Score",
        value: `${dashboard.resumeAtsScore || 0}%`,
        change:
          dashboard.resumeAtsScore > 0
            ? "Latest resume analysis"
            : "Analyze resume to update",
        icon: "📄",
        color: "yellow",
      },
    ],
    [dashboard]
  );

  const dynamicPerformanceData = useMemo(() => {
    const interviews = dashboard.interviewResults || [];

    if (!interviews.length) return performanceData;

    const latest = interviews.slice(0, 7).reverse();

    return latest.map((item: any, index: number) => ({
      date: formatShortDate(item.createdAt) || `Attempt ${index + 1}`,
      score: Number(item.score || 0),
    }));
  }, [dashboard.interviewResults]);

  const streak = useMemo(() => {
    return calculateStreak([
      ...(dashboard.interviewResults || []),
      ...(dashboard.resumeResults || []),
    ]);
  }, [dashboard.interviewResults, dashboard.resumeResults]);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl">
            🧩
          </div>

          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Track your real interview preparation progress from Redis.
            </p>
          </div>
        </div>

        <button
          onClick={fetchDashboard}
          className="border border-gray-700 bg-gray-900 hover:bg-gray-800 px-4 py-3 rounded-xl text-gray-300"
        >
          {loading ? "Refreshing..." : "🔄 Refresh Dashboard"}
        </button>
      </div>

      {/* Empty State Notice */}
      {!loading &&
        dashboard.totalInterviews === 0 &&
        dashboard.resumeAtsScore === 0 && (
          <div className="mb-5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-xl p-4">
            No real progress data found yet. Analyze a resume or complete an
            interview session to update this dashboard.
          </div>
        )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item) => (
          <StatCard key={item.title} item={item} />
        ))}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        {/* Performance Graph */}
        <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">📊 Performance Overview</h2>

            <select className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300">
              <option>Interview Score</option>
            </select>
          </div>

          <div className="h-72 relative border-l border-b border-gray-700 pl-4 pb-4">
            <div className="absolute left-0 top-0 h-full w-full pointer-events-none">
              {[10, 8, 6, 4, 2, 0].map((num, index) => (
                <div
                  key={num}
                  className="absolute left-0 right-0 border-t border-gray-800 text-xs text-gray-500"
                  style={{ top: `${index * 20}%` }}
                >
                  <span className="-ml-8">{num}</span>
                </div>
              ))}
            </div>

            <div className="relative h-full flex items-end justify-between gap-2">
              {dynamicPerformanceData.map((item, index) => (
                <div
                  key={`${item.date}-${index}`}
                  className="flex flex-col items-center justify-end h-full flex-1"
                >
                  <span className="text-xs mb-2 text-gray-300">
                    {item.score}
                  </span>

                  <div
                    className="w-full max-w-8 bg-blue-500 rounded-t-lg shadow-[0_0_18px_rgba(59,130,246,0.5)]"
                    style={{ height: `${Math.max(item.score * 10, 4)}%` }}
                  />

                  <span className="text-xs mt-3 text-gray-500 rotate-[-20deg] hidden sm:block">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-gray-400 text-sm mt-5">
            {dashboard.totalInterviews > 0 ? (
              <>
                🕒 Performance is based on your saved interview evaluations.
              </>
            ) : (
              <>🕒 Complete interview sessions to generate performance graph.</>
            )}
          </p>
        </div>

        {/* Weak Areas */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">🎯 Weak Areas</h2>

          {dashboard.weakAreas.length > 0 ? (
            <div className="space-y-5">
              {dashboard.weakAreas.map((area) => (
                <div key={area.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 rounded-lg bg-gray-950 border border-gray-700 text-sm">
                      {area.name}
                    </span>

                    <span className="text-sm text-gray-300">
                      {area.percent}%
                    </span>
                  </div>

                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${area.percent}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Found {area.count || 1} time(s)
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-center text-gray-500">
              No weak areas yet. Submit interviews or analyze resume to generate
              insights.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        {/* Streak */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">🔥 Preparation Streak</h2>

          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold">{streak}</span>
            <span className="text-gray-400 mb-1">days</span>
          </div>

          <p className="text-gray-400 mt-3 text-sm">
            {streak > 0
              ? "Keep it up! Consistency is the key."
              : "Start practicing today to build your streak."}
          </p>

          <div className="flex justify-between mt-6">
            {getLastSixDays().map((day) => (
              <div key={day.label} className="flex flex-col items-center gap-2">
                <div
                  className={`h-10 w-10 rounded-full border flex items-center justify-center ${day.active
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : "bg-gray-800 border-gray-700 text-gray-500"
                    }`}
                >
                  {day.active ? "✓" : "•"}
                </div>
                <span className="text-xs text-gray-400">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Overall Progress</h2>

          <div className="flex items-center gap-6">
            <div className="h-32 w-32 rounded-full border-[12px] border-blue-500 flex items-center justify-center">
              <span className="text-2xl font-bold">
                {getOverallProgress(dashboard)}%
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <span className="text-blue-400">●</span> Interviews{" "}
                <span className="text-gray-400">
                  {dashboard.totalInterviews}
                </span>
              </p>
              <p>
                <span className="text-yellow-400">●</span> Resume Reports{" "}
                <span className="text-gray-400">
                  {dashboard.resumeResults?.length || 0}
                </span>
              </p>
              <p>
                <span className="text-green-400">●</span> DSA Solved{" "}
                <span className="text-gray-400">{dashboard.dsaSolved}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Next Steps */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-5">✨ Recommended Next Steps</h2>

          <div className="space-y-4">
            {nextSteps.map((step) => (
              <div
                key={step.title}
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-950 border border-gray-800 hover:border-blue-500 transition cursor-pointer"
              >
                <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  {step.icon}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </div>

                <span className="text-gray-500">›</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">🕒 Recent Activity</h2>
          <button className="text-blue-400 hover:text-blue-300 text-sm">
            View All ›
          </button>
        </div>

        {dashboard.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {dashboard.recentActivity.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-4 rounded-xl bg-gray-950 border border-gray-800"
              >
                <div className="md:col-span-2 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    {item.type === "RESUME_ANALYSIS" ? "📄" : "💻"}
                  </div>

                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.subtitle}</p>
                  </div>
                </div>

                <p className="text-green-400 font-semibold">{item.score}</p>

                <p className="text-gray-400 text-sm">
                  {formatDate(item.date)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-500">
            No recent activity yet.
          </div>
        )}
      </div>

      <p className="text-gray-400 text-sm mt-6">
        You&apos;re doing great! 🚀 Stay consistent and keep improving.
      </p>
    </div>
  );
}

function StatCard({ item }: { item: any }) {
  const colorMap: any = {
    blue: "border-blue-500 bg-blue-500/10 text-blue-400",
    green: "border-green-500 bg-green-500/10 text-green-400",
    purple: "border-purple-500 bg-purple-500/10 text-purple-400",
    yellow: "border-yellow-500 bg-yellow-500/10 text-yellow-400",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between gap-4">
      <div
        className={`h-16 w-16 rounded-2xl border flex items-center justify-center text-2xl ${colorMap[item.color]
          }`}
      >
        {item.icon}
      </div>

      <div className="flex-1">
        <p className="text-gray-400 text-sm">{item.title}</p>
        <h2 className="text-3xl font-bold mt-1">{item.value}</h2>
        <p className="text-green-400 text-sm mt-2">{item.change}</p>
      </div>
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(date?: string) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function getOverallProgress(data: DashboardData) {
  const interviewPart = Math.min(data.totalInterviews * 10, 40);
  const dsaPart = Math.min(data.dsaSolved * 5, 30);
  const resumePart = data.resumeAtsScore > 0 ? 30 : 0;

  return Math.min(interviewPart + dsaPart + resumePart, 100);
}

function calculateStreak(items: any[]) {
  if (!items.length) return 0;

  const activeDates = new Set(
    items
      .map((item) => item.createdAt)
      .filter(Boolean)
      .map((date) => new Date(date).toDateString())
  );

  let streak = 0;
  const current = new Date();

  while (activeDates.has(current.toDateString())) {
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

function getLastSixDays() {
  const days = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    days.push({
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      active: false,
    });
  }

  return days;
}