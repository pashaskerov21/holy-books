import type { Metadata } from "next";
import { TenqrizmChapterBrowser } from "@/components/tenqrizm-chapter-browser";
import { getAllChapters, getTenqrizmInfo } from "@/lib/tenqrizm-data";
import { SITE_NAME } from "@/lib/site";

const title = "Tenqriçilik (Tenqrizm) Azərbaycan Dilində";
const description =
  "Qədim türk-monqol Göy Tanrı Tenqri inancını Azərbaycan dilində oxuyun — Orxon-Yenisey kitabələri, İrk Bitiq və tarixi mənbələr əsasında sistemləşdirilmiş məzmun.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Tenqriçilik",
    "Tenqrizm",
    "Tenqri",
    "Göy Tanrı",
    "türk-monqol inancı",
    "Orxon-Yenisey kitabələri",
    "İrk Bitiq",
    "qədim türk inancı",
  ],
  alternates: {
    canonical: "/tenqrizm",
  },
  openGraph: {
    type: "website",
    locale: "az_AZ",
    url: "/tenqrizm",
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

export default function TenqrizmPage() {
  const chapters = getAllChapters();
  const tenqrizm = getTenqrizmInfo();

  return (
    <TenqrizmChapterBrowser
      book={tenqrizm}
      chapters={chapters}
      backHref="/"
      basePath="/tenqrizm"
      bookKey="tenqrizm"
    />
  );
}
