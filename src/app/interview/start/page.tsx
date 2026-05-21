"use client";

import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/features/interview/interview.store";
import { useState } from "react";

export default function StartPage() {
  const router = useRouter();

  const reset = useInterviewStore((state) => state.reset);
  const setInterviewType = useInterviewStore(
    (state) => state.setInterviewType
  );

  const [selected, setSelected] = useState<string | null>(null);

  const categories = ["DSA", "HR", "DBMS", "OOPS"];

  const handleStart = () => {
    if (!selected) return;

    reset();
    setInterviewType(selected);
    router.push("/interview/session");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center text-white">

      <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700 p-10 rounded-2xl shadow-xl text-center max-w-md w-full">

        <h1 className="text-3xl font-bold mb-4">
          AI Mock Interview
        </h1>

        <p className="text-gray-400 mb-6">
          Practice real interview questions and get instant feedback.
        </p>

        {/* 🔥 CATEGORY SELECTION */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`py-2 rounded-lg border transition
                ${
                  selected === cat
                    ? "bg-blue-600 border-blue-400"
                    : "bg-gray-800 border-gray-600 hover:bg-gray-700"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="text-left text-sm text-gray-300 mb-6 space-y-2">
          <p>✅ Real interview questions</p>
          <p>✅ AI evaluation</p>
          <p>✅ Performance scoring</p>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={!selected}
          className={`w-full py-3 rounded-lg text-lg transition
            ${
              selected
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
        >
          Start Interview
        </button>

      </div>

    </div>
  );
}