import { NextResponse } from "next/server";

import { getCurrentClubId } from "@/lib/current-club";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const FIRST_LEG_ROUNDS = 7;

type ClubResponse = {
  id: number;
  name: string;
  shortName: string;
  city: string;
};

type FixtureResponse = {
  id: number;
  status: string;
  scheduledAt: string;
  playedAt: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeClub: ClubResponse;
  awayClub: ClubResponse;
};

type RoundResponse = {
  round: number;
  leg: "ANDATA" | "RITORNO";
  scheduledAt: string;
  fixtures: FixtureResponse[];
};

export async function GET() {
  try {
    const clubId = await getCurrentClubId();
    const league =
      await prisma.league.findFirst({
        where: {
          status: {
            in: [
              "PREPARATION",
              "ACTIVE",
            ],
          },
          entries: {
            some: {
              clubId,
            },
          },
        },

        orderBy: {
          id: "desc",
        },

        include: {
          season: true,

          entries: {
            orderBy: {
              clubId: "asc",
            },

            include: {
              club: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  city: true,
                },
              },
            },
          },

          fixtures: {
            orderBy: [
              {
                round: "asc",
              },
              {
                scheduledAt: "asc",
              },
              {
                id: "asc",
              },
            ],

            include: {
              homeClub: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  city: true,
                },
              },

              awayClub: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  city: true,
                },
              },
            },
          },
        },
      });

    if (!league) {
      return NextResponse.json(
        {
          error:
            "Non esiste un campionato attuale.",
        },
        {
          status: 404,
        }
      );
    }

    const roundsByNumber =
      new Map<number, RoundResponse>();

    for (
      const fixture of league.fixtures
    ) {
      let round =
        roundsByNumber.get(
          fixture.round
        );

      if (!round) {
        round = {
          round:
            fixture.round,

          leg:
            fixture.round <=
            FIRST_LEG_ROUNDS
              ? "ANDATA"
              : "RITORNO",

          scheduledAt:
            fixture.scheduledAt.toISOString(),

          fixtures: [],
        };

        roundsByNumber.set(
          fixture.round,
          round
        );
      }

      round.fixtures.push({
        id:
          fixture.id,

        status:
          fixture.status,

        scheduledAt:
          fixture.scheduledAt.toISOString(),

        playedAt:
          fixture.playedAt
            ? fixture.playedAt.toISOString()
            : null,

        homeScore:
          fixture.homeScore,

        awayScore:
          fixture.awayScore,

        homeClub: {
          id:
            fixture.homeClub.id,

          name:
            fixture.homeClub.name,

          shortName:
            fixture.homeClub
              .shortName,

          city:
            fixture.homeClub.city,
        },

        awayClub: {
          id:
            fixture.awayClub.id,

          name:
            fixture.awayClub.name,

          shortName:
            fixture.awayClub
              .shortName,

          city:
            fixture.awayClub.city,
        },
      });
    }

    const rounds = Array.from(
      roundsByNumber.values()
    ).sort(
      (firstRound, secondRound) =>
        firstRound.round -
        secondRound.round
    );

    return NextResponse.json({
      season: {
        id:
          league.season.id,

        number:
          league.season.number,

        name:
          league.season.name,

        status:
          league.season.status,

        startsAt:
          league.season.startsAt
            ? league.season.startsAt.toISOString()
            : null,

        endsAt:
          league.season.endsAt
            ? league.season.endsAt.toISOString()
            : null,
      },

      league: {
        id:
          league.id,

        name:
          league.name,

        level:
          league.level,

        groupCode:
          league.groupCode,

        status:
          league.status,

        currentRound:
          league.currentRound,
      },

      summary: {
        clubs:
          league.entries.length,

        rounds:
          rounds.length,

        matchesPerRound:
          league.entries.length / 2,

        totalFixtures:
          league.fixtures.length,

        playedFixtures:
          league.fixtures.filter(
            (fixture) =>
              fixture.status ===
              "PLAYED"
          ).length,

        scheduledFixtures:
          league.fixtures.filter(
            (fixture) =>
              fixture.status ===
              "SCHEDULED"
          ).length,
      },

      clubs:
        league.entries.map(
          (entry) => ({
            id:
              entry.club.id,

            name:
              entry.club.name,

            shortName:
              entry.club.shortName,

            city:
              entry.club.city,

            standings: {
              played:
                entry.played,

              won:
                entry.won,

              drawn:
                entry.drawn,

              lost:
                entry.lost,

              pointsFor:
                entry.pointsFor,

              pointsAgainst:
                entry.pointsAgainst,

              points:
                entry.points,
            },
          })
        ),

      rounds,
    });
  } catch (error) {
    console.error(
      "Errore durante il caricamento del campionato:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile caricare il campionato.",
      },
      {
        status: 500,
      }
    );
  }
}
