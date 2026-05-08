import { createPrismaClient, hasDatabaseUrl } from "../lib/prisma";
import { getAdapterByKey, getEnabledAdapters } from "./registry";
import { recordCrawlRun, upsertVenueAndExhibitions } from "./upsert";
import type { CrawlAdapter, ParsedExhibition } from "./types";

export type CrawlerRunOptions = {
  dryRun?: boolean;
  adapterKey?: string;
  logExhibitions?: boolean;
};

export type AdapterRunResult = {
  adapterKey: string;
  venueSlug: string;
  status: "success" | "partial" | "failed";
  parsedCount: number;
  exhibitions?: ParsedExhibition[];
  errorMessage?: string;
};

export type CrawlerRunSummary = {
  adapters: number;
  success: number;
  partial: number;
  failed: number;
  parsedCount: number;
};

export type CrawlerRunReport = {
  summary: CrawlerRunSummary;
  results: AdapterRunResult[];
};

export async function runCrawler(options: CrawlerRunOptions = {}): Promise<CrawlerRunReport> {
  const dryRun = Boolean(options.dryRun);
  const adapters = options.adapterKey
    ? [getRequiredAdapter(options.adapterKey)]
    : getEnabledAdapters();

  if (!dryRun && !hasDatabaseUrl()) {
    throw new Error("DATABASE_URL is required unless dryRun is enabled.");
  }

  const results: AdapterRunResult[] = [];

  for (const adapter of adapters) {
    results.push(await runAdapter(adapter, { ...options, dryRun }));
  }

  if (!dryRun && hasDatabaseUrl()) {
    await createPrismaClient().$disconnect();
  }

  return {
    summary: summarizeResults(results),
    results
  };
}

export function formatCrawlerReport(report: CrawlerRunReport): string {
  return JSON.stringify(report, null, 2);
}

async function runAdapter(
  adapter: CrawlAdapter,
  options: CrawlerRunOptions & { dryRun: boolean }
): Promise<AdapterRunResult> {
  try {
    const exhibitions = await adapter.crawl();

    if (options.dryRun) {
      return {
        adapterKey: adapter.key,
        venueSlug: adapter.venueSlug,
        status: exhibitions.length > 0 ? "success" : "partial",
        parsedCount: exhibitions.length,
        exhibitions: options.logExhibitions ? exhibitions : undefined
      };
    }

    const result = await upsertVenueAndExhibitions(adapter.venueSlug, exhibitions);
    await recordCrawlRun({
      venueSlug: adapter.venueSlug,
      status: exhibitions.length > 0 ? "success" : "partial",
      fetchedCount: exhibitions.length,
      parsedCount: result.upsertedCount
    });

    return {
      adapterKey: adapter.key,
      venueSlug: adapter.venueSlug,
      status: exhibitions.length > 0 ? "success" : "partial",
      parsedCount: result.upsertedCount
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!options.dryRun && hasDatabaseUrl()) {
      await recordCrawlRun({
        venueSlug: adapter.venueSlug,
        status: "failed",
        fetchedCount: 0,
        parsedCount: 0,
        errorMessage: message
      });
    }

    return {
      adapterKey: adapter.key,
      venueSlug: adapter.venueSlug,
      status: "failed",
      parsedCount: 0,
      errorMessage: message
    };
  }
}

function getRequiredAdapter(key: string): CrawlAdapter {
  const adapter = getAdapterByKey(key);

  if (!adapter) {
    throw new Error(`Unknown adapter: ${key}`);
  }

  return adapter;
}

function summarizeResults(results: AdapterRunResult[]): CrawlerRunSummary {
  return {
    adapters: results.length,
    success: results.filter((result) => result.status === "success").length,
    partial: results.filter((result) => result.status === "partial").length,
    failed: results.filter((result) => result.status === "failed").length,
    parsedCount: results.reduce((sum, result) => sum + result.parsedCount, 0)
  };
}

