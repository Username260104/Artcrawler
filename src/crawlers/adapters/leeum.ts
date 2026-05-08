import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { extractDateRange } from "../shared/date-range";
import { isCurrentOrUpcoming } from "../shared/filter";
import { fetchHtml, toAbsoluteUrl } from "../shared/http";
import { normalizeText, uniqueBy } from "../shared/text";
import { validateParsedExhibitions } from "../shared/validation";
import type { CrawlAdapter, ParsedExhibition } from "../types";

const venueSlug = "leeum";
const sourceUrl = "https://www.leeumhoam.org/leeum";

export const leeumAdapter: CrawlAdapter = {
  key: "leeum",
  venueSlug,
  async crawl() {
    const html = await fetchHtml(sourceUrl);
    const $ = cheerio.load(html);
    const exhibitions = $(".swiper-slide")
      .toArray()
      .map((element) => parseLeeumSlide($, element))
      .filter((item): item is ParsedExhibition => Boolean(item));

    return validateParsedExhibitions(uniqueBy(exhibitions, getExhibitionKey));
  }
};

function parseLeeumSlide(
  $: cheerio.CheerioAPI,
  element: Element
): ParsedExhibition | null {
  const slide = $(element);
  const title = normalizeText(slide.find("h4").first().text());
  const detailUrl = slide.html()?.match(/location\.href\s*=\s*'([^']+)'/)?.[1];
  const paragraphs = slide
    .find(".desc p")
    .toArray()
    .map((item) => normalizeText($(item).text()))
    .filter(Boolean);
  const dateText = paragraphs.find((text) => extractDateRange(text));
  const dateMatch = dateText ? extractDateRange(dateText) : null;

  if (!title || !detailUrl || !dateMatch) {
    return null;
  }

  if (!detailUrl.includes("/leeum/exhibition/")) {
    return null;
  }

  if (!isCurrentOrUpcoming(dateMatch.range.startDate, dateMatch.range.endDate)) {
    return null;
  }

  return {
    venueSlug,
    title,
    artists: [getArtistFromTitle(title)],
    startDate: dateMatch.range.startDate,
    endDate: dateMatch.range.endDate,
    sourceUrl: toAbsoluteUrl(sourceUrl, detailUrl) ?? sourceUrl,
    imageUrl: toAbsoluteUrl(sourceUrl, normalizeText(slide.find(".bannerImgUrl").first().text())),
    confidence: 0.92,
    raw: {
      location: paragraphs[0],
      dateText: dateMatch.text
    }
  };
}

function getArtistFromTitle(title: string): string {
  const separatorIndex = title.search(/[:：]/);

  if (separatorIndex > 0) {
    return title.slice(0, separatorIndex).trim();
  }

  return title;
}

function getExhibitionKey(exhibition: ParsedExhibition): string {
  return `${exhibition.title}|${exhibition.startDate}|${exhibition.endDate}`;
}
