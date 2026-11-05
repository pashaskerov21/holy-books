"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { VerseSlider } from "@/components/verse-slider";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";
import { CopyVerseButton } from "@/components/copy-verse-button";
import { ReadStatusIcon } from "@/components/read-status-icon";
import { toggleWishlist, useIsInWishlist } from "@/lib/wishlist";
import { useIsVerseRead } from "@/lib/read-status";
import { verseTextToPlainText } from "@/lib/format-verse-text";
import type { QuranVerse } from "@/types/quran";

interface VerseReaderProps {
  title: string;
  subtitle?: string;
  backHref: string;
  bookName: string;
  book: string;
  basePath: string;
  chapterId: number;
  verses: QuranVerse[];
  prevChapterId?: number | null;
  nextChapterId?: number | null;
  startVerse?: number;
}

export function VerseReader({
  title,
  subtitle,
  backHref,
  bookName,
  book,
  basePath,
  chapterId,
  verses,
  prevChapterId = null,
  nextChapterId = null,
  startVerse,
}: VerseReaderProps) {
  // Pages key their VerseReader by chapter, so this only ever runs on mount
  // for a fresh chapter — no need to re-sync it on prop changes.
  const [activeVerse, setActiveVerse] = useState<QuranVerse>(() => {
    const found = startVerse == null ? undefined : verses.find((v) => v.verse === startVerse);
    return found ?? verses[0];
  });

  const wishlistId = useMemo(
    () => `${basePath}/${chapterId}?verse=${activeVerse.verse}`,
    [basePath, chapterId, activeVerse.verse],
  );

  const isLiked = useIsInWishlist(wishlistId);
  const isRead = useIsVerseRead(book, chapterId, activeVerse.verse);

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: wishlistId,
      bookName,
      chapterName: title,
      verseText: activeVerse.text,
    });
  };

  const copyText = `${bookName}\n${title}\n${verseTextToPlainText(activeVerse.text)}`;

  return (
    <>
      <header className="flex flex-col gap-1 px-5 py-5 sm:px-10 sm:py-6">
        <div className="flex items-center gap-2">
          <Link
            href={backHref}
            aria-label="Geri"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-medium tracking-widest text-foreground/90 uppercase sm:text-base">
            {title}
          </h1>
          <div className="-mr-1 ml-auto flex shrink-0 items-center gap-4">
            <WishlistToggleButton active={isLiked} onClick={handleToggleWishlist} />
            <CopyVerseButton text={copyText} />
            <ReadStatusIcon active={isRead} />
          </div>
        </div>
        {subtitle && (
          <p className="pl-6 mt-1 font-serif text-sm text-foreground/70 sm:text-base">
            {subtitle}
          </p>
        )}
      </header>

      <main className="flex flex-1 flex-col px-5 pb-6 sm:px-10">
        <VerseSlider
          book={book}
          basePath={basePath}
          chapterId={chapterId}
          verses={verses}
          prevChapterId={prevChapterId}
          nextChapterId={nextChapterId}
          startVerse={startVerse}
          onActiveVerseChange={setActiveVerse}
          onToggleWishlist={handleToggleWishlist}
        />
      </main>
    </>
  );
}
