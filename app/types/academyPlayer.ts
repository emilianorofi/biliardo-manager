export type AcademyAttributes = {
  precisione: number | null;
  diretto: number | null;
  sponde: number | null;
  tattica: number | null;
  mentalita: number | null;
  difesa: number | null;
  realizzazione: number | null;
  creativita: number | null;
  misura: number | null;
};

export interface AcademyPlayer {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;

  revealedAttributes: number;
  totalAttributes: 9;

  attributes: AcademyAttributes;
}