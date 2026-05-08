import { venues } from "../data/venues";
import { artSonjeAdapter } from "./adapters/art-sonje";
import { galleryHyundaiAdapter } from "./adapters/gallery-hyundai";
import { leeumAdapter } from "./adapters/leeum";
import { kukjeAdapter } from "./adapters/kukje";
import { mmcaAdapter } from "./adapters/mmca";
import { paceAdapter } from "./adapters/pace";
import { perrotinAdapter } from "./adapters/perrotin";
import { pkmAdapter } from "./adapters/pkm";
import { semaAdapter } from "./adapters/sema";
import { whiteCubeAdapter } from "./adapters/white-cube";
import type { CrawlAdapter } from "./types";

const adapters = [
  mmcaAdapter,
  semaAdapter,
  leeumAdapter,
  artSonjeAdapter,
  kukjeAdapter,
  galleryHyundaiAdapter,
  pkmAdapter,
  paceAdapter,
  whiteCubeAdapter,
  perrotinAdapter
];

export function getEnabledAdapters(): CrawlAdapter[] {
  const enabledKeys = new Set(
    venues
      .filter((venue) => venue.crawlerEnabled)
      .map((venue) => venue.crawlerKey)
      .filter(Boolean)
  );

  return adapters.filter((adapter) => enabledKeys.has(adapter.key));
}

export function getAdapterByKey(key: string): CrawlAdapter | undefined {
  return adapters.find((adapter) => adapter.key === key);
}
