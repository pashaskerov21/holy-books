import type {
  TovratBook,
  TovratBookEntry,
  TovratBookInfo,
  TovratChapter,
  TovratVerse,
} from "@/types/tovrat";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function fetchTovratInfo(): Promise<TovratBookInfo> {
  const res = await fetch(`${getBaseUrl()}/api/tovrat/info`);

  if (!res.ok) {
    throw new Error("Tövrat haqqında məlumat yüklənmədi");
  }

  return res.json();
}

export async function fetchTovrat(): Promise<TovratBook> {
  const res = await fetch(`${getBaseUrl()}/api/tovrat`);

  if (!res.ok) {
    throw new Error("Tövrat datası yüklənmədi");
  }

  return res.json();
}

export async function fetchTovratBook(bookSlug: string): Promise<TovratBookEntry> {
  const res = await fetch(`${getBaseUrl()}/api/tovrat/${bookSlug}`);

  if (!res.ok) {
    throw new Error(`${bookSlug} kitabı tapılmadı`);
  }

  return res.json();
}

export async function fetchTovratChapter(
  bookSlug: string,
  chapterNumber: number,
): Promise<TovratChapter> {
  const res = await fetch(`${getBaseUrl()}/api/tovrat/${bookSlug}/${chapterNumber}`);

  if (!res.ok) {
    throw new Error(`${bookSlug} ${chapterNumber}-ci fəsil tapılmadı`);
  }

  return res.json();
}

export async function fetchTovratVerse(
  bookSlug: string,
  chapterNumber: number,
  verseNumber: number,
): Promise<TovratVerse> {
  const res = await fetch(
    `${getBaseUrl()}/api/tovrat/${bookSlug}/${chapterNumber}/${verseNumber}`,
  );

  if (!res.ok) {
    throw new Error(`${bookSlug} ${chapterNumber}:${verseNumber} ayəsi tapılmadı`);
  }

  return res.json();
}
