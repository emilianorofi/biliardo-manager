#!/usr/bin/env tsx
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import { prisma } from "../lib/prisma";
import {
  calculatePlayerMarketValue,
  calculatePlayerWeeklySalary,
  getAcademyTalentBands,
  getTrainingCenterGrowthMultiplier,
} from "../lib/economy-rules";
import { getRetirementChance } from "../lib/player-aging";
import { applyWeeklyDevelopment } from "../lib/player-development";
import {
  calculateOverall,
  calculateTrainingGain,
  getTrainerEfficiency,
  TRAINING_SKILLS,
  type TrainingFocus,
} from "../lib/training-engine";
import {
  calculatePlayerPerformance,
  calculateSpecialtyRating,
  type MatchSpecialty,
} from "../lib/match-engine";
import {
  tournamentGrowthValue,
  type TournamentGrowthTier,
  type TournamentPlacement,
} from "../lib/tournament-growth";

type SimPlayer = {
  id: number;
  sourceId: number | null;
  clubId: number | null;
  nationality: string;
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

type ClubInput = {
  id: number;
  trainerLevel: number;
  youthCoachLevel: number;
  trainingPlan: {
    primaryFocus: string;
    secondaryFocus: string;
  } | null;
};

type SeasonSnapshot = {
  season: number;
  players: number;
  avgOverall: number;
  medianOverall: number;
  top10Average: number;
  p90Overall: number;
  p99Overall: number;
  maxOverall: number;
  avgAge: number;
  avgTop10Age: number;
  over80: number;
  over90: number;
  over100: number;
  retired: number;
  entrants: number;
  avgSalary: number;
  maxSalary: number;
  avgValue: number;
  maxValue: number;
};

type AggregateSnapshot = SeasonSnapshot & {
  runs: number;
};

const args = parseArgs(process.argv.slice(2));
const seasons = clampInteger(args.seasons ?? 20, 1, 100);
const runs = clampInteger(args.runs ?? 20, 1, 100);
const seed = clampInteger(args.seed ?? 26092026, 1, 2_147_483_647);
const outputDir = path.resolve(args.out ?? "reports");

async function main() {
  const [databasePlayers, databaseClubs] = await Promise.all([
    prisma.player.findMany({
      where: { careerStatus: "ACTIVE" },
      select: {
        id: true,
        clubId: true,
        nationality: true,
        age: true,
        ageDays: true,
        talent: true,
        experience: true,
        precisione: true,
        diretto: true,
        sponde: true,
        tattica: true,
        mentalita: true,
        difesa: true,
        realizzazione: true,
        creativita: true,
        misura: true,
      },
    }),
    prisma.club.findMany({
      select: {
        id: true,
        trainerLevel: true,
        youthCoachLevel: true,
        trainingPlan: {
          select: {
            primaryFocus: true,
            secondaryFocus: true,
          },
        },
      },
    }),
  ]);

  if (databasePlayers.length === 0) {
    throw new Error("Nessun giocatore attivo disponibile per la simulazione.");
  }

  const clubs = new Map(databaseClubs.map((club) => [club.id, club]));
  const targetPopulation = databasePlayers.length;
  const results: SeasonSnapshot[][] = [];
  const initialTop = [...databasePlayers]
    .sort((a, b) => calculateOverall(b) - calculateOverall(a))
    .slice(0, 8)
    .map((player) => ({
      id: player.id,
      name: `Giocatore #${player.id}`,
      startOverall: calculateOverall(player),
      age: player.age,
    }));
  const trajectories = new Map<number, Array<number | null>>(
    initialTop.map((player) => [player.id, []])
  );

  for (let runIndex = 0; runIndex < runs; runIndex += 1) {
    const random = createRandom(seed + runIndex * 7919);
    let nextSyntheticId = -1;
    let players: SimPlayer[] = databasePlayers.map((player) => ({
      ...player,
      sourceId: player.id,
    }));
    const runSnapshots: SeasonSnapshot[] = [];

    for (let season = 1; season <= seasons; season += 1) {
      simulateTrainingSeason(players, clubs, random);
      simulateTournamentSeason(players, random);

      for (const player of players) {
        player.age += 1;
      }

      const survivors: SimPlayer[] = [];
      const retiredPlayers: SimPlayer[] = [];

      for (const player of players) {
        const chance = getRetirementChance(player.age) / 100;
        if (random() < chance) retiredPlayers.push(player);
        else survivors.push(player);
      }

      const vacancies = targetPopulation - survivors.length;
      const entrants: SimPlayer[] = [];
      const retiredClubIds = retiredPlayers.map((player) => player.clubId);

      for (let index = 0; index < vacancies; index += 1) {
        const clubId = retiredClubIds[index] ?? pickClubId(databaseClubs, random);
        const club = clubId === null ? undefined : clubs.get(clubId);
        entrants.push(
          createAcademyGraduate({
            id: nextSyntheticId--,
            clubId,
            academyLevel: club?.youthCoachLevel ?? 1,
            random,
          })
        );
      }

      players = [...survivors, ...entrants];
      runSnapshots.push(
        snapshotSeason(players, season, retiredPlayers.length, entrants.length)
      );

      if (runIndex === 0) {
        for (const tracked of initialTop) {
          const player = players.find((candidate) => candidate.sourceId === tracked.id);
          trajectories.get(tracked.id)!.push(
            player ? round(calculateOverall(player), 2) : null
          );
        }
      }
    }

    results.push(runSnapshots);
  }

  const aggregate = aggregateRuns(results);
  fs.mkdirSync(outputDir, { recursive: true });

  const baseName = `world-balance-${seasons}s-${runs}runs`;
  const csvPath = path.join(outputDir, `${baseName}.csv`);
  const jsonPath = path.join(outputDir, `${baseName}.json`);
  const htmlPath = path.join(outputDir, `${baseName}.html`);

  fs.writeFileSync(csvPath, buildCsv(aggregate), "utf8");
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        parameters: { seasons, runs, seed, startingPlayers: targetPopulation },
        assumptions: simulationAssumptions(),
        seasons: aggregate,
        trajectories: initialTop.map((player) => ({
          ...player,
          overalls: trajectories.get(player.id),
        })),
      },
      null,
      2
    ),
    "utf8"
  );
  fs.writeFileSync(
    htmlPath,
    buildHtmlReport({
      aggregate,
      seasons,
      runs,
      seed,
      startingPlayers: targetPopulation,
      initialTop,
      trajectories,
    }),
    "utf8"
  );

  console.log(`Simulazione completata: ${runs} mondi x ${seasons} stagioni.`);
  console.log(`Report stampabile: ${htmlPath}`);
  console.log(`Dati CSV: ${csvPath}`);
  console.log(`Dati JSON: ${jsonPath}`);
}

