import { getExhibitionStatus } from "@/lib/status";
import type { Exhibition, ExhibitionWithVenue } from "@/lib/types";
import { getVenueById, venues } from "@/data/venues";

const nowIso = "2026-05-06T00:00:00.000Z";

export const fixtureExhibitions: Exhibition[] = [
  {
    id: "exhibition-fixture-pace-1",
    venueId: "venue-pace-seoul",
    title: "서울 동시대 회화 프로그램",
    artists: ["Fixture Artist"],
    startDate: "2026-04-18",
    endDate: "2026-06-14",
    status: getExhibitionStatus("2026-04-18", "2026-06-14", "2026-05-06"),
    sourceUrl: "https://www.pacegallery.com/galleries/seoul",
    confidence: 1,
    sourceHash: "fixture-pace-20260418-20260614",
    firstSeenAt: nowIso,
    lastSeenAt: nowIso
  },
  {
    id: "exhibition-fixture-white-cube-1",
    venueId: "venue-white-cube-seoul",
    title: "한남 전시 스터디",
    artists: ["Fixture Artist A", "Fixture Artist B"],
    startDate: "2026-05-02",
    endDate: "2026-05-24",
    status: getExhibitionStatus("2026-05-02", "2026-05-24", "2026-05-06"),
    sourceUrl: "https://www.whitecube.com/locations/white-cube-seoul",
    confidence: 1,
    sourceHash: "fixture-whitecube-20260502-20260524",
    firstSeenAt: nowIso,
    lastSeenAt: nowIso
  },
  {
    id: "exhibition-fixture-perrotin-1",
    venueId: "venue-perrotin-seoul",
    title: "오픈 예정 전시",
    artists: ["Fixture Artist C"],
    startDate: "2026-05-22",
    endDate: "2026-07-05",
    status: getExhibitionStatus("2026-05-22", "2026-07-05", "2026-05-06"),
    sourceUrl: "https://www.perrotin.com/exhibitions/current",
    confidence: 1,
    sourceHash: "fixture-perrotin-20260522-20260705",
    firstSeenAt: nowIso,
    lastSeenAt: nowIso
  },
  {
    id: "exhibition-fixture-kukje-1",
    venueId: "venue-kukje",
    title: "종로 주요 전시",
    artists: ["Fixture Artist D"],
    startDate: "2026-03-28",
    endDate: "2026-05-10",
    status: getExhibitionStatus("2026-03-28", "2026-05-10", "2026-05-06"),
    sourceUrl: "https://www.kukjegallery.com/exhibitions",
    confidence: 0.95,
    sourceHash: "fixture-kukje-20260328-20260510",
    firstSeenAt: nowIso,
    lastSeenAt: nowIso
  },
  {
    id: "exhibition-fixture-leeum-1",
    venueId: "venue-leeum",
    title: "기관전 캘린더 테스트",
    artists: ["Fixture Artist E"],
    startDate: "2026-04-04",
    endDate: "2026-05-04",
    status: getExhibitionStatus("2026-04-04", "2026-05-04", "2026-05-06"),
    sourceUrl: "https://www.leeumhoam.org/leeum/exhibition/current",
    confidence: 0.95,
    sourceHash: "fixture-leeum-20260404-20260504",
    firstSeenAt: nowIso,
    lastSeenAt: nowIso
  },
  {
    id: "exhibition-fixture-art-sonje-1",
    venueId: "venue-art-sonje",
    title: "비영리 공간 전시",
    artists: ["Fixture Artist F"],
    startDate: "2026-05-08",
    endDate: "2026-06-22",
    status: getExhibitionStatus("2026-05-08", "2026-06-22", "2026-05-06"),
    sourceUrl: "https://artsonje.org/exhibition",
    confidence: 0.95,
    sourceHash: "fixture-artsonje-20260508-20260622",
    firstSeenAt: nowIso,
    lastSeenAt: nowIso
  }
];

export function getFixtureExhibitionsWithVenues(): ExhibitionWithVenue[] {
  return fixtureExhibitions.flatMap((exhibition) => {
    const venue = getVenueById(exhibition.venueId);

    if (!venue) {
      return [];
    }

    return [{ ...exhibition, venue }];
  });
}

export function getFixtureSummary() {
  const enabledVenues = venues.filter((venue) => venue.crawlerEnabled);

  return {
    venueCount: venues.length,
    crawlerEnabledVenueCount: enabledVenues.length,
    fixtureExhibitionCount: fixtureExhibitions.length
  };
}
