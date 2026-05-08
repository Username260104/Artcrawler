import { NextResponse } from "next/server";
import { getExhibitionDataset } from "@/data/exhibitions";

export const dynamic = "force-dynamic";

export async function GET() {
  const dataset = await getExhibitionDataset();

  return NextResponse.json({
    data: dataset.exhibitions,
    meta: {
      source: dataset.source,
      generatedAt: dataset.generatedAt
    }
  });
}
