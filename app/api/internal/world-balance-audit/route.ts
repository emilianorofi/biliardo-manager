import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getRetirementChance } from "@/lib/player-aging";
import { applyWeeklyDevelopment } from "@/lib/player-development";
import {
  calculateOverall,
  calculateTrainingGain,
  getTrainerEfficiency,
  TRAINING_SKILLS,
  type TrainingFocus,
} from "@/lib/training-engine";
import {
  calculatePlayerPerformance,
  calculateSpecialtyRating,
  type MatchSpecialty,
} from "@/lib/match-engine";
import {
  calculatePlayerMarketValue,
  calculatePlayerWeeklySalary,
  getAcademyTalentBands,
  getTrainingCenterGrowthMultiplier,
} from "@/lib/economy-rules";
import {
  tournamentGrowthValue,
  type TournamentGrowthTier,
  type TournamentPlacement,
} from "@/lib/tournament-growth";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type SimPlayer = {
  id: number;
  sourceId: number | null;
  clubId: number | null;
  age: number;
  ageDays: number;
  talent: number;
  experience: number;
  precisione: number;
  diretto: number;
  sponde: number;
  tattica: number;
  mentalita: number;
  difesa: number;
  realizzazione: number;
  creativita: number;
  misura: number;
};

type Club = {
  id: number;
  trainerLevel: number;
  youthCoachLevel: number;
  trainingPlan: { primaryFocus: string; secondaryFocus: string } | null;
};

export async function GET() {
  const seasons = 20;
  const runs = 20;
  const seed = 26092026;

  const [sourcePlayers, sourceClubs] = await Promise.all([
    prisma.player.findMany({
      where: { careerStatus: "ACTIVE" },
      select: {
        id: true, clubId: true, age: true, ageDays: true, talent: true,
        experience: true, precisione: true, diretto: true, sponde: true,
        tattica: true, mentalita: true, difesa: true, realizzazione: true,
        creativita: true, misura: true,
      },
    }),
    prisma.club.findMany({
      select: {
        id: true,
        trainerLevel: true,
        youthCoachLevel: true,
        trainingPlan: { select: { primaryFocus: true, secondaryFocus: true } },
      },
    }),
  ]);

  if (!sourcePlayers.length) {
    return NextResponse.json({ error: "NO_PLAYERS" }, { status: 500 });
  }

  const clubs = new Map(sourceClubs.map((club) => [club.id, club]));
  const targetPopulation = sourcePlayers.length;
  const aggregateBuckets = Array.from({ length: seasons }, () => [] as any[]);
  const tracked = [...sourcePlayers]
    .sort((a, b) => calculateOverall(b) - calculateOverall(a))
    .slice(0, 8)
    .map((player) => ({
      id: player.id,
      age: player.age,
      startOverall: calculateOverall(player),
      trajectory: [] as Array<number | null>,
    }));

  for (let run = 0; run < runs; run += 1) {
    const random = createRandom(seed + run * 7919);
    let syntheticId = -1;
    let players: SimPlayer[] = sourcePlayers.map((player) => ({
      ...player,
      sourceId: player.id,
    }));

    for (let season = 1; season <= seasons; season += 1) {
      simulateTrainingSeason(players, clubs);
      simulateTournamentSeason(players, random);

      for (const player of players) player.age += 1;

      const survivors: SimPlayer[] = [];
      const retired: SimPlayer[] = [];
      for (const player of players) {
        if (random() < getRetirementChance(player.age) / 100) retired.push(player);
        else survivors.push(player);
      }

      const vacancies = targetPopulation - survivors.length;
      const entrants: SimPlayer[] = [];
      for (let index = 0; index < vacancies; index += 1) {
        const retiredPlayer = retired[index];
        const clubId =
          retiredPlayer?.clubId ??
          sourceClubs[Math.floor(random() * sourceClubs.length)]?.id ??
          null;
        const club = clubId === null ? undefined : clubs.get(clubId);
        entrants.push(
          createGraduate(
            syntheticId--,
            clubId,
            club?.youthCoachLevel ?? 1,
            random
          )
        );
      }

      players = [...survivors, ...entrants];
      aggregateBuckets[season - 1].push(
        snapshot(players, season, retired.length, entrants.length)
      );

      if (run === 0) {
        for (const item of tracked) {
          const current = players.find((player) => player.sourceId === item.id);
          item.trajectory.push(
            current ? round(calculateOverall(current), 2) : null
          );
        }
      }
    }
  }

  const seasonsData = aggregateBuckets.map((rows, index) => {
    const keys = Object.keys(rows[0]).filter((key) => key !== "season");
    const result: Record<string, number> = { season: index + 1 };
    for (const key of keys) {
      result[key] = round(
        average(rows.map((row: Record<string, number>) => row[key])),
        2
      );
    }
    return result;
  });

  return NextResponse.json({
    parameters: { seasons, runs, seed, startingPlayers: targetPopulation },
    assumptions: [
      "Database letto in sola lettura; simulazione interamente in memoria.",
      "15 aggiornamenti settimanali per stagione.",
      "Intensita stimata: 70% ai primi 3 del club, 35% agli altri.",
      "Piano allenamento corrente del club; fallback Precisione/Tattica.",
      "Centro allenamento neutro livello 1: il livello non e ancora persistito nel modello Club.",
      "12 tornei individuali + Mondiale + Coppa Specialita simulati con le tabelle di crescita correnti.",
      "Forma e morale neutralizzati a 5 nei tornei per isolare la deriva tecnica.",
      "Ogni ritiro viene compensato da un nuovo 17enne, mantenendo stabile la popolazione.",
      "Qualita giovani stimata dal livello Responsabile giovani corrente.",
    ],
    seasons: seasonsData,
    tracked,
  });
}

