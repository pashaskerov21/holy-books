import { NextResponse } from "next/server";
import { getChapterById, getVerse } from "@/lib/quran-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chapter: string; verse: string }> },
) {
  const { chapter, verse } = await params;
  const chapterId = Number(chapter);
  const verseNumber = Number(verse);

  if (!Number.isInteger(chapterId) || !Number.isInteger(verseNumber)) {
    return NextResponse.json({ error: "Yanlış nömrə" }, { status: 400 });
  }

  if (!getChapterById(chapterId)) {
    return NextResponse.json({ error: "Surə tapılmadı" }, { status: 404 });
  }

  const data = getVerse(chapterId, verseNumber);

  if (!data) {
    return NextResponse.json({ error: "Ayə tapılmadı" }, { status: 404 });
  }

  return NextResponse.json(data);
}
