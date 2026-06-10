"use client";
import { uploadFileToS3 } from "@/lib/upload-to-s3";
import { useState } from "react";


const targetRoles = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "SDE Intern",
  "MERN Stack Developer",
  "Data Analyst",
  "AI/ML Intern",
];

type ResumeAnalysisResult = {
  score?: number;
  ats_score?: number;
  skills_match?: number;
  keyword_match?: number;
  strengths?: string[];
  weaknesses?: string[];
  missing_skills?: string[];
  suggestions?: string;
  recommended_roadmap?: string[];
};

export default function ResumePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");

  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [uploadingToS3, setUploadingToS3] = useState(false);
  const [resumeS3Key, setResumeS3Key] = useState("");

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingToS3(true);

      const s3Key = await uploadFileToS3(file);

      setResumeS3Key(s3Key);
      console.log("Resume uploaded to AWS S3:", s3Key);
    } catch (error) {
      console.error("S3 upload failed:", error);
      alert("Resume file upload to AWS S3 failed.");
    } finally {
      setUploadingToS3(false);
    }

    setFileLoading(true);
    setResult(null);
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));

    try {
      if (file.type === "text/plain") {
        const text = await file.text();
        setResumeText(text);
      } else if (file.type === "application/pdf") {
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.mjs";

        const arrayBuffer = await file.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);

        const pdf = await pdfjsLib.getDocument({
          data: typedArray,
        }).promise;

        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();

          const strings = content.items.map((item: any) => item.str);
          fullText += strings.join(" ") + "\n";
        }

        if (!fullText.trim()) {
          alert(
            "No readable text found in this PDF. Please paste resume text manually."
          );
          return;
        }

        setResumeText(fullText);
      } else {
        alert("Only PDF or TXT files are supported.");
      }
    } catch (error) {
      console.error("File parsing error:", error);
      alert(
        "Failed to read file. Please try another PDF or paste resume text manually."
      );
    } finally {
      setFileLoading(false);
    }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      alert("Please upload or paste your resume.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          targetRole,
          jobDescription,
          resumeS3Key,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Resume API error:", text);
        alert("Resume analysis API failed. Please check backend route.");
        return;
      }

      let data: ResumeAnalysisResult;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("Invalid JSON response:", text);
        alert("Invalid response from server.");
        return;
      }

      setResult(data);
    } catch (err) {
      console.error("Resume analyze error:", err);
      alert("Something went wrong while analyzing resume.");
    } finally {
      setLoading(false);
    }
  };

