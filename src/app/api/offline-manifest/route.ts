import { NextResponse } from "next/server";
import { getAllChapters as getQuranChapters } from "@/lib/quran-data";
import { getAllBooks as getIncilBooks, getBookSlug as getIncilSlug } from "@/lib/incil-data";
import { getAllBooks as getTovratBooks, getBookSlug as getTovratSlug } from "@/lib/tovrat-data";
import { getAllChapters as getTenqrizmChapters } from "@/lib/tenqrizm-data";

export async function GET() {
  const quranChapters = getQuranChapters();

  return NextResponse.json({
    quranChapterIds: quranChapters.map((chapter) => chapter.id),
    audioTracks: quranChapters
      .filter((chapter) => chapter.audio)
      .map((chapter) => ({ id: chapter.id, audio: chapter.audio })),
    incilBooks: getIncilBooks().map((book) => ({
      slug: getIncilSlug(book),
      chapterIds: book.chapters.map((chapter) => chapter.chapter),
    })),
    tovratBooks: getTovratBooks().map((book) => ({
      slug: getTovratSlug(book),
      chapterIds: book.chapters.map((chapter) => chapter.chapter),
    })),
    tenqrizmChapterIds: getTenqrizmChapters().map((chapter) => chapter.chapter),
  });
}
