import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import {
  calculateWeeklyPlayerCondition,
  type TeamWeeklyResult,
} from "@/lib/player-condition";
import {
  applyWeeklyDevelopment,
} from "@/lib/player-development";
import {
  applyExperienceGain,
  calculateLeagueExperienceGain,
} from "@/lib/player-experience";
import {
  addRomeWeeks,
  formatRomeDateKey,
  getCompletedRomeWeeklyWindow,
} from "@/lib/rome-calendar";
import {
  calculateTrainingGain,
  getTrainerEfficiency,
  isTrainingFocus,
  type TrainingFocus,
  type TrainingPlayerValues,
} from "@/lib/training-engine";
import {
  calculateLeagueTrainingUsage,
  type LeagueGameType,
} from "@/lib/training-usage";
import { prisma } from "@/lib/prisma";

const DEFAULT_PRIMARY_FOCUS: TrainingFocus =
  "precisione";
const DEFAULT_SECONDARY_FOCUS: TrainingFocus =
  "tattica";

export async function processClubWeeklyUpdate({
  clubId,
  scheduledAt,
  processedAt = new Date(),
}: {
  clubId: number;
  scheduledAt: Date;
  processedAt?: Date;
}) {
  return prisma.$transaction(
    async (transaction) => {
      await lockClub(
        transaction,
        clubId
      );

      const club =
        await transaction.club.findUnique({
          where: {
            id: clubId,
          },
          include: {
            players: {
              where: {
                careerStatus: "ACTIVE",
              },
              orderBy: [
                {
                  lastName: "asc",
                },
                {
                  firstName: "asc",
                },
              ],
            },
            trainingPlan: true,
          },
        });

      if (!club) {
        throw new Error(
          "CLUB_NOT_FOUND"
        );
      }

      if (
        !club.nextWeeklyUpdateAt ||
        club.nextWeeklyUpdateAt.getTime() !==
          scheduledAt.getTime() ||
        scheduledAt.getTime() >
          processedAt.getTime()
      ) {
        return {
          status: "SKIPPED" as const,
          clubId,
        };
      }

      const weekKey =
        formatRomeDateKey(scheduledAt);
      const existingUpdate =
        await transaction.clubWeeklyUpdate.findUnique({
          where: {
            clubId_weekKey: {
              clubId,
              weekKey,
            },
          },
        });

      if (existingUpdate) {
        await transaction.club.update({
          where: {
            id: clubId,
          },
          data: {
            nextWeeklyUpdateAt:
              addRomeWeeks(
                scheduledAt,
                1
              ),
          },
        });

        return {
          status: "SKIPPED" as const,
          clubId,
        };
      }

      const currentWindow =
        getCompletedRomeWeeklyWindow(
          scheduledAt
        );
      const previousWindow = {
        start: addRomeWeeks(
          currentWindow.start,
          -1
        ),
        end: currentWindow.start,
      };
      const [
        currentAppearances,
        previousAppearances,
        currentFixtures,
        previousFixtures,
      ] = await Promise.all([
        loadAppearances(
          transaction,
          clubId,
          currentWindow
        ),
        loadAppearances(
          transaction,
          clubId,
          previousWindow
        ),
        loadClubFixtures(
          transaction,
          clubId,
          currentWindow
        ),
        loadClubFixtures(
          transaction,
          clubId,
          previousWindow
        ),
      ]);
      const currentByPlayer =
        groupAppearancesByPlayer(
          currentAppearances
        );
      const previousPlayerIds =
        new Set(
          previousAppearances.flatMap(
            (appearance) =>
              appearance.playerId === null
                ? []
                : [appearance.playerId]
          )
        );
      const currentFixture =
        currentFixtures.at(-1) ?? null;
      const previousFixture =
        previousFixtures.at(-1) ?? null;
      const teamResult =
        getTeamResult(
          currentFixture,
          clubId
        );
      const {
        primaryFocus,
        secondaryFocus,
      } = resolveTrainingFocus(
        club.trainingPlan
      );
      const trainerEfficiency =
        getTrainerEfficiency(
          club.trainerLevel
        );

      const session =
        await transaction.trainingSession.create({
          data: {
            clubId,
            weekKey,
            primaryFocus,
            secondaryFocus,
            trainerLevel:
              club.trainerLevel,
            trainerEfficiency,
            processedAt:
              scheduledAt,
          },
        });

      for (const player of club.players) {
        const appearances =
          currentByPlayer.get(
            player.id
          ) ?? [];
        const gameTypes =
          appearances.flatMap(
            (appearance) =>
              appearance.gamePerformances.map(
                (performance) =>
                  performance.fixtureGame
                    .gameType
              )
          )
          .filter(
            (
              gameType
            ): gameType is LeagueGameType =>
              gameType === "SINGLES" ||
              gameType === "DOUBLES"
          );
        const gamesWon =
          appearances.reduce(
            (total, appearance) =>
              total +
              appearance.gamePerformances.filter(
                (performance) =>
                  performance.result ===
                  "WIN"
              ).length,
            0
          );
        const usage =
          calculateLeagueTrainingUsage(
            gameTypes
          );
        const wasOnBench =
          currentFixture !== null &&
          appearances.length === 0;
        const consecutiveBenchWeeks =
          wasOnBench
            ? previousFixture !== null &&
              !previousPlayerIds.has(
                player.id
              )
              ? 2
              : 1
            : 0;
        const experienceGain =
          calculateLeagueExperienceGain({
            singles: usage.singles,
            doubles: usage.doubles,
            wasOnBench,
          });
        const experienceAfter =
          applyExperienceGain(
            player.experience,
            experienceGain
          );
        const condition =
          calculateWeeklyPlayerCondition({
            currentForm: player.form,
            currentMorale:
              player.morale,
            gamesPlayed:
              gameTypes.length,
            gamesWon,
            teamResult,
            consecutiveBenchWeeks,
          });
        const currentValues: TrainingPlayerValues = {
          precisione:
            player.precisione,
          diretto:
            player.diretto,
          sponde:
            player.sponde,
          tattica:
            player.tattica,
          mentalita:
            player.mentalita,
          difesa:
            player.difesa,
          realizzazione:
            player.realizzazione,
          creativita:
            player.creativita,
          misura:
            player.misura,
        };
        const primaryBefore =
          currentValues[primaryFocus];
        const secondaryBefore =
          currentValues[secondaryFocus];
        const primaryGain =
          calculateTrainingGain({
            age: player.age,
            talent: player.talent,
            currentValue:
              primaryBefore,
            intensity:
              usage.intensity,
            trainerEfficiency,
            focusWeight: 1,
          });
        const secondaryGain =
          calculateTrainingGain({
            age: player.age,
            talent: player.talent,
            currentValue:
              secondaryBefore,
            intensity:
              usage.intensity,
            trainerEfficiency,
            focusWeight: 0.5,
          });
        const development =
          applyWeeklyDevelopment({
            age: player.age,
            talent: player.talent,
            currentValues,
            gains: {
              [primaryFocus]:
                primaryGain,
              [secondaryFocus]:
                secondaryGain,
            },
          });

        await transaction.player.update({
          where: {
            id: player.id,
          },
          data: {
            ...development.values,
            experience:
              experienceAfter,
            form:
              condition.formAfter,
            morale:
              condition.moraleAfter,
          },
        });

        await transaction.trainingResult.create({
          data: {
            sessionId: session.id,
            playerId: player.id,
            playerFirstName:
              player.firstName,
            playerLastName:
              player.lastName,
            playerAge: player.age,
            usage: usage.label,
            intensity:
              usage.intensity,
            primaryBefore,
            primaryGain,
            primaryDecline:
              development.declines[
                primaryFocus
              ],
            primaryAfter:
              development.values[
                primaryFocus
              ],
            secondaryBefore,
            secondaryGain,
            secondaryDecline:
              development.declines[
                secondaryFocus
              ],
            secondaryAfter:
              development.values[
                secondaryFocus
              ],
            overallBefore:
              development.overallBefore,
            overallDecline:
              development.overallDecline,
            overallAfter:
              development.overallAfter,
            experienceBefore:
              player.experience,
            experienceGain,
            experienceAfter,
            formBefore: player.form,
            formChange:
              condition.formAfter -
              player.form,
            formAfter:
              condition.formAfter,
            moraleBefore:
              player.morale,
            moraleChange:
              condition.moraleAfter -
              player.morale,
            moraleAfter:
              condition.moraleAfter,
          },
        });
      }

      if (club.trainingPlan) {
        await transaction.trainingPlan.update({
          where: {
            clubId,
          },
          data: {
            primaryFocus,
            secondaryFocus,
            lastProcessedAt:
              scheduledAt,
          },
        });
      } else {
        await transaction.trainingPlan.create({
          data: {
            clubId,
            primaryFocus,
            secondaryFocus,
            lastProcessedAt:
              scheduledAt,
          },
        });
      }

      const income = club.weeklyIncome;
      const expenses =
        club.weeklyExpenses;
      const netResult =
        income - expenses;
      const balanceAfter =
        club.balance + netResult;
      const nextWeeklyUpdateAt =
        addRomeWeeks(
          scheduledAt,
          1
        );
      const newsScheduledAt =
        new Date(
          scheduledAt.getTime() +
            5 * 60 * 1000
        );

      await transaction.club.update({
        where: {
          id: clubId,
        },
        data: {
          balance: balanceAfter,
          nextWeeklyUpdateAt,
        },
      });
      const weeklyUpdate =
        await transaction.clubWeeklyUpdate.create({
          data: {
            clubId,
            weekKey,
            income,
            expenses,
            netResult,
            balanceBefore:
              club.balance,
            balanceAfter,
            scheduledAt,
            processedAt,
            newsScheduledAt,
          },
        });

      return {
        status: "PROCESSED" as const,
        clubId,
        weekKey,
        weeklyUpdateId:
          weeklyUpdate.id,
        players:
          club.players.length,
        nextWeeklyUpdateAt,
      };
    }
  );
}

