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
  {
    id: 4,
    clubId: 2,
    firstName: "Marco",
    lastName: "Rossi",
    nationality: "🇮🇹",
    age: 24,
    form: 7,
    morale: 7,
    experience: 46,
    talent: 81,
    potential: 86,
    value: 97000,
    salary: 900,
    image: "",
    style: ["Regolare"],
    precisione: 83,
    diretto: 81,
    sponde: 79,
    tattica: 78,
    mentalita: 80,
    difesa: 76,
    realizzazione: 81,
    creativita: 77,
    misura: 82,
  },
  {
    id: 5,
    clubId: 3,
    firstName: "Andrea",
    lastName: "Verdi",
    nationality: "🇮🇹",
    age: 33,
    form: 8,
    morale: 8,
    experience: 74,
    talent: 88,
    potential: 89,
    value: 221000,
    salary: 1800,
    image: "",
    style: ["Tecnico"],
    precisione: 90,
    diretto: 87,
    sponde: 88,
    tattica: 89,
    mentalita: 86,
    difesa: 83,
    realizzazione: 88,
    creativita: 85,
    misura: 87,
  },
  {
    id: 6,
    clubId: 4,
    firstName: "Luca",
    lastName: "Bianchi",
    nationality: "🇮🇹",
    age: 21,
    form: 6,
    morale: 7,
    experience: 28,
    talent: 77,
    potential: 87,
    value: 58000,
    salary: 650,
    image: "",
    style: ["Creativo"],
    precisione: 74,
    diretto: 72,
    sponde: 77,
    tattica: 71,
    mentalita: 75,
    difesa: 73,
    realizzazione: 72,
    creativita: 79,
    misura: 74,
  },
  {
    id: 7,
    clubId: 5,
    firstName: "Paolo",
    lastName: "Neri",
    nationality: "🇮🇹",
    age: 37,
    form: 8,
    morale: 9,
    experience: 86,
    talent: 90,
    potential: 90,
    value: 310000,
    salary: 2400,
    image: "",
    style: ["Leader", "Difensivo"],
    precisione: 94,
    diretto: 89,
    sponde: 88,
    tattica: 92,
    mentalita: 91,
    difesa: 87,
    realizzazione: 90,
    creativita: 84,
    misura: 91,
  },
  {
    id: 8,
    clubId: null,
    firstName: "Davide",
    lastName: "Ricci",
    nationality: "🇮🇹",
    age: 27,
    form: 6,
    morale: 5,
    experience: 51,
    talent: 83,
    potential: 85,
    value: 134000,
    salary: 1200,
    image: "",
    style: ["Offensivo"],
    precisione: 82,
    diretto: 81,
    sponde: 84,
    tattica: 80,
    mentalita: 79,
    difesa: 78,
    realizzazione: 83,
    creativita: 85,
    misura: 81,
  },
  {
    id: 9,
    clubId: null,
    firstName: "Enrico",
    lastName: "Costa",
    nationality: "🇮🇹",
    age: 25,
    form: 6,
    morale: 5,
    experience: 35,
    talent: 78,
    potential: 84,
    value: 72000,
    salary: 750,
    image: "",
    style: ["Tattico"],
    precisione: 77,
    diretto: 75,
    sponde: 76,
    tattica: 80,
    mentalita: 74,
    difesa: 78,
    realizzazione: 75,
    creativita: 73,
    misura: 76,
  },
];

const initialAcademyPlayers = [
  {
    id: 1,
    clubId: 1,
    firstName: "Lorenzo",
    lastName: "Benedetti",
    nationality: "🇮🇹",
    age: 16,
    talent: 82,
    potential: 90,
    revealedAttributes: 6,
    totalAttributes: 9,
    revealedAttributeKeys: [
      "precisione",
      "diretto",
      "sponde",
      "tattica",
      "mentalita",
      "difesa",
    ],
    precisione: 78,
    diretto: 74,
    sponde: 81,
    tattica: 72,
    mentalita: 76,
    difesa: 70,
    realizzazione: 79,
    creativita: 83,
    misura: 77,
  },
  {
    id: 2,
    clubId: 1,
    firstName: "Matteo",
    lastName: "Morelli",
    nationality: "🇮🇹",
    age: 15,
    talent: 76,
    potential: 88,
    revealedAttributes: 4,
    totalAttributes: 9,
    revealedAttributeKeys: [
      "precisione",
      "sponde",
      "tattica",
      "creativita",
    ],
    precisione: 71,
    diretto: 74,
    sponde: 76,
    tattica: 69,
    mentalita: 73,
    difesa: 66,
    realizzazione: 72,
    creativita: 75,
    misura: 70,
  },
  {
    id: 3,
    clubId: 1,
    firstName: "Tommaso",
    lastName: "Ferri",
    nationality: "🇮🇹",
    age: 14,
    talent: 72,
    potential: 86,
    revealedAttributes: 2,
    totalAttributes: 9,
    revealedAttributeKeys: [
      "diretto",
      "misura",
    ],
    precisione: 70,
    diretto: 68,
    sponde: 72,
    tattica: 67,
    mentalita: 74,
    difesa: 69,
    realizzazione: 71,
    creativita: 76,
    misura: 73,
  },
];

const marketSeedTime = Date.now();

