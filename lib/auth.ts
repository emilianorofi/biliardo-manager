import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type AuthenticatedManager = {
  id: string;
  name: string;
  clubId: number | null;
  onboardingStatus: string;
};

export const getAuthenticatedUser = cache(
  async () => {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  }
);

export async function getManagerByAuthUserId(
  userId: string
) {
  const managers = await prisma.$queryRaw<
    AuthenticatedManager[]
  >`
    SELECT
      "id",
      "name",
      "clubId",
      "onboardingStatus"
    FROM "Manager"
    WHERE "id" = ${userId}::uuid
    LIMIT 1
  `;

  return managers[0] ?? null;
}

export async function requireAuthenticatedManager() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const manager = await getManagerByAuthUserId(user.id);

  if (!manager) {
    redirect("/register?error=manager-profile");
  }

  return manager;
}
