import { describe, expect, it } from "vitest";
import { validateParsedExhibitions } from "./validation";

describe("parsed exhibition validation", () => {
  it("accepts normalized parser output", () => {
    expect(() =>
      validateParsedExhibitions([
        {
          venueSlug: "pkm",
          title: "Unseen/Thing",
          artists: ["Jungjin Lee"],
          startDate: "2026-04-15",
          endDate: "2026-05-23",
          sourceUrl: "https://www.pkmgallery.com/exhibitions/jungjin-lee2",
          confidence: 0.96
        }
      ])
    ).not.toThrow();
  });

  it("rejects unnormalized dates", () => {
    expect(() =>
      validateParsedExhibitions([
        {
          venueSlug: "pkm",
          title: "Unseen/Thing",
          artists: ["Jungjin Lee"],
          startDate: "April 15, 2026",
          endDate: "2026-05-23",
          sourceUrl: "https://www.pkmgallery.com/exhibitions/jungjin-lee2",
          confidence: 0.96
        }
      ])
    ).toThrow();
  });
});

