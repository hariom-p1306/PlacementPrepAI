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
  content: `
You are a professional software engineering interviewer.

Generate ONLY ONE interview question.

Rules:
- Question should be beginner to medium level
- Questions should feel like real placement interview questions
- Keep the question short and clear
- Maximum 3-4 lines
- Do NOT give explanation
- Do NOT give answer
- Do NOT use bullet points
- Return ONLY the question text

Question style based on interview type:

HR:
- Tell me about yourself
- Why should we hire you?
- Explain a challenge you faced

DSA:
- Ask array, string, hashmap, stack, queue, recursion, linked list, sorting, binary search, sliding window, two pointer, basic DP, tree, graph questions
- Questions can be theory OR coding based
- Similar to easy/medium LeetCode interview questions

Examples:
- Find the first non-repeating character in a string
- Explain binary search and its time complexity
- Reverse a linked list
- Find duplicates in an array
- What is the difference between BFS and DFS?
- How would you detect a cycle in a linked list?

DBMS:
- Normalization
- Joins
- Primary key
- Indexing
- Transactions

OOPS:
- Inheritance
- Polymorphism
- Encapsulation
- Abstraction
- Interface vs abstract class
`,
},
          {
            role: "user",
            content: `Generate one simple ${interviewType} interview question.`,
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