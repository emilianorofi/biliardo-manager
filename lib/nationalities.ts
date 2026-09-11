import { WORLD_NATIONALITY_ALLOCATION } from "@/lib/world-structure";

export function getNationalityDisplay(value: string) {
  const trimmed = value.trim();
  const normalized = trimmed.toLocaleLowerCase("it-IT");
  const nationality = WORLD_NATIONALITY_ALLOCATION.find(
    (candidate) =>
      candidate.flag === trimmed ||
      candidate.code.toLocaleLowerCase("it-IT") === normalized ||
      candidate.country.toLocaleLowerCase("it-IT") === normalized
  );

  if (!nationality) {
    return {
      code: /^[a-z]{3}$/i.test(trimmed)
        ? trimmed.toLocaleUpperCase("it-IT")
        : "---",
      flag: "🏳️",
      label: trimmed || "Nazionalità non disponibile",
    };
  }

  return {
    code: nationality.code,
    flag: nationality.flag,
    label: nationality.country,
  };
}
