import { NextResponse } from "next/server";
import axios from "axios";
import { saveInterviewProgress } from "@/lib/progress";

export const runtime = "nodejs";

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

function normalizeArray(value: any) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeResult(parsed: any): InterviewEvaluationResult {
  return {
    score: Math.min(Math.max(Number(parsed.score ?? 0), 0), 10),
    strengths: normalizeArray(parsed.strengths),
    weaknesses: normalizeArray(parsed.weaknesses),
    improvement_tips: normalizeArray(parsed.improvement_tips),
    ideal_answer: parsed.ideal_answer || "",
  };
}

function getFallbackResult(reason: string): InterviewEvaluationResult {
  return {
    score: 0,
    strengths: [],
    weaknesses: [reason],
    improvement_tips: ["Try answering more clearly and include key concepts."],
    ideal_answer: "",
  };
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
  } catch (error) {
    console.error("REDIS SAVE INTERVIEW ERROR:", error);
  }
}

export async function POST(req: Request) {
  let interviewType = "General";
  let question = "";

  try {
    const body = await req.json();

    question = body.question || "";
    const answer = body.answer || "";
    interviewType = body.interviewType || "General";

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    if (!answer || typeof answer !== "string") {
      return NextResponse.json(
        { error: "Answer is required." },
        { status: 400 }
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
- For DBMS, check correctness of concepts like keys, joins, normalization, ACID, transactions.
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

Question:
${question}

Candidate Answer:
${answer}
`,
          },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiContent = response.data.choices[0].message.content;
    const jsonText = extractJson(aiContent);
    const parsed = JSON.parse(jsonText);

    const finalResult = normalizeResult(parsed);

    await safelySaveInterviewProgress({
      interviewType,
      question,
      result: finalResult,
    });

    return NextResponse.json(finalResult);
  } catch (error: any) {
    console.error("❌ INTERVIEW EVALUATE ERROR:", error.response?.data || error.message);

    const fallbackResult = getFallbackResult(
      error.message || "Server error occurred"
    );

    await safelySaveInterviewProgress({
      interviewType,
      question,
      result: fallbackResult,
    });

    return NextResponse.json(fallbackResult, { status: 200 });
  }
}