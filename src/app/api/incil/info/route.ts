import { NextResponse } from "next/server";
import { getIncilInfo } from "@/lib/incil-data";

export async function GET() {
  return NextResponse.json(getIncilInfo());
}
