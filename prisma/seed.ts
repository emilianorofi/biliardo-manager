import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DIRECT_URL o DATABASE_URL non è configurata nel file .env."
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const initialClubs = [
  {
    id: 1,
    name: "Accademia Pontedera",
    shortName: "ACP",
    logo: "/logos/default.png",
    city: "Pontedera",
    country: "Italia",
    reputation: 50,
    fans: 1000,
    balance: 50000,
    weeklyExpenses: 5000,
    weeklyIncome: 6000,
    trainerLevel: 3,
    youthCoachLevel: 3,
  },
  {
    id: 2,
    name: "BassaMarea",
    shortName: "BMA",
    logo: "/logos/default.png",
    city: "Livorno",
    country: "Italia",
    reputation: 48,
    fans: 900,
    balance: 48000,
    weeklyExpenses: 4800,
    weeklyIncome: 5600,
    trainerLevel: 3,
    youthCoachLevel: 2,
  },
  {
    id: 3,
    name: "Golden Cue",
    shortName: "GCU",
    logo: "/logos/default.png",
    city: "Pisa",
    country: "Italia",
    reputation: 52,
    fans: 1100,
    balance: 52000,
    weeklyExpenses: 5100,
    weeklyIncome: 6200,
    trainerLevel: 4,
    youthCoachLevel: 3,
  },
  {
    id: 4,
    name: "Master Club",
    shortName: "MCL",
    logo: "/logos/default.png",
    city: "Lucca",
    country: "Italia",
    reputation: 46,
    fans: 850,
    balance: 45000,
    weeklyExpenses: 4600,
    weeklyIncome: 5400,
    trainerLevel: 2,
    youthCoachLevel: 3,
  },
  {
    id: 5,
    name: "Black Ball",
    shortName: "BBA",
    logo: "/logos/default.png",
    city: "Prato",
    country: "Italia",
    reputation: 49,
    fans: 950,
    balance: 49000,
    weeklyExpenses: 4900,
    weeklyIncome: 5700,
    trainerLevel: 3,
    youthCoachLevel: 4,
  },
  {
    id: 6,
    name: "Diamond Team",
    shortName: "DIA",
    logo: "/logos/default.png",
    city: "Firenze",
    country: "Italia",
    reputation: 54,
    fans: 1300,
    balance: 56000,
    weeklyExpenses: 5400,
    weeklyIncome: 6700,
    trainerLevel: 4,
    youthCoachLevel: 4,
  },
  {
    id: 7,
    name: "Top Spin",
    shortName: "TOP",
    logo: "/logos/default.png",
    city: "Siena",
    country: "Italia",
    reputation: 47,
    fans: 880,
    balance: 47000,
    weeklyExpenses: 4700,
    weeklyIncome: 5500,
    trainerLevel: 2,
    youthCoachLevel: 2,
  },
  {
    id: 8,
    name: "Royal Biliards",
    shortName: "ROY",
    logo: "/logos/default.png",
    city: "Arezzo",
    country: "Italia",
    reputation: 53,
    fans: 1200,
    balance: 55000,
    weeklyExpenses: 5300,
    weeklyIncome: 6500,
    trainerLevel: 4,
    youthCoachLevel: 3,
  },
];

const initialPlayers = [
  {
    id: 1,
    clubId: 1,
    firstName: "Francesco",
    lastName: "Galli",
    nationality: "🇮🇹",
    age: 29,
    form: 8,
    morale: 9,
    experience: 72,
    talent: 86,
    potential: 88,
    value: 425000,
    salary: 2300,
    image: "/players/galli.png",
    style: ["Leader", "Freddo", "Carismatico"],
    precisione: 92,
    diretto: 84,
    sponde: 78,
    tattica: 88,
    mentalita: 82,
    difesa: 65,
    realizzazione: 89,
    creativita: 72,
    misura: 93,
  },
  {
    id: 2,
    clubId: 1,
    firstName: "Pierre",
    lastName: "Martin",
    nationality: "🇫🇷",
    age: 32,
    form: 6,
    morale: 7,
    experience: 68,
    talent: 80,
    potential: 82,
    value: 330000,
    salary: 1900,
    image: "/players/martin.png",
    style: ["Tecnico"],
    precisione: 81,
    diretto: 80,
    sponde: 77,
    tattica: 82,
    mentalita: 75,
    difesa: 70,
    realizzazione: 77,
    creativita: 71,
    misura: 80,
  },
  {
    id: 3,
    clubId: 1,
    firstName: "Carlos",
    lastName: "Lopez",
    nationality: "🇪🇸",
    age: 27,
    form: 7,
    morale: 6,
    experience: 55,
    talent: 78,
    potential: 84,
    value: 250000,
    salary: 1500,
    image: "/players/lopez.png",
    style: ["Aggressivo"],
    precisione: 78,
    diretto: 76,
    sponde: 83,
    tattica: 74,
    mentalita: 72,
    difesa: 67,
    realizzazione: 75,
    creativita: 79,
    misura: 73,
  },
];

async function main() {
  console.log("🌱 Inserimento dei dati iniziali...");

  for (const club of initialClubs) {
    const { id, ...clubData } = club;

    await prisma.club.upsert({
      where: { id },
      update: clubData,
      create: {
        id,
        ...clubData,
      },
    });
  }

  for (const player of initialPlayers) {
    const { id, ...playerData } = player;

    await prisma.player.upsert({
      where: { id },
      update: playerData,
      create: {
        id,
        ...playerData,
      },
    });
  }

  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('"Club"', 'id'),
      GREATEST(
        (SELECT COALESCE(MAX(id), 1) FROM "Club"),
        1
      ),
      true
    )
  `;

  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('"Player"', 'id'),
      GREATEST(
        (SELECT COALESCE(MAX(id), 1) FROM "Player"),
        1
      ),
      true
    )
  `;

  const clubCount = await prisma.club.count();
  const playerCount = await prisma.player.count();

  console.log(`✅ ${clubCount} club presenti nel database`);
  console.log(`✅ ${playerCount} giocatori presenti nel database`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("❌ Errore durante il seed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });