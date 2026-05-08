import { z } from "zod";

export const parsedExhibitionSchema = z.object({
  venueSlug: z.string().min(1),
  title: z.string().min(1),
  artists: z.array(z.string().min(1)),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sourceUrl: z.string().url(),
  imageUrl: z.string().url().optional(),
  confidence: z.number().min(0).max(1),
  raw: z.unknown().optional()
});

export type ParsedExhibition = z.infer<typeof parsedExhibitionSchema>;

export type CrawlAdapter = {
  key: string;
  venueSlug: string;
  crawl: () => Promise<ParsedExhibition[]>;
};

export type CrawlResult = {
  adapterKey: string;
  venueSlug: string;
  fetchedCount: number;
  parsedCount: number;
  exhibitions: ParsedExhibition[];
};

