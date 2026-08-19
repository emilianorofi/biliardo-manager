import type {
  PlayerCareerAggregate,
  PlayerCareerAppearance,
  PlayerCareerGameType,
  PlayerCareerResult,
  PlayerCareerSpecialty,
  PlayerCareerView,
} from "@/app/types/playerCareer";

const SPECIALTIES: {
  key: PlayerCareerSpecialty;
  label: string;
}[] = [
  { key: "ITALIANA", label: "Italiana" },
  { key: "GORIZIANA", label: "Goriziana" },
  { key: "TUTTI_DOPPI", label: "Tutti Doppi" },
];

const GAME_TYPES: {
  key: PlayerCareerGameType;
  label: string;
}[] = [
  { key: "SINGLES", label: "Singoli" },
  { key: "DOUBLES", label: "Coppie" },
];

type CareerPerformanceInput = {
  result: string;
  performanceRating: number;
  fixtureGame: {
    order: number;
    specialty: string;
    gameType: string;
  };
};

export type CareerAppearanceInput = {
  id: number;
  playedAt: Date;
  clubName: string;
  opponentClubName: string;
  side: string;
  formationSlot: string;
  teamScore: number;
  opponentScore: number;
  performanceRating: number;
  fixture: {
    round: number;
    league: {
      name: string;
      season: {
        number: number;
        name: string;
      };
    };
  };
  gamePerformances: CareerPerformanceInput[];
};

type NormalizedPerformance = {
  result: PlayerCareerResult;
  performanceRating: number;
  specialty: PlayerCareerSpecialty;
  gameType: PlayerCareerGameType;
};

export function buildPlayerCareerView(
  appearances: CareerAppearanceInput[]
): PlayerCareerView {
  const normalizedAppearances = appearances.map(
    normalizeAppearance
  );
  const performances = normalizedAppearances.flatMap(
    (appearance) => appearance.games
  );
  const normalizedPerformances: NormalizedPerformance[] =
    performances.map((performance) => ({
      result: performance.result,
      performanceRating: performance.performanceRating,
      specialty: performance.specialty,
      gameType: performance.gameType,
    }));

  return {
    summary: {
      appearances: normalizedAppearances.length,
      clubs: new Set(
        normalizedAppearances.map(
          (appearance) => appearance.clubName
        )
      ).size,
      ...buildAggregate(normalizedPerformances),
    },
    specialties: SPECIALTIES.map(({ key, label }) => ({
      key,
      label,
      ...buildAggregate(
        normalizedPerformances.filter(
          (performance) => performance.specialty === key
        )
      ),
    })),
    gameTypes: GAME_TYPES.map(({ key, label }) => ({
      key,
      label,
      ...buildAggregate(
        normalizedPerformances.filter(
          (performance) => performance.gameType === key
        )
      ),
    })),
    seasons: buildSeasonBreakdowns(normalizedAppearances),
    recentAppearances: normalizedAppearances
      .sort(
        (first, second) =>
          new Date(second.playedAt).getTime() -
          new Date(first.playedAt).getTime()
      )
      .slice(0, 6),
  };
}

function normalizeAppearance(
  appearance: CareerAppearanceInput
): PlayerCareerAppearance {
  return {
    id: appearance.id,
    playedAt: appearance.playedAt.toISOString(),
    seasonNumber: appearance.fixture.league.season.number,
    seasonName: appearance.fixture.league.season.name,
    leagueName: appearance.fixture.league.name,
    round: appearance.fixture.round,
    clubName: appearance.clubName,
    opponentClubName: appearance.opponentClubName,
    side: assertSide(appearance.side),
    formationSlot: assertFormationSlot(
      appearance.formationSlot
    ),
    teamScore: appearance.teamScore,
    opponentScore: appearance.opponentScore,
    performanceRating: roundValue(
      appearance.performanceRating
    ),
    games: appearance.gamePerformances
      .map((performance) => ({
        order: performance.fixtureGame.order,
        specialty: assertSpecialty(
          performance.fixtureGame.specialty
        ),
        gameType: assertGameType(
          performance.fixtureGame.gameType
        ),
        result: assertResult(performance.result),
        performanceRating: roundValue(
          performance.performanceRating
        ),
      }))
      .sort((first, second) => first.order - second.order),
  };
}

function buildSeasonBreakdowns(
  appearances: PlayerCareerAppearance[]
) {
  const seasons = new Map<
    number,
    {
      label: string;
      games: PlayerCareerAppearance["games"];
    }
  >();

  for (const appearance of appearances) {
    const season = seasons.get(appearance.seasonNumber) ?? {
      label: appearance.seasonName,
      games: [],
    };

    season.games.push(...appearance.games);
    seasons.set(appearance.seasonNumber, season);
  }

  return Array.from(seasons.entries())
    .sort(
      ([firstSeason], [secondSeason]) =>
        secondSeason - firstSeason
    )
    .map(([seasonNumber, season]) => ({
      key: String(seasonNumber),
      label: season.label,
      ...buildAggregate(season.games),
    }));
}

function buildAggregate(
  performances: {
    result: PlayerCareerResult;
    performanceRating: number;
  }[]
): PlayerCareerAggregate {
  const played = performances.length;
  const wins = performances.filter(
    (performance) => performance.result === "WIN"
  ).length;
  const losses = played - wins;
  const averagePerformance =
    played === 0
      ? 0
      : performances.reduce(
          (total, performance) =>
            total + performance.performanceRating,
          0
        ) / played;

  return {
    played,
    wins,
    losses,
    winRate:
      played === 0 ? 0 : roundValue((wins / played) * 100),
    averagePerformance: roundValue(averagePerformance),
  };
}

function assertSpecialty(value: string): PlayerCareerSpecialty {
  if (
    value === "ITALIANA" ||
    value === "GORIZIANA" ||
    value === "TUTTI_DOPPI"
  ) {
    return value;
  }

  throw new Error(`Specialità carriera non valida: ${value}`);
}

function assertGameType(value: string): PlayerCareerGameType {
  if (value === "SINGLES" || value === "DOUBLES") {
    return value;
  }

  throw new Error(`Tipologia prova non valida: ${value}`);
}

function assertResult(value: string): PlayerCareerResult {
  if (value === "WIN" || value === "LOSS") {
    return value;
  }

  throw new Error(`Risultato carriera non valido: ${value}`);
}

function assertSide(value: string) {
  if (value === "HOME" || value === "AWAY") {
    return value;
  }

  throw new Error(`Lato partita non valido: ${value}`);
}

function assertFormationSlot(value: string) {
  if (value === "A" || value === "B" || value === "C") {
    return value;
  }

  throw new Error(`Slot formazione non valido: ${value}`);
}

function roundValue(value: number) {
  return Math.round(value * 10) / 10;
}
