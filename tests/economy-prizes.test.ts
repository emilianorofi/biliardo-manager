import assert from "node:assert/strict";
import test from "node:test";

import {
  NATIONS_CUP_CLUB_PRIZE,
  RELEGATION_PARACHUTE_PAYMENT,
  calculateIndividualTournamentPrizePool,
  calculateWorldChampionshipPrizePool,
  getIndividualTournamentPrize,
  getLeaguePositionPrize,
  getPromotionPrize,
  getWorldChampionshipPrize,
} from "../lib/economy-prizes";

test("fissa i premi di campionato per tutte le serie", () => {
  assert.equal(getLeaguePositionPrize(1, 1), 35_000);
  assert.equal(getLeaguePositionPrize(1, 2), 22_000);
  assert.equal(getLeaguePositionPrize(1, 3), 14_000);

  assert.equal(getLeaguePositionPrize(2, 1), 20_000);
  assert.equal(getLeaguePositionPrize(2, 2), 12_000);
  assert.equal(getLeaguePositionPrize(2, 3), 7_000);

  assert.equal(getLeaguePositionPrize(3, 1), 13_000);
  assert.equal(getLeaguePositionPrize(3, 2), 8_000);
  assert.equal(getLeaguePositionPrize(3, 3), 5_000);

  assert.equal(getLeaguePositionPrize(4, 1), 8_000);
  assert.equal(getLeaguePositionPrize(4, 2), 5_000);
  assert.equal(getLeaguePositionPrize(4, 3), 3_000);

  assert.equal(getLeaguePositionPrize(2, 4), 0);
  assert.equal(getLeaguePositionPrize(5, 1), 0);
});

test("fissa i premi promozione e non assegna buonuscite retrocessione", () => {
  assert.equal(getPromotionPrize(2), 10_000);
  assert.equal(getPromotionPrize(3), 7_000);
  assert.equal(getPromotionPrize(4), 5_000);
  assert.equal(getPromotionPrize(1), 0);
  assert.equal(RELEGATION_PARACHUTE_PAYMENT, 0);
});

test("fissa i premi dei tornei individuali normali", () => {
  assert.equal(getIndividualTournamentPrize("WINNER"), 6_000);
  assert.equal(getIndividualTournamentPrize("FINALIST"), 3_000);
  assert.equal(getIndividualTournamentPrize("SEMIFINALIST"), 1_500);
  assert.equal(getIndividualTournamentPrize("QUARTERFINALIST"), 500);
  assert.equal(calculateIndividualTournamentPrizePool(), 14_000);
});

test("fissa i premi del mondiale individuale", () => {
  assert.equal(getWorldChampionshipPrize("WINNER"), 15_000);
  assert.equal(getWorldChampionshipPrize("FINALIST"), 8_000);
  assert.equal(getWorldChampionshipPrize("SEMIFINALIST"), 4_000);
  assert.equal(getWorldChampionshipPrize("QUARTERFINALIST"), 1_500);
  assert.equal(calculateWorldChampionshipPrizePool(), 37_000);
});

test("la coppa delle nazioni resta una competizione di prestigio", () => {
  assert.equal(NATIONS_CUP_CLUB_PRIZE, 0);
});
