import type { Prisma } from "@/generated/prisma/client";
import {
  TRAINING_SKILLS,
  type TrainingFocus,
} from "@/lib/training-engine";

const ROME_TIME_ZONE = "Europe/Rome";

const RANGE_WIDTH_BY_COACH_LEVEL: Record<number, number> = {
  1: 16,
  2: 14,
  3: 12,
  4: 10,
  5: 8,
};

type DueAcademyPlayer = {
  id: number;
};

export type AcademyEstimatedRange = {
  minimum: number;
  maximum: number;
};

export function getAcademyRangeWidth(youthCoachLevel: number) {
  const normalizedLevel = Math.min(
    5,
    Math.max(1, Math.round(youthCoachLevel))
  );

  return RANGE_WIDTH_BY_COACH_LEVEL[normalizedLevel];
}

export function getAcademyEstimatedRange({
  playerId,
  attribute,
  value,
  youthCoachLevel,
}: {
  playerId: number;
  attribute: TrainingFocus;
  value: number;
  youthCoachLevel: number;
}): AcademyEstimatedRange {
  const rangeWidth = getAcademyRangeWidth(youthCoachLevel);
  const realValue = Math.min(100, Math.max(0, Math.round(value)));
  const minimumStart = Math.max(0, realValue - rangeWidth);
  const maximumStart = Math.min(realValue, 100 - rangeWidth);
  const possibleStarts = maximumStart - minimumStart + 1;
  const startOffset =
    stableHash(`${playerId}:${attribute}:${rangeWidth}`) %
    possibleStarts;
  const minimum = minimumStart + startOffset;

  return {
    minimum,
    maximum: minimum + rangeWidth,
  };
}

export function getNextAcademyScoutingAt(from = new Date()) {
  const local = getZonedParts(from);
  const localDay = new Date(
    Date.UTC(local.year, local.month - 1, local.day)
  );
  const daysUntilWednesday = (3 - localDay.getUTCDay() + 7) % 7;
  const candidateDay = new Date(localDay);

  candidateDay.setUTCDate(
    candidateDay.getUTCDate() + daysUntilWednesday
  );

  let candidate = zonedDateTimeToUtc({
    year: candidateDay.getUTCFullYear(),
    month: candidateDay.getUTCMonth() + 1,
    day: candidateDay.getUTCDate(),
    hour: 21,
  });

  if (candidate.getTime() <= from.getTime()) {
    candidateDay.setUTCDate(candidateDay.getUTCDate() + 7);
    candidate = zonedDateTimeToUtc({
      year: candidateDay.getUTCFullYear(),
      month: candidateDay.getUTCMonth() + 1,
      day: candidateDay.getUTCDate(),
      hour: 21,
    });
  }

  return candidate;
}

export async function advanceAcademyScouting(
  transaction: Prisma.TransactionClient,
  clubId: number,
  now = new Date()
) {
  const duePlayers = await transaction.$queryRaw<DueAcademyPlayer[]>`
    SELECT "id"
    FROM "AcademyPlayer"
    WHERE "clubId" = ${clubId}
      AND "nextScoutingAt" IS NOT NULL
      AND "nextScoutingAt" <= ${now}
    FOR UPDATE
  `;

  if (duePlayers.length === 0) {
    return;
  }

  const players = await transaction.academyPlayer.findMany({
    where: {
      id: {
        in: duePlayers.map((player) => player.id),
      },
    },
  });

  for (const player of players) {
    const estimatedAttributeKeys = normalizeKeys(
      player.estimatedAttributeKeys
    );
    const revealedAttributeKeys = normalizeKeys(
      player.revealedAttributeKeys
    );
    let nextScoutingAt = player.nextScoutingAt;

    while (
      nextScoutingAt &&
      nextScoutingAt.getTime() <= now.getTime() &&
      revealedAttributeKeys.length < TRAINING_SKILLS.length
    ) {
      if (estimatedAttributeKeys.length < TRAINING_SKILLS.length) {
        const unknownAttributes = TRAINING_SKILLS.filter(
          (attribute) => !estimatedAttributeKeys.includes(attribute)
        );
        const nextAttribute = pickAttribute(
          unknownAttributes,
          player.id + estimatedAttributeKeys.length * 17
        );

        estimatedAttributeKeys.push(nextAttribute);
      } else {
        const estimatedOnlyAttributes = estimatedAttributeKeys.filter(
          (attribute) => !revealedAttributeKeys.includes(attribute)
        );
        const nextAttribute = pickAttribute(
          estimatedOnlyAttributes,
          player.id + revealedAttributeKeys.length * 31
        );

        revealedAttributeKeys.push(nextAttribute);
      }

      nextScoutingAt =
        revealedAttributeKeys.length === TRAINING_SKILLS.length
          ? null
          : getNextAcademyScoutingAt(
              new Date(nextScoutingAt.getTime() + 1000)
            );
    }

    await transaction.academyPlayer.update({
      where: {
        id: player.id,
      },
      data: {
        estimatedAttributeKeys,
        revealedAttributeKeys,
        revealedAttributes: revealedAttributeKeys.length,
        nextScoutingAt,
      },
    });
  }
}

function normalizeKeys(values: string[]) {
  return TRAINING_SKILLS.filter((attribute) =>
    values.includes(attribute)
  );
}

function pickAttribute(
  values: readonly TrainingFocus[],
  seed: number
) {
  return values[Math.abs(seed) % values.length];
}

function stableHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getZonedParts(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ROME_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

function zonedDateTimeToUtc({
  year,
  month,
  day,
  hour,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
}) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour));
  const represented = getZonedParts(utcGuess);
  const representedTimestamp = Date.UTC(
    represented.year,
    represented.month - 1,
    represented.day,
    represented.hour,
    represented.minute,
    represented.second
  );
  const offset = representedTimestamp - utcGuess.getTime();

  return new Date(utcGuess.getTime() - offset);
}
