"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LocateFixed,
  RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  addMonths,
  formatFullDate,
  formatMonth,
  getCalendarDays,
  isExhibitionActiveOnDate,
  isExhibitionInMonth,
  parseDateKey,
  weekdayLabels
} from "@/lib/calendar";
import { formatDateRange } from "@/lib/status";
import type { ExhibitionDatasetSource } from "@/data/exhibitions";
import type { ExhibitionStatus, ExhibitionWithVenue, VenueType } from "@/lib/types";

type StatusFilter = "all" | ExhibitionStatus;
type TypeFilter = "all" | VenueType;
type VenueFilter = "all" | string;

type ExhibitionCalendarProps = {
  exhibitions: ExhibitionWithVenue[];
  todayKey: string;
  datasetInfo: {
    source: ExhibitionDatasetSource;
    generatedAt?: string;
  };
};

const statusLabels: Record<ExhibitionStatus, string> = {
  upcoming: "예정",
  ongoing: "진행 중",
  endingSoon: "종료 임박",
  ended: "종료"
};

const statusFilterOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "전체", value: "all" },
  { label: "진행 중", value: "ongoing" },
  { label: "예정", value: "upcoming" },
  { label: "종료 임박", value: "endingSoon" }
];

const typeFilterOptions: Array<{ label: string; value: TypeFilter }> = [
  { label: "전체", value: "all" },
  { label: "미술관", value: "museum" },
  { label: "갤러리", value: "gallery" },
  { label: "비영리", value: "nonprofit" }
];

const typeLabels: Record<VenueType, string> = {
  museum: "미술관",
  gallery: "갤러리",
  nonprofit: "비영리"
};

