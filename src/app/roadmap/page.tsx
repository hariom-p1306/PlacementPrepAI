"use client";

import { useState } from "react";

type RoadmapStep = {
    step: string;
    description: string;
    tasks: string[];
    project?: string;
    interviewFocus?: string[];
};

type RoadmapResponse = {
    role: string;
    level: string;
    duration: string;
    focusArea: string;
    steps: RoadmapStep[];
};

const quickGoals = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "SDE Intern",
    "MERN Stack Developer",
    "Data Analyst",
    "AI/ML Intern",
];

const levels = ["Beginner", "Intermediate", "Advanced"];
const durations = ["2 Weeks", "1 Month", "3 Months"];
const focusAreas = ["All", "DSA", "Projects", "Interview", "System Design"];

export default function RoadmapPage() {
    const [goal, setGoal] = useState("");
    const [level, setLevel] = useState("Beginner");
    const [duration, setDuration] = useState("1 Month");
    const [focusArea, setFocusArea] = useState("All");
    const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const generateRoadmap = async () => {
        if (!goal.trim()) {
            alert("Please enter your target goal or role.");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/roadmap", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    goal,
                    level,
                    duration,
                    focusArea,
                }),
            });

            const data = await res.json();

            setRoadmap(data);
        } catch (error) {
            console.error("Failed to generate roadmap:", error);
            alert("Failed to generate roadmap. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyRoadmap = async () => {
        if (!roadmap) return;

        const text = roadmap.steps
            .map((step, index) => {
                return `${index + 1}. ${step.step}
${step.description}

Tasks:
${step.tasks.map((task) => `- ${task}`).join("\n")}

Project:
${step.project || "No project provided."}

Interview Focus:
${(step.interviewFocus || []).map((item) => `- ${item}`).join("\n")}
`;
            })
            .join("\n\n");

        await navigator.clipboard.writeText(text);
        alert("Roadmap copied to clipboard.");
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
            <div className="max-w-5xl mx-auto">
                <section className="mb-8">
                    <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500 text-blue-300 px-4 py-2 rounded-full text-sm mb-4">
                        ✨ AI Powered Career Planning
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold">
                        AI Roadmap Generator
                    </h1>

                    <p className="text-gray-400 mt-4 max-w-3xl leading-7">
                        Create a personalized placement preparation roadmap based on your
                        target role, current level, duration, and focus area.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-5 text-sm">
                        <span className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-full">
                            Role-based
                        </span>
                        <span className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-full">
                            Weekly Plan
                        </span>
                        <span className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-full">
                            Project Ideas
                        </span>
                        <span className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-full">
                            Interview Focus
                        </span>
                    </div>
                </section>

                <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="lg:col-span-2">
                            <label className="block text-sm text-gray-400 mb-2">
                                Target Goal / Role
                            </label>

                            <input
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="Example: Full Stack Developer, Backend Developer, SDE Intern"
                                className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="flex flex-wrap gap-2 mt-3">
                                {quickGoals.map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setGoal(item)}
                                        className={`px-3 py-2 rounded-full text-xs border transition ${goal === item
                                                ? "bg-blue-600 border-blue-500 text-white"
                                                : "bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-500"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Current Level
                            </label>

                            <div className="grid grid-cols-3 gap-2">
                                {levels.map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setLevel(item)}
                                        className={`p-3 rounded-xl border text-sm font-semibold transition ${level === item
                                                ? "bg-green-600/20 border-green-500 text-green-300"
                                                : "bg-black border-gray-700 text-gray-300 hover:border-green-500"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Duration
                            </label>

                            <div className="grid grid-cols-3 gap-2">
                                {durations.map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setDuration(item)}
                                        className={`p-3 rounded-xl border text-sm font-semibold transition ${duration === item
                                                ? "bg-purple-600/20 border-purple-500 text-purple-300"
                                                : "bg-black border-gray-700 text-gray-300 hover:border-purple-500"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <label className="block text-sm text-gray-400 mb-2">
                                Focus Area
                            </label>

                            <div className="flex flex-wrap gap-2">
                                {focusAreas.map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setFocusArea(item)}
                                        className={`px-4 py-3 rounded-xl border text-sm font-semibold transition ${focusArea === item
                                                ? "bg-yellow-600/20 border-yellow-500 text-yellow-300"
                                                : "bg-black border-gray-700 text-gray-300 hover:border-yellow-500"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={generateRoadmap}
                        disabled={loading}
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold transition disabled:opacity-60 shadow-lg shadow-blue-950/40"
                    >
                        {loading ? "Generating Roadmap..." : "Generate Roadmap"}
                    </button>
                </section>

                {roadmap && (
                    <section className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Your {roadmap.duration} Roadmap
                                </h2>

                                <p className="text-gray-400 mt-1">
                                    {roadmap.role} • {roadmap.level} • {roadmap.focusArea}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={copyRoadmap}
                                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-5 py-3 rounded-xl font-semibold"
                                >
                                    Copy Roadmap
                                </button>

                                <button
                                    onClick={generateRoadmap}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold disabled:opacity-60"
                                >
                                    Regenerate
                                </button>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {roadmap.steps.map((step, index) => (
                                <div
                                    key={`${step.step}-${index}`}
                                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold shrink-0">
                                            {index + 1}
                                        </div>

                                        <div className="w-full">
                                            <h3 className="text-xl font-bold">{step.step}</h3>

                                            <p className="text-gray-400 mt-2 leading-7">
                                                {step.description}
                                            </p>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
                                                <div className="lg:col-span-2 bg-black border border-gray-800 rounded-xl p-5">
                                                    <h4 className="font-semibold text-green-400 mb-3">
                                                        Tasks
                                                    </h4>

                                                    <ul className="space-y-3 text-sm text-gray-300">
                                                        {step.tasks.map((task) => (
                                                            <li key={task} className="flex gap-3 leading-6">
                                                                <span className="text-green-400 mt-1">●</span>
                                                                <span>{task}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="bg-black border border-gray-800 rounded-xl p-5">
                                                    <h4 className="font-semibold text-purple-400 mb-3">
                                                        Project Idea
                                                    </h4>

                                                    <p className="text-sm text-gray-300 leading-7">
                                                        {step.project || "No project idea provided."}
                                                    </p>
                                                </div>

                                                <div className="bg-black border border-gray-800 rounded-xl p-5">
                                                    <h4 className="font-semibold text-yellow-400 mb-3">
                                                        Interview Focus
                                                    </h4>

                                                    <ul className="space-y-3 text-sm text-gray-300">
                                                        {(step.interviewFocus || []).length > 0 ? (
                                                            step.interviewFocus?.map((item) => (
                                                                <li key={item} className="flex gap-3 leading-6">
                                                                    <span className="text-yellow-400 mt-1">●</span>
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <li>Revise key concepts from this step.</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}