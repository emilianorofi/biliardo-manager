import "server-only";

import {
  getSpecialtyCupAssignment,
  type SpecialtyCupType,
} from "@/lib/specialty-cup-assignment";
import { drawSpecialtyCupBracket } from "@/lib/specialty-cup-bracket";
import { buildSpecialtyCupCalendar } from "@/lib/specialty-cup-calendar";
import { prisma } from "@/lib/prisma";

const SPECIALTY_CUP_TRANSACTION_TIMEOUT = 120000;

const CUP_NAMES: Record<SpecialtyCupType, string> = {
  ITALIANA: "Coppa Italiana",
  GORIZIANA: "Coppa Goriziana",
  TUTTI_DOPPI: "Coppa Tutti Doppi",
};

type SpecialtyCupPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  nationality: string;
  precisione: number;
  diretto: number;
  sponde: number;
};

type PersistedDrawSlot = {
  position: number;
  playerId: number;
  firstName: string;
  lastName: string;
  nationality: string;
  bye: boolean;
};

type PersistedCupDraw = {
  type: SpecialtyCupType;
  name: string;
  entrants: number;
  bracketSize: number;
  byes: number;
  firstRoundMatches: number;
  slots: PersistedDrawSlot[];
};

export type SpecialtyCupDrawPayload = {
  seasonId: number;
  drawnAt: string;
  cups: Record<SpecialtyCupType, PersistedCupDraw>;
};

export async function initializeSpecialtyCup() {
  const referenceLeague = await prisma.league.findFirst({
    where: {
      level: 1,
      groupCode: "A",
      season: {
        status: { in: ["PREPARATION", "ACTIVE"] },
      },
    },
    orderBy: { season: { number: "desc" } },
    select: {
      seasonId: true,
      fixtures: {
        orderBy: [{ round: "asc" }, { id: "asc" }],
        select: { round: true, scheduledAt: true },
      },
    },
  });

  if (!referenceLeague) return 0;

  const roundDates = new Map<number, Date>();
  for (const fixture of referenceLeague.fixtures) {
    if (!roundDates.has(fixture.round)) {
      roundDates.set(fixture.round, fixture.scheduledAt);
    }
  }

  const calendar = buildSpecialtyCupCalendar(roundDates);

  return prisma.$executeRaw`
    INSERT INTO "SpecialtyCupTournament"
      ("seasonId", "leagueRound", "status", "drawAt", "createdAt", "updatedAt")
    VALUES
      (${referenceLeague.seasonId}, ${calendar.seasonWeek}, 'SCHEDULED', ${calendar.drawAt}, NOW(), NOW())
    ON CONFLICT ("seasonId") DO NOTHING
  `;
}

export async function drawSpecialtyCup(
  tournamentId: number,
  scheduledAt: Date
) {
  return prisma.$transaction(
    async (transaction) => {
      await transaction.$queryRaw`
        SELECT "id"
        FROM "SpecialtyCupTournament"
        WHERE "id" = ${tournamentId}
        FOR UPDATE
      `;

      const rows = await transaction.$queryRaw<
        Array<{
          id: number;
          seasonId: number;
          status: string;
          drawAt: Date;
          payload: unknown | null;
        }>
      >`
        SELECT "id", "seasonId", "status", "drawAt", "payload"
        FROM "SpecialtyCupTournament"
        WHERE "id" = ${tournamentId}
        LIMIT 1
      `;

      const tournament = rows[0];
      if (
        !tournament ||
        tournament.status !== "SCHEDULED" ||
        tournament.payload !== null ||
        tournament.drawAt.getTime() !== scheduledAt.getTime()
      ) {
        return {
          status: "SKIPPED" as const,
          participants: 0,
          cups: 0,
        };
      }

      const players = await transaction.player.findMany({
        where: {
          careerStatus: "ACTIVE",
          clubId: { not: null },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nationality: true,
          precisione: true,
          diretto: true,
          sponde: true,
        },
      });

      const grouped: Record<SpecialtyCupType, SpecialtyCupPlayer[]> = {
        ITALIANA: [],
        GORIZIANA: [],
        TUTTI_DOPPI: [],
      };

      for (const player of players) {
        const assignment = getSpecialtyCupAssignment({
          id: player.id,
          specialties: {
            italiana: (player.precisione + player.diretto) / 2,
            goriziana: (player.precisione + player.sponde) / 2,
            tuttiDoppi: (player.diretto + player.sponde) / 2,
          },
          attributes: {
            precisione: player.precisione,
            diretto: player.diretto,
            sponde: player.sponde,
          },
        });

        grouped[assignment].push(player);
      }

      const cupTypes: SpecialtyCupType[] = [
        "ITALIANA",
        "GORIZIANA",
        "TUTTI_DOPPI",
      ];

      for (const cupType of cupTypes) {
        if (grouped[cupType].length < 2) {
          throw new Error(`SPECIALTY_CUP_${cupType}_PLAYERS_INCOMPLETE`);
        }
      }

      const cups = {} as Record<SpecialtyCupType, PersistedCupDraw>;

      for (const cupType of cupTypes) {
        const draw = drawSpecialtyCupBracket(grouped[cupType]);
        cups[cupType] = {
          type: cupType,
          name: CUP_NAMES[cupType],
          entrants: draw.plan.entrants,
          bracketSize: draw.plan.bracketSize,
          byes: draw.plan.byes,
          firstRoundMatches: draw.plan.firstRoundMatches,
          slots: draw.slots.map((slot) => ({
            position: slot.position,
            playerId: slot.player.id,
            firstName: slot.player.firstName,
            lastName: slot.player.lastName,
            nationality: slot.player.nationality,
            bye: slot.bye,
          })),
        };
      }

      const payload: SpecialtyCupDrawPayload = {
        seasonId: tournament.seasonId,
        drawnAt: scheduledAt.toISOString(),
        cups,
      };
      const serializedPayload = JSON.stringify(payload);

      await transaction.$executeRaw`
        UPDATE "SpecialtyCupTournament"
        SET
          "status" = 'DRAWN',
          "drawnAt" = ${scheduledAt},
          "payload" = CAST(${serializedPayload} AS jsonb),
          "updatedAt" = NOW()
        WHERE "id" = ${tournament.id}
      `;

      await transaction.gameEvent.create({
        data: {
          clubId: null,
          type: "Coppa Specialità",
          title: "Sorteggio Coppa Specialità",
          description:
            "Pubblicati i tabelloni di Coppa Italiana, Coppa Goriziana e Coppa Tutti Doppi con bye assegnati casualmente.",
          createdAt: scheduledAt,
        },
      });

      return {
        status: "PROCESSED" as const,
        participants: players.length,
        cups: cupTypes.length,
        breakdown: {
          italiana: cups.ITALIANA.entrants,
          goriziana: cups.GORIZIANA.entrants,
          tuttiDoppi: cups.TUTTI_DOPPI.entrants,
        },
      };
    },
    {
      isolationLevel: "Serializable",
      timeout: SPECIALTY_CUP_TRANSACTION_TIMEOUT,
    }
  );
}
