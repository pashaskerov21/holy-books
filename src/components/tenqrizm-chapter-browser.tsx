"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { TenqrizmChapterCard } from "@/components/tenqrizm-chapter-card";
import { VerseResultCard } from "@/components/verse-result-card";
import { ContinueReadingButton } from "@/components/continue-reading-button";
import type { TenqrizmBookInfo, TenqrizmChapter } from "@/types/tenqrizm";

const MAX_PASSAGE_RESULTS = 40;

const NON_DIGIT_KEYS = ["e", "E", "+", "-", "."];

function blockNonDigitKeys(event: React.KeyboardEvent<HTMLInputElement>) {
  if (NON_DIGIT_KEYS.includes(event.key)) {
    event.preventDefault();
  }
}

interface TenqrizmChapterBrowserProps {
  book: TenqrizmBookInfo;
  chapters: TenqrizmChapter[];
  backHref: string;
  basePath: string;
  bookKey: string;
}

export function TenqrizmChapterBrowser({
  book,
  chapters,
  backHref,
  basePath,
  bookKey,
}: TenqrizmChapterBrowserProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [chapterNumberQuery, setChapterNumberQuery] = useState("");
  const [passageNumberQuery, setPassageNumberQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("az");
    if (!q) return chapters;
    return chapters.filter((chapter) =>
      chapter.title.toLocaleLowerCase("az").includes(q),
    );
  }, [chapters, query]);

  const matchedPassages = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("az");
    if (!q) return [];

    const results: {
      chapterId: number;
      chapterName: string;
      passage: number;
      text: string;
    }[] = [];

    for (const chapter of chapters) {
      for (const passage of chapter.passages) {
        if (passage.text.toLocaleLowerCase("az").includes(q)) {
          results.push({
            chapterId: chapter.chapter,
            chapterName: chapter.title,
            passage: passage.passage,
            text: passage.text,
          });
          if (results.length >= MAX_PASSAGE_RESULTS) return results;
        }
      }
    }

    return results;
  }, [chapters, query]);

  const isSearching = query.trim().length > 0;

  const numericChapterMatch = useMemo(() => {
    if (!chapterNumberQuery) return undefined;
    const id = Number(chapterNumberQuery);
    return chapters.find((chapter) => chapter.chapter === id);
  }, [chapters, chapterNumberQuery]);

  const numericPassageMatch = useMemo(() => {
    if (!numericChapterMatch || !passageNumberQuery) return undefined;
    const passageNumber = Number(passageNumberQuery);
    return numericChapterMatch.passages.find(
      (passage) => passage.passage === passageNumber,
    );
  }, [numericChapterMatch, passageNumberQuery]);

  const showChapterNumberWarning =
    passageNumberQuery.length > 0 && chapterNumberQuery.length === 0;

  const isNumericSearching =
    chapterNumberQuery.length > 0 || passageNumberQuery.length > 0;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground transition-colors duration-300">
      <header className="flex items-center justify-between px-5 py-5 sm:px-10 sm:py-6">
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

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setSearchOpen((open) => {
                if (open) {
                  setQuery("");
                  setChapterNumberQuery("");
                  setPassageNumberQuery("");
                }
                return !open;
              });
            }}
            aria-label={searchOpen ? "Axtarışı bağla" : "Axtar"}
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
              {searchOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
                </>
              )}
            </svg>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div
        className={`overflow-hidden px-5 transition-[grid-template-rows] duration-300 ease-in-out sm:px-10 ${
          searchOpen ? "grid grid-rows-[1fr]" : "grid grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <input
            autoFocus={searchOpen}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Fəsil və ya bənd axtar..."
            className="mb-5 w-full border-b border-border bg-transparent pb-2 text-sm text-foreground placeholder:text-muted focus:outline-none"
          />

          <div className="mb-5 flex items-center gap-4">
            <input
              type="number"
              inputMode="numeric"
              onKeyDown={blockNonDigitKeys}
              value={chapterNumberQuery}
              onChange={(event) =>
                setChapterNumberQuery(event.target.value.replace(/\D/g, ""))
              }
              placeholder="Fəsil nömrə"
              className={`w-1/2 border-b bg-transparent pb-2 text-sm text-foreground transition-colors duration-300 placeholder:text-muted focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                showChapterNumberWarning
                  ? "animate-warning-glow"
                  : "border-border"
              }`}
            />
            <input
              type="number"
              inputMode="numeric"
              onKeyDown={blockNonDigitKeys}
              value={passageNumberQuery}
              onChange={(event) =>
                setPassageNumberQuery(event.target.value.replace(/\D/g, ""))
              }
              placeholder="Bənd nömrə"
              className="w-1/2 border-b border-border bg-transparent pb-2 text-sm text-foreground placeholder:text-muted focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>

      <main className="flex flex-1 flex-col px-5 pb-24 sm:px-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-3xl text-foreground sm:text-4xl">
            {book.name}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {book.info}
          </p>
        </div>

        <div className="flex flex-col">
          {isNumericSearching ? (
            <>
              {numericChapterMatch && !passageNumberQuery && (
                <TenqrizmChapterCard bookKey={bookKey} chapter={numericChapterMatch} />
              )}

              {numericChapterMatch && passageNumberQuery && numericPassageMatch && (
                <VerseResultCard
                  basePath={basePath}
                  chapterId={numericChapterMatch.chapter}
                  chapterName={numericChapterMatch.title}
                  verseNumber={numericPassageMatch.passage}
                  text={numericPassageMatch.text}
                  query=""
                />
              )}

              {chapterNumberQuery.length > 0 && !numericChapterMatch && (
                <p className="py-10 text-center text-sm text-muted">
                  Nəticə tapılmadı
                </p>
              )}

              {numericChapterMatch &&
                passageNumberQuery.length > 0 &&
                !numericPassageMatch && (
                  <p className="py-10 text-center text-sm text-muted">
                    Nəticə tapılmadı
                  </p>
                )}
            </>
          ) : (
            <>
              {isSearching && filtered.length > 0 && matchedPassages.length > 0 && (
                <span className="mb-3 text-xs font-medium tracking-widest text-muted uppercase">
                  Fəsillər
                </span>
              )}

              {filtered.map((chapter) => (
                <TenqrizmChapterCard key={chapter.chapter} bookKey={bookKey} chapter={chapter} />
              ))}

              {isSearching && matchedPassages.length > 0 && (
                <>
                  <span className="mt-2 mb-3 text-xs font-medium tracking-widest text-muted uppercase">
                    Bəndlər
                  </span>
                  {matchedPassages.map((match) => (
                    <VerseResultCard
                      key={`${match.chapterId}-${match.passage}`}
                      basePath={basePath}
                      chapterId={match.chapterId}
                      chapterName={match.chapterName}
                      verseNumber={match.passage}
                      text={match.text}
                      query={query.trim()}
                    />
                  ))}
                </>
              )}

              {isSearching && filtered.length === 0 && matchedPassages.length === 0 && (
                <p className="py-10 text-center text-sm text-muted">
                  Nəticə tapılmadı
                </p>
              )}
            </>
          )}
        </div>
      </main>

      <ContinueReadingButton book={bookKey} basePath={basePath} />
    </div>
  );
}
