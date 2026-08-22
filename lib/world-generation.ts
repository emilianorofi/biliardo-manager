import type { WorldLeagueLevel } from "@/lib/world-structure";
import {
  TOTAL_WORLD_CLUBS,
  WORLD_NATIONALITY_ALLOCATION,
} from "@/lib/world-structure";

const CLUB_CITIES = [
  "Torino",
  "Milano",
  "Bergamo",
  "Brescia",
  "Verona",
  "Padova",
  "Bologna",
  "Parma",
  "Modena",
  "Genova",
  "Firenze",
  "Prato",
  "Pisa",
  "Livorno",
  "Roma",
  "Viterbo",
  "Perugia",
  "Ancona",
  "Pescara",
  "Napoli",
  "Caserta",
  "Bari",
  "Lecce",
  "Cosenza",
  "Reggio Calabria",
  "Palermo",
  "Catania",
  "Cagliari",
  "Sassari",
  "Olbia",
] as const;

const CLUB_IDENTITIES = [
  "Biliardo",
  "Sporting",
  "Master",
  "Accademia",
] as const;

const CLUB_COLORS = [
  ["#065F46", "#FBBF24"],
  ["#1E3A8A", "#E5E7EB"],
  ["#7F1D1D", "#FDE68A"],
  ["#3F3F46", "#22C55E"],
] as const;

const STYLES = [
  "Regolare",
  "Tecnico",
  "Tattico",
  "Creativo",
  "Difensivo",
  "Offensivo",
] as const;

const LEVEL_OVERALLS: Record<
  WorldLeagueLevel,
  readonly number[]
> = {
  1: [66, 65, 64, 62, 60],
  2: [63, 62, 61, 59, 57],
  3: [60, 59, 58, 56, 54],
  4: [57, 56, 55, 53, 51],
};

type NamePool = {
  firstNames: readonly string[];
  lastNames: readonly string[];
};

const NAME_POOLS: Record<string, NamePool> = {
  "🇮🇹": {
    firstNames: [
      "Alessandro", "Andrea", "Antonio", "Carlo", "Claudio",
      "Daniele", "Davide", "Enrico", "Fabio", "Federico",
      "Francesco", "Gabriele", "Giovanni", "Lorenzo", "Luca",
      "Marco", "Matteo", "Michele", "Nicola", "Paolo",
    ],
    lastNames: [
      "Barbieri", "Benedetti", "Bianchi", "Colombo", "Conti",
      "Costa", "De Luca", "Ferrari", "Fontana", "Galli",
      "Greco", "Marchetti", "Marino", "Moretti", "Ricci",
      "Rinaldi", "Romano", "Rossi", "Serra", "Villa",
    ],
  },
  "🇦🇷": {
    firstNames: [
      "Alejandro", "Carlos", "Diego", "Emiliano", "Federico",
      "Gonzalo", "Guillermo", "Javier", "Juan", "Lautaro",
    ],
    lastNames: [
      "Acosta", "Alvarez", "Benitez", "Cabrera", "Diaz",
      "Fernandez", "Garcia", "Gimenez", "Gomez", "Lopez",
      "Martinez", "Pereyra", "Romero",
    ],
  },
  "🇩🇪": {
    firstNames: [
      "Christian", "Felix", "Florian", "Jan", "Lukas", "Max", "Tobias",
    ],
    lastNames: [
      "Bauer", "Becker", "Fischer", "Hoffmann", "Klein", "Schneider",
    ],
  },
  "🇺🇾": {
    firstNames: ["Alejandro", "Diego", "Eliomar", "Federico", "Martin", "Robert"],
    lastNames: ["Berrutti", "Capote", "Larrosa", "Mendez"],
  },
  "🇫🇷": {
    firstNames: ["Alexis", "Florian", "Guillaume", "Julien", "Michael", "Pierre"],
    lastNames: ["Carreau", "Guerin", "Lambert", "Martin"],
  },
  "🇩🇰": {
    firstNames: ["Anders", "Henrik", "Jonas", "Kasper", "Mikkel", "Tejs"],
    lastNames: ["Jensen", "Kristoffersen", "Sondergaard"],
  },
  "🇧🇪": {
    firstNames: ["Gianluca", "Ismaele", "Miguel", "Rohnny"],
    lastNames: ["Bustos", "Degreef", "Trentino"],
  },
  "🇱🇺": { firstNames: ["David"], lastNames: ["Pereira"] },
  "🇨🇭": { firstNames: ["Ulisse"], lastNames: ["Calzi"] },
  "🇨🇿": { firstNames: ["Jan"], lastNames: ["Dvoracek"] },
  "🇦🇹": { firstNames: ["Andreas"], lastNames: ["Felser"] },
  "🇸🇲": { firstNames: ["Maurizio"], lastNames: ["Gobbi"] },
  "🇧🇷": { firstNames: ["Gonzalo"], lastNames: ["Camio"] },
  "🇳🇱": { firstNames: ["Marco"], lastNames: ["Wolfs"] },
  "🇪🇸": { firstNames: ["Antonio"], lastNames: ["Sanchez"] },
  "🇳🇴": { firstNames: ["Erling"], lastNames: ["Hansen"] },
  "🇵🇹": { firstNames: ["Tiago"], lastNames: ["Silva"] },
  "🇸🇪": { firstNames: ["Erik"], lastNames: ["Lindberg"] },
  "🇦🇱": { firstNames: ["Arben"], lastNames: ["Hoxha"] },
  "🇱🇮": { firstNames: ["Noah"], lastNames: ["Buechel"] },
  "🇹🇷": { firstNames: ["Emre"], lastNames: ["Yilmaz"] },
  "🇨🇴": { firstNames: ["Santiago"], lastNames: ["Ramirez"] },
  "🇰🇷": { firstNames: ["Min-jun"], lastNames: ["Kim"] },
  "🇯🇵": { firstNames: ["Haruto"], lastNames: ["Sato"] },
  "🇪🇬": { firstNames: ["Omar"], lastNames: ["Hassan"] },
};

