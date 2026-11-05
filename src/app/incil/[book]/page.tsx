import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IncilChapterBrowser } from "@/components/incil-chapter-browser";
import { getBookBySlug } from "@/lib/incil-data";
import { SITE_NAME } from "@/lib/site";

interface IncilBookPageProps {
  params: Promise<{ book: string }>;
}

export async function generateMetadata({
  params,
}: IncilBookPageProps): Promise<Metadata> {
  const { book: bookSlug } = await params;
  const data = getBookBySlug(bookSlug);

  if (!data) return {};

  const info = data.info.replace(/\s+/g, " ").trim();
  const title = `${data.name} İncili Azərbaycan Dilində — Bütün Fəsillər`;
  const description = `${data.name} İncilinin ${data.total_chapters} fəslini Azərbaycan dilində onlayn oxuyun. ${info}`;

  return {
    title,
    description,
    keywords: [
      data.name,
      `${data.name} İncili`,
      "İncil azərbaycan dilində",
      "İncil fəsilləri",
    ],
    alternates: {
      canonical: `/incil/${bookSlug}`,
    },
    openGraph: {
      type: "website",
      locale: "az_AZ",
      url: `/incil/${bookSlug}`,
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

export default async function IncilBookPage({ params }: IncilBookPageProps) {
  const { book: bookSlug } = await params;
  const data = getBookBySlug(bookSlug);

  if (!data) {
    notFound();
  }

  return (
    <IncilChapterBrowser
      book={data}
      chapters={data.chapters}
      backHref="/incil"
      basePath={`/incil/${bookSlug}`}
      bookKey={`incil-${bookSlug}`}
    />
  );
}
