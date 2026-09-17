import "server-only";

import {
  getSpecialtyCupAssignment,
  type SpecialtyCupType,
} from "@/lib/specialty-cup-assignment";
import { drawSpecialtyCupBracket } from "@/lib/specialty-cup-bracket";
import { buildSpecialtyCupCalendar } from "@/lib/specialty-cup-calendar";
import { buildSpecialtyCupStages } from "@/lib/specialty-cup-stages";
import { simulateIndividualBestOfThree } from "@/lib/individual-match-engine";
import { prisma } from "@/lib/prisma";
import {
  applyTournamentGrowth,
  specialtyCupPlacementForElimination,
  tournamentGrowthValue,
} from "@/lib/tournament-growth";

const SPECIALTY_CUP_TRANSACTION_TIMEOUT = 120000;

const CUP_NAMES: Record<SpecialtyCupType, string> = {
  ITALIANA: "Coppa Italiana",
  GORIZIANA: "Coppa Goriziana",
  TUTTI_DOPPI: "Coppa Tutti Doppi",
};

type SpecialtyCupPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  nationality: string;
  precisione: number;
  diretto: number;
  sponde: number;
};

type PersistedDrawSlot = {
  position: number;
  playerId: number;
  firstName: string;
  lastName: string;
  nationality: string;
  bye: boolean;
};

type PersistedStage = {
  order: number;
  key: string;
  label: string;
  playersAtStart: number;
  scheduledAt: string;
};

type PersistedGame = {
  order: number;
  specialty: string;
  winnerPlayerId: number;
  playerOneScore: number;
  playerTwoScore: number;
};

type PersistedMatch = {
  position: number;
  playerOneId: number | null;
  playerTwoId: number | null;
  winnerPlayerId: number | null;
  playerOneWins: number;
  playerTwoWins: number;
  walkover: boolean;
  games: PersistedGame[];
};

type PersistedRound = {
  stageOrder: number;
  stageKey: string;
  stageLabel: string;
  scheduledAt: string;
  matches: PersistedMatch[];
};

type PersistedCupDraw = {
  type: SpecialtyCupType;
  name: string;
  entrants: number;
  bracketSize: number;
  byes: number;
  firstRoundMatches: number;
  slots: PersistedDrawSlot[];
  stages: PersistedStage[];
  currentStageIndex: number;
  currentPlayerIds: Array<number | null>;
  rounds: PersistedRound[];
  championPlayerId: number | null;
};

export type SpecialtyCupDrawPayload = {
  seasonId: number;
  drawnAt: string;
  cups: Record<SpecialtyCupType, PersistedCupDraw>;
};

export async function initializeSpecialtyCup() {
  const referenceLeague = await prisma.league.findFirst({
    where: {
      level: 1,
      groupCode: "A",
      season: { status: { in: ["PREPARATION", "ACTIVE"] } },
    },
    orderBy: { season: { number: "desc" } },
    select: {
      seasonId: true,
      fixtures: {
        orderBy: [{ round: "asc" }, { id: "asc" }],
        select: { round: true, scheduledAt: true },
      },
    },
  });

  if (!referenceLeague) return 0;

  const roundDates = new Map<number, Date>();
  for (const fixture of referenceLeague.fixtures) {
    if (!roundDates.has(fixture.round)) {
      roundDates.set(fixture.round, fixture.scheduledAt);
    }
  }

  const calendar = buildSpecialtyCupCalendar(roundDates);

  return prisma.$executeRaw`
    INSERT INTO "SpecialtyCupTournament"
      ("seasonId", "leagueRound", "status", "drawAt", "createdAt", "updatedAt")
    VALUES
      (${referenceLeague.seasonId}, ${calendar.seasonWeek}, 'SCHEDULED', ${calendar.drawAt}, NOW(), NOW())
    ON CONFLICT ("seasonId") DO NOTHING
  `;
}

