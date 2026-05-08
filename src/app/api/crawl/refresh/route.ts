import { NextResponse } from "next/server";
import { runCrawler } from "@/crawlers/run";
import { hasDatabaseUrl } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (!hasDatabaseUrl()) {
      return NextResponse.json(
        {
          error:
            "DATABASE_URL이 필요합니다. 배포 환경에서는 Postgres DB를 연결한 뒤 마이그레이션을 실행해야 합니다."
        },
        {
          status: 503
        }
      );
    }

    const report = await runCrawler({
      dryRun: false
    });

    return NextResponse.json(
      {
        data: {
          generatedAt: new Date().toISOString(),
          exhibitionCount: report.summary.parsedCount,
          mode: "database",
          summary: report.summary
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
