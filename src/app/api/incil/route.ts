import { NextResponse } from "next/server";
import { getFullIncil } from "@/lib/incil-data";

export async function GET() {
  return NextResponse.json(getFullIncil());
}