const initialTransferListings = [
  {
    id: 1,
    playerId: 4,
    sellerClubId: 2,
    listingType: "AUCTION",
    status: "ACTIVE",
    openingPrice: 9700,
    startsAt: new Date(marketSeedTime),
    endsAt: new Date(
      marketSeedTime + 72 * 60 * 60 * 1000
    ),
  },
  {
    id: 2,
    playerId: 5,
    sellerClubId: 3,
    listingType: "AUCTION",
    status: "ACTIVE",
    openingPrice: 22100,
    startsAt: new Date(marketSeedTime),
    endsAt: new Date(
      marketSeedTime + 49 * 60 * 60 * 1000
    ),
  },
  {
    id: 3,
    playerId: 6,
    sellerClubId: 4,
    listingType: "AUCTION",
    status: "ACTIVE",
    openingPrice: 5800,
    startsAt: new Date(marketSeedTime),
    endsAt: new Date(
      marketSeedTime + 18 * 60 * 60 * 1000
    ),
  },
  {
    id: 4,
    playerId: 7,
    sellerClubId: 5,
    listingType: "AUCTION",
    status: "ACTIVE",
    openingPrice: 31000,
    startsAt: new Date(marketSeedTime),
    endsAt: new Date(
      marketSeedTime + 36 * 60 * 60 * 1000
    ),
  },
  {
    id: 5,
    playerId: 8,
    sellerClubId: null,
    listingType: "FREE_AGENT",
    status: "ACTIVE",
    openingPrice: 13400,
    startsAt: new Date(marketSeedTime),
    endsAt: null,
  },
  {
    id: 6,
    playerId: 9,
    sellerClubId: null,
    listingType: "FREE_AGENT",
    status: "ACTIVE",
    openingPrice: 7200,
    startsAt: new Date(marketSeedTime),
    endsAt: null,
  },
];

const initialTransferBids = [
  {
    id: 1,
    listingId: 1,
    bidderClubId: 1,
    amount: 10200,
  },
  {
    id: 2,
    listingId: 2,
    bidderClubId: 2,
    amount: 23000,
  },
  {
    id: 3,
    listingId: 2,
    bidderClubId: 7,
    amount: 24000,
  },
  {
    id: 4,
    listingId: 3,
    bidderClubId: 8,
    amount: 6100,
  },
  {
    id: 5,
    listingId: 4,
    bidderClubId: 6,
    amount: 34100,
  },
];

async function main() {
  console.log("🌱 Inserimento dei dati iniziali...");

  for (const club of initialClubs) {
    const { id, ...clubData } = club;

    await prisma.club.upsert({
      where: {
        id,
      },
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
      where: {
        id,
      },
      update: playerData,
      create: {
        id,
        ...playerData,
      },
    });
  }

  for (const academyPlayer of initialAcademyPlayers) {
    const { id, ...academyPlayerData } =
      academyPlayer;

    await prisma.academyPlayer.upsert({
      where: {
        id,
      },
      update: academyPlayerData,
      create: {
        id,
        ...academyPlayerData,
      },
    });
  }

  await prisma.transferListing.deleteMany();

  for (const listing of initialTransferListings) {
    const { id, ...listingData } = listing;

    await prisma.transferListing.upsert({
      where: {
        id,
      },
      update: listingData,
      create: {
        id,
        ...listingData,
      },
    });
  }

  for (const bid of initialTransferBids) {
    const { id, ...bidData } = bid;

    await prisma.transferBid.upsert({
      where: {
        id,
      },
      update: bidData,
      create: {
        id,
        ...bidData,
      },
    });
  }

  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('"Club"', 'id'),
      GREATEST(
        (
          SELECT COALESCE(MAX(id), 1)
          FROM "Club"
        ),
        1
      ),
      true
    )
  `;

  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence(
        '"TransferListing"',
        'id'
      ),
      GREATEST(
        (
          SELECT COALESCE(MAX(id), 1)
          FROM "TransferListing"
        ),
        1
      ),
      true
    )
  `;

  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence(
        '"TransferBid"',
        'id'
      ),
      GREATEST(
        (
          SELECT COALESCE(MAX(id), 1)
          FROM "TransferBid"
        ),
        1
      ),
      true
    )
  `;

  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('"Player"', 'id'),
      GREATEST(
        (
          SELECT COALESCE(MAX(id), 1)
          FROM "Player"
        ),
        1
      ),
      true
    )
  `;

  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence(
        '"AcademyPlayer"',
        'id'
      ),
      GREATEST(
        (
          SELECT COALESCE(MAX(id), 1)
          FROM "AcademyPlayer"
        ),
        1
      ),
      true
    )
  `;

  const clubCount = await prisma.club.count();
  const playerCount = await prisma.player.count();
  const academyPlayerCount =
    await prisma.academyPlayer.count();
  const transferListingCount =
    await prisma.transferListing.count();
  const transferBidCount =
    await prisma.transferBid.count();

  console.log(
    `✅ ${clubCount} club presenti nel database`
  );

  console.log(
    `✅ ${playerCount} giocatori presenti nel database`
  );

  console.log(
    `✅ ${academyPlayerCount} giovani presenti nell'Accademia`
  );

  console.log(
    `✅ ${transferListingCount} inserzioni presenti nel Mercato`
  );

  console.log(
    `✅ ${transferBidCount} offerte presenti nel Mercato`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(
      "❌ Errore durante il seed:",
      error
    );

    await prisma.$disconnect();
    process.exit(1);
  });
