import "server-only";

import {
  calculateLeagueCompletion,
} from "@/lib/league-completion";
import {
  simulateFixtureWithPlayers,
  type FixtureCareerFormation,
  type FixtureCareerPlayer,
} from "@/lib/fixture-player-simulator";
import {
  calculateCompletedRound,
} from "@/lib/league-progress";
import {
  validateFixtureRound,
} from "@/lib/league-round";
import {
  calculateFixtureStandingsDeltas,
} from "@/lib/league-standings";
import {
  calculateTeamPerformanceRating,
  getLeagueMatchDefinitions,
  type FormationSlot,
} from "@/lib/match-engine";
import {
  recordPlayerFixtureCareer,
} from "@/lib/player-career-recording";
import { prisma } from "@/lib/prisma";
import {
  completeSeasonIfReady,
} from "@/lib/season-completion";

const CAREER_PLAYER_SELECT = {
  id: true,
  clubId: true,
  firstName: true,
  lastName: true,
  nationality: true,
  age: true,
  form: true,
  morale: true,
  experience: true,
  talent: true,
  precisione: true,
  diretto: true,
  sponde: true,
  tattica: true,
  mentalita: true,
  difesa: true,
  realizzazione: true,
  creativita: true,
  misura: true,
} as const;

type PlayFixtureInput = {
  fixtureId: number;
  requestingClubId?: number;
  now?: Date;
};

type FixtureClub = {
  id: number;
  name: string;
  players: FixtureCareerPlayer[];
  formation: {
    slotAPlayer: FixtureCareerPlayer | null;
    slotBPlayer: FixtureCareerPlayer | null;
    slotCPlayer: FixtureCareerPlayer | null;
  } | null;
};

