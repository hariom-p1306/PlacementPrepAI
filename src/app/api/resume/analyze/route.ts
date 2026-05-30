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
  role_fit_summary: string;
  ats_note: string;
};

const ROLE_REQUIREMENTS: Record<string, string[]> = {
  "Full Stack Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Express.js",
    "REST APIs",
    "Database",
    "Authentication",
    "Deployment",
    "Git",
  ],
  "Frontend Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Responsive Design",
    "State Management",
    "API Integration",
    "Performance Optimization",
    "Accessibility",
  ],
  "Backend Developer": [
    "Node.js",
    "Express.js",
    "REST APIs",
    "Authentication",
    "JWT",
    "Database Design",
    "MongoDB",
    "PostgreSQL",
    "Redis",
    "Docker",
    "System Design",
    "Testing",
  ],
  "SDE Intern": [
    "DSA",
    "OOP",
    "DBMS",
    "Operating Systems",
    "Computer Networks",
    "Problem Solving",
    "Java",
    "C++",
    "Git",
    "Projects",
    "Communication",
  ],
  "MERN Stack Developer": [
    "MongoDB",
    "Express.js",
    "React",
    "Node.js",
    "JavaScript",
    "TypeScript",
    "REST APIs",
    "JWT",
    "Redux",
    "Deployment",
    "Git",
  ],
  "Data Analyst": [
    "Excel",
    "SQL",
    "Python",
    "Pandas",
    "NumPy",
    "Power BI",
    "Tableau",
    "Data Cleaning",
    "Data Visualization",
    "Statistics",
    "Business Insights",
  ],
  "AI/ML Intern": [
    "Python",
    "NumPy",
    "Pandas",
    "Scikit-learn",
    "Machine Learning",
    "Deep Learning",
    "Data Preprocessing",
    "Model Evaluation",
    "Statistics",
    "Matplotlib",
    "Projects",
  ],
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

function clampNumber(value: any, min: number, max: number) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return min;

  return Math.min(Math.max(numberValue, min), max);
}

function normalizeStringArray(value: any) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeResult(
  parsed: any,
  hasJobDescription: boolean
): ResumeAnalyzeResult {
  let atsScore = clampNumber(parsed.ats_score ?? 0, 0, 100);
  let keywordMatch = clampNumber(parsed.keyword_match ?? 0, 0, 100);

  // Strict rule: without JD, ATS cannot be treated as exact ATS match.
  if (!hasJobDescription) {
    atsScore = Math.min(atsScore, 70);
    keywordMatch = Math.min(keywordMatch, 65);
  }

  return {
    score: clampNumber(parsed.score ?? 0, 0, 10),
    ats_score: atsScore,
    skills_match: clampNumber(parsed.skills_match ?? 0, 0, 100),
    keyword_match: keywordMatch,

    strengths: normalizeStringArray(parsed.strengths).slice(0, 6),
    weaknesses: normalizeStringArray(parsed.weaknesses).slice(0, 6),
    missing_skills: normalizeStringArray(parsed.missing_skills).slice(0, 8),

    suggestions: parsed.suggestions || "No suggestions available.",
    recommended_roadmap: normalizeStringArray(parsed.recommended_roadmap).slice(
      0,
      6
    ),

    role_fit_summary:
      parsed.role_fit_summary ||
      "Role fit summary is not available for this analysis.",

    ats_note:
      parsed.ats_note ||
      (hasJobDescription
        ? "ATS score is calculated using the provided job description."
        : "ATS score is estimated because no job description was provided."),
  };
}

