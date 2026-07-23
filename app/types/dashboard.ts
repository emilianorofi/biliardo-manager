export type MatchResult = "W" | "D" | "L";

export type NewsType =
  | "Allenamento"
  | "Mercato"
  | "Lega"
  | "Sponsor"
  | "Club";

export type EventType =
  | "Allenamento"
  | "Campionato"
  | "Coppa"
  | "Mercato";

export type TeamDashboardData = {
  name: string;
  division: string;
  season: number;
  matchday: number;
  totalMatchdays: number;
  leaguePosition: number;
  playersCount: number;
  form: number;
  morale: number;
  condition: number;
  chemistry: number;
  lastResults: MatchResult[];
};

export type NextMatchData = {
  competition: string;
  round: string;
  home: string;
  homeCity: string;
  away: string;
  awayCity: string;
  date: string;
  time: string;
  countdown: string;
  venue: string;
};

export type FinancesData = {
  balance: number;
  weekly: number;
  sponsorIncome: number;
  wages: number;
  transferBudget: number;
};

export type DashboardNewsItem = {
  id: number;
  type: NewsType;
  title: string;
  description: string;
  time: string;
};

export type StandingItem = {
  pos: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pts: number;
  isUserTeam?: boolean;
};

export type UpcomingEvent = {
  id: number;
  type: EventType;
  day: string;
  date: string;
  time: string;
  title: string;
  description: string;
};

export type DashboardData = {
  team: TeamDashboardData;
  nextMatch: NextMatchData;
  finances: FinancesData;
  news: DashboardNewsItem[];
  standings: StandingItem[];
  upcomingEvents: UpcomingEvent[];
};