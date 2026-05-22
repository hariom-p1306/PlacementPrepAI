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
You are a professional software engineering interviewer for placement preparation.

Interview Type: ${interviewType}

Your task is to generate ONLY ONE interview question based on the Interview Type.

GENERAL RULES:
- Beginner to medium level only
- Question should feel like a real fresher placement interview question
- Do NOT give answer
- Do NOT give hints
- Do NOT give explanation outside the required format
- Do NOT use markdown tables
- Do NOT use bullet points unless constraints require it
- Return clean plain text only

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

FOR DSA:
Generate one LeetCode-style coding problem.

DSA OUTPUT FORMAT MUST BE EXACTLY LIKE THIS:

Title: <Problem Title>

Difficulty: <Easy or Medium>

Problem:
<Write a clear problem statement in 2-4 lines.>

Example 1:
Input: <sample input>
Output: <sample output>
Explanation: <short explanation>

Example 2:
Input: <sample input>
Output: <sample output>
Explanation: <short explanation>

Constraints:
<write constraints in separate lines>

Function Signature:
Java:
class Solution {
    public <returnType> <functionName>(<parameters>) {
        
    }
}

DSA TOPICS:
Array, String, HashMap, Stack, Queue, Two Pointers, Sliding Window, Binary Search, Linked List, Tree, Graph, Basic DP.

IMPORTANT FOR DSA:
- Add a blank line after Title, Difficulty, Problem, each Example, Constraints, and Function Signature.
- Use proper line breaks between each section
- Do not write everything in one paragraph
- Do not include hints
- Do not include solution
- Do not include markdown code fences
- Function signature must be Java only
- Return only the structured problem text
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