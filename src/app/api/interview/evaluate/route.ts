import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json();

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are an expert technical interviewer.

Evaluate the candidate answer.

Return STRICT JSON only (no explanation):

{
  "score": number (0-10),
  "strengths": ["point1", "point2"],
  "weaknesses": ["point1", "point2"],
  "improvement_tips": ["tip1", "tip2"],
  "ideal_answer": "best possible answer"
}

IMPORTANT:
- Always include ALL fields
- Never return partial JSON
- Never return text outside JSON
`,
          },
          {
            role: "user",
            content: `Question: ${question}\nAnswer: ${answer}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let result = response.data.choices[0].message.content;

    // 🔥 Remove markdown if present
    result = result.replace(/```json|```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(result);
    } catch (err) {
      console.error("❌ JSON Parse Error:", result);

      // 🔥 fallback safe response
      return NextResponse.json({
        score: 0,
        strengths: [],
        weaknesses: ["AI response parsing failed"],
        improvement_tips: ["Try answering more clearly"],
        ideal_answer: "",
      });
    }

    // 🔥 FINAL SAFETY (VERY IMPORTANT)
    parsed = {
      score: parsed.score ?? 0,
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      improvement_tips: parsed.improvement_tips ?? [],
      ideal_answer: parsed.ideal_answer ?? "",
    };

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("❌ GROQ ERROR:", error.response?.data || error.message);

    // 🔥 safe fallback
    return NextResponse.json({
      score: 0,
      strengths: [],
      weaknesses: ["Server error occurred"],
      improvement_tips: ["Please try again"],
      ideal_answer: "",
    });
  }
}