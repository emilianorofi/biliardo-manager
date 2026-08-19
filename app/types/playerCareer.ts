export type PlayerCareerSpecialty =
  | "ITALIANA"
  | "GORIZIANA"
  | "TUTTI_DOPPI";

export type PlayerCareerGameType =
  | "SINGLES"
  | "DOUBLES";

export type PlayerCareerResult = "WIN" | "LOSS";

export type PlayerCareerTransferType =
  | "AUCTION"
  | "FREE_AGENT";

export type PlayerCareerAggregate = {
  played: number;
  wins: number;
  losses: number;
  winRate: number;
  averagePerformance: number;
};

export type PlayerCareerBreakdown =
  PlayerCareerAggregate & {
    key: string;
    label: string;
  };

export type PlayerCareerGame = {
  order: number;
  specialty: PlayerCareerSpecialty;
  gameType: PlayerCareerGameType;
  result: PlayerCareerResult;
  performanceRating: number;
};

export type PlayerCareerAppearance = {
  id: number;
  playedAt: string;
  seasonNumber: number;
  seasonName: string;
  leagueName: string;
  round: number;
  clubName: string;
  opponentClubName: string;
  side: "HOME" | "AWAY";
  formationSlot: "A" | "B" | "C";
  teamScore: number;
  opponentScore: number;
  performanceRating: number;
  games: PlayerCareerGame[];
};

export type PlayerCareerTransfer = {
  id: number;
  completedAt: string;
  type: PlayerCareerTransferType;
  fromClubName: string | null;
  toClubName: string | null;
  amount: number | null;
};

export type PlayerCareerView = {
  summary: PlayerCareerAggregate & {
    appearances: number;
    clubs: number;
  };
  specialties: PlayerCareerBreakdown[];
  gameTypes: PlayerCareerBreakdown[];
  seasons: PlayerCareerBreakdown[];
  recentAppearances: PlayerCareerAppearance[];
  transfers: PlayerCareerTransfer[];
};
