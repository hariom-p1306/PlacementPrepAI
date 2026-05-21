import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { goal } = await req.json();

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
           content: `
You are a career mentor.

Generate a detailed step-by-step roadmap.

Return STRICT JSON:

{
  "steps": [
    {
      "step": "title",
      "description": "short explanation",
      "tasks": ["task1", "task2"]
    }
  ]
}

IMPORTANT:
- Always return array of objects
- Each step must have step, description, tasks
- No extra text outside JSON
`
          },
          {
            role: "user",
            content: `Create a roadmap for becoming a ${goal}`
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

    let parsed = JSON.parse(result);

    parsed = {
      steps: parsed.steps || []
    };

    return NextResponse.json(parsed);

  } catch (error) {
    return NextResponse.json({ steps: [] });
  }
}