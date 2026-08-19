import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  calculateLeagueCompletion,
} from "@/lib/league-completion";

import {
  calculateCompletedRound,
} from "@/lib/league-progress";

import {
  validateFixtureRound,
} from "@/lib/league-round";

import {
  calculateFixtureStandingsDeltas,
} from "@/lib/league-standings";

import { prisma } from "@/lib/prisma";

import {
  completeSeasonIfReady,
} from "@/lib/season-completion";

export const dynamic =
  "force-dynamic";

type RecordResultBody = {
  fixtureId?: unknown;
  homeScore?: unknown;
  awayScore?: unknown;
};

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json() as
        RecordResultBody;

    const fixtureId =
      Number(
        body.fixtureId
      );

    const homeScore =
      Number(
        body.homeScore
      );

    const awayScore =
      Number(
        body.awayScore
      );

    if (
      !Number.isInteger(
        fixtureId
      ) ||
      fixtureId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "fixtureId deve essere un numero intero positivo.",
        },
        {
          status: 400,
        }
      );
    }

    let deltas;

    try {
      deltas =
        calculateFixtureStandingsDeltas(
          homeScore,
          awayScore
        );
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Risultato non valido.",
        },
        {
          status: 400,
        }
      );
    }

    const fixture =
      await prisma.leagueFixture.findUnique({
        where: {
          id:
            fixtureId,
        },

        include: {
          league: {
            select: {
              id:
                true,

              name:
                true,

              status:
                true,

              currentRound:
                true,

              seasonId:
                true,
            },
          },

          homeClub: {
            select: {
              id:
                true,

              name:
                true,

              shortName:
                true,
            },
          },

          awayClub: {
            select: {
              id:
                true,

              name:
                true,

              shortName:
                true,
            },
          },
        },
      });

    if (!fixture) {
      return NextResponse.json(
        {
          error:
            "L'incontro indicato non esiste.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      fixture.league.status !==
      "ACTIVE"
    ) {
      return NextResponse.json(
        {
          error:
            "Il campionato non è attivo.",

          leagueStatus:
            fixture.league.status,
        },
        {
          status: 400,
        }
      );
    }

    if (
      fixture.status !==
      "SCHEDULED"
    ) {
      return NextResponse.json(
        {
          error:
            "Il risultato di questo incontro è già stato registrato.",

          fixtureId:
            fixture.id,

          status:
            fixture.status,

          homeScore:
            fixture.homeScore,

          awayScore:
            fixture.awayScore,
        },
        {
          status: 409,
        }
      );
    }

    try {
      validateFixtureRound(
        fixture.league.currentRound,
        fixture.round
      );
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "La giornata dell'incontro non è valida.",

          currentRound:
            fixture.league.currentRound,

          fixtureRound:
            fixture.round,
        },
        {
          status: 400,
        }
      );
    }

    const leagueEntries =
      await prisma.leagueEntry.findMany({
        where: {
          leagueId:
            fixture.leagueId,

          clubId: {
            in: [
              fixture.homeClubId,
              fixture.awayClubId,
            ],
          },
        },

        select: {
          id:
            true,

          clubId:
            true,
        },
      });

    if (
      leagueEntries.length !== 2
    ) {
      return NextResponse.json(
        {
          error:
            "Le due squadre non risultano correttamente iscritte al campionato.",
        },
        {
          status: 400,
        }
      );
    }

    const playedAt =
      new Date();

    const result =
      await prisma.$transaction(
        async (
          transaction
        ) => {
          const fixtureUpdate =
            await transaction
              .leagueFixture
              .updateMany({
                where: {
                  id:
                    fixture.id,

                  status:
                    "SCHEDULED",
                },

                data: {
                  status:
                    "PLAYED",

                  homeScore,
                  awayScore,

                  playedAt,
                },
              });

          if (
            fixtureUpdate.count !== 1
          ) {
            throw new Error(
              "RESULT_ALREADY_RECORDED"
            );
          }

          const homeEntry =
            await transaction
              .leagueEntry
              .update({
                where: {
                  leagueId_clubId: {
                    leagueId:
                      fixture.leagueId,

                    clubId:
                      fixture.homeClubId,
                  },
                },

                data: {
                  played: {
                    increment:
                      deltas.home.played,
                  },

                  won: {
                    increment:
                      deltas.home.won,
                  },

                  drawn: {
                    increment:
                      deltas.home.drawn,
                  },

                  lost: {
                    increment:
                      deltas.home.lost,
                  },

                  pointsFor: {
                    increment:
                      deltas.home.pointsFor,
                  },

                  pointsAgainst: {
                    increment:
                      deltas.home.pointsAgainst,
                  },

                  points: {
                    increment:
                      deltas.home.points,
                  },
                },
              });

          const awayEntry =
            await transaction
              .leagueEntry
              .update({
                where: {
                  leagueId_clubId: {
                    leagueId:
                      fixture.leagueId,

                    clubId:
                      fixture.awayClubId,
                  },
                },

                data: {
                  played: {
                    increment:
                      deltas.away.played,
                  },

                  won: {
                    increment:
                      deltas.away.won,
                  },

                  drawn: {
                    increment:
                      deltas.away.drawn,
                  },

                  lost: {
                    increment:
                      deltas.away.lost,
                  },

                  pointsFor: {
                    increment:
                      deltas.away.pointsFor,
                  },

                  pointsAgainst: {
                    increment:
                      deltas.away.pointsAgainst,
                  },

                  points: {
                    increment:
                      deltas.away.points,
                  },
                },
              });

          const leagueFixtures =
            await transaction
              .leagueFixture
              .findMany({
                where: {
                  leagueId:
                    fixture.leagueId,
                },

                select: {
                  round:
                    true,

                  status:
                    true,
                },

                orderBy: [
                  {
                    round:
                      "asc",
                  },
                  {
                    id:
                      "asc",
                  },
                ],
              });

          const completedRound =
            calculateCompletedRound(
              leagueFixtures
            );

          const totalRounds =
            leagueFixtures.reduce(
              (
                highestRound,
                leagueFixture
              ) =>
                Math.max(
                  highestRound,
                  leagueFixture.round
                ),
              0
            );

          const completion =
            calculateLeagueCompletion(
              completedRound,
              totalRounds
            );

          const updatedLeague =
            await transaction
              .league
              .update({
                where: {
                  id:
                    fixture.leagueId,
                },

                data: {
                  currentRound:
                    completion.completedRound,

                  status:
                    completion.status,
                },
              });

          const seasonCompletion =
            await completeSeasonIfReady(
              transaction,
              fixture.league.seasonId,
              {
                now: playedAt,
              }
            );

          await transaction.gameEvent.create({
            data: {
              clubId:
                null,

              type:
                "Campionato",

              title:
                `${fixture.homeClub.name} ${homeScore}-${awayScore} ${fixture.awayClub.name}`,

              description:
                `Giornata ${fixture.round} di ${fixture.league.name}.`,

              createdAt:
                playedAt,
            },
          });

          return {
            homeEntry,
            awayEntry,
            updatedLeague,
            completion,
            seasonCompletion,
          };
        }
      );

    return NextResponse.json({
      message:
        result.completion.isCompleted
          ? "Risultato registrato e campionato concluso correttamente."
          : "Risultato registrato correttamente.",

      fixture: {
        id:
          fixture.id,

        round:
          fixture.round,

        status:
          "PLAYED",

        playedAt:
          playedAt.toISOString(),

        homeClub:
          fixture.homeClub,

        awayClub:
          fixture.awayClub,

        homeScore,
        awayScore,
      },

      league: {
        id:
          result.updatedLeague.id,

        status:
          result.updatedLeague.status,

        currentRound:
          result.updatedLeague
            .currentRound,

        totalRounds:
          result.completion.totalRounds,

        isCompleted:
          result.completion.isCompleted,
      },

      season:
        result.seasonCompletion,

      standings: {
        home:
          result.homeEntry,

        away:
          result.awayEntry,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "RESULT_ALREADY_RECORDED"
    ) {
      return NextResponse.json(
        {
          error:
            "Il risultato di questo incontro è già stato registrato.",
        },
        {
          status: 409,
        }
      );
    }

    console.error(
      "Errore durante la registrazione del risultato:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile registrare il risultato dell'incontro.",
      },
      {
        status: 500,
      }
    );
  }
}
