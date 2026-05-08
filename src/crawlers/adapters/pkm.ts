import * as cheerio from "cheerio";
import { extractDateRange } from "../shared/date-range";
import { isCurrentOrUpcoming } from "../shared/filter";
import { fetchHtml, toAbsoluteUrl } from "../shared/http";
import { normalizeText, uniqueBy } from "../shared/text";
import { validateParsedExhibitions } from "../shared/validation";
import type { CrawlAdapter, ParsedExhibition } from "../types";

const venueSlug = "pkm";
const listUrl = "https://www.pkmgallery.com/exhibitions";

export const pkmAdapter: CrawlAdapter = {
  key: "pkm",
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
          const dateMatch = extractDateRange(text);

          if (!href || !href.includes("/exhibitions/") || !dateMatch) {
            return undefined;
          }

          if (!isCurrentOrUpcoming(dateMatch.range.startDate, dateMatch.range.endDate)) {
            return undefined;
          }

          if (/upcoming exhibitions|forthcoming exhibitions|permanent exhibition/i.test(text)) {
            return undefined;
          }

          return href;
        })
        .filter((href): href is string => Boolean(href)),
      (href) => href
    );
    const exhibitions = await Promise.all(detailUrls.map(parsePkmDetail));

    return validateParsedExhibitions(exhibitions.filter(Boolean) as ParsedExhibition[]);
  }
};

async function parsePkmDetail(sourceUrl: string): Promise<ParsedExhibition | null> {
  const html = await fetchHtml(sourceUrl);
  const $ = cheerio.load(html);
  const artist = normalizeText($("h1").first().text());
  const title = normalizeText($("h2").first().text()) || artist;
  const dateText =
    normalizeText($("h3").first().text()) ||
    extractDateRange(normalizeText($("body").text()))?.text;
  const dateMatch = dateText ? extractDateRange(dateText) : null;
  const imageUrl = toAbsoluteUrl(
    sourceUrl,
    $("img")
      .toArray()
      .map((element) => $(element).attr("src"))
      .find((src) => Boolean(src && !src.includes("logo")))
  );

  if (!artist || !title || !dateMatch) {
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
    confidence: 0.96,
    raw: {
      dateText: dateMatch.text
    }
  };
}

