import assert from "node:assert/strict";
import test from "node:test";

import {
  applyWeeklyDevelopment,
  calculateWeeklyAgeDecline,
  getWeeklyDeclineBase,
} from "../lib/player-development";
import {
  TRAINING_SKILLS,
  calculateOverall,
  calculateTrainingGain,
  getAgeMultiplier,
  type TrainingPlayerValues,
} from "../lib/training-engine";

test("usa fasce di crescita brevi e il calo concordato", () => {
  assert.equal(getAgeMultiplier(18), 1.45);
  assert.equal(getAgeMultiplier(28), 1.06);
  assert.equal(getAgeMultiplier(45), 0.55);
  assert.equal(getAgeMultiplier(46), 0.43);
  assert.equal(getAgeMultiplier(64), 0.02);
  assert.equal(getAgeMultiplier(67), 0.005);

  assert.equal(getWeeklyDeclineBase(40), 0);
  assert.equal(getWeeklyDeclineBase(45), 0.0075);
  assert.equal(getWeeklyDeclineBase(46), 0.033);
  assert.equal(getWeeklyDeclineBase(80), 0.185);
});

test("talento alto rallenta leggermente il calo", () => {
  const common = {
    age: 70,
    currentValue: 90,
  };

  assert.ok(
    calculateWeeklyAgeDecline({
      ...common,
      talent: 20,
    }) >
      calculateWeeklyAgeDecline({
        ...common,
        talent: 80,
      })
  );
});

test("la carriera equilibrata raggiunge il picco entro i 45 anni", () => {
  const result = simulateCareer({
    startAge: 17,
    endAge: 80,
    startOverall: 52,
    talent: 50,
    trainerEfficiency: 80,
  });

  assert.equal(result.peakAge, 45);
  assert.ok(
    result.peakOverall >= 81 &&
      result.peakOverall <= 83
  );
});

test("un overall 90 a 50 anni arriva vicino a 58 a 80 anni", () => {
  const result = simulateCareer({
    startAge: 51,
    endAge: 80,
    startOverall: 90,
    talent: 50,
    trainerEfficiency: 80,
  });

  assert.ok(
    result.finalOverall >= 58 &&
      result.finalOverall <= 59.5
  );
});

function simulateCareer({
  startAge,
  endAge,
  startOverall,
  talent,
  trainerEfficiency,
}: {
  startAge: number;
  endAge: number;
  startOverall: number;
  talent: number;
  trainerEfficiency: number;
}) {
  let values = createValues(
    startOverall
  );
  let peakAge = startAge - 1;
  let peakOverall =
    calculateOverall(values);
  let sessionIndex = 0;

  for (
    let age = startAge;
    age <= endAge;
    age += 1
  ) {
    for (
      let week = 0;
      week < 14;
      week += 1
    ) {
      const primary =
        TRAINING_SKILLS[
          sessionIndex %
            TRAINING_SKILLS.length
        ];
      const secondary =
        TRAINING_SKILLS[
          (sessionIndex + 3) %
            TRAINING_SKILLS.length
        ];
      const primaryGain =
        calculateTrainingGain({
          age,
          talent,
          currentValue:
            values[primary],
          intensity: 100,
          trainerEfficiency,
          focusWeight: 1,
        });
      const secondaryGain =
        calculateTrainingGain({
          age,
          talent,
          currentValue:
            values[secondary],
          intensity: 100,
          trainerEfficiency,
          focusWeight: 0.5,
        });
      const development =
        applyWeeklyDevelopment({
          age,
          talent,
          currentValues: values,
          gains: {
            [primary]: primaryGain,
            [secondary]: secondaryGain,
          },
        });

      values = development.values;
      sessionIndex += 1;
    }

    const overall =
      calculateOverall(values);

    if (overall > peakOverall) {
      peakAge = age;
      peakOverall = overall;
    }
  }

  return {
    peakAge,
    peakOverall,
    finalOverall:
      calculateOverall(values),
  };
}

function createValues(
  value: number
): TrainingPlayerValues {
  return {
    precisione: value,
    diretto: value,
    sponde: value,
    tattica: value,
    mentalita: value,
    difesa: value,
    realizzazione: value,
    creativita: value,
    misura: value,
  };
}
