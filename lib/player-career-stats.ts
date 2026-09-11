import type {
  PlayerCareerAggregate,
  PlayerCareerAppearance,
  PlayerCareerGameType,
  PlayerCareerResult,
  PlayerCareerSpecialty,
  PlayerCareerTransfer,
  PlayerCareerTransferType,
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
  clubId?: number | null;
  clubName: string;
  opponentClubName: string;
  side: string;
  formationSlot: string;
  teamScore: number;
  opponentScore: number;
  performanceRating: number;
  fixture: {
    round: number;
    homeClubId?: number;
    awayClubId?: number;
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

export type CareerTransferInput = {
  id: number;
  status: string;
  listingType: string;
  finalPrice: number | null;
  completedAt: Date | null;
  sellerClub: {
    id?: number;
    name: string;
  } | null;
  winnerClub: {
    id?: number;
    name: string;
  } | null;
};

type NormalizedPerformance = {
  result: PlayerCareerResult;
  performanceRating: number;
  specialty: PlayerCareerSpecialty;
  gameType: PlayerCareerGameType;
};

export function buildPlayerCareerView(
  appearances: CareerAppearanceInput[],
  transferListings: CareerTransferInput[] = []
): PlayerCareerView {
  const normalizedAppearances = appearances.map(
    normalizeAppearance
  );
  const transfers = transferListings
    .filter(
      (listing) =>
        listing.status === "COMPLETED" &&
        listing.completedAt !== null
    )
    .map(normalizeTransfer)
    .sort(
      (first, second) =>
        new Date(second.completedAt).getTime() -
        new Date(first.completedAt).getTime()
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
      clubs: countCareerClubs(
        normalizedAppearances,
        transfers
      ),
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
    transfers,
  };
}

function normalizeTransfer(
  listing: CareerTransferInput
): PlayerCareerTransfer {
  if (!listing.completedAt) {
    throw new Error(
      "Un trasferimento completato deve avere una data."
    );
  }

  return {
    id: listing.id,
    completedAt: listing.completedAt.toISOString(),
    type: assertTransferType(listing.listingType),
    fromClubName: listing.sellerClub?.name ?? null,
    fromClubId: listing.sellerClub?.id ?? null,
    toClubName: listing.winnerClub?.name ?? null,
    toClubId: listing.winnerClub?.id ?? null,
    amount: listing.finalPrice,
  };
}

function countCareerClubs(
  appearances: PlayerCareerAppearance[],
  transfers: PlayerCareerTransfer[]
) {
  const clubNames = new Set<string>();

  for (const appearance of appearances) {
    clubNames.add(appearance.clubName);
  }

  for (const transfer of transfers) {
    if (transfer.fromClubName) {
      clubNames.add(transfer.fromClubName);
    }

    if (transfer.toClubName) {
      clubNames.add(transfer.toClubName);
    }
  }

  return clubNames.size;
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
    clubId: appearance.clubId ?? null,
    opponentClubName: appearance.opponentClubName,
    opponentClubId:
      appearance.side === "HOME"
        ? appearance.fixture.awayClubId ?? null
        : appearance.fixture.homeClubId ?? null,
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

function assertTransferType(
  value: string
): PlayerCareerTransferType {
  if (value === "AUCTION" || value === "FREE_AGENT") {
    return value;
  }

  throw new Error(`Tipologia trasferimento non valida: ${value}`);
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
