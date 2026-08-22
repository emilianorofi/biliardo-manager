const FIRST_NAMES = [
  "Alessandro",
  "Andrea",
  "Davide",
  "Fabio",
  "Francesco",
  "Gabriele",
  "Lorenzo",
  "Luca",
  "Marco",
  "Matteo",
  "Nicola",
  "Paolo",
  "Riccardo",
  "Roberto",
  "Simone",
] as const;

const LAST_NAMES = [
  "Barbieri",
  "Benedetti",
  "Bianchi",
  "Conti",
  "De Luca",
  "Ferrari",
  "Fontana",
  "Galli",
  "Marchetti",
  "Moretti",
  "Ricci",
  "Rinaldi",
  "Romano",
  "Serra",
  "Villa",
] as const;

const STYLES = [
  "Regolare",
  "Tecnico",
  "Tattico",
  "Creativo",
  "Difensivo",
  "Offensivo",
] as const;

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

type PlayerProfile = {
  age: [number, number];
  overall: number;
  experience: [number, number];
  talent: [number, number];
};

const INITIAL_PROFILES: PlayerProfile[] = [
  {
    age: [35, 45],
    overall: 64,
    experience: [45, 63],
    talent: [62, 68],
  },
  {
    age: [35, 45],
    overall: 65,
    experience: [48, 66],
    talent: [63, 69],
  },
  {
    age: [35, 45],
    overall: 66,
    experience: [50, 68],
    talent: [64, 70],
  },
  {
    age: [55, 65],
    overall: 62,
    experience: [76, 90],
    talent: [59, 64],
  },
  {
    age: [20, 25],
    overall: 60,
    experience: [12, 28],
    talent: [72, 80],
  },
];

export type InitialPlayer = ReturnType<
  typeof createInitialPlayer
>;

export function createInitialSquad(leagueLevel = 1) {
  const firstNames = shuffle([...FIRST_NAMES]);
  const lastNames = shuffle([...LAST_NAMES]);
  const levelPenalty =
    Math.max(1, Math.min(4, leagueLevel)) - 1;

  return INITIAL_PROFILES.map((profile, index) =>
    createInitialPlayer(
      {
        ...profile,
        overall:
          profile.overall - levelPenalty * 3,
      },
      firstNames[index],
      lastNames[index]
    )
  );
}

function createInitialPlayer(
  profile: PlayerProfile,
  firstName: string,
  lastName: string
) {
  const attributes = shuffle([
    ...ATTRIBUTE_DEVIATIONS,
  ]).map((deviation) => profile.overall + deviation);

  return {
    firstName,
    lastName,
    nationality: "🇮🇹",
    age: randomInteger(...profile.age),
    form: randomInteger(5, 7),
    morale: randomInteger(5, 7),
    experience: randomInteger(...profile.experience),
    talent: randomInteger(...profile.talent),
    value: Math.pow(profile.overall - 50, 2) * 100,
    salary: Math.max(
      350,
      (profile.overall - 50) * 40
    ),
    image: "",
    style: [STYLES[randomInteger(0, STYLES.length - 1)]],
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

function randomInteger(minimum: number, maximum: number) {
  return Math.floor(
    Math.random() * (maximum - minimum + 1) + minimum
  );
}

function shuffle<T>(values: T[]) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInteger(0, index);
    [values[index], values[randomIndex]] = [
      values[randomIndex],
      values[index],
    ];
  }

  return values;
}
