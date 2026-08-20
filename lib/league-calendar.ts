import {
  addRomeWeeks,
  getNextRomeWeeklyDate,
  LEAGUE_EVENT,
} from "@/lib/rome-calendar";

export function getNextLeagueDate(
  referenceDate: Date
) {
  return getNextRomeWeeklyDate(
    referenceDate,
    LEAGUE_EVENT
  );
}

export function buildWeeklyRoundDates(
  firstRoundDate: Date,
  totalRounds: number
) {
  const dates: Date[] = [];
  for (
    let roundIndex = 0;
    roundIndex < totalRounds;
    roundIndex += 1
  ) {
    dates.push(
      addRomeWeeks(
        firstRoundDate,
        roundIndex
      )
    );
  }

  return dates;
}
