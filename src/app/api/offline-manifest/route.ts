import { NextResponse } from "next/server";
import { getAllChapters as getQuranChapters } from "@/lib/quran-data";
import { getAllBooks as getIncilBooks, getBookSlug as getIncilSlug } from "@/lib/incil-data";
import { getAllBooks as getTovratBooks, getBookSlug as getTovratSlug } from "@/lib/tovrat-data";
import { getAllChapters as getTenqrizmChapters } from "@/lib/tenqrizm-data";

export const revalidate = 86400;

const quranChapters = getQuranChapters();
const offlineManifest = {
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
};

export async function GET() {
  return NextResponse.json(offlineManifest, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
