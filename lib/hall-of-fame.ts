import "server-only";

import { prisma } from "@/lib/prisma";

export type HallOfFameSeason = {
  seasonNumber: number;
  seasonName: string;
  leagueChampion: { clubId: number; clubName: string } | null;
  individualChampions: Array<{
    tournamentId: number;
    name: string;
    type: string;
    specialty: string;
    playerId: number;
    playerName: string;
  }>;
  nationsCupChampion: string | null;
  specialtyCupChampions: Array<{
    name: string;
    playerId: number;
    playerName: string;
  }>;
};

export async function getHallOfFame(): Promise<HallOfFameSeason[]> {
  const [seasons, specialtyRows] = await Promise.all([
    prisma.season.findMany({
      orderBy: { number: "desc" },
      include: {
        leagues: {
          where: { level: 1, groupCode: "A" },
          include: {
            entries: {
              include: { club: { select: { id: true, name: true } } },
            },
          },
        },
        individualTournaments: {
          where: { championPlayerId: { not: null } },
          orderBy: { leagueRound: "asc" },
          include: {
            championPlayer: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        nationsCup: {
          select: { championCode: true },
        },
      },
    }),
    prisma.$queryRaw<Array<{ seasonId: number; payload: unknown }>>`
      SELECT "seasonId", "payload"
      FROM "SpecialtyCupTournament"
      WHERE "payload" IS NOT NULL
    `,
  ]);

  const specialtyBySeason = new Map<number, Array<{ name: string; playerId: number }>>();
  const championIds = new Set<number>();

  for (const row of specialtyRows) {
    if (!row.payload || typeof row.payload !== "object") continue;
    const payload = row.payload as {
      cups?: Record<string, {
        name?: string;
        championPlayerId?: number | null;
      }>;
    };
    const champions = Object.values(payload.cups ?? {}).flatMap((cup) =>
      Number.isInteger(cup.championPlayerId)
        ? [{ name: cup.name ?? "Coppa Specialità", playerId: cup.championPlayerId! }]
        : []
    );
    specialtyBySeason.set(row.seasonId, champions);
    for (const champion of champions) championIds.add(champion.playerId);
  }

  const specialtyPlayers =
    championIds.size === 0
      ? []
      : await prisma.player.findMany({
          where: { id: { in: [...championIds] } },
          select: { id: true, firstName: true, lastName: true },
        });
  const playerNames = new Map(
    specialtyPlayers.map((player) => [
      player.id,
      `${player.firstName} ${player.lastName}`,
    ])
  );

  return seasons.map((season) => {
    const league = season.leagues[0];
    const leagueChampion = league
      ? [...league.entries].sort(
          (a, b) =>
            b.points - a.points ||
            (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst) ||
            b.pointsFor - a.pointsFor ||
            a.clubId - b.clubId
        )[0]
      : null;

    return {
      seasonNumber: season.number,
      seasonName: season.name,
      leagueChampion: leagueChampion
        ? { clubId: leagueChampion.club.id, clubName: leagueChampion.club.name }
        : null,
      individualChampions: season.individualTournaments.flatMap((tournament) =>
        tournament.championPlayer
          ? [{
              tournamentId: tournament.id,
              name: tournament.name,
              type: tournament.type,
              specialty: tournament.specialty,
              playerId: tournament.championPlayer.id,
              playerName: `${tournament.championPlayer.firstName} ${tournament.championPlayer.lastName}`,
            }]
          : []
      ),
      nationsCupChampion: season.nationsCup?.championCode ?? null,
      specialtyCupChampions: (specialtyBySeason.get(season.id) ?? []).map(
        (champion) => ({
          ...champion,
          playerName: playerNames.get(champion.playerId) ?? `Giocatore #${champion.playerId}`,
        })
      ),
    };
  });
}
