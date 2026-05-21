"use client";

import { useInterviewStore } from "@/features/interview/interview.store";

// 🔥 FIX: import at top
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function DashboardPage() {
  const { scores, feedbacks } = useInterviewStore();

  const hasHydrated = useInterviewStore((state) => state._hasHydrated);

  if (!hasHydrated) {
    return <div className="text-white p-6">Loading...</div>;
  }


  const totalInterviews = scores.length;

  const averageScore =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : 0;

  // 🔥 chart data
  const data = scores.map((score, i) => ({
    index: i + 1,
    score,
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">

      <h1 className="text-3xl font-bold mb-6 hover:text-blue-400 cursor-pointer">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-xl">
          <h2>Total Questions</h2>
          <p className="text-2xl">{totalInterviews}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl">
          <h2>Average Score</h2>
          <p className="text-2xl">{averageScore}</p>
        </div>
      </div>

      {/* 🔥 GRAPH */}
      <div className="bg-gray-800 p-4 rounded-xl mb-6">
        <h2 className="mb-4 font-semibold">Performance Graph</h2>

        <LineChart width={400} height={300} data={data}>
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="score" />
        </LineChart>
      </div>

      {/* Weak Areas */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <h2 className="mb-2 font-semibold">Weak Areas</h2>

        <ul className="list-disc ml-5">
          {feedbacks.map((f, i) => (
            <li key={i}>
              {f.weaknesses.join(", ")}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}