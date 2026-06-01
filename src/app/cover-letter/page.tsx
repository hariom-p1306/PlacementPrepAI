"use client";

import { useState } from "react";

const quickRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "MERN Stack Developer",
  "SDE Intern",
  "Software Developer",
];

const tones = ["Formal", "Confident", "Friendly", "Short"];

export default function CoverLetterPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("Formal");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generateLetter = async () => {
    if (!name.trim() || !role.trim() || !skills.trim()) {
      alert("Please fill your name, job role, and skills.");
      return;
    }

    try {
      setLoading(true);
      setResult("");

      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          company,
          role,
          skills,
          experience,
          jobDescription,
          tone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to generate cover letter.");
        return;
      }

      setResult(data.letter || "");
    } catch (error) {
      console.error("Cover letter generation error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLetter = async () => {
    if (!result.trim()) return;

    await navigator.clipboard.writeText(result);
    alert("Cover letter copied to clipboard.");
  };

  const clearAll = () => {
    const confirmClear = window.confirm("Clear all fields and result?");

    if (!confirmClear) return;

    setName("");
    setCompany("");
    setRole("");
    setSkills("");
    setExperience("");
    setJobDescription("");
    setTone("Formal");
    setResult("");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <section className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500 text-blue-300 px-4 py-2 rounded-full text-sm mb-4">
              ✉️ AI Powered Application Helper
            </div>

            <h1 className="text-3xl md:text-5xl font-bold">
              Cover Letter Generator
            </h1>

            <p className="text-gray-400 mt-3 max-w-3xl leading-7">
              Create a personalized cover letter for internships, fresher jobs,
              and off-campus applications using your skills, projects, and job
              description.
            </p>
          </div>

          <button
            onClick={clearAll}
            className="bg-gray-800 hover:bg-red-600 border border-gray-700 hover:border-red-500 px-5 py-3 rounded-xl font-semibold transition w-fit"
            type="button"
          >
            Clear All
          </button>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl shadow-black/20">
            <h2 className="text-xl font-bold mb-1">
              Application Details
            </h2>

            <p className="text-sm text-gray-400 mb-6">
              Add details to generate a stronger and more specific cover
              letter.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Your Name *
                </label>

                <input
                  placeholder="Example: Hariom Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 bg-black border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Company Name
                </label>

                <input
                  placeholder="Example: TCS, Infosys, Startup name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full p-4 bg-black border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">
                  Job Role *
                </label>

                <input
                  placeholder="Example: Full Stack Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-4 bg-black border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
                />

                <div className="flex flex-wrap gap-2 mt-3">
                  {quickRoles.map((quickRole) => (
                    <button
                      key={quickRole}
                      onClick={() => setRole(quickRole)}
                      className={`px-3 py-2 rounded-full text-xs border transition ${
                        role === quickRole
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-500"
                      }`}
                      type="button"
                    >
                      {quickRole}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">
                  Skills *
                </label>

                <textarea
                  placeholder="Example: React, Node.js, MongoDB, PostgreSQL, REST APIs, DSA, Java"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  rows={4}
                  className="w-full p-4 bg-black border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">
                  Projects / Experience
                </label>

                <textarea
                  placeholder="Example: Built PlacementPrep AI, MeetSync video conferencing app, internship experience..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={4}
                  className="w-full p-4 bg-black border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">
                  Job Description
                </label>

                <textarea
                  placeholder="Paste job description here for a more personalized cover letter..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={5}
                  className="w-full p-4 bg-black border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">
                  Tone
                </label>

                <div className="flex flex-wrap gap-2">
                  {tones.map((item) => (
                    <button
                      key={item}
                      onClick={() => setTone(item)}
                      className={`px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                        tone === item
                          ? "bg-green-600/20 border-green-500 text-green-300"
                          : "bg-black border-gray-700 text-gray-300 hover:border-green-500"
                      }`}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={generateLetter}
              disabled={loading}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold transition disabled:opacity-60 shadow-lg shadow-blue-950/40"
              type="button"
            >
              {loading ? "Generating Cover Letter..." : "Generate Cover Letter"}
            </button>
          </div>

          <aside className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit shadow-xl shadow-black/20">
            <h2 className="text-xl font-bold mb-3">
              Tips for Better Cover Letter
            </h2>

            <div className="space-y-4 text-sm text-gray-300 leading-6">
              <div className="bg-black border border-gray-800 rounded-xl p-4">
                <p className="font-semibold text-blue-300 mb-1">
                  Add company name
                </p>
                <p>
                  A company-specific letter feels more personalized and less
                  generic.
                </p>
              </div>

              <div className="bg-black border border-gray-800 rounded-xl p-4">
                <p className="font-semibold text-green-300 mb-1">
                  Mention projects
                </p>
                <p>
                  Add your best project or internship work to show practical
                  experience.
                </p>
              </div>

              <div className="bg-black border border-gray-800 rounded-xl p-4">
                <p className="font-semibold text-purple-300 mb-1">
                  Paste job description
                </p>
                <p>
                  If you paste JD, AI can match your skills with the role more
                  accurately.
                </p>
              </div>
            </div>
          </aside>
        </section>

        {result && (
          <section className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl shadow-black/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-bold">
                  Generated Cover Letter
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Review it once before sending to any company.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyLetter}
                  className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-semibold transition"
                  type="button"
                >
                  Copy Letter
                </button>

                <button
                  onClick={generateLetter}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold transition disabled:opacity-60"
                  type="button"
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-5">
              <pre className="whitespace-pre-wrap text-gray-300 leading-8 font-sans text-sm md:text-base">
                {result}
              </pre>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}