import { createHash } from "node:crypto";
import type { ParsedExhibition } from "../types";

export function createSourceHash(exhibition: ParsedExhibition): string {
  return createHash("sha256")
    .update(
      [
        exhibition.venueSlug,
        normalizeHashPart(exhibition.title),
        exhibition.startDate,
        exhibition.endDate,
        exhibition.sourceUrl
      ].join("|")
    )
    .digest("hex");
}

function normalizeHashPart(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

