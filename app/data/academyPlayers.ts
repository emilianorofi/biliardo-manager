import type { AcademyPlayer } from "@/app/types/academyPlayer";

export const academyPlayers: AcademyPlayer[] = [
  {
    id: 1,
    firstName: "Lorenzo",
    lastName: "Benedetti",
    age: 16,
    nationality: "🇮🇹",

    revealedAttributes: 6,
    totalAttributes: 9,

    attributes: {
      precisione: 78,
      diretto: 74,
      sponde: 81,
      tattica: 72,
      mentalita: 76,
      difesa: 70,
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

    revealedAttributes: 4,
    totalAttributes: 9,

    attributes: {
      precisione: 71,
      diretto: null,
      sponde: 76,
      tattica: 69,
      mentalita: null,
      difesa: null,
      realizzazione: null,
      creativita: 75,
      misura: null,
    },
  },
  {
    id: 3,
    firstName: "Tommaso",
    lastName: "Ferri",
    age: 14,
    nationality: "🇮🇹",

    revealedAttributes: 2,
    totalAttributes: 9,

    attributes: {
      precisione: null,
      diretto: 68,
      sponde: null,
      tattica: null,
      mentalita: null,
      difesa: null,
      realizzazione: null,
      creativita: null,
      misura: 73,
    },
  },
];