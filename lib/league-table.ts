export type LeagueTableEntry = {
  clubId: number;
  clubName: string;

  played: number;
  won: number;
  drawn: number;
  lost: number;

  pointsFor: number;
  pointsAgainst: number;
  points: number;
};

export type RankedLeagueTableEntry =
  LeagueTableEntry & {
    position: number;
    pointsDifference: number;
  };

export function createLeagueTable(
  entries: LeagueTableEntry[]
): RankedLeagueTableEntry[] {
  const sortedEntries =
    [...entries].sort(
      (
        firstEntry,
        secondEntry
      ) => {
        const pointsDifference =
          secondEntry.points -
          firstEntry.points;

        if (
          pointsDifference !== 0
        ) {
          return pointsDifference;
        }

        const firstDifference =
          firstEntry.pointsFor -
          firstEntry.pointsAgainst;

        const secondDifference =
          secondEntry.pointsFor -
          secondEntry.pointsAgainst;

        const scoreDifference =
          secondDifference -
          firstDifference;

        if (
          scoreDifference !== 0
        ) {
          return scoreDifference;
        }

        const pointsForDifference =
          secondEntry.pointsFor -
          firstEntry.pointsFor;

        if (
          pointsForDifference !== 0
        ) {
          return pointsForDifference;
        }

        const winsDifference =
          secondEntry.won -
          firstEntry.won;

        if (
          winsDifference !== 0
        ) {
          return winsDifference;
        }

        return firstEntry.clubName
          .localeCompare(
            secondEntry.clubName,
            "it"
          );
      }
    );

  return sortedEntries.map(
    (
      entry,
      index
    ) => ({
      ...entry,

      position:
        index + 1,

      pointsDifference:
        entry.pointsFor -
        entry.pointsAgainst,
    })
  );
}