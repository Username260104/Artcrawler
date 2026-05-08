import * as cheerio from "cheerio";
import { fetchHtml, toAbsoluteUrl } from "../shared/http";
import { extractDateRange } from "../shared/date-range";
import { normalizeText, uniqueBy } from "../shared/text";
import { validateParsedExhibitions } from "../shared/validation";
import type { CrawlAdapter, ParsedExhibition } from "../types";

const venueSlug = "pace-seoul";
const listUrl = "https://www.pacegallery.com/galleries/seoul/";

export const paceAdapter: CrawlAdapter = {
  key: "pace",
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

          if (!href || !href.includes("/exhibitions/") || !text.includes("Seoul")) {
            return undefined;
          }

          return href;
        })
        .filter((href): href is string => Boolean(href)),
      (href) => href
    );

    const exhibitions = await Promise.all(detailUrls.map(parsePaceDetail));

    return validateParsedExhibitions(exhibitions.filter(Boolean) as ParsedExhibition[]);
  }
};

async function parsePaceDetail(sourceUrl: string): Promise<ParsedExhibition | null> {
  const html = await fetchHtml(sourceUrl);
  const $ = cheerio.load(html);
  const artist = normalizeText($("h1").first().text());
  const title = normalizeText($("h2").first().text());
  const bodyText = normalizeText($("body").text());
  const dateMatch = extractDateRange(bodyText);
  const imageUrl = toAbsoluteUrl(
    sourceUrl,
    $("img")
      .toArray()
      .map((element) => $(element).attr("src"))
      .find(Boolean)
  );

  if (!artist || !title || !dateMatch || !bodyText.includes("Seoul")) {
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
    confidence: 0.98,
    raw: {
      dateText: dateMatch.text
    }
  };
}

