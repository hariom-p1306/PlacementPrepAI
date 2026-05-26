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

  const navLinks = [
    { label: "Interview", path: "/interview/start" },
    { label: "Dashboard", path: "/interview/dashboard" },
    { label: "Resume", path: "/resume" },
    { label: "Roadmap", path: "/roadmap" },
    { label: "Mentor", path: "/mentor" },
    { label: "Cover Letter", path: "/cover-letter" },
  ];

  const goTo = (path: string) => {
    router.push(path);
    setMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md text-white border-b border-gray-700">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <h1
          className="font-bold text-lg cursor-pointer"
          onClick={() => goTo("/")}
        >
          PlacementPrep AI 🚀
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 items-center">
          {navLinks.map((link) =>
            isSignedIn ? (
              <button
                key={link.path}
                onClick={() => goTo(link.path)}
                className="cursor-pointer hover:text-blue-400 transition"
              >
                {link.label}
              </button>
            ) : (
              <SignInButton key={link.path} mode="modal">
                <button className="cursor-pointer hover:text-blue-400 transition">
                  {link.label}
                </button>
              </SignInButton>
            )
          )}

          {!isSignedIn ? (
            <div className="flex gap-3 items-center">
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded cursor-pointer transition">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded cursor-pointer transition">
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
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-4">
          {navLinks.map((link) =>
            isSignedIn ? (
              <button
                key={link.path}
                onClick={() => goTo(link.path)}
                className="text-left cursor-pointer hover:text-blue-400 transition"
              >
                {link.label}
              </button>
            ) : (
              <SignInButton key={link.path} mode="modal">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-left cursor-pointer hover:text-blue-400 transition"
                >
                  {link.label}
                </button>
              </SignInButton>
            )
          )}

          {!isSignedIn ? (
            <div className="flex gap-3 items-center pt-2">
              <SignInButton mode="modal">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded cursor-pointer transition"
                >
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded cursor-pointer transition"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          ) : (
            <div className="pt-2">
              <UserButton />
            </div>
          )}
        </div>
      )}
    </div>
  );
}