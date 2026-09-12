"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { Prisma } from "@/generated/prisma/client";
import type { ClubOnboardingActionState } from "@/app/onboarding/action-state";
import { getNextAcademyScoutingAt } from "@/lib/academy-scouting";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  INDIVIDUAL_TOURNAMENT_SIZE,
  planIndividualTournamentRosterReplacements,
  rankIndividualTournamentPlayers,
} from "@/lib/individual-match-engine";
import {
  CLUB_CITY_MAX_LENGTH,
  CLUB_CITY_MIN_LENGTH,
  CLUB_CITY_PATTERN,
  CLUB_NAME_MAX_LENGTH,
  CLUB_NAME_MIN_LENGTH,
  CLUB_NAME_PATTERN,
  createClubShortName,
  HEX_COLOR_PATTERN,
  isClubCrestStyle,
  normalizeClubName,
  normalizeIdentityText,
  STARTING_BALANCE,
} from "@/lib/onboarding/club-rules";
import { createInitialAcademy } from "@/lib/onboarding/initial-academy";
import { createInitialSquad } from "@/lib/onboarding/initial-squad";
import { prisma } from "@/lib/prisma";

type TakeoverCandidate = {
  clubId: number;
  leagueLevel: number;
};

const onboardingTournamentPlayerSelect = {
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

export async function createManagerClub(
  _previousState: ClubOnboardingActionState,
  formData: FormData
): Promise<ClubOnboardingActionState> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      message:
        "La sessione è scaduta. Accedi nuovamente per creare il club.",
    };
  }

  const clubName = normalizeIdentityText(
    readText(formData.get("clubName"))
  );
  const city = normalizeIdentityText(
    readText(formData.get("city"))
  );
  const primaryColor = readText(
    formData.get("primaryColor")
  ).toLocaleUpperCase("en-US");
  const secondaryColor = readText(
    formData.get("secondaryColor")
  ).toLocaleUpperCase("en-US");
  const crestStyle = readText(
    formData.get("crestStyle")
  );
  const errors = validateClubIdentity({
    clubName,
    city,
    primaryColor,
    secondaryColor,
    crestStyle,
  });

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      message: "Controlla i dati del club.",
    };
  }

  const normalizedName = normalizeClubName(clubName);
  const shortName = createClubShortName(clubName);
  const initialAcademy = createInitialAcademy();

  try {
    await prisma.$transaction(
      async (transaction) => {
        await transaction.$queryRaw`
          SELECT "id"
          FROM "Manager"
          WHERE "id" = ${user.id}::uuid
          FOR UPDATE
        `;

        const manager =
          await transaction.manager.findUnique({
            where: {
              id: user.id,
            },
            select: {
              clubId: true,
            },
          });

        if (!manager) {
          throw new ClubCreationError(
            "Profilo manager non disponibile."
          );
        }

        if (manager.clubId !== null) {
          return;
        }

        const duplicateClub =
          await transaction.club.findUnique({
            where: {
              normalizedName,
            },
            select: {
              id: true,
            },
          });

        if (duplicateClub) {
          throw new ClubNameAlreadyUsedError();
        }

        const candidates = await transaction.$queryRaw<
          TakeoverCandidate[]
        >`
          SELECT
            club."id" AS "clubId",
            league."level" AS "leagueLevel"
          FROM "Club" AS club
          INNER JOIN "LeagueEntry" AS entry
            ON entry."clubId" = club."id"
          INNER JOIN "League" AS league
            ON league."id" = entry."leagueId"
          INNER JOIN "Season" AS season
            ON season."id" = league."seasonId"
          LEFT JOIN "Manager" AS assigned_manager
            ON assigned_manager."clubId" = club."id"
          WHERE assigned_manager."id" IS NULL
            AND season."id" = (
              SELECT selected_season."id"
              FROM "Season" AS selected_season
              ORDER BY
                CASE
                  WHEN selected_season."status" IN (
                    'ACTIVE',
                    'PREPARATION'
                  ) THEN 0
                  ELSE 1
                END,
                selected_season."number" DESC
              LIMIT 1
            )
          ORDER BY
            league."level" ASC,
            (
              SELECT COUNT(*)
              FROM "LeagueEntry" AS group_entry
              INNER JOIN "Manager" AS group_manager
                ON group_manager."clubId" = group_entry."clubId"
              WHERE group_entry."leagueId" = league."id"
            ) ASC,
            league."groupCode" ASC,
            entry."points" ASC,
            (
              entry."pointsFor" -
              entry."pointsAgainst"
            ) ASC,
            entry."pointsFor" ASC,
            club."id" ASC
          LIMIT 1
          FOR UPDATE OF club SKIP LOCKED
        `;

        const candidate = candidates[0];

        if (!candidate) {
          throw new ClubCreationError(
            "Al momento non ci sono club IA disponibili nella piramide."
          );
        }

        await replaceAiClub({
          transaction,
          clubId: candidate.clubId,
          managerId: user.id,
          clubName,
          normalizedName,
          shortName,
          city,
          primaryColor,
          secondaryColor,
          crestStyle,
          initialSquad: createInitialSquad(
            candidate.leagueLevel
          ),
          initialAcademy,
        });
      },
      {
        isolationLevel: "Serializable",
      }
    );
  } catch (error: unknown) {
    console.error(
      "Errore durante la creazione del club:",
      error
    );

    if (error instanceof ClubNameAlreadyUsedError) {
      return {
        errors: {
          clubName: [
            "Esiste già un club con questo nome.",
          ],
        },
      };
    }

    if (error instanceof ClubCreationError) {
      return {
        message: error.message,
      };
    }

    return {
      message:
        "Non è stato possibile creare il club. Riprova tra poco.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding/complete");
}

