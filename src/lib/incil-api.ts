import type {
  IncilBook,
  IncilBookEntry,
  IncilBookInfo,
  IncilChapter,
  IncilVerse,
} from "@/types/incil";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function fetchIncilInfo(): Promise<IncilBookInfo> {
  const res = await fetch(`${getBaseUrl()}/api/incil/info`);

  if (!res.ok) {
    throw new Error("İncil haqqında məlumat yüklənmədi");
  }

  return res.json();
}

export async function fetchIncil(): Promise<IncilBook> {
  const res = await fetch(`${getBaseUrl()}/api/incil`);

  if (!res.ok) {
    throw new Error("İncil datası yüklənmədi");
  }

  return res.json();
}

export async function fetchIncilBook(bookSlug: string): Promise<IncilBookEntry> {
  const res = await fetch(`${getBaseUrl()}/api/incil/${bookSlug}`);

  if (!res.ok) {
    throw new Error(`${bookSlug} kitabı tapılmadı`);
  }

  return res.json();
}

export async function fetchIncilChapter(
  bookSlug: string,
  chapterNumber: number,
): Promise<IncilChapter> {
  const res = await fetch(`${getBaseUrl()}/api/incil/${bookSlug}/${chapterNumber}`);

  if (!res.ok) {
    throw new Error(`${bookSlug} ${chapterNumber}-ci fəsil tapılmadı`);
  }

  return res.json();
}

export async function fetchIncilVerse(
  bookSlug: string,
  chapterNumber: number,
  verseNumber: number,
): Promise<IncilVerse> {
  const res = await fetch(
    `${getBaseUrl()}/api/incil/${bookSlug}/${chapterNumber}/${verseNumber}`,
  );

  if (!res.ok) {
    throw new Error(`${bookSlug} ${chapterNumber}:${verseNumber} ayəsi tapılmadı`);
  }

  return res.json();
}