function simulateTrainingSeason(
  players: SimPlayer[],
  clubs: Map<number, Club>
) {
  for (let week = 0; week < 15; week += 1) {
    const ranks = rankWithinClubs(players);
    for (const player of players) {
      const club = player.clubId === null ? undefined : clubs.get(player.clubId);
      const plan = resolvePlan(club?.trainingPlan);
      const rank = ranks.get(player.id) ?? 99;
      const intensity = rank <= 3 ? 70 : player.clubId === null ? 15 : 35;
      const trainerEfficiency = getTrainerEfficiency(club?.trainerLevel ?? 1);
      const centerMultiplier = getTrainingCenterGrowthMultiplier(1);
      const currentValues = skillValues(player);
      const primaryGain =
        calculateTrainingGain({
          age: player.age,
          talent: player.talent,
          currentValue: currentValues[plan.primary],
          intensity,
          trainerEfficiency,
          focusWeight: 1,
        }) * centerMultiplier;
      const secondaryGain =
        calculateTrainingGain({
          age: player.age,
          talent: player.talent,
          currentValue: currentValues[plan.secondary],
          intensity,
          trainerEfficiency,
          focusWeight: 0.5,
        }) * centerMultiplier;

      const development = applyWeeklyDevelopment({
        age: player.age,
        talent: player.talent,
        currentValues,
        gains: {
          [plan.primary]: primaryGain,
          [plan.secondary]: secondaryGain,
        },
      });

      Object.assign(player, development.values);
      player.experience = Math.min(
        100,
        player.experience + (intensity >= 70 ? 0.55 : intensity >= 30 ? 0.25 : 0.1)
      );
    }
  }
}

