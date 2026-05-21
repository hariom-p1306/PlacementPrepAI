"use client";

import { questions } from "@/data/questions";
//import { useInterviewStore } from "@/features/interview/interview.store";

//import { useInterviewStore } from "@/features/interview/interview.store";
import { useRouter } from "next/navigation";
// import { useInterviewStore } from "../../../features/interview/interview.store";

import { useInterviewStore } from "@/features/interview/interview.store";


export default function ResultPage() {


    const { scores, answers, reset } = useInterviewStore();
    const { feedbacks } = useInterviewStore();

    const hasHydrated = useInterviewStore((state) => state._hasHydrated);

  if (!hasHydrated) {
    return <div className="text-white p-6">Loading...</div>;
  }


    const totalScore = scores.reduce((a, b) => a + b, 0);
    const avgScore = scores.length ? totalScore / scores.length : 0;

    const router = useRouter();



    if (answers.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                No interview data found.
            </div>
        );
    }

    const percentage = scores.length
        ? Math.round((totalScore / (scores.length * 10)) * 100)
        : 0;
    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">

            <div className="mb-6 text-center">
                <h2 className="text-xl font-semibold">
                    Total Score: {totalScore}
                </h2>
                <p className="text-gray-400">
                    Average Score: {avgScore.toFixed(1)} / 10
                </p>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-center">
                Interview Summary
            </h1>

            <h2 className="text-xl text-center mb-8">
                Score: {percentage}%
            </h2>

            <div className="max-w-3xl mx-auto space-y-6">
                {answers.map((ans, i) => {
                    const fb = feedbacks[i];

                    return (
                        <div
                            key={i}
                            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                        >
                            <p className="font-semibold mb-2">
                                {questions[i]?.question || "Question not found"}
                            </p>

                            <p className="text-gray-300 mb-3">{ans}</p>

                            {fb && (
                                <div className="text-sm">
                                    <p className="text-green-400">
                                        Score: {fb.score}/10
                                    </p>

                                    <p className="text-red-400">
                                        Weakness: {fb.weaknesses.join(", ")}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center gap-4 mt-8">

                <button
                    onClick={() => {
                        reset();
                        router.push("/interview/start");
                    }}
                    className="bg-blue-600 px-6 py-3 rounded-lg"
                >
                    Restart Interview
                </button>

                <button
                    onClick={() => router.push("/interview/dashboard")}
                    className="bg-purple-600 px-6 py-3 rounded-lg"
                >
                    View Dashboard
                </button>

            </div>

        </div>
    );
}