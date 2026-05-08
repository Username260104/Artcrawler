import * as cheerio from "cheerio";

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function getCleanLines(html: string): string[] {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();

  return $("body")
    .text()
    .split(/\n+/)
    .map(normalizeText)
    .filter(Boolean);
}

export function uniqueBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

