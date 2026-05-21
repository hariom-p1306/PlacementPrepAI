"use client";

import { useState } from "react";

export default function ResumePage() {
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 FILE UPLOAD HANDLER
  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];

    if (!file) return;

    // ✅ TXT FILE
    if (file.type === "text/plain") {
      const text = await file.text();
      setResumeText(text);
    }

    // ✅ PDF FILE
    else if (file.type === "application/pdf") {

      const pdfjsLib = await import("pdfjs-dist");

      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const reader = new FileReader();

      reader.onload = async () => {

        const typedArray = new Uint8Array(
          reader.result as ArrayBuffer
        );

        const pdf = await pdfjsLib
          .getDocument({ data: typedArray })
          .promise;

        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {

          const page = await pdf.getPage(i);

          const content = await page.getTextContent();

          const strings = content.items.map(
            (item: any) => item.str
          );

          fullText += strings.join(" ") + "\n";
        }

        setResumeText(fullText);
      };

      reader.readAsArrayBuffer(file);
    }

    // ❌ OTHER FILES
    else {
      alert("Only PDF or TXT supported");
    }
  };

  // 🔥 ANALYZE FUNCTION
  const analyzeResume = async () => {
    if (!resumeText.trim()) return alert("Please enter resume!");

    setLoading(true);

    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">

      <h1 className="text-3xl mb-6 font-bold">
        Resume Analyzer
      </h1>

      {/* 🔥 FILE UPLOAD */}
      <div className="border-2 border-dashed border-gray-600 p-4 rounded mb-4">
        <p className="text-gray-400 mb-2">
          Upload Resume (.txt recommended)
        </p>

        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileUpload}
          className="mt-3"
        />
      </div>

      {/* TEXT AREA */}
      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="Paste your resume here..."
        className="w-full p-4 bg-gray-800 rounded-lg mb-4"
        rows={10}
      />

      {/* BUTTON */}
      <button
        onClick={analyzeResume}
        disabled={loading}
        className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {/* RESULT */}
      {result && (
        <div className="mt-6 bg-gray-800 p-6 rounded-lg space-y-3">

          <h2 className="text-xl font-semibold">
            Score: {result.score}/10
          </h2>

          <p className="text-green-400">
            <strong>Strengths:</strong>{" "}
            {result.strengths?.join(", ") || "N/A"}
          </p>

          <p className="text-red-400">
            <strong>Weaknesses:</strong>{" "}
            {result.weaknesses?.join(", ") || "N/A"}
          </p>

          <p className="text-yellow-400">
            <strong>Missing Skills:</strong>{" "}
            {result.missing_skills?.join(", ") || "N/A"}
          </p>

          <p className="text-gray-300">
            <strong>Suggestions:</strong>{" "}
            {result.suggestions || "N/A"}
          </p>

        </div>
      )}

    </div>
  );
}