"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookCard } from "@/components/book-card";
import { ContinueReadingButton } from "@/components/continue-reading-button";
import { getLastActiveBookSlug } from "@/lib/reading-progress";
import type { IncilBookEntry, IncilBookInfo } from "@/types/incil";

const emptySubscribe = () => () => {};

interface IncilBookWithSlug extends IncilBookEntry {
  slug: string;
}

interface IncilBookBrowserProps {
  incil: IncilBookInfo;
  books: IncilBookWithSlug[];
  backHref: string;
}

export function IncilBookBrowser({
  incil,
  books,
  backHref,
}: IncilBookBrowserProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const lastActiveSlug = useSyncExternalStore(
    emptySubscribe,
    () => getLastActiveBookSlug("incil"),
    () => null,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("az");
    if (!q) return books;
    return books.filter(
      (book) =>
        book.name.toLocaleLowerCase("az").includes(q) ||
        book.name_en.toLocaleLowerCase("az").includes(q),
    );
  }, [books, query]);

  const isSearching = query.trim().length > 0;

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
                if (open) setQuery("");
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
            placeholder="Kitab axtar..."
            className="mb-5 w-full border-b border-border bg-transparent pb-2 text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>

      <main className="flex flex-1 flex-col px-5 pb-16 sm:px-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-3xl text-foreground sm:text-4xl">
            {incil.name}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {incil.info}
          </p>
        </div>

        <div className="flex flex-col">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              title={book.name}
              religion={book.name_en}
              description={book.info}
              href={`/incil/${book.slug}`}
            />
          ))}

          {isSearching && filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">
              Nəticə tapılmadı
            </p>
          )}
        </div>
      </main>

      {lastActiveSlug && (
        <ContinueReadingButton
          book={`incil-${lastActiveSlug}`}
          basePath={`/incil/${lastActiveSlug}`}
        />
      )}
    </div>
  );
}
