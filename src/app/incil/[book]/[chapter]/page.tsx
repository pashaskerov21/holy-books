import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VerseReader } from "@/components/verse-reader";
import { getBookBySlug, getChapter, getIncilInfo } from "@/lib/incil-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

interface IncilChapterPageProps {
  params: Promise<{ book: string; chapter: string }>;
  searchParams: Promise<{ verse?: string }>;
}

export async function generateMetadata({
  params,
}: IncilChapterPageProps): Promise<Metadata> {
  const { book: bookSlug, chapter } = await params;
  const bookData = getBookBySlug(bookSlug);
  const chapterId = Number(chapter);
  const data =
    bookData && Number.isInteger(chapterId)
      ? getChapter(bookSlug, chapterId)
      : undefined;

  if (!bookData || !data) return {};

  const title = `${bookData.name} ${data.chapter} — ${data.verses.length} ayə`;
  const description = `${bookData.name} İncilinin ${data.chapter}-ci fəsli Azərbaycan dilində, ${data.verses.length} ayə. ${data.title}`;

  return {
    title,
    description,
    keywords: [
      bookData.name,
      `${bookData.name} ${data.chapter}`,
      "İncil ayələri",
      "İncil azərbaycan dilində",
    ],
    alternates: {
      canonical: `/incil/${bookSlug}/${data.chapter}`,
    },
    openGraph: {
      type: "article",
      locale: "az_AZ",
      url: `/incil/${bookSlug}/${data.chapter}`,
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

export default async function IncilChapterPage({
  params,
  searchParams,
}: IncilChapterPageProps) {
  const { book: bookSlug, chapter } = await params;
  const { verse } = await searchParams;
  const bookData = getBookBySlug(bookSlug);

  if (!bookData) {
    notFound();
  }

  const chapterId = Number(chapter);
  const data = Number.isInteger(chapterId) ? getChapter(bookSlug, chapterId) : undefined;

  if (!data) {
    notFound();
  }

  const prevChapterId = getChapter(bookSlug, data.chapter - 1) ? data.chapter - 1 : null;
  const nextChapterId = getChapter(bookSlug, data.chapter + 1) ? data.chapter + 1 : null;

  const lastVerseNumber = data.verses[data.verses.length - 1].verse;
  const requestedVerse = verse === "last" ? lastVerseNumber : Number(verse);
  const startVerse = data.verses.some((v) => v.verse === requestedVerse)
    ? requestedVerse
    : data.verses[0].verse;

  const basePath = `/incil/${bookSlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: `${bookData.name} ${data.chapter}`,
    position: data.chapter,
    isPartOf: {
      "@type": "Book",
      name: `${bookData.name} İncili`,
      url: `${SITE_URL}${basePath}`,
    },
    url: `${SITE_URL}${basePath}/${data.chapter}`,
    inLanguage: "az",
  };

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <VerseReader
        key={`${bookSlug}-${data.chapter}`}
        title={`${bookData.name} ${data.chapter}`}
        subtitle={data.title}
        backHref={basePath}
        bookName={getIncilInfo().name}
        book={`incil-${bookSlug}`}
        basePath={basePath}
        chapterId={data.chapter}
        verses={data.verses}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
        startVerse={startVerse}
      />
    </div>
  );
}
