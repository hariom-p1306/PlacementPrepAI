"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/features/interview/interview.store";
import { ProgressBar } from "@/components/interview/ProgressBar";
import { useTimer } from "@/hooks/useTimer";
import { questions } from "@/data/questions";

type InterviewConfig = {
  interviewType: string;
  topic: string;
  difficulty: string;
};

const defaultConfig: InterviewConfig = {
  interviewType: "DSA",
  topic: "Array",
  difficulty: "Easy",
};

const answerGuides: Record<string, string[]> = {
  HR: [
    "Start with the situation or context.",
    "Explain your action or contribution clearly.",
    "Mention the result or learning.",
    "Keep your answer short, honest, and confident.",
  ],
  DBMS: [
    "Start with a clear definition.",
    "Explain the key difference or concept.",
    "Give a simple real-world or SQL example.",
    "Mention where or why it is used.",
  ],
  OOPS: [
    "Define the concept in simple words.",
    "Explain with a real-world example.",
    "Mention how it helps in software development.",
    "Keep the answer practical and interview-friendly.",
  ],
  GENERAL: [
    "Answer directly and clearly.",
    "Use simple examples where possible.",
    "Avoid unnecessary long explanation.",
    "End with a clear conclusion.",
  ],
};

export default function SessionPage() {
  const router = useRouter();
  const { timeLeft, resetTimer } = useTimer(300);

  const {
    interviewType,
    currentIndex,
    nextQuestion,
    addFeedback,
    feedbacks,
    _hasHydrated,
  } = useInterviewStore();

  const total = questions.length;
  const currentFeedback = feedbacks[currentIndex];

  const [config, setConfig] = useState<InterviewConfig>(defaultConfig);
  const [isConfigReady, setIsConfigReady] = useState(false);
  const [question, setQuestion] = useState("");
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [sessionId, setSessionId] = useState("");

  const isFetchingQuestionRef = useRef(false);
  const lastFetchKeyRef = useRef("");

  const [showFeedback, setShowFeedback] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [runLoading, setRunLoading] = useState(false);
  const [runOutput, setRunOutput] = useState("");

  const [leftWidth, setLeftWidth] = useState(50);
  const [editorHeight, setEditorHeight] = useState(280);
  const [isDragging, setIsDragging] = useState(false);

  const activeInterviewType =
    config.interviewType || interviewType || defaultConfig.interviewType;

  const activeTopic = config.topic || defaultConfig.topic;
  const activeDifficulty = config.difficulty || defaultConfig.difficulty;

  const isDSA = activeInterviewType === "DSA";

  /*
    DSA question structure:
    Question text
    Function Signature:
    Java starter code
    Runner Code:
    hidden runner code
  */
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

  const getAnswerGuide = () => {
    return answerGuides[activeInterviewType] || answerGuides.GENERAL;
  };

  const getAnswerPlaceholder = () => {
    if (activeInterviewType === "HR") {
      return `Write your answer here...

Example structure:
In my previous project, I worked on...
My responsibility was...
I contributed by...
The result was...`;
    }

    if (activeInterviewType === "DBMS") {
      return `Write your DBMS answer here...

Example structure:
Definition:
Key difference:
Example:
Use case:`;
    }

    if (activeInterviewType === "OOPS") {
      return `Write your OOPS answer here...

Example structure:
Concept:
Real-world example:
How it is used in programming:`;
    }

    return "Write your answer here...";
  };

  const fetchQuestion = async (forceNew = false) => {
    const fetchKey = `${activeInterviewType}-${activeTopic}-${activeDifficulty}-${currentIndex}`;

    if (!forceNew && lastFetchKeyRef.current === fetchKey) {
      return;
    }

    if (isFetchingQuestionRef.current) {
      return;
    }

    try {
      isFetchingQuestionRef.current = true;
      lastFetchKeyRef.current = fetchKey;

      setQuestion("");
      setRunOutput("");
      setShowFeedback(false);

      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewType: activeInterviewType,
          topic: activeTopic,
          difficulty: activeDifficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Question generation failed:", data);
        setQuestion("Failed to generate question. Please try again.");
        return;
      }

      setSessionId(data.sessionId || "");

      const generatedQuestion = data.question || "";
      setQuestion(generatedQuestion);

      if (activeInterviewType === "DSA") {
        const generatedRunnerParts = generatedQuestion.split("Runner Code:");
        const generatedQuestionWithoutRunner = generatedRunnerParts[0] || "";

        const generatedQuestionParts =
          generatedQuestionWithoutRunner.split("Function Signature:");

        const generatedFunctionSignature =
          generatedQuestionParts[1]?.trim() || "";

        const starterCode = extractStarterCode(generatedFunctionSignature);
        setInput(starterCode);
      } else {
        setInput("");
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setQuestion("Something went wrong while generating the question.");
    } finally {
      isFetchingQuestionRef.current = false;
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
          sessionId,
          question: questionWithoutRunner || question,
          answer: input,
          interviewType: activeInterviewType,
          topic: activeTopic,
          difficulty: activeDifficulty,
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

    if (!sessionId) {
      console.error("Session ID missing. Please generate a question again.");
      return;
    }

    setLoading(true);
    await evaluateAnswer();
    setLoading(false);
  };

  const goToNext = () => {
    const result = nextQuestion(input);

    setInput("");
    setQuestion("");
    setRunOutput("");
    setShowFeedback(false);
    setSessionId("");
    resetTimer();

    if (result === "COMPLETED") {
      router.push("/interview/result");
    } else {
      fetchQuestion(true);
    }
  };

  const handleSkipQuestion = () => {
    const result = nextQuestion("");

    setInput("");
    setQuestion("");
    setRunOutput("");
    setShowFeedback(false);
    setSessionId("");
    resetTimer();

    if (result === "COMPLETED") {
      router.push("/interview/result");
    } else {
      fetchQuestion(true);
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
    } catch (error) {
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
      alert("Speech Recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.start();

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      setInput((prev) => {
        if (!prev.trim()) return transcript;
        return `${prev} ${transcript}`;
      });

      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

 useEffect(() => {
  if (!_hasHydrated) return;

  const savedConfig = localStorage.getItem("interviewConfig");

  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);

      setConfig({
        interviewType: parsed.interviewType || defaultConfig.interviewType,
        topic: parsed.topic || defaultConfig.topic,
        difficulty: parsed.difficulty || defaultConfig.difficulty,
      });
    } catch {
      setConfig(defaultConfig);
    }
  } else {
    setConfig(defaultConfig);
  }

  lastFetchKeyRef.current = "";
  setIsConfigReady(true);
}, [_hasHydrated]);

  useEffect(() => {
  if (_hasHydrated && isConfigReady && config.interviewType) {
    fetchQuestion();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  _hasHydrated,
  isConfigReady,
  config.interviewType,
  config.topic,
  config.difficulty,
]);

  useEffect(() => {
    if (timeLeft === 0 && !showFeedback && input.trim()) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  if (!_hasHydrated || !isConfigReady) {
  return <div className="text-white p-6">Loading...</div>;
}
  const handleResizeMouseDown = () => {
    setIsDragging(true);
  };

  const handleResizeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const container = e.currentTarget.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - container.left) / container.width) * 100;

    if (newLeftWidth >= 30 && newLeftWidth <= 70) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleResizeMouseUp = () => {
    setIsDragging(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getTimerColor = (seconds: number) => {
    if (seconds <= 30) return "text-red-400";
    if (seconds <= 60) return "text-yellow-400";
    return "text-gray-300";
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
            <div className="flex flex-wrap justify-between items-center gap-3 text-sm mb-4">
              <div>
                <p className="text-gray-400">
                  Question {currentIndex + 1} of {total}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500 text-blue-300 text-xs">
                    {activeInterviewType}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500 text-purple-300 text-xs">
                    {activeTopic}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-green-600/20 border border-green-500 text-green-300 text-xs">
                    {activeDifficulty}
                  </span>
                </div>
              </div>

              <span
                className={`font-semibold px-3 py-1 rounded-full bg-black border border-gray-700 ${getTimerColor(
                  timeLeft
                )}`}
              >
                ⏱ {formatTime(timeLeft)}
              </span>
            </div>

            <ProgressBar current={currentIndex + 1} total={total} />

            <h2 className="text-2xl font-bold mt-6 mb-4">
              Interview Question
            </h2>

            {isDSA ? (
              <div className="text-gray-200 leading-8 text-base whitespace-pre-wrap">
                <pre className="whitespace-pre-wrap font-sans">
                  {questionText || "Loading question..."}
                </pre>
              </div>
            ) : (
              <>
                <pre className="text-gray-200 leading-8 text-lg whitespace-pre-wrap font-sans">
                  {question || "Loading question..."}
                </pre>

                <div className="mt-6 bg-blue-950/30 border border-blue-800 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">
                    Quick Tip
                  </h3>
                  <p className="text-sm text-gray-300 leading-6">
                    {activeInterviewType === "HR"
                      ? "Use Situation → Action → Result. Keep your answer clear and confident."
                      : "Start with a simple definition, explain the key point, and give one example."}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Middle Resizer */}
        <div
          onMouseDown={handleResizeMouseDown}
          className={`w-2 cursor-col-resize rounded-full transition ${isDragging ? "bg-blue-500" : "bg-gray-700 hover:bg-blue-500"
            }`}
          title="Drag to resize panels"
        />

        {/* Right Panel - Answer / Code */}
        <div style={{ width: `${100 - leftWidth}%` }} className="pl-3">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 h-[calc(100vh-120px)] overflow-y-auto">
            {isDSA ? (
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={handleSkipQuestion}
                        className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg cursor-pointer"
                      >
                        Skip Question
                      </button>

                      <button
                        onClick={handleSubmit}
                        disabled={loading || !input.trim()}
                        className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg cursor-pointer disabled:opacity-60"
                      >
                        {loading
                          ? "Reviewing Code..."
                          : "Submit Code for AI Review"}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-xl font-bold">Your Answer</h2>

                  <span className="text-xs text-gray-400">
                    Recommended: 45–60 seconds
                  </span>
                </div>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={getAnswerPlaceholder()}
                  className="w-full min-h-[260px] p-4 rounded-xl bg-black border border-gray-700 text-gray-200 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={startListening}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg cursor-pointer"
                  >
                    {isListening ? "Listening..." : "🎤 Start Speaking"}
                  </button>

                  <button
                    onClick={() => setInput("")}
                    disabled={!input.trim()}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg cursor-pointer disabled:opacity-60"
                  >
                    Clear Answer
                  </button>
                </div>

                <div className="mt-5 bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-blue-300">
                    Suggested Answer Structure
                  </h3>

                  <ul className="space-y-2 text-sm text-gray-300">
                    {getAnswerGuide().map((guide) => (
                      <li key={guide}>✅ {guide}</li>
                    ))}
                  </ul>
                </div>

                {!showFeedback && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                    <button
                      onClick={handleSkipQuestion}
                      className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg cursor-pointer"
                    >
                      Skip Question
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={loading || !input.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg cursor-pointer disabled:opacity-60"
                    >
                      {loading ? "Evaluating..." : "Submit Answer"}
                    </button>
                  </div>
                )}
              </>
            )}

            {showFeedback && currentFeedback && (
              <div className="mt-6 bg-gray-800 border border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-xl">AI Feedback</h3>

                  <span className="px-4 py-1 rounded-full bg-blue-600/20 border border-blue-500 text-blue-300 font-bold">
                    {currentFeedback.score}/10
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-400 mb-1">
                      Strengths
                    </h4>
                    <p className="text-gray-300 text-sm leading-6">
                      {(currentFeedback.strengths || []).join(", ") ||
                        "No strengths available."}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-400 mb-1">
                      Weaknesses
                    </h4>
                    <p className="text-gray-300 text-sm leading-6">
                      {(currentFeedback.weaknesses || []).join(", ") ||
                        "No weaknesses available."}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-400 mb-1">
                      Improvement Tips
                    </h4>
                    <p className="text-gray-300 text-sm leading-6">
                      {(currentFeedback.improvement_tips || []).join(", ") ||
                        "No tips available."}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-yellow-400 mb-1">
                      Ideal Answer
                    </h4>
                    <p className="text-gray-300 text-sm leading-6">
                      {currentFeedback.ideal_answer ||
                        "Ideal answer not available."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={goToNext}
                  className="mt-5 w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg cursor-pointer"
                >
                  {currentIndex + 1 >= total ? "View Result" : "Next Question"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

