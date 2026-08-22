import "server-only";

import type { Prisma } from "@/generated/prisma/client";

import {
  INDIVIDUAL_TOURNAMENT_SIZE,
  rankIndividualTournamentPlayers,
  shuffleIndividualDraw,
  simulateIndividualBestOfThree,
} from "@/lib/individual-match-engine";
import {
  buildIndividualTournamentCalendar,
  INDIVIDUAL_MATCH_STAGES,
  type IndividualTournamentType,
} from "@/lib/individual-tournament-calendar";
import { prisma } from "@/lib/prisma";
import { addRomeDaysAtTime } from "@/lib/rome-calendar";

const TOURNAMENT_TRANSACTION_TIMEOUT = 120000;
const TOURNAMENT_STATEMENT_TIMEOUT = 60000;

const individualPlayerSelect = {
  id: true,
  firstName: true,
  lastName: true,
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
} as const;

export async function initializeIndividualTournaments() {
  const referenceLeague = await prisma.league.findFirst({
    where: {
      level: 1,
      groupCode: "A",
      season: {
        status: {
          in: ["PREPARATION", "ACTIVE"],
        },
      },
    },
    orderBy: {
      season: {
        number: "desc",
      },
    },
    select: {
      seasonId: true,
      fixtures: {
        orderBy: [
          { round: "asc" },
          { id: "asc" },
        ],
        select: {
          round: true,
          scheduledAt: true,
        },
      },
    },
  });

  if (!referenceLeague) {
    return 0;
  }

  const roundDates = new Map<number, Date>();

  for (const fixture of referenceLeague.fixtures) {
    if (!roundDates.has(fixture.round)) {
      roundDates.set(fixture.round, fixture.scheduledAt);
    }
  }

  const calendar = buildIndividualTournamentCalendar(roundDates);
  const result = await prisma.individualTournament.createMany({
    data: calendar.map((tournament) => ({
      seasonId: referenceLeague.seasonId,
      leagueRound: tournament.leagueRound,
      type: tournament.type,
      name: tournament.name,
      specialty: tournament.specialty,
      status: "SCHEDULED",
      drawAt: tournament.drawAt,
      finalAt: tournament.finalAt,
    })),
    skipDuplicates: true,
  });

  return result.count;
}

export async function drawIndividualTournament(
  tournamentId: number,
  scheduledAt: Date
) {
  return prisma.$transaction(
    async (transaction) => {
      await setTournamentStatementTimeout(transaction);
      await transaction.$queryRaw`
        SELECT "id"
        FROM "IndividualTournament"
        WHERE "id" = ${tournamentId}
        FOR UPDATE
      `;

      const tournament = await transaction.individualTournament.findUnique({
        where: {
          id: tournamentId,
        },
        select: {
          id: true,
          name: true,
          status: true,
          drawAt: true,
        },
      });

      if (
        !tournament ||
        tournament.status !== "SCHEDULED" ||
        tournament.drawAt.getTime() !== scheduledAt.getTime()
      ) {
        return {
          status: "SKIPPED" as const,
          participants: 0,
          matches: 0,
        };
      }

      const players = await transaction.player.findMany({
        where: {
          careerStatus: "ACTIVE",
        },
        select: individualPlayerSelect,
      });
      const qualified = rankIndividualTournamentPlayers(players);

      if (qualified.length !== INDIVIDUAL_TOURNAMENT_SIZE) {
        throw new Error("INDIVIDUAL_TOURNAMENT_PLAYERS_INCOMPLETE");
      }

      const draw = shuffleIndividualDraw(qualified);

      await transaction.individualTournamentEntry.createMany({
        data: draw.map((entry, index) => ({
          tournamentId,
          playerId: entry.player.id,
          rankingAtDraw: entry.ranking,
          overallAtDraw: entry.overall,
          drawPosition: index + 1,
          status: "ACTIVE",
        })),
      });

      const firstStage = INDIVIDUAL_MATCH_STAGES[0];
      const firstStageDate = getStageDate(tournament.drawAt, firstStage.order);
      const matches = Array.from(
        { length: INDIVIDUAL_TOURNAMENT_SIZE / 2 },
        (_, index) => ({
          tournamentId,
          stage: firstStage.key,
          stageOrder: firstStage.order,
          position: index + 1,
          scheduledAt: firstStageDate,
          playerOneId: draw[index * 2].player.id,
          playerTwoId: draw[index * 2 + 1].player.id,
          status: "SCHEDULED",
        })
      );

      await transaction.individualTournamentMatch.createMany({
        data: matches,
      });
      await transaction.individualTournament.update({
        where: {
          id: tournament.id,
        },
        data: {
          status: "DRAWN",
          currentStage: firstStage.key,
        },
      });
      await transaction.gameEvent.create({
        data: {
          clubId: null,
          type: "Individuale",
          title: `Sorteggio di ${tournament.name}`,
          description:
            "Il tabellone dei 256 qualificati è stato pubblicato.",
          createdAt: scheduledAt,
        },
      });

      return {
        status: "PROCESSED" as const,
        participants: draw.length,
        matches: matches.length,
      };
    },
    {
      isolationLevel: "Serializable",
      timeout: TOURNAMENT_TRANSACTION_TIMEOUT,
    }
  );
}

