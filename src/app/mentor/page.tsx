"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

type CustomSpeechRecognitionEvent = Event & {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type CustomSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: CustomSpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => CustomSpeechRecognition;

type WindowWithSpeechRecognition = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

const quickPrompts = [
  {
    title: "Create Study Plan",
    prompt:
      "Create a 7-day study plan for DSA, full stack development, and communication practice.",
    icon: "📅",
  },
  {
    title: "Improve Resume",
    prompt:
      "Tell me how to improve my resume for a full stack developer fresher role.",
    icon: "📄",
  },
  {
    title: "DSA Guidance",
    prompt:
      "How should I improve my DSA problem-solving for campus placements?",
    icon: "💻",
  },
  {
    title: "HR Interview Help",
    prompt:
      "Help me prepare a strong self-introduction for a fresher interview.",
    icon: "🎤",
  },
  {
    title: "Project Ideas",
    prompt:
      "Suggest 3 strong full stack project ideas that can impress recruiters.",
    icon: "🚀",
  },
  {
    title: "Placement Strategy",
    prompt:
      "Give me a practical placement preparation strategy for the next 60 days.",
    icon: "🎯",
  },
];

export default function MentorPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("mentorChatMessages");

    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages) as Message[];
        setMessages(parsedMessages);
      } catch {
        setMessages([]);
      }
    } else {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "ai",
          content:
            "Hi! I am your AI Mentor. Ask me anything about placements, DSA, projects, resume, HR interviews, communication, or career planning.",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mentorChatMessages", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = (text: string) => {
    if (!text.trim()) return;

    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    const speechWindow = window as WindowWithSpeechRecognition;

    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech Recognition is not supported in your browser. Try Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
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

  const sendMessage = async (customPrompt?: string) => {
    const messageText = customPrompt || input;

    if (!messageText.trim() || loading) return;

    stopSpeaking();

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText.trim() }),
      });

      const data = await res.json();

      const aiReply =
        data.reply || "I could not generate a response. Please try again.";

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        content: aiReply,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (autoSpeak) {
        speakText(aiReply);
      }
    } catch (error) {
      console.error("Mentor chat error:", error);

      const errorReply =
        "Something went wrong while sending your message. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ai",
          content: errorReply,
        },
      ]);

      if (autoSpeak) {
        speakText(errorReply);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const confirmClear = window.confirm("Do you want to clear this chat?");

    if (!confirmClear) return;

    stopSpeaking();

    const initialMessage: Message = {
      id: crypto.randomUUID(),
      role: "ai",
      content:
        "Chat cleared. Ask me anything about placements, DSA, projects, resume, HR interviews, communication, or career planning.",
    };

    setMessages([initialMessage]);
    localStorage.setItem("mentorChatMessages", JSON.stringify([initialMessage]));
  };

  const readLastReply = () => {
    const lastAiMessage = [...messages]
      .reverse()
      .find((message) => message.role === "ai");

    if (!lastAiMessage) return;

    speakText(lastAiMessage.content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8 md:py-10">
      <div className="max-w-7xl mx-auto">
        <section className="mb-7 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500 text-blue-300 px-4 py-2 rounded-full text-sm mb-4">
              🤖 Personal Placement Assistant
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              AI Mentor
            </h1>

            <p className="text-gray-400 mt-3 max-w-3xl leading-7 text-sm md:text-base">
              Ask doubts about DSA, projects, resume, interviews,
              communication, internships, and placement strategy. You can also
              speak your question and listen to the AI reply.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setAutoSpeak((prev) => !prev)}
              className={`border px-5 py-3 rounded-xl font-semibold transition w-fit ${
                autoSpeak
                  ? "bg-green-600/20 border-green-500 text-green-300"
                  : "bg-gray-800 border-gray-700 text-gray-300"
              }`}
              type="button"
            >
              {autoSpeak ? "🔊 Auto Speak ON" : "🔇 Auto Speak OFF"}
            </button>

            <button
              onClick={clearChat}
              className="bg-gray-800 hover:bg-red-600 border border-gray-700 hover:border-red-500 px-5 py-3 rounded-xl font-semibold transition w-fit"
              type="button"
            >
              Clear Chat
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          <aside className="bg-gray-900 border border-gray-800 rounded-2xl p-5 h-fit shadow-xl shadow-black/20">
            <div className="mb-5">
              <h2 className="font-bold text-xl">Quick Prompts</h2>

              <p className="text-sm text-gray-400 mt-2 leading-6">
                Click any prompt to quickly ask your mentor.
              </p>
            </div>

            <div className="space-y-3">
              {quickPrompts.map((item) => (
                <button
                  key={item.title}
                  onClick={() => sendMessage(item.prompt)}
                  disabled={loading}
                  className="w-full text-left bg-black hover:bg-gray-800 border border-gray-800 hover:border-blue-500 rounded-xl p-4 transition disabled:opacity-60 group"
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-1">{item.icon}</span>

                    <div>
                      <p className="font-semibold group-hover:text-blue-300 transition">
                        {item.title}
                      </p>

                      <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-5">
                        {item.prompt}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col min-h-[560px] shadow-xl shadow-black/20">
            <div className="border-b border-gray-800 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg">Mentor Chat</h2>

                <p className="text-xs text-gray-500 mt-1">
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={readLastReply}
                  disabled={messages.length === 0}
                  className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-2 rounded-full disabled:opacity-60"
                  type="button"
                >
                  🔊 Read Last Reply
                </button>

                <button
                  onClick={stopSpeaking}
                  disabled={!isSpeaking}
                  className="text-xs bg-red-600/20 hover:bg-red-600 border border-red-500 text-red-300 hover:text-white px-3 py-2 rounded-full disabled:opacity-60"
                  type="button"
                >
                  🛑 Stop Voice
                </button>

                <span className="text-xs bg-green-600/20 border border-green-500 text-green-300 px-3 py-2 rounded-full">
                  Online
                </span>
              </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-gray-950/30">
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] md:max-w-[82%] rounded-2xl px-5 py-4 border shadow-lg ${
                        isUser
                          ? "bg-blue-600 border-blue-500 text-white shadow-blue-950/30"
                          : "bg-black border-gray-800 text-gray-200 shadow-black/30"
                      }`}
                    >
                      <p className="text-xs mb-2 opacity-70 font-semibold">
                        {isUser ? "You" : "AI Mentor"}
                      </p>

                      <p className="whitespace-pre-wrap leading-7 text-[15px]">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-black border border-gray-800 text-gray-300 rounded-2xl px-5 py-4 shadow-lg shadow-black/30">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-sm">Mentor is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {isListening && (
                <div className="flex justify-center">
                  <div className="bg-yellow-600/20 border border-yellow-500 text-yellow-300 rounded-full px-4 py-2 text-sm">
                    🎤 Listening... speak now
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="border-t border-gray-800 p-4 bg-gray-950">
              <div className="flex flex-col md:flex-row gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your mentor anything..."
                  rows={2}
                  className="flex-1 bg-black border border-gray-700 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 leading-6"
                />

                <div className="flex md:flex-col gap-3">
                  <button
                    onClick={startListening}
                    disabled={isListening || loading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-xl font-semibold disabled:opacity-60 transition"
                    type="button"
                  >
                    {isListening ? "Listening..." : "🎤 Speak"}
                  </button>

                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold disabled:opacity-60 transition md:w-32"
                    type="button"
                  >
                    {loading ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3">
                Tip: Speak or type questions like “How should I explain my
                PlacementPrep AI project in interview?”
              </p>
            </div>
          </main>
        </section>
      </div>
    </div>
  );
}