import { NextResponse } from "next/server";
import { getBookBySlug, getChapter } from "@/lib/incil-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ book: string; chapter: string }> },
) {
  const { book, chapter } = await params;
  const chapterNumber = Number(chapter);

  if (!Number.isInteger(chapterNumber)) {
    return NextResponse.json({ error: "Yanlış fəsil nömrəsi" }, { status: 400 });
  }

  if (!getBookBySlug(book)) {
    return NextResponse.json({ error: "Kitab tapılmadı" }, { status: 404 });
  }

  const data = getChapter(book, chapterNumber);

  if (!data) {
    return NextResponse.json({ error: "Fəsil tapılmadı" }, { status: 404 });
  }

  return NextResponse.json(data);
}
