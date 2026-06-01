import { NextResponse } from "next/server";
import axios from "axios";
import { DSA_QUESTIONS } from "@/data/dsaQuestions";
import { getCurrentDbUser } from "@/lib/user";
import {
  createInterviewSession,
  getUsedQuestions,
} from "@/lib/interview-history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InterviewType = "DSA" | "HR" | "DBMS" | "OOPS" | string;
type Difficulty = "Easy" | "Medium" | "Hard" | string;

const fallbackQuestions: Record<string, Record<string, string[]>> = {
  HR: {
    Easy: [
      "Tell me about yourself.",
      "What are your strengths and weaknesses?",
      "Why should we hire you?",
      "What are your career goals?",
    ],
    Medium: [
      "Tell me about a challenge you faced during a project and how you handled it.",
      "How do you manage pressure during deadlines?",
      "Describe a situation where you worked in a team.",
      "How do you handle feedback from seniors or mentors?",
    ],
    Hard: [
      "If your team member is not contributing properly, how would you handle the situation?",
      "Describe a time when you learned from failure.",
      "How would you handle a conflict with a teammate during a project?",
      "If you are given a task you do not know, how will you approach it?",
    ],
  },
  DBMS: {
    Easy: [
      "What is a primary key in DBMS?",
      "What is normalization in DBMS?",
      "What is the difference between primary key and foreign key?",
      "What is a table in a database?",
    ],
    Medium: [
      "What is the difference between INNER JOIN and LEFT JOIN?",
      "Why do we use indexing in a database?",
      "What are ACID properties in DBMS?",
      "What is the difference between DELETE, DROP, and TRUNCATE?",
    ],
    Hard: [
      "How would you design tables for a student course registration system?",
      "When can indexing slow down database performance?",
      "How would you prevent duplicate records in a database table?",
      "How would you handle transactions in an online payment system?",
    ],
  },
  OOPS: {
    Easy: [
      "What is the difference between a class and an object?",
      "What is inheritance in OOPS?",
      "What is encapsulation?",
      "What is polymorphism?",
    ],
    Medium: [
      "What is the difference between method overloading and method overriding?",
      "What is the difference between abstraction and encapsulation?",
      "What is the difference between interface and abstract class?",
      "Why do we use constructors in OOPS?",
    ],
    Hard: [
      "How would you use inheritance in a real-world project?",
      "Why is polymorphism useful in software development?",
      "How would you design an OOPS model for an online booking system?",
      "How does abstraction help in building large applications?",
    ],
  },
};

function normalizeInterviewType(type: InterviewType) {
  const value = String(type || "").trim().toUpperCase();

  if (value === "DSA") return "DSA";
  if (value === "HR") return "HR";
  if (value === "DBMS") return "DBMS";
  if (value === "OOPS" || value === "OOP") return "OOPS";

  return value || "GENERAL";
}

function normalizeDifficulty(difficulty: Difficulty) {
  const value = String(difficulty || "").trim().toLowerCase();

  if (value === "medium") return "Medium";
  if (value === "hard") return "Hard";

  return "Easy";
}

function getRandomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function cleanQuestion(text: string) {
  return String(text || "")
    .replace(/```/g, "")
    .replace(/^Question:\s*/i, "")
    .replace(/^\d+\.\s*/, "")
    .replace(/^[-*]\s*/, "")
    .trim();
}

function getFallbackQuestion(interviewType: string, difficulty: string): string {
  const questions =
    fallbackQuestions[interviewType]?.[difficulty] ||
    fallbackQuestions[interviewType]?.Easy ||
    ["Tell me about yourself."];

  return getRandomItem(questions);
}

function getNonRepeatedDsaQuestion({
  topic,
  difficulty,
  usedQuestions,
}: {
  topic: string;
  difficulty: string;
  usedQuestions: string[];
}) {
  const filteredQuestions = DSA_QUESTIONS.filter(
    (q) => q.topic === topic && q.difficulty === difficulty
  );

  if (filteredQuestions.length === 0) {
    return null;
  }

  const freshQuestions = filteredQuestions.filter(
    (q) => !usedQuestions.includes(q.question)
  );

  if (freshQuestions.length > 0) {
    return getRandomItem(freshQuestions);
  }

  return getRandomItem(filteredQuestions);
}

function buildSystemPrompt({
  interviewType,
  topic,
  difficulty,
  usedQuestions,
}: {
  interviewType: string;
  topic: string;
  difficulty: string;
  usedQuestions: string[];
}) {
  const usedQuestionText =
    usedQuestions.length > 0
      ? usedQuestions.map((q, index) => `${index + 1}. ${q}`).join("\n")
      : "No previous questions.";

  return `
You are a friendly and professional placement interviewer for Indian engineering students.

Your task is to generate ONLY ONE interview question for a fresher-level mock interview.

Interview Type: ${interviewType}
Topic: ${topic || "General"}
Difficulty: ${difficulty}

Previously asked questions for this same user/type/topic/difficulty:
${usedQuestionText}

NO-REPEAT RULE:
- Do not generate any question that is same or very similar to previously asked questions.
- If previous questions exist, generate a fresh question with different wording and focus.
- Avoid repeating the same concept again if possible.

STRICT OUTPUT RULES:
- Return only one question.
- Do not include the answer.
- Do not include hints.
- Do not include explanation.
- Do not use markdown.
- Do not use bullet points.
- Do not use numbering.
- Keep the question short, clear, and easy to understand.
- The question should sound like a real campus placement interview question.

DIFFICULTY RULES:
If difficulty is Easy:
- Ask basic definition-based or simple concept questions.

If difficulty is Medium:
- Ask concept + explanation based questions.

If difficulty is Hard:
- Ask scenario-based or application-based questions.
- Still keep it fresher-friendly.

FOR HR:
Generate one HR interview question.
Focus on introduction, strengths, weaknesses, goals, projects, teamwork, challenges, internship, learning mindset, communication.

FOR DBMS:
Generate one DBMS question.
Focus on keys, normalization, joins, indexing, transactions, ACID, constraints, SQL basics.

FOR OOPS:
Generate one OOPS question.
Focus on class, object, inheritance, polymorphism, encapsulation, abstraction, constructor, overloading, overriding, interface, abstract class.

IMPORTANT:
- If Interview Type is HR, generate only HR question.
- If Interview Type is DBMS, generate only DBMS question.
- If Interview Type is OOPS, generate only OOPS question.
- Do not mix topics.
- Do not ask coding questions for HR, DBMS, or OOPS.
`;
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const interviewType = normalizeInterviewType(body.interviewType);
    const topic = String(body.topic || "General").trim();
    const difficulty = normalizeDifficulty(body.difficulty);

    if (!interviewType || typeof interviewType !== "string") {
      return NextResponse.json(
        { error: "Interview type is required." },
        { status: 400 }
      );
    }

    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const selectedTopic = interviewType === "DSA" ? topic || "Array" : topic;
    const selectedDifficulty = difficulty || "Easy";

    const usedQuestions = await getUsedQuestions({
      userId: dbUser.id,
      interviewType,
      topic: selectedTopic,
      difficulty: selectedDifficulty,
    });

    const session = await createInterviewSession({
      userId: dbUser.id,
      interviewType,
      topic: selectedTopic,
      difficulty: selectedDifficulty,
    });

    if (interviewType === "DSA") {
      const selectedQuestion = getNonRepeatedDsaQuestion({
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        usedQuestions,
      });

      if (!selectedQuestion) {
        return NextResponse.json(
          {
            error: `No DSA question found for ${selectedTopic} - ${selectedDifficulty}.`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        sessionId: session.id,
        question: selectedQuestion.question,
        source: "question_bank",
        interviewType,
        topic: selectedTopic,
        difficulty: selectedDifficulty,
      });
    }

    if (!process.env.GROQ_API_KEY) {
      const fallbackQuestion = getFallbackQuestion(
        interviewType,
        selectedDifficulty
      );

      return NextResponse.json({
        sessionId: session.id,
        question: fallbackQuestion,
        source: "fallback",
        interviewType,
        topic: selectedTopic,
        difficulty: selectedDifficulty,
      });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: buildSystemPrompt({
              interviewType,
              topic: selectedTopic,
              difficulty: selectedDifficulty,
              usedQuestions,
            }),
          },
          {
            role: "user",
            content: `
Generate one ${selectedDifficulty} level ${interviewType} interview question.

Topic: ${selectedTopic || "General"}

Previously asked questions:
${
  usedQuestions.length > 0
    ? usedQuestions.map((q, index) => `${index + 1}. ${q}`).join("\n")
    : "No previous questions."
}

Remember:
- Return only the question.
- Keep it clear and fresher-friendly.
- Do not repeat or slightly rephrase previous questions.
`,
          },
        ],
        temperature: 0.5,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const aiQuestion = cleanQuestion(
      response.data.choices?.[0]?.message?.content
    );

    if (!aiQuestion) {
      const fallbackQuestion = getFallbackQuestion(
        interviewType,
        selectedDifficulty
      );

      return NextResponse.json({
        sessionId: session.id,
        question: fallbackQuestion,
        source: "fallback",
        interviewType,
        topic: selectedTopic,
        difficulty: selectedDifficulty,
      });
    }

    return NextResponse.json({
      sessionId: session.id,
      question: aiQuestion,
      source: "ai",
      interviewType,
      topic: selectedTopic,
      difficulty: selectedDifficulty,
    });
  } catch (error: unknown) {
    console.error("INTERVIEW GENERATE ERROR:", getErrorMessage(error));

    return NextResponse.json(
      {
        question: "Tell me about yourself.",
        source: "fallback",
        error: "Failed to generate question. Fallback question returned.",
      },
      { status: 200 }
    );
  }
}