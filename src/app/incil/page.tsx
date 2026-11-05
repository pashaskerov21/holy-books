import type { Metadata } from "next";
import { IncilBookBrowser } from "@/components/incil-book-browser";
import { getAllBooks, getBookSlug, getIncilInfo } from "@/lib/incil-data";
import { SITE_NAME } from "@/lib/site";

const title = "İncil Azərbaycan Dilində — Matta, Mark, Luka, Yəhya";
const description =
  "İncili (Yeni Əhdi) Azərbaycan dilində oxuyun — Matta İncili, Mark İncili, Luka İncili və Yəhya İncili daxil olmaqla dörd İncilin tam mətni.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "İncil",
    "İncil azərbaycan dilində",
    "Yeni Əhd",
    "Matta İncili",
    "Mark İncili",
    "Luka İncili",
    "Yəhya İncili",
    "Bibliya azərbaycan dilində",
    "xristianlıq müqəddəs kitabı",
  ],
  alternates: {
    canonical: "/incil",
  },
  openGraph: {
    type: "website",
    locale: "az_AZ",
    url: "/incil",
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

export default function IncilPage() {
  const books = getAllBooks().map((book) => ({ ...book, slug: getBookSlug(book) }));
  const incil = getIncilInfo();

  return <IncilBookBrowser incil={incil} books={books} backHref="/" />;
}
