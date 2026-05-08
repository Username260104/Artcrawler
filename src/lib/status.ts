import type { ExhibitionStatus } from "@/lib/types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getExhibitionStatus(
  startDateValue: string | Date,
  endDateValue: string | Date,
  todayValue: string | Date = new Date()
): ExhibitionStatus {
  const startDate = toDateOnly(startDateValue);
  const endDate = toDateOnly(endDateValue);
  const today = toDateOnly(todayValue);
  const endingSoonCutoff = new Date(today.getTime() + 7 * DAY_IN_MS);

  if (startDate > today) {
    return "upcoming";
  }

  if (endDate < today) {
    return "ended";
  }

  if (endDate <= endingSoonCutoff) {
    return "endingSoon";
  }

  return "ongoing";
}

export function toDateOnly(value: string | Date): Date {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${dateValue}T00:00:00`));
}

