import { NextResponse } from "next/server";

import {
  MAX_FIRST_TEAM_PLAYERS,
} from "@/lib/game-config";
import { getApiClubAccess } from "@/lib/api-club-access";
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
    const databasePlayers =
      await prisma.academyPlayer.findMany({
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
      });

    const players = databasePlayers.map((player) => {
      const usesExplicitRevealKeys =
        player.revealedAttributeKeys.length > 0;

      function getVisibleValue(
        key: string,
        value: number | null
      ) {
        const isRevealed = usesExplicitRevealKeys
          ? player.revealedAttributeKeys.includes(key)
          : value !== null;

        if (!isRevealed || value === null) {
          return null;
        }

        return Math.round(value);
      }

      return {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        nationality: player.nationality,
        age: player.age,

        revealedAttributes: usesExplicitRevealKeys
          ? player.revealedAttributeKeys.length
          : player.revealedAttributes,

        totalAttributes: player.totalAttributes,

        attributes: {
          precisione: getVisibleValue(
            "precisione",
            player.precisione
          ),

          diretto: getVisibleValue(
            "diretto",
            player.diretto
          ),

          sponde: getVisibleValue(
            "sponde",
            player.sponde
          ),

          tattica: getVisibleValue(
            "tattica",
            player.tattica
          ),

          mentalita: getVisibleValue(
            "mentalita",
            player.mentalita
          ),

          difesa: getVisibleValue(
            "difesa",
            player.difesa
          ),

          realizzazione: getVisibleValue(
            "realizzazione",
            player.realizzazione
          ),

          creativita: getVisibleValue(
            "creativita",
            player.creativita
          ),

          misura: getVisibleValue(
            "misura",
            player.misura
          ),
        },
      };
    });

    return NextResponse.json({
      players,
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
            potential: academyPlayer.potential,

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