export class PlayLeagueFixtureError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export async function playLeagueFixture({
  fixtureId,
  requestingClubId,
  now = new Date(),
}: PlayFixtureInput) {
  const fixture = await prisma.leagueFixture.findUnique({
    where: {
      id: fixtureId,
    },
    include: {
      league: {
        select: {
          id: true,
          name: true,
          status: true,
          currentRound: true,
          seasonId: true,
        },
      },
      homeClub: {
        select: {
          id: true,
          name: true,
          players: {
            select: CAREER_PLAYER_SELECT,
          },
          formation: {
            select: {
              slotAPlayer: {
                select: CAREER_PLAYER_SELECT,
              },
              slotBPlayer: {
                select: CAREER_PLAYER_SELECT,
              },
              slotCPlayer: {
                select: CAREER_PLAYER_SELECT,
              },
            },
          },
        },
      },
      awayClub: {
        select: {
          id: true,
          name: true,
          players: {
            select: CAREER_PLAYER_SELECT,
          },
          formation: {
            select: {
              slotAPlayer: {
                select: CAREER_PLAYER_SELECT,
              },
              slotBPlayer: {
                select: CAREER_PLAYER_SELECT,
              },
              slotCPlayer: {
                select: CAREER_PLAYER_SELECT,
              },
            },
          },
        },
      },
    },
  });

  if (!fixture) {
    throw new PlayLeagueFixtureError(
      "L'incontro indicato non esiste.",
      404
    );
  }

  if (
    requestingClubId !== undefined &&
    requestingClubId !== fixture.homeClubId &&
    requestingClubId !== fixture.awayClubId
  ) {
    throw new PlayLeagueFixtureError(
      "Non puoi avviare una partita di un altro club.",
      403
    );
  }

  if (fixture.league.status !== "ACTIVE") {
    throw new PlayLeagueFixtureError(
      "Il campionato non è attivo.",
      409
    );
  }

  if (fixture.status !== "SCHEDULED") {
    throw new PlayLeagueFixtureError(
      "Il risultato di questo incontro è già stato registrato.",
      409
    );
  }

  if (fixture.scheduledAt.getTime() > now.getTime()) {
    throw new PlayLeagueFixtureError(
      "La partita non può essere giocata prima dell'orario previsto.",
      409
    );
  }

  try {
    validateFixtureRound(
      fixture.league.currentRound,
      fixture.round
    );
  } catch (error) {
    throw new PlayLeagueFixtureError(
      error instanceof Error
        ? error.message
        : "La giornata dell'incontro non è valida.",
      409
    );
  }

  const homeFormation = resolveFormation(fixture.homeClub);
  const awayFormation = resolveFormation(fixture.awayClub);
  const simulation = simulateFixtureWithPlayers(
    homeFormation.formation,
    awayFormation.formation
  );
  const standingsDeltas =
    calculateFixtureStandingsDeltas(
      simulation.homeScore,
      simulation.awayScore
    );

  try {
    const settled = await prisma.$transaction(
      async (transaction) => {
        const fixtureUpdate =
          await transaction.leagueFixture.updateMany({
            where: {
              id: fixture.id,
              status: "SCHEDULED",
            },
            data: {
              status: "PLAYED",
              homeScore: simulation.homeScore,
              awayScore: simulation.awayScore,
              playedAt: now,
            },
          });

        if (fixtureUpdate.count !== 1) {
          throw new Error("RESULT_ALREADY_RECORDED");
        }

        const homeEntry = await transaction.leagueEntry.update({
          where: {
            leagueId_clubId: {
              leagueId: fixture.leagueId,
              clubId: fixture.homeClubId,
            },
          },
          data: createStandingsUpdate(standingsDeltas.home),
        });
        const awayEntry = await transaction.leagueEntry.update({
          where: {
            leagueId_clubId: {
              leagueId: fixture.leagueId,
              clubId: fixture.awayClubId,
            },
          },
          data: createStandingsUpdate(standingsDeltas.away),
        });
        const history = await recordPlayerFixtureCareer(
          transaction,
          {
            fixtureId: fixture.id,
            playedAt: now,
            homeClub: fixture.homeClub,
            awayClub: fixture.awayClub,
            homeFormation: homeFormation.formation,
            awayFormation: awayFormation.formation,
            simulation,
          }
        );
        const leagueFixtures =
          await transaction.leagueFixture.findMany({
            where: {
              leagueId: fixture.leagueId,
            },
            select: {
              round: true,
              status: true,
            },
            orderBy: [
              { round: "asc" },
              { id: "asc" },
            ],
          });
        const completedRound =
          calculateCompletedRound(leagueFixtures);
        const totalRounds = leagueFixtures.reduce(
          (highestRound, leagueFixture) =>
            Math.max(highestRound, leagueFixture.round),
          0
        );
        const completion = calculateLeagueCompletion(
          completedRound,
          totalRounds
        );
        const updatedLeague = await transaction.league.update({
          where: {
            id: fixture.leagueId,
          },
          data: {
            currentRound: completion.completedRound,
            status: completion.status,
          },
        });
        const seasonCompletion = completion.isCompleted
          ? await completeSeasonIfReady(
              transaction,
              fixture.league.seasonId,
              { now }
            )
          : null;

        await transaction.gameEvent.create({
          data: {
            clubId: null,
            type: "Campionato",
            title: `${fixture.homeClub.name} ${simulation.homeScore}-${simulation.awayScore} ${fixture.awayClub.name}`,
            description: `Giornata ${fixture.round} di ${fixture.league.name}.`,
            createdAt: now,
          },
        });

        return {
          homeEntry,
          awayEntry,
          history,
          completion,
          updatedLeague,
          seasonCompletion,
        };
      },
      {
        maxWait: 15000,
        timeout: 60000,
      }
    );

    return {
      fixture: {
        id: fixture.id,
        round: fixture.round,
        playedAt: now,
        homeClub: {
          id: fixture.homeClub.id,
          name: fixture.homeClub.name,
          formationSource: homeFormation.source,
        },
        awayClub: {
          id: fixture.awayClub.id,
          name: fixture.awayClub.name,
          formationSource: awayFormation.source,
        },
        homeScore: simulation.homeScore,
        awayScore: simulation.awayScore,
      },
      games: simulation.games.map((game) => ({
        order: game.order,
        specialty: game.specialty,
        gameType: game.gameType,
        targetPoints: game.targetPoints,
        homeSlots: game.homeSlots,
        awaySlots: game.awaySlots,
        homePoints: game.homePoints,
        awayPoints: game.awayPoints,
        homePerformanceRating:
          game.homePerformanceRating,
        awayPerformanceRating:
          game.awayPerformanceRating,
        result: game.result,
        participants: game.participants.map(
          (participant) => ({
            side: participant.side,
            slot: participant.slot,
            player: {
              id: participant.player.id,
              firstName: participant.player.firstName,
              lastName: participant.player.lastName,
            },
            result: participant.result,
            performance: participant.performance,
          })
        ),
      })),
      history: settled.history,
      standings: {
        home: settled.homeEntry,
        away: settled.awayEntry,
      },
      league: {
        id: settled.updatedLeague.id,
        status: settled.updatedLeague.status,
        currentRound: settled.updatedLeague.currentRound,
        totalRounds: settled.completion.totalRounds,
        isCompleted: settled.completion.isCompleted,
      },
      season: settled.seasonCompletion,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "RESULT_ALREADY_RECORDED"
    ) {
      throw new PlayLeagueFixtureError(
        "Il risultato di questo incontro è già stato registrato.",
        409
      );
    }

    throw error;
  }
}

