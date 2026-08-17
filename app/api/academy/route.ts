import { NextResponse } from "next/server";

import { ensureInitialAcademy } from "@/lib/academy-initialization";
import {
  advanceAcademyScouting,
  getAcademyEstimatedRange,
  getAcademyRangeWidth,
} from "@/lib/academy-scouting";
import { getApiClubAccess } from "@/lib/api-club-access";
import {
  MAX_FIRST_TEAM_PLAYERS,
} from "@/lib/game-config";
import { getMarketCommitments } from "@/lib/market-commitments";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

class AcademyPromotionError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "AcademyPromotionError";
  }
}

export async function GET() {
  try {
    const access = await getApiClubAccess();

    if (!access.granted) {
      return access.response;
    }

    const { clubId } = access;
    const { databasePlayers, youthCoachLevel } = await prisma.$transaction(
      async (transaction) => {
        await ensureInitialAcademy(transaction, clubId);
        await advanceAcademyScouting(transaction, clubId);

        const [club, players] = await Promise.all([
          transaction.club.findUnique({
            where: {
              id: clubId,
            },
            select: {
              youthCoachLevel: true,
            },
          }),
          transaction.academyPlayer.findMany({
            where: {
              clubId,
            },
            orderBy: [
              {
                age: "desc",
              },
              {
                lastName: "asc",
              },
            ],
          }),
        ]);

        return {
          databasePlayers: players,
          youthCoachLevel: club?.youthCoachLevel ?? 1,
        };
      }
    );

    const players = databasePlayers.map((player) => {
      function getVisibleValue(
        key: keyof typeof attributeValues,
        value: number | null
      ) {
        if (value === null) {
          return null;
        }

        if (player.revealedAttributeKeys.includes(key)) {
          return Math.round(value);
        }

        if (player.estimatedAttributeKeys.includes(key)) {
          return getAcademyEstimatedRange({
            playerId: player.id,
            attribute: key,
            value,
            youthCoachLevel,
          });
        }

        return null;
      }

      const attributeValues = {
        precisione: player.precisione,
        diretto: player.diretto,
        sponde: player.sponde,
        tattica: player.tattica,
        mentalita: player.mentalita,
        difesa: player.difesa,
        realizzazione: player.realizzazione,
        creativita: player.creativita,
        misura: player.misura,
      };

      return {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        nationality: player.nationality,
        age: player.age,

        estimatedAttributes: player.estimatedAttributeKeys.length,
        revealedAttributes: player.revealedAttributeKeys.length,

        totalAttributes: player.totalAttributes,
        nextScoutingAt: player.nextScoutingAt?.toISOString() ?? null,

        attributes: {
          precisione: getVisibleValue(
            "precisione",
            attributeValues.precisione
          ),

          diretto: getVisibleValue(
            "diretto",
            attributeValues.diretto
          ),

          sponde: getVisibleValue(
            "sponde",
            attributeValues.sponde
          ),

          tattica: getVisibleValue(
            "tattica",
            attributeValues.tattica
          ),

          mentalita: getVisibleValue(
            "mentalita",
            attributeValues.mentalita
          ),

          difesa: getVisibleValue(
            "difesa",
            attributeValues.difesa
          ),

          realizzazione: getVisibleValue(
            "realizzazione",
            attributeValues.realizzazione
          ),

          creativita: getVisibleValue(
            "creativita",
            attributeValues.creativita
          ),

          misura: getVisibleValue(
            "misura",
            attributeValues.misura
          ),
        },
      };
    });

    return NextResponse.json({
      players,
      youthCoachLevel,
      scoutingRangeWidth: getAcademyRangeWidth(youthCoachLevel),
    });
  } catch (error) {
    console.error(
      "Errore durante il caricamento dell'Accademia:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile caricare i giocatori dell'Accademia.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const access = await getApiClubAccess();

    if (!access.granted) {
      return access.response;
    }

    const { clubId } = access;
    const body: unknown = await request.json();

    const playerId =
      typeof body === "object" &&
      body !== null &&
      "playerId" in body
        ? Number(
            (body as { playerId: unknown }).playerId
          )
        : Number.NaN;

    if (
      !Number.isInteger(playerId) ||
      playerId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Identificativo del giovane non valido.",
        },
        {
          status: 400,
        }
      );
    }

    const academyPlayer =
      await prisma.academyPlayer.findFirst({
        where: {
          id: playerId,
          clubId,
        },
      });

    if (!academyPlayer) {
      return NextResponse.json(
        {
          error:
            "Il giovane selezionato non è stato trovato.",
        },
        {
          status: 404,
        }
      );
    }

    if (academyPlayer.age < 16) {
      return NextResponse.json(
        {
          error:
            "Il giovane deve avere almeno 16 anni per essere promosso.",
        },
        {
          status: 400,
        }
      );
    }

    const attributes = [
      academyPlayer.precisione,
      academyPlayer.diretto,
      academyPlayer.sponde,
      academyPlayer.tattica,
      academyPlayer.mentalita,
      academyPlayer.difesa,
      academyPlayer.realizzazione,
      academyPlayer.creativita,
      academyPlayer.misura,
    ];

    const hasMissingAttributes =
      attributes.some(
        (attribute) => attribute === null
      );

    if (hasMissingAttributes) {
      return NextResponse.json(
        {
          error:
            "Il giovane non possiede ancora tutti i valori interni necessari.",
        },
        {
          status: 400,
        }
      );
    }

    const promotedPlayer =
      await prisma.$transaction(async (transaction) => {
        await transaction.$queryRaw`
          SELECT "id"
          FROM "Club"
          WHERE "id" = ${clubId}
          FOR UPDATE
        `;

        const [firstTeamPlayers, commitments] =
          await Promise.all([
            transaction.player.count({
              where: {
                clubId,
              },
            }),
            getMarketCommitments(
              transaction,
              clubId
            ),
          ]);

        if (
          firstTeamPlayers +
            commitments.reservedRosterPlaces >=
          MAX_FIRST_TEAM_PLAYERS
        ) {
          throw new AcademyPromotionError(
            `Non puoi superare la quantità massima di ${MAX_FIRST_TEAM_PLAYERS} giocatori considerando anche le aste in cui sei in vantaggio.`,
            400
          );
        }

        const player = await transaction.player.create({
          data: {
            clubId: academyPlayer.clubId,
            firstName: academyPlayer.firstName,
            lastName: academyPlayer.lastName,
            nationality:
              academyPlayer.nationality,
            age: academyPlayer.age,

            form: 5,
            morale: 5,
            experience: 0,

            talent: academyPlayer.talent,

            value: 0,
            salary: 0,
            image: "",
            style: [],

            precisione:
              academyPlayer.precisione as number,

            diretto:
              academyPlayer.diretto as number,

            sponde:
              academyPlayer.sponde as number,

            tattica:
              academyPlayer.tattica as number,

            mentalita:
              academyPlayer.mentalita as number,

            difesa:
              academyPlayer.difesa as number,

            realizzazione:
              academyPlayer.realizzazione as number,

            creativita:
              academyPlayer.creativita as number,

            misura:
              academyPlayer.misura as number,
          },
        });

        await transaction.academyPlayer.delete({
          where: {
            id: academyPlayer.id,
          },
        });

        return player;
      });

    return NextResponse.json(
      {
        message: `${promotedPlayer.firstName} ${promotedPlayer.lastName} è stato promosso in prima squadra.`,

        player: {
          id: promotedPlayer.id,
          firstName: promotedPlayer.firstName,
          lastName: promotedPlayer.lastName,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    if (error instanceof AcademyPromotionError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    console.error(
      "Errore durante la promozione del giovane:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile completare la promozione in prima squadra.",
      },
      {
        status: 500,
      }
    );
  }
}
