"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/features/interview/interview.store";
import { ProgressBar } from "@/components/interview/ProgressBar";
import { useTimer } from "@/hooks/useTimer";
import { questions } from "@/data/questions";

export default function SessionPage() {
    const { timeLeft, resetTimer } = useTimer(300);
    const { interviewType } = useInterviewStore();

    const {
        currentIndex,
        nextQuestion,
        addFeedback,
        feedbacks,
    } = useInterviewStore();

    const total = questions.length;

    const [question, setQuestion] = useState("");
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const router = useRouter();

    // 🔥 get current feedback
    const currentFeedback = feedbacks[currentIndex];

    const hasHydrated = useInterviewStore((state) => state._hasHydrated);

  if (!hasHydrated) {
    return <div className="text-white p-6">Loading...</div>;
  }


    useEffect(() => {
        fetchQuestion();
    }, []);

    useEffect(() => {
        if (timeLeft === 0 && !showFeedback) {
            handleSubmit();
        }
    }, [timeLeft]);

    // 🔥 fetch question
    const fetchQuestion = async () => {
        try {
            const res = await fetch("/api/interview/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ interviewType }),
            });

            const data = await res.json();
            setQuestion(data.question);
        } catch (error) {
            console.error("Error fetching question", error);
        }
    };

    // 🔥 evaluate answer (CORE FUNCTION)
    const evaluateAnswer = async () => {
        try {
            const res = await fetch("/api/interview/evaluate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question,
                    answer: input,
                }),
            });

            const data = await res.json();

            // ✅ store full structured feedback
            addFeedback(data);

            setShowFeedback(true);
        } catch (error) {
            console.error("Evaluation error", error);
        }
    };

    // 🔥 submit button handler
    const handleSubmit = async () => {
        if (!input.trim()) return;

        setLoading(true);

        await evaluateAnswer();

        setLoading(false);
    };


    // 🔥 next question
    const goToNext = () => {
        const result = nextQuestion(input);

        setInput("");
        setShowFeedback(false);
        resetTimer();

        if (result === "COMPLETED") {
            router.push("/interview/result");
        } else {
            fetchQuestion();
        }
    };

    const startListening = () => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech Recognition not supported in your browser");
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.start();

        setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;

            // 🔥 auto fill textarea
            setInput(transcript);
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-lg">

                {/* Timer */}
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Time Left</span>
                    <span>{timeLeft}s</span>
                </div>

                {/* Progress Bar */}
                <ProgressBar current={currentIndex + 1} total={total} />

                {/* Question Count */}
                <div className="mb-4 text-sm text-gray-400">
                    Question {currentIndex + 1} of {total}
                </div>

                {/* Question */}
                <h2 className="text-xl font-semibold mb-6">
                    {question || "Loading question..."}
                </h2>

                {/* Input */}
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full p-4 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={5}
                />

                <button
                    onClick={startListening}
                    className="mt-3 bg-yellow-500 px-4 py-2 rounded"
                >
                    {isListening ? "Listening..." : "🎤 Start Speaking"}
                </button>

                {/* 🔥 FEEDBACK UI */}
                {showFeedback && currentFeedback && (
                    <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                        <h3 className="font-semibold mb-2">
                            Score: {currentFeedback.score}/10
                        </h3>

                        <p className="text-green-400">
                            <strong>Strengths:</strong>{" "}
                            {(currentFeedback.strengths || []).join(", ")}
                        </p>

                        <p className="text-red-400 mt-2">
                            <strong>Weaknesses:</strong>{" "}
                            {(currentFeedback.weaknesses || []).join(", ")}
                        </p>

                        <p className="text-blue-400 mt-2">
                            <strong>Tips:</strong>{" "}
                            {(currentFeedback.improvement_tips || []).join(", ")}
                        </p>

                        <div className="mt-3">
                            <strong>Ideal Answer:</strong>
                            <p className="text-gray-300 mt-1">
                                {currentFeedback.ideal_answer}
                            </p>
                        </div>

                        <button
                            onClick={goToNext}
                            className="mt-4 bg-blue-600 px-4 py-2 rounded"
                        >
                            Next Question
                        </button>
                    </div>
                )}

                {/* Submit Button */}
                {!showFeedback && (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="mt-6 w-full bg-green-600 py-3 rounded-lg"
                    >
                        {loading ? "Evaluating..." : "Submit Answer"}
                    </button>
                )}

            </div>
        </div>
    );
}