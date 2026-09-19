import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { calculateEndOfSeasonPlayerOutcome } from "@/lib/player-aging";
import { limitClubRetirements } from "@/lib/roster-integrity";

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
  const lockedSeason = await transaction.$queryRaw<{ id: number }[]>`
    SELECT "id"
    FROM "Season"
    WHERE "id" = ${seasonId}
    FOR UPDATE
  `;

  if (lockedSeason.length === 0) throw new Error("SEASON_NOT_FOUND");

  const season = await transaction.season.findUnique({
    where: { id: seasonId },
    select: { status: true },
  });

  if (!season) throw new Error("SEASON_NOT_FOUND");
  if (season.status === "COMPLETED") return createEmptyResult(seasonId, true);
  if (season.status !== "ACTIVE") return createEmptyResult(seasonId, false);

  const [
    leagues,
    individualTournaments,
    nationsCupTournaments,
    specialtyCupTournaments,
  ] = await Promise.all([
    transaction.league.findMany({
      where: { seasonId },
      select: { status: true },
    }),
    transaction.individualTournament.findMany({
      where: { seasonId },
      select: { status: true },
    }),
    transaction.nationsCupTournament.findMany({
      where: { seasonId },
      select: { status: true },
    }),
    transaction.$queryRaw<Array<{ status: string }>>`
      SELECT "status"
      FROM "SpecialtyCupTournament"
      WHERE "seasonId" = ${seasonId}
    `,
  ]);

  if (
    leagues.length === 0 ||
    leagues.some((league) => league.status !== "COMPLETED") ||
    individualTournaments.some((tournament) => tournament.status !== "COMPLETED") ||
    nationsCupTournaments.some((tournament) => tournament.status !== "COMPLETED") ||
    specialtyCupTournaments.length === 0 ||
    specialtyCupTournaments.some((tournament) => tournament.status !== "COMPLETED")
  ) {
    return createEmptyResult(seasonId, false);
  }

  const [players, academyPlayers] = await Promise.all([
    transaction.player.findMany({
      where: { careerStatus: "ACTIVE" },
      select: {
        id: true,
        clubId: true,
        firstName: true,
        lastName: true,
        age: true,
      },
      orderBy: { id: "asc" },
    }),
    transaction.academyPlayer.findMany({
      select: {
        id: true,
        clubId: true,
        firstName: true,
        lastName: true,
        age: true,
      },
      orderBy: { id: "asc" },
    }),
  ]);

  const outcomes = players.map((player) => ({
    player,
    outcome: calculateEndOfSeasonPlayerOutcome(player.age, random()),
  }));
  const requestedRetirements = outcomes.filter(
    ({ outcome }) => outcome.retired
  );
  const acceptedRetirementPlayers = limitClubRetirements(
    players,
    requestedRetirements.map(({ player }) => player)
  );
  const acceptedRetirementIds = new Set(
    acceptedRetirementPlayers.map((player) => player.id)
  );
  const retirements = requestedRetirements.filter(({ player }) =>
    acceptedRetirementIds.has(player.id)
  );
  const retiredPlayerIds = retirements.map(({ player }) => player.id);

  const releasedAcademyPlayers: SeasonCompletionResult["releasedAcademyPlayers"] = [];

  if (retiredPlayerIds.length > 0) {
    await clearRetiredPlayersFromFormations(transaction, retiredPlayerIds);

    await transaction.transferListing.updateMany({
      where: {
        playerId: { in: retiredPlayerIds },
        status: { in: ["ACTIVE", "PENDING_TRANSFER"] },
      },
      data: {
        status: "CANCELLED",
        completedAt: now,
      },
    });

    await transaction.player.updateMany({
      where: {
        id: { in: retiredPlayerIds },
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

  const deferredRetirements = requestedRetirements.length - retirements.length;
  if (deferredRetirements > 0) {
    await transaction.gameEvent.create({
      data: {
        clubId: null,
        type: "ROSTER_INTEGRITY",
        title: "Ritiri rinviati per garantire le rose minime",
        description:
          `${deferredRetirements} ritiri sono stati rinviati per evitare club con meno di tre giocatori attivi.`,
        createdAt: now,
      },
    });
  }

  await transaction.season.update({
    where: { id: seasonId },
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
      description: `${retirements.length} giocatori si sono ritirati al termine della stagione. L'età continua ad avanzare quotidianamente durante tutto l'anno di gioco.`,
      createdAt: now,
    },
  });

  return {
    seasonId,
    completed: true,
    alreadyCompleted: false,
    agedPlayers: players.length,
    agedAcademyPlayers: academyPlayers.length,
    retiredPlayers: retirements.map(({ player, outcome }) => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      age: outcome.age,
      retirementChance: outcome.retirementChance,
    })),
    releasedAcademyPlayers: releasedAcademyPlayers.map((player) => ({
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
    where: { slotAPlayerId: { in: retiredPlayerIds } },
    data: { slotAPlayerId: null, savedAt: null },
  });
  await transaction.formation.updateMany({
    where: { slotBPlayerId: { in: retiredPlayerIds } },
    data: { slotBPlayerId: null, savedAt: null },
  });
  await transaction.formation.updateMany({
    where: { slotCPlayerId: { in: retiredPlayerIds } },
    data: { slotCPlayerId: null, savedAt: null },
  });
}