export async function drawSpecialtyCup(
  tournamentId: number,
  scheduledAt: Date
) {
  return prisma.$transaction(
    async (transaction) => {
      await transaction.$queryRaw`
        SELECT "id"
        FROM "SpecialtyCupTournament"
        WHERE "id" = ${tournamentId}
        FOR UPDATE
      `;

      const rows = await transaction.$queryRaw<
        Array<{
          id: number;
          seasonId: number;
          status: string;
          drawAt: Date;
          payload: unknown | null;
        }>
      >`
        SELECT "id", "seasonId", "status", "drawAt", "payload"
        FROM "SpecialtyCupTournament"
        WHERE "id" = ${tournamentId}
        LIMIT 1
      `;

      const tournament = rows[0];
      if (
        !tournament ||
        tournament.status !== "SCHEDULED" ||
        tournament.payload !== null ||
        tournament.drawAt.getTime() !== scheduledAt.getTime()
      ) {
        return { status: "SKIPPED" as const, participants: 0, cups: 0 };
      }

      const players = await transaction.player.findMany({
        where: { careerStatus: "ACTIVE", clubId: { not: null } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nationality: true,
          precisione: true,
          diretto: true,
          sponde: true,
        },
      });

      const grouped: Record<SpecialtyCupType, SpecialtyCupPlayer[]> = {
        ITALIANA: [],
        GORIZIANA: [],
        TUTTI_DOPPI: [],
      };

      for (const player of players) {
        const assignment = getSpecialtyCupAssignment({
          id: player.id,
          specialties: {
            italiana: (player.precisione + player.diretto) / 2,
            goriziana: (player.precisione + player.sponde) / 2,
            tuttiDoppi: (player.diretto + player.sponde) / 2,
          },
          attributes: {
            precisione: player.precisione,
            diretto: player.diretto,
            sponde: player.sponde,
          },
        });

        grouped[assignment].push(player);
      }

      const cupTypes: SpecialtyCupType[] = [
        "ITALIANA",
        "GORIZIANA",
        "TUTTI_DOPPI",
      ];

      for (const cupType of cupTypes) {
        if (grouped[cupType].length < 2) {
          throw new Error(`SPECIALTY_CUP_${cupType}_PLAYERS_INCOMPLETE`);
        }
      }

      const cups = {} as Record<SpecialtyCupType, PersistedCupDraw>;

      for (const cupType of cupTypes) {
        const draw = drawSpecialtyCupBracket(grouped[cupType]);
        const stages = buildSpecialtyCupStages(scheduledAt, draw.plan.bracketSize);
        const currentPlayerIds = Array<number | null>(draw.plan.bracketSize).fill(null);

        for (const slot of draw.slots) {
          currentPlayerIds[slot.position - 1] = slot.player.id;
        }

        cups[cupType] = {
          type: cupType,
          name: CUP_NAMES[cupType],
          entrants: draw.plan.entrants,
          bracketSize: draw.plan.bracketSize,
          byes: draw.plan.byes,
          firstRoundMatches: draw.plan.firstRoundMatches,
          slots: draw.slots.map((slot) => ({
            position: slot.position,
            playerId: slot.player.id,
            firstName: slot.player.firstName,
            lastName: slot.player.lastName,
            nationality: slot.player.nationality,
            bye: slot.bye,
          })),
          stages: stages.map((stage) => ({
            order: stage.order,
            key: stage.key,
            label: stage.label,
            playersAtStart: stage.playersAtStart,
            scheduledAt: stage.scheduledAt.toISOString(),
          })),
          currentStageIndex: 0,
          currentPlayerIds,
          rounds: [],
          championPlayerId: null,
        };
      }

      const payload: SpecialtyCupDrawPayload = {
        seasonId: tournament.seasonId,
        drawnAt: scheduledAt.toISOString(),
        cups,
      };
      const serializedPayload = JSON.stringify(payload);
      const nextStageAt = getNextStageAt(payload);

      await transaction.$executeRaw`
        UPDATE "SpecialtyCupTournament"
        SET
          "status" = 'DRAWN',
          "drawnAt" = ${scheduledAt},
          "payload" = CAST(${serializedPayload} AS jsonb),
          "currentStageOrder" = 1,
          "nextStageAt" = ${nextStageAt},
          "updatedAt" = NOW()
        WHERE "id" = ${tournament.id}
      `;

      await transaction.gameEvent.create({
        data: {
          clubId: null,
          type: "Coppa Specialità",
          title: "Sorteggio Coppa Specialità",
          description:
            "Pubblicati i tabelloni di Coppa Italiana, Coppa Goriziana e Coppa Tutti Doppi con bye assegnati casualmente.",
          createdAt: scheduledAt,
        },
      });

      return {
        status: "PROCESSED" as const,
        participants: players.length,
        cups: cupTypes.length,
        breakdown: {
          italiana: cups.ITALIANA.entrants,
          goriziana: cups.GORIZIANA.entrants,
          tuttiDoppi: cups.TUTTI_DOPPI.entrants,
        },
      };
    },
    { isolationLevel: "Serializable", timeout: SPECIALTY_CUP_TRANSACTION_TIMEOUT }
  );
}