function getFallbackResult(
  selectedRole = "Full Stack Developer",
  hasJobDescription = false
): ResumeAnalyzeResult {
  return {
    score: 6,
    ats_score: hasJobDescription ? 60 : 55,
    skills_match: 60,
    keyword_match: hasJobDescription ? 55 : 50,
    strengths: ["Resume has useful technical information and project details."],
    weaknesses: [
      `Resume needs stronger role-specific positioning for ${selectedRole}.`,
      "Bullet points need more measurable impact and quantified results.",
    ],
    missing_skills: [
      "Role-specific keywords",
      "Measurable achievements",
      "Deployment details",
      "Testing experience",
    ],
    suggestions:
      "Improve your resume by adding measurable results, stronger action verbs, role-specific keywords, deployment details, and clearer project impact.",
    recommended_roadmap: [
      "Add role-specific keywords",
      "Rewrite project bullets with measurable impact",
      "Add deployment and testing details",
      "Improve summary according to target role",
    ],
    role_fit_summary: `The resume has some useful experience, but it needs better alignment for the ${selectedRole} role.`,
    ats_note: hasJobDescription
      ? "ATS score is calculated using the provided job description."
      : "ATS score is estimated because no job description was provided.",
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
  let selectedRole = "Full Stack Developer";
  let hasJobDescription = false;

  try {
    const { resumeText, targetRole, jobDescription } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "Resume text is required." },
        { status: 400 }
      );
    }

    selectedRole =
      typeof targetRole === "string" && targetRole.trim()
        ? targetRole.trim()
        : "Full Stack Developer";

    const jd =
      typeof jobDescription === "string" && jobDescription.trim()
        ? jobDescription.trim()
        : "";

    hasJobDescription = Boolean(jd);

    const roleRequirements =
      ROLE_REQUIREMENTS[selectedRole] || ROLE_REQUIREMENTS["Full Stack Developer"];

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are a strict ATS resume analyzer and technical recruiter.

Your job is to analyze the resume for the selected target role.

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
  "recommended_roadmap": string[],
  "role_fit_summary": string,
  "ats_note": string
}

General scoring rules:
- score must be from 0 to 10.
- ats_score, skills_match, keyword_match must be from 0 to 100.
- Be strict, realistic, and role-specific.
- Do not give high scores just because the resume looks generally good.
- Compare the resume against the selected target role.
- Strong projects help, but missing role-specific skills must reduce the score.
- If a skill is not clearly present in the resume, treat it as missing.
- Do not assume skills that are not written in the resume.
- strengths should contain 4 to 6 specific points.
- weaknesses should contain 4 to 6 specific points.
- missing_skills should contain 4 to 8 skills.
- recommended_roadmap should contain 4 to 6 learning steps.
- suggestions should be practical and directly useful.

ATS scoring rules:
- If job description is provided, calculate ats_score by comparing resume with the job description.
- If job description is not provided, ats_score is only an estimated role-based score.
- If job description is not provided, ats_score must not exceed 70.
- If job description is not provided, keyword_match must not exceed 65.
- Do not give ats_score above 85 unless the resume clearly matches most required skills from the job description.
- If job description is missing, mention this clearly in ats_note.

Role-specific analysis:
- For Frontend Developer, focus on UI, React, Next.js, CSS, responsive design, performance, accessibility, state management, API integration.
- For Backend Developer, focus on Node.js, Express.js, REST APIs, database design, auth, Redis, Docker, testing, system design, scalability.
- For Full Stack Developer, focus on frontend + backend + database + auth + deployment + end-to-end project ownership.
- For MERN Stack Developer, focus on MongoDB, Express.js, React, Node.js, REST APIs, JWT, deployment, full MERN projects.
- For SDE Intern, focus on DSA, OOP, DBMS, OS, CN, problem solving, projects, internship readiness.
- For Data Analyst, focus on SQL, Excel, Python, Pandas, data cleaning, visualization, statistics, dashboards, business insights.
- For AI/ML Intern, focus on Python, ML algorithms, data preprocessing, model evaluation, NumPy, Pandas, scikit-learn, ML projects.
`,
          },
          {
            role: "user",
            content: `
Selected Target Role:
${selectedRole}

Important Skills Expected For This Role:
${roleRequirements.join(", ")}

Job Description:
${hasJobDescription ? jd : "No job description provided."}

Resume Text:
${resumeText}
`,
          },
        ],
        temperature: 0.2,
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

    const finalResult = normalizeResult(parsed, hasJobDescription);

    await safelySaveResumeProgress(selectedRole, finalResult);

    return NextResponse.json(finalResult);
  } catch (error: any) {
    console.error(
      "RESUME ANALYZE ERROR:",
      error.response?.data || error.message
    );

    const fallbackResult = getFallbackResult(selectedRole, hasJobDescription);

    await safelySaveResumeProgress(selectedRole, fallbackResult);

    return NextResponse.json(fallbackResult, { status: 200 });
  }
}