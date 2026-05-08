import * as cheerio from "cheerio";
import { extractDateRange } from "../shared/date-range";
import { isCurrentOrUpcoming } from "../shared/filter";
import { fetchHtml, toAbsoluteUrl } from "../shared/http";
import { normalizeText, uniqueBy } from "../shared/text";
import { validateParsedExhibitions } from "../shared/validation";
import type { CrawlAdapter, ParsedExhibition } from "../types";

const venueSlug = "art-sonje";
const listUrl = "https://artsonje.org/exhibition-program/exhibition/";

export const artSonjeAdapter: CrawlAdapter = {
  key: "art-sonje",
  venueSlug,
  async crawl() {
    const html = await fetchHtml(listUrl);
    const $ = cheerio.load(html);
    const detailUrls = uniqueBy(
      $(".fwpl-result")
        .toArray()
        .map((element) => {
          const statusText = normalizeText($(element).find(".fwpl-tax-exhibition_type").text());
          const href = toAbsoluteUrl(listUrl, $(element).find("a[href*='/exhibition/']").attr("href"));

          if (!href || !/현재 전시|예정 전시/.test(statusText)) {
            return undefined;
          }

          return href;
        })
        .filter((href): href is string => Boolean(href)),
      (href) => href
    );
    const exhibitions = await Promise.all(detailUrls.map(parseArtSonjeDetail));

    return validateParsedExhibitions(exhibitions.filter(Boolean) as ParsedExhibition[]);
  }
};

async function parseArtSonjeDetail(sourceUrl: string): Promise<ParsedExhibition | null> {
  const html = await fetchHtml(sourceUrl);
  const $ = cheerio.load(html);
  const title = normalizeText($(".title-name").first().text()) || normalizeText($("h1").first().text());
  const dateText =
    normalizeText($(".title-time").first().text()) ||
    getTermValue($, "기간") ||
    normalizeText($("body").text());
  const dateMatch = extractDateRange(dateText);
  const imageUrl = toAbsoluteUrl(
    sourceUrl,
    $("meta[property='og:image']").attr("content") ??
      $("img.wp-post-image").first().attr("src")
  );

  if (!title || !dateMatch) {
    return null;
  }

  if (!isCurrentOrUpcoming(dateMatch.range.startDate, dateMatch.range.endDate)) {
    return null;
  }

  return {
    venueSlug,
    title,
    artists: getArtists($),
    startDate: dateMatch.range.startDate,
    endDate: dateMatch.range.endDate,
    sourceUrl,
    imageUrl,
    confidence: 0.95,
    raw: {
      dateText: dateMatch.text
    }
  };
}

function getArtists($: cheerio.CheerioAPI): string[] {
  const artistText = getTermValue($, "참여작가");

  if (!artistText) {
    return ["단체전"];
  }

  const artists = artistText
    .split(",")
    .map(normalizeText)
    .filter(Boolean);

  if (artists.length <= 4) {
    return artists;
  }

  return [...artists.slice(0, 3), `외 ${artists.length - 3}명`];
}

function getTermValue($: cheerio.CheerioAPI, label: string): string | undefined {
  return $(".myTerm")
    .toArray()
    .map((element) => {
      const termLabel = normalizeText($(element).find(".termLabel").text());

      if (termLabel !== label) {
        return undefined;
      }

      return normalizeText($(element).find(".termValue").text());
    })
    .find((value): value is string => Boolean(value));
}
