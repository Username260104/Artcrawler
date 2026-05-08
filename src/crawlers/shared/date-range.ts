const monthLookup: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11
};

type DateParts = {
  year?: number;
  month: number;
  day: number;
};

export type ParsedDateRange = {
  startDate: string;
  endDate: string;
};

export function parseDateRange(value: string): ParsedDateRange | null {
  const normalized = value
    .replace(/\u00a0/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  const parts = normalized.split(/\s+-\s+|\s+to\s+|\s+through\s+/i);

  if (parts.length !== 2) {
    return null;
  }

  const end = parseDateFragment(parts[1]);

  if (!end?.year) {
    return null;
  }

  const start = parseDateFragment(parts[0], end.year);

  if (!start) {
    return null;
  }

  let startYear = start.year ?? end.year;
  const endDate = new Date(end.year, end.month, end.day);
  let startDate = new Date(startYear, start.month, start.day);

  if (startDate > endDate && !start.year) {
    startYear -= 1;
    startDate = new Date(startYear, start.month, start.day);
  }

  return {
    startDate: toDateKey(startDate),
    endDate: toDateKey(endDate)
  };
}

export function extractDateRange(value: string): { text: string; range: ParsedDateRange } | null {
  const numericMatch = extractNumericDateRange(value);

  if (numericMatch) {
    return numericMatch;
  }

  const monthPattern =
    "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
  const monthFirst = `${monthPattern}\\s+\\d{1,2},?\\s*(?:\\d{4})?`;
  const dayFirst = `\\d{1,2}\\s+${monthPattern},?\\s*(?:\\d{4})?`;
  const fragment = `(?:${monthFirst}|${dayFirst})`;
  const regex = new RegExp(
    `(${fragment}\\s*(?:-|–|—|to|through)\\s*${fragment})`,
    "i"
  );
  const match = value.match(regex);

  if (!match) {
    return null;
  }

  const range = parseDateRange(match[1]);

  if (!range) {
    return null;
  }

  return {
    text: match[1],
    range
  };
}

function extractNumericDateRange(value: string): { text: string; range: ParsedDateRange } | null {
  const normalized = value
    .replace(/\u00a0/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  const fullDate = `\\d{4}[./-]\\s*\\d{1,2}[./-]\\s*\\d{1,2}\\.?`;
  const partialDate = `(?:\\d{4}[./-]\\s*)?\\d{1,2}[./-]\\s*\\d{1,2}\\.?`;
  const regex = new RegExp(
    `(${fullDate})\\s*(?:~|\\s+-\\s+|\\s+to\\s+|\\s+through\\s+)\\s*(${partialDate})`,
    "i"
  );
  const match = normalized.match(regex);

  if (!match) {
    return null;
  }

  const start = parseNumericDateFragment(match[1]);
  const end = parseNumericDateFragment(match[2], start?.year);

  if (!start || !end) {
    return null;
  }

  return {
    text: match[0],
    range: {
      startDate: toDateKey(new Date(start.year, start.month, start.day)),
      endDate: toDateKey(new Date(end.year, end.month, end.day))
    }
  };
}

function parseNumericDateFragment(
  value: string,
  fallbackYear?: number
): Required<DateParts> | null {
  const numbers = value.match(/\d+/g)?.map(Number) ?? [];

  if (numbers.length === 3) {
    return {
      year: numbers[0],
      month: numbers[1] - 1,
      day: numbers[2]
    };
  }

  if (numbers.length === 2 && fallbackYear) {
    return {
      year: fallbackYear,
      month: numbers[0] - 1,
      day: numbers[1]
    };
  }

  return null;
}

function parseDateFragment(value: string, fallbackYear?: number): DateParts | null {
  const cleaned = value.replace(/,/g, "").trim();
  const monthFirst = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2})(?:\s+(\d{4}))?$/);

  if (monthFirst) {
    const month = getMonth(monthFirst[1]);

    if (month === undefined) {
      return null;
    }

    return {
      month,
      day: Number(monthFirst[2]),
      year: monthFirst[3] ? Number(monthFirst[3]) : fallbackYear
    };
  }

  const dayFirst = cleaned.match(/^(\d{1,2})\s+([A-Za-z]+)(?:\s+(\d{4}))?$/);

  if (dayFirst) {
    const month = getMonth(dayFirst[2]);

    if (month === undefined) {
      return null;
    }

    return {
      month,
      day: Number(dayFirst[1]),
      year: dayFirst[3] ? Number(dayFirst[3]) : fallbackYear
    };
  }

  return null;
}

function getMonth(value: string): number | undefined {
  return monthLookup[value.toLowerCase()];
}

function toDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}
