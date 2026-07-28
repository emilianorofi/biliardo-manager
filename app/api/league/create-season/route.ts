import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const REQUIRED_CLUBS = 8;

const LEAGUE_NAME = "Serie A";
const LEAGUE_LEVEL = 1;
const LEAGUE_GROUP_CODE = "A";

export async function POST() {
  try {
    const existingSeason =
      await prisma.season.findFirst({
        where: {
          status: {
            in: [
              "PREPARATION",
              "ACTIVE",
            ],
          },
        },

        orderBy: {
          number: "desc",
        },
      });

    if (existingSeason) {
      return NextResponse.json(
        {
          error:
            "Esiste già una stagione in preparazione o attiva.",

          season: {
            id: existingSeason.id,
            number:
              existingSeason.number,
            name: existingSeason.name,
            status:
              existingSeason.status,
          },
        },
        {
          status: 409,
        }
      );
    }

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
            `Servono almeno ${REQUIRED_CLUBS} club per creare la stagione.`,

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

    const latestSeason =
      await prisma.season.findFirst({
        orderBy: {
          number: "desc",
        },

        select: {
          number: true,
        },
      });

    const seasonNumber =
      (latestSeason?.number ?? 0) + 1;

    const createdSeason =
      await prisma.$transaction(
        async (transaction) => {
          const season =
            await transaction.season.create({
              data: {
                number: seasonNumber,
                name:
                  `Stagione ${seasonNumber}`,
                status:
                  "PREPARATION",
              },
            });

          const league =
            await transaction.league.create({
              data: {
                seasonId: season.id,

                name: LEAGUE_NAME,
                level: LEAGUE_LEVEL,

                groupCode:
                  LEAGUE_GROUP_CODE,

                status:
                  "PREPARATION",

                currentRound: 0,
              },
            });

          await transaction.leagueEntry.createMany(
            {
              data: clubs.map(
                (club) => ({
                  leagueId:
                    league.id,

                  clubId:
                    club.id,
                })
              ),
            }
          );

          return {
            season,
            league,
          };
        }
      );

    return NextResponse.json(
      {
        message:
          "Stagione creata correttamente.",

        season: {
          id:
            createdSeason.season.id,

          number:
            createdSeason.season
              .number,

          name:
            createdSeason.season.name,

          status:
            createdSeason.season
              .status,
        },

        league: {
          id:
            createdSeason.league.id,

          name:
            createdSeason.league.name,

          level:
            createdSeason.league
              .level,

          groupCode:
            createdSeason.league
              .groupCode,

          status:
            createdSeason.league
              .status,

          currentRound:
            createdSeason.league
              .currentRound,
        },

        clubs,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Errore durante la creazione della stagione:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile creare la stagione.",
      },
      {
        status: 500,
      }
    );
  }
}