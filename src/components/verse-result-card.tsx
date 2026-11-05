import Link from "next/link";

interface VerseResultCardProps {
  basePath: string;
  chapterId: number;
  chapterName: string;
  verseNumber: number;
  text: string;
  query: string;
}

export function VerseResultCard({
  basePath,
  chapterId,
  chapterName,
  verseNumber,
  text,
  query,
}: VerseResultCardProps) {
  const { before, match, after } = buildSnippet(text, query);

  return (
    <Link
      href={`${basePath}/${chapterId}?verse=${verseNumber}`}
      className="flex flex-col gap-1.5 border-b border-border py-4 transition duration-300 ease-in-out first:pt-0 last:border-b-0 active:scale-[0.98] active:duration-100 sm:py-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="truncate font-serif text-sm text-foreground sm:text-base">
          {chapterName}
        </h3>
        <span className="shrink-0 text-xs text-muted tabular-nums">
          {verseNumber}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-muted sm:text-sm">
        {before}
        <span className="text-foreground">{match}</span>
        {after}
      </p>
    </Link>
  );
}

function buildSnippet(text: string, query: string, radius = 70) {
  if (!query) return { before: text, match: "", after: "" };

  const idx = text.toLocaleLowerCase("az").indexOf(query.toLocaleLowerCase("az"));
  if (idx === -1) return { before: text, match: "", after: "" };

  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);

  return {
    before: (start > 0 ? "…" : "") + text.slice(start, idx),
    match: text.slice(idx, idx + query.length),
    after: text.slice(idx + query.length, end) + (end < text.length ? "…" : ""),
  };
}
