import quranData from "../../data/quran.json";
import type {
  QuranBook,
  QuranBookInfo,
  QuranChapter,
  QuranVerse,
} from "@/types/quran";

const book = quranData as QuranBook;

export function getQuranInfo(): QuranBookInfo {
  const { chapters: _chapters, ...info } = book;
  return info;
}

export function getAllChapters(): QuranChapter[] {
  return book.chapters;
}

export function getChapterById(id: number): QuranChapter | undefined {
  return book.chapters.find((chapter) => chapter.id === id);
}

export function getVerse(
  chapterId: number,
  verseNumber: number,
): QuranVerse | undefined {
  return getChapterById(chapterId)?.verses.find(
    (verse) => verse.verse === verseNumber,
  );
}
