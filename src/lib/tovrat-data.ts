import tovratData from "../../data/tovrat.json";
import type {
  TovratBook,
  TovratBookEntry,
  TovratBookInfo,
  TovratChapter,
  TovratVerse,
} from "@/types/tovrat";

const book = tovratData as TovratBook;

const AZ_CHAR_MAP: Record<string, string> = {
  ə: "e",
  ı: "i",
  ö: "o",
  ü: "u",
  ş: "s",
  ç: "c",
  ğ: "g",
};

export function slugifyBookName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[əıöüşçğ]/g, (char) => AZ_CHAR_MAP[char] ?? char);
}

export function getTovratInfo(): TovratBookInfo {
  const { books: _books, ...info } = book;
  return info;
}

export function getFullTovrat(): TovratBook {
  return book;
}

export function getAllBooks(): TovratBookEntry[] {
  return book.books;
}

export function getBookSlug(entry: TovratBookEntry): string {
  return slugifyBookName(entry.name);
}

export function getBookBySlug(slug: string): TovratBookEntry | undefined {
  const target = slug.toLowerCase();
  return book.books.find((entry) => slugifyBookName(entry.name) === target);
}

export function getChapter(
  bookSlug: string,
  chapterNumber: number,
): TovratChapter | undefined {
  return getBookBySlug(bookSlug)?.chapters.find(
    (chapter) => chapter.chapter === chapterNumber,
  );
}

export function getVerse(
  bookSlug: string,
  chapterNumber: number,
  verseNumber: number,
): TovratVerse | undefined {
  return getChapter(bookSlug, chapterNumber)?.verses.find(
    (verse) => verse.verse === verseNumber,
  );
}
