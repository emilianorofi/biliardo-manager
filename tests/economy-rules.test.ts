import assert from "node:assert/strict";
import test from "node:test";

import {
  CONTROLLED_ADMINISTRATION_BALANCE,
  FINANCIAL_WARNING_BALANCE,
  NEW_MANAGER_STARTING_BALANCE,
  calculatePlayerBaseMarketValue,
  calculatePlayerMarketValue,
  calculatePlayerWeeklySalary,
  calculateSellerProceeds,
  calculateSquadWeeklySalary,
  calculateTransferFee,
  getLeagueEconomy,
  getPlayerValueAgeMultiplier,
  getPlayerValueTalentMultiplier,
  getTrainerWeeklyCost,
  getYouthCoachWeeklyCost,
} from "../lib/economy-rules";

test("usa la curva salariale esponenziale fissata per il bilanciamento", () => {
  const expected = new Map([
    [50, 250],
    [55, 412],
    [60, 679],
    [65, 1_118],
    [70, 1_842],
    [75, 3_034],
    [80, 4_998],
    [85, 8_234],
    [90, 13_565],
    [95, 22_348],
  ]);

  for (const [overall, salary] of expected) {
    assert.equal(
      calculatePlayerWeeklySalary(overall),
      salary
    );
  }

  assert.equal(
    calculateSquadWeeklySalary([85, 85, 85, 85, 85, 85]),
    49_404
  );
});

test("fissa il valore di mercato su overall, eta e talento", () => {
  assert.equal(
    Math.round(calculatePlayerBaseMarketValue(60)),
    30_000
  );
  assert.equal(
    Math.round(calculatePlayerBaseMarketValue(75)),
    88_766
  );

  assert.equal(getPlayerValueAgeMultiplier(18), 2.3);
  assert.equal(getPlayerValueAgeMultiplier(45), 1.15);
  assert.equal(getPlayerValueAgeMultiplier(60), 0.55);
  assert.equal(getPlayerValueAgeMultiplier(76), 0.1);

  assert.equal(
    Number(getPlayerValueTalentMultiplier(80).toFixed(6)),
    1.144444
  );

  const youngProspect = calculatePlayerMarketValue({
    overall: 60,
    age: 18,
    talent: 80,
  });
  const olderStrongPlayer = calculatePlayerMarketValue({
    overall: 75,
    age: 60,
    talent: 70,
  });

  assert.equal(youngProspect, 79_000);
  assert.equal(olderStrongPlayer, 53_200);
  assert.ok(youngProspect > olderStrongPlayer);

  assert.equal(
    calculatePlayerMarketValue({
      overall: 90,
      age: 40,
      talent: 85,
    }),
    400_200
  );
  assert.equal(
    calculatePlayerMarketValue({
      overall: 95,
      age: 45,
      talent: 90,
    }),
    520_400
  );
});

test("mantiene staff e costi base per categoria nei valori approvati", () => {
  assert.equal(getTrainerWeeklyCost(5), 3_800);
  assert.equal(getYouthCoachWeeklyCost(5), 2_100);

  assert.deepEqual(getLeagueEconomy(1), {
    sponsorWeekly: 8_500,
    homeGateBase: 14_000,
    clubManagementWeekly: 2_600,
  });

  assert.deepEqual(getLeagueEconomy(4), {
    sponsorWeekly: 4_800,
    homeGateBase: 6_400,
    clubManagementWeekly: 900,
  });
});

test("applica il cinque per cento di commissione al mercato", () => {
  assert.equal(calculateTransferFee(100_000), 5_000);
  assert.equal(calculateSellerProceeds(100_000), 95_000);
});

test("fissa capitale iniziale e soglie di controllo finanziario", () => {
  assert.equal(NEW_MANAGER_STARTING_BALANCE, 100_000);
  assert.equal(FINANCIAL_WARNING_BALANCE, -25_000);
  assert.equal(CONTROLLED_ADMINISTRATION_BALANCE, -50_000);
});
