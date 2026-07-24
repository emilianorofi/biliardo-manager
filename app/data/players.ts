import { Player } from "../types/player";

export const players: Player[] = [
  {
    id: 1,
    firstName: "Francesco",
    lastName: "Galli",
    nationality: "🇮🇹",
    age: 29,

    overall: 84,
    form: 8,
    morale: 9,
    experience: 72,

    value: 425000,
    salary: 2300,

    image: "/players/galli.png",

    style: ["Leader", "Freddo", "Carismatico"],

    specialties: {
      italiana: 91,
      goriziana: 82,
      tuttiDoppi: 78,
    },

    attributes: {
      precisione: 92,
      diretto: 84,
      sponde: 78,
      tattica: 88,
      mentalita: 82,
      difesa: 65,
      realizzazione: 89,
      creativita: 72,
      misura: 93,
    },
  },

  {
    id: 2,
    firstName: "Pierre",
    lastName: "Martin",
    nationality: "🇫🇷",
    age: 32,

    overall: 79,
    form: 6,
    morale: 7,
    experience: 68,

    value: 330000,
    salary: 1900,

    image: "/players/martin.png",

    style: ["Tecnico"],

    specialties: {
      italiana: 82,
      goriziana: 79,
      tuttiDoppi: 75,
    },

    attributes: {
      precisione: 81,
      diretto: 80,
      sponde: 77,
      tattica: 82,
      mentalita: 75,
      difesa: 70,
      realizzazione: 77,
      creativita: 71,
      misura: 80,
    },
  },

  {
    id: 3,
    firstName: "Carlos",
    lastName: "Lopez",
    nationality: "🇪🇸",
    age: 27,

    overall: 76,
    form: 7,
    morale: 6,
    experience: 55,

    value: 250000,
    salary: 1500,

    image: "/players/lopez.png",

    style: ["Aggressivo"],

    specialties: {
      italiana: 76,
      goriziana: 81,
      tuttiDoppi: 74,
    },

    attributes: {
      precisione: 78,
      diretto: 76,
      sponde: 83,
      tattica: 74,
      mentalita: 72,
      difesa: 67,
      realizzazione: 75,
      creativita: 79,
      misura: 73,
    },
  },
];