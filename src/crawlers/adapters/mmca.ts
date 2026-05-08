import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { extractDateRange } from "../shared/date-range";
import { isCurrentOrUpcoming } from "../shared/filter";
import { fetchHtml, toAbsoluteUrl } from "../shared/http";
import { normalizeText, uniqueBy } from "../shared/text";
import { validateParsedExhibitions } from "../shared/validation";
import type { CrawlAdapter, ParsedExhibition } from "../types";

const venueSlug = "mmca-seoul";
const sourceUrl = "http://www.mmca.go.kr/main.do";
const detailBaseUrl = "http://www.mmca.go.kr/exhibitions/exhibitionsDetail.do?exhFlag=1&exhId=";

export const mmcaAdapter: CrawlAdapter = {
  key: "mmca",
  venueSlug,
  async crawl() {
    const html = await fetchHtml(sourceUrl);
    const $ = cheerio.load(html);
    const exhibitions = $(".swiper-slide")
      .toArray()
      .map((element) => parseMmcaSlide($, element))
      .filter((item): item is ParsedExhibition => Boolean(item));

    return validateParsedExhibitions(uniqueBy(exhibitions, getExhibitionKey));
  }
};

function parseMmcaSlide(
  $: cheerio.CheerioAPI,
  element: Element
): ParsedExhibition | null {
  const slide = $(element);
  const branch = normalizeText(slide.find(".ctg").first().text());
  const title = normalizeText(slide.find(".tit").first().text());
  const dateText = normalizeText(slide.find(".txt").first().text());
  const detailId = slide.html()?.match(/fn_Detail\('([^']+)'\)/)?.[1];
  const imageUrl = toAbsoluteUrl(sourceUrl, slide.find("img").first().attr("src"));
  const dateMatch = extractDateRange(dateText);

  if (branch !== "서울" || !title || !dateMatch) {
    return null;
  }

  if (!isCurrentOrUpcoming(dateMatch.range.startDate, dateMatch.range.endDate)) {
    return null;
  }

  return {
    venueSlug,
    title,
    artists: [title],
    startDate: dateMatch.range.startDate,
    endDate: dateMatch.range.endDate,
    sourceUrl: detailId ? `${detailBaseUrl}${detailId}` : sourceUrl,
    imageUrl,
    confidence: 0.93,
    raw: {
      branch,
      dateText: dateMatch.text
    }
  };
}

function getExhibitionKey(exhibition: ParsedExhibition): string {
  return `${exhibition.title}|${exhibition.startDate}|${exhibition.endDate}`;
}
