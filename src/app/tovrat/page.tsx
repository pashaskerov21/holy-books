import type { Metadata } from "next";
import { TovratBookBrowser } from "@/components/tovrat-book-browser";
import { getAllBooks, getBookSlug, getTovratInfo } from "@/lib/tovrat-data";
import { SITE_NAME } from "@/lib/site";

const title = "Tövrat Azərbaycan Dilində — Musanın Beş Kitabı";
const description =
  "Tövratı (Toranı) Azərbaycan dilində oxuyun — Yaradılış, Çıxış, Levililər, Saylar və Təsniyə daxil olmaqla Musanın beş kitabının tam mətni.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Tövrat",
    "Tövrat azərbaycan dilində",
    "Tora",
    "Musanın beş kitabı",
    "Yaradılış",
    "Çıxış",
    "Levililər",
    "Saylar",
    "Təsniyə",
    "Yəhudilik müqəddəs kitabı",
  ],
  alternates: {
    canonical: "/tovrat",
  },
  openGraph: {
    type: "website",
    locale: "az_AZ",
    url: "/tovrat",
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

export default function TovratPage() {
  const books = getAllBooks().map((book) => ({ ...book, slug: getBookSlug(book) }));
  const tovrat = getTovratInfo();

  return <TovratBookBrowser tovrat={tovrat} books={books} backHref="/" />;
}
