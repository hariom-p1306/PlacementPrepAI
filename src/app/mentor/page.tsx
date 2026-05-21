"use client";

import { useState } from "react";

export default function MentorPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  const sendMessage = async () => {
    const res = await fetch("/api/mentor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages([...messages, { user: input, ai: data.reply }]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      <h1 className="text-2xl mb-4">AI Mentor</h1>

      <div className="space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i}>
            <p className="text-blue-400">You: {m.user}</p>
            <p className="text-green-400">AI: {m.ai}</p>
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 bg-gray-800 rounded mb-2"
        placeholder="Ask anything..."
      />

      <button
        onClick={sendMessage}
        className="bg-blue-600 px-4 py-2 rounded"
      >
        Send
      </button>

    </div>
  );
}