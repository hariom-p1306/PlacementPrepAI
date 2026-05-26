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
  // const [running, setRunning] = useState(false);
  const [dsaTopic, setDsaTopic] = useState("Array");
const [dsaDifficulty, setDsaDifficulty] = useState("Easy");

  const [showFeedback, setShowFeedback] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [runOutput, setRunOutput] = useState("");
  const [leftWidth, setLeftWidth] = useState(50);
const [editorHeight, setEditorHeight] = useState(280);
const [isDragging, setIsDragging] = useState(false);

  // Split AI-generated DSA question into:
  // 1. visible question
  // 2. visible function signature
  // 3. hidden runner code
  const runnerParts = question.split("Runner Code:");
  const questionWithoutRunner = runnerParts[0]?.trim() || "";
  const runnerCode = runnerParts[1]?.trim() || "";

  const questionParts = questionWithoutRunner.split("Function Signature:");
  const questionText = questionParts[0]?.trim() || "";
  const functionSignature = questionParts[1]?.trim() || "";

  const extractStarterCode = (signature: string) => {
    if (!signature) return "";

    return signature.replace(/^Java:\s*/i, "").trim();
  };

  const fetchQuestion = async () => {
    try {
      setQuestion("");
      setRunOutput("");

      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  interviewType,
  topic: dsaTopic,
  difficulty: dsaDifficulty,
}),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Question generation failed:", data);
        setQuestion("Failed to generate question. Please try again.");
        return;
      }

      const generatedQuestion = data.question || "";
      setQuestion(generatedQuestion);

      // Put function signature automatically inside code editor for DSA
      if (interviewType === "DSA") {
        const generatedRunnerParts = generatedQuestion.split("Runner Code:");
        const generatedQuestionWithoutRunner = generatedRunnerParts[0] || "";

        const generatedQuestionParts =
          generatedQuestionWithoutRunner.split("Function Signature:");

        const generatedFunctionSignature =
          generatedQuestionParts[1]?.trim() || "";

        const starterCode = extractStarterCode(generatedFunctionSignature);
        setInput(starterCode);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setQuestion("Something went wrong while generating the question.");
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
          question: questionWithoutRunner || question,
          answer: input,
          interviewType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Evaluation failed:", data);
        return;
      }

      addFeedback(data);
      setShowFeedback(true);
    } catch (error) {
      console.error("Evaluation error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    await evaluateAnswer();
    setLoading(false);
  };


  // const handleRunCode = async () => {
  //   if (!input.trim()) return;

  //   if (!runnerCode) {
  //     setRunOutput(
  //       Error instanceof Error
  //         ? Error.message
  //         : "Something went wrong while running the code."
  //     );
  //     return;
  //   }

  //   setRunning(true);
  //   setRunOutput("");

  //   try {
  //     const res = await fetch("/api/interview/run-code", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         code: input,
  //         runnerCode,
  //         language: "java",
  //         stdin: "",
  //       }),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) {
  //       setRunOutput(data.error || data.details || "Code execution failed.");
  //       return;
  //     }

  //     setRunOutput(data.output || "Code executed successfully, but no output was produced.");
  //   } catch (error) {
  //     console.error("Run code error:", error);
  //     setRunOutput("Something went wrong while running the code.");
  //   } finally {
  //     setRunning(false);
  //   }
  // };



  const goToNext = () => {
    const result = nextQuestion(input);

    setInput("");
    setQuestion("");
    setRunOutput("");
    setShowFeedback(false);
    resetTimer();

    if (result === "COMPLETED") {
      router.push("/interview/result");
    } else {
      fetchQuestion();
    }
  };

  const handleRunCode = async () => {
    if (!input.trim()) {
      setRunOutput("Please write your Java code first.");
      return;
    }

    if (!runnerCode) {
      setRunOutput(
        "Runner code is missing for this question. Please generate a new DSA question."
      );
      return;
    }

    try {
      setRunLoading(true);
      setRunOutput("Running your code...");

      const res = await fetch("/api/interview/run-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: input,
          runnerCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRunOutput(data?.error || "Something went wrong while running code.");
        return;
      }

      setRunOutput(data?.output || "Code executed, but no output was produced.");
    } catch (error: any) {
      console.error("Run code error:", error);
      setRunOutput("Something went wrong while running the code.");
    } finally {
      setRunLoading(false);
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

  const handleMouseDown = () => {
  setIsDragging(true);
};

const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!isDragging) return;

  const container = e.currentTarget.getBoundingClientRect();
  const newLeftWidth = ((e.clientX - container.left) / container.width) * 100;

  if (newLeftWidth >= 35 && newLeftWidth <= 65) {
    setLeftWidth(newLeftWidth);
  }
};

const handleMouseUp = () => {
  setIsDragging(false);
};

return (
  <div className="min-h-screen bg-gray-950 text-white">
    <div
      className="flex gap-0 p-4 min-h-[calc(100vh-90px)] select-none"
      onMouseMove={handleResizeMouseMove}
      onMouseUp={handleResizeMouseUp}
      onMouseLeave={handleResizeMouseUp}
    >
      {/* Left Panel - Question */}
      <div style={{ width: `${leftWidth}%` }} className="pr-3">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 h-[calc(100vh-120px)] overflow-y-auto">
          <div className="flex justify-between text-sm text-gray-400 mb-3">
            <span>
              Question {currentIndex + 1} of {total}
            </span>
            <span>{timeLeft}s</span>
          </div>

          <ProgressBar current={currentIndex + 1} total={total} />

          {interviewType === "DSA" && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Select DSA Topic
                </label>

                <select
                  value={dsaTopic}
                  onChange={(e) => setDsaTopic(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Array">Array</option>
                  <option value="String">String</option>
                  <option value="Two Pointer">Two Pointer</option>
                  <option value="HashMap">HashMap</option>
                  <option value="Stack">Stack</option>
                  <option value="Binary Search">Binary Search</option>
                  <option value="DP">DP</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Select Difficulty
                </label>

                <select
                  value={dsaDifficulty}
                  onChange={(e) => setDsaDifficulty(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>

              <button
                onClick={fetchQuestion}
                className="md:col-span-2 bg-purple-600 hover:bg-purple-700 py-3 rounded-lg cursor-pointer"
              >
                Generate Question
              </button>
            </div>
          )}

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
                    {functionSignature.replace(/^Java:\s*/i, "").trim()}
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
      </div>

      {/* Middle Resizer */}
      <div
        onMouseDown={handleResizeMouseDown}
        className={`w-2 cursor-col-resize rounded-full transition ${
          isDragging ? "bg-blue-500" : "bg-gray-700 hover:bg-blue-500"
        }`}
        title="Drag to resize panels"
      />

      {/* Right Panel - Answer / Code */}
      <div style={{ width: `${100 - leftWidth}%` }} className="pl-3">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 h-[calc(100vh-120px)] overflow-y-auto">
          {interviewType === "DSA" ? (
            <>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold">Code Editor</h2>

                <div className="flex items-center gap-3 w-72">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    Editor Height
                  </span>

                  <input
                    type="range"
                    min="240"
                    max="650"
                    value={editorHeight}
                    onChange={(e) => setEditorHeight(Number(e.target.value))}
                    className="w-full"
                  />

                  <span className="text-xs text-gray-400 w-12">
                    {editorHeight}px
                  </span>
                </div>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write your Java code here..."
                spellCheck={false}
                wrap="off"
                style={{ height: `${editorHeight}px` }}
                className="w-full p-4 rounded-lg bg-black border border-gray-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              {!showFeedback && (
                <>
                  <button
                    onClick={handleRunCode}
                    disabled={runLoading || !input.trim()}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg cursor-pointer disabled:opacity-60"
                  >
                    {runLoading ? "Running Code..." : "Run Code"}
                  </button>

                  {runOutput && (
                    <div className="mt-4 bg-black border border-gray-700 rounded-lg p-4">
                      <h3 className="font-bold mb-2 text-blue-400">
                        Run Output
                      </h3>
                      <pre className="text-gray-200 whitespace-pre-wrap text-sm font-mono">
                        {runOutput}
                      </pre>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg cursor-pointer disabled:opacity-60"
                  >
                    {loading ? "Reviewing Code..." : "Submit Code for AI Review"}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">Your Answer</h2>

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
  </div>
);
}