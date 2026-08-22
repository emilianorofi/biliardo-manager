export const ROME_TIME_ZONE = "Europe/Rome";

export type WeeklyEventDefinition = {
  weekday: number;
  hour: number;
  minute?: number;
};

export const WEEKLY_UPDATE_EVENT = {
  weekday: 1,
  hour: 12,
  minute: 0,
} satisfies WeeklyEventDefinition;

export const ACADEMY_EVENT = {
  weekday: 2,
  hour: 21,
  minute: 0,
} satisfies WeeklyEventDefinition;

export const LEAGUE_EVENT = {
  weekday: 5,
  hour: 21,
  minute: 0,
} satisfies WeeklyEventDefinition;

export function getNextRomeWeeklyDate(
  from: Date,
  event: WeeklyEventDefinition
) {
  const candidate = getRomeWeeklyDate(
    from,
    event
  );

  if (candidate.getTime() > from.getTime()) {
    return candidate;
  }

  return addRomeWeeks(candidate, 1);
}

export function getCurrentRomeWeeklyWindow(
  now: Date,
  event: WeeklyEventDefinition =
    WEEKLY_UPDATE_EVENT
) {
  const thisWeek = getRomeWeeklyDate(
    now,
    event
  );

  if (now.getTime() < thisWeek.getTime()) {
    return {
      start: addRomeWeeks(thisWeek, -1),
      end: thisWeek,
    };
  }

  return {
    start: thisWeek,
    end: addRomeWeeks(thisWeek, 1),
  };
}

export function getCompletedRomeWeeklyWindow(
  scheduledAt: Date,
  event: WeeklyEventDefinition =
    WEEKLY_UPDATE_EVENT
) {
  const end = getRomeWeeklyDate(
    scheduledAt,
    event
  );

  return {
    start: addRomeWeeks(end, -1),
    end,
  };
}

export function addRomeWeeks(
  value: Date,
  weeks: number
) {
  const local = getRomeParts(value);
  const localDate = new Date(
    Date.UTC(
      local.year,
      local.month - 1,
      local.day
    )
  );

  localDate.setUTCDate(
    localDate.getUTCDate() + weeks * 7
  );

  return zonedDateTimeToUtc({
    year: localDate.getUTCFullYear(),
    month: localDate.getUTCMonth() + 1,
    day: localDate.getUTCDate(),
    hour: local.hour,
    minute: local.minute,
    second: local.second,
  });
}

export function addRomeDaysAtTime(
  value: Date,
  days: number,
  hour: number,
  minute = 0
) {
  const local = getRomeParts(value);
  const localDate = new Date(
    Date.UTC(
      local.year,
      local.month - 1,
      local.day
    )
  );

  localDate.setUTCDate(
    localDate.getUTCDate() + days
  );

  return zonedDateTimeToUtc({
    year: localDate.getUTCFullYear(),
    month: localDate.getUTCMonth() + 1,
    day: localDate.getUTCDate(),
    hour,
    minute,
    second: 0,
  });
}

export function formatRomeDateKey(
  value: Date
) {
  const local = getRomeParts(value);

  return [
    local.year,
    String(local.month).padStart(2, "0"),
    String(local.day).padStart(2, "0"),
  ].join("-");
}

export function getRomeParts(value: Date) {
  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: ROME_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }
  ).formatToParts(value);
  const read = (
    type: Intl.DateTimeFormatPartTypes
  ) =>
    Number(
      parts.find(
        (part) => part.type === type
      )?.value ?? 0
    );

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

function getRomeWeeklyDate(
  reference: Date,
  event: WeeklyEventDefinition
) {
  const local = getRomeParts(reference);
  const localDate = new Date(
    Date.UTC(
      local.year,
      local.month - 1,
      local.day
    )
  );
  const currentWeekday =
    localDate.getUTCDay();
  const mondayOffset =
    (currentWeekday || 7) - 1;
  const targetOffset =
    (event.weekday || 7) - 1;

  localDate.setUTCDate(
    localDate.getUTCDate() -
      mondayOffset +
      targetOffset
  );

  return zonedDateTimeToUtc({
    year: localDate.getUTCFullYear(),
    month: localDate.getUTCMonth() + 1,
    day: localDate.getUTCDate(),
    hour: event.hour,
    minute: event.minute ?? 0,
    second: 0,
  });
}

function zonedDateTimeToUtc({
  year,
  month,
  day,
  hour,
  minute,
  second,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}) {
  const guessedTimestamp = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second
  );
  const guessedDate =
    new Date(guessedTimestamp);
  const represented =
    getRomeParts(guessedDate);
  const representedTimestamp = Date.UTC(
    represented.year,
    represented.month - 1,
    represented.day,
    represented.hour,
    represented.minute,
    represented.second
  );
  const offset =
    representedTimestamp -
    guessedTimestamp;

  return new Date(
    guessedTimestamp - offset
  );
}
