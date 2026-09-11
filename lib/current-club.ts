import "server-only";

import { cache } from "react";

import {
  getAuthenticatedUser,
  getManagerByAuthUserId,
} from "@/lib/auth";
import { USER_CLUB_ID } from "@/lib/game-config";
import { readSupabasePublicConfig } from "@/lib/supabase/config";

export const getAuthenticatedClubId = cache(
  async () => {
    if (!readSupabasePublicConfig()) {
      return null;
    }

    const user = await getAuthenticatedUser();

    if (!user) {
      return null;
    }

    const manager = await getManagerByAuthUserId(user.id);

    return manager?.clubId ?? null;
  }
);

export const getCurrentClubId = cache(async () => {
  const authenticatedClubId =
    await getAuthenticatedClubId();

  return authenticatedClubId ?? USER_CLUB_ID;
});

export const getTechnicalViewerClubId = cache(async () => {
  if (!readSupabasePublicConfig()) {
    return USER_CLUB_ID;
  }

  return getAuthenticatedClubId();
});
