export type LeagueGameType =
  | "SINGLES"
  | "DOUBLES";

export type LeagueTrainingUsage = {
  singles: number;
  doubles: number;
  intensity: number;
  label: string;
};

export function calculateLeagueTrainingUsage(
  gameTypes: LeagueGameType[]
): LeagueTrainingUsage {
  const singles = gameTypes.filter(
    (gameType) =>
      gameType === "SINGLES"
  ).length;
  const doubles = gameTypes.filter(
    (gameType) =>
      gameType === "DOUBLES"
  ).length;
  const hasPlayed =
    singles > 0 || doubles > 0;
  const intensity = hasPlayed
    ? Math.min(
        100,
        singles * 40 +
          doubles * 30
      )
    : 15;

  return {
    singles,
    doubles,
    intensity,
    label: getUsageLabel(
      singles,
      doubles
    ),
  };
}

function getUsageLabel(
  singles: number,
  doubles: number
) {
  if (singles === 0 && doubles === 0) {
    return "Panchina";
  }

  const parts: string[] = [];

  if (singles > 0) {
    parts.push(
      singles === 1
        ? "Singolo"
        : `${singles} singoli`
    );
  }

  if (doubles > 0) {
    parts.push(
      doubles === 1
        ? "1 coppia"
        : `${doubles} coppie`
    );
  }

  return parts.join(" + ");
}
