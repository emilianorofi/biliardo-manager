import "server-only";

import { prisma } from "@/lib/prisma";

export type ClubSeasonHonour = {
  seasonNumber: number;
  seasonName: string;
  leagueName: string;
  level: number;
  groupCode: string;
  position: number;
  points: number;
  pointsFor: number;
  pointsAgainst: number;
  champion: boolean;
  promoted: boolean;
};

export type ClubHonours = {
  leagueTitles: number;
  topFlightTitles: number;
  promotions: number;
  bestTopFlightFinish: number | null;
  seasons: ClubSeasonHonour[];
};

export async function getClubHonours(clubId: number): Promise<ClubHonours> {
  const entries = await prisma.leagueEntry.findMany({
    where: { clubId },
    include: {
      league: {
        include: {
          season: true,
          entries: {
            select: {
              clubId: true,
              points: true,
              pointsFor: true,
              pointsAgainst: true,
            },
          },
        },
      },
    },
  });

  const seasons = entries
    .map((entry) => {
      const ordered = [...entry.league.entries].sort(
        (a, b) =>
          b.points - a.points ||
          (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst) ||
          b.pointsFor - a.pointsFor ||
          a.clubId - b.clubId
      );
      const position =
        ordered.findIndex((candidate) => candidate.clubId === clubId) + 1;
      const champion = position === 1;
      const promoted = champion && entry.league.level > 1;

      return {
        seasonNumber: entry.league.season.number,
        seasonName: entry.league.season.name,
        leagueName: entry.league.name,
        level: entry.league.level,
        groupCode: entry.league.groupCode,
        position,
        points: entry.points,
        pointsFor: entry.pointsFor,
        pointsAgainst: entry.pointsAgainst,
        champion,
        promoted,
      };
    })
    .sort((a, b) => b.seasonNumber - a.seasonNumber);

  const completed = seasons.filter((season) => season.points > 0 || season.position > 0);
  const topFlight = completed.filter((season) => season.level === 1);

  return {
    leagueTitles: completed.filter((season) => season.champion).length,
    topFlightTitles: topFlight.filter((season) => season.champion).length,
    promotions: completed.filter((season) => season.promoted).length,
    bestTopFlightFinish:
      topFlight.length === 0
        ? null
        : Math.min(...topFlight.map((season) => season.position)),
    seasons: completed,
  };
}
