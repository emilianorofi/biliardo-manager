type LeagueExperienceInput = {
  singles: number;
  doubles: number;
  wasOnBench: boolean;
};

export function calculateLeagueExperienceGain({
  singles,
  doubles,
  wasOnBench,
}: LeagueExperienceInput) {
  if (
    singles === 0 &&
    doubles === 0
  ) {
    return wasOnBench ? 0.03 : 0;
  }

  return roundToThreeDecimals(
    singles * 0.14 +
      doubles * 0.08
  );
}

export function applyExperienceGain(
  currentExperience: number,
  gain: number
) {
  return roundToThreeDecimals(
    Math.min(
      100,
      Math.max(
        0,
        currentExperience + gain
      )
    )
  );
}

function roundToThreeDecimals(
  value: number
) {
  return Math.round(value * 1000) / 1000;
}
