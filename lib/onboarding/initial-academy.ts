import type { TrainingFocus } from "@/lib/training-engine";
import { getNextAcademyScoutingAt } from "@/lib/academy-scouting";
import {
  getAcademyLevel,
  getAcademyTalentBands,
} from "@/lib/economy-rules";
import { getGeneratedPlayerName } from "@/lib/player-names";

const ATTRIBUTE_KEYS: TrainingFocus[] = [
  "precisione",
  "diretto",
  "sponde",
  "tattica",
  "mentalita",
  "difesa",
  "realizzazione",
  "creativita",
  "misura",
];

const ATTRIBUTE_DEVIATIONS = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as const;

type AcademyProfile = {
  age: 14 | 15 | 16;
  overall: [number, number];
  talent: [number, number];
  estimatedAttributes: number;
};

const INITIAL_ACADEMY_PROFILES: AcademyProfile[] = [
  { age: 16, overall: [50, 52], talent: [45, 55], estimatedAttributes: 3 },
  { age: 15, overall: [45, 47], talent: [48, 58], estimatedAttributes: 3 },
  { age: 14, overall: [40, 42], talent: [50, 60], estimatedAttributes: 3 },
];

const WEEKLY_PROFILE_BY_AGE: Record<AcademyProfile["age"], AcademyProfile> =
  Object.fromEntries(
    INITIAL_ACADEMY_PROFILES.map((profile) => [profile.age, profile])
  ) as Record<AcademyProfile["age"], AcademyProfile>;

export type InitialAcademyPlayer = ReturnType<typeof createAcademyPlayer>;

export function createInitialAcademy() {
  const nameSequence = randomInteger(0, 100000);

  return INITIAL_ACADEMY_PROFILES.map((profile, index) => {
    const name = getGeneratedPlayerName("🇮🇹", nameSequence + index);
    return createAcademyPlayer(profile, name.firstName, name.lastName);
  });
}

export function createWeeklyAcademyPlayer({
  from = new Date(),
  random = Math.random,
  academyLevel = 1,
}: {
  from?: Date;
  random?: () => number;
  academyLevel?: number;
} = {}) {
  const age = randomInteger(14, 16, random) as AcademyProfile["age"];
  const profile = WEEKLY_PROFILE_BY_AGE[age];
  const nameSequence = randomInteger(0, 100000, random);
  const name = getGeneratedPlayerName("🇮🇹", nameSequence);
  const academy = getAcademyLevel(academyLevel);
  const overallBonus = randomInteger(
    academy.overallBonus[0],
    academy.overallBonus[1],
    random
  );
  const talent = rollAcademyTalent(academyLevel, random);

  return createAcademyPlayer(
    {
      ...profile,
      overall: [
        profile.overall[0] + overallBonus,
        profile.overall[1] + overallBonus,
      ],
      talent: [talent, talent],
      estimatedAttributes: 3,
    },
    name.firstName,
    name.lastName,
    { from, random }
  );
}

function rollAcademyTalent(
  academyLevel: number,
  random: () => number
) {
  const bands = getAcademyTalentBands(academyLevel);
  const roll = normalizedRandom(random);
  let cumulative = 0;

  for (const band of bands) {
    cumulative += band.probability;
    if (roll < cumulative) {
      return randomInteger(band.minimum, band.maximum, random);
    }
  }

  const fallback = bands[bands.length - 1];
  return randomInteger(fallback.minimum, fallback.maximum, random);
}

function createAcademyPlayer(
  profile: AcademyProfile,
  firstName: string,
  lastName: string,
  {
    from = new Date(),
    random = Math.random,
  }: {
    from?: Date;
    random?: () => number;
  } = {}
) {
  const targetOverall = randomInteger(...profile.overall, random);
  const attributes = shuffle([...ATTRIBUTE_DEVIATIONS], random).map(
    (deviation) => targetOverall + deviation
  );
  const estimatedAttributeKeys = shuffle([...ATTRIBUTE_KEYS], random).slice(
    0,
    profile.estimatedAttributes
  );

  return {
    firstName,
    lastName,
    nationality: "🇮🇹",
    age: profile.age,
    ageDays: randomInteger(0, 104, random),
    talent: randomInteger(...profile.talent, random),
    revealedAttributes: 0,
    totalAttributes: 9,
    estimatedAttributeKeys,
    revealedAttributeKeys: [],
    nextScoutingAt: getNextAcademyScoutingAt(from),
    precisione: attributes[0],
    diretto: attributes[1],
    sponde: attributes[2],
    tattica: attributes[3],
    mentalita: attributes[4],
    difesa: attributes[5],
    realizzazione: attributes[6],
    creativita: attributes[7],
    misura: attributes[8],
  };
}

function randomInteger(
  minimum: number,
  maximum: number,
  random = Math.random
) {
  const randomValue = normalizedRandom(random);
  return Math.floor(randomValue * (maximum - minimum + 1) + minimum);
}

function normalizedRandom(random: () => number) {
  return Math.min(0.999999999999, Math.max(0, random()));
}

function shuffle<T>(values: T[], random = Math.random) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInteger(0, index, random);
    [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
  }

  return values;
}
