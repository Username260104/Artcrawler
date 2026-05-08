import { getFixtureExhibitionsWithVenues } from "@/data/exhibitions.fixture";
import { readExhibitionSnapshot } from "@/data/exhibition-snapshot";
import { toDateKey } from "@/lib/calendar";
import { hasDatabaseUrl, createPrismaClient } from "@/lib/prisma";
import type { ExhibitionWithVenue } from "@/lib/types";

export type ExhibitionDatasetSource = "database" | "snapshot" | "fixture";

export type ExhibitionDataset = {
  exhibitions: ExhibitionWithVenue[];
  source: ExhibitionDatasetSource;
  generatedAt?: string;
};

export async function getExhibitionsWithVenues(): Promise<ExhibitionWithVenue[]> {
  return (await getExhibitionDataset()).exhibitions;
}

export async function getExhibitionDataset(): Promise<ExhibitionDataset> {
  if (!hasDatabaseUrl()) {
    return getLocalDataset();
  }

  try {
    const prisma = createPrismaClient();
    const exhibitions = await prisma.exhibition.findMany({
      include: {
        venue: true
      },
      orderBy: [
        {
          startDate: "asc"
        },
        {
          title: "asc"
        }
      ]
    });

    if (exhibitions.length === 0) {
      return getLocalDataset();
    }

    return {
      exhibitions: exhibitions.map((exhibition) => ({
        id: exhibition.id,
        venueId: exhibition.venueId,
        title: exhibition.title,
        artists: exhibition.artists,
        startDate: toDateKey(exhibition.startDate),
        endDate: toDateKey(exhibition.endDate),
        status: exhibition.status,
        sourceUrl: exhibition.sourceUrl,
        imageUrl: exhibition.imageUrl ?? undefined,
        confidence: exhibition.confidence,
        sourceHash: exhibition.sourceHash,
        firstSeenAt: exhibition.firstSeenAt.toISOString(),
        lastSeenAt: exhibition.lastSeenAt.toISOString(),
        venue: {
          id: exhibition.venue.id,
          name: exhibition.venue.name,
          slug: exhibition.venue.slug,
          type: exhibition.venue.type,
          authorityTier: exhibition.venue.authorityTier,
          district: exhibition.venue.district ?? undefined,
          officialUrl: exhibition.venue.officialUrl,
          exhibitionUrl: exhibition.venue.exhibitionUrl,
          crawlerKey: exhibition.venue.crawlerKey ?? undefined,
          crawlerEnabled: exhibition.venue.crawlerEnabled
        }
      })),
      source: "database"
    };
  } catch (error) {
    console.warn("Falling back to local exhibitions:", error);

    return getLocalDataset();
  }
}

async function getLocalDataset(): Promise<ExhibitionDataset> {
  const snapshot = await readExhibitionSnapshot();

  if (snapshot && snapshot.exhibitions.length > 0) {
    return {
      exhibitions: snapshot.exhibitions,
      source: "snapshot",
      generatedAt: snapshot.generatedAt
    };
  }

  return {
    exhibitions: getFixtureExhibitionsWithVenues(),
    source: "fixture"
  };
}
