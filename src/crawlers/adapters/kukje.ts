import * as cheerio from "cheerio";
import { extractDateRange } from "../shared/date-range";
import { isCurrentOrUpcoming } from "../shared/filter";
import { fetchHtml, toAbsoluteUrl } from "../shared/http";
import { getCleanLines, normalizeText, uniqueBy } from "../shared/text";
import { validateParsedExhibitions } from "../shared/validation";
import type { CrawlAdapter, ParsedExhibition } from "../types";

const venueSlug = "kukje";
const listUrl = "https://www.kukjegallery.com/exhibitions";

export const kukjeAdapter: CrawlAdapter = {
  key: "kukje",
  venueSlug,
  async crawl() {
    const html = await fetchHtml(listUrl);
    const $ = cheerio.load(html);
    const detailUrls = uniqueBy(
      $("a")
        .toArray()
        .map((element) => {
          const text = normalizeText($(element).text());
          const href = toAbsoluteUrl(listUrl, $(element).attr("href"));

          if (!href || !href.includes("/exhibitions/view") || !text.startsWith("Seoul")) {
            return undefined;
          }

          return href;
        })
        .filter((href): href is string => Boolean(href)),
      (href) => href
    );
    const exhibitions = await Promise.all(detailUrls.map(parseKukjeDetail));

    return validateParsedExhibitions(exhibitions.filter(Boolean) as ParsedExhibition[]);
  }
};

async function parseKukjeDetail(sourceUrl: string): Promise<ParsedExhibition | null> {
  const html = await fetchHtml(sourceUrl);
  const $ = cheerio.load(html);
  const bodyText = normalizeText($("body").text());
  const dateMatch = extractDateRange(bodyText);

  if (!dateMatch || !bodyText.includes("Seoul")) {
    return null;
  }

  if (!isCurrentOrUpcoming(dateMatch.range.startDate, dateMatch.range.endDate)) {
    return null;
  }

  const artist = getArtist($);
  const title = getTitleFromLines(getCleanLines(html), artist, dateMatch.text);
  const imageUrl = toAbsoluteUrl(
    sourceUrl,
    $("img")
      .toArray()
      .map((element) => $(element).attr("src"))
      .find((src) => Boolean(src?.includes("/upload/exhibitions/")))
  );

  if (!artist || !title) {
    return null;
  }

  return {
    venueSlug,
    title,
    artists: [artist],
    startDate: dateMatch.range.startDate,
    endDate: dateMatch.range.endDate,
    sourceUrl,
    imageUrl,
    confidence: 0.92,
    raw: {
      dateText: dateMatch.text
    }
  };
}

function getArtistFromHeading($: cheerio.CheerioAPI): string {
  const heading =
    $("h2")
      .toArray()
      .map((element) => normalizeText($(element).text()))
      .find(Boolean) ?? "";
  const words = heading.split(/\s+/);

  return words.slice(0, Math.min(words.length, 3)).join(" ");
}

function getArtist($: cheerio.CheerioAPI): string {
  return (
    $("h2 a")
      .toArray()
      .map((element) => normalizeText($(element).text()))
      .find(Boolean) ?? getArtistFromHeading($)
  );
}

function getTitleFromLines(lines: string[], artist: string, dateText: string): string {
  const dateIndex = lines.findIndex((line) => line.includes(dateText));
  const candidates = lines
    .slice(Math.max(0, dateIndex - 8), dateIndex)
    .map(normalizeText)
    .filter((line) => isTitleCandidate(line, artist));

  return candidates.at(-1) ?? artist;
}

function isTitleCandidate(line: string, artist: string): boolean {
  const lower = line.toLowerCase();

  return (
    line.length > 1 &&
    line !== artist &&
    !line.startsWith("Seoul") &&
    !line.startsWith("/upload/") &&
    !line.includes("Image") &&
    !lower.includes("global menu") &&
    !lower.includes("newsletter") &&
    !lower.includes("search")
  );
}
