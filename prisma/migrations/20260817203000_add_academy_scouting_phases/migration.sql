ALTER TABLE "AcademyPlayer"
ADD COLUMN "estimatedAttributeKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "nextScoutingAt" TIMESTAMP(3);

UPDATE "AcademyPlayer"
SET
  "estimatedAttributeKeys" = "revealedAttributeKeys",
  "revealedAttributeKeys" = ARRAY[]::TEXT[],
  "revealedAttributes" = 0,
  "nextScoutingAt" = (
    CASE
      WHEN (
        date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Rome')
        + INTERVAL '2 days 21 hours'
      ) AT TIME ZONE 'Europe/Rome' > CURRENT_TIMESTAMP
      THEN (
        date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Rome')
        + INTERVAL '2 days 21 hours'
      ) AT TIME ZONE 'Europe/Rome'
      ELSE (
        date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Rome')
        + INTERVAL '9 days 21 hours'
      ) AT TIME ZONE 'Europe/Rome'
    END
  );
