import { NextResponse } from "next/server";
import { runCrawler } from "@/crawlers/run";
import { hasDatabaseUrl } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const unauthorized = validateCronRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      {
        error: "DATABASE_URL is not configured."
      },
      {
        status: 503
      }
    );
  }

  const report = await runCrawler();

  return NextResponse.json(report, {
    status: report.summary.failed > 0 ? 207 : 200
  });
}

function validateCronRequest(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return null;
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json(
      {
        error: "Unauthorized"
      },
      {
        status: 401
      }
    );
  }

  return null;
}

