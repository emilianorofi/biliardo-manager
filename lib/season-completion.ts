import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import {
  calculateEndOfSeasonPlayerOutcome,
} from "@/lib/player-aging";

type CompleteSeasonOptions = {
  now?: Date;
  random?: () => number;
};

export type SeasonCompletionResult = {
  seasonId: number;
  completed: boolean;
  alreadyCompleted: boolean;
  agedPlayers: number;
  agedAcademyPlayers: number;
  retiredPlayers: Array<{
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    retirementChance: number;
  }>;
  releasedAcademyPlayers: Array<{
    id: number;
    firstName: string;
    lastName: string;
    age: number;
  }>;
};

export async function completeSeasonIfReady(
  transaction: Prisma.TransactionClient,
  seasonId: number,
  {
    now = new Date(),
    random = Math.random,
  }: CompleteSeasonOptions = {}
): Promise<SeasonCompletionResult> {
  const lockedSeason = await transaction.$queryRaw<
    { id: number }[]
  >`
    SELECT "id"
    FROM "Season"
    WHERE "id" = ${seasonId}
    FOR UPDATE
  `;

  if (lockedSeason.length === 0) {
    throw new Error("SEASON_NOT_FOUND");
  }

  const season = await transaction.season.findUnique({
    where: {
      id: seasonId,
    },
    select: {
      status: true,
    },
  });

  if (!season) {
    throw new Error("SEASON_NOT_FOUND");
  }

  if (season.status === "COMPLETED") {
    return createEmptyResult(seasonId, true);
  }

  if (season.status !== "ACTIVE") {
    return createEmptyResult(seasonId, false);
  }

  const leagues = await transaction.league.findMany({
    where: {
      seasonId,
    },
    select: {
      status: true,
    },
  });

  if (
    leagues.length === 0 ||
    leagues.some((league) => league.status !== "COMPLETED")
  ) {
    return createEmptyResult(seasonId, false);
  }

  const [players, academyPlayers] = await Promise.all([
    transaction.player.findMany({
      where: {
        careerStatus: "ACTIVE",
      },
      select: {
        id: true,
        clubId: true,
        firstName: true,
        lastName: true,
        age: true,
      },
      orderBy: {
        id: "asc",
      },
    }),
    transaction.academyPlayer.findMany({
      select: {
        id: true,
        clubId: true,
        firstName: true,
        lastName: true,
        age: true,
      },
      orderBy: {
        id: "asc",
      },
    }),
  ]);
  const outcomes = players.map((player) => ({
    player,
    outcome: calculateEndOfSeasonPlayerOutcome(
      player.age,
      random()
    ),
  }));
  const retirements = outcomes.filter(
    ({ outcome }) => outcome.retired
  );
  const retiredPlayerIds = retirements.map(
    ({ player }) => player.id
  );
  const releasedAcademyPlayers = academyPlayers
    .filter((player) => player.age >= 17)
    .map((player) => ({
      ...player,
      age: player.age + 1,
    }));

  if (players.length > 0) {
    await transaction.player.updateMany({
      where: {
        id: {
          in: players.map((player) => player.id),
        },
        careerStatus: "ACTIVE",
      },
      data: {
        age: {
          increment: 1,
        },
      },
    });
  }

  if (academyPlayers.length > 0) {
    await transaction.academyPlayer.updateMany({
      where: {
        id: {
          in: academyPlayers.map((player) => player.id),
        },
      },
      data: {
        age: {
          increment: 1,
        },
      },
    });
  }

  if (releasedAcademyPlayers.length > 0) {
    await transaction.academyPlayer.deleteMany({
      where: {
        id: {
          in: releasedAcademyPlayers.map(
            (player) => player.id
          ),
        },
      },
    });

    await transaction.gameEvent.createMany({
      data: releasedAcademyPlayers.map((player) => ({
        clubId: player.clubId,
        type: "ACADEMY_PLAYER_RELEASED",
        title: `Uscita dall'Accademia: ${player.firstName} ${player.lastName}`,
        description: `${player.firstName} ${player.lastName} ha compiuto 18 anni senza essere promosso ed è stato rilasciato.`,
        createdAt: now,
      })),
    });
  }

  if (retiredPlayerIds.length > 0) {
    await clearRetiredPlayersFromFormations(
      transaction,
      retiredPlayerIds
    );

    await transaction.transferListing.updateMany({
      where: {
        playerId: {
          in: retiredPlayerIds,
        },
        status: {
          in: ["ACTIVE", "PENDING_TRANSFER"],
        },
      },
      data: {
        status: "CANCELLED",
        completedAt: now,
      },
    });

    await transaction.player.updateMany({
      where: {
        id: {
          in: retiredPlayerIds,
        },
        careerStatus: "ACTIVE",
      },
      data: {
        careerStatus: "RETIRED",
        clubId: null,
        retiredAt: now,
        retirementSeasonId: seasonId,
      },
    });

    await transaction.gameEvent.createMany({
      data: retirements.map(({ player, outcome }) => ({
        clubId: player.clubId,
        type: "PLAYER_RETIRED",
        title: `Ritiro: ${player.firstName} ${player.lastName}`,
        description: `${player.firstName} ${player.lastName} conclude la carriera a ${outcome.age} anni.`,
        createdAt: now,
      })),
    });
  }

  await transaction.season.update({
    where: {
      id: seasonId,
    },
    data: {
      status: "COMPLETED",
      endsAt: now,
    },
  });

  await transaction.gameEvent.create({
    data: {
      clubId: null,
      type: "Campionato",
      title: "Stagione conclusa",
      description: `${players.length} giocatori e ${academyPlayers.length} giovani hanno compiuto un anno; ${retirements.length} giocatori si sono ritirati e ${releasedAcademyPlayers.length} giovani hanno lasciato l'Accademia.`,
      createdAt: now,
    },
  });

  return {
    seasonId,
    completed: true,
    alreadyCompleted: false,
    agedPlayers: players.length,
    agedAcademyPlayers: academyPlayers.length,
    retiredPlayers: retirements.map(
      ({ player, outcome }) => ({
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        age: outcome.age,
        retirementChance: outcome.retirementChance,
      })
    ),
    releasedAcademyPlayers:
      releasedAcademyPlayers.map((player) => ({
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        age: player.age,
      })),
  };
}

function createEmptyResult(
  seasonId: number,
  alreadyCompleted: boolean
): SeasonCompletionResult {
  return {
    seasonId,
    completed: false,
    alreadyCompleted,
    agedPlayers: 0,
    agedAcademyPlayers: 0,
    retiredPlayers: [],
    releasedAcademyPlayers: [],
  };
}

async function clearRetiredPlayersFromFormations(
  transaction: Prisma.TransactionClient,
  retiredPlayerIds: number[]
) {
  await transaction.formation.updateMany({
    where: {
      slotAPlayerId: {
        in: retiredPlayerIds,
      },
    },
    data: {
      slotAPlayerId: null,
      savedAt: null,
    },
  });
  await transaction.formation.updateMany({
    where: {
      slotBPlayerId: {
        in: retiredPlayerIds,
      },
    },
    data: {
      slotBPlayerId: null,
      savedAt: null,
    },
  });
  await transaction.formation.updateMany({
    where: {
      slotCPlayerId: {
        in: retiredPlayerIds,
      },
    },
    data: {
      slotCPlayerId: null,
      savedAt: null,
    },
  });
}
