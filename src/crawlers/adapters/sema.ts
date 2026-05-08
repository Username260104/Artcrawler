import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { extractDateRange } from "../shared/date-range";
import { isCurrentOrUpcoming } from "../shared/filter";
import { fetchHtml, toAbsoluteUrl } from "../shared/http";
import { normalizeText, uniqueBy } from "../shared/text";
import { validateParsedExhibitions } from "../shared/validation";
import type { CrawlAdapter, ParsedExhibition } from "../types";

const venueSlug = "sema";
const sourceUrl = "https://sema.seoul.go.kr/";

export const semaAdapter: CrawlAdapter = {
  key: "sema",
  venueSlug,
  async crawl() {
    const html = await fetchHtml(sourceUrl);
    const $ = cheerio.load(html);
    const exhibitions = $(".swiper-slide")
      .toArray()
      .map((element) => parseSemaSlide($, element))
      .filter((item): item is ParsedExhibition => Boolean(item));

    return validateParsedExhibitions(uniqueBy(exhibitions, getExhibitionKey));
  }
};

function parseSemaSlide(
  $: cheerio.CheerioAPI,
  element: Element
): ParsedExhibition | null {
  const slide = $(element);
  const link = slide.find("a.img-wrap[href*='/whatson/exhibition/detail']").first();
  const title = normalizeText(link.find("img").attr("alt") ?? "");
  const venueBranch = normalizeText(slide.find("input[name='bannerTitle']").attr("value") ?? "");
  const dateText = normalizeText(slide.find("input[name='bannerDate']").attr("value") ?? "");
  const dateMatch = extractDateRange(dateText);

  if (!title || !dateMatch) {
    return null;
  }

  if (!isCurrentOrUpcoming(dateMatch.range.startDate, dateMatch.range.endDate)) {
    return null;
  }

  return {
    venueSlug,
    title,
    artists: [getTitleCore(title)],
    startDate: dateMatch.range.startDate,
    endDate: dateMatch.range.endDate,
    sourceUrl: toAbsoluteUrl(sourceUrl, link.attr("href")) ?? sourceUrl,
    imageUrl: toAbsoluteUrl(sourceUrl, link.find("img").attr("src")),
    confidence: 0.92,
    raw: {
      branch: venueBranch,
      dateText: dateMatch.text
    }
  };
}

function getTitleCore(title: string): string {
  return title.replace(/^.*?《/, "").replace(/》.*$/, "").trim() || title;
}

function getExhibitionKey(exhibition: ParsedExhibition): string {
  return `${exhibition.title}|${exhibition.startDate}|${exhibition.endDate}`;
}
