import type { QuranBookInfo, QuranChapter, QuranVerse } from "@/types/quran";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function fetchQuranInfo(): Promise<QuranBookInfo> {
  const res = await fetch(`${getBaseUrl()}/api/quran/info`);

  if (!res.ok) {
    throw new Error("Quran haqqında məlumat yüklənmədi");
  }

  return res.json();
}

export async function fetchAllChapters(): Promise<QuranChapter[]> {
  const res = await fetch(`${getBaseUrl()}/api/quran`);

  if (!res.ok) {
    throw new Error("Quran datası yüklənmədi");
  }

  return res.json();
}

export async function fetchChapter(chapterId: number): Promise<QuranChapter> {
  const res = await fetch(`${getBaseUrl()}/api/quran/${chapterId}`);

  if (!res.ok) {
    throw new Error(`${chapterId}-ci surə tapılmadı`);
  }

  return res.json();
}

export async function fetchVerse(
  chapterId: number,
  verseNumber: number,
): Promise<QuranVerse> {
  const res = await fetch(`${getBaseUrl()}/api/quran/${chapterId}/${verseNumber}`);

  if (!res.ok) {
    throw new Error(`${chapterId}:${verseNumber} ayəsi tapılmadı`);
  }

  return res.json();
}
