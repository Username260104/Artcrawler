import type { ExhibitionWithVenue } from "@/lib/types";

export type CalendarDay = {
  date: Date;
  key: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
};

const MONTH_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long"
});

const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "long"
});

export const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"];

export function toDateKey(value: string | Date): string {
  const date = typeof value === "string" ? parseDateKey(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateKey(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function getMonthKey(value: string | Date): string {
  const date = typeof value === "string" ? parseDateKey(value) : value;
  const month = `${date.getMonth() + 1}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}`;
}

export function formatMonth(value: Date): string {
  return MONTH_FORMATTER.format(value);
}

export function formatFullDate(value: string | Date): string {
  const date = typeof value === "string" ? parseDateKey(value) : value;

  return DATE_FORMATTER.format(date);
}

export function addMonths(value: Date, amount: number): Date {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

export function getCalendarDays(monthDate: Date): CalendarDay[] {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      key: toDateKey(date),
      dayOfMonth: date.getDate(),
      isCurrentMonth: date.getMonth() === monthDate.getMonth()
    };
  });
}

export function isDateInRange(dateKey: string, startDate: string, endDate: string): boolean {
  return startDate <= dateKey && dateKey <= endDate;
}

export function isExhibitionActiveOnDate(
  exhibition: ExhibitionWithVenue,
  dateKey: string
): boolean {
  return isDateInRange(dateKey, exhibition.startDate, exhibition.endDate);
}

export function isExhibitionInMonth(
  exhibition: ExhibitionWithVenue,
  monthDate: Date
): boolean {
  const firstDayKey = toDateKey(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  const lastDayKey = toDateKey(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0));

  return exhibition.startDate <= lastDayKey && exhibition.endDate >= firstDayKey;
}

