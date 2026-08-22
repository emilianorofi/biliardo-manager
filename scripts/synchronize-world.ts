import "dotenv/config";

import { prisma } from "../lib/prisma";
import { bootstrapWorld } from "../lib/world-bootstrap";
import { synchronizeWorldLeagueProgress } from "../lib/world-league-synchronization";

async function main() {
  console.log("Aggiornamento dei club IA...");
  const world = await bootstrapWorld();
  console.log(`Club IA rinominati: ${world.renamedClubs}`);

  console.log("Allineamento dei campionati alla Prima Serie...");
  const result = await synchronizeWorldLeagueProgress();

  console.log(`Giornata di riferimento: ${result.targetRound}`);
  console.log(`Campionati allineati: ${result.synchronizedLeagues}`);
  console.log(`Partite IA azzerate: ${result.resetFixtures}`);
  console.log(`Risultati IA ricreati: ${result.playedFixtures}`);
  console.log(
    result.alreadySynchronized
      ? "I campionati erano già sincronizzati."
      : "Tutti i campionati sono ora sincronizzati."
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Impossibile sincronizzare i campionati:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
