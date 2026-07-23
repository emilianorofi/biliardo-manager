import { Player } from "./player";

export interface Club {
  id: number;

  name: string;

  shortName: string;

  logo: string;

  city: string;

  country: string;

  reputation: number;

  fans: number;

  balance: number;

  weeklyExpenses: number;

  weeklyIncome: number;

  trainerLevel: 1 | 2 | 3 | 4 | 5;

  youthCoachLevel: 1 | 2 | 3 | 4 | 5;

  players: Player[];

  createdAt: string;
}