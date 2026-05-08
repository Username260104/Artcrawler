-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "VenueType" AS ENUM ('museum', 'gallery', 'nonprofit');

-- CreateEnum
CREATE TYPE "AuthorityTier" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "ExhibitionStatus" AS ENUM ('upcoming', 'ongoing', 'endingSoon', 'ended');

-- CreateEnum
CREATE TYPE "CrawlRunStatus" AS ENUM ('success', 'partial', 'failed');

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "VenueType" NOT NULL,
    "authorityTier" "AuthorityTier" NOT NULL,
    "district" TEXT,
    "officialUrl" TEXT NOT NULL,
    "exhibitionUrl" TEXT NOT NULL,
    "crawlerKey" TEXT,
    "crawlerEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exhibition" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artists" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ExhibitionStatus" NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "sourceHash" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exhibition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlRun" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "status" "CrawlRunStatus" NOT NULL,
    "fetchedCount" INTEGER NOT NULL DEFAULT 0,
    "parsedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "CrawlRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Venue_slug_key" ON "Venue"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Exhibition_sourceHash_key" ON "Exhibition"("sourceHash");

-- CreateIndex
CREATE INDEX "Exhibition_venueId_idx" ON "Exhibition"("venueId");

-- CreateIndex
CREATE INDEX "Exhibition_startDate_endDate_idx" ON "Exhibition"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Exhibition_status_idx" ON "Exhibition"("status");

-- CreateIndex
CREATE INDEX "CrawlRun_venueId_idx" ON "CrawlRun"("venueId");

-- CreateIndex
CREATE INDEX "CrawlRun_startedAt_idx" ON "CrawlRun"("startedAt");

-- AddForeignKey
ALTER TABLE "Exhibition" ADD CONSTRAINT "Exhibition_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlRun" ADD CONSTRAINT "CrawlRun_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
