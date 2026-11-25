import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VerseReader } from "@/components/verse-reader";
import { getAllChapters, getChapterById, getTenqrizmInfo } from "@/lib/tenqrizm-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

interface TenqrizmChapterPageProps {
  params: Promise<{ chapter: string }>;
}

export function generateStaticParams() {
  return getAllChapters().map((chapter) => ({ chapter: String(chapter.chapter) }));
}

export async function generateMetadata({
  params,
}: TenqrizmChapterPageProps): Promise<Metadata> {
  const { chapter } = await params;
  const chapterId = Number(chapter);
  const data = Number.isInteger(chapterId) ? getChapterById(chapterId) : undefined;

  if (!data) return {};

  const info = data.info.replace(/\s+/g, " ").trim();
  const title = `${data.title} — ${data.passages.length} bənd`;
  const description = `Tenqriçiliyin ${data.chapter}-ci fəsli olan ${data.title} Azərbaycan dilində, ${data.passages.length} bənd. ${info}`;

  return {
    title,
    description,
    keywords: [
      data.title,
      `${data.title} fəsli`,
      "Tenqriçilik bəndləri",
      "Tenqrizm azərbaycan dilində",
    ],
    alternates: {
      canonical: `/tenqrizm/${data.chapter}`,
    },
    openGraph: {
      type: "article",
      locale: "az_AZ",
      url: `/tenqrizm/${data.chapter}`,
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

export default async function TenqrizmChapterPage({
  params,
}: TenqrizmChapterPageProps) {
  const { chapter } = await params;
  const chapterId = Number(chapter);
  const data = Number.isInteger(chapterId) ? getChapterById(chapterId) : undefined;

  if (!data) {
    notFound();
  }

  const prevChapterId = getChapterById(data.chapter - 1) ? data.chapter - 1 : null;
  const nextChapterId = getChapterById(data.chapter + 1) ? data.chapter + 1 : null;

  // VerseReader is shared with Quran/İncil/Tövrat and speaks in
  // terms of `verse`, so passages are mapped to that shape at this boundary.
  const verses = data.passages.map((passage) => ({
    chapter: passage.chapter,
    verse: passage.passage,
    text: passage.text,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: data.title,
    position: data.chapter,
    isPartOf: {
      "@type": "Book",
      name: "Tenqriçilik",
      url: `${SITE_URL}/tenqrizm`,
    },
    url: `${SITE_URL}/tenqrizm/${data.chapter}`,
    inLanguage: "az",
  };

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <VerseReader
        key={data.chapter}
        title={data.title}
        backHref="/tenqrizm"
        bookName={getTenqrizmInfo().name}
        book="tenqrizm"
        basePath="/tenqrizm"
        chapterId={data.chapter}
        verses={verses}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
      />
    </div>
  );
}
