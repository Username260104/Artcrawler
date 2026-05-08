import * as cheerio from "cheerio";
import { fetchHtml } from "../shared/http";
import { uniqueBy } from "../shared/text";
import { validateParsedExhibitions } from "../shared/validation";
import type { CrawlAdapter, ParsedExhibition } from "../types";

const venueSlug = "perrotin-seoul";
const agendaUrl = "https://www.perrotin.com/en/exhibitions/current";

type PerrotinEvent = {
  title?: string;
  original_title?: string;
  artist?: string;
  start_date?: string;
  end_date?: string;
  city?: string;
  venue?: string;
  slug?: string;
  image?: string;
  cover_landscape?: string;
  cover_portrait?: string;
  location?: {
    full_string?: string;
    link?: string;
  };
};

export const perrotinAdapter: CrawlAdapter = {
  key: "perrotin",
  venueSlug,
  async crawl() {
    const html = await fetchHtml(agendaUrl);
    const page = parseInertiaPage(html);
    const events: PerrotinEvent[] = [
      ...(page.props.currentExhibitions ?? []),
      ...(page.props.upcomingExhibitions ?? [])
    ];
    const exhibitions = events
      .filter(isSeoulEvent)
      .map(toParsedExhibition)
      .filter((item): item is ParsedExhibition => Boolean(item));

    return validateParsedExhibitions(uniqueBy(exhibitions, getExhibitionKey));
  }
};

function parseInertiaPage(html: string): {
  props: {
    currentExhibitions?: PerrotinEvent[];
    upcomingExhibitions?: PerrotinEvent[];
  };
} {
  const $ = cheerio.load(html);
  const raw = $("#app").attr("data-page");

  if (!raw) {
    throw new Error("Perrotin Inertia data-page payload was not found.");
  }

  return JSON.parse(raw);
}

function isSeoulEvent(event: PerrotinEvent): boolean {
  return /seoul/i.test(
    [event.city, event.venue, event.location?.full_string, event.location?.link]
      .filter(Boolean)
      .join(" ")
  );
}

function toParsedExhibition(event: PerrotinEvent): ParsedExhibition | null {
  if (!event.start_date || !event.end_date || !event.title) {
    return null;
  }

  return {
    venueSlug,
    title: event.original_title || event.title,
    artists: splitArtistList(event.artist || event.title),
    startDate: toDateKey(event.start_date),
    endDate: toDateKey(event.end_date),
    sourceUrl: event.slug
      ? `https://www.perrotin.com/en/exhibitions/${event.slug}`
      : agendaUrl,
    imageUrl: event.cover_landscape || event.cover_portrait || event.image,
    confidence: 0.96,
    raw: {
      id: event.slug,
      city: event.city,
      location: event.location
    }
  };
}

function splitArtistList(value: string): string[] {
  return value
    .split(/,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toDateKey(value: string): string {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getExhibitionKey(exhibition: ParsedExhibition): string {
  return `${exhibition.title}|${exhibition.startDate}|${exhibition.endDate}`;
}

