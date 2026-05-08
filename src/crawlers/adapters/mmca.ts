import { isCurrentOrUpcoming } from "../shared/filter";
import { postFormJson, toAbsoluteUrl } from "../shared/http";
import { normalizeText, uniqueBy } from "../shared/text";
import { validateParsedExhibitions } from "../shared/validation";
import type { CrawlAdapter, ParsedExhibition } from "../types";

type MmcaExhibitionRow = {
  exhFlag?: string;
  exhId?: string;
  exhTitle?: string;
  exhArtist?: string;
  exhStDt?: string;
  exhEdDt?: string;
  exhPlaNm?: string;
  exhThumbImg?: string;
};

type MmcaExhibitionListResponse = {
  exhibitionsList?: MmcaExhibitionRow[];
};

const venueSlug = "mmca-seoul";
const listUrl = "https://www.mmca.go.kr/exhibitions/AjaxExhibitionList.do";
const refererUrl = "https://www.mmca.go.kr/exhibitions/progressList.do";
const siteBaseUrl = "https://www.mmca.go.kr";

export const mmcaAdapter: CrawlAdapter = {
  key: "mmca",
  venueSlug,
  async crawl() {
    const rows = await fetchMmcaRows();
    const exhibitions = rows
      .map((row) => parseMmcaExhibition(row))
      .filter((item): item is ParsedExhibition => Boolean(item));

    return validateParsedExhibitions(uniqueBy(exhibitions, getExhibitionKey));
  }
};

async function fetchMmcaRows(): Promise<MmcaExhibitionRow[]> {
  const responses = await Promise.all([
    fetchMmcaRowsByFlag("1"),
    fetchMmcaRowsByFlag("2")
  ]);

  return responses.flat();
}

async function fetchMmcaRowsByFlag(exhFlag: string): Promise<MmcaExhibitionRow[]> {
  const data = await postFormJson<MmcaExhibitionListResponse>(
    listUrl,
    {
      exhFlag,
      pageIndex: "1",
      searchExhPlaCd: "130",
      sort: "1"
    },
    {
      referer: refererUrl
    }
  );

  return (data.exhibitionsList ?? []).map((row) => ({
    ...row,
    exhFlag
  }));
}

function parseMmcaExhibition(row: MmcaExhibitionRow): ParsedExhibition | null {
  const title = normalizeText(row.exhTitle ?? "");
  const startDate = normalizeText(row.exhStDt ?? "");
  const endDate = normalizeText(row.exhEdDt ?? "");
  const branch = normalizeText(row.exhPlaNm ?? "");

  if (branch !== "서울" || !title || !startDate || !endDate) {
    return null;
  }

  if (!isCurrentOrUpcoming(startDate, endDate)) {
    return null;
  }

  return {
    venueSlug,
    title,
    artists: getArtists(row.exhArtist, title),
    startDate,
    endDate,
    sourceUrl: getSourceUrl(row.exhId, row.exhFlag),
    imageUrl: toAbsoluteUrl(siteBaseUrl, row.exhThumbImg),
    confidence: 0.96,
    raw: {
      branch,
      exhId: row.exhId ?? ""
    }
  };
}

function getArtists(value: string | undefined, fallbackTitle: string): string[] {
  const normalized = normalizeText(value ?? "");

  if (!normalized || normalized === "-") {
    return [fallbackTitle];
  }

  return normalized
    .split(",")
    .map((artist) => normalizeText(artist))
    .filter(Boolean);
}

function getSourceUrl(exhId: string | undefined, exhFlag = "1"): string {
  if (!exhId) {
    return refererUrl;
  }

  return `${siteBaseUrl}/exhibitions/exhibitionsDetail.do?exhFlag=${exhFlag}&exhId=${exhId}`;
}

function getExhibitionKey(exhibition: ParsedExhibition): string {
  return `${exhibition.title}|${exhibition.startDate}|${exhibition.endDate}`;
}
