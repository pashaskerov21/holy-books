import tenqrizmData from "../../data/tenqrizm.json";
import type {
  TenqrizmBook,
  TenqrizmBookInfo,
  TenqrizmChapter,
  TenqrizmPassage,
} from "@/types/tenqrizm";

const book = tenqrizmData as TenqrizmBook;

export function getTenqrizmInfo(): TenqrizmBookInfo {
  const { chapters: _chapters, ...info } = book;
  return info;
}

export function getAllChapters(): TenqrizmChapter[] {
  return book.chapters;
}

export function getChapterById(id: number): TenqrizmChapter | undefined {
  return book.chapters.find((chapter) => chapter.chapter === id);
}

export function getPassage(
  chapterId: number,
  passageNumber: number,
): TenqrizmPassage | undefined {
  return getChapterById(chapterId)?.passages.find(
    (passage) => passage.passage === passageNumber,
  );
}
