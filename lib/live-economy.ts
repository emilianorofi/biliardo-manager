import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import {
  ACADEMY_LEVELS,
  TRAINING_CENTER_LEVELS,
  VENUE_LEVELS,
  applyFanMatchChange,
  applyFanSeasonChange,
  applyReputationSeasonChange,
  calculateHomeGateIncome,
  calculateSellerProceeds,
  calculateWeeklySponsorIncome,
  getLeagueEconomy,
  getTrainerWeeklyCost,
  getYouthCoachWeeklyCost,
} from "@/lib/economy-rules";
import {
  getIndividualTournamentPrize,
  getLeaguePositionPrize,
  getPromotionPrize,
  getWorldChampionshipPrize,
  type KnockoutPrizeStage,
} from "@/lib/economy-prizes";
import { ensureEconomySchema } from "@/lib/economy-schema";
import {
  getClubStructureStateInTransaction,
  processAllCompletedStructureUpgrades,
} from "@/lib/club-structures";
import { createLeagueTable } from "@/lib/league-table";
import { completeSeasonIfReady } from "@/lib/season-completion";
import { getCompletedRomeWeeklyWindow } from "@/lib/rome-calendar";
import { refreshClubPlayerEconomy } from "@/lib/player-economy";
import { prisma } from "@/lib/prisma";

export async function prepareLiveEconomy(now = new Date()) {
  await ensureEconomySchema();
  await processAllCompletedStructureUpgrades(now);
}

