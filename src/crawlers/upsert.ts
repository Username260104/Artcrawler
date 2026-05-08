import { getExhibitionStatus } from "../lib/status";
import { createPrismaClient } from "../lib/prisma";
import { venues } from "../data/venues";
import { createSourceHash } from "./shared/hash";
import type { ParsedExhibition } from "./types";

export async function upsertVenueAndExhibitions(
  venueSlug: string,
  exhibitions: ParsedExhibition[]
): Promise<{ venueId: string; upsertedCount: number }> {
  const venue = venues.find((item) => item.slug === venueSlug);

  if (!venue) {
    throw new Error(`Unknown venue slug: ${venueSlug}`);
  }

  const prisma = createPrismaClient();
  const dbVenue = await prisma.venue.upsert({
    where: {
      slug: venue.slug
    },
    update: {
      name: venue.name,
      type: venue.type,
      authorityTier: venue.authorityTier,
      district: venue.district,
      officialUrl: venue.officialUrl,
      exhibitionUrl: venue.exhibitionUrl,
      crawlerKey: venue.crawlerKey,
      crawlerEnabled: venue.crawlerEnabled
    },
    create: {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      type: venue.type,
      authorityTier: venue.authorityTier,
      district: venue.district,
      officialUrl: venue.officialUrl,
      exhibitionUrl: venue.exhibitionUrl,
      crawlerKey: venue.crawlerKey,
      crawlerEnabled: venue.crawlerEnabled
    }
  });

  for (const exhibition of exhibitions) {
    const sourceHash = createSourceHash(exhibition);
    const startDate = toDate(exhibition.startDate);
    const endDate = toDate(exhibition.endDate);

    await prisma.exhibition.upsert({
      where: {
        sourceHash
      },
      update: {
        venueId: dbVenue.id,
        title: exhibition.title,
        artists: exhibition.artists,
        startDate,
        endDate,
        status: getExhibitionStatus(startDate, endDate),
        sourceUrl: exhibition.sourceUrl,
        imageUrl: exhibition.imageUrl,
        confidence: exhibition.confidence,
        lastSeenAt: new Date()
      },
      create: {
        venueId: dbVenue.id,
        title: exhibition.title,
        artists: exhibition.artists,
        startDate,
        endDate,
        status: getExhibitionStatus(startDate, endDate),
        sourceUrl: exhibition.sourceUrl,
        imageUrl: exhibition.imageUrl,
        confidence: exhibition.confidence,
        sourceHash
      }
    });
  }

  return {
    venueId: dbVenue.id,
    upsertedCount: exhibitions.length
  };
}

export async function recordCrawlRun({
  venueSlug,
  status,
  fetchedCount,
  parsedCount,
  errorMessage
}: {
  venueSlug: string;
  status: "success" | "partial" | "failed";
  fetchedCount: number;
  parsedCount: number;
  errorMessage?: string;
}) {
  const venue = venues.find((item) => item.slug === venueSlug);

  if (!venue) {
    throw new Error(`Unknown venue slug: ${venueSlug}`);
  }

  const prisma = createPrismaClient();
  const dbVenue = await prisma.venue.upsert({
    where: {
      slug: venue.slug
    },
    update: {
      name: venue.name,
      type: venue.type,
      authorityTier: venue.authorityTier,
      district: venue.district,
      officialUrl: venue.officialUrl,
      exhibitionUrl: venue.exhibitionUrl,
      crawlerKey: venue.crawlerKey,
      crawlerEnabled: venue.crawlerEnabled
    },
    create: {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      type: venue.type,
      authorityTier: venue.authorityTier,
      district: venue.district,
      officialUrl: venue.officialUrl,
      exhibitionUrl: venue.exhibitionUrl,
      crawlerKey: venue.crawlerKey,
      crawlerEnabled: venue.crawlerEnabled
    }
  });

  await prisma.crawlRun.create({
    data: {
      venueId: dbVenue.id,
      status,
      fetchedCount,
      parsedCount,
      errorMessage,
      finishedAt: new Date()
    }
  });
}

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

