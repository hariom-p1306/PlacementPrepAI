"use client";

import { useState } from "react";

export default function CoverLetterPage() {
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [skills, setSkills] = useState("");
    const [result, setResult] = useState("");
    

    const generateLetter = async () => {
        const res = await fetch("/api/cover-letter", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, role, skills }),
        });

        const data = await res.json();
        setResult(data.letter);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">

            <h1 className="text-3xl font-bold mb-6">
                Cover Letter Generator
            </h1>

            <input
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 mb-3 bg-gray-800 rounded"
            />

            <input
                placeholder="Job Role (e.g. Frontend Developer)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 mb-3 bg-gray-800 rounded"
            />

            <textarea
                placeholder="Your Skills (React, Node, DSA...)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full p-3 mb-3 bg-gray-800 rounded"
            />

            <button
                onClick={generateLetter}
                className="bg-blue-600 px-6 py-2 rounded cursor-pointer"
            >
                Generate Cover Letter
            </button>

            {result && (
                <div className="mt-6 bg-gray-800 p-4 rounded">

                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-semibold">Generated Cover Letter</h2>

                        <button
                            onClick={() => navigator.clipboard.writeText(result)}
                            className="bg-green-600 px-3 py-1 rounded text-sm cursor-pointer"
                        >
                            Copy
                        </button>
                    </div>
                    {result && (
                        <div className="mt-6 bg-gray-800 p-4 rounded">

                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-semibold">
                                    Generated Cover Letter
                                </h2>

                                <button
                                    onClick={() => navigator.clipboard.writeText(result)}
                                    className="bg-green-600 px-3 py-1 rounded text-sm cursor-pointer"
                                >
                                    Copy
                                </button>
                            </div>

                            <div className="whitespace-pre-line text-gray-300">
                                {result}
                            </div>

                        </div>
                    )}

                </div>
            )}
        </div>
    );
}