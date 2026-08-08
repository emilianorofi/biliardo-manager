export const STARTING_BALANCE = 10_000;

export const CLUB_NAME_MIN_LENGTH = 3;
export const CLUB_NAME_MAX_LENGTH = 36;
export const CLUB_CITY_MIN_LENGTH = 2;
export const CLUB_CITY_MAX_LENGTH = 40;

export const CLUB_NAME_PATTERN = /^[\p{L}\p{N} .'-]+$/u;
export const CLUB_CITY_PATTERN = /^[\p{L} .'-]+$/u;
export const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/;

export const CLUB_CREST_STYLES = [
  "CLASSIC",
  "DIAMOND",
  "CROWN",
  "STAR",
  "PINS",
] as const;

export type ClubCrestStyle =
  (typeof CLUB_CREST_STYLES)[number];

export function normalizeIdentityText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeClubName(value: string) {
  return normalizeIdentityText(value).toLocaleLowerCase(
    "it-IT"
  );
}

export function isClubCrestStyle(
  value: string
): value is ClubCrestStyle {
  return CLUB_CREST_STYLES.includes(
    value as ClubCrestStyle
  );
}

export function createClubShortName(name: string) {
  const words = normalizeIdentityText(name)
    .split(" ")
    .filter(Boolean);

  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((word) => word.charAt(0))
      .join("")
      .toLocaleUpperCase("it-IT");
  }

  return words[0]
    .replace(/[^\p{L}\p{N}]/gu, "")
    .slice(0, 3)
    .toLocaleUpperCase("it-IT");
}
