"use client";

import { useChapterReadPercent } from "@/lib/read-status";

interface ChapterReadPercentProps {
  bookKey: string;
  chapterId: number;
  totalCount: number;
}

// 0% renders nothing — an unread chapter shouldn't clutter the list with a
// "0%" next to every entry.
export function ChapterReadPercent({
  bookKey,
  chapterId,
  totalCount,
}: ChapterReadPercentProps) {
  const percent = useChapterReadPercent(bookKey, chapterId, totalCount);
  if (percent <= 0) return null;

  return (
    <span className="shrink-0 font-mono text-[10px] text-muted tabular-nums sm:text-xs">
      {percent}%
    </span>
  );
}
