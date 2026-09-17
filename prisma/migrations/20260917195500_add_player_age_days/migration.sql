ALTER TABLE "Player"
ADD COLUMN "ageDays" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "AcademyPlayer"
ADD COLUMN "ageDays" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Player"
ADD CONSTRAINT "Player_ageDays_range" CHECK ("ageDays" >= 0 AND "ageDays" <= 104);

ALTER TABLE "AcademyPlayer"
ADD CONSTRAINT "AcademyPlayer_ageDays_range" CHECK ("ageDays" >= 0 AND "ageDays" <= 104);