function simulateTrainingSeason(
  players: SimPlayer[],
  clubs: Map<number, ClubInput>,
  random: () => number
) {
  for (let week = 0; week < 15; week += 1) {
    const clubRanks = rankWithinClubs(players);

    for (const player of players) {
      const club = player.clubId === null ? undefined : clubs.get(player.clubId);
      const plan = resolveTrainingPlan(club?.trainingPlan);
      const intensity = estimateTrainingIntensity(
        player.clubId === null ? null : clubRanks.get(player.id) ?? 99
      );
      const trainerEfficiency = getTrainerEfficiency(club?.trainerLevel ?? 1);
      // Il modello Club corrente non persiste ancora un livello del centro allenamento.
      // Manteniamo il moltiplicatore neutro finche la struttura non verra introdotta nel DB.
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

      // Piccola variabilita di utilizzo tra una settimana e l'altra.
      if (random() < 0.02) player.experience = Math.min(100, player.experience + 0.05);
    }
  }
}

function simulateTournamentSeason(players: SimPlayer[], random: () => number) {
  const definitions: Array<{ specialty: MatchSpecialty; tier: TournamentGrowthTier }> = [
    { specialty: "ITALIANA", tier: "INDIVIDUAL" },
    { specialty: "GORIZIANA", tier: "INDIVIDUAL" },
    { specialty: "TUTTI_DOPPI", tier: "INDIVIDUAL" },
    { specialty: "ITALIANA", tier: "INDIVIDUAL" },
    { specialty: "GORIZIANA", tier: "INDIVIDUAL" },
    { specialty: "TUTTI_DOPPI", tier: "INDIVIDUAL" },
    { specialty: "ITALIANA", tier: "INDIVIDUAL" },
    { specialty: "GORIZIANA", tier: "INDIVIDUAL" },
    { specialty: "TUTTI_DOPPI", tier: "INDIVIDUAL" },
    { specialty: "ITALIANA", tier: "INDIVIDUAL" },
    { specialty: "GORIZIANA", tier: "INDIVIDUAL" },
    { specialty: "TUTTI_DOPPI", tier: "INDIVIDUAL" },
  ];

  for (const definition of definitions) {
    const qualified = [...players]
      .sort((a, b) => calculateOverall(b) - calculateOverall(a))
      .slice(0, 256);
    simulateKnockout(qualified, definition.specialty, definition.tier, random);
  }

  const worldQualified = [...players]
    .sort((a, b) => calculateOverall(b) - calculateOverall(a))
    .slice(0, 256);
  simulateKnockout(worldQualified, null, "WORLD", random);

  const specialtyGroups = new Map<MatchSpecialty, SimPlayer[]>([
    ["ITALIANA", []],
    ["GORIZIANA", []],
    ["TUTTI_DOPPI", []],
  ]);
  for (const player of players.filter((candidate) => candidate.clubId !== null)) {
    specialtyGroups.get(bestSpecialty(player))!.push(player);
  }
  for (const [specialty, group] of specialtyGroups) {
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
    const playersAtStart = active.length;

    for (let index = 0; index < active.length; index += 2) {
      const first = active[index];
      const second = active[index + 1];

      if (!second) {
        next.push(first);
        continue;
      }

      const matchSpecialty =
        specialty ?? (["ITALIANA", "GORIZIANA", "TUTTI_DOPPI"] as const)[
          Math.floor(random() * 3)
        ];
      const firstRating = tournamentPerformance(first, matchSpecialty);
      const secondRating = tournamentPerformance(second, matchSpecialty);
      const firstProbability = clamp(0.5 + (firstRating - secondRating) * 0.015, 0.08, 0.92);
      const firstWins = random() < firstProbability;
      const winner = firstWins ? first : second;
      const loser = firstWins ? second : first;
      const placement = placementForFieldSize(playersAtStart);

      if (placement) applyGrowth(loser, tournamentGrowthValue(tier, placement));
      next.push(winner);
    }

    active = next;
  }

  applyGrowth(active[0], tournamentGrowthValue(tier, "WINNER"));
}

