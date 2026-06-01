"use client";

import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/features/interview/interview.store";
import { useState } from "react";

const interviewCategories = [
  {
    label: "DSA",
    value: "DSA",
    icon: "💻",
    description: "Coding, problem-solving, and logic building",
  },
  {
    label: "HR",
    value: "HR",
    icon: "🧑‍💼",
    description: "Communication, behavior, and personality questions",
  },
  {
    label: "DBMS",
    value: "DBMS",
    icon: "🗄️",
    description: "Database, SQL, keys, joins, and transactions",
  },
  {
    label: "OOPS",
    value: "OOPS",
    icon: "🧩",
    description: "Object-oriented programming concepts",
  },
];

const difficultyLevels = [
  {
    label: "Easy",
    description: "Basic fresher-level questions",
  },
  {
    label: "Medium",
    description: "Concept + explanation based questions",
  },
  {
    label: "Hard",
    description: "Scenario-based but fresher-friendly questions",
  },
];

const topicsByCategory: Record<string, string[]> = {
  DSA: ["Array", "String", "Linked List", "Stack", "Queue", "Recursion", "DP"],
  HR: [
    "Introduction",
    "Strengths & Weaknesses",
    "Projects",
    "Teamwork",
    "Challenges",
    "Internship",
  ],
  DBMS: [
    "Keys",
    "Normalization",
    "Joins",
    "Indexing",
    "Transactions",
    "ACID",
    "SQL Basics",
  ],
  OOPS: [
    "Class & Object",
    "Inheritance",
    "Polymorphism",
    "Encapsulation",
    "Abstraction",
    "Interface",
    "Constructor",
  ],
};

export default function StartPage() {
  const router = useRouter();

  const reset = useInterviewStore((state) => state.reset);
  const setInterviewType = useInterviewStore(
    (state) => state.setInterviewType
  );

  const [selected, setSelected] = useState<string>("DSA");
  const [topic, setTopic] = useState<string>(topicsByCategory["DSA"][0]);
  const [difficulty, setDifficulty] = useState<string>("Easy");

  const handleCategoryChange = (category: string) => {
    setSelected(category);
    setTopic(topicsByCategory[category][0]);
    setDifficulty("Easy");
  };

  const handleStart = () => {
    if (!selected) return;

    const interviewConfig = {
      interviewType: selected,
      topic,
      difficulty,
    };

    reset();
    setInterviewType(selected);

    /*
      localStorage backup:
      Session page can read this config and send it to /api/interview/generate.
    */
    localStorage.setItem("interviewConfig", JSON.stringify(interviewConfig));

    router.push("/interview/session");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-gray-900 flex items-center justify-center text-white px-4 py-10">
      <div className="w-full max-w-4xl bg-gray-900/80 backdrop-blur-md border border-gray-700 p-6 md:p-8 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎯</div>

          <h1 className="text-3xl md:text-4xl font-bold">
            AI Mock Interview
          </h1>

          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
            Practice real placement interview questions with AI evaluation,
            score tracking, and improvement feedback.
          </p>
        </div>

        {/* Category Selection */}
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-3">
            1. Select Interview Type
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {interviewCategories.map((category) => {
              const isActive = selected === category.value;

              return (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isActive
                      ? "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-950/40"
                      : "bg-gray-800 border-gray-700 hover:border-blue-400 hover:bg-gray-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-bold text-lg">
                      {category.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 leading-6">
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Selection */}
        <div className="mb-7">
          <h2 className="text-lg font-semibold mb-3">2. Select Topic</h2>

          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {topicsByCategory[selected].map((topicName) => (
              <option key={topicName} value={topicName}>
                {topicName}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-7">
          <h2 className="text-lg font-semibold mb-3">
            3. Select Difficulty
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {difficultyLevels.map((level) => {
              const isActive = difficulty === level.label;

              return (
                <button
                  key={level.label}
                  onClick={() => setDifficulty(level.label)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isActive
                      ? "bg-green-600/20 border-green-500 shadow-lg shadow-green-950/40"
                      : "bg-gray-800 border-gray-700 hover:border-green-400"
                  }`}
                >
                  <p
                    className={`font-bold ${
                      isActive ? "text-green-400" : "text-white"
                    }`}
                  >
                    {level.label}
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    {level.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Summary */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 mb-7">
          <h3 className="font-semibold mb-4">Selected Interview Setup</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Type</p>
              <p className="font-bold text-blue-400">{selected}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Topic</p>
              <p className="font-bold text-purple-400">{topic}</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Difficulty</p>
              <p className="font-bold text-green-400">{difficulty}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7 text-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            ✅ Real interview questions
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            🤖 AI evaluation
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            📊 Performance scoring
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={!selected}
          className={`w-full py-3 rounded-xl text-lg font-semibold transition ${
            selected
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          Start Interview
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          You will get 3 questions based on selected type, topic, and
          difficulty.
        </p>
      </div>
    </div>
  );
}