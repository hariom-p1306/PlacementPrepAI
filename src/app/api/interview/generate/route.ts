import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { interviewType } = await req.json();

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a professional technical interviewer.",
          },
          {
            role: "user",
            content: `Ask one ${interviewType} interview question for a software developer. Make it realistic and commonly asked.`,
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

    const question = response.data.choices[0].message.content;

    return NextResponse.json({ question });

  } catch (error: any) {
    console.error("GROQ ERROR:", error.response?.data || error.message);

    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}