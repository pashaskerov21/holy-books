"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CopyVerseButton } from "@/components/copy-verse-button";
import { PageHeader } from "@/components/page-header";
import { ReadStatusIcon } from "@/components/read-status-icon";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";
import { countTextOccurrences, formatVerseText, verseTextToPlainText } from "@/lib/format-verse-text";
import { toggleVersesReadThrough, useIsVerseRead } from "@/lib/read-status";
import { setChapterProgress, setLastActiveBookSlug, setReadingProgress } from "@/lib/reading-progress";
import { toggleWishlist, useIsInWishlist } from "@/lib/wishlist";
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
}: VerseReaderProps) {
  const listRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return [];
    return verses.flatMap((verse) =>
      Array.from(
        { length: countTextOccurrences(verse.text, query) },
        (_, occurrence) => ({ verse: verse.verse, occurrence }),
      ),
    );
  }, [searchQuery, verses]);
  const activeResult = searchResults[activeResultIndex];

  useEffect(() => {
    const highlight = new URLSearchParams(window.location.search).get("highlight");
    if (!highlight) return;
    setSearchQuery(highlight);
    setSearchOpen(true);
  }, []);

  const updateSearchQuery = (value: string) => {
    setSearchQuery(value);
    setActiveResultIndex(0);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set("highlight", value);
    else url.searchParams.delete("highlight");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  };

  const navigateSearchResult = (direction: -1 | 1) => {
    if (searchResults.length === 0) return;
    setActiveResultIndex((index) =>
      (index + direction + searchResults.length) % searchResults.length,
    );
  };

  useEffect(() => {
    if (!activeResult) return;
    const verse = listRef.current?.querySelector<HTMLElement>(
      `[data-verse="${activeResult.verse}"]`,
    );
    const match = verse?.querySelector<HTMLElement>("[data-search-match]");
    (match ?? verse)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeResult]);

  const toggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      return;
    }
    setSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("highlight")) return;
    const verse = params.get("verse");
    if (!verse) {
      requestAnimationFrame(() => window.scrollTo(0, 0));
      return;
    }
    const target = verse === "last"
      ? verses[verses.length - 1]?.verse
      : Number(verse);
    if (!target || !verses.some((item) => item.verse === target)) {
      requestAnimationFrame(() => window.scrollTo(0, 0));
      return;
    }
    if (target === verses[0]?.verse) {
      requestAnimationFrame(() => window.scrollTo(0, 0));
      return;
    }
    requestAnimationFrame(() => {
      listRef.current?.querySelector<HTMLElement>(`[data-verse="${target}"]`)?.scrollIntoView({ block: "start" });
    });
  }, [verses]);

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      const verse = Number(visible?.target.getAttribute("data-verse"));
      if (!verse) return;

      setReadingProgress(book, { chapterId, verse });
      setChapterProgress(book, chapterId, verse);
      const [module, bookSlug] = basePath.split("/").filter(Boolean);
      if (module && bookSlug) setLastActiveBookSlug(module, bookSlug);
      const url = new URL(`${basePath}/${chapterId}`, window.location.origin);
      url.searchParams.set("verse", String(verse));
      const highlight = new URLSearchParams(window.location.search).get("highlight");
      if (highlight) url.searchParams.set("highlight", highlight);
      if (`${window.location.pathname}${window.location.search}` !== `${url.pathname}${url.search}`) {
        window.history.replaceState(null, "", `${url.pathname}${url.search}`);
      }
    }, { rootMargin: "-10% 0px -70% 0px", threshold: 0 });

    root.querySelectorAll("[data-verse]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [basePath, book, chapterId, verses]);

  return (
    <>
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
        <PageHeader
          title={title}
          backHref={backHref}
          titleClassName="font-serif text-xl font-semibold text-foreground/90 sm:text-2xl"
          actions={(
            <button
              type="button"
              onClick={toggleSearch}
              aria-label={searchOpen ? "Axtarışı bağla" : "Axtar"}
              aria-expanded={searchOpen}
              aria-controls="verse-search-input"
              className="flex shrink-0 items-center justify-center rounded-full text-foreground/55 transition-colors duration-300 hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                {searchOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m21 21-4.3-4.3" /></>}
              </svg>
            </button>
          )}
        />
        {searchOpen && (
          <div className="px-5 pb-3 sm:px-10">
            <div className="relative border-b border-border">
              <input
                ref={searchInputRef}
                id="verse-search-input"
                value={searchQuery}
                onChange={(event) => updateSearchQuery(event.target.value)}
                placeholder="Mətndə axtar..."
                aria-label="Mətndə axtar"
                className="w-full bg-transparent pb-2 pr-32 text-sm text-foreground placeholder:text-muted focus:outline-none"
              />
              <div className="absolute right-0 top-0 flex items-center gap-1 text-muted">
                {searchQuery.trim() && (
                  <>
                    <span className="min-w-8 text-center text-xs tabular-nums" aria-live="polite">
                      {searchResults.length ? activeResultIndex + 1 : 0}/{searchResults.length}
                    </span>
                    <button type="button" onClick={() => navigateSearchResult(-1)} aria-label="Əvvəlki nəticə" disabled={!searchResults.length} className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-foreground/5 disabled:opacity-35">
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <button type="button" onClick={() => navigateSearchResult(1)} aria-label="Növbəti nəticə" disabled={!searchResults.length} className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-foreground/5 disabled:opacity-35">
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg>
                    </button>
                  </>
                )}
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
      {subtitle && <p className="-mt-3 px-5 pb-5 pl-11 font-serif text-sm text-foreground/70 sm:px-10 sm:pb-6 sm:pl-16 sm:text-base">{subtitle}</p>}

      <main ref={listRef} className="flex-1 px-5 pb-6 sm:px-10">
        <div className="mx-auto w-full max-w-4xl">
          {verses.map((verse) => (
            <VerseCard
              key={verse.verse}
              verse={verse}
              book={book}
              bookName={bookName}
              basePath={basePath}
              chapterId={chapterId}
              chapterName={title}
              highlight={activeResult?.verse === verse.verse ? searchQuery.trim() : ""}
              highlightOccurrence={activeResult?.verse === verse.verse ? activeResult.occurrence : -1}
            />
          ))}
          <nav className="flex justify-between border-t border-border py-5 text-sm text-muted">
            {prevChapterId ? <Link className="hover:text-foreground" href={`${basePath}/${prevChapterId}?verse=last`}>← Əvvəlki</Link> : <span />}
            {nextChapterId ? <Link className="hover:text-foreground" href={`${basePath}/${nextChapterId}`}>Növbəti →</Link> : <span />}
          </nav>
        </div>
      </main>
    </>
  );
}

function VerseCard({
  verse,
  book,
  bookName,
  basePath,
  chapterId,
  chapterName,
  highlight,
  highlightOccurrence,
}: {
  verse: QuranVerse;
  book: string;
  bookName: string;
  basePath: string;
  chapterId: number;
  chapterName: string;
  highlight: string;
  highlightOccurrence: number;
}) {
  const id = `${basePath}/${chapterId}?verse=${verse.verse}`;
  const isLiked = useIsInWishlist(id);
  const isRead = useIsVerseRead(book, chapterId, verse.verse);
  const copyText = `${bookName}\n${chapterName}\n${verseTextToPlainText(verse.text)}`;

  const toggleFavorite = (event: React.MouseEvent) => {
    event.stopPropagation();
    toggleWishlist({ id, bookName, chapterName, verseText: verse.text });
  };

  return (
    <article data-verse={verse.verse} className="scroll-mt-36 border-b border-border py-5 first:pt-1 sm:py-6">
      <div className="flex items-start gap-2">
        <span className="w-7 shrink-0 pt-1 text-xs tracking-wide text-muted tabular-nums">{verse.verse}</span>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[19px] leading-[1.9] text-foreground sm:text-[21px] sm:leading-loose">{formatVerseText(verse.text, highlight, highlightOccurrence)}</p>
          <div className="mt-4 flex items-center justify-end gap-4">
            <WishlistToggleButton active={isLiked} onClick={toggleFavorite} />
            <CopyVerseButton text={copyText} />
            <button type="button" onClick={() => toggleVersesReadThrough(book, chapterId, verse.verse)} aria-label={isRead ? `Oxunmuş statusunu sil (${verse.verse}-ci ayə)` : `1–${verse.verse} ayələrini oxunmuş kimi işarələ`} aria-pressed={isRead} className="rounded-full transition-colors hover:bg-foreground/5">
              <ReadStatusIcon active={isRead} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
