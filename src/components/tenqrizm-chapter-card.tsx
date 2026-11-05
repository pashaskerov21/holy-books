import Link from "next/link";
import type { TenqrizmChapter } from "@/types/tenqrizm";
import { ReadStatusIcon } from "@/components/read-status-icon";
import { ChapterReadPercent } from "@/components/chapter-read-percent";
import { useIsChapterFullyRead } from "@/lib/read-status";

interface TenqrizmChapterCardProps {
  bookKey: string;
  chapter: TenqrizmChapter;
}

export function TenqrizmChapterCard({ bookKey, chapter }: TenqrizmChapterCardProps) {
  const info = chapter.info.replace(/\s+/g, " ").trim();
  const isRead = useIsChapterFullyRead(bookKey, chapter.chapter, chapter.passages.length);

  return (
    <Link
      href={`/tenqrizm/${chapter.chapter}`}
      className="flex items-start gap-4 border-b border-border py-4 transition duration-300 ease-in-out first:pt-0 last:border-b-0 active:scale-[0.98] active:duration-100 sm:py-5"
    >
      <span className="w-7 shrink-0 pt-0.5 text-xs tracking-wide text-muted tabular-nums">
        {String(chapter.chapter).padStart(3, "0")}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="truncate font-serif text-base text-foreground sm:text-lg">
            {chapter.title}
          </h2>
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted sm:text-sm">
            {chapter.passages.length} bənd
            <ReadStatusIcon active={isRead} />
          </span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <p className="min-w-0 flex-1 text-xs text-muted">{info}</p>
          <ChapterReadPercent
            bookKey={bookKey}
            chapterId={chapter.chapter}
            totalCount={chapter.passages.length}
          />
        </div>
      </div>
    </Link>
  );
}
