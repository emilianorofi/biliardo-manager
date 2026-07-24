export interface Player {
  id: number;

  firstName: string;
  lastName: string;

  nationality: string;

  age: number;

  overall: number;

  form: number;
  morale: number;
  experience: number;

  value: number;
  salary: number;

  image: string;

  style: string[];

  specialties: {
    italiana: number;
    goriziana: number;
    tuttiDoppi: number;
  };

  attributes: {
    precisione: number;
    diretto: number;
    sponde: number;
    tattica: number;
    mentalita: number;
    difesa: number;
    realizzazione: number;
    creativita: number;
    misura: number;
  };
}