const clearAll = () => {
  setResumeText("");
  setJobDescription("");
  setTargetRole("Full Stack Developer");
  setFileName("");
  setFileSize("");
  setResumeS3Key("");
  setResult(null);
};

  const copyResumeText = async () => {
    if (!resumeText.trim()) return;

    await navigator.clipboard.writeText(resumeText);
    alert("Resume text copied!");
  };

  const buildReportText = () => {
    if (!result) return "";

    return `
Resume Analysis Report

Target Role: ${targetRole}

Overall Score: ${result.score ?? 0}/10
ATS Match Score: ${result.ats_score ?? 0}%
Skills Match: ${result.skills_match ?? 0}%
Keyword Match: ${result.keyword_match ?? 0}%

Strengths:
${Array.isArray(result.strengths) && result.strengths.length > 0
        ? result.strengths.map((item) => `- ${item}`).join("\n")
        : "N/A"
      }

Weaknesses:
${Array.isArray(result.weaknesses) && result.weaknesses.length > 0
        ? result.weaknesses.map((item) => `- ${item}`).join("\n")
        : "N/A"
      }

Missing Skills:
${Array.isArray(result.missing_skills) && result.missing_skills.length > 0
        ? result.missing_skills.map((item) => `- ${item}`).join("\n")
        : "N/A"
      }

Improvement Suggestions:
${result.suggestions || "N/A"}

Recommended Roadmap:
${Array.isArray(result.recommended_roadmap) &&
        result.recommended_roadmap.length > 0
        ? result.recommended_roadmap.map((item) => `- ${item}`).join("\n")
        : "N/A"
      }
`;
  };

  const copyResults = async () => {
    if (!result) {
      alert("Please analyze resume first.");
      return;
    }

    await navigator.clipboard.writeText(buildReportText());
    alert("Results copied!");
  };

  const downloadReportPDF = () => {
    if (!result) {
      alert("Please analyze resume first.");
      return;
    }

    const reportText = buildReportText();
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Popup blocked. Please allow popups to download report.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Resume Analysis Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #111827;
              line-height: 1.6;
              background: #ffffff;
            }

            h1 {
              color: #2563eb;
              margin-bottom: 8px;
            }

            .subtitle {
              color: #6b7280;
              margin-bottom: 24px;
            }

            .card {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 16px;
              background: #f9fafb;
            }

            pre {
              white-space: pre-wrap;
              font-family: Arial, sans-serif;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <h1>Resume Analysis Report</h1>
          <p class="subtitle">Generated by PlacementPrep AI</p>

          <div class="card">
            <pre>${escapeHtml(reportText)}</pre>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const shareResults = async () => {
    if (!result) {
      alert("Please analyze resume first.");
      return;
    }

    const reportText = buildReportText();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Resume Analysis Report",
          text: reportText,
        });
      } else {
        await navigator.clipboard.writeText(reportText);
        alert("Sharing is not supported in this browser. Results copied instead.");
      }
    } catch (error) {
      console.error("Share error:", error);
      await navigator.clipboard.writeText(reportText);
      alert("Unable to share directly. Results copied instead.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Resume Analyzer</h1>
          <p className="text-gray-400 mt-1">
            Upload your resume and get AI-powered analysis, ATS feedback, and
            improvement suggestions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/resume/history"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            View Resume History
          </a>

          <button
            onClick={clearAll}
            className="border border-gray-700 hover:border-red-500 text-gray-300 hover:text-red-400 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Clear All
          </button>
        </div>
      </div>



      {/* Top Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Upload Box */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold mb-4">
            1. Upload Resume (.pdf or .txt)
          </h2>

          <label className="border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl h-44 flex flex-col items-center justify-center cursor-pointer transition">
            <div className="text-4xl mb-3">📤</div>
            <p className="text-gray-300 mb-2">Choose your resume file</p>

            <span className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">
              Choose File
            </span>

            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {fileName && (
            <div className="mt-4 bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-xs text-gray-400">{fileSize}</p>
              </div>

              <span className="text-green-400 shrink-0">✅</span>
            </div>
          )}

          {fileLoading && (
            <p className="text-blue-400 mt-3 text-sm">Reading file...</p>
          )}

          <p className="text-xs text-gray-500 mt-4">
            PDF (.pdf) or Text (.txt) files only
          </p>
        </div>

        {/* Extracted Text */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold">2. Extracted Resume Text</h2>

            <button
              onClick={copyResumeText}
              disabled={!resumeText.trim()}
              className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 px-3 py-1.5 rounded-lg text-sm transition"
            >
              Copy Text
            </button>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume here or upload a file..."
            className="w-full h-64 p-4 bg-black border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Target Role + JD */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold mb-4">3. Target Role</h2>

          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {targetRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <h2 className="font-semibold mt-6 mb-4">
            4. Job Description{" "}
            <span className="text-gray-500 text-sm">(Optional)</span>
          </h2>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            maxLength={3000}
            className="w-full h-36 p-4 bg-black border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <div className="flex justify-between gap-3 text-xs text-gray-500 mt-2">
            <span>This helps calculate ATS match more accurately.</span>
            <span>{jobDescription.length}/3000</span>
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <div className="flex justify-center mt-5">
        <button
          onClick={analyzeResume}
          disabled={loading || fileLoading || uploadingToS3 || !resumeText.trim()}
          className="w-full max-w-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg font-semibold transition"
        >
          {uploadingToS3
            ? "Uploading Resume..."
            : loading
              ? "Analyzing Resume..."
              : "Analyze Resume"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>

          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <ScoreCard
              title="Overall Score"
              value={`${result.score ?? 0}/10`}
              subtitle="Keep improving!"
              color="text-green-400"
            />

            <ScoreCard
              title="ATS Match Score"
              value={`${result.ats_score ?? 0}%`}
              subtitle="Based on role and JD"
              color="text-yellow-400"
            />

            <ScoreCard
              title="Skills Match"
              value={`${result.skills_match ?? 0}%`}
              subtitle="Relevant skills found"
              color="text-blue-400"
            />

            <ScoreCard
              title="Keyword Match"
              value={`${result.keyword_match ?? 0}%`}
              subtitle="Add more job keywords"
              color="text-purple-400"
            />

            <ScoreCard
              title="Target Role"
              value={targetRole}
              subtitle="Selected profile"
              color="text-green-400"
            />
          </div>

          {/* Feedback Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <FeedbackCard
              title="Strengths"
              icon="✅"
              color="text-green-400"
              items={result.strengths}
            />

            <FeedbackCard
              title="Weaknesses"
              icon="❌"
              color="text-red-400"
              items={result.weaknesses}
            />

            <FeedbackCard
              title="Missing Skills"
              icon="⚠️"
              color="text-yellow-400"
              items={result.missing_skills}
            />
          </div>

          {/* Suggestions + Roadmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-bold mb-3">
                Improvement Suggestions
              </h3>

              <p className="text-gray-300 leading-7">
                {result.suggestions || "No suggestions available."}
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-bold mb-3">Recommended Roadmap</h3>

              <ul className="space-y-2 text-gray-300">
                {(result.recommended_roadmap || [
                  "Docker and containerization",
                  "CI/CD with GitHub Actions",
                  "Cloud deployment basics",
                  "Testing with Jest or Cypress",
                  "System design basics",
                ]).map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <button
              onClick={downloadReportPDF}
              className="border border-purple-600 text-purple-400 px-6 py-2 rounded-lg hover:bg-purple-950 transition"
            >
              Download Report PDF
            </button>

            <button
              onClick={copyResults}
              className="border border-blue-600 text-blue-400 px-6 py-2 rounded-lg hover:bg-blue-950 transition"
            >
              Copy Results
            </button>

            <button
              onClick={shareResults}
              className="border border-gray-600 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Share Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
      <p className="text-sm text-gray-400 mb-3">{title}</p>

      <div
        className={`mx-auto mb-3 w-24 h-24 rounded-full border-4 border-gray-700 flex items-center justify-center ${color}`}
      >
        <span className="font-bold text-base text-white text-center px-2 break-words">
          {value}
        </span>
      </div>

      <p className={`font-semibold ${color}`}>{subtitle}</p>
    </div>
  );
}

function FeedbackCard({
  title,
  icon,
  color,
  items,
}: {
  title: string;
  icon: string;
  color: string;
  items?: string[];
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className={`text-lg font-bold mb-3 ${color}`}>
        {icon} {title}
      </h3>

      <ul className="space-y-2 text-gray-300">
        {Array.isArray(items) && items.length > 0 ? (
          items.map((item, index) => (
            <li key={index} className="flex gap-2">
              <span className={color}>•</span>
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-gray-500">No data available.</li>
        )}
      </ul>
    </div>
  );
}