function placementForFieldSize(playersAtStart: number): TournamentPlacement | null {
  if (playersAtStart <= 2) return "FINALIST";
  if (playersAtStart <= 4) return "SEMI_FINAL";
  if (playersAtStart <= 8) return "QUARTER_FINAL";
  if (playersAtStart <= 16) return "ROUND_OF_16";
  if (playersAtStart <= 32) return "ROUND_OF_32";
  if (playersAtStart <= 64) return "ROUND_OF_64";
  if (playersAtStart <= 128) return "ROUND_OF_128";
  return null;
}

function applyGrowth(player: SimPlayer, growth: number) {
  for (const skill of TRAINING_SKILLS) {
    player[skill] = round(player[skill] + growth, 3);
  }
}

function tournamentPerformance(player: SimPlayer, specialty: MatchSpecialty) {
  return calculatePlayerPerformance(
    {
      ...player,
      form: 5,
      morale: 5,
    },
    specialty
  ).performanceRating;
}

function bestSpecialty(player: SimPlayer): MatchSpecialty {
  const specialties = ["ITALIANA", "GORIZIANA", "TUTTI_DOPPI"] as const;
  return [...specialties].sort(
    (a, b) =>
      calculateSpecialtyRating(player, b) - calculateSpecialtyRating(player, a)
  )[0];
}

