export interface IncilVerse {
  chapter: number;
  verse: number;
  text: string;
}

export interface IncilChapter {
  chapter: number;
  title: string;
  total_verses: number;
  verses: IncilVerse[];
}

export interface IncilBookEntry {
  id: number;
  order: number;
  name: string;
  name_en: string;
  info: string;
  total_chapters: number;
  chapters: IncilChapter[];
}

export interface IncilBook {
  id: number;
  slug: string;
  name: string;
  religion: string;
  info: string;
  total_books: number;
  language_origin: string;
  books: IncilBookEntry[];
}

export type IncilBookInfo = Omit<IncilBook, "books">;
