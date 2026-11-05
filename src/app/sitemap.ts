import type { MetadataRoute } from "next";
import { getAllChapters } from "@/lib/quran-data";
import { getAllBooks as getAllIncilBooks, getBookSlug as getIncilBookSlug } from "@/lib/incil-data";
import { getAllBooks as getAllTovratBooks, getBookSlug as getTovratBookSlug } from "@/lib/tovrat-data";
import { getAllChapters as getAllTenqrizmChapters } from "@/lib/tenqrizm-data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const chapters = getAllChapters();
  const incilBooks = getAllIncilBooks();
  const tovratBooks = getAllTovratBooks();
  const tenqrizmChapters = getAllTenqrizmChapters();

  return [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/quran`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...chapters.map((chapter) => ({
      url: `${SITE_URL}/quran/${chapter.id}`,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/incil`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...incilBooks.flatMap((book) => {
      const bookSlug = getIncilBookSlug(book);
      return [
        {
          url: `${SITE_URL}/incil/${bookSlug}`,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        },
        ...book.chapters.map((chapter) => ({
          url: `${SITE_URL}/incil/${bookSlug}/${chapter.chapter}`,
          changeFrequency: "yearly" as const,
          priority: 0.7,
        })),
      ];
    }),
    {
      url: `${SITE_URL}/tovrat`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...tovratBooks.flatMap((book) => {
      const bookSlug = getTovratBookSlug(book);
      return [
        {
          url: `${SITE_URL}/tovrat/${bookSlug}`,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        },
        ...book.chapters.map((chapter) => ({
          url: `${SITE_URL}/tovrat/${bookSlug}/${chapter.chapter}`,
          changeFrequency: "yearly" as const,
          priority: 0.7,
        })),
      ];
    }),
    {
      url: `${SITE_URL}/tenqrizm`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...tenqrizmChapters.map((chapter) => ({
      url: `${SITE_URL}/tenqrizm/${chapter.chapter}`,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
