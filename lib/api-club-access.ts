import "server-only";

import { NextResponse } from "next/server";

import { getAuthenticatedClubId } from "@/lib/current-club";

export async function getApiClubAccess() {
  const clubId = await getAuthenticatedClubId();

  if (clubId === null) {
    return {
      granted: false as const,
      response: NextResponse.json(
        {
          error:
            "Accedi con un manager e crea il club per continuare.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  return {
    granted: true as const,
    clubId,
  };
}
