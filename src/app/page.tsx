import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { BookCard } from "@/components/book-card";
import { getQuranInfo } from "@/lib/quran-data";
import { getIncilInfo } from "@/lib/incil-data";
import { getTovratInfo } from "@/lib/tovrat-data";
import { getTenqrizmInfo } from "@/lib/tenqrizm-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Quran (Qurani-Kərim), İncil, Tövrat və Tenqriçiliyi Azərbaycan dilində onlayn oxumaq üçün platforma.",
  inLanguage: "az",
  hasPart: [
    {
      "@type": "Book",
      name: "Qurani-Kərim",
      alternateName: "Quran",
      url: `${SITE_URL}/quran`,
      inLanguage: "az",
    },
    {
      "@type": "Book",
      name: "İncil",
      alternateName: ["Yeni Əhd", "Matta İncili", "Mark İncili", "Luka İncili", "Yəhya İncili"],
      url: `${SITE_URL}/incil`,
      inLanguage: "az",
    },
    {
      "@type": "Book",
      name: "Tövrat",
      alternateName: ["Tora", "Yaradılış", "Çıxış", "Levililər", "Saylar", "Təsniyə"],
      url: `${SITE_URL}/tovrat`,
      inLanguage: "az",
    },
    {
      "@type": "Book",
      name: "Tenqriçilik",
      alternateName: ["Tenqrizm", "Tengri", "Göy Tanrı"],
      url: `${SITE_URL}/tenqrizm`,
      inLanguage: "az",
    },
  ],
};

export default function Home() {
  const quran = getQuranInfo();
  const incil = getIncilInfo();
  const tovrat = getTovratInfo();
  const tenqrizm = getTenqrizmInfo();

  const books = [
    {
      title: quran.name,
      religion: quran.religion,
      description: quran.info,
      href: "/quran",
    },
    {
      title: incil.name,
      religion: incil.religion,
      description: incil.info,
      href: "/incil",
    },
    {
      title: tovrat.name,
      religion: tovrat.religion,
      description: tovrat.info,
      href: "/tovrat",
    },
    {
      title: tenqrizm.name,
      religion: tenqrizm.religion,
      description: tenqrizm.info,
      href: "/tenqrizm",
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        title="Müqəddəs Dinlər və Kitablar"
        actions={
          <Link
            href="/wishlist"
            aria-label="Seçilmişlər"
            className="flex shrink-0 items-center justify-center rounded-full text-foreground/55 transition-colors duration-300 hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </Link>
        }
      />

      <main className="flex flex-1 flex-col px-5 pb-16 sm:px-10">
        <div className="flex flex-col">
          {books.map((book) => (
            <BookCard key={book.href} {...book} />
          ))}
        </div>
      </main>
    </div>
  );
}
