-- CreateTable
CREATE TABLE "Club" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "logo" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "reputation" INTEGER NOT NULL DEFAULT 1,
    "fans" INTEGER NOT NULL DEFAULT 0,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "weeklyExpenses" INTEGER NOT NULL DEFAULT 0,
    "weeklyIncome" INTEGER NOT NULL DEFAULT 0,
    "trainerLevel" INTEGER NOT NULL DEFAULT 1,
    "youthCoachLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "form" INTEGER NOT NULL DEFAULT 5,
    "morale" INTEGER NOT NULL DEFAULT 5,
    "experience" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "talent" DOUBLE PRECISION NOT NULL,
    "potential" DOUBLE PRECISION NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "salary" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL DEFAULT '',
    "style" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "precisione" DOUBLE PRECISION NOT NULL,
    "diretto" DOUBLE PRECISION NOT NULL,
    "sponde" DOUBLE PRECISION NOT NULL,
    "tattica" DOUBLE PRECISION NOT NULL,
    "mentalita" DOUBLE PRECISION NOT NULL,
    "difesa" DOUBLE PRECISION NOT NULL,
    "realizzazione" DOUBLE PRECISION NOT NULL,
    "creativita" DOUBLE PRECISION NOT NULL,
    "misura" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyPlayer" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "talent" DOUBLE PRECISION NOT NULL,
    "potential" DOUBLE PRECISION NOT NULL,
    "revealedAttributes" INTEGER NOT NULL DEFAULT 0,
    "totalAttributes" INTEGER NOT NULL DEFAULT 9,
    "precisione" DOUBLE PRECISION,
    "diretto" DOUBLE PRECISION,
    "sponde" DOUBLE PRECISION,
    "tattica" DOUBLE PRECISION,
    "mentalita" DOUBLE PRECISION,
    "difesa" DOUBLE PRECISION,
    "realizzazione" DOUBLE PRECISION,
    "creativita" DOUBLE PRECISION,
    "misura" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formation" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "slotAPlayerId" INTEGER,
    "slotBPlayerId" INTEGER,
    "slotCPlayerId" INTEGER,
    "savedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Player_clubId_idx" ON "Player"("clubId");

-- CreateIndex
CREATE INDEX "AcademyPlayer_clubId_idx" ON "AcademyPlayer"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "Formation_clubId_key" ON "Formation"("clubId");

-- CreateIndex
CREATE INDEX "Formation_slotAPlayerId_idx" ON "Formation"("slotAPlayerId");

-- CreateIndex
CREATE INDEX "Formation_slotBPlayerId_idx" ON "Formation"("slotBPlayerId");

-- CreateIndex
CREATE INDEX "Formation_slotCPlayerId_idx" ON "Formation"("slotCPlayerId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyPlayer" ADD CONSTRAINT "AcademyPlayer_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_slotAPlayerId_fkey" FOREIGN KEY ("slotAPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_slotBPlayerId_fkey" FOREIGN KEY ("slotBPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_slotCPlayerId_fkey" FOREIGN KEY ("slotCPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
