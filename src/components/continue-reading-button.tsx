"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getReadingProgress, type ReadingProgress } from "@/lib/reading-progress";

interface ContinueReadingButtonProps {
  book: string;
  basePath: string;
}

export function ContinueReadingButton({
  book,
  basePath,
}: ContinueReadingButtonProps) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);

  useEffect(() => {
    setProgress(getReadingProgress(book));
  }, [book]);

  if (!progress) return null;

  return (
    <Link
      href={`${basePath}/${progress.chapterId}?verse=${progress.verse}`}
      className="fixed right-5 bottom-6 z-10 flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-background shadow-sm transition duration-300 ease-in-out active:scale-[0.97] active:duration-100 sm:right-10 sm:bottom-8"
    >
      Davam et
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-3.5 w-3.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
