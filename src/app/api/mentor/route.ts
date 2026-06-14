import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Axios request failed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error occurred.";
}

function getFallbackReply(message: string) {
  return `I could not connect to the AI service right now, but here is a useful direction:

For your question: "${message}"

Start by breaking it into three parts:
1. What is the main goal?
2. What skills or concepts are required?
3. What small action can you take today?

For placement preparation, focus daily on DSA, project explanation, CS fundamentals, resume improvement, and communication practice.`;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous-user";

    const limitKey = userId ? `${userId}:mentor` : `${ip}:mentor`;

    const limitResult = await rateLimit({
      key: limitKey,
      prefix: "ai-api",
      limit: 10,
      windowSeconds: 60,
    });

    if (!limitResult.success) {
      return tooManyRequestsResponse(limitResult);
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { reply: "Please ask a valid question." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { reply: getFallbackReply(message) },
        { status: 200 }
      );
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are PlacementPrep AI Mentor.

You help Indian engineering students prepare for placements, internships, SDE roles, DSA, projects, resume, HR interviews, and communication.

Rules:
- Be practical, friendly, and clear.
- Give step-by-step guidance.
- Keep answers useful for college students.
- If user asks about DSA, explain approach and practice plan.
- If user asks about projects, suggest recruiter-friendly improvements.
- If user asks about resume, suggest strong bullet points and missing skills.
- If user asks about interview, give sample answer structure.
- Avoid very long theory unless needed.
- Use simple language.
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.4,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const reply =
      response.data.choices?.[0]?.message?.content ||
      "I could not generate a response. Please try again.";

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error: unknown) {
    console.error("MENTOR API ERROR:", getErrorMessage(error));

    return NextResponse.json(
      {
        reply:
          "Something went wrong while contacting the AI mentor. Please try again.",
      },
      { status: 200 }
    );
  }
}