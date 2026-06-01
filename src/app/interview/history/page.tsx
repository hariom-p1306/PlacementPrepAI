"use client";

import { useEffect, useState } from "react";

type InterviewAnswer = {
  id: string;
  question: string;
  answer: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  idealAnswer: string | null;
  createdAt: string;
};

type InterviewSession = {
  id: string;
  interviewType: string;
  topic: string | null;
  difficulty: string | null;
  totalScore: number | null;
  averageScore: number | null;
  startedAt: string;
  completedAt: string | null;
  answers: InterviewAnswer[];
};

export default function InterviewHistoryPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null
  );

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/interview/history");
      const data = await res.json();

      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to fetch interview history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCleanupSessions = async () => {
    const confirmCleanup = window.confirm(
      "This will delete incomplete interview sessions where no answer was submitted. Completed interviews will not be deleted. Continue?"
    );

    if (!confirmCleanup) return;

    try {
      setCleanupLoading(true);

      const res = await fetch("/api/interview/cleanup", {
        method: "DELETE",
      });

      const data = await res.json();

      alert(data.message || "Cleanup completed.");

      await fetchHistory();
    } catch (error) {
      console.error("Cleanup failed:", error);
      alert("Failed to clean incomplete sessions.");
    } finally {
      setCleanupLoading(false);
    }
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "Not completed";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  const totalCompleted = sessions.length;

  const averageScore =
    sessions.length > 0
      ? Number(
          (
            sessions.reduce(
              (sum, session) => sum + Number(session.averageScore || 0),
              0
            ) / sessions.length
          ).toFixed(1)
        )
      : 0;

  const bestScore =
    sessions.length > 0
      ? Math.max(...sessions.map((session) => Number(session.averageScore || 0)))
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        Loading interview history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Interview History
            </h1>

            <p className="text-gray-400 mt-2">
              Review your completed mock interviews, scores, answers, and AI
              feedback.
            </p>
          </div>

          <button
            onClick={handleCleanupSessions}
            disabled={cleanupLoading}
            className="bg-gray-800 hover:bg-red-600 border border-gray-700 hover:border-red-500 px-5 py-3 rounded-xl font-semibold transition disabled:opacity-60"
          >
            {cleanupLoading ? "Cleaning..." : "Clean Incomplete Sessions"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-500 text-sm">Completed Interviews</p>
            <p className="text-3xl font-bold mt-2">{totalCompleted}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-500 text-sm">Average Score</p>
            <p className={`text-3xl font-bold mt-2 ${getScoreColor(averageScore)}`}>
              {averageScore}/10
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-500 text-sm">Best Score</p>
            <p className={`text-3xl font-bold mt-2 ${getScoreColor(bestScore)}`}>
              {bestScore}/10
            </p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">
              No completed interviews yet
            </h2>

            <p className="text-gray-400 mb-5">
              Complete an interview and submit your answer to see history here.
            </p>

            <a
              href="/interview/start"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold"
            >
              Start Interview
            </a>
          </div>
        ) : (
          <div className="space-y-5">
            {sessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const score = session.averageScore ?? 0;

              return (
                <div
                  key={session.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500 text-blue-300 text-xs">
                          {session.interviewType}
                        </span>

                        <span className="px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500 text-purple-300 text-xs">
                          {session.topic || "General"}
                        </span>

                        <span className="px-3 py-1 rounded-full bg-green-600/20 border border-green-500 text-green-300 text-xs">
                          {session.difficulty || "Easy"}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold">
                        {session.interviewType} Mock Interview
                      </h2>

                      <p className="text-sm text-gray-400 mt-1">
                        Completed on {formatDate(session.completedAt)}
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        Questions attempted: {session.answers.length}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-center">
                        <p className="text-xs text-gray-500">Average Score</p>
                        <p
                          className={`text-2xl font-bold ${getScoreColor(
                            score
                          )}`}
                        >
                          {score}/10
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedSessionId(isExpanded ? null : session.id)
                        }
                        className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold"
                      >
                        {isExpanded ? "Hide Feedback" : "View Feedback"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 space-y-4">
                      {session.answers.map((answer, index) => (
                        <div
                          key={answer.id}
                          className="bg-gray-950 border border-gray-800 rounded-xl p-5"
                        >
                          <div className="flex justify-between gap-4 mb-4">
                            <h3 className="font-bold">Question {index + 1}</h3>

                            <span
                              className={`font-bold ${getScoreColor(
                                answer.score
                              )}`}
                            >
                              {answer.score}/10
                            </span>
                          </div>

                          <div className="space-y-4 text-sm leading-6">
                            <div>
                              <p className="text-gray-500 font-semibold mb-1">
                                Question
                              </p>
                              <p className="text-gray-200 whitespace-pre-wrap">
                                {answer.question}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-500 font-semibold mb-1">
                                Your Answer
                              </p>
                              <p className="text-gray-300 whitespace-pre-wrap">
                                {answer.answer || "No answer submitted."}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-green-400 font-semibold mb-1">
                                  Strengths
                                </p>
                                <ul className="list-disc list-inside text-gray-300 space-y-1">
                                  {(answer.strengths || []).length > 0 ? (
                                    answer.strengths.map((item) => (
                                      <li key={item}>{item}</li>
                                    ))
                                  ) : (
                                    <li>No strengths available.</li>
                                  )}
                                </ul>
                              </div>

                              <div>
                                <p className="text-red-400 font-semibold mb-1">
                                  Weaknesses
                                </p>
                                <ul className="list-disc list-inside text-gray-300 space-y-1">
                                  {(answer.weaknesses || []).length > 0 ? (
                                    answer.weaknesses.map((item) => (
                                      <li key={item}>{item}</li>
                                    ))
                                  ) : (
                                    <li>No weaknesses available.</li>
                                  )}
                                </ul>
                              </div>
                            </div>

                            <div>
                              <p className="text-blue-400 font-semibold mb-1">
                                Improvement Tips
                              </p>
                              <ul className="list-disc list-inside text-gray-300 space-y-1">
                                {(answer.improvementTips || []).length > 0 ? (
                                  answer.improvementTips.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))
                                ) : (
                                  <li>No tips available.</li>
                                )}
                              </ul>
                            </div>

                            <div>
                              <p className="text-yellow-400 font-semibold mb-1">
                                Ideal Answer
                              </p>
                              <p className="text-gray-300 whitespace-pre-wrap">
                                {answer.idealAnswer ||
                                  "Ideal answer not available."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}