import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  generateDoubleRoundRobin,
  type GeneratedLeagueFixture,
} from "@/lib/league-scheduler";

export const dynamic = "force-dynamic";

const REQUIRED_CLUBS = 8;

type ClubSummary = {
  id: number;
  name: string;
  shortName: string;
  city: string;
};

export async function GET() {
  try {
    const clubs =
      await prisma.club.findMany({
        orderBy: {
          id: "asc",
        },

        select: {
          id: true,
          name: true,
          shortName: true,
          city: true,
        },

        take: REQUIRED_CLUBS,
      });

    if (
      clubs.length !== REQUIRED_CLUBS
    ) {
      return NextResponse.json(
        {
          error:
            `Servono esattamente ${REQUIRED_CLUBS} club per creare il campionato.`,

          clubsFound:
            clubs.length,

          clubsRequired:
            REQUIRED_CLUBS,
        },
        {
          status: 400,
        }
      );
    }

    const clubIds = clubs.map(
      (club) => club.id
    );

    const generatedFixtures =
      generateDoubleRoundRobin(
        clubIds
      );

    const clubsById =
      new Map<number, ClubSummary>(
        clubs.map((club) => [
          club.id,
          club,
        ])
      );

    const rounds = Array.from(
      {
        length:
          REQUIRED_CLUBS * 2 - 2,
      },

      (_, roundIndex) => {
        const round =
          roundIndex + 1;

        const roundFixtures =
          generatedFixtures.filter(
            (fixture) =>
              fixture.round === round
          );

        return {
          round,

          leg:
            round <=
            REQUIRED_CLUBS - 1
              ? "ANDATA"
              : "RITORNO",

          fixtures:
            roundFixtures.map(
              (fixture) =>
                buildFixtureResponse(
                  fixture,
                  clubsById
                )
            ),
        };
      }
    );

    return NextResponse.json({
      summary: {
        clubs:
          clubs.length,

        rounds:
          rounds.length,

        matchesPerRound:
          REQUIRED_CLUBS / 2,

        totalFixtures:
          generatedFixtures.length,

        firstLegFixtures:
          generatedFixtures.filter(
            (fixture) =>
              fixture.round <=
              REQUIRED_CLUBS - 1
          ).length,

        returnLegFixtures:
          generatedFixtures.filter(
            (fixture) =>
              fixture.round >
              REQUIRED_CLUBS - 1
          ).length,
      },

      clubs,
      rounds,
    });
  } catch (error) {
    console.error(
      "Errore durante la creazione dell'anteprima del calendario:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile creare l'anteprima del calendario.",
      },
      {
        status: 500,
      }
    );
  }
}

function buildFixtureResponse(
  fixture: GeneratedLeagueFixture,
  clubsById: Map<
    number,
    ClubSummary
  >
) {
  const homeClub =
    clubsById.get(
      fixture.homeClubId
    );

  const awayClub =
    clubsById.get(
      fixture.awayClubId
    );

  if (!homeClub || !awayClub) {
    throw new Error(
      "Uno dei club del calendario non è stato trovato."
    );
  }

  return {
    homeClub: {
      id: homeClub.id,
      name: homeClub.name,
      shortName:
        homeClub.shortName,
      city: homeClub.city,
    },

    awayClub: {
      id: awayClub.id,
      name: awayClub.name,
      shortName:
        awayClub.shortName,
      city: awayClub.city,
    },
  };
}