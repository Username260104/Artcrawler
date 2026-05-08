import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { venues } from "./venues";
import { getExhibitionStatus } from "../lib/status";
import { createSourceHash } from "../crawlers/shared/hash";
import type { CrawlerRunReport } from "../crawlers/run";
import type { ParsedExhibition } from "../crawlers/types";
import type { ExhibitionWithVenue } from "../lib/types";

export type ExhibitionSnapshot = {
  generatedAt: string;
  summary: CrawlerRunReport["summary"];
  exhibitions: ExhibitionWithVenue[];
};

export const snapshotFilePath = path.join(process.cwd(), "data", "exhibitions.snapshot.json");

export async function readExhibitionSnapshot(): Promise<ExhibitionSnapshot | null> {
  try {
    const file = await readFile(snapshotFilePath, "utf8");
    const parsed = JSON.parse(file);

    if (!isExhibitionSnapshot(parsed)) {
      return null;
    }

    return {
      ...parsed,
      exhibitions: parsed.exhibitions.map((exhibition) => ({
        ...exhibition,
        status: getExhibitionStatus(exhibition.startDate, exhibition.endDate)
      }))
    };
  } catch {
    return null;
  }
}

export async function writeExhibitionSnapshotFromReport(
  report: CrawlerRunReport
): Promise<ExhibitionSnapshot> {
  const snapshot = buildExhibitionSnapshot(report);

  await mkdir(path.dirname(snapshotFilePath), { recursive: true });
  await writeFile(snapshotFilePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  return snapshot;
}

function buildExhibitionSnapshot(report: CrawlerRunReport): ExhibitionSnapshot {
  const generatedAt = new Date().toISOString();
  const exhibitionsByHash = new Map<string, ExhibitionWithVenue>();

  for (const result of report.results) {
    for (const exhibition of result.exhibitions ?? []) {
      const mapped = mapParsedExhibition(exhibition, generatedAt);

      exhibitionsByHash.set(mapped.sourceHash, mapped);
    }
  }

  return {
    generatedAt,
    summary: report.summary,
    exhibitions: Array.from(exhibitionsByHash.values()).sort(compareSnapshotExhibitions)
  };
}

function mapParsedExhibition(
  exhibition: ParsedExhibition,
  generatedAt: string
): ExhibitionWithVenue {
  const venue = venues.find((item) => item.slug === exhibition.venueSlug);

  if (!venue) {
    throw new Error(`Unknown venue slug: ${exhibition.venueSlug}`);
  }

  const sourceHash = createSourceHash(exhibition);

  return {
    id: `snapshot-${sourceHash}`,
    venueId: venue.id,
    title: exhibition.title,
    artists: exhibition.artists,
    startDate: exhibition.startDate,
    endDate: exhibition.endDate,
    status: getExhibitionStatus(exhibition.startDate, exhibition.endDate),
    sourceUrl: exhibition.sourceUrl,
    imageUrl: exhibition.imageUrl,
    confidence: exhibition.confidence,
    sourceHash,
    firstSeenAt: generatedAt,
    lastSeenAt: generatedAt,
    venue
  };
}

function compareSnapshotExhibitions(
  a: ExhibitionWithVenue,
  b: ExhibitionWithVenue
): number {
  return (
    a.startDate.localeCompare(b.startDate) ||
    a.endDate.localeCompare(b.endDate) ||
    a.venue.name.localeCompare(b.venue.name) ||
    a.title.localeCompare(b.title)
  );
}

function isExhibitionSnapshot(value: unknown): value is ExhibitionSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const snapshot = value as Partial<ExhibitionSnapshot>;

  return (
    typeof snapshot.generatedAt === "string" &&
    Boolean(snapshot.summary) &&
    Array.isArray(snapshot.exhibitions)
  );
}
