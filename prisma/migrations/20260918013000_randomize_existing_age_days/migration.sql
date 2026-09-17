UPDATE "Player"
SET "ageDays" = FLOOR(RANDOM() * 105)::INTEGER
WHERE "ageDays" = 0;

UPDATE "AcademyPlayer"
SET "ageDays" = FLOOR(RANDOM() * 105)::INTEGER
WHERE "ageDays" = 0;
