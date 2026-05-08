import { describe, expect, it } from "vitest";
import { extractDateRange, parseDateRange } from "./date-range";

describe("date range parsing", () => {
  it("parses month-first ranges with an omitted start year", () => {
    expect(parseDateRange("Apr 16 – Jun 5, 2026")).toEqual({
      startDate: "2026-04-16",
      endDate: "2026-06-05"
    });
  });

  it("parses day-first ranges used by UK gallery pages", () => {
    expect(parseDateRange("2 May – 5 June 2026")).toEqual({
      startDate: "2026-05-02",
      endDate: "2026-06-05"
    });
  });

  it("handles ranges crossing a year boundary", () => {
    expect(parseDateRange("November 27, 2024 – January 11, 2025")).toEqual({
      startDate: "2024-11-27",
      endDate: "2025-01-11"
    });
  });

  it("extracts a date range from surrounding text", () => {
    expect(extractDateRange("Seoul K1 March 19 – May 10, 2026")).toEqual({
      text: "March 19 – May 10, 2026",
      range: {
        startDate: "2026-03-19",
        endDate: "2026-05-10"
      }
    });
  });

  it("extracts numeric Korean official-site ranges", () => {
    expect(extractDateRange("전시기간 2026. 3. 20. – 6. 28.")).toEqual({
      text: "2026. 3. 20. - 6. 28.",
      range: {
        startDate: "2026-03-20",
        endDate: "2026-06-28"
      }
    });
  });

  it("extracts compact numeric ranges", () => {
    expect(extractDateRange("2026/04/23~2026/07/12")).toEqual({
      text: "2026/04/23~2026/07/12",
      range: {
        startDate: "2026-04-23",
        endDate: "2026-07-12"
      }
    });
  });
});
