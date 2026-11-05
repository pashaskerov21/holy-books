import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TovratChapterBrowser } from "@/components/tovrat-chapter-browser";
import { getBookBySlug } from "@/lib/tovrat-data";
import { SITE_NAME } from "@/lib/site";

interface TovratBookPageProps {
  params: Promise<{ book: string }>;
}

export async function generateMetadata({
  params,
}: TovratBookPageProps): Promise<Metadata> {
  const { book: bookSlug } = await params;
  const data = getBookBySlug(bookSlug);

  if (!data) return {};

  const info = data.info.replace(/\s+/g, " ").trim();
  const title = `${data.name} Azərbaycan Dilində — Bütün Fəsillər`;
  const description = `${data.name} kitabının ${data.total_chapters} fəslini Azərbaycan dilində onlayn oxuyun. ${info}`;

  return {
    title,
    description,
    keywords: [
      data.name,
      `${data.name} Tövrat`,
      "Tövrat azərbaycan dilində",
      "Tövrat fəsilləri",
    ],
    alternates: {
      canonical: `/tovrat/${bookSlug}`,
    },
    openGraph: {
      type: "website",
      locale: "az_AZ",
      url: `/tovrat/${bookSlug}`,
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

export default async function TovratBookPage({ params }: TovratBookPageProps) {
  const { book: bookSlug } = await params;
  const data = getBookBySlug(bookSlug);

  if (!data) {
    notFound();
  }

  return (
    <TovratChapterBrowser
      book={data}
      chapters={data.chapters}
      backHref="/tovrat"
      basePath={`/tovrat/${bookSlug}`}
      bookKey={`tovrat-${bookSlug}`}
    />
  );
}