function simulateTournamentSeason(players: SimPlayer[], random: () => number) {
  const rounds: MatchSpecialty[] = [
    "ITALIANA","GORIZIANA","TUTTI_DOPPI",
    "ITALIANA","GORIZIANA","TUTTI_DOPPI",
    "ITALIANA","GORIZIANA","TUTTI_DOPPI",
    "ITALIANA","GORIZIANA","TUTTI_DOPPI",
  ];

  for (const specialty of rounds) {
    simulateKnockout(
      [...players].sort((a,b) => calculateOverall(b) - calculateOverall(a)).slice(0,256),
      specialty,
      "INDIVIDUAL",
      random
    );
  }

  simulateKnockout(
    [...players].sort((a,b) => calculateOverall(b) - calculateOverall(a)).slice(0,256),
    null,
    "WORLD",
    random
  );

  const groups = new Map<MatchSpecialty, SimPlayer[]>([
    ["ITALIANA",[]],["GORIZIANA",[]],["TUTTI_DOPPI",[]],
  ]);
  for (const player of players.filter((player) => player.clubId !== null)) {
    groups.get(bestSpecialty(player))!.push(player);
  }
  for (const [specialty, group] of groups) {
    simulateKnockout(group, specialty, "SPECIALTY_CUP", random);
  }
}

function simulateKnockout(
  entrants: SimPlayer[],
  specialty: MatchSpecialty | null,
  tier: TournamentGrowthTier,
  random: () => number
) {
  if (entrants.length < 2) return;
  let active = shuffle([...entrants], random);
  while (active.length > 1) {
    const next: SimPlayer[] = [];
    const size = active.length;
    for (let i = 0; i < active.length; i += 2) {
      const a = active[i];
      const b = active[i + 1];
      if (!b) {
        next.push(a);
        continue;
      }
      const matchSpecialty =
        specialty ??
        (["ITALIANA","GORIZIANA","TUTTI_DOPPI"] as const)[Math.floor(random() * 3)];
      const ra = tournamentRating(a, matchSpecialty);
      const rb = tournamentRating(b, matchSpecialty);
      const p = clamp(0.5 + (ra - rb) * 0.015, 0.08, 0.92);
      const winner = random() < p ? a : b;
      const loser = winner === a ? b : a;
      const placement = placementForSize(size);
      if (placement) applyGrowth(loser, tournamentGrowthValue(tier, placement));
      next.push(winner);
    }
    active = next;
  }
  applyGrowth(active[0], tournamentGrowthValue(tier, "WINNER"));
}

function placementForSize(size: number): TournamentPlacement | null {
  if (size <= 2) return "FINALIST";
  if (size <= 4) return "SEMI_FINAL";
  if (size <= 8) return "QUARTER_FINAL";
  if (size <= 16) return "ROUND_OF_16";
  if (size <= 32) return "ROUND_OF_32";
  if (size <= 64) return "ROUND_OF_64";
  if (size <= 128) return "ROUND_OF_128";
  return null;
}

function applyGrowth(player: SimPlayer, value: number) {
  for (const skill of TRAINING_SKILLS) {
    player[skill] = round(player[skill] + value, 3);
  }
}

function tournamentRating(player: SimPlayer, specialty: MatchSpecialty) {
  return calculatePlayerPerformance(
    { ...player, form: 5, morale: 5 },
    specialty
  ).performanceRating;
}

function bestSpecialty(player: SimPlayer): MatchSpecialty {
  const values = ["ITALIANA","GORIZIANA","TUTTI_DOPPI"] as const;
  return [...values].sort(
    (a,b) => calculateSpecialtyRating(player,b) - calculateSpecialtyRating(player,a)
  )[0];
}

function createGraduate(
  id: number,
  clubId: number | null,
  youthCoachLevel: number,
  random: () => number
): SimPlayer {
  const overall = 50 + Math.floor(random() * 5) + Math.max(0, youthCoachLevel - 1);
  const deviations = shuffle([-4,-3,-2,-1,0,1,2,3,4], random);
  const bands = getAcademyTalentBands(youthCoachLevel);
  const roll = random();
  let cumulative = 0;
  let talent = 55;
  for (const band of bands) {
    cumulative += band.probability;
    if (roll < cumulative) {
      talent =
        band.minimum +
        Math.floor(random() * (band.maximum - band.minimum + 1));
      break;
    }
  }
  return {
    id, sourceId: null, clubId, age: 17, ageDays: 0, talent, experience: 7,
    precisione: overall + deviations[0],
    diretto: overall + deviations[1],
    sponde: overall + deviations[2],
    tattica: overall + deviations[3],
    mentalita: overall + deviations[4],
    difesa: overall + deviations[5],
    realizzazione: overall + deviations[6],
    creativita: overall + deviations[7],
    misura: overall + deviations[8],
  };
}

