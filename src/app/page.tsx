"use client";

import { useRouter } from "next/navigation";
import { SignInButton, useUser } from "@clerk/nextjs";
// import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const features = [
    { title: "AI Mock Interview", path: "/interview/start" },
    { title: "Resume Analyzer", path: "/resume" },
    { title: "AI Roadmap Generator", path: "/roadmap" },
    { title: "Mentor Chat", path: "/mentor" },
  ];

  const steps = [
    "Choose interview category",
    "Answer AI-generated questions",
    "Get feedback, score, and improvement tips",
    "Track progress on dashboard",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <section className="px-6 py-24 flex flex-col items-center text-center">
        {/* Badge */}
        <span className="mb-4 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
          AI-powered placement preparation platform
        </span>

        {/* Hero */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          PlacementPrep AI 🚀
        </h1>

        <p className="text-gray-300 mb-8 text-lg md:text-xl max-w-2xl leading-relaxed">
          Practice interviews, analyze your resume, generate roadmaps, and get
          AI-powered feedback to prepare smarter for placements.
        </p>

        {/* Main Button */}
        {isSignedIn ? (
          <button
            onClick={() => router.push("/interview/start")}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-lg font-semibold transition cursor-pointer"
          >
            Start Interview
          </button>
        ) : (
          <SignInButton>
            <button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-lg font-semibold transition cursor-pointer">
              Get Started
            </button>
          </SignInButton>
        )}

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 w-full max-w-4xl">
          {features.map((feature) => (
            <button
              key={feature.title}
              onClick={() => router.push(feature.path)}
              className="bg-gray-800/70 border border-gray-700 rounded-2xl p-5 shadow-lg hover:border-blue-500 hover:bg-gray-800 transition cursor-pointer"
            >
              <p className="font-semibold">{feature.title}</p>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 w-full max-w-3xl">
          <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4">
            <h3 className="text-2xl font-bold text-blue-400">6+</h3>
            <p className="text-gray-400 text-sm">Core Features</p>
          </div>

          <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4">
            <h3 className="text-2xl font-bold text-green-400">AI</h3>
            <p className="text-gray-400 text-sm">Powered</p>
          </div>

          <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-4">
            <h3 className="text-2xl font-bold text-purple-400">100%</h3>
            <p className="text-gray-400 text-sm">Placement Focused</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 w-full max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">How it works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="bg-gray-900/70 border border-gray-700 rounded-2xl p-5"
              >
                <div className="text-blue-400 text-2xl font-bold mb-2">
                  {index + 1}
                </div>
                <p className="text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-blue-600/10 border border-blue-500/30 rounded-2xl p-8 w-full max-w-3xl">
          <h2 className="text-3xl font-bold mb-3">
            Ready to improve your placement preparation?
          </h2>

          <p className="text-gray-300 mb-6">
            Start practicing with AI interviews, resume analysis, and
            personalized roadmaps.
          </p>

          {isSignedIn ? (
            <button
              onClick={() => router.push("/interview/start")}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold cursor-pointer"
            >
              Start Practicing
            </button>
          ) : (
            <SignInButton>
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold cursor-pointer">
                Start Practicing
              </button>
            </SignInButton>
          )}
        </div>
      </section>
    </div>
  );
}