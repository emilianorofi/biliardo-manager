import type { AcademyPlayer } from "@/app/types/academyPlayer";

export const academyPlayers: AcademyPlayer[] = [
  {
    id: 1,
    firstName: "Lorenzo",
    lastName: "Benedetti",
    age: 16,
    nationality: "🇮🇹",

    estimatedAttributes: 6,
    revealedAttributes: 0,
    totalAttributes: 9,
    nextScoutingAt: null,

    attributes: {
      precisione: { minimum: 43, maximum: 59 },
      diretto: { minimum: 42, maximum: 58 },
      sponde: { minimum: 45, maximum: 61 },
      tattica: { minimum: 41, maximum: 57 },
      mentalita: { minimum: 44, maximum: 60 },
      difesa: { minimum: 39, maximum: 55 },
      realizzazione: null,
      creativita: null,
      misura: null,
    },
  },
  {
    id: 2,
    firstName: "Matteo",
    lastName: "Morelli",
    age: 15,
    nationality: "🇮🇹",

    estimatedAttributes: 4,
    revealedAttributes: 0,
    totalAttributes: 9,
    nextScoutingAt: null,

    attributes: {
      precisione: { minimum: 38, maximum: 54 },
      diretto: null,
      sponde: { minimum: 37, maximum: 53 },
      tattica: { minimum: 36, maximum: 52 },
      mentalita: null,
      difesa: null,
      realizzazione: null,
      creativita: { minimum: 42, maximum: 58 },
      misura: null,
    },
  },
  {
    id: 3,
    firstName: "Tommaso",
    lastName: "Ferri",
    age: 14,
    nationality: "🇮🇹",

    estimatedAttributes: 2,
    revealedAttributes: 0,
    totalAttributes: 9,
    nextScoutingAt: null,

    attributes: {
      precisione: null,
      diretto: { minimum: 32, maximum: 48 },
      sponde: null,
      tattica: null,
      mentalita: null,
      difesa: null,
      realizzazione: null,
      creativita: null,
      misura: { minimum: 30, maximum: 46 },
    },
  },
];