async function replaceAiClub({
  transaction,
  clubId,
  managerId,
  clubName,
  normalizedName,
  shortName,
  city,
  primaryColor,
  secondaryColor,
  crestStyle,
  initialSquad,
  initialAcademy,
}: {
  transaction: Prisma.TransactionClient;
  clubId: number;
  managerId: string;
  clubName: string;
  normalizedName: string;
  shortName: string;
  city: string;
  primaryColor: string;
  secondaryColor: string;
  crestStyle: string;
  initialSquad: ReturnType<typeof createInitialSquad>;
  initialAcademy: ReturnType<typeof createInitialAcademy>;
}) {
  const previousPlayers =
    await transaction.player.findMany({
      where: {
        clubId,
      },
      select: {
        id: true,
      },
    });
  const previousPlayerIds = previousPlayers.map(
    (player) => player.id
  );
  const now = new Date();

  await transaction.formation.deleteMany({
    where: {
      clubId,
    },
  });
  await transaction.trainingPlan.deleteMany({
    where: {
      clubId,
    },
  });
  await transaction.trainingSession.deleteMany({
    where: {
      clubId,
    },
  });
  await transaction.academyPlayer.deleteMany({
    where: {
      clubId,
    },
  });
  await transaction.gameEvent.deleteMany({
    where: {
      clubId,
    },
  });
  await transaction.transferBid.deleteMany({
    where: {
      bidderClubId: clubId,
    },
  });

  await transaction.transferListing.updateMany({
    where: {
      sellerClubId: clubId,
    },
    data: {
      sellerClubId: null,
    },
  });
  await transaction.transferListing.updateMany({
    where: {
      winnerClubId: clubId,
    },
    data: {
      winnerClubId: null,
    },
  });

  if (previousPlayerIds.length > 0) {
    await transaction.transferListing.deleteMany({
      where: {
        playerId: {
          in: previousPlayerIds,
        },
        status: {
          in: ["ACTIVE", "PENDING_TRANSFER"],
        },
      },
    });

    const removedPlayers = await transaction.player.updateMany({
      where: {
        clubId,
        id: {
          in: previousPlayerIds,
        },
      },
      data: {
        clubId: null,
        careerStatus: "REMOVED",
      },
    });

    if (removedPlayers.count !== previousPlayerIds.length) {
      throw new ClubCreationError(
        "La rosa precedente è cambiata durante l'assegnazione del club. Riprova."
      );
    }
  }

  await transaction.club.update({
    where: {
      id: clubId,
    },
    data: {
      name: clubName,
      normalizedName,
      shortName,
      logo: "",
      city,
      country: "Italia",
      primaryColor,
      secondaryColor,
      crestStyle,
      reputation: 1,
      fans: 0,
      balance: STARTING_BALANCE,
      weeklyExpenses: 0,
      weeklyIncome: 0,
      trainerLevel: 1,
      youthCoachLevel: 1,
      academyInitialized: true,
      nextAcademyCandidateAt:
        getNextAcademyScoutingAt(now),
    },
  });

  await transaction.manager.update({
    where: {
      id: managerId,
    },
    data: {
      clubId,
      onboardingStatus: "CLUB_CREATED",
    },
  });

  await transaction.player.createMany({
    data: initialSquad.map((player) => ({
      ...player,
      clubId,
    })),
  });

  await reconcileIndividualTournamentsAfterTakeover(
    transaction,
    previousPlayerIds
  );

  await transaction.academyPlayer.createMany({
    data: initialAcademy.map((player) => ({
      ...player,
      clubId,
    })),
  });

  await transaction.gameEvent.create({
    data: {
      clubId,
      type: "CLUB_CREATED",
      title: "Inizia una nuova avventura",
      description:
        "Il nuovo manager ha preso il comando del club.",
    },
  });
}