function createAcademyGraduate({
  id,
  clubId,
  academyLevel,
  random,
}: {
  id: number;
  clubId: number | null;
  academyLevel: number;
  random: () => number;
}): SimPlayer {
  const overall = 50 + Math.floor(random() * 5) + Math.max(0, academyLevel - 1);
  const deviations = shuffle([-4, -3, -2, -1, 0, 1, 2, 3, 4], random);
  const bands = getAcademyTalentBands(academyLevel);
  const roll = random();
  let cumulative = 0;
  let talent = 55;

  for (const band of bands) {
    cumulative += band.probability;
    if (roll < cumulative) {
      talent = band.minimum + Math.floor(random() * (band.maximum - band.minimum + 1));
      break;
    }
  }

  return {
    id,
    sourceId: null,
    clubId,
    nationality: "🇮🇹",
    age: 17,
    ageDays: 0,
    talent,
    experience: 5 + random() * 8,
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

function snapshotSeason(
  players: SimPlayer[],
  season: number,
  retired: number,
  entrants: number
): SeasonSnapshot {
  const ranked = [...players].sort((a, b) => calculateOverall(b) - calculateOverall(a));
  const overalls = ranked.map(calculateOverall);
  const salaries = ranked.map((player) => calculatePlayerWeeklySalary(calculateOverall(player)));
  const values = ranked.map((player) =>
    calculatePlayerMarketValue({
      overall: calculateOverall(player),
      age: player.age,
      talent: player.talent,
    })
  );
  const top10 = ranked.slice(0, 10);

  return {
    season,
    players: players.length,
    avgOverall: average(overalls),
    medianOverall: percentile(overalls, 0.5),
    top10Average: average(top10.map(calculateOverall)),
    p90Overall: percentile(overalls, 0.9),
    p99Overall: percentile(overalls, 0.99),
    maxOverall: overalls[0] ?? 0,
    avgAge: average(players.map((player) => player.age)),
    avgTop10Age: average(top10.map((player) => player.age)),
    over80: overalls.filter((value) => value >= 80).length,
    over90: overalls.filter((value) => value >= 90).length,
    over100: overalls.filter((value) => value >= 100).length,
    retired,
    entrants,
    avgSalary: average(salaries),
    maxSalary: Math.max(...salaries, 0),
    avgValue: average(values),
    maxValue: Math.max(...values, 0),
  };
}

function aggregateRuns(results: SeasonSnapshot[][]): AggregateSnapshot[] {
  return Array.from({ length: seasons }, (_, index) => {
    const rows = results.map((run) => run[index]);
    const base = rows[0];
    const numericKeys = Object.keys(base).filter(
      (key) => key !== "season"
    ) as Array<Exclude<keyof SeasonSnapshot, "season">>;

    const aggregate: Record<string, number> = { season: index + 1, runs };
    for (const key of numericKeys) {
      aggregate[key] = round(average(rows.map((row) => row[key])), 2);
    }

    return aggregate as AggregateSnapshot;
  });
}

function simulationAssumptions() {
  return [
    "La simulazione legge i giocatori e i livelli dei club attuali ma lavora solo in memoria: il database non viene modificato.",
    "Ogni stagione contiene 15 aggiornamenti settimanali di crescita e decadimento.",
    "L'intensita di allenamento e stimata al 70% per i primi tre giocatori del club, 35% per gli altri tesserati e 15% per gli svincolati.",
    "I focus di allenamento usano il piano attuale del club; in sua assenza Precisione e Tattica.",
    "I 12 tornei individuali, il Mondiale e la Coppa Specialita sono simulati con bracket in memoria e le stesse tabelle di crescita del gioco.",
    "Il ricambio mantiene costante la popolazione iniziale: ogni ritiro genera un nuovo 17enne assegnato preferibilmente allo stesso club.",
    "La qualita dei nuovi giovani e una stima prudente derivata dai livelli Accademia correnti; non rappresenta una previsione esatta delle future scelte dei manager.",
    "Forma e morale sono neutralizzati a 5 nei tornei di stress test per isolare la deriva strutturale delle caratteristiche.",
  ];
}

function buildCsv(rows: AggregateSnapshot[]) {
  const headers = Object.keys(rows[0]);
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => String((row as any)[header])).join(",")),
  ].join("\n");
}

