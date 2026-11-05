import type {
  TenqrizmBookInfo,
  TenqrizmChapter,
  TenqrizmPassage,
} from "@/types/tenqrizm";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function fetchTenqrizmInfo(): Promise<TenqrizmBookInfo> {
  const res = await fetch(`${getBaseUrl()}/api/tenqrizm/info`);

  if (!res.ok) {
    throw new Error("Tenqriçilik haqqında məlumat yüklənmədi");
  }

  return res.json();
}

export async function fetchAllTenqrizmChapters(): Promise<TenqrizmChapter[]> {
  const res = await fetch(`${getBaseUrl()}/api/tenqrizm`);

  if (!res.ok) {
    throw new Error("Tenqriçilik datası yüklənmədi");
  }

  return res.json();
}

export async function fetchTenqrizmChapter(chapterId: number): Promise<TenqrizmChapter> {
  const res = await fetch(`${getBaseUrl()}/api/tenqrizm/${chapterId}`);

  if (!res.ok) {
    throw new Error(`${chapterId}-ci fəsil tapılmadı`);
  }

  return res.json();
}

export async function fetchTenqrizmPassage(
  chapterId: number,
  passageNumber: number,
): Promise<TenqrizmPassage> {
  const res = await fetch(`${getBaseUrl()}/api/tenqrizm/${chapterId}/${passageNumber}`);

  if (!res.ok) {
    throw new Error(`${chapterId}:${passageNumber} bəndi tapılmadı`);
  }

  return res.json();
}
