import { NextResponse } from "next/server";
import axios from "axios";
import { saveInterviewProgress } from "@/lib/progress";
import { getCurrentDbUser } from "@/lib/user";
import {
  completeInterviewSession,
  saveInterviewAnswer,
  saveUsedQuestion,
} from "@/lib/interview-history";
import { rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type InterviewEvaluationResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvement_tips: string[];
  ideal_answer: string;
};

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No valid JSON object found in AI response.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

function normalizeArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeResult(
  parsed: Partial<InterviewEvaluationResult>
): InterviewEvaluationResult {
  return {
    score: Math.min(Math.max(Number(parsed.score ?? 0), 0), 10),
    strengths: normalizeArray(parsed.strengths),
    weaknesses: normalizeArray(parsed.weaknesses),
    improvement_tips: normalizeArray(parsed.improvement_tips),
    ideal_answer:
      typeof parsed.ideal_answer === "string" ? parsed.ideal_answer : "",
  };
}

function getFallbackResult(
  reason = "AI evaluation took too long."
): InterviewEvaluationResult {
  return {
    score: 0,
    strengths: [],
    weaknesses: [reason],
    improvement_tips: [
      "Try giving a clearer answer with definition, explanation, and one example.",
      "Mention important keywords related to the question.",
    ],
    ideal_answer:
      "A good answer should clearly define the concept, explain its purpose, and include a simple example.",
  };
}

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

async function safelySaveInterviewProgress({
  interviewType,
  question,
  result,
}: {
  interviewType: string;
  question: string;
  result: InterviewEvaluationResult;
}) {
  try {
    await saveInterviewProgress({
      interviewType,
      question,
      score: result.score,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      improvement_tips: result.improvement_tips,
    });
  } catch (error: unknown) {
    console.error("REDIS SAVE INTERVIEW ERROR:", getErrorMessage(error));
  }
}

async function safelySavePermanentInterviewHistory({
  sessionId,
  userId,
  interviewType,
  topic,
  difficulty,
  question,
  answer,
  result,
}: {
  sessionId: string;
  userId: string;
  interviewType: string;
  topic?: string | null;
  difficulty?: string | null;
  question: string;
  answer: string;
  result: InterviewEvaluationResult;
}) {
  try {
    await saveInterviewAnswer({
      sessionId,
      question,
      answer,
      score: result.score,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      improvementTips: result.improvement_tips,
      idealAnswer: result.ideal_answer,
    });

    await saveUsedQuestion({
      userId,
      interviewType,
      topic,
      difficulty,
      question,
    });

    await completeInterviewSession({
      sessionId,
    });
  } catch (error: unknown) {
    console.error(
      "POSTGRES INTERVIEW HISTORY SAVE ERROR:",
      getErrorMessage(error)
    );
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("AI evaluation timeout")), ms)
    ),
  ]);
}

export async function POST(req: Request) {
  let sessionId = "";
  let interviewType = "General";
  let topic: string | null = null;
  let difficulty: string | null = null;
  let question = "";
  let answer = "";

  try {
    const body = await req.json();

    sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    question = typeof body.question === "string" ? body.question : "";
    answer = typeof body.answer === "string" ? body.answer : "";
    interviewType =
      typeof body.interviewType === "string" ? body.interviewType : "General";
    topic = typeof body.topic === "string" ? body.topic : null;
    difficulty =
      typeof body.difficulty === "string" ? body.difficulty : null;

    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const limitResult = await rateLimit({
      key: `${dbUser.id}:interview-evaluate`,
      prefix: "ai-api",
      limit: 10,
      windowSeconds: 60,
    });

    if (!limitResult.success) {
      return tooManyRequestsResponse(limitResult);
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required." },
        { status: 400 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    if (!answer.trim()) {
      const fallbackResult = getFallbackResult("Answer is empty.");

      void safelySaveInterviewProgress({
        interviewType,
        question,
        result: fallbackResult,
      });

      void safelySavePermanentInterviewHistory({
        sessionId,
        userId: dbUser.id,
        interviewType,
        topic,
        difficulty,
        question,
        answer: "",
        result: fallbackResult,
      });

      return NextResponse.json(fallbackResult, { status: 200 });
    }

    if (!process.env.GROQ_API_KEY) {
      const fallbackResult = getFallbackResult("GROQ_API_KEY is missing.");

      void safelySaveInterviewProgress({
        interviewType,
        question,
        result: fallbackResult,
      });

      void safelySavePermanentInterviewHistory({
        sessionId,
        userId: dbUser.id,
        interviewType,
        topic,
        difficulty,
        question,
        answer,
        result: fallbackResult,
      });

      return NextResponse.json(fallbackResult, { status: 200 });
    }

    const groqRequest = axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are an expert technical interviewer.

Evaluate the candidate answer strictly according to the interview type.

Return STRICT JSON only.
Do not use markdown.
Do not use code fences.
Do not return text outside JSON.

JSON format must be exactly:

{
  "score": number,
  "strengths": string[],
  "weaknesses": string[],
  "improvement_tips": string[],
  "ideal_answer": string
}

Rules:
- score must be from 0 to 10.
- Always include all fields.
- Be strict but fair.
- If the answer is irrelevant, give low score.
- If the answer is incomplete, mention what is missing.
- Keep response concise.
- For DBMS, check correctness of keys, joins, normalization, ACID, transactions, indexing.
- For OOPS, check class/object, inheritance, polymorphism, abstraction, encapsulation, overloading, overriding.
- For HR, check clarity, confidence, structure, honesty, and professionalism.
- For DSA, check approach, complexity, correctness, edge cases, and code quality.
`,
          },
          {
            role: "user",
            content: `
Interview Type:
${interviewType}

Topic:
${topic || "General"}

Difficulty:
${difficulty || "Easy"}

Question:
${question}

Candidate Answer:
${answer}
`,
          },
        ],
        temperature: 0.2,
        max_tokens: 700,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const response = await withTimeout(groqRequest, 18000);

    const aiContent = response.data.choices?.[0]?.message?.content || "";
    const jsonText = extractJson(aiContent);
    const parsed = JSON.parse(jsonText) as Partial<InterviewEvaluationResult>;

    const finalResult = normalizeResult(parsed);

    void safelySaveInterviewProgress({
      interviewType,
      question,
      result: finalResult,
    });

    void safelySavePermanentInterviewHistory({
      sessionId,
      userId: dbUser.id,
      interviewType,
      topic,
      difficulty,
      question,
      answer,
      result: finalResult,
    });

    return NextResponse.json(finalResult, { status: 200 });
  } catch (error: unknown) {
    console.error("INTERVIEW EVALUATE ERROR:", getErrorMessage(error));

    const fallbackResult = getFallbackResult(getErrorMessage(error));

    void safelySaveInterviewProgress({
      interviewType,
      question,
      result: fallbackResult,
    });

    return NextResponse.json(fallbackResult, { status: 200 });
  }
}