async function reconcileIndividualTournamentsAfterTakeover(
  transaction: Prisma.TransactionClient,
  removedPlayerIds: number[]
) {
  if (removedPlayerIds.length === 0) {
    return;
  }

  const tournamentsInProgress =
    await transaction.individualTournament.findMany({
      where: {
        status: "IN_PROGRESS",
        entries: {
          some: {
            playerId: {
              in: removedPlayerIds,
            },
            status: "ACTIVE",
          },
        },
      },
      select: {
        id: true,
        currentStage: true,
      },
    });

  for (const tournament of tournamentsInProgress) {
    await transaction.individualTournamentMatch.updateMany({
      where: {
        tournamentId: tournament.id,
        status: "SCHEDULED",
        playerOneId: {
          in: removedPlayerIds,
        },
      },
      data: {
        playerOneId: null,
      },
    });
    await transaction.individualTournamentMatch.updateMany({
      where: {
        tournamentId: tournament.id,
        status: "SCHEDULED",
        playerTwoId: {
          in: removedPlayerIds,
        },
      },
      data: {
        playerTwoId: null,
      },
    });
    await transaction.individualTournamentEntry.updateMany({
      where: {
        tournamentId: tournament.id,
        playerId: {
          in: removedPlayerIds,
        },
        status: "ACTIVE",
      },
      data: {
        status: "WITHDRAWN",
        eliminatedStage:
          tournament.currentStage ?? "WITHDRAWAL",
      },
    });
  }

  const drawnTournaments =
    await transaction.individualTournament.findMany({
      where: {
        status: "DRAWN",
      },
      select: {
        id: true,
        entries: {
          select: {
            id: true,
            playerId: true,
            drawPosition: true,
          },
        },
      },
    });

  if (drawnTournaments.length === 0) {
    return;
  }

  const activePlayers = await transaction.player.findMany({
    where: {
      careerStatus: "ACTIVE",
    },
    select: onboardingTournamentPlayerSelect,
  });
  const qualified = rankIndividualTournamentPlayers(activePlayers);

  if (qualified.length !== INDIVIDUAL_TOURNAMENT_SIZE) {
    throw new ClubCreationError(
      "Non ci sono abbastanza giocatori attivi per aggiornare il torneo individuale."
    );
  }

  for (const tournament of drawnTournaments) {
    if (tournament.entries.length !== INDIVIDUAL_TOURNAMENT_SIZE) {
      throw new ClubCreationError(
        "Il tabellone individuale non contiene tutti i partecipanti previsti."
      );
    }

    const replacements =
      planIndividualTournamentRosterReplacements(
        tournament.entries,
        qualified
      );

    for (const replacement of replacements) {
      await transaction.individualTournamentMatch.updateMany({
        where: {
          tournamentId: tournament.id,
          status: "SCHEDULED",
          playerOneId: replacement.previousPlayerId,
        },
        data: {
          playerOneId: replacement.replacementPlayerId,
        },
      });
      await transaction.individualTournamentMatch.updateMany({
        where: {
          tournamentId: tournament.id,
          status: "SCHEDULED",
          playerTwoId: replacement.previousPlayerId,
        },
        data: {
          playerTwoId: replacement.replacementPlayerId,
        },
      });
      await transaction.individualTournamentEntry.update({
        where: {
          id: replacement.entryId,
        },
        data: {
          playerId: replacement.replacementPlayerId,
          rankingAtDraw: replacement.rankingAtDraw,
          overallAtDraw: replacement.overallAtDraw,
          status: "ACTIVE",
          eliminatedStage: null,
        },
      });
    }
  }
}

function validateClubIdentity(input: {
  clubName: string;
  city: string;
  primaryColor: string;
  secondaryColor: string;
  crestStyle: string;
}) {
  const errors: NonNullable<
    ClubOnboardingActionState["errors"]
  > = {};

  if (
    input.clubName.length < CLUB_NAME_MIN_LENGTH ||
    input.clubName.length > CLUB_NAME_MAX_LENGTH
  ) {
    errors.clubName = [
      `Il nome deve avere da ${CLUB_NAME_MIN_LENGTH} a ${CLUB_NAME_MAX_LENGTH} caratteri.`,
    ];
  } else if (!CLUB_NAME_PATTERN.test(input.clubName)) {
    errors.clubName = [
      "Usa soltanto lettere, numeri, spazi, punti, apostrofi o trattini.",
    ];
  }

  if (
    input.city.length < CLUB_CITY_MIN_LENGTH ||
    input.city.length > CLUB_CITY_MAX_LENGTH
  ) {
    errors.city = [
      `La città deve avere da ${CLUB_CITY_MIN_LENGTH} a ${CLUB_CITY_MAX_LENGTH} caratteri.`,
    ];
  } else if (!CLUB_CITY_PATTERN.test(input.city)) {
    errors.city = [
      "Inserisci un nome di città valido.",
    ];
  }

  if (!HEX_COLOR_PATTERN.test(input.primaryColor)) {
    errors.primaryColor = ["Colore principale non valido."];
  }

  if (!HEX_COLOR_PATTERN.test(input.secondaryColor)) {
    errors.secondaryColor = [
      "Colore secondario non valido.",
    ];
  } else if (input.primaryColor === input.secondaryColor) {
    errors.secondaryColor = [
      "Scegli due colori differenti.",
    ];
  }

  if (!isClubCrestStyle(input.crestStyle)) {
    errors.crestStyle = ["Scegli uno stemma valido."];
  }

  return errors;
}

function readText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

class ClubCreationError extends Error {}

class ClubNameAlreadyUsedError extends Error {}
