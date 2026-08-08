ALTER TABLE "Club"
ADD COLUMN "normalizedName" TEXT,
ADD COLUMN "primaryColor" TEXT NOT NULL DEFAULT '#065F46',
ADD COLUMN "secondaryColor" TEXT NOT NULL DEFAULT '#FBBF24',
ADD COLUMN "crestStyle" TEXT NOT NULL DEFAULT 'CLASSIC';

UPDATE "Club"
SET "normalizedName" = lower(
    regexp_replace(btrim("name"), '\s+', ' ', 'g')
);

ALTER TABLE "Club"
ALTER COLUMN "normalizedName" SET NOT NULL;

CREATE UNIQUE INDEX "Club_normalizedName_key"
ON "Club"("normalizedName");
