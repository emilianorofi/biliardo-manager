import { NextResponse } from "next/server";

import { getApiClubAccess } from "@/lib/api-club-access";

import { prisma } from "@/lib/prisma";

import {
  calculatePlayerPerformance,
  calculateSpecialtyRating,
  calculateTeamPerformanceRating,
  calculateTeamSpecialtyRating,
  getLeagueMatchDefinitions,
  type FormationSlot,
} from "@/lib/match-engine";

export const dynamic =
  "force-dynamic";

type FormationPlayer = {
  id: number;
  firstName: string;
  lastName: string;

  precisione: number;
  diretto: number;
  sponde: number;

  form: number;
  morale: number;
  experience: number;
};

export async function GET() {
  try {
    const access = await getApiClubAccess();

    if (!access.granted) {
      return access.response;
    }

    const { clubId } = access;
    const formation =
      await prisma.formation.findUnique({
        where: {
          clubId:
            clubId,
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

          slotAPlayer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,

              precisione: true,
              diretto: true,
              sponde: true,

              form: true,
              morale: true,
              experience: true,
            },
          },

          slotBPlayer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,

              precisione: true,
              diretto: true,
              sponde: true,

              form: true,
              morale: true,
              experience: true,
            },
          },

          slotCPlayer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,

              precisione: true,
              diretto: true,
              sponde: true,

              form: true,
              morale: true,
              experience: true,
            },
          },
        },
      });

    if (!formation) {
      return NextResponse.json(
        {
          error:
            "Non è stata ancora salvata una formazione.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      !formation.slotAPlayer ||
      !formation.slotBPlayer ||
      !formation.slotCPlayer
    ) {
      return NextResponse.json(
        {
          error:
            "La formazione deve contenere un giocatore negli slot A, B e C.",
        },
        {
          status: 400,
        }
      );
    }

    const playersBySlot: Record<
      FormationSlot,
      FormationPlayer
    > = {
      A:
        formation.slotAPlayer,

      B:
        formation.slotBPlayer,

      C:
        formation.slotCPlayer,
    };

    const matchDefinitions =
      getLeagueMatchDefinitions();

    const matches =
      matchDefinitions.map(
        (match) => {
          const selectedPlayers =
            match.homeSlots.map(
              (slot) =>
                playersBySlot[slot]
            );

          const players =
            match.homeSlots.map(
              (slot) => {
                const player =
                  playersBySlot[slot];

                const performance =
                  calculatePlayerPerformance(
                    player,
                    match.specialty
                  );

                return {
                  slot,

                  id:
                    player.id,

                  firstName:
                    player.firstName,

                  lastName:
                    player.lastName,

                  form:
                    player.form,

                  morale:
                    player.morale,

                  experience:
                    player.experience,

                  specialtyRating:
                    calculateSpecialtyRating(
                      player,
                      match.specialty
                    ),

                  performance,
                };
              }
            );

          return {
            order:
              match.order,

            specialty:
              match.specialty,

            targetPoints:
              match.targetPoints,

            slots: [
              ...match.homeSlots,
            ],

            players,

            teamRating:
              calculateTeamSpecialtyRating(
                selectedPlayers,
                match.specialty
              ),

            teamPerformanceRating:
              calculateTeamPerformanceRating(
                selectedPlayers,
                match.specialty
              ),
          };
        }
      );

    return NextResponse.json({
      club: {
        id:
          formation.club.id,

        name:
          formation.club.name,

        shortName:
          formation.club.shortName,

        city:
          formation.club.city,
      },

      formation: {
        savedAt:
          formation.savedAt
            ? formation.savedAt.toISOString()
            : null,

        slots: {
          A: {
            id:
              formation.slotAPlayer.id,

            firstName:
              formation.slotAPlayer
                .firstName,

            lastName:
              formation.slotAPlayer
                .lastName,
          },

          B: {
            id:
              formation.slotBPlayer.id,

            firstName:
              formation.slotBPlayer
                .firstName,

            lastName:
              formation.slotBPlayer
                .lastName,
          },

          C: {
            id:
              formation.slotCPlayer.id,

            firstName:
              formation.slotCPlayer
                .firstName,

            lastName:
              formation.slotCPlayer
                .lastName,
          },
        },
      },

      summary: {
        totalMatches:
          matches.length,

        singles:
          matches.filter(
            (match) =>
              match.slots.length === 1
          ).length,

        pairs:
          matches.filter(
            (match) =>
              match.slots.length === 2
          ).length,
      },

      matches,
    });
  } catch (error) {
    console.error(
      "Errore durante il calcolo della forza della formazione:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossibile calcolare la forza della formazione.",
      },
      {
        status: 500,
      }
    );
  }
}
