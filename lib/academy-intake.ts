import type { Prisma } from "@/generated/prisma/client";
import { getNextAcademyScoutingAt } from "@/lib/academy-scouting";
import { createWeeklyAcademyPlayer } from "@/lib/onboarding/initial-academy";

export const MAX_ACADEMY_PLAYERS = 10;

type LockedAcademyClub = {
  id: number;
};

export type AcademyIntakeResult = {
  createdPlayers: number;
  missedCandidates: number;
  nextAcademyCandidateAt: Date;
};

export async function advanceAcademyIntake(
  transaction: Prisma.TransactionClient,
  clubId: number,
  now = new Date(),
  random = Math.random
): Promise<AcademyIntakeResult> {
  const lockedClub = await transaction.$queryRaw<
    LockedAcademyClub[]
  >`
    SELECT "id"
    FROM "Club"
    WHERE "id" = ${clubId}
    FOR UPDATE
  `;

  if (lockedClub.length === 0) {
    throw new Error("CLUB_NOT_FOUND");
  }

  const club = await transaction.club.findUnique({
    where: {
      id: clubId,
    },
    select: {
      nextAcademyCandidateAt: true,
    },
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND");
  }

  let nextAcademyCandidateAt =
    club.nextAcademyCandidateAt;

  if (!nextAcademyCandidateAt) {
    nextAcademyCandidateAt =
      getNextAcademyScoutingAt(now);

    await transaction.club.update({
      where: {
        id: clubId,
      },
      data: {
        nextAcademyCandidateAt,
      },
    });

    return {
      createdPlayers: 0,
      missedCandidates: 0,
      nextAcademyCandidateAt,
    };
  }

  let academyPlayers =
    await transaction.academyPlayer.count({
      where: {
        clubId,
      },
    });
  let createdPlayers = 0;
  let missedCandidates = 0;

  while (
    nextAcademyCandidateAt.getTime() <= now.getTime()
  ) {
    if (academyPlayers < MAX_ACADEMY_PLAYERS) {
      await transaction.academyPlayer.create({
        data: {
          ...createWeeklyAcademyPlayer({
            from: nextAcademyCandidateAt,
            random,
          }),
          clubId,
        },
      });

      academyPlayers += 1;
      createdPlayers += 1;
    } else {
      missedCandidates += 1;
    }

    nextAcademyCandidateAt =
      getNextAcademyScoutingAt(
        new Date(
          nextAcademyCandidateAt.getTime() + 1000
        )
      );
  }

  await transaction.club.update({
    where: {
      id: clubId,
    },
    data: {
      nextAcademyCandidateAt,
    },
  });

  return {
    createdPlayers,
    missedCandidates,
    nextAcademyCandidateAt,
  };
}