export async function settlePendingLiveEconomy(now = new Date()) {
  await ensureEconomySchema();

  const weeklyUpdates = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT "id"
    FROM "ClubWeeklyUpdate"
    WHERE "economyAppliedAt" IS NULL
    ORDER BY "scheduledAt", "id"
    LIMIT 300
  `;

  let weekly = 0;
  for (const update of weeklyUpdates) {
    if (await settleWeeklyUpdate(update.id, now)) weekly += 1;
  }

  const tournamentPrizes = await settleCompletedTournamentPrizes(now);
  const marketAdjustments = await settleMarketAdjustments(now);
  const seasons = await settleReadySeasons(now);

  return { weekly, tournamentPrizes, marketAdjustments, seasons };
}

async function settleWeeklyUpdate(updateId: number, now: Date) {
  return prisma.$transaction(async (transaction) => {
    const rows = await transaction.$queryRaw<Array<{
      id: number;
      clubId: number;
      income: number;
      expenses: number;
      balanceAfter: number;
      scheduledAt: Date;
      economyAppliedAt: Date | null;
    }>>`
      SELECT "id", "clubId", "income", "expenses", "balanceAfter", "scheduledAt", "economyAppliedAt"
      FROM "ClubWeeklyUpdate"
      WHERE "id" = ${updateId}
      FOR UPDATE
    `;
    const update = rows[0];
    if (!update || update.economyAppliedAt) return false;

    await transaction.$queryRaw`
      SELECT "id" FROM "Club" WHERE "id" = ${update.clubId} FOR UPDATE
    `;

    const club = await transaction.club.findUnique({
      where: { id: update.clubId },
      select: {
        id: true,
        fans: true,
        reputation: true,
        trainerLevel: true,
        youthCoachLevel: true,
      },
    });
    if (!club) throw new Error("CLUB_NOT_FOUND");

    const structures = await getClubStructureStateInTransaction(
      transaction,
      club.id
    );
    const window = getCompletedRomeWeeklyWindow(update.scheduledAt);
    const fixtures = await transaction.leagueFixture.findMany({
      where: {
        status: "PLAYED",
        playedAt: { gte: window.start, lt: window.end },
        OR: [{ homeClubId: club.id }, { awayClubId: club.id }],
      },
      orderBy: { playedAt: "asc" },
      select: {
        homeClubId: true,
        awayClubId: true,
        homeScore: true,
        awayScore: true,
        league: { select: { level: true } },
        homeClub: { select: { reputation: true } },
        awayClub: { select: { reputation: true } },
      },
    });
    const currentFixture = fixtures.at(-1) ?? null;

    const membership = await transaction.leagueEntry.findFirst({
      where: {
        clubId: club.id,
        league: { status: { in: ["ACTIVE", "COMPLETED", "PREPARATION"] } },
      },
      orderBy: { leagueId: "desc" },
      select: { league: { select: { level: true } } },
    });
    const leagueLevel = currentFixture?.league.level ?? membership?.league.level ?? 4;

    const recentFixtures = await transaction.leagueFixture.findMany({
      where: {
        status: "PLAYED",
        playedAt: { lt: update.scheduledAt },
        OR: [{ homeClubId: club.id }, { awayClubId: club.id }],
      },
      orderBy: { playedAt: "desc" },
      take: 5,
      select: { homeClubId: true, homeScore: true, awayScore: true },
    });
    const recentAveragePoints = recentFixtures.length === 0
      ? 3
      : recentFixtures.reduce((sum, fixture) => {
          const score = fixture.homeClubId === club.id
            ? fixture.homeScore ?? 3
            : fixture.awayScore ?? 3;
          return sum + score;
        }, 0) / recentFixtures.length;

    const sponsorIncome = calculateWeeklySponsorIncome({
      leagueLevel,
      reputation: club.reputation,
      fans: club.fans,
      recentAveragePoints,
    });

    let gateIncome = 0;
    if (currentFixture && currentFixture.homeClubId === club.id) {
      gateIncome = calculateHomeGateIncome({
        leagueLevel,
        fans: club.fans,
        homeReputation: club.reputation,
        opponentReputation: currentFixture.awayClub.reputation,
        recentAveragePoints,
        venueLevel: structures.venueLevel,
      });
    }

    await applyTrainingCenterCorrection(
      transaction,
      club.id,
      update.scheduledAt,
      structures.trainingCenterLevel
    );
    const playerEconomy = await refreshClubPlayerEconomy(
      transaction,
      club.id
    );

    const leagueEconomy = getLeagueEconomy(leagueLevel);
    const expenses =
      playerEconomy.salaryTotal +
      getTrainerWeeklyCost(club.trainerLevel) +
      getYouthCoachWeeklyCost(club.youthCoachLevel) +
      leagueEconomy.clubManagementWeekly +
      TRAINING_CENTER_LEVELS[structures.trainingCenterLevel as 1 | 2 | 3 | 4 | 5].weeklyMaintenance +
      ACADEMY_LEVELS[structures.academyLevel as 1 | 2 | 3 | 4 | 5].weeklyMaintenance +
      VENUE_LEVELS[structures.venueLevel as 1 | 2 | 3 | 4 | 5].weeklyMaintenance;
    const income = sponsorIncome + gateIncome;
    const previousNet = update.income - update.expenses;
    const liveNet = income - expenses;
    const correction = liveNet - previousNet;
    const balanceAfter = update.balanceAfter + correction;

    let fans = club.fans;
    if (
      currentFixture &&
      currentFixture.homeScore !== null &&
      currentFixture.awayScore !== null
    ) {
      fans = applyFanMatchChange(
        club.fans,
        currentFixture.homeClubId === club.id
          ? currentFixture.homeScore
          : currentFixture.awayScore
      );
    }

    await transaction.club.update({
      where: { id: club.id },
      data: {
        balance: { increment: correction },
        weeklyIncome: income,
        weeklyExpenses: expenses,
        fans,
      },
    });

    await transaction.$executeRaw`
      UPDATE "ClubWeeklyUpdate"
      SET
        "income" = ${income},
        "expenses" = ${expenses},
        "netResult" = ${liveNet},
        "balanceAfter" = ${balanceAfter},
        "economyAppliedAt" = ${now}
      WHERE "id" = ${update.id}
    `;

    return true;
  });
}

async function applyTrainingCenterCorrection(
  transaction: Prisma.TransactionClient,
  clubId: number,
  scheduledAt: Date,
  level: number
) {
  const bonus = TRAINING_CENTER_LEVELS[level as 1 | 2 | 3 | 4 | 5].growthBonus;
  if (bonus <= 0) return;

  const session = await transaction.trainingSession.findFirst({
    where: { clubId, processedAt: scheduledAt },
    select: {
      id: true,
      primaryFocus: true,
      secondaryFocus: true,
      results: {
        select: {
          id: true,
          playerId: true,
          primaryGain: true,
          primaryAfter: true,
          secondaryGain: true,
          secondaryAfter: true,
          overallAfter: true,
        },
      },
    },
  });
  if (!session) return;

  for (const result of session.results) {
    if (result.playerId === null) continue;
    const primaryExtra = Math.max(0, result.primaryGain * bonus);
    const secondaryExtra = Math.max(0, result.secondaryGain * bonus);
    if (primaryExtra === 0 && secondaryExtra === 0) continue;

    const data: Record<string, unknown> = {};
    data[session.primaryFocus] = { increment: primaryExtra };
    data[session.secondaryFocus] = { increment: secondaryExtra };

    await transaction.player.update({
      where: { id: result.playerId },
      data: data as Prisma.PlayerUpdateInput,
    });
    await transaction.trainingResult.update({
      where: { id: result.id },
      data: {
        primaryGain: result.primaryGain + primaryExtra,
        primaryAfter: result.primaryAfter + primaryExtra,
        secondaryGain: result.secondaryGain + secondaryExtra,
        secondaryAfter: result.secondaryAfter + secondaryExtra,
        overallAfter:
          result.overallAfter + (primaryExtra + secondaryExtra) / 9,
      },
    });
  }
}

async function settleCompletedTournamentPrizes(now: Date) {
  const tournaments = await prisma.$queryRaw<Array<{
    id: number;
    type: string;
  }>>`
    SELECT "id", "type"
    FROM "IndividualTournament"
    WHERE "status" = 'COMPLETED' AND "prizesPaidAt" IS NULL
    ORDER BY "id"
  `;
  let paid = 0;

  for (const tournament of tournaments) {
    const settled = await prisma.$transaction(async (transaction) => {
      const locked = await transaction.$queryRaw<Array<{
        type: string;
        prizesPaidAt: Date | null;
      }>>`
        SELECT "type", "prizesPaidAt"
        FROM "IndividualTournament"
        WHERE "id" = ${tournament.id}
        FOR UPDATE
      `;
      if (!locked[0] || locked[0].prizesPaidAt) return false;

      const entries = await transaction.individualTournamentEntry.findMany({
        where: { tournamentId: tournament.id },
        select: {
          status: true,
          eliminatedStage: true,
          player: {
            select: { clubId: true, firstName: true, lastName: true },
          },
        },
      });
      const awards = new Map<number, number>();

      for (const entry of entries) {
        if (entry.player.clubId === null) continue;
        const stage = getPrizeStage(entry.status, entry.eliminatedStage);
        if (!stage) continue;
        const prize = locked[0].type === "MONDIALE"
          ? getWorldChampionshipPrize(stage)
          : getIndividualTournamentPrize(stage);
        awards.set(
          entry.player.clubId,
          (awards.get(entry.player.clubId) ?? 0) + prize
        );
      }

      for (const [clubId, amount] of awards) {
        await transaction.club.update({
          where: { id: clubId },
          data: { balance: { increment: amount } },
        });
        await transaction.gameEvent.create({
          data: {
            clubId,
            type: "PREMIO_INDIVIDUALE",
            title: "Premio torneo individuale",
            description: `Accreditati ${formatCurrency(amount)} dai risultati nel torneo.`,
            createdAt: now,
          },
        });
      }

      await transaction.$executeRaw`
        UPDATE "IndividualTournament"
        SET "prizesPaidAt" = ${now}
        WHERE "id" = ${tournament.id}
      `;
      return true;
    });
    if (settled) paid += 1;
  }

  return paid;
}

function getPrizeStage(
  status: string,
  eliminatedStage: string | null
): KnockoutPrizeStage | null {
  if (status === "WINNER") return "WINNER";
  if (eliminatedStage === "FINAL") return "FINALIST";
  if (eliminatedStage === "SEMI_FINAL") return "SEMIFINALIST";
  if (eliminatedStage === "QUARTER_FINAL") return "QUARTERFINALIST";
  return null;
}

async function settleMarketAdjustments(now: Date) {
  const listings = await prisma.$queryRaw<Array<{
    id: number;
    winnerClubId: number | null;
    sellerClubId: number | null;
    finalPrice: number | null;
    salary: number;
  }>>`
    SELECT
      listing."id",
      listing."winnerClubId",
      listing."sellerClubId",
      listing."finalPrice",
      player."salary"
    FROM "TransferListing" AS listing
    JOIN "Player" AS player ON player."id" = listing."playerId"
    WHERE listing."status" = 'COMPLETED'
      AND listing."economyAdjustedAt" IS NULL
    ORDER BY listing."id"
  `;
  let adjusted = 0;

  for (const listing of listings) {
    const finalPrice = listing.finalPrice;
    if (finalPrice === null) continue;

    await prisma.$transaction(async (transaction) => {
      const rows = await transaction.$queryRaw<Array<{ economyAdjustedAt: Date | null }>>`
        SELECT "economyAdjustedAt"
        FROM "TransferListing"
        WHERE "id" = ${listing.id}
        FOR UPDATE
      `;
      if (!rows[0] || rows[0].economyAdjustedAt) return;

      if (listing.winnerClubId !== null && listing.salary > 0) {
        await transaction.club.update({
          where: { id: listing.winnerClubId },
          data: { balance: { increment: listing.salary } },
        });
      }
      if (listing.sellerClubId !== null) {
        const proceeds = calculateSellerProceeds(finalPrice);
        const fee = finalPrice - proceeds;
        if (fee > 0) {
          await transaction.club.update({
            where: { id: listing.sellerClubId },
            data: { balance: { decrement: fee } },
          });
        }
      }

      await transaction.$executeRaw`
        UPDATE "TransferListing"
        SET "economyAdjustedAt" = ${now}
        WHERE "id" = ${listing.id}
      `;
      adjusted += 1;
    });
  }

  return adjusted;
}

async function settleReadySeasons(now: Date) {
  const seasons = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT season."id"
    FROM "Season" AS season
    WHERE season."status" IN ('ACTIVE', 'COMPLETED')
      AND season."economySettledAt" IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM "League" AS league
        WHERE league."seasonId" = season."id" AND league."status" <> 'COMPLETED'
      )
      AND NOT EXISTS (
        SELECT 1 FROM "IndividualTournament" AS tournament
        WHERE tournament."seasonId" = season."id" AND tournament."status" <> 'COMPLETED'
      )
      AND NOT EXISTS (
        SELECT 1 FROM "NationsCupTournament" AS cup
        WHERE cup."seasonId" = season."id" AND cup."status" <> 'COMPLETED'
      )
      AND EXISTS (
        SELECT 1 FROM "SpecialtyCupTournament" AS specialty
        WHERE specialty."seasonId" = season."id"
      )
      AND NOT EXISTS (
        SELECT 1 FROM "SpecialtyCupTournament" AS specialty
        WHERE specialty."seasonId" = season."id"
          AND specialty."status" <> 'COMPLETED'
      )
    ORDER BY season."number"
  `;
  let settled = 0;

  for (const season of seasons) {
    const didSettle = await prisma.$transaction(async (transaction) => {
      const locked = await transaction.$queryRaw<Array<{ economySettledAt: Date | null }>>`
        SELECT "economySettledAt"
        FROM "Season"
        WHERE "id" = ${season.id}
        FOR UPDATE
      `;
      if (!locked[0] || locked[0].economySettledAt) return false;

      const leagues = await transaction.league.findMany({
        where: { seasonId: season.id },
        select: {
          level: true,
          entries: {
            select: {
              clubId: true,
              played: true,
              won: true,
              drawn: true,
              lost: true,
              pointsFor: true,
              pointsAgainst: true,
              points: true,
              club: {
                select: { name: true, fans: true, reputation: true },
              },
            },
          },
        },
      });

      for (const league of leagues) {
        const table = createLeagueTable(
          league.entries.map((entry) => ({
            clubId: entry.clubId,
            clubName: entry.club.name,
            played: entry.played,
            won: entry.won,
            drawn: entry.drawn,
            lost: entry.lost,
            pointsFor: entry.pointsFor,
            pointsAgainst: entry.pointsAgainst,
            points: entry.points,
          }))
        );

        for (const ranked of table) {
          const source = league.entries.find((entry) => entry.clubId === ranked.clubId)!;
          const promoted = league.level > 1 && ranked.position === 1;
          const relegated = league.level < 4 && ranked.position >= 7;
          const leaguePrize = getLeaguePositionPrize(league.level, ranked.position);
          const promotionPrize = promoted ? getPromotionPrize(league.level) : 0;
          const totalPrize = leaguePrize + promotionPrize;
          const fans = applyFanSeasonChange({
            fans: source.club.fans,
            position: ranked.position,
            promoted,
            relegated,
          });
          const reputation = applyReputationSeasonChange({
            reputation: source.club.reputation,
            position: ranked.position,
            promoted,
            relegated,
            firstLeagueChampion: league.level === 1 && ranked.position === 1,
          });

          await transaction.club.update({
            where: { id: ranked.clubId },
            data: {
              fans,
              reputation,
              ...(totalPrize > 0
                ? { balance: { increment: totalPrize } }
                : {}),
            },
          });
          if (totalPrize > 0) {
            await transaction.gameEvent.create({
              data: {
                clubId: ranked.clubId,
                type: "PREMIO_CAMPIONATO",
                title: "Premio di fine stagione",
                description: `Accreditati ${formatCurrency(totalPrize)} per campionato${promoted ? " e promozione" : ""}.`,
                createdAt: now,
              },
            });
          }
        }
      }

      await transaction.$executeRaw`
        UPDATE "Season"
        SET "economySettledAt" = ${now}
        WHERE "id" = ${season.id}
      `;
      await completeSeasonIfReady(transaction, season.id, { now });
      return true;
    }, { timeout: 120000 });

    if (didSettle) settled += 1;
  }

  return settled;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
