import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { name, role, skills } = await req.json();

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are a professional career assistant.

Write a strong, professional cover letter.

Do NOT return JSON.
Return plain text only.
`,
          },
          {
            role: "user",
            content: `
Name: ${name}
Role: ${role}
Skills: ${skills}

Generate a professional cover letter.
`,
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

    const letter = response.data.choices[0].message.content;

    return NextResponse.json({ letter });

  } catch (error) {
    return NextResponse.json({ letter: "Failed to generate" });
  }
}