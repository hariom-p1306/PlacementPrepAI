import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { s3BucketName, s3Client } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTypes = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized user." },
        { status: 401 }
      );
    }

    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType are required." },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "Only PDF, TXT, and DOCX files are allowed." },
        { status: 400 }
      );
    }

    const safeFileName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");

    const key = `users/${userId}/resumes/${Date.now()}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: s3BucketName,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });

    return NextResponse.json({
      uploadUrl,
      key,
    });
  } catch (error) {
    console.error("S3 presigned URL error:", error);

    return NextResponse.json(
      { error: "Failed to create upload URL." },
      { status: 500 }
    );
  }
}