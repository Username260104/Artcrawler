import { describe, expect, it } from "vitest";
import { createSourceHash } from "./hash";
import type { ParsedExhibition } from "../types";

const exhibition: ParsedExhibition = {
  venueSlug: "pace-seoul",
  title: "Primary Light",
  artists: ["Mary Corse"],
  startDate: "2026-04-15",
  endDate: "2026-06-05",
  sourceUrl: "https://www.pacegallery.com/exhibitions/mary-corse-primary-light/",
  confidence: 0.98
};

describe("source hash", () => {
  it("is stable for the same canonical exhibition fields", () => {
    expect(createSourceHash(exhibition)).toBe(createSourceHash({ ...exhibition }));
  });

  it("changes when the source URL changes", () => {
    expect(createSourceHash(exhibition)).not.toBe(
      createSourceHash({
        ...exhibition,
        sourceUrl: "https://www.pacegallery.com/exhibitions/other/"
      })
    );
  });
});

