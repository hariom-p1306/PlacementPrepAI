/*
  Warnings:

  - You are about to drop the column `answer` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `idealAnswer` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `improvementTips` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `strengths` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `weaknesses` on the `InterviewSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InterviewSession" DROP COLUMN "answer",
DROP COLUMN "createdAt",
DROP COLUMN "idealAnswer",
DROP COLUMN "improvementTips",
DROP COLUMN "question",
DROP COLUMN "score",
DROP COLUMN "strengths",
DROP COLUMN "weaknesses",
ADD COLUMN     "averageScore" DOUBLE PRECISION,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "topic" TEXT,
ADD COLUMN     "totalScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "InterviewAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "improvementTips" TEXT[],
    "idealAnswer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsedQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interviewType" TEXT NOT NULL,
    "topic" TEXT,
    "difficulty" TEXT,
    "question" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewAnswer_sessionId_idx" ON "InterviewAnswer"("sessionId");

-- CreateIndex
CREATE INDEX "UsedQuestion_userId_idx" ON "UsedQuestion"("userId");

-- CreateIndex
CREATE INDEX "UsedQuestion_userId_interviewType_idx" ON "UsedQuestion"("userId", "interviewType");

-- CreateIndex
CREATE INDEX "UsedQuestion_userId_interviewType_topic_difficulty_idx" ON "UsedQuestion"("userId", "interviewType", "topic", "difficulty");

-- CreateIndex
CREATE INDEX "InterviewSession_userId_idx" ON "InterviewSession"("userId");

-- CreateIndex
CREATE INDEX "InterviewSession_userId_interviewType_idx" ON "InterviewSession"("userId", "interviewType");

-- CreateIndex
CREATE INDEX "InterviewSession_userId_interviewType_topic_difficulty_idx" ON "InterviewSession"("userId", "interviewType", "topic", "difficulty");

-- AddForeignKey
ALTER TABLE "InterviewAnswer" ADD CONSTRAINT "InterviewAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsedQuestion" ADD CONSTRAINT "UsedQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
