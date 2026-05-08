import { writeExhibitionSnapshotFromReport, snapshotFilePath } from "../data/exhibition-snapshot";
import { formatCrawlerReport, runCrawler } from "./run";

async function main() {
  const report = await runCrawler({
    dryRun: true,
    logExhibitions: true
  });
  const snapshot = await writeExhibitionSnapshotFromReport(report);

  console.log(
    JSON.stringify(
      {
        savedTo: snapshotFilePath,
        generatedAt: snapshot.generatedAt,
        exhibitionCount: snapshot.exhibitions.length,
        summary: snapshot.summary
      },
      null,
      2
    )
  );

  if (report.summary.failed > 0) {
    console.warn(formatCrawlerReport(report));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
