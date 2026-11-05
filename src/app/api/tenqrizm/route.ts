import { NextResponse } from "next/server";
import { getAllChapters } from "@/lib/tenqrizm-data";

export async function GET() {
  return NextResponse.json(getAllChapters());
}
