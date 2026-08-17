ALTER TABLE "Club"
ADD COLUMN "academyInitialized" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Club" AS club
SET "academyInitialized" = true
WHERE EXISTS (
  SELECT 1
  FROM "AcademyPlayer" AS academy_player
  WHERE academy_player."clubId" = club."id"
);

ALTER TABLE "Player"
DROP COLUMN "potential";

ALTER TABLE "AcademyPlayer"
DROP COLUMN "potential";
