import { ExhibitionCalendar } from "@/components/ExhibitionCalendar";
import { getExhibitionDataset } from "@/data/exhibitions";
import { toDateKey } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dataset = await getExhibitionDataset();
  const todayKey = toDateKey(new Date());

  return (
    <ExhibitionCalendar
      datasetInfo={{
        source: dataset.source,
        generatedAt: dataset.generatedAt
      }}
      exhibitions={dataset.exhibitions}
      todayKey={todayKey}
    />
  );
}
