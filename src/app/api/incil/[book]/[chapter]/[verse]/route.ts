import { NextResponse } from "next/server";
import { getBookBySlug, getChapter, getVerse } from "@/lib/incil-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ book: string; chapter: string; verse: string }> },
) {
  const { book, chapter, verse } = await params;
  const chapterNumber = Number(chapter);
  const verseNumber = Number(verse);

  if (!Number.isInteger(chapterNumber) || !Number.isInteger(verseNumber)) {
    return NextResponse.json({ error: "Yanlış nömrə" }, { status: 400 });
  }

  if (!getBookBySlug(book)) {
    return NextResponse.json({ error: "Kitab tapılmadı" }, { status: 404 });
  }

  if (!getChapter(book, chapterNumber)) {
    return NextResponse.json({ error: "Fəsil tapılmadı" }, { status: 404 });
  }

  const data = getVerse(book, chapterNumber, verseNumber);

  if (!data) {
    return NextResponse.json({ error: "Ayə tapılmadı" }, { status: 404 });
  }

  return NextResponse.json(data);
}
