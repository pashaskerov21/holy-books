import { NextResponse } from "next/server";
import { getAllChapters } from "@/lib/quran-data";

export async function GET() {
  return NextResponse.json(getAllChapters());
}