function snapshot(players: SimPlayer[], season: number, retired: number, entrants: number) {
  const ranked = [...players].sort((a,b) => calculateOverall(b) - calculateOverall(a));
  const overalls = ranked.map(calculateOverall);
  const top10 = ranked.slice(0,10);
  const salaries = ranked.map((player) => calculatePlayerWeeklySalary(calculateOverall(player)));
  const values = ranked.map((player) => calculatePlayerMarketValue({
    overall: calculateOverall(player),
    age: player.age,
    talent: player.talent,
  }));
  return {
    season,
    players: players.length,
    avgOverall: average(overalls),
    medianOverall: percentile(overalls,0.5),
    top10Average: average(top10.map(calculateOverall)),
    p90Overall: percentile(overalls,0.9),
    p99Overall: percentile(overalls,0.99),
    maxOverall: overalls[0] ?? 0,
    avgAge: average(players.map((player) => player.age)),
    avgTop10Age: average(top10.map((player) => player.age)),
    over80: overalls.filter((value) => value >= 80).length,
    over90: overalls.filter((value) => value >= 90).length,
    over100: overalls.filter((value) => value >= 100).length,
    retired,
    entrants,
    avgSalary: average(salaries),
    maxSalary: Math.max(...salaries,0),
    avgValue: average(values),
    maxValue: Math.max(...values,0),
  };
}

function rankWithinClubs(players: SimPlayer[]) {
  const map = new Map<number, number>();
  const groups = new Map<number, SimPlayer[]>();
  for (const player of players) {
    if (player.clubId === null) continue;
    const group = groups.get(player.clubId) ?? [];
    group.push(player);
    groups.set(player.clubId,group);
  }
  for (const group of groups.values()) {
    group.sort((a,b) => calculateOverall(b) - calculateOverall(a))
      .forEach((player,index) => map.set(player.id,index+1));
  }
  return map;
}

function resolvePlan(plan: Club["trainingPlan"]) {
  const primary = isFocus(plan?.primaryFocus) ? plan!.primaryFocus as TrainingFocus : "precisione";
  let secondary = isFocus(plan?.secondaryFocus) ? plan!.secondaryFocus as TrainingFocus : "tattica";
  if (secondary === primary) secondary = primary === "tattica" ? "precisione" : "tattica";
  return { primary, secondary };
}

function isFocus(value: unknown): value is TrainingFocus {
  return typeof value === "string" && (TRAINING_SKILLS as readonly string[]).includes(value);
}

function skillValues(player: SimPlayer) {
  return Object.fromEntries(TRAINING_SKILLS.map((skill) => [skill, player[skill]])) as Record<TrainingFocus,number>;
}

function percentile(values: number[], p: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a,b) => a-b);
  return sorted[Math.min(sorted.length-1, Math.floor((sorted.length-1)*p))];
}
function average(values: number[]) {
  return values.length ? values.reduce((a,b)=>a+b,0)/values.length : 0;
}
function shuffle<T>(values: T[], random: () => number) {
  for (let i=values.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [values[i],values[j]]=[values[j],values[i]];
  }
  return values;
}
function createRandom(seed: number) {
  let state=seed>>>0;
  return () => {
    state += 0x6d2b79f5;
    let value=state;
    value=Math.imul(value^(value>>>15),value|1);
    value^=value+Math.imul(value^(value>>>7),value|61);
    return ((value^(value>>>14))>>>0)/4294967296;
  };
}
function clamp(value:number,min:number,max:number){return Math.max(min,Math.min(max,value));}
function round(value:number,digits=2){const factor=10**digits;return Math.round(value*factor)/factor;}
