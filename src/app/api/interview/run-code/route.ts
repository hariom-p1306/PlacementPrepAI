import { NextResponse } from "next/server";
import { writeFile, mkdir, rm } from "fs/promises";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import crypto from "crypto";

export const runtime = "nodejs";

const execAsync = promisify(exec);

function cleanCode(code: string) {
  return code
    .replace(/```java/g, "")
    .replace(/```ts/g, "")
    .replace(/```/g, "")
    .trim();
}

function removeDuplicateImports(finalCode: string) {
  const lines = finalCode.split("\n");
  const imports = new Set<string>();
  const normalLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("import ")) {
      imports.add(trimmed);
    } else {
      normalLines.push(line);
    }
  }

  return [...imports, "", ...normalLines].join("\n").trim();
}

function getErrorOutput(error: any, fallback: string) {
  if (error?.killed || error?.signal === "SIGTERM") {
    return "Time Limit Exceeded: Your code took too long to run.";
  }

  return error?.stderr || error?.stdout || error?.message || fallback;
}

export async function POST(req: Request) {
  let tempDir = "";

  try {
    const body = await req.json();
    const { code, runnerCode } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code is required." },
        { status: 400 }
      );
    }

    if (!runnerCode || typeof runnerCode !== "string") {
      return NextResponse.json(
        {
          error: "Runner Code is missing. Please generate a new DSA question.",
        },
        { status: 400 }
      );
    }

    const cleanUserCode = cleanCode(code);
    const cleanRunnerCode = cleanCode(runnerCode);

    if (!cleanUserCode.includes("class Solution")) {
      return NextResponse.json(
        {
          output: "Your code must contain class Solution.",
          type: "compile_error",
        },
        { status: 200 }
      );
    }

    if (!cleanRunnerCode.includes("public class Main")) {
      return NextResponse.json(
        {
          output: "Runner Code must contain public class Main.",
          type: "compile_error",
        },
        { status: 200 }
      );
    }

    let finalCode = `
import java.util.*;

${cleanUserCode}

${cleanRunnerCode}
`;

    finalCode = removeDuplicateImports(finalCode);

    const uniqueId = crypto.randomUUID();
    tempDir = path.join(os.tmpdir(), `placementprep-${uniqueId}`);

    await mkdir(tempDir, { recursive: true });

    const javaFilePath = path.join(tempDir, "Main.java");

    await writeFile(javaFilePath, finalCode, "utf-8");

    // Compile Java code
    try {
      await execAsync("javac Main.java", {
        cwd: tempDir,
        timeout: 10000,
        maxBuffer: 1024 * 1024,
      });
    } catch (compileError: any) {
      return NextResponse.json({
        output: getErrorOutput(compileError, "Compilation failed."),
        type: "compile_error",
        finalCode,
      });
    }

    // Run Java code
    try {
      const { stdout, stderr } = await execAsync("java Main", {
        cwd: tempDir,
        timeout: 10000,
        maxBuffer: 1024 * 1024,
      });

      return NextResponse.json({
        output: stdout || stderr || "Code executed, but no output was produced.",
        type: "success",
        finalCode,
      });
    } catch (runError: any) {
      return NextResponse.json({
        output: getErrorOutput(runError, "Runtime error occurred."),
        type: runError?.killed ? "time_limit_exceeded" : "runtime_error",
        finalCode,
      });
    }
  } catch (error: any) {
    console.error("Local Java runner error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Something went wrong while running Java code.",
      },
      { status: 500 }
    );
  } finally {
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup error
      }
    }
  }
}