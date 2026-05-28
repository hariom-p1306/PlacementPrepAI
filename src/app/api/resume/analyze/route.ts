import { NextResponse } from "next/server";
import axios from "axios";
import { saveResumeProgress } from "@/lib/progress";

export const runtime = "nodejs";

type ResumeAnalyzeResult = {
  score: number;
  ats_score: number;
  skills_match: number;
  keyword_match: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  suggestions: string;
  recommended_roadmap: string[];
};

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No valid JSON object found in AI response.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

function normalizeResult(parsed: any): ResumeAnalyzeResult {
  return {
    score: Number(parsed.score ?? 0),
    ats_score: Number(parsed.ats_score ?? 0),
    skills_match: Number(parsed.skills_match ?? 0),
    keyword_match: Number(parsed.keyword_match ?? 0),

    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    missing_skills: Array.isArray(parsed.missing_skills)
      ? parsed.missing_skills
      : [],

    suggestions: parsed.suggestions || "No suggestions available.",

    recommended_roadmap: Array.isArray(parsed.recommended_roadmap)
      ? parsed.recommended_roadmap
      : [],
  };
}

function getFallbackResult(): ResumeAnalyzeResult {
  return {
    score: 6,
    ats_score: 60,
    skills_match: 60,
    keyword_match: 55,
    strengths: ["Resume has useful technical information."],
    weaknesses: ["Resume needs clearer structure and stronger bullet points."],
    missing_skills: ["Role-specific keywords", "Measurable achievements"],
    suggestions:
      "Improve your resume by adding measurable results, stronger action verbs, role-specific keywords, and clearer project impact.",
    recommended_roadmap: [
      "Add measurable project achievements",
      "Improve ATS keywords",
      "Add deployment and testing experience",
      "Highlight role-specific skills",
    ],
  };
}

async function safelySaveResumeProgress(
  selectedRole: string,
  result: ResumeAnalyzeResult
) {
  try {
    await saveResumeProgress({
      targetRole: selectedRole,
      ...result,
    });
  } catch (error) {
    console.error("REDIS SAVE RESUME ERROR:", error);
  }
}

export async function POST(req: Request) {
  try {
    const { resumeText, targetRole, jobDescription } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "Resume text is required." },
        { status: 400 }
      );
    }

    const selectedRole = targetRole || "Full Stack Developer";
    const jd = jobDescription || "No job description provided.";

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are an expert ATS resume analyzer and placement preparation mentor.

Analyze the resume for the selected target role and optional job description.

Return ONLY strict valid JSON.
Do not use markdown.
Do not use code fences.
Do not add explanation outside JSON.

JSON format must be exactly:

{
  "score": number,
  "ats_score": number,
  "skills_match": number,
  "keyword_match": number,
  "strengths": string[],
  "weaknesses": string[],
  "missing_skills": string[],
  "suggestions": string,
  "recommended_roadmap": string[]
}

Rules:
- score must be from 0 to 10.
- ats_score, skills_match, keyword_match must be from 0 to 100.
- strengths should contain 4 to 6 points.
- weaknesses should contain 4 to 6 points.
- missing_skills should contain 4 to 8 skills.
- suggestions should be a practical paragraph.
- recommended_roadmap should contain 4 to 6 learning steps.
- Be specific for the target role.
- If job description is provided, compare resume with it.
- If job description is not provided, analyze based on target role.
`,
          },
          {
            role: "user",
            content: `
Target Role:
${selectedRole}

Job Description:
${jd}

Resume Text:
${resumeText}
`,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiContent = response.data.choices[0].message.content;
    const jsonText = extractJson(aiContent);
    const parsed = JSON.parse(jsonText);

    const finalResult = normalizeResult(parsed);

    await safelySaveResumeProgress(selectedRole, finalResult);

    return NextResponse.json(finalResult);
  } catch (error: any) {
    console.error(
      "RESUME ANALYZE ERROR:",
      error.response?.data || error.message
    );

    const fallbackResult = getFallbackResult();

    await safelySaveResumeProgress("Full Stack Developer", fallbackResult);

    return NextResponse.json(fallbackResult, { status: 200 });
  }
}