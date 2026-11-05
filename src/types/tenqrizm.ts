export interface TenqrizmPassage {
  chapter: number;
  passage: number;
  text: string;
}

export interface TenqrizmChapter {
  chapter: number;
  title: string;
  info: string;
  total_passages: number;
  passages: TenqrizmPassage[];
}

export interface TenqrizmBook {
  id: number;
  slug: string;
  name: string;
  religion: string;
  info: string;
  total_books: number;
  language_origin: string;
  chapters: TenqrizmChapter[];
}

export type TenqrizmBookInfo = Omit<TenqrizmBook, "chapters">;
