import { prisma } from "@/lib/prisma";

type CreateInterviewSessionInput = {
  userId: string; // Database User.id
  interviewType: string;
  topic?: string | null;
  difficulty?: string | null;
};

type SaveInterviewAnswerInput = {
  sessionId: string;
  question: string;
  answer: string;
  score: number;
  strengths?: string[];
  weaknesses?: string[];
  improvementTips?: string[];
  idealAnswer?: string | null;
};

type SaveUsedQuestionInput = {
  userId: string; // Database User.id
  interviewType: string;
  topic?: string | null;
  difficulty?: string | null;
  question: string;
};

type GetUsedQuestionsInput = {
  userId: string; // Database User.id
  interviewType: string;
  topic?: string | null;
  difficulty?: string | null;
};

type CompleteInterviewSessionInput = {
  sessionId: string;
};

function normalizeText(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}

export async function createInterviewSession({
  userId,
  interviewType,
  topic,
  difficulty,
}: CreateInterviewSessionInput) {
  return prisma.interviewSession.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      interviewType,
      topic: normalizeText(topic),
      difficulty: normalizeText(difficulty),
    },
  });
}

export async function saveInterviewAnswer({
  sessionId,
  question,
  answer,
  score,
  strengths = [],
  weaknesses = [],
  improvementTips = [],
  idealAnswer,
}: SaveInterviewAnswerInput) {
  if (!sessionId) {
    throw new Error("sessionId is required to save interview answer.");
  }

  return prisma.interviewAnswer.create({
    data: {
      session: {
        connect: {
          id: sessionId,
        },
      },
      question,
      answer,
      score: Number(score || 0),
      strengths,
      weaknesses,
      improvementTips,
      idealAnswer: normalizeText(idealAnswer),
    },
  });
}

export async function saveUsedQuestion({
  userId,
  interviewType,
  topic,
  difficulty,
  question,
}: SaveUsedQuestionInput) {
  const normalizedTopic = normalizeText(topic);
  const normalizedDifficulty = normalizeText(difficulty);

  const existingQuestion = await prisma.usedQuestion.findFirst({
    where: {
      userId,
      interviewType,
      topic: normalizedTopic,
      difficulty: normalizedDifficulty,
      question,
    },
    select: {
      id: true,
    },
  });

  if (existingQuestion) {
    return existingQuestion;
  }

  return prisma.usedQuestion.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      interviewType,
      topic: normalizedTopic,
      difficulty: normalizedDifficulty,
      question,
    },
  });
}

export async function getUsedQuestions({
  userId,
  interviewType,
  topic,
  difficulty,
}: GetUsedQuestionsInput) {
  const usedQuestions = await prisma.usedQuestion.findMany({
    where: {
      userId,
      interviewType,
      topic: normalizeText(topic),
      difficulty: normalizeText(difficulty),
    },
    select: {
      question: true,
    },
    orderBy: {
      usedAt: "desc",
    },
    take: 100,
  });

  return usedQuestions.map((item) => item.question);
}

export async function completeInterviewSession({
  sessionId,
}: CompleteInterviewSessionInput) {
  if (!sessionId) {
    throw new Error("sessionId is required to complete interview session.");
  }

  const answers = await prisma.interviewAnswer.findMany({
    where: {
      sessionId,
    },
    select: {
      score: true,
    },
  });

  const totalScore = answers.reduce(
    (sum, item) => sum + Number(item.score || 0),
    0
  );

  const averageScore =
    answers.length > 0 ? Number((totalScore / answers.length).toFixed(1)) : 0;

  return prisma.interviewSession.update({
    where: {
      id: sessionId,
    },
    data: {
      totalScore,
      averageScore,
      completedAt: new Date(),
    },
  });
}