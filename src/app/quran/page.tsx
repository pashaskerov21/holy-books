import type { Metadata } from "next";
import { ChapterBrowser } from "@/components/chapter-browser";
import { getAllChapters, getQuranInfo } from "@/lib/quran-data";
import { SITE_NAME } from "@/lib/site";

const title = "Quran (Qurani-Kərim) Azərbaycan Dilində — Bütün Surələr";
const description =
  "Qurani-Kərimin 114 surəsini Azərbaycan dilində onlayn oxuyun. Surə adına, surə/ayə nömrəsinə və ya ayə mətninə görə axtarış edin — əl-Bəqərə, Yasin və digər bütün surələr.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Quran",
    "Qurani Kərim",
    "Quran azərbaycan dilində",
    "Quran surələri",
    "Quran ayələri",
    "surə axtar",
    "əl-Bəqərə surəsi",
    "Yasin surəsi",
    "Quran tərcüməsi",
    "onlayn Quran oxu",
  ],
  alternates: {
    canonical: "/quran",
  },
  openGraph: {
    type: "website",
    locale: "az_AZ",
    url: "/quran",
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

export default function QuranPage() {
  const chapters = getAllChapters();
  const quran = getQuranInfo();

  return (
    <ChapterBrowser
      book={quran}
      chapters={chapters}
      backHref="/"
      basePath="/quran"
      bookKey="quran"
    />
  );
}
