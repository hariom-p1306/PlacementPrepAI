import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  const { message } = await req.json();

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a helpful career mentor for students preparing for placements.",
        },
        {
          role: "user",
          content: message,
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

  const reply = response.data.choices[0].message.content;

  return NextResponse.json({ reply });
}