export type GeneratedWorldPlayer = ReturnType<
  typeof createGeneratedWorldPlayer
>;

export function createAiClubBlueprint(sequence: number) {
  if (sequence < 0 || sequence >= TOTAL_WORLD_CLUBS) {
    throw new Error("La posizione del club IA non è valida.");
  }

  const city = CLUB_CITIES[Math.floor(sequence / CLUB_IDENTITIES.length)];
  const identity = CLUB_IDENTITIES[sequence % CLUB_IDENTITIES.length];
  const colors = CLUB_COLORS[sequence % CLUB_COLORS.length];
  const serial = String(sequence + 1).padStart(3, "0");

  return {
    name: `${identity} ${city}`,
    normalizedName: `world-ai-${serial}`,
    shortName: `IA${serial}`,
    city,
    country: "Italia",
    primaryColor: colors[0],
    secondaryColor: colors[1],
    crestStyle: "CLASSIC",
    reputation: Math.max(1, 55 - Math.floor(sequence / 8) * 2),
    fans: Math.max(100, 1400 - sequence * 8),
    balance: 50000,
    weeklyExpenses: 0,
    weeklyIncome: 0,
    trainerLevel: Math.max(1, 4 - Math.floor(sequence / 32)),
    youthCoachLevel: Math.max(1, 3 - Math.floor(sequence / 64)),
  };
}

export function buildNationalityQueue(
  existingCounts: ReadonlyMap<string, number>,
  requiredPlayers: number
) {
  const queue: string[] = [];

  for (const nationality of WORLD_NATIONALITY_ALLOCATION) {
    const existing = existingCounts.get(nationality.flag) ?? 0;
    const missing = Math.max(0, nationality.count - existing);

    for (let index = 0; index < missing; index += 1) {
      queue.push(nationality.flag);
    }
  }

  const fallbackFlags = WORLD_NATIONALITY_ALLOCATION.flatMap(
    (nationality) =>
      Array.from(
        { length: nationality.count },
        () => nationality.flag
      )
  );

  let fallbackIndex = 0;
  while (queue.length < requiredPlayers) {
    queue.push(fallbackFlags[fallbackIndex % fallbackFlags.length]);
    fallbackIndex += 1;
  }

  return deterministicShuffle(queue, 20260822).slice(0, requiredPlayers);
}

export function createGeneratedWorldPlayer({
  leagueLevel,
  rosterIndex,
  nationality,
  nationalitySequence,
  seed,
}: {
  leagueLevel: WorldLeagueLevel;
  rosterIndex: number;
  nationality: string;
  nationalitySequence: number;
  seed: number;
}) {
  const random = createSeededRandom(seed);
  const pool = NAME_POOLS[nationality] ?? NAME_POOLS["🇮🇹"];
  const firstName =
    pool.firstNames[nationalitySequence % pool.firstNames.length];
  const lastName =
    pool.lastNames[
      Math.floor(nationalitySequence / pool.firstNames.length) %
        pool.lastNames.length
    ];
  const targetOverall =
    LEVEL_OVERALLS[leagueLevel][rosterIndex % 5] + randomInteger(-2, 2, random);
  const deviations = deterministicShuffle(
    [-4, -3, -2, -1, 0, 1, 2, 3, 4],
    seed + 17
  );
  const attributes = deviations.map((deviation) =>
    clamp(targetOverall + deviation, 35, 90)
  );
  const ageRanges = [
    [28, 42],
    [24, 38],
    [20, 34],
    [36, 55],
    [18, 25],
  ] as const;
  const ageRange = ageRanges[rosterIndex % ageRanges.length];
  const age = randomInteger(ageRange[0], ageRange[1], random);
  const talent = randomInteger(
    rosterIndex === 4 ? 72 : 58,
    rosterIndex === 4 ? 88 : 78,
    random
  );

  return {
    firstName,
    lastName,
    nationality,
    age,
    form: randomInteger(5, 7, random),
    morale: randomInteger(5, 7, random),
    experience: Math.min(
      95,
      Math.max(5, (age - 16) * 1.5 + randomInteger(0, 12, random))
    ),
    talent,
    value: Math.max(1000, Math.pow(targetOverall - 45, 2) * 120),
    salary: Math.max(300, (targetOverall - 45) * 45),
    image: "",
    style: [STYLES[randomInteger(0, STYLES.length - 1, random)]],
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

export function normalizeNationalityFlag(value: string) {
  const normalized = value.trim().toLocaleLowerCase("it-IT");

  for (const nationality of WORLD_NATIONALITY_ALLOCATION) {
    if (
      value.trim() === nationality.flag ||
      normalized === nationality.country.toLocaleLowerCase("it-IT")
    ) {
      return nationality.flag;
    }
  }

  return value.trim();
}

function deterministicShuffle<T>(values: readonly T[], seed: number) {
  const shuffled = [...values];
  const random = createSeededRandom(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInteger(0, index, random);
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInteger(
  minimum: number,
  maximum: number,
  random: () => number
) {
  return Math.floor(random() * (maximum - minimum + 1) + minimum);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
