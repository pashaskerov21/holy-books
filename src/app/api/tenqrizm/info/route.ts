import { NextResponse } from "next/server";
import { getTenqrizmInfo } from "@/lib/tenqrizm-data";

export async function GET() {
  return NextResponse.json(getTenqrizmInfo());
}
