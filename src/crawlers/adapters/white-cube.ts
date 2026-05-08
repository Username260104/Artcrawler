import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { extractDateRange } from "../shared/date-range";
import { fetchHtml, toAbsoluteUrl } from "../shared/http";
import { normalizeText, uniqueBy } from "../shared/text";
import { validateParsedExhibitions } from "../shared/validation";
import type { CrawlAdapter, ParsedExhibition } from "../types";

const venueSlug = "white-cube-seoul";
const sourceUrl = "https://www.whitecube.com/locations/white-cube-seoul";

export const whiteCubeAdapter: CrawlAdapter = {
  key: "white-cube",
  venueSlug,
  async crawl() {
    const html = await fetchHtml(sourceUrl);
    const $ = cheerio.load(html);
    const exhibitions = $("h3")
      .toArray()
      .map((heading) => parseHeading($, heading))
      .filter((item): item is ParsedExhibition => Boolean(item));

    return validateParsedExhibitions(uniqueBy(exhibitions, getExhibitionKey));
  }
};

function parseHeading(
  $: cheerio.CheerioAPI,
  heading: AnyNode
): ParsedExhibition | null {
  const titleText = normalizeText($(heading).text());
  const link = toAbsoluteUrl(sourceUrl, $(heading).find("a").attr("href")) ?? sourceUrl;

  if (!titleText) {
    return null;
  }

  const nextTexts: string[] = [];
  let cursor = $(heading).next();

  for (let index = 0; index < 8 && cursor.length > 0; index += 1) {
    const text = normalizeText(cursor.text());

    if (text) {
      nextTexts.push(text);
    }

    cursor = cursor.next();
  }

  const dateMatch = extractDateRange(nextTexts.join(" "));

  if (!dateMatch) {
    return null;
  }

  const { title, artists } = splitWhiteCubeTitle(titleText);

  return {
    venueSlug,
    title,
    artists,
    startDate: dateMatch.range.startDate,
    endDate: dateMatch.range.endDate,
    sourceUrl: link,
    confidence: 0.9,
    raw: {
      heading: titleText,
      dateText: dateMatch.text
    }
  };
}

function splitWhiteCubeTitle(value: string): { title: string; artists: string[] } {
  if (value.endsWith(" Duett") && value.includes(" and ")) {
    const artistText = value.replace(/\s+Duett$/, "");

    return {
      title: "Duett",
      artists: artistText.split(/\s+and\s+/).map(normalizeText)
    };
  }

  return {
    title: value,
    artists: [value]
  };
}

function getExhibitionKey(exhibition: ParsedExhibition): string {
  return `${exhibition.title}|${exhibition.startDate}|${exhibition.endDate}`;
}
