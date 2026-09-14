import { getNationalityDisplay } from "@/lib/nationalities";
import {
  getPlayerSurnamePoolSize,
  getStablePlayerSurname,
} from "@/lib/player-names";
import { prisma } from "@/lib/prisma";

type NamedPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  nationality: string;
};

type SurnameAssignment = NamedPlayer & {
  nextLastName: string;
  nationalityCode: string;
};

const DEFAULT_BATCH_SIZE = 40;

export async function synchronizePlayerSurnamesBatch(
  batchSize = DEFAULT_BATCH_SIZE
) {
  const safeBatchSize = Math.max(1, Math.min(60, Math.trunc(batchSize)));
  const [players, academyPlayers] = await Promise.all([
    prisma.player.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nationality: true,
      },
    }),
    prisma.academyPlayer.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nationality: true,
      },
    }),
  ]);

  const playerAssignments = buildSurnameAssignments(players);
  const academyAssignments = buildSurnameAssignments(academyPlayers);
  const changedPlayers = playerAssignments.filter(
    (assignment) => assignment.lastName !== assignment.nextLastName
  );
  const changedAcademyPlayers = academyAssignments.filter(
    (assignment) => assignment.lastName !== assignment.nextLastName
  );
  const playerBatch = changedPlayers.slice(0, safeBatchSize);
  const academyBatch = changedAcademyPlayers.slice(0, safeBatchSize);

  for (const assignment of playerBatch) {
    await prisma.$transaction([
      prisma.player.update({
        where: { id: assignment.id },
        data: { lastName: assignment.nextLastName },
      }),
      prisma.playerFixtureAppearance.updateMany({
        where: { playerId: assignment.id },
        data: { playerLastName: assignment.nextLastName },
      }),
      prisma.trainingResult.updateMany({
        where: { playerId: assignment.id },
        data: { playerLastName: assignment.nextLastName },
      }),
    ]);
  }

  for (const assignment of academyBatch) {
    await prisma.academyPlayer.update({
      where: { id: assignment.id },
      data: { lastName: assignment.nextLastName },
    });
  }

  return {
    totalPlayers: players.length,
    updatedPlayers: playerBatch.length,
    remainingPlayers: Math.max(0, changedPlayers.length - playerBatch.length),
    totalAcademyPlayers: academyPlayers.length,
    updatedAcademyPlayers: academyBatch.length,
    remainingAcademyPlayers: Math.max(
      0,
      changedAcademyPlayers.length - academyBatch.length
    ),
    surnameDiversity: buildSurnameDiversity(playerAssignments),
  };
}

export function buildSurnameAssignments(
  players: readonly NamedPlayer[]
): SurnameAssignment[] {
  const usedNamesByNationality = new Map<string, Set<string>>();

  return players.map((player) => {
    const nationality = getNationalityDisplay(player.nationality);
    if (nationality.code === "---") {
      return {
        ...player,
        nextLastName: player.lastName,
        nationalityCode: nationality.code,
      };
    }

    const usedNames =
      usedNamesByNationality.get(nationality.code) ?? new Set<string>();
    const poolSize = getPlayerSurnamePoolSize(player.nationality);
    let nextLastName = getStablePlayerSurname(player.nationality, player.id);

    for (let offset = 0; offset < poolSize; offset += 1) {
      const candidate = getStablePlayerSurname(
        player.nationality,
        player.id,
        offset
      );
      const fullNameKey = normalizeName(`${player.firstName} ${candidate}`);
      if (!usedNames.has(fullNameKey)) {
        nextLastName = candidate;
        usedNames.add(fullNameKey);
        break;
      }
    }

    usedNamesByNationality.set(nationality.code, usedNames);

    return {
      ...player,
      nextLastName,
      nationalityCode: nationality.code,
    };
  });
}

function buildSurnameDiversity(assignments: readonly SurnameAssignment[]) {
  const byNationality = new Map<string, Set<string>>();

  for (const assignment of assignments) {
    if (assignment.nationalityCode === "---") continue;
    const surnames =
      byNationality.get(assignment.nationalityCode) ?? new Set<string>();
    surnames.add(assignment.nextLastName);
    byNationality.set(assignment.nationalityCode, surnames);
  }

  return Object.fromEntries(
    [...byNationality.entries()]
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([code, surnames]) => [code, surnames.size])
  );
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase("it-IT");
}
