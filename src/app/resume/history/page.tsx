"use client";

import { useEffect, useState } from "react";

type ResumeAnalysis = {
  id: string;
  targetRole: string;
  score: number;
  atsScore: number;
  skillsMatch: number;
  keywordMatch: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestions: string;
  recommendedRoadmap: string[];
  roleFitSummary: string | null;
  atsNote: string | null;
  createdAt: string;
};

export default function ResumeHistoryPage() {
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResumeHistory() {
      try {
        const res = await fetch("/api/resume/history");
        const data = await res.json();

        setAnalyses(data.analyses || []);
      } catch (error) {
        console.error("Failed to fetch resume history:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchResumeHistory();
  }, []);

  const formatDate = (date?: string | null) => {
    if (!date) return "Recently";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80 || score >= 8) return "text-green-400";
    if (score >= 50 || score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        Loading resume history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Resume Analysis History
            </h1>

            <p className="text-gray-400 mt-2">
              Review your previous resume analyses, ATS scores, skill match,
              missing skills, and improvement roadmap.
            </p>
          </div>

          <a
            href="/resume"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold text-center"
          >
            Analyze New Resume
          </a>
        </div>

        {analyses.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">
              No resume analyses yet
            </h2>

            <p className="text-gray-400 mb-5">
              Analyze your resume once to see your history here.
            </p>

            <a
              href="/resume"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold"
            >
              Analyze Resume
            </a>
          </div>
        ) : (
          <div className="space-y-5">
            {analyses.map((analysis) => {
              const isExpanded = expandedId === analysis.id;

              return (
                <div
                  key={analysis.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500 text-blue-300 text-xs">
                          {analysis.targetRole}
                        </span>

                        <span className="px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500 text-purple-300 text-xs">
                          ATS {Math.round(analysis.atsScore)}%
                        </span>
                      </div>

                      <h2 className="text-xl font-bold">
                        {analysis.targetRole} Resume Analysis
                      </h2>

                      <p className="text-sm text-gray-400 mt-1">
                        Created on {formatDate(analysis.createdAt)}
                      </p>

                      <p className="text-sm text-gray-400 mt-2 max-w-2xl">
                        {analysis.roleFitSummary ||
                          "Role fit summary is not available."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-center">
                        <p className="text-xs text-gray-500">Score</p>
                        <p
                          className={`text-xl font-bold ${getScoreColor(
                            analysis.score
                          )}`}
                        >
                          {analysis.score}/10
                        </p>
                      </div>

                      <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-center">
                        <p className="text-xs text-gray-500">ATS</p>
                        <p
                          className={`text-xl font-bold ${getScoreColor(
                            analysis.atsScore
                          )}`}
                        >
                          {Math.round(analysis.atsScore)}%
                        </p>
                      </div>

                      <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-center">
                        <p className="text-xs text-gray-500">Skills</p>
                        <p
                          className={`text-xl font-bold ${getScoreColor(
                            analysis.skillsMatch
                          )}`}
                        >
                          {Math.round(analysis.skillsMatch)}%
                        </p>
                      </div>

                      <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-center">
                        <p className="text-xs text-gray-500">Keywords</p>
                        <p
                          className={`text-xl font-bold ${getScoreColor(
                            analysis.keywordMatch
                          )}`}
                        >
                          {Math.round(analysis.keywordMatch)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>ATS Score</span>
                        <span>{Math.round(analysis.atsScore)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(
                            analysis.atsScore
                          )}`}
                          style={{ width: `${analysis.atsScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Skills Match</span>
                        <span>{Math.round(analysis.skillsMatch)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(
                            analysis.skillsMatch
                          )}`}
                          style={{ width: `${analysis.skillsMatch}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Keyword Match</span>
                        <span>{Math.round(analysis.keywordMatch)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(
                            analysis.keywordMatch
                          )}`}
                          style={{ width: `${analysis.keywordMatch}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : analysis.id)}
                    className="mt-5 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold"
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>

                  {isExpanded && (
                    <div className="mt-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                          <h3 className="font-bold text-green-400 mb-3">
                            Strengths
                          </h3>

                          <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
                            {(analysis.strengths || []).length > 0 ? (
                              analysis.strengths.map((item) => (
                                <li key={item}>{item}</li>
                              ))
                            ) : (
                              <li>No strengths available.</li>
                            )}
                          </ul>
                        </div>

                        <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                          <h3 className="font-bold text-red-400 mb-3">
                            Weaknesses
                          </h3>

                          <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
                            {(analysis.weaknesses || []).length > 0 ? (
                              analysis.weaknesses.map((item) => (
                                <li key={item}>{item}</li>
                              ))
                            ) : (
                              <li>No weaknesses available.</li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                        <h3 className="font-bold text-yellow-400 mb-3">
                          Missing Skills
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {(analysis.missingSkills || []).length > 0 ? (
                            analysis.missingSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1 rounded-full bg-yellow-600/20 border border-yellow-500 text-yellow-300 text-xs"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No missing skills available.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                        <h3 className="font-bold text-blue-400 mb-3">
                          Suggestions
                        </h3>

                        <p className="text-gray-300 text-sm leading-7 whitespace-pre-wrap">
                          {analysis.suggestions || "No suggestions available."}
                        </p>
                      </div>

                      <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                        <h3 className="font-bold text-purple-400 mb-3">
                          Recommended Roadmap
                        </h3>

                        <ol className="list-decimal list-inside text-gray-300 space-y-2 text-sm">
                          {(analysis.recommendedRoadmap || []).length > 0 ? (
                            analysis.recommendedRoadmap.map((step) => (
                              <li key={step}>{step}</li>
                            ))
                          ) : (
                            <li>No roadmap available.</li>
                          )}
                        </ol>
                      </div>

                      <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                        <h3 className="font-bold text-gray-300 mb-3">
                          ATS Note
                        </h3>

                        <p className="text-gray-400 text-sm leading-7">
                          {analysis.atsNote || "ATS note is not available."}
                        </p>
                      </div>
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