import { NextResponse } from "next/server";
import axios from "axios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

function getFallbackLetter({
  name,
  role,
  company,
  skills,
}: {
  name: string;
  role: string;
  company: string;
  skills: string;
}) {
  return `Dear Hiring Manager,

I am writing to express my interest in the ${role || "Software Developer"} role${
    company ? ` at ${company}` : ""
  }. I am a motivated and dedicated candidate with strong interest in software development and continuous learning.

My key skills include ${skills || "programming, problem-solving, web development, and project building"}. I enjoy building practical projects, learning new technologies, and improving my technical and communication skills.

I believe my learning mindset, project experience, and dedication make me a suitable candidate for this opportunity. I would be grateful for the chance to contribute to your team and grow through real-world work experience.

Thank you for considering my application.

Sincerely,
${name || "Your Name"}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const role = typeof body.role === "string" ? body.role.trim() : "";
    const company =
      typeof body.company === "string" ? body.company.trim() : "";
    const skills = typeof body.skills === "string" ? body.skills.trim() : "";
    const experience =
      typeof body.experience === "string" ? body.experience.trim() : "";
    const jobDescription =
      typeof body.jobDescription === "string"
        ? body.jobDescription.trim()
        : "";
    const tone = typeof body.tone === "string" ? body.tone.trim() : "Formal";

    if (!name || !role || !skills) {
      return NextResponse.json(
        {
          letter: "",
          error: "Name, role, and skills are required.",
        },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          letter: getFallbackLetter({ name, role, company, skills }),
        },
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
You are a professional career assistant.

Write a strong, personalized cover letter for students and freshers applying for internships or fresher jobs.

Rules:
- Return plain text only.
- Do not return JSON.
- Do not use markdown.
- Keep it professional and realistic.
- Avoid fake claims.
- Keep it around 180 to 260 words.
- Make it suitable for Indian engineering students and fresher roles.
- Use the selected tone.
- If job description is provided, align the letter with it.
- Mention projects/experience if provided.
- End politely with a call for interview/opportunity.
`,
          },
          {
            role: "user",
            content: `
Candidate Name:
${name}

Company Name:
${company || "Not provided"}

Job Role:
${role}

Skills:
${skills}

Projects / Experience:
${experience || "Not provided"}

Job Description:
${jobDescription || "Not provided"}

Tone:
${tone}

Generate a personalized cover letter.
`,
          },
        ],
        temperature: 0.4,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const letter =
      response.data.choices?.[0]?.message?.content ||
      getFallbackLetter({ name, role, company, skills });

    return NextResponse.json({ letter }, { status: 200 });
  } catch (error: unknown) {
    console.error("COVER LETTER API ERROR:", getErrorMessage(error));

    return NextResponse.json(
      {
        letter: "Failed to generate cover letter. Please try again.",
        error: getErrorMessage(error),
      },
      { status: 200 }
    );
  }
}