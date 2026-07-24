import type { Match } from "../types/match";
import { clubs } from "./clubs";

const homeClub = clubs[0];
const awayClub = clubs[1];

if (!homeClub || !awayClub) {
  throw new Error(
    "Servono almeno due club per creare la prossima partita."
  );
}

export const nextMatch: Match = {
  id: 1,
  competition: "Campionato",
  round: 5,

  date: "Domani",
  time: "21:00",

  homeClub,
  awayClub,

  venue: "Sala Biliardi Master",

  preparation: 82,
  morale: "Ottimo",
  form: 8.6,
  fitness: 91,
  absences: 1,
};