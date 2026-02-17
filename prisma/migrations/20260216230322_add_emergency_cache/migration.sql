-- CreateTable
CREATE TABLE "EmergencyNumbersCache" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedSources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyNumbersCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyNumbersCache_countryCode_key" ON "EmergencyNumbersCache"("countryCode");

-- CreateIndex
CREATE INDEX "EmergencyNumbersCache_expiresAt_idx" ON "EmergencyNumbersCache"("expiresAt");
