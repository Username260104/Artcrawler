import { NextResponse } from "next/server";
import { venues } from "@/data/venues";

export function GET() {
  return NextResponse.json({
    data: venues
  });
}

