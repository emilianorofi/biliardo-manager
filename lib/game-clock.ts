import "server-only";

import {
  advanceAcademyIntake,
} from "@/lib/academy-intake";
import {
  advanceAcademyScouting,
} from "@/lib/academy-scouting";
import {
  playLeagueFixture,
  PlayLeagueFixtureError,
} from "@/lib/play-league-fixture";
import { prisma } from "@/lib/prisma";
import {
  getNextRomeWeeklyDate,
  WEEKLY_UPDATE_EVENT,
} from "@/lib/rome-calendar";
import {
  processClubWeeklyUpdate,
} from "@/lib/weekly-club-update";

const MAX_EVENTS_PER_RUN = 256;

type ClockCandidate = {
  type:
    | "LEAGUE"
    | "WEEKLY_UPDATE"
    | "ACADEMY"
    | "WEEKLY_NEWS";
  id: number;
  scheduledAt: Date;
  round?: number;
};

export async function processGameClock(
  now = new Date()
) {
  await initializeWeeklyUpdates(now);

  const events = [];

  for (
    let index = 0;
    index < MAX_EVENTS_PER_RUN;
    index += 1
  ) {
    const candidate =
      await findNextDueEvent(now);

    if (!candidate) {
      return {
        checkedAt: now,
        processedEvents:
          events.length,
        reachedLimit: false,
        events,
      };
    }

    const result =
      await processCandidate(
        candidate,
        now
      );

    events.push(result);
  }

  return {
    checkedAt: now,
    processedEvents:
      events.length,
    reachedLimit: true,
    events,
  };
}

async function initializeWeeklyUpdates(
  now: Date
) {
  const nextWeeklyUpdateAt =
    getNextRomeWeeklyDate(
      now,
      WEEKLY_UPDATE_EVENT
    );

  await prisma.club.updateMany({
    where: {
      nextWeeklyUpdateAt: null,
    },
    data: {
      nextWeeklyUpdateAt,
    },
  });
}

async function findNextDueEvent(
  now: Date
): Promise<ClockCandidate | null> {
  const [
    fixture,
    club,
    academyClub,
    weeklyNews,
  ] = await Promise.all([
    prisma.leagueFixture.findFirst({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          lte: now,
        },
        league: {
          status: "ACTIVE",
        },
      },
      select: {
        id: true,
        round: true,
        scheduledAt: true,
      },
      orderBy: [
        {
          scheduledAt: "asc",
        },
        {
          round: "asc",
        },
        {
          id: "asc",
        },
      ],
    }),
    prisma.club.findFirst({
      where: {
        nextWeeklyUpdateAt: {
          not: null,
          lte: now,
        },
      },
      select: {
        id: true,
        nextWeeklyUpdateAt: true,
      },
      orderBy: {
        nextWeeklyUpdateAt: "asc",
      },
    }),
    prisma.club.findFirst({
      where: {
        nextAcademyCandidateAt: {
          not: null,
          lte: now,
        },
      },
      select: {
        id: true,
        nextAcademyCandidateAt: true,
      },
      orderBy: {
        nextAcademyCandidateAt: "asc",
      },
    }),
    prisma.clubWeeklyUpdate.findFirst({
      where: {
        newsPublishedAt: null,
        newsScheduledAt: {
          lte: now,
        },
      },
      select: {
        id: true,
        newsScheduledAt: true,
      },
      orderBy: {
        newsScheduledAt: "asc",
      },
    }),
  ]);
  const candidates: ClockCandidate[] = [];

  if (fixture) {
    candidates.push({
      type: "LEAGUE",
      id: fixture.id,
      round: fixture.round,
      scheduledAt:
        fixture.scheduledAt,
    });
  }

  if (club?.nextWeeklyUpdateAt) {
    candidates.push({
      type: "WEEKLY_UPDATE",
      id: club.id,
      scheduledAt:
        club.nextWeeklyUpdateAt,
    });
  }

  if (
    academyClub?.nextAcademyCandidateAt
  ) {
    candidates.push({
      type: "ACADEMY",
      id: academyClub.id,
      scheduledAt:
        academyClub.nextAcademyCandidateAt,
    });
  }

  if (weeklyNews) {
    candidates.push({
      type: "WEEKLY_NEWS",
      id: weeklyNews.id,
      scheduledAt:
        weeklyNews.newsScheduledAt,
    });
  }

  candidates.sort(
    (first, second) =>
      first.scheduledAt.getTime() -
        second.scheduledAt.getTime() ||
      first.type.localeCompare(
        second.type
      ) ||
      first.id - second.id
  );

  return candidates[0] ?? null;
}

async function processCandidate(
  candidate: ClockCandidate,
  now: Date
) {
  switch (candidate.type) {
    case "LEAGUE":
      return processLeagueRound(candidate);

    case "WEEKLY_UPDATE": {
      const result =
        await processClubWeeklyUpdate({
          clubId: candidate.id,
          scheduledAt:
            candidate.scheduledAt,
          processedAt: now,
        });

      return {
        type: candidate.type,
        id: candidate.id,
        status: result.status,
        scheduledAt:
          candidate.scheduledAt,
      };
    }

    case "ACADEMY":
      return processAcademyEvent(
        candidate,
        now
      );

    case "WEEKLY_NEWS":
      return publishWeeklyNews(
        candidate,
        now
      );
  }
}