function buildHtmlReport({
  aggregate,
  seasons,
  runs,
  seed,
  startingPlayers,
  initialTop,
  trajectories,
}: {
  aggregate: AggregateSnapshot[];
  seasons: number;
  runs: number;
  seed: number;
  startingPlayers: number;
  initialTop: Array<{ id: number; name: string; startOverall: number; age: number }>;
  trajectories: Map<number, Array<number | null>>;
}) {
  const last = aggregate.at(-1)!;
  const assumptions = simulationAssumptions()
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const seasonRows = aggregate
    .map(
      (row) => `<tr>
        <td>${row.season}</td><td>${row.players}</td><td>${fmt(row.avgOverall)}</td>
        <td>${fmt(row.top10Average)}</td><td>${fmt(row.maxOverall)}</td>
        <td>${fmt(row.avgAge)}</td><td>${fmt(row.avgTop10Age)}</td>
        <td>${fmt(row.over80)}</td><td>${fmt(row.over90)}</td><td>${fmt(row.over100)}</td>
        <td>${fmt(row.retired)}</td><td>€ ${money(row.avgSalary)}</td><td>€ ${money(row.maxSalary)}</td>
      </tr>`
    )
    .join("");
  const trajectoryRows = initialTop
    .map((player) => {
      const values = trajectories.get(player.id) ?? [];
      const cells = [1, 5, 10, 15, 20]
        .filter((season) => season <= seasons)
        .map((season) => {
          const value = values[season - 1];
          return `<td>${value === null || value === undefined ? "ritirato" : fmt(value)}</td>`;
        })
        .join("");
      return `<tr><td>#${player.id}</td><td>${player.age}</td><td>${fmt(player.startOverall)}</td>${cells}</tr>`;
    })
    .join("");
  const trajectoryHeaders = [1, 5, 10, 15, 20]
    .filter((season) => season <= seasons)
    .map((season) => `<th>S${season}</th>`)
    .join("");

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>Biliardo Manager - Stress test ${seasons} stagioni</title>
<style>
@page { size: A4 landscape; margin: 12mm; }
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; color:#18221d; margin:0; font-size:11px; }
h1 { margin:0 0 4px; font-size:26px; }
h2 { margin:18px 0 8px; font-size:16px; border-bottom:2px solid #315c47; padding-bottom:4px; }
.meta { color:#5d6b64; margin-bottom:12px; }
.kpis { display:grid; grid-template-columns:repeat(6,1fr); gap:6px; margin:10px 0 14px; }
.kpi { border:1px solid #ccd8d1; border-radius:6px; padding:8px; background:#f7faf8; }
.kpi b { display:block; font-size:18px; color:#234b39; }
table { width:100%; border-collapse:collapse; margin:8px 0 14px; }
th, td { border:1px solid #cfd8d3; padding:5px 6px; text-align:right; white-space:nowrap; }
th { background:#eaf1ed; color:#234b39; }
th:first-child, td:first-child { text-align:center; }
.note { border-left:4px solid #315c47; padding:8px 10px; background:#f5f8f6; }
ul { margin:6px 0 0 18px; padding:0; }
li { margin:3px 0; }
.small { font-size:9px; color:#66736c; }
@media print {
  h2 { break-after:avoid; }
  table { break-inside:auto; }
  tr { break-inside:avoid; }
}
</style>
</head>
<body>
<h1>Biliardo Manager - Stress test di lungo periodo</h1>
<div class="meta">${runs} simulazioni x ${seasons} stagioni | popolazione iniziale ${startingPlayers} | seed base ${seed}</div>

<div class="kpis">
  <div class="kpi"><span>OVR medio finale</span><b>${fmt(last.avgOverall)}</b></div>
  <div class="kpi"><span>Top 10 medio</span><b>${fmt(last.top10Average)}</b></div>
  <div class="kpi"><span>OVR massimo</span><b>${fmt(last.maxOverall)}</b></div>
  <div class="kpi"><span>Giocatori 90+</span><b>${fmt(last.over90)}</b></div>
  <div class="kpi"><span>Giocatori 100+</span><b>${fmt(last.over100)}</b></div>
  <div class="kpi"><span>Eta media Top 10</span><b>${fmt(last.avgTop10Age)}</b></div>
</div>

<h2>Andamento stagione per stagione</h2>
<table>
<thead><tr>
<th>Stag.</th><th>Gioc.</th><th>OVR medio</th><th>Top 10</th><th>Max</th>
<th>Eta media</th><th>Eta Top10</th><th>80+</th><th>90+</th><th>100+</th>
<th>Ritiri</th><th>Stip. medio</th><th>Stip. max</th>
</tr></thead>
<tbody>${seasonRows}</tbody>
</table>

<h2>Traiettorie dei migliori giocatori iniziali - prima simulazione</h2>
<table>
<thead><tr><th>Giocatore</th><th>Eta iniz.</th><th>OVR iniz.</th>${trajectoryHeaders}</tr></thead>
<tbody>${trajectoryRows}</tbody>
</table>

<h2>Assunzioni del test</h2>
<div class="note"><ul>${assumptions}</ul></div>

<p class="small">Questo report e uno stress test di bilanciamento, non una previsione deterministica del mondo live. Serve a individuare derive strutturali di overall, eta, ritiri, stipendi e ricambio generazionale.</p>
</body>
</html>`;
}

function rankWithinClubs(players: SimPlayer[]) {
  const result = new Map<number, number>();
  const byClub = new Map<number, SimPlayer[]>();
  for (const player of players) {
    if (player.clubId === null) continue;
    const group = byClub.get(player.clubId) ?? [];
    group.push(player);
    byClub.set(player.clubId, group);
  }
  for (const group of byClub.values()) {
    group
      .sort((a, b) => calculateOverall(b) - calculateOverall(a))
      .forEach((player, index) => result.set(player.id, index + 1));
  }
  return result;
}

function resolveTrainingPlan(plan: ClubInput["trainingPlan"]) {
  const primary = isFocus(plan?.primaryFocus) ? plan!.primaryFocus as TrainingFocus : "precisione";
  const secondary =
    isFocus(plan?.secondaryFocus) && plan!.secondaryFocus !== primary
      ? plan!.secondaryFocus as TrainingFocus
      : "tattica";
  return { primary, secondary };
}

function isFocus(value: unknown): value is TrainingFocus {
  return typeof value === "string" && (TRAINING_SKILLS as readonly string[]).includes(value);
}

function estimateTrainingIntensity(rank: number | null) {
  if (rank === null) return 15;
  if (rank <= 3) return 70;
  return 35;
}

function skillValues(player: SimPlayer) {
  return Object.fromEntries(
    TRAINING_SKILLS.map((skill) => [skill, player[skill]])
  ) as Record<TrainingFocus, number>;
}

function pickClubId(clubs: ClubInput[], random: () => number) {
  if (clubs.length === 0) return null;
  return clubs[Math.floor(random() * clubs.length)]?.id ?? null;
}

function percentile(values: number[], p: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)));
  return sorted[index];
}

function average(values: number[]) {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function shuffle<T>(values: T[], random: () => number) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [values[index], values[target]] = [values[target], values[index]];
  }
  return values;
}

function createRandom(seedValue: number) {
  let state = seedValue >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function parseArgs(values: string[]) {
  const result: Record<string, any> = {};
  for (const value of values) {
    const match = /^--([^=]+)=(.+)$/.exec(value);
    if (!match) continue;
    const [, key, raw] = match;
    result[key] = /^\d+$/.test(raw) ? Number(raw) : raw;
  }
  return result;
}

function clampInteger(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, Math.trunc(value)));
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function fmt(value: number) {
  return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(value);
}

function money(value: number) {
  return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format(value);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]!);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
