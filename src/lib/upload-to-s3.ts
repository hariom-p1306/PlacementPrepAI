export async function uploadFileToS3(file: File) {
  const presignedRes = await fetch("/api/upload/presigned-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
    }),
  });

  const presignedData = await presignedRes.json();

  if (!presignedRes.ok) {
    throw new Error(presignedData.error || "Failed to create upload URL.");
  }

  const uploadRes = await fetch(presignedData.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload file to AWS S3.");
  }

  return presignedData.key as string;
}