export interface TovratVerse {
  chapter: number;
  verse: number;
  text: string;
}

export interface TovratChapter {
  chapter: number;
  title: string;
  total_verses: number;
  verses: TovratVerse[];
}

export interface TovratBookEntry {
  id: number;
  order: number;
  name: string;
  name_en: string;
  info: string;
  total_chapters: number;
  chapters: TovratChapter[];
}

export interface TovratBook {
  id: number;
  slug: string;
  name: string;
  religion: string;
  info: string;
  total_books: number;
  language_origin: string;
  books: TovratBookEntry[];
}

export type TovratBookInfo = Omit<TovratBook, "books">;
