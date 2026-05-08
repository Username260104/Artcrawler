import { NextResponse } from "next/server";
import { writeExhibitionSnapshotFromReport } from "@/data/exhibition-snapshot";
import { runCrawler } from "@/crawlers/run";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const report = await runCrawler({
      dryRun: true,
      logExhibitions: true
    });
    const snapshot = await writeExhibitionSnapshotFromReport(report);

    return NextResponse.json(
      {
        data: {
          generatedAt: snapshot.generatedAt,
          exhibitionCount: snapshot.exhibitions.length,
          summary: snapshot.summary
        }
      },
      {
        status: report.summary.failed > 0 ? 207 : 200
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: message
      },
      {
        status: 500
      }
    );
  }
}
