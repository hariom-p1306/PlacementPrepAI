import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getCurrentDbUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  let clerkUser = null;

  try {
    clerkUser = await currentUser();
  } catch (error) {
    console.error("CLERK CURRENT USER ERROR:", error);
  }

  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
  const name = clerkUser?.fullName ?? clerkUser?.username ?? null;

  const updateData: Prisma.UserUpdateInput = {};

  if (name) {
    updateData.name = name;
  }

  if (email) {
    updateData.email = email;
  }

  try {
    return await prisma.user.upsert({
      where: {
        clerkId: userId,
      },
      update: updateData,
      create: {
        clerkId: userId,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("GET CURRENT DB USER ERROR:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return prisma.user.findUnique({
        where: {
          clerkId: userId,
        },
      });
    }

    throw error;
  }
}