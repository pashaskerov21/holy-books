import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VerseReader } from "@/components/verse-reader";
import { getChapterById, getQuranInfo } from "@/lib/quran-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

interface ChapterPageProps {
  params: Promise<{ chapter: string }>;
  searchParams: Promise<{ verse?: string }>;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { chapter } = await params;
  const chapterId = Number(chapter);
  const data = Number.isInteger(chapterId) ? getChapterById(chapterId) : undefined;

  if (!data) return {};

  const info = data.info.replace(/\s+/g, " ").trim();
  const title = `${data.chapter} (${data.id}-cü surə) — ${data.verses.length} ayə`;
  const description = `Quranın ${data.id}-cü surəsi olan ${data.chapter} Azərbaycan dilində, ${data.verses.length} ayə. ${info}`;

  return {
    title,
    description,
    keywords: [
      data.chapter,
      `${data.chapter} surəsi`,
      `${data.id}-cü surə`,
      "Quran ayələri",
      "Quran azərbaycan dilində",
    ],
    alternates: {
      canonical: `/quran/${data.id}`,
    },
    openGraph: {
      type: "article",
      locale: "az_AZ",
      url: `/quran/${data.id}`,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ChapterPage({
  params,
  searchParams,
}: ChapterPageProps) {
  const { chapter } = await params;
  const { verse } = await searchParams;
  const chapterId = Number(chapter);
  const data = Number.isInteger(chapterId) ? getChapterById(chapterId) : undefined;

  if (!data) {
    notFound();
  }

  const prevChapterId = getChapterById(data.id - 1) ? data.id - 1 : null;
  const nextChapterId = getChapterById(data.id + 1) ? data.id + 1 : null;

  const lastVerseNumber = data.verses[data.verses.length - 1].verse;
  const requestedVerse = verse === "last" ? lastVerseNumber : Number(verse);
  const startVerse = data.verses.some((v) => v.verse === requestedVerse)
    ? requestedVerse
    : data.verses[0].verse;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: data.chapter,
    position: data.id,
    isPartOf: {
      "@type": "Book",
      name: "Qurani-Kərim",
      url: `${SITE_URL}/quran`,
    },
    url: `${SITE_URL}/quran/${data.id}`,
    inLanguage: "az",
  };

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <VerseReader
        key={data.id}
        title={data.chapter}
        backHref="/quran"
        bookName={getQuranInfo().name}
        book="quran"
        basePath="/quran"
        chapterId={data.id}
        verses={data.verses}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
        startVerse={startVerse}
      />
    </div>
  );
}
