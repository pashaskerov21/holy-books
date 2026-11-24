import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getAllChapters } from "@/lib/quran-data";

export default function QuranAudioListPage() {
  const chapters = getAllChapters().filter((chapter) => chapter.audio);

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
        <PageHeader title="Quran audioları" backHref="/quran" titleClassName="font-serif text-xl font-semibold text-foreground/90 sm:text-2xl" />
      </div>
      <main className="flex-1 px-5 pb-24 sm:px-10">
        <div className="mx-auto w-full max-w-4xl">
          {chapters.length ? chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/quran/audio/${chapter.id}`}
              className="flex items-center gap-4 border-b border-border py-4 transition-colors hover:bg-foreground/[0.02] active:scale-[0.99] sm:py-5"
            >
              <span className="w-8 shrink-0 text-xs tracking-wide text-muted tabular-nums">{String(chapter.id).padStart(3, "0")}</span>
              <span className="min-w-0 flex-1 truncate font-serif text-base text-foreground sm:text-lg">{chapter.chapter}</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 shrink-0 text-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          )) : (
            <p className="py-12 text-center text-sm text-muted">Hələ audio əlavə edilməyib.</p>
          )}
        </div>
      </main>
    </div>
  );
}
