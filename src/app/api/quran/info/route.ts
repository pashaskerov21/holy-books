import { NextResponse } from "next/server";
import { getQuranInfo } from "@/lib/quran-data";

export async function GET() {
  return NextResponse.json(getQuranInfo());
}