async function lockClub(
  transaction: Prisma.TransactionClient,
  clubId: number
) {
  const rows = await transaction.$queryRaw<
    Array<{ id: number }>
  >`
    SELECT "id"
    FROM "Club"
    WHERE "id" = ${clubId}
    FOR UPDATE
  `;

  if (rows.length === 0) {
    throw new Error("CLUB_NOT_FOUND");
  }
}

function resolveTrainingFocus(
  trainingPlan: {
    primaryFocus: string;
    secondaryFocus: string;
  } | null
) {
  const primaryFocus =
    isTrainingFocus(
      trainingPlan?.primaryFocus
    )
      ? trainingPlan.primaryFocus
      : DEFAULT_PRIMARY_FOCUS;
  const secondaryFocus =
    isTrainingFocus(
      trainingPlan?.secondaryFocus
    ) &&
    trainingPlan.secondaryFocus !==
      primaryFocus
      ? trainingPlan.secondaryFocus
      : DEFAULT_SECONDARY_FOCUS;

  return {
    primaryFocus,
    secondaryFocus,
  };
}

async function loadAppearances(
  transaction: Prisma.TransactionClient,
  clubId: number,
  window: {
    start: Date;
    end: Date;
  }
) {
  return transaction.playerFixtureAppearance.findMany({
    where: {
      clubId,
      playedAt: {
        gte: window.start,
        lt: window.end,
      },
    },
    select: {
      playerId: true,
      gamePerformances: {
        select: {
          result: true,
          fixtureGame: {
            select: {
              gameType: true,
            },
          },
        },
      },
    },
  });
}

