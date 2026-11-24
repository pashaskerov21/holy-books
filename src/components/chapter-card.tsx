import Link from "next/link";
import type { QuranChapter } from "@/types/quran";
import { ReadStatusIcon } from "@/components/read-status-icon";
import { ChapterReadPercent } from "@/components/chapter-read-percent";
import { AudioPlayButton } from "@/components/audio-play-button";
import { useIsChapterFullyRead } from "@/lib/read-status";

interface ChapterCardProps {
  bookKey: string;
  chapter: QuranChapter;
}

export function ChapterCard({ bookKey, chapter }: ChapterCardProps) {
  const info = chapter.info.replace(/\s+/g, " ").trim();
  const isRead = useIsChapterFullyRead(bookKey, chapter.id, chapter.verses.length);

  return (
    <div className="relative border-b border-border py-4 first:pt-0 last:border-b-0 sm:py-5">
      <Link href={`/quran/${chapter.id}`} className="flex min-w-0 items-start gap-4 transition duration-300 ease-in-out active:scale-[0.98] active:duration-100">
        <span className="w-7 shrink-0 pt-0.5 text-xs tracking-wide text-muted tabular-nums">{String(chapter.id).padStart(3, "0")}</span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="truncate font-serif text-base text-foreground sm:text-lg">{chapter.chapter}</h2>
            <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted sm:text-sm">
              {chapter.verses.length} ayə
              <ReadStatusIcon active={isRead} />
            </span>
          </div>
          <div className={`flex items-end justify-between gap-3 ${chapter.audio ? "pr-10" : ""}`}>
            <p className="min-w-0 flex-1 text-xs text-muted">{info}</p>
            <ChapterReadPercent bookKey={bookKey} chapterId={chapter.id} totalCount={chapter.verses.length} />
          </div>
        </div>
      </Link>
      {chapter.audio && (
        <div className="absolute right-0 bottom-2">
          <AudioPlayButton src={`/audio/quran/${chapter.audio}`} label={chapter.chapter} />
        </div>
      )}
    </div>
  );
}
