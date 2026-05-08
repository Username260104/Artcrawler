import type { Venue } from "@/lib/types";

export const venues: Venue[] = [
  {
    id: "venue-mmca-seoul",
    name: "국립현대미술관 서울",
    slug: "mmca-seoul",
    type: "museum",
    authorityTier: "A",
    district: "종로",
    officialUrl: "https://www.mmca.go.kr",
    exhibitionUrl: "https://www.mmca.go.kr/main.do",
    crawlerKey: "mmca",
    crawlerEnabled: true
  },
  {
    id: "venue-sema",
    name: "서울시립미술관",
    slug: "sema",
    type: "museum",
    authorityTier: "A",
    district: "중구",
    officialUrl: "https://sema.seoul.go.kr",
    exhibitionUrl: "https://sema.seoul.go.kr",
    crawlerKey: "sema",
    crawlerEnabled: true
  },
  {
    id: "venue-leeum",
    name: "리움미술관",
    slug: "leeum",
    type: "museum",
    authorityTier: "A",
    district: "용산",
    officialUrl: "https://www.leeumhoam.org",
    exhibitionUrl: "https://www.leeumhoam.org/leeum",
    crawlerKey: "leeum",
    crawlerEnabled: true
  },
  {
    id: "venue-art-sonje",
    name: "아트선재센터",
    slug: "art-sonje",
    type: "nonprofit",
    authorityTier: "A",
    district: "종로",
    officialUrl: "https://artsonje.org",
    exhibitionUrl: "https://artsonje.org/exhibition",
    crawlerKey: "art-sonje",
    crawlerEnabled: true
  },
  {
    id: "venue-songeun",
    name: "송은",
    slug: "songeun",
    type: "nonprofit",
    authorityTier: "A",
    district: "강남",
    officialUrl: "https://www.songeun.or.kr",
    exhibitionUrl: "https://www.songeun.or.kr/programs/exhibitions",
    crawlerKey: "songeun",
    crawlerEnabled: false
  },
  {
    id: "venue-kukje",
    name: "국제갤러리",
    slug: "kukje",
    type: "gallery",
    authorityTier: "A",
    district: "종로",
    officialUrl: "https://www.kukjegallery.com",
    exhibitionUrl: "https://www.kukjegallery.com/exhibitions",
    crawlerKey: "kukje",
    crawlerEnabled: true
  },
  {
    id: "venue-gallery-hyundai",
    name: "갤러리현대",
    slug: "gallery-hyundai",
    type: "gallery",
    authorityTier: "A",
    district: "종로",
    officialUrl: "https://www.galleryhyundai.com",
    exhibitionUrl: "https://www.galleryhyundai.com/exhibition/onview",
    crawlerKey: "gallery-hyundai",
    crawlerEnabled: true
  },
  {
    id: "venue-pkm",
    name: "PKM 갤러리",
    slug: "pkm",
    type: "gallery",
    authorityTier: "A",
    district: "종로",
    officialUrl: "https://www.pkmgallery.com",
    exhibitionUrl: "https://www.pkmgallery.com/exhibitions",
    crawlerKey: "pkm",
    crawlerEnabled: true
  },
  {
    id: "venue-pace-seoul",
    name: "Pace Seoul",
    slug: "pace-seoul",
    type: "gallery",
    authorityTier: "A",
    district: "용산",
    officialUrl: "https://www.pacegallery.com",
    exhibitionUrl: "https://www.pacegallery.com/galleries/seoul",
    crawlerKey: "pace",
    crawlerEnabled: true
  },
  {
    id: "venue-white-cube-seoul",
    name: "White Cube Seoul",
    slug: "white-cube-seoul",
    type: "gallery",
    authorityTier: "A",
    district: "강남",
    officialUrl: "https://www.whitecube.com",
    exhibitionUrl: "https://www.whitecube.com/locations/white-cube-seoul",
    crawlerKey: "white-cube",
    crawlerEnabled: true
  },
  {
    id: "venue-perrotin-seoul",
    name: "Perrotin Seoul",
    slug: "perrotin-seoul",
    type: "gallery",
    authorityTier: "A",
    district: "강남",
    officialUrl: "https://www.perrotin.com",
    exhibitionUrl: "https://www.perrotin.com/exhibitions/current",
    crawlerKey: "perrotin",
    crawlerEnabled: true
  }
];

export function getVenueById(venueId: string): Venue | undefined {
  return venues.find((venue) => venue.id === venueId);
}
