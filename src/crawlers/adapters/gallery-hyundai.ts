import * as cheerio from "cheerio";
import { isCurrentOrUpcoming } from "../shared/filter";
import { postJson, toAbsoluteUrl } from "../shared/http";
import { normalizeText, uniqueBy } from "../shared/text";
import { validateParsedExhibitions } from "../shared/validation";
import type { CrawlAdapter, ParsedExhibition } from "../types";

const venueSlug = "gallery-hyundai";
const apiUrl = "https://www.galleryhyundai.com/exhibition/onview/data";
const detailBaseUrl = "https://www.galleryhyundai.com/exhibition/view/";

type GalleryHyundaiResponse = {
  resultList?: GalleryHyundaiExhibition[];
};

type GalleryHyundaiExhibition = {
  exbiSn: number;
  beginDt: number;
  endDt: number;
  exbiNmKo?: string;
  exbiIntrcnKo?: string;
  exbiImage?: {
    tcmpth?: string;
    trlpth?: string;
  };
};

export const galleryHyundaiAdapter: CrawlAdapter = {
  key: "gallery-hyundai",
  venueSlug,
  async crawl() {
    const data = await postJson<GalleryHyundaiResponse>(apiUrl, {
      artistSn: "",
      pageIndex: 1,
      recordCountPerPage: 24,
      year: ""
    });
    const exhibitions = (data.resultList ?? [])
      .map(mapGalleryHyundaiExhibition)
      .filter((item): item is ParsedExhibition => Boolean(item));

    return validateParsedExhibitions(uniqueBy(exhibitions, getExhibitionKey));
  }
};

function mapGalleryHyundaiExhibition(item: GalleryHyundaiExhibition): ParsedExhibition | null {
  const startDate = toDateKey(item.beginDt);
  const endDate = toDateKey(item.endDt);

  if (!isCurrentOrUpcoming(startDate, endDate)) {
    return null;
  }

  const { title, artists } = getDisplayTitleAndArtists(item);
  const imagePath = item.exbiImage?.tcmpth ?? item.exbiImage?.trlpth;

  if (!title) {
    return null;
  }

  return {
    venueSlug,
    title,
    artists,
    startDate,
    endDate,
    sourceUrl: `${detailBaseUrl}${item.exbiSn}`,
    imageUrl: toAbsoluteUrl("https://www.galleryhyundai.com", imagePath),
    confidence: 0.97,
    raw: {
      source: "gallery-hyundai-onview-api",
      originalTitle: item.exbiNmKo
    }
  };
}

function getDisplayTitleAndArtists(item: GalleryHyundaiExhibition): {
  title: string;
  artists: string[];
} {
  const originalTitle = normalizeText(item.exbiNmKo ?? "");
  const introText = normalizeText(cheerio.load(item.exbiIntrcnKo ?? "").text());
  const koreanTitle = introText.match(/개인전\s*《([^》]+)》/)?.[1];
  const koreanArtist = introText.match(/갤러리현대는\s+(.+?)\s+작가의\s+개인전/)?.[1];

  if (koreanTitle && koreanArtist) {
    return {
      title: `${koreanArtist}: ${koreanTitle}`,
      artists: [koreanArtist]
    };
  }

  const [artist, title] = originalTitle.split(":").map(normalizeText);

  return {
    title: title ? `${artist}: ${title}` : originalTitle,
    artists: artist ? [artist] : ["단체전"]
  };
}

function toDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getExhibitionKey(exhibition: ParsedExhibition): string {
  return `${exhibition.title}|${exhibition.startDate}|${exhibition.endDate}`;
}
