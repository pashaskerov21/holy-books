import { NextResponse } from "next/server";
import { getTovratInfo } from "@/lib/tovrat-data";

export async function GET() {
  return NextResponse.json(getTovratInfo());
}
