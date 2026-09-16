import { getSeasonWeekDate } from "@/lib/individual-tournament-calendar";
import { addRomeDaysAtTime } from "@/lib/rome-calendar";

export const SPECIALTY_CUP_SEASON_WEEK = 14;
export const SPECIALTY_CUP_NAME = "Coppa Specialità";

export function buildSpecialtyCupCalendar(
  roundDates: ReadonlyMap<number, Date>
) {
  const leagueDate = getSeasonWeekDate(roundDates, SPECIALTY_CUP_SEASON_WEEK);

  if (!leagueDate) {
    throw new Error(
      `Data mancante per la settimana ${SPECIALTY_CUP_SEASON_WEEK}.`
    );
  }

  return {
    seasonWeek: SPECIALTY_CUP_SEASON_WEEK,
    name: SPECIALTY_CUP_NAME,
    leagueDate,
    drawAt: addRomeDaysAtTime(leagueDate, 1, 10),
    weekendStartsAt: addRomeDaysAtTime(leagueDate, 1, 10),
    weekendEndsAt: addRomeDaysAtTime(leagueDate, 2, 18),
  };
}