export async function playIndividualTournamentStage(
  candidateMatchId: number,
  scheduledAt: Date
) {
  return prisma.$transaction(
    async (transaction) => {
      await setTournamentStatementTimeout(transaction);

      const candidate =
        await transaction.individualTournamentMatch.findUnique({
          where: {
            id: candidateMatchId,
          },
          select: {
            tournamentId: true,
            stage: true,
            stageOrder: true,
            status: true,
            scheduledAt: true,
          },
        });

      if (
        !candidate ||
        candidate.status !== "SCHEDULED" ||
        candidate.scheduledAt.getTime() !== scheduledAt.getTime()
      ) {
        return {
          status: "SKIPPED" as const,
          matches: 0,
        };
      }

      await transaction.$queryRaw`
        SELECT "id"
        FROM "IndividualTournament"
        WHERE "id" = ${candidate.tournamentId}
        FOR UPDATE
      `;

      const tournament = await transaction.individualTournament.findUnique({
        where: {
          id: candidate.tournamentId,
        },
        select: {
          id: true,
          name: true,
          type: true,
          drawAt: true,
        },
      });

      if (!tournament) {
        throw new Error("INDIVIDUAL_TOURNAMENT_NOT_FOUND");
      }

      const matches = await transaction.individualTournamentMatch.findMany({
        where: {
          tournamentId: tournament.id,
          stageOrder: candidate.stageOrder,
          status: "SCHEDULED",
          scheduledAt,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          playerOne: {
            select: individualPlayerSelect,
          },
          playerTwo: {
            select: individualPlayerSelect,
          },
        },
      });

      if (
        matches.length === 0 ||
        matches.some((match) => !match.playerOne || !match.playerTwo)
      ) {
        throw new Error("INDIVIDUAL_TOURNAMENT_STAGE_INCOMPLETE");
      }

      const tournamentType = tournament.type as IndividualTournamentType;
      const results = matches.map((match) => ({
        match,
        result: simulateIndividualBestOfThree(
          match.playerOne!,
          match.playerTwo!,
          tournamentType
        ),
      }));
      const values = results
        .map(
          ({ match, result }) =>
            `(${match.id}, ${result.winnerPlayerId}, ` +
            `${result.playerOneWins}, ${result.playerTwoWins})`
        )
        .join(", ");

      await transaction.individualTournamentGame.createMany({
        data: results.flatMap(({ match, result }) =>
          result.games.map((game) => ({
            matchId: match.id,
            order: game.order,
            specialty: game.specialty,
            winnerSide: game.winnerSide,
            playerOnePerformanceRating:
              game.playerOnePerformanceRating,
            playerTwoPerformanceRating:
              game.playerTwoPerformanceRating,
          }))
        ),
      });

      await transaction.$executeRawUnsafe(`
        UPDATE "IndividualTournamentMatch" AS tournament_match
        SET
          "winnerPlayerId" = result."winnerPlayerId",
          "playerOneWins" = result."playerOneWins",
          "playerTwoWins" = result."playerTwoWins",
          status = 'PLAYED',
          "playedAt" = tournament_match."scheduledAt",
          "updatedAt" = CURRENT_TIMESTAMP
        FROM (
          VALUES ${values}
        ) AS result(id, "winnerPlayerId", "playerOneWins", "playerTwoWins")
        WHERE tournament_match.id = result.id
      `);

      await transaction.individualTournamentEntry.updateMany({
        where: {
          tournamentId: tournament.id,
          playerId: {
            in: results.map(({ result }) => result.loserPlayerId),
          },
        },
        data: {
          status: "ELIMINATED",
          eliminatedStage: candidate.stage,
        },
      });

      const winnerPlayerIds = results.map(
        ({ result }) => result.winnerPlayerId
      );
      const nextStage = INDIVIDUAL_MATCH_STAGES[candidate.stageOrder];

      if (!nextStage) {
        const championPlayerId = winnerPlayerIds[0];
        const finalMatch = results[0].match;
        const champion =
          finalMatch.playerOne?.id === championPlayerId
            ? finalMatch.playerOne
            : finalMatch.playerTwo;

        await transaction.individualTournamentEntry.update({
          where: {
            tournamentId_playerId: {
              tournamentId: tournament.id,
              playerId: championPlayerId,
            },
          },
          data: {
            status: "WINNER",
          },
        });
        await transaction.individualTournament.update({
          where: {
            id: tournament.id,
          },
          data: {
            status: "COMPLETED",
            currentStage: candidate.stage,
            championPlayerId,
          },
        });
        await transaction.gameEvent.create({
          data: {
            clubId: null,
            type: "Individuale",
            title: `${champion?.firstName} ${champion?.lastName} vince ${tournament.name}`,
            description: "Finale conclusa e tabellone completato.",
            createdAt: scheduledAt,
          },
        });
      } else {
        const nextStageDate = getStageDate(
          tournament.drawAt,
          nextStage.order
        );

        await transaction.individualTournamentMatch.createMany({
          data: Array.from(
            { length: winnerPlayerIds.length / 2 },
            (_, index) => ({
              tournamentId: tournament.id,
              stage: nextStage.key,
              stageOrder: nextStage.order,
              position: index + 1,
              scheduledAt: nextStageDate,
              playerOneId: winnerPlayerIds[index * 2],
              playerTwoId: winnerPlayerIds[index * 2 + 1],
              status: "SCHEDULED",
            })
          ),
        });
        await transaction.individualTournament.update({
          where: {
            id: tournament.id,
          },
          data: {
            status: "IN_PROGRESS",
            currentStage: nextStage.key,
          },
        });
      }

      return {
        status: "PROCESSED" as const,
        matches: matches.length,
        stage: candidate.stage,
      };
    },
    {
      isolationLevel: "Serializable",
      timeout: TOURNAMENT_TRANSACTION_TIMEOUT,
    }
  );
}

function getStageDate(drawAt: Date, stageOrder: number) {
  const stage = INDIVIDUAL_MATCH_STAGES.find(
    (candidate) => candidate.order === stageOrder
  );

  if (!stage) {
    throw new Error("INDIVIDUAL_TOURNAMENT_STAGE_NOT_FOUND");
  }

  return addRomeDaysAtTime(
    drawAt,
    stage.dayOffset - 1,
    stage.hour,
    stage.minute
  );
}

async function setTournamentStatementTimeout(
  transaction: Prisma.TransactionClient
) {
  await transaction.$executeRawUnsafe(
    `SET LOCAL statement_timeout = ${TOURNAMENT_STATEMENT_TIMEOUT}`
  );
}
