export type PlayerCategory = "A" | "B" | "C";

export type PlayerForm = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type PlayerMorale = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type PlayerTrait =
  | "Ice Man"
  | "Cecchino"
  | "Stratega"
  | "Leader"
  | "Rimontatore"
  | "Difensore"
  | "Attaccante"
  | "Talento Naturale";

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  category: PlayerCategory;

  precision: number;
  direct: number;
  banks: number;
  tactics: number;
  mentality: number;
  defense: number;
  finishing: number;
  creativity: number;
  touch: number;
  
  experience: number;
  potential: number;

  form: PlayerForm;
  morale: PlayerMorale;

  marketValue: number;
  salary: number;
  contractYears: number;
  overall: number;
  talent: number;
  specialTrait: string;

  trait: PlayerTrait;
}

export interface Club {
  id: string;
  name: string;
  city: string;
  hallName: string;
  reputation: number;
  fans: number;
  balance: number;
  president: string;
  coach: string;
  sponsor: string;
}