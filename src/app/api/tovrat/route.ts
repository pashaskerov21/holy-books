import { NextResponse } from "next/server";
import { getFullTovrat } from "@/lib/tovrat-data";

export async function GET() {
  return NextResponse.json(getFullTovrat());
}
