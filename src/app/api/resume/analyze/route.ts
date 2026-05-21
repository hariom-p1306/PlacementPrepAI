import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { resumeText } = await req.json();

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are a resume analyzer.

Return STRICT JSON:

{
  "score": number (0-10),
  "strengths": [],
  "weaknesses": [],
  "missing_skills": [],
  "suggestions": "text"
}
`
          },
          {
            role: "user",
            content: resumeText
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let result = response.data.choices[0].message.content;

    result = result.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(result);

    return NextResponse.json(parsed);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}