function resolveFormation(club: FixtureClub) {
  const savedFormation = club.formation;

  if (
    savedFormation?.slotAPlayer &&
    savedFormation.slotBPlayer &&
    savedFormation.slotCPlayer &&
    savedFormation.slotAPlayer.clubId === club.id &&
    savedFormation.slotBPlayer.clubId === club.id &&
    savedFormation.slotCPlayer.clubId === club.id
  ) {
    return {
      source: "SAVED" as const,
      formation: {
        A: savedFormation.slotAPlayer,
        B: savedFormation.slotBPlayer,
        C: savedFormation.slotCPlayer,
      },
    };
  }

  if (club.players.length < 3) {
    throw new PlayLeagueFixtureError(
      `${club.name} non ha almeno tre giocatori disponibili.`,
      409
    );
  }

  return {
    source: "AUTOMATIC" as const,
    formation: findBestAutomaticFormation(club.players),
  };
}

function findBestAutomaticFormation(
  players: FixtureCareerPlayer[]
): FixtureCareerFormation {
  let bestFormation: FixtureCareerFormation | null = null;
  let bestRating = Number.NEGATIVE_INFINITY;

  for (const playerA of players) {
    for (const playerB of players) {
      if (playerB.id === playerA.id) continue;

      for (const playerC of players) {
        if (
          playerC.id === playerA.id ||
          playerC.id === playerB.id
        ) {
          continue;
        }

        const formation = {
          A: playerA,
          B: playerB,
          C: playerC,
        };
        const rating = rateFormation(formation);

        if (rating > bestRating) {
          bestRating = rating;
          bestFormation = formation;
        }
      }
    }
  }

  if (!bestFormation) {
    throw new PlayLeagueFixtureError(
      "Non è stato possibile creare la formazione automatica.",
      409
    );
  }

  return bestFormation;
}

function rateFormation(formation: FixtureCareerFormation) {
  return getLeagueMatchDefinitions().reduce(
    (total, match) => {
      const players = match.homeSlots.map(
        (slot: FormationSlot) => formation[slot]
      );

      return (
        total +
        calculateTeamPerformanceRating(
          players,
          match.specialty
        )
      );
    },
    0
  );
}

function createStandingsUpdate(delta: {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  points: number;
}) {
  return {
    played: { increment: delta.played },
    won: { increment: delta.won },
    drawn: { increment: delta.drawn },
    lost: { increment: delta.lost },
    pointsFor: { increment: delta.pointsFor },
    pointsAgainst: { increment: delta.pointsAgainst },
    points: { increment: delta.points },
  };
}
