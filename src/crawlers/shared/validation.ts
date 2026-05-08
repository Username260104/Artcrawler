import { parsedExhibitionSchema, type ParsedExhibition } from "../types";

export function validateParsedExhibitions(items: ParsedExhibition[]): ParsedExhibition[] {
  return items.map((item) => parsedExhibitionSchema.parse(item));
}

