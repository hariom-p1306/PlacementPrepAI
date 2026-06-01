import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getCurrentDbUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null;

  try {
    return await prisma.user.upsert({
      where: {
        clerkId: clerkUser.id,
      },
      update: {
        name: clerkUser.fullName,
        email,
      },
      create: {
        clerkId: clerkUser.id,
        name: clerkUser.fullName,
        email,
      },
    });
  } catch (error) {
    // Handles race condition when multiple API calls try to create same Clerk user
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return prisma.user.findUnique({
        where: {
          clerkId: clerkUser.id,
        },
      });
    }

    throw error;
  }
}