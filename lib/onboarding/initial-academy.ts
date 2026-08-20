import type { TrainingFocus } from "@/lib/training-engine";
import { getNextAcademyScoutingAt } from "@/lib/academy-scouting";

const FIRST_NAMES = [
  "Alessio",
  "Christian",
  "Daniele",
  "Edoardo",
  "Federico",
  "Filippo",
  "Giacomo",
  "Leonardo",
  "Mattia",
  "Samuele",
  "Tommaso",
] as const;

const LAST_NAMES = [
  "Bellini",
  "Caruso",
  "Fabbri",
  "Ferri",
  "Gentili",
  "Leoni",
  "Mancini",
  "Marini",
  "Pellegrini",
  "Santini",
  "Vitale",
] as const;

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

const ATTRIBUTE_DEVIATIONS = [
  -4,
  -3,
  -2,
  -1,
  0,
  1,
  2,
  3,
  4,
] as const;

type AcademyProfile = {
  age: 14 | 15 | 16;
  overall: [number, number];
  talent: [number, number];
  estimatedAttributes: number;
};

const INITIAL_ACADEMY_PROFILES: AcademyProfile[] = [
  {
    age: 16,
    overall: [50, 52],
    talent: [45, 55],
    estimatedAttributes: 6,
  },
  {
    age: 15,
    overall: [45, 47],
    talent: [48, 58],
    estimatedAttributes: 4,
  },
  {
    age: 14,
    overall: [40, 42],
    talent: [50, 60],
    estimatedAttributes: 2,
  },
];

const WEEKLY_PROFILE_BY_AGE: Record<
  AcademyProfile["age"],
  AcademyProfile
> = Object.fromEntries(
  INITIAL_ACADEMY_PROFILES.map((profile) => [
    profile.age,
    profile,
  ])
) as Record<AcademyProfile["age"], AcademyProfile>;

export type InitialAcademyPlayer = ReturnType<
  typeof createAcademyPlayer
>;

export function createInitialAcademy() {
  const firstNames = shuffle([...FIRST_NAMES]);
  const lastNames = shuffle([...LAST_NAMES]);

  return INITIAL_ACADEMY_PROFILES.map((profile, index) =>
    createAcademyPlayer(
      profile,
      firstNames[index],
      lastNames[index]
    )
  );
}

export function createWeeklyAcademyPlayer({
  from = new Date(),
  random = Math.random,
}: {
  from?: Date;
  random?: () => number;
} = {}) {
  const age = randomInteger(14, 16, random) as AcademyProfile["age"];
  const profile = WEEKLY_PROFILE_BY_AGE[age];
  const firstName =
    FIRST_NAMES[randomInteger(0, FIRST_NAMES.length - 1, random)];
  const lastName =
    LAST_NAMES[randomInteger(0, LAST_NAMES.length - 1, random)];

  return createAcademyPlayer(
    {
      ...profile,
      estimatedAttributes: 3,
    },
    firstName,
    lastName,
    {
      from,
      random,
    }
  );
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
  const targetOverall = randomInteger(
    ...profile.overall,
    random
  );
  const attributes = shuffle(
    [...ATTRIBUTE_DEVIATIONS],
    random
  ).map(
    (deviation) => targetOverall + deviation
  );
  const estimatedAttributeKeys = shuffle(
    [...ATTRIBUTE_KEYS],
    random
  ).slice(0, profile.estimatedAttributes);

  return {
    firstName,
    lastName,
    nationality: "🇮🇹",
    age: profile.age,
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
  const randomValue = Math.min(
    0.999999999999,
    Math.max(0, random())
  );

  return Math.floor(
    randomValue * (maximum - minimum + 1) + minimum
  );
}

function shuffle<T>(
  values: T[],
  random = Math.random
) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInteger(0, index, random);
    [values[index], values[randomIndex]] = [
      values[randomIndex],
      values[index],
    ];
  }

  return values;
}