export function ExhibitionCalendar({
  exhibitions,
  todayKey,
  datasetInfo
}: ExhibitionCalendarProps) {
  const router = useRouter();
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [currentMonth, setCurrentMonth] = useState(() => parseDateKey(todayKey));
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [venueFilter, setVenueFilter] = useState<VenueFilter>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const venueFilterOptions = useMemo(() => getVenueFilterOptions(exhibitions), [exhibitions]);

  const filteredExhibitions = useMemo(
    () =>
      exhibitions.filter((exhibition) => {
        const statusMatches = statusFilter === "all" || exhibition.status === statusFilter;
        const typeMatches = typeFilter === "all" || exhibition.venue.type === typeFilter;
        const venueMatches = venueFilter === "all" || exhibition.venue.id === venueFilter;

        return statusMatches && typeMatches && venueMatches;
      }),
    [exhibitions, statusFilter, typeFilter, venueFilter]
  );

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  const selectedDateExhibitions = useMemo(
    () =>
      filteredExhibitions
        .filter((exhibition) => isExhibitionActiveOnDate(exhibition, selectedDateKey))
        .sort(compareExhibitions),
    [filteredExhibitions, selectedDateKey]
  );

  const visibleMonthExhibitions = useMemo(
    () =>
      filteredExhibitions
        .filter((exhibition) => isExhibitionInMonth(exhibition, currentMonth))
        .sort(compareExhibitions),
    [filteredExhibitions, currentMonth]
  );
  const coverageStats = useMemo(() => getCoverageStats(exhibitions), [exhibitions]);

  function selectDate(dateKey: string) {
    setSelectedDateKey(dateKey);
  }

  function moveMonth(amount: number) {
    setCurrentMonth((month) => addMonths(month, amount));
  }

  function goToday() {
    setSelectedDateKey(todayKey);
    setCurrentMonth(parseDateKey(todayKey));
  }

  async function refreshSnapshot() {
    setIsRefreshing(true);
    setRefreshError(null);

    try {
      const response = await fetch("/api/snapshot/refresh", {
        method: "POST"
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;

        throw new Error(body?.error ?? "자료를 새로 수집하지 못했습니다.");
      }

      router.refresh();
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : "자료를 새로 수집하지 못했습니다.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="calendar-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">주요 미술관·갤러리 전시 타임라인</p>
          <h1>Art crawler</h1>
          <p className="data-status">{formatDatasetInfo(datasetInfo, exhibitions.length)}</p>
        </div>
        <div className="header-actions">
          <button
            className="refresh-button"
            disabled={isRefreshing}
            onClick={refreshSnapshot}
            type="button"
          >
            <RefreshCw aria-hidden data-spinning={isRefreshing} size={16} />
            {isRefreshing ? "수집 중" : "자료 새로고침"}
          </button>
          <div className="month-controls" aria-label="달력 이동">
            <button
              aria-label="이전 달"
              className="icon-button"
              onClick={() => moveMonth(-1)}
              title="이전 달"
              type="button"
            >
              <ChevronLeft aria-hidden size={20} />
            </button>
            <button className="today-button" onClick={goToday} type="button">
              <LocateFixed aria-hidden size={16} />
              오늘
            </button>
            <button
              aria-label="다음 달"
              className="icon-button"
              onClick={() => moveMonth(1)}
              title="다음 달"
              type="button"
            >
              <ChevronRight aria-hidden size={20} />
            </button>
          </div>
        </div>
      </header>

      {refreshError ? <p className="refresh-error">{refreshError}</p> : null}

      <section className="coverage-strip" aria-label="수집 현황">
        <div>
          <strong>{coverageStats.total}</strong>
          <span>수집 전시</span>
        </div>
        <div>
          <strong>{coverageStats.venueCount}</strong>
          <span>기관</span>
        </div>
        <div>
          <strong>{coverageStats.museum + coverageStats.nonprofit}</strong>
          <span>미술관/비영리</span>
        </div>
        <div>
          <strong>{coverageStats.gallery}</strong>
          <span>갤러리</span>
        </div>
      </section>

      <section className="filter-row" aria-label="전시 필터">
        <SegmentedControl
          label="상태"
          options={statusFilterOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <SegmentedControl
          label="기관"
          options={typeFilterOptions}
          value={typeFilter}
          onChange={setTypeFilter}
        />
        <label className="select-filter">
          <span>수집처</span>
          <select value={venueFilter} onChange={(event) => setVenueFilter(event.target.value)}>
            {venueFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="workspace">
        <section className="calendar-panel" aria-label={`${formatMonth(currentMonth)} 전시 달력`}>
          <div className="calendar-heading">
            <div>
              <p className="calendar-kicker">월간 보기</p>
              <h2>{formatMonth(currentMonth)}</h2>
            </div>
            <div className="month-count">
              <CalendarDays aria-hidden size={18} />
              {visibleMonthExhibitions.length}
            </div>
          </div>

          <div className="weekday-grid" aria-hidden="true">
            {weekdayLabels.map((weekday) => (
              <div key={weekday}>{weekday}</div>
            ))}
          </div>

          <div className="month-grid">
            {calendarDays.map((day) => {
              const dayExhibitions = filteredExhibitions
                .filter((exhibition) => isExhibitionActiveOnDate(exhibition, day.key))
                .sort(compareExhibitions);
              const previewExhibitions = dayExhibitions.slice(0, 3);
              const hiddenCount = Math.max(dayExhibitions.length - previewExhibitions.length, 0);

              return (
                <button
                  className="day-cell"
                  data-current-month={day.isCurrentMonth}
                  data-selected={day.key === selectedDateKey}
                  data-today={day.key === todayKey}
                  key={day.key}
                  onClick={() => selectDate(day.key)}
                  type="button"
                >
                  <span className="day-number">{day.dayOfMonth}</span>
                  <span className="day-events">
                    {previewExhibitions.map((exhibition) => (
                      <span
                        className="event-chip"
                        data-status={exhibition.status}
                        key={exhibition.id}
                        title={`${exhibition.title} · ${exhibition.venue.name}`}
                      >
                        <span className="event-venue">{exhibition.venue.name}</span>
                        <span className="event-title">{exhibition.title}</span>
                      </span>
                    ))}
                    {hiddenCount > 0 ? (
                      <span className="more-chip">+{hiddenCount}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="day-panel" aria-label="선택 날짜 전시">
          <div className="day-panel-header">
            <p className="calendar-kicker">선택 날짜</p>
            <h2>{formatFullDate(selectedDateKey)}</h2>
          </div>

          <div className="selected-count">{selectedDateExhibitions.length}개 전시</div>

          {selectedDateExhibitions.length > 0 ? (
            <ul className="selected-list">
              {selectedDateExhibitions.map((exhibition) => (
                <li className="selected-card" key={exhibition.id}>
                  {exhibition.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="card-image"
                      loading="lazy"
                      src={exhibition.imageUrl}
                    />
                  ) : null}
                  <div className="card-topline">
                    <span className="venue-name">
                      {exhibition.venue.name}
                      {exhibition.venue.district ? ` · ${exhibition.venue.district}` : ""}
                    </span>
                    <span className="badge" data-status={exhibition.status}>
                      {statusLabels[exhibition.status]}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span>{typeLabels[exhibition.venue.type]}</span>
                    <span>{exhibition.venue.authorityTier}등급 권위</span>
                    <span>신뢰도 {Math.round(exhibition.confidence * 100)}%</span>
                  </div>
                  <h3>{exhibition.title}</h3>
                  <p className="artist-line">{exhibition.artists.join(", ")}</p>
                  <p>{formatDateRange(exhibition.startDate, exhibition.endDate)}</p>
                  <a
                    className="source-link"
                    href={exhibition.sourceUrl}
                  >
                    공식 출처
                    <ExternalLink aria-hidden size={15} />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">표시할 전시가 없습니다.</div>
          )}
        </aside>
      </div>
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented-group">
      <span className="segmented-label">{label}</span>
      <div className="segmented-control">
        {options.map((option) => (
          <button
            data-active={option.value === value}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function compareExhibitions(a: ExhibitionWithVenue, b: ExhibitionWithVenue): number {
  if (a.status === "endingSoon" && b.status !== "endingSoon") {
    return -1;
  }

  if (a.status !== "endingSoon" && b.status === "endingSoon") {
    return 1;
  }

  if (a.venue.authorityTier !== b.venue.authorityTier) {
    return a.venue.authorityTier.localeCompare(b.venue.authorityTier);
  }

  return a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title);
}

function formatDatasetInfo(
  datasetInfo: ExhibitionCalendarProps["datasetInfo"],
  exhibitionCount: number
): string {
  if (datasetInfo.source === "database") {
    return `DB 데이터 · ${exhibitionCount}개 전시`;
  }

  if (datasetInfo.source === "snapshot" && datasetInfo.generatedAt) {
    return `마지막 수집 ${formatDateTime(datasetInfo.generatedAt)} · ${exhibitionCount}개 전시`;
  }

  return `샘플 데이터 · ${exhibitionCount}개 전시`;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getCoverageStats(exhibitions: ExhibitionWithVenue[]) {
  const venueIds = new Set(exhibitions.map((exhibition) => exhibition.venue.id));

  return {
    total: exhibitions.length,
    venueCount: venueIds.size,
    museum: exhibitions.filter((exhibition) => exhibition.venue.type === "museum").length,
    gallery: exhibitions.filter((exhibition) => exhibition.venue.type === "gallery").length,
    nonprofit: exhibitions.filter((exhibition) => exhibition.venue.type === "nonprofit").length
  };
}

function getVenueFilterOptions(exhibitions: ExhibitionWithVenue[]) {
  const venues = new Map<string, ExhibitionWithVenue["venue"]>();

  for (const exhibition of exhibitions) {
    venues.set(exhibition.venue.id, exhibition.venue);
  }

  return [
    {
      label: "전체 수집처",
      value: "all"
    },
    ...Array.from(venues.values())
      .sort((a, b) => a.name.localeCompare(b.name, "ko-KR"))
      .map((venue) => ({
        label: `${venue.name}${venue.district ? ` · ${venue.district}` : ""}`,
        value: venue.id
      }))
  ];
}
