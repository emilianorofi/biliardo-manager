import { WORLD_NATIONALITY_ALLOCATION } from "@/lib/world-structure";

export function getNationalityDisplay(value: string) {
  const trimmed = value.trim();
  const normalized = trimmed.toLocaleLowerCase("it-IT");
  const nationality = WORLD_NATIONALITY_ALLOCATION.find(
    (candidate) =>
      candidate.flag === trimmed ||
      candidate.country.toLocaleLowerCase("it-IT") === normalized
  );

  if (!nationality) {
    return {
      flag: "🏳️",
      label: trimmed || "Nazionalità non disponibile",
    };
  }

  return {
    flag: nationality.flag,
    label: nationality.country,
  };
}
