import { hasDatabaseUrl, createPrismaClient } from "@/lib/prisma";

export type CrawlRunSummary = {
  id: string;
  venueName: string;
  venueSlug: string;
  status: "success" | "partial" | "failed";
  fetchedCount: number;
  parsedCount: number;
  errorMessage?: string;
  startedAt: string;
  finishedAt?: string;
};

export async function getRecentCrawlRuns(limit = 25): Promise<CrawlRunSummary[]> {
  if (!hasDatabaseUrl()) {
    return [];
  }

  try {
    const prisma = createPrismaClient();
    const crawlRuns = await prisma.crawlRun.findMany({
      include: {
        venue: true
      },
      orderBy: {
        startedAt: "desc"
      },
      take: limit
    });

    return crawlRuns.map((run) => ({
      id: run.id,
      venueName: run.venue.name,
      venueSlug: run.venue.slug,
      status: run.status,
      fetchedCount: run.fetchedCount,
      parsedCount: run.parsedCount,
      errorMessage: run.errorMessage ?? undefined,
      startedAt: run.startedAt.toISOString(),
      finishedAt: run.finishedAt?.toISOString()
    }));
  } catch (error) {
    console.warn("Failed to load crawl runs:", error);

    return [];
  }
}

