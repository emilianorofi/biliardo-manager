import assert from "node:assert/strict";
import test from "node:test";

import {
  CONTROLLED_ADMINISTRATION_BALANCE,
  FAN_LIMITS,
  FINANCIAL_WARNING_BALANCE,
  NEW_MANAGER_STARTING_BALANCE,
  REPUTATION_LIMITS,
  applyFanMatchChange,
  applyFanSeasonChange,
  applyReputationSeasonChange,
  applyTrainingCenterGrowthBonus,
  applyVenueGateBonus,
  calculateHomeGateIncome,
  calculatePlayerBaseMarketValue,
  calculatePlayerMarketValue,
  calculatePlayerWeeklySalary,
  calculateSellerProceeds,
  calculateSquadWeeklySalary,
  calculateTransferFee,
  calculateWeeklySponsorIncome,
  getAcademyLevel,
  getAcademyTalentBands,
  getFanMatchChange,
  getGateFanMultiplier,
  getGateFormMultiplier,
  getGateHomeReputationMultiplier,
  getGateOpponentReputationMultiplier,
  getLeagueEconomy,
  getPlayerValueAgeMultiplier,
  getPlayerValueTalentMultiplier,
  getSponsorFanMultiplier,
  getSponsorFormMultiplier,
  getSponsorReputationMultiplier,
  getTrainerWeeklyCost,
  getTrainingCenterGrowthMultiplier,
  getTrainingCenterLevel,
  getVenueGateMultiplier,
  getVenueLevel,
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

test("fissa costi, tempi e bonus del centro allenamento", () => {
  assert.deepEqual(getTrainingCenterLevel(1), {
    upgradeCost: 0,
    weeklyMaintenance: 300,
    growthBonus: 0,
    upgradeDays: 0,
  });
  assert.deepEqual(getTrainingCenterLevel(5), {
    upgradeCost: 260_000,
    weeklyMaintenance: 3_800,
    growthBonus: 0.18,
    upgradeDays: 28,
  });

  assert.equal(getTrainingCenterGrowthMultiplier(2), 1.04);
  assert.equal(getTrainingCenterGrowthMultiplier(3), 1.08);
  assert.equal(getTrainingCenterGrowthMultiplier(4), 1.13);
  assert.equal(getTrainingCenterGrowthMultiplier(5), 1.18);

  assert.equal(
    Number(applyTrainingCenterGrowthBonus(0.7, 5).toFixed(3)),
    0.826
  );
  assert.equal(
    Number(applyTrainingCenterGrowthBonus(0.9, 5).toFixed(3)),
    1.062
  );
});

test("fissa costi, tempi e qualita dei candidati dell'accademia", () => {
  assert.deepEqual(getAcademyLevel(1), {
    upgradeCost: 0,
    weeklyMaintenance: 150,
    overallBonus: [0, 0],
    upgradeDays: 0,
  });
  assert.deepEqual(getAcademyLevel(5), {
    upgradeCost: 220_000,
    weeklyMaintenance: 1_200,
    overallBonus: [2, 4],
    upgradeDays: 28,
  });

  for (let level = 1; level <= 5; level += 1) {
    const totalProbability = getAcademyTalentBands(level).reduce(
      (total, band) => total + band.probability,
      0
    );

    assert.equal(Number(totalProbability.toFixed(6)), 1);
  }

  assert.deepEqual(getAcademyTalentBands(1), [
    { minimum: 45, maximum: 59, probability: 0.78 },
    { minimum: 60, maximum: 69, probability: 0.17 },
    { minimum: 70, maximum: 79, probability: 0.045 },
    { minimum: 80, maximum: 89, probability: 0.005 },
    { minimum: 90, maximum: 95, probability: 0 },
  ]);

  assert.deepEqual(getAcademyTalentBands(5), [
    { minimum: 45, maximum: 59, probability: 0.5 },
    { minimum: 60, maximum: 69, probability: 0.27 },
    { minimum: 70, maximum: 79, probability: 0.16 },
    { minimum: 80, maximum: 89, probability: 0.06 },
    { minimum: 90, maximum: 95, probability: 0.01 },
  ]);
});

test("fissa costi, tempi e bonus dell'impianto di gioco", () => {
  assert.deepEqual(getVenueLevel(1), {
    upgradeCost: 0,
    weeklyMaintenance: 150,
    gateBonus: 0,
    upgradeDays: 0,
  });
  assert.deepEqual(getVenueLevel(5), {
    upgradeCost: 320_000,
    weeklyMaintenance: 1_000,
    gateBonus: 0.4,
    upgradeDays: 28,
  });

  assert.equal(getVenueGateMultiplier(2), 1.07);
  assert.equal(getVenueGateMultiplier(3), 1.15);
  assert.equal(getVenueGateMultiplier(4), 1.25);
  assert.equal(getVenueGateMultiplier(5), 1.4);

  assert.equal(applyVenueGateBonus(14_000, 1), 14_000);
  assert.equal(applyVenueGateBonus(14_000, 2), 14_980);
  assert.equal(applyVenueGateBonus(14_000, 3), 16_100);
  assert.equal(applyVenueGateBonus(14_000, 4), 17_500);
  assert.equal(applyVenueGateBonus(14_000, 5), 19_600);
});

test("usa una scala tifosi coerente con una sala biliardo", () => {
  assert.deepEqual(FAN_LIMITS, {
    minimum: 10,
    reference: 90,
    maximum: 300,
  });

  assert.equal(getFanMatchChange(0), -3);
  assert.equal(getFanMatchChange(3), 0);
  assert.equal(getFanMatchChange(6), 3);
  assert.equal(applyFanMatchChange(90, 6), 93);
  assert.equal(applyFanMatchChange(10, 0), 10);

  assert.equal(
    applyFanSeasonChange({
      fans: 90,
      position: 1,
      promoted: true,
    }),
    108
  );
  assert.equal(
    applyFanSeasonChange({
      fans: 90,
      position: 8,
      relegated: true,
    }),
    75
  );
});

test("aggiorna la reputazione lentamente a fine stagione", () => {
  assert.deepEqual(REPUTATION_LIMITS, {
    minimum: 1,
    reference: 40,
    maximum: 100,
  });

  assert.equal(
    applyReputationSeasonChange({
      reputation: 40,
      position: 1,
      firstLeagueChampion: true,
    }),
    46
  );
  assert.equal(
    applyReputationSeasonChange({
      reputation: 40,
      position: 8,
      relegated: true,
    }),
    35
  );
});

test("calcola sponsor settimanale con variazioni moderate", () => {
  assert.equal(getSponsorReputationMultiplier(40), 1);
  assert.equal(getSponsorFanMultiplier(90), 1);
  assert.equal(getSponsorFormMultiplier(3), 1);

  assert.equal(
    calculateWeeklySponsorIncome({
      leagueLevel: 1,
      reputation: 40,
      fans: 90,
      recentAveragePoints: 3,
    }),
    8_500
  );
  assert.equal(
    calculateWeeklySponsorIncome({
      leagueLevel: 1,
      reputation: 1,
      fans: 10,
      recentAveragePoints: 0,
    }),
    7_225
  );
  assert.equal(
    calculateWeeklySponsorIncome({
      leagueLevel: 1,
      reputation: 100,
      fans: 300,
      recentAveragePoints: 6,
    }),
    9_775
  );
});

test("calcola il pubblico con interesse partita e bonus impianto", () => {
  assert.equal(getGateFanMultiplier(90), 1);
  assert.equal(getGateHomeReputationMultiplier(40), 1);
  assert.equal(getGateFormMultiplier(3), 1);
  assert.equal(getGateOpponentReputationMultiplier(40), 1);

  assert.equal(
    calculateHomeGateIncome({
      leagueLevel: 1,
      fans: 90,
      homeReputation: 40,
      opponentReputation: 40,
      recentAveragePoints: 3,
      venueLevel: 1,
    }),
    14_000
  );
  assert.equal(
    calculateHomeGateIncome({
      leagueLevel: 1,
      fans: 10,
      homeReputation: 1,
      opponentReputation: 1,
      recentAveragePoints: 0,
      venueLevel: 1,
    }),
    11_200
  );
  assert.equal(
    calculateHomeGateIncome({
      leagueLevel: 1,
      fans: 300,
      homeReputation: 100,
      opponentReputation: 100,
      recentAveragePoints: 6,
      venueLevel: 5,
    }),
    24_500
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
