"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { WishlistCard } from "@/components/wishlist-card";
import { removeFromWishlist, useWishlist } from "@/lib/wishlist";

interface WishlistBrowserProps {
  backHref: string;
}

export function WishlistBrowser({ backHref }: WishlistBrowserProps) {
  const items = useWishlist();

  const handleRemove = (id: string) => {
    removeFromWishlist(id);
  };

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
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col px-5 pb-16 sm:px-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-3xl text-foreground sm:text-4xl">Seçilmişlər</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Ürək ikonu ilə saxladığınız ayələr burada toplanır.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Seçilmiş ayə yoxdur</p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <WishlistCard key={item.id} item={item} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
