const TUESDAY = 2;
const MATCH_HOUR = 16;

export function getNextLeagueDate(
  referenceDate: Date
) {
  for (
    let daysToAdd = 0;
    daysToAdd <= 7;
    daysToAdd += 1
  ) {
    const candidate =
      new Date(referenceDate);

    candidate.setDate(
      referenceDate.getDate() +
        daysToAdd
    );

    candidate.setHours(
      MATCH_HOUR,
      0,
      0,
      0
    );

    const isLeagueDay =
      candidate.getDay() ===
      TUESDAY;
    const isFutureDate =
      candidate.getTime() >
      referenceDate.getTime();

    if (
      isLeagueDay &&
      isFutureDate
    ) {
      return candidate;
    }
  }

  throw new Error(
    "Impossibile determinare la prima giornata."
  );
}

export function buildWeeklyRoundDates(
  firstRoundDate: Date,
  totalRounds: number
) {
  const dates: Date[] = [];
  const currentDate =
    new Date(firstRoundDate);

  for (
    let roundIndex = 0;
    roundIndex < totalRounds;
    roundIndex += 1
  ) {
    dates.push(
      new Date(currentDate)
    );

    currentDate.setDate(
      currentDate.getDate() + 7
    );
  }

  return dates;
}
