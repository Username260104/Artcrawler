export type VenueType = "museum" | "gallery" | "nonprofit";

export type AuthorityTier = "A" | "B" | "C" | "D";

export type ExhibitionStatus = "upcoming" | "ongoing" | "endingSoon" | "ended";

export type Venue = {
  id: string;
  name: string;
  slug: string;
  type: VenueType;
  authorityTier: AuthorityTier;
  district?: string;
  officialUrl: string;
  exhibitionUrl: string;
  crawlerKey?: string;
  crawlerEnabled: boolean;
};

export type Exhibition = {
  id: string;
  venueId: string;
  title: string;
  artists: string[];
  startDate: string;
  endDate: string;
  status: ExhibitionStatus;
  sourceUrl: string;
  imageUrl?: string;
  confidence: number;
  sourceHash: string;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type ExhibitionWithVenue = Exhibition & {
  venue: Venue;
};

