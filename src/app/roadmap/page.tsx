"use client";

import { useState } from "react";

export default function RoadmapPage() {
    const [goal, setGoal] = useState("");
    const [roadmap, setRoadmap] = useState<string[]>([]);

    const generateRoadmap = async () => {
        const res = await fetch("/api/roadmap", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ goal }),
        });

        const data = await res.json();
        setRoadmap(data.steps || []);
        console.log(data);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">

            <h1 className="text-3xl font-bold mb-6">
                AI Roadmap Generator
            </h1>

            <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Enter your goal (e.g. Frontend Developer)"
                className="w-full p-3 bg-gray-800 rounded-lg mb-4"
            />

            <button
                onClick={generateRoadmap}
                className="bg-blue-600 px-6 py-2 rounded cursor-pointer"
            >
                Generate Roadmap
            </button>

            {/* Roadmap Output */}
            <div className="mt-6 space-y-3">
                {roadmap.map((item: any, i) => (
                    <div
                        key={i}
                        className="bg-gray-800 p-4 rounded-lg"
                    >
                        <p className="font-semibold">
                            {i + 1}. {item.step}
                        </p>

                        <p className="text-sm text-gray-400">
                            {item.description}
                        </p>

                        <ul className="list-disc ml-5 mt-2 text-sm">
                            {(item.tasks || []).map((task: string, idx: number) => (
                                <li key={idx}>{task}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

        </div>
    );
}