export async function playSpecialtyCupStage(
  tournamentId: number,
  scheduledAt: Date
) {
  return prisma.$transaction(
    async (transaction) => {
      await transaction.$queryRaw`
        SELECT "id"
        FROM "SpecialtyCupTournament"
        WHERE "id" = ${tournamentId}
        FOR UPDATE
      `;

      const rows = await transaction.$queryRaw<
        Array<{
          id: number;
          status: string;
          nextStageAt: Date | null;
          payload: SpecialtyCupDrawPayload | null;
        }>
      >`
        SELECT "id", "status", "nextStageAt", "payload"
        FROM "SpecialtyCupTournament"
        WHERE "id" = ${tournamentId}
        LIMIT 1
      `;

      const tournament = rows[0];
      if (
        !tournament ||
        !tournament.payload ||
        !tournament.nextStageAt ||
        !["DRAWN", "IN_PROGRESS"].includes(tournament.status) ||
        tournament.nextStageAt.getTime() !== scheduledAt.getTime()
      ) {
        return { status: "SKIPPED" as const, cupsProcessed: 0, matches: 0 };
      }

      const payload = tournament.payload;
      const cupTypes: SpecialtyCupType[] = [
        "ITALIANA",
        "GORIZIANA",
        "TUTTI_DOPPI",
      ];
      let cupsProcessed = 0;
      let totalMatches = 0;

      for (const cupType of cupTypes) {
        const cup = payload.cups[cupType];
        const stage = cup.stages[cup.currentStageIndex];

        if (!stage || new Date(stage.scheduledAt).getTime() !== scheduledAt.getTime()) {
          continue;
        }

        const realIds = cup.currentPlayerIds.filter(
          (id): id is number => id !== null
        );
        const players = await transaction.player.findMany({
          where: { id: { in: realIds } },
          select: {
            id: true,
            precisione: true,
            diretto: true,
            sponde: true,
            tattica: true,
            mentalita: true,
            difesa: true,
            realizzazione: true,
            creativita: true,
            misura: true,
            form: true,
            morale: true,
            experience: true,
          },
        });
        const playerById = new Map(players.map((player) => [player.id, player]));
        const matches: PersistedMatch[] = [];
        const winners: number[] = [];
        const losers: number[] = [];

        for (let index = 0; index < cup.currentPlayerIds.length; index += 2) {
          const playerOneId = cup.currentPlayerIds[index] ?? null;
          const playerTwoId = cup.currentPlayerIds[index + 1] ?? null;

          if (playerOneId === null && playerTwoId === null) {
            throw new Error("SPECIALTY_CUP_EMPTY_PAIR");
          }

          if (playerOneId === null || playerTwoId === null) {
            const winnerPlayerId = playerOneId ?? playerTwoId;
            winners.push(winnerPlayerId!);
            matches.push({
              position: index / 2 + 1,
              playerOneId,
              playerTwoId,
              winnerPlayerId,
              playerOneWins: playerOneId === null ? 0 : 2,
              playerTwoWins: playerTwoId === null ? 0 : 2,
              walkover: true,
              games: [],
            });
            continue;
          }

          const playerOne = playerById.get(playerOneId);
          const playerTwo = playerById.get(playerTwoId);
          if (!playerOne || !playerTwo) {
            throw new Error("SPECIALTY_CUP_PLAYER_NOT_FOUND");
          }

          const result = simulateIndividualBestOfThree(playerOne, playerTwo, cupType);
          winners.push(result.winnerPlayerId);
          losers.push(result.loserPlayerId);
          matches.push({
            position: index / 2 + 1,
            playerOneId,
            playerTwoId,
            winnerPlayerId: result.winnerPlayerId,
            playerOneWins: result.playerOneWins,
            playerTwoWins: result.playerTwoWins,
            walkover: false,
            games: result.games.map((game) => ({
              order: game.order,
              specialty: game.specialty,
              winnerPlayerId: game.winnerPlayerId,
              playerOneScore: game.playerOneScore,
              playerTwoScore: game.playerTwoScore,
            })),
          });
        }

        cup.rounds.push({
          stageOrder: stage.order,
          stageKey: stage.key,
          stageLabel: stage.label,
          scheduledAt: stage.scheduledAt,
          matches,
        });
        totalMatches += matches.length;
        cupsProcessed += 1;

        if (losers.length > 0) {
          const placement = specialtyCupPlacementForElimination(stage.playersAtStart);
          if (placement) {
            await applyTournamentGrowth(
              transaction,
              losers,
              tournamentGrowthValue("SPECIALTY_CUP", placement)
            );
          }
        }

        const nextStageIndex = cup.currentStageIndex + 1;
        if (nextStageIndex >= cup.stages.length) {
          const championPlayerId = winners[0] ?? null;
          cup.championPlayerId = championPlayerId;
          cup.currentPlayerIds = championPlayerId === null ? [] : [championPlayerId];
          cup.currentStageIndex = cup.stages.length;

          if (championPlayerId !== null) {
            await applyTournamentGrowth(
              transaction,
              [championPlayerId],
              tournamentGrowthValue("SPECIALTY_CUP", "WINNER")
            );
          }

          const champion = championPlayerId
            ? await transaction.player.findUnique({
                where: { id: championPlayerId },
                select: { firstName: true, lastName: true },
              })
            : null;

          await transaction.gameEvent.create({
            data: {
              clubId: null,
              type: "Coppa Specialità",
              title: champion
                ? `${champion.firstName} ${champion.lastName} vince ${cup.name}`
                : `${cup.name} si conclude senza vincitore`,
              description: "Finale conclusa e tabellone completato.",
              createdAt: scheduledAt,
            },
          });
        } else {
          cup.currentPlayerIds = winners;
          cup.currentStageIndex = nextStageIndex;
        }
      }

      const nextStageAt = getNextStageAt(payload);
      const completed = nextStageAt === null;
      const serializedPayload = JSON.stringify(payload);
      const currentStageOrder = completed
        ? null
        : Math.min(
            ...cupTypes
              .map((cupType) => payload.cups[cupType])
              .filter((cup) => cup.currentStageIndex < cup.stages.length)
              .map((cup) => cup.stages[cup.currentStageIndex].order)
          );

      await transaction.$executeRaw`
        UPDATE "SpecialtyCupTournament"
        SET
          "status" = ${completed ? "COMPLETED" : "IN_PROGRESS"},
          "payload" = CAST(${serializedPayload} AS jsonb),
          "currentStageOrder" = ${currentStageOrder},
          "nextStageAt" = ${nextStageAt},
          "updatedAt" = NOW()
        WHERE "id" = ${tournament.id}
      `;

      return {
        status: "PROCESSED" as const,
        cupsProcessed,
        matches: totalMatches,
        completed,
      };
    },
    { isolationLevel: "Serializable", timeout: SPECIALTY_CUP_TRANSACTION_TIMEOUT }
  );
}

function getNextStageAt(payload: SpecialtyCupDrawPayload) {
  const times = (Object.keys(payload.cups) as SpecialtyCupType[])
    .map((cupType) => payload.cups[cupType])
    .filter((cup) => cup.currentStageIndex < cup.stages.length)
    .map((cup) => new Date(cup.stages[cup.currentStageIndex].scheduledAt));

  if (times.length === 0) return null;
  return new Date(Math.min(...times.map((value) => value.getTime())));
}
