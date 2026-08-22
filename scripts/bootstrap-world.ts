import "dotenv/config";

import { prisma } from "../lib/prisma";
import { bootstrapWorld } from "../lib/world-bootstrap";

async function main() {
  console.log("Creazione della piramide di Biliardo Manager...");

  const result = await bootstrapWorld();

  console.log(`Stagione: ${result.seasonNumber} (${result.seasonStatus})`);
  console.log(
    `Club: ${result.totalClubs} totali, ${result.createdClubs} creati`
  );
  console.log(`Club IA rinominati: ${result.renamedClubs}`);
  console.log(
    `Giocatori nelle squadre: ${result.totalClubPlayers} totali, ${result.createdPlayers} creati`
  );
  console.log(
    `Campionati: ${result.totalLeagues} totali, ${result.createdLeagues} creati`
  );
  console.log(`Partite create: ${result.createdFixtures}`);
  console.log("Piramide iniziale pronta.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Impossibile creare la piramide:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
