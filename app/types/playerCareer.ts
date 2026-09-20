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
  clubId: number | null;
  opponentClubName: string;
  opponentClubId: number | null;
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
  fromClubId: number | null;
  toClubName: string | null;
  toClubId: number | null;
  amount: number | null;
};

export type PlayerCareerTournament = {
  id: number;
  tournamentId: number;
  seasonNumber: number;
  seasonName: string;
  leagueRound: number;
  name: string;
  type: string;
  specialty: string;
  completedAt: string;
  placement: string;
  winner: boolean;
  rankingAtDraw: number;
  overallAtDraw: number;
};

export type PlayerCareerNationsCup = {
  id: number;
  tournamentId: number;
  seasonName: string;
  nationCode: string;
  nationName: string;
  groupCode: string;
  placement: string;
  champion: boolean;
  played: number;
  won: number;
  drawn: number;
  lost: number;
};

export type PlayerCareerSpecialtyCup = {
  id: string;
  tournamentId: number;
  seasonName: string;
  cupName: string;
  specialty: string;
  placement: string;
  champion: boolean;
};

export type PlayerCareerHonours = {
  totalTitles: number;
  worldTitles: number;
  individualTitles: number;
  specialtyCupTitles: number;
  nationsCupTitles: number;
  finals: number;
  bestPlacement: string;
  seasonsWithTitle: number;
};

export type PlayerCareerHonoursSeason = {
  key: string;
  label: string;
  titles: number;
  finals: number;
  achievements: string[];
};

export type PlayerCareerView = {
  summary: PlayerCareerAggregate & {
    appearances: number;
    clubs: number;
  };
  honours: PlayerCareerHonours;
  honoursBySeason: PlayerCareerHonoursSeason[];
  specialties: PlayerCareerBreakdown[];
  gameTypes: PlayerCareerBreakdown[];
  seasons: PlayerCareerBreakdown[];
  recentAppearances: PlayerCareerAppearance[];
  tournaments: PlayerCareerTournament[];
  nationsCups: PlayerCareerNationsCup[];
  specialtyCups: PlayerCareerSpecialtyCup[];
  transfers: PlayerCareerTransfer[];
};
