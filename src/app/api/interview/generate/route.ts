import { NextResponse } from "next/server";
import axios from "axios";
import { DSA_QUESTIONS } from "@/data/dsaQuestions";

export async function POST(req: Request) {
  try {
    const { interviewType, topic, difficulty } = await req.json();

    if (!interviewType || typeof interviewType !== "string") {
      return NextResponse.json(
        { error: "Interview type is required." },
        { status: 400 }
      );
    }

    // DSA questions come from fixed internal question bank.
    // This keeps Run Code stable and avoids void, linked list, tree, graph issues.
    if (interviewType === "DSA") {
      const selectedTopic = topic || "Array";
      const selectedDifficulty = difficulty || "Easy";

      const filteredQuestions = DSA_QUESTIONS.filter(
        (q) =>
          q.topic === selectedTopic &&
          q.difficulty === selectedDifficulty
      );

      if (filteredQuestions.length === 0) {
        return NextResponse.json(
          {
            error: `No DSA question found for ${selectedTopic} - ${selectedDifficulty}.`,
          },
          { status: 404 }
        );
      }

      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);

      return NextResponse.json({
        question: filteredQuestions[randomIndex].question,
      });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are a professional software engineering interviewer for placement preparation.

Interview Type: ${interviewType}

Your task is to generate ONLY ONE interview question based on the Interview Type.

GENERAL RULES:
- Beginner to medium level only.
- Question should feel like a real fresher placement interview question.
- Do NOT give answer.
- Do NOT give hints.
- Do NOT use markdown tables.
- Do NOT use markdown code fences.
- Return clean plain text only.

FOR HR:
Return only one short HR question.

Example:
Tell me about yourself.

FOR DBMS:
Return only one short DBMS question.
Topics: Normalization, Joins, Primary Key, Foreign Key, Indexing, Transactions, ACID properties.

Example:
What is normalization in DBMS?

FOR OOPS:
Return only one short OOPS question.
Topics: Inheritance, Polymorphism, Encapsulation, Abstraction, Interface vs Abstract Class, Constructor, Overloading, Overriding.

Example:
What is polymorphism in OOPS?

IMPORTANT:
If Interview Type is not HR, DBMS, or OOPS, return one simple placement interview question related to that type.
`,
          },
          {
            role: "user",
            content: `Generate one simple ${interviewType} interview question.`,
          },
        ],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const question = response.data.choices[0].message.content.trim();

    return NextResponse.json({ question });
  } catch (error: any) {
    console.error("GROQ ERROR:", error.response?.data || error.message);

    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}