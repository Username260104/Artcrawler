import { NextResponse } from "next/server";
import { getRecentCrawlRuns } from "@/data/crawl-runs";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    data: await getRecentCrawlRuns()
  });
}

