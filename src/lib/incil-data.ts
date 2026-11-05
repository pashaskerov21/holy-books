import incilData from "../../data/incil.json";
import type {
  IncilBook,
  IncilBookEntry,
  IncilBookInfo,
  IncilChapter,
  IncilVerse,
} from "@/types/incil";

const book = incilData as IncilBook;

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

export function getIncilInfo(): IncilBookInfo {
  const { books: _books, ...info } = book;
  return info;
}

export function getFullIncil(): IncilBook {
  return book;
}

export function getAllBooks(): IncilBookEntry[] {
  return book.books;
}

export function getBookSlug(entry: IncilBookEntry): string {
  return slugifyBookName(entry.name);
}

export function getBookBySlug(slug: string): IncilBookEntry | undefined {
  const target = slug.toLowerCase();
  return book.books.find((entry) => slugifyBookName(entry.name) === target);
}

export function getChapter(
  bookSlug: string,
  chapterNumber: number,
): IncilChapter | undefined {
  return getBookBySlug(bookSlug)?.chapters.find(
    (chapter) => chapter.chapter === chapterNumber,
  );
}

export function getVerse(
  bookSlug: string,
  chapterNumber: number,
  verseNumber: number,
): IncilVerse | undefined {
  return getChapter(bookSlug, chapterNumber)?.verses.find(
    (verse) => verse.verse === verseNumber,
  );
}
