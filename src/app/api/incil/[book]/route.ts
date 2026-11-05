import { NextResponse } from "next/server";
import { getBookBySlug } from "@/lib/incil-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ book: string }> },
) {
  const { book } = await params;
  const data = getBookBySlug(book);

  if (!data) {
    return NextResponse.json({ error: "Kitab tapılmadı" }, { status: 404 });
  }

  return NextResponse.json(data);
}
