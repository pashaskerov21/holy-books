export interface QuranVerse {
  chapter: number;
  verse: number;
  text: string;
}

export interface QuranChapter {
  id: number;
  chapter: string;
  info: string;
  verses: QuranVerse[];
}

export interface QuranBook {
  id: number;
  slug: string;
  name: string;
  religion: string;
  info: string;
  total_chapters: number;
  chapters: QuranChapter[];
}

export type QuranBookInfo = Omit<QuranBook, "chapters">;
