export type AcademyAttributeEstimate = {
  minimum: number;
  maximum: number;
};

export type AcademyAttributeValue =
  | number
  | AcademyAttributeEstimate
  | null;

export type AcademyAttributes = {
  precisione: AcademyAttributeValue;
  diretto: AcademyAttributeValue;
  sponde: AcademyAttributeValue;
  tattica: AcademyAttributeValue;
  mentalita: AcademyAttributeValue;
  difesa: AcademyAttributeValue;
  realizzazione: AcademyAttributeValue;
  creativita: AcademyAttributeValue;
  misura: AcademyAttributeValue;
};

export interface AcademyPlayer {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;

  estimatedAttributes: number;
  revealedAttributes: number;
  totalAttributes: 9;
  nextScoutingAt: string | null;
  decisionRequired: boolean;

  attributes: AcademyAttributes;
}