async function processLeagueRound(
  candidate: ClockCandidate
) {
  if (candidate.round === undefined) {
    throw new Error("LEAGUE_ROUND_MISSING");
  }

  const fixtures = await prisma.leagueFixture.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: candidate.scheduledAt,
      round: candidate.round,
      league: {
        status: "ACTIVE",
      },
    },
    orderBy: {
      id: "asc",
    },
    select: {
      id: true,
    },
  });
  const scores: Array<{
    fixtureId: number;
    score: string;
  }> = [];

  for (const fixture of fixtures) {
    const result = await processLeagueFixture(
      fixture.id,
      candidate.scheduledAt
    );

    if (result) {
      scores.push(result);
    }
  }

  return {
    type: candidate.type,
    id: candidate.id,
    status: "PROCESSED",
    scheduledAt: candidate.scheduledAt,
    round: candidate.round,
    processedFixtures: scores.length,
    scores,
  };
}

async function processLeagueFixture(
  fixtureId: number,
  scheduledAt: Date
) {
  try {
    const result = await playLeagueFixture({
      fixtureId,
      now: scheduledAt,
    });

    return {
      fixtureId,
      score: `${result.fixture.homeScore}-${result.fixture.awayScore}`,
    };
  } catch (error) {
    if (
      error instanceof PlayLeagueFixtureError &&
      error.status === 409
    ) {
      const fixture = await prisma.leagueFixture.findUnique({
        where: {
          id: fixtureId,
        },
        select: {
          status: true,
        },
      });

      if (fixture?.status !== "SCHEDULED") {
        return null;
      }
    }

    throw error;
  }
}

async function processAcademyEvent(
  candidate: ClockCandidate,
  processedAt: Date
) {
  return prisma.$transaction(
    async (transaction) => {
      const intake =
        await advanceAcademyIntake(
          transaction,
          candidate.id,
          candidate.scheduledAt
        );
      const scouting =
        await advanceAcademyScouting(
          transaction,
          candidate.id,
          candidate.scheduledAt
        );

      if (
        intake.createdPlayers > 0 ||
        intake.missedCandidates > 0 ||
        scouting.advancedPlayers > 0
      ) {
        await transaction.gameEvent.create({
          data: {
            clubId: candidate.id,
            type: "Accademia",
            title:
              intake.createdPlayers > 0
                ? "Nuovo candidato in Accademia"
                : "Aggiornamento dell'Accademia",
            description:
              `${intake.createdPlayers} nuovi candidati, ` +
              `${scouting.advancedPlayers} rapporti aggiornati` +
              (intake.missedCandidates > 0
                ? `, ${intake.missedCandidates} candidature perse per capienza.`
                : "."),
            createdAt:
              candidate.scheduledAt,
          },
        });
      }

      return {
        type: candidate.type,
        id: candidate.id,
        status: "PROCESSED",
        scheduledAt:
          candidate.scheduledAt,
        processedAt,
        intake,
        scouting,
      };
    }
  );
}

async function publishWeeklyNews(
  candidate: ClockCandidate,
  now: Date
) {
  return prisma.$transaction(
    async (transaction) => {
      await transaction.$queryRaw`
        SELECT "id"
        FROM "ClubWeeklyUpdate"
        WHERE "id" = ${candidate.id}
        FOR UPDATE
      `;

      const weeklyUpdate =
        await transaction.clubWeeklyUpdate.findUnique({
          where: {
            id: candidate.id,
          },
          include: {
            club: {
              select: {
                name: true,
              },
            },
          },
        });

      if (
        !weeklyUpdate ||
        weeklyUpdate.newsPublishedAt ||
        weeklyUpdate.newsScheduledAt.getTime() >
          now.getTime()
      ) {
        return {
          type: candidate.type,
          id: candidate.id,
          status: "SKIPPED",
          scheduledAt:
            candidate.scheduledAt,
        };
      }

      await transaction.gameEvent.create({
        data: {
          clubId:
            weeklyUpdate.clubId,
          type: "Aggiornamento",
          title:
            "Riepilogo settimanale completato",
          description:
            `${weeklyUpdate.club.name}: giocatori e finanze aggiornati. ` +
            `Risultato economico ${formatSignedCurrency(
              weeklyUpdate.netResult
            )}.`,
          createdAt:
            weeklyUpdate.newsScheduledAt,
        },
      });
      await transaction.clubWeeklyUpdate.update({
        where: {
          id: weeklyUpdate.id,
        },
        data: {
          newsPublishedAt:
            weeklyUpdate.newsScheduledAt,
        },
      });

      return {
        type: candidate.type,
        id: candidate.id,
        status: "PROCESSED",
        scheduledAt:
          candidate.scheduledAt,
      };
    }
  );
}

function formatSignedCurrency(
  amount: number
) {
  const sign = amount >= 0 ? "+" : "-";

  return `${sign}${new Intl.NumberFormat(
    "it-IT",
    {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }
  ).format(Math.abs(amount))}`;
}
