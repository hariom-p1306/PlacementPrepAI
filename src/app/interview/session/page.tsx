"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/features/interview/interview.store";
import { ProgressBar } from "@/components/interview/ProgressBar";
import { useTimer } from "@/hooks/useTimer";
import { questions } from "@/data/questions";

export default function SessionPage() {
  const { timeLeft, resetTimer } = useTimer(300);

  const {
    interviewType,
    currentIndex,
    nextQuestion,
    addFeedback,
    feedbacks,
    _hasHydrated,
  } = useInterviewStore();

  const router = useRouter();

  const total = questions.length;
  const currentFeedback = feedbacks[currentIndex];

  const [question, setQuestion] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const questionParts = question.split("Function Signature:");
  const questionText = questionParts[0];
  const functionSignature = questionParts[1];

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
          interviewType,
        }),
      });

      const data = await res.json();

      addFeedback(data);
      setShowFeedback(true);
    } catch (error) {
      console.error("Evaluation error", error);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    await evaluateAnswer();
    setLoading(false);
  };

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

  const extractStarterCode = (text: string) => {
  if (!text.includes("Function Signature:")) return "";

  return text
    .split("Function Signature:")[1]
    .trim()
    .replace(/^Java:\s*/i, "");
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
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
  };


  useEffect(() => {
    if (_hasHydrated) {
      fetchQuestion();
      
    }
  }, [_hasHydrated]);

  useEffect(() => {
    if (timeLeft === 0 && !showFeedback && input.trim()) {
      handleSubmit();
    }
  }, [timeLeft]);

  if (!_hasHydrated) {
    return <div className="text-white p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Left Panel - Question */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 h-[calc(100vh-120px)] overflow-y-auto">
          <div className="flex justify-between text-sm text-gray-400 mb-3">
            <span>
              Question {currentIndex + 1} of {total}
            </span>
            <span>{timeLeft}s</span>
          </div>

          <ProgressBar current={currentIndex + 1} total={total} />

          <h2 className="text-2xl font-bold mt-6 mb-4">
            Interview Question
          </h2>

          {interviewType === "DSA" ? (
            <div className="text-gray-200 leading-8 text-base whitespace-pre-wrap">
              <pre className="whitespace-pre-wrap font-sans">
                {questionText || "Loading question..."}
              </pre>

              {functionSignature && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">
                    Function Signature
                  </h3>

                  <pre className="bg-black border border-gray-700 rounded-xl p-4 text-sm font-mono text-green-300 overflow-x-auto whitespace-pre-wrap">
                    {functionSignature.trim()}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <pre className="text-gray-200 leading-8 text-base whitespace-pre-wrap font-sans">
              {question || "Loading question..."}
            </pre>
          )}
        </div>

        {/* Right Panel - Answer / Code */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 h-[calc(100vh-120px)] overflow-y-auto">
          {interviewType === "DSA" ? (
            <>
              <h2 className="text-xl font-bold mb-4">Code Editor</h2>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write your Java code here..."
                className="w-full h-80 p-4 rounded-lg bg-black border border-gray-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {!showFeedback && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg cursor-pointer disabled:opacity-60"
                >
                  {loading ? "Reviewing Code..." : "Submit Code for AI Review"}
                </button>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">Your Answer</h2>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-64 p-4 rounded-lg bg-gray-950 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={startListening}
                className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded cursor-pointer"
              >
                {isListening ? "Listening..." : "🎤 Start Speaking"}
              </button>

              {!showFeedback && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg cursor-pointer disabled:opacity-60"
                >
                  {loading ? "Evaluating..." : "Submit Answer"}
                </button>
              )}
            </>
          )}

          {showFeedback && currentFeedback && (
            <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="font-bold mb-2">
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
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded cursor-pointer"
              >
                Next Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}