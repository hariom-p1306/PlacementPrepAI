import { NextResponse } from "next/server";
import axios from "axios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RoadmapStep = {
  step: string;
  description: string;
  tasks: string[];
  project?: string;
  interviewFocus?: string[];
};

type RoadmapResponse = {
  role: string;
  level: string;
  duration: string;
  focusArea: string;
  steps: RoadmapStep[];
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

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeRoadmap(data: Partial<RoadmapResponse>): RoadmapResponse {
  const rawSteps = Array.isArray(data.steps) ? data.steps : [];

  const steps = rawSteps.map((item) => ({
    step:
      typeof item?.step === "string" && item.step.trim()
        ? item.step.trim()
        : "Learning Step",
    description:
      typeof item?.description === "string" && item.description.trim()
        ? item.description.trim()
        : "Focus on building strong fundamentals and applying concepts.",
    tasks: normalizeStringArray(item?.tasks).slice(0, 6),
    project:
      typeof item?.project === "string" && item.project.trim()
        ? item.project.trim()
        : "Build a small practical project related to this step.",
    interviewFocus: normalizeStringArray(item?.interviewFocus).slice(0, 5),
  }));

  return {
    role:
      typeof data.role === "string" && data.role.trim()
        ? data.role.trim()
        : "Software Developer",
    level:
      typeof data.level === "string" && data.level.trim()
        ? data.level.trim()
        : "Beginner",
    duration:
      typeof data.duration === "string" && data.duration.trim()
        ? data.duration.trim()
        : "1 Month",
    focusArea:
      typeof data.focusArea === "string" && data.focusArea.trim()
        ? data.focusArea.trim()
        : "All",
    steps,
  };
}

function getFallbackRoadmap({
  goal,
  level,
  duration,
  focusArea,
}: {
  goal: string;
  level: string;
  duration: string;
  focusArea: string;
}): RoadmapResponse {
  return {
    role: goal || "Software Developer",
    level,
    duration,
    focusArea,
    steps: [
      {
        step: "Step 1: Build Core Fundamentals",
        description:
          "Start with the basic concepts required for your target role and revise them properly.",
        tasks: [
          "Revise important programming fundamentals",
          "Study basic CS concepts like OOPS, DBMS, OS, and CN",
          "Practice 3 to 5 beginner-level problems daily",
          "Make short notes for revision",
        ],
        project: "Create a small notes or task management app.",
        interviewFocus: [
          "Tell me about yourself",
          "Explain your project",
          "Basic OOPS and DBMS questions",
        ],
      },
      {
        step: "Step 2: Build Role-Specific Skills",
        description:
          "Focus on the technologies and practical skills needed for your selected role.",
        tasks: [
          "Pick one main technology stack",
          "Build small modules using that stack",
          "Learn API integration and deployment basics",
          "Revise common interview questions",
        ],
        project: "Build a role-specific mini project and deploy it.",
        interviewFocus: [
          "Technology stack explanation",
          "Project architecture",
          "Challenges faced during project",
        ],
      },
      {
        step: "Step 3: Practice Projects and Interviews",
        description:
          "Move from learning to execution by building projects and practicing interview answers.",
        tasks: [
          "Complete one strong project",
          "Write project README clearly",
          "Practice mock interviews",
          "Improve resume points with measurable impact",
        ],
        project: "Build one portfolio-level project for your target role.",
        interviewFocus: [
          "Project deep dive",
          "Problem-solving approach",
          "Strengths and weaknesses",
        ],
      },
    ],
  };
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

    const goal =
      typeof body.goal === "string" && body.goal.trim()
        ? body.goal.trim()
        : "";

    const level =
      typeof body.level === "string" && body.level.trim()
        ? body.level.trim()
        : "Beginner";

    const duration =
      typeof body.duration === "string" && body.duration.trim()
        ? body.duration.trim()
        : "1 Month";

    const focusArea =
      typeof body.focusArea === "string" && body.focusArea.trim()
        ? body.focusArea.trim()
        : "All";

    if (!goal) {
      return NextResponse.json(
        { error: "Goal is required.", steps: [] },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        getFallbackRoadmap({ goal, level, duration, focusArea }),
        { status: 200 }
      );
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are an expert career mentor for Indian engineering students preparing for placements.

Generate a practical and structured roadmap.

Return STRICT JSON only.
Do not use markdown.
Do not use code fences.
Do not return text outside JSON.

JSON format:

{
  "role": "target role",
  "level": "Beginner | Intermediate | Advanced",
  "duration": "2 Weeks | 1 Month | 3 Months",
  "focusArea": "DSA | Projects | Interview | System Design | All",
  "steps": [
    {
      "step": "Week 1: title",
      "description": "short explanation",
      "tasks": ["task1", "task2", "task3"],
      "project": "mini project idea",
      "interviewFocus": ["question area 1", "question area 2"]
    }
  ]
}

Rules:
- Generate 4 to 8 steps depending on duration.
- Keep roadmap realistic for college students.
- Include DSA, project work, CS fundamentals, resume, and interview preparation when focusArea is All.
- If focusArea is DSA, focus more on problem-solving plan.
- If focusArea is Projects, focus more on project building.
- If focusArea is Interview, focus more on HR, CS, and project explanation.
- If focusArea is System Design, keep it beginner-friendly.
- Tasks must be actionable and specific.
- Project ideas must be practical and resume-friendly.
`,
          },
          {
            role: "user",
            content: `
Target Role:
${goal}

Current Level:
${level}

Duration:
${duration}

Focus Area:
${focusArea}

Create a personalized placement preparation roadmap.
`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const aiContent = response.data.choices?.[0]?.message?.content || "";
    const jsonText = extractJson(aiContent);
    const parsed = JSON.parse(jsonText) as Partial<RoadmapResponse>;

    return NextResponse.json(normalizeRoadmap(parsed), { status: 200 });
  } catch (error: unknown) {
    console.error("ROADMAP API ERROR:", getErrorMessage(error));

    return NextResponse.json(
      getFallbackRoadmap({
        goal: "Software Developer",
        level: "Beginner",
        duration: "1 Month",
        focusArea: "All",
      }),
      { status: 200 }
    );
  }
}