async function loadClubFixtures(
  transaction: Prisma.TransactionClient,
  clubId: number,
  window: {
    start: Date;
    end: Date;
  }
) {
  return transaction.leagueFixture.findMany({
    where: {
      status: "PLAYED",
      playedAt: {
        gte: window.start,
        lt: window.end,
      },
      OR: [
        {
          homeClubId: clubId,
        },
        {
          awayClubId: clubId,
        },
      ],
    },
    select: {
      homeClubId: true,
      awayClubId: true,
      homeScore: true,
      awayScore: true,
      playedAt: true,
    },
    orderBy: {
      playedAt: "asc",
    },
  });
}

function groupAppearancesByPlayer<
  T extends {
    playerId: number | null;
  },
>(appearances: T[]) {
  const grouped = new Map<
    number,
    T[]
  >();

  for (const appearance of appearances) {
    if (appearance.playerId === null) {
      continue;
    }

    const playerAppearances =
      grouped.get(
        appearance.playerId
      ) ?? [];

    playerAppearances.push(
      appearance
    );
    grouped.set(
      appearance.playerId,
      playerAppearances
    );
  }

  return grouped;
}

function getTeamResult(
  fixture: {
    homeClubId: number;
    awayClubId: number;
    homeScore: number | null;
    awayScore: number | null;
  } | null,
  clubId: number
): TeamWeeklyResult {
  if (
    !fixture ||
    fixture.homeScore === null ||
    fixture.awayScore === null
  ) {
    return null;
  }

  const teamScore =
    fixture.homeClubId === clubId
      ? fixture.homeScore
      : fixture.awayScore;
  const opponentScore =
    fixture.homeClubId === clubId
      ? fixture.awayScore
      : fixture.homeScore;

  if (teamScore > opponentScore) {
    return "WIN";
  }

  if (teamScore < opponentScore) {
    return "LOSS";
  }

  return "DRAW";
}
