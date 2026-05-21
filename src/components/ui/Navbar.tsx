"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (path: string) => {
    router.push(path);
    setMenuOpen(false);
  };
  

  return (
    <div className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md text-white border-b border-gray-700">
      <div className="flex justify-between items-center px-6 py-4">
        <h1
          className="font-bold text-lg cursor-pointer"
          onClick={() => goTo("/")}
        >
          PlacementPrep AI 🚀
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 items-center">
          <button onClick={() => goTo("/interview/start")} className="cursor-pointer hover:text-blue-400 transition">Interview</button>
          <button onClick={() => goTo("/interview/dashboard")} className="cursor-pointer hover:text-blue-400 transition">Dashboard</button>
          <button onClick={() => goTo("/resume")} className="cursor-pointer hover:text-blue-400 transition">Resume</button>
          <button onClick={() => goTo("/roadmap")} className="cursor-pointer hover:text-blue-400 transition">Roadmap</button>
          <button onClick={() => goTo("/mentor")} className="cursor-pointer hover:text-blue-400 transition">Mentor</button>
          <button onClick={() => goTo("/cover-letter")} className="cursor-pointer hover:text-blue-400 transition">Cover Letter</button>

          {!isSignedIn ? (
            <div className="flex gap-3 items-center">
              <SignInButton>
                <button className="bg-blue-600 px-3 py-1 rounded cursor-pointer">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton>
                <button className="bg-green-600 px-3 py-1 rounded cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          ) : (
            <UserButton />
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-xl cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-4">
          <button onClick={() => goTo("/interview/start")} className="text-left cursor-pointer hover:text-blue-400">Interview</button>
          <button onClick={() => goTo("/interview/dashboard")} className="text-left cursor-pointer hover:text-blue-400">Dashboard</button>
          <button onClick={() => goTo("/resume")} className="text-left cursor-pointer hover:text-blue-400">Resume</button>
          <button onClick={() => goTo("/roadmap")} className="text-left cursor-pointer hover:text-blue-400">Roadmap</button>
          <button onClick={() => goTo("/mentor")} className="text-left cursor-pointer hover:text-blue-400">Mentor</button>
          <button onClick={() => goTo("/cover-letter")} className="text-left cursor-pointer hover:text-blue-400">Cover Letter</button>

          {!isSignedIn ? (
            <div className="flex gap-3 items-center">
              <SignInButton>
                <button className="bg-blue-600 px-3 py-1 rounded cursor-pointer">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton>
                <button className="bg-green-600 px-3 py-1 rounded cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          ) : (
            <UserButton />
          )}
        </div>
      )}
    </div>
  );
}