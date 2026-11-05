export interface ReadingProgress {
  chapterId: number;
  verse: number;
}

function storageKey(book: string): string {
  return `reading-progress:${book}`;
}

export function getReadingProgress(book: string): ReadingProgress | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey(book));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.chapterId === "number" &&
      typeof parsed?.verse === "number"
    ) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export function setReadingProgress(
  book: string,
  progress: ReadingProgress,
): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey(book), JSON.stringify(progress));
  } catch {
    // localStorage may be unavailable (private mode, quota) — fail silently
  }
}

function lastActiveBookKey(module: string): string {
  return `reading-progress:last-active:${module}`;
}

// Books like İncil/Tövrat store per-book progress under `${module}-${bookSlug}`,
// so their book-list page (which book has an in-progress chapter?) can't be
// answered from that key alone — this tracks which sub-book was read most
// recently, per module (e.g. "incil", "tovrat").
export function getLastActiveBookSlug(module: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(lastActiveBookKey(module));
  } catch {
    return null;
  }
}

export function setLastActiveBookSlug(module: string, bookSlug: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(lastActiveBookKey(module), bookSlug);
  } catch {
    // localStorage may be unavailable (private mode, quota) — fail silently
  }
}

function chapterProgressKey(book: string): string {
  return `chapter-progress:${book}`;
}

function readChapterProgress(book: string): Record<number, number> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(chapterProgressKey(book));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

// Independent of getReadingProgress/setReadingProgress above, which only
// track the single most recent position for the "Continue Reading" button.
// This remembers a last-read verse per chapter, so re-opening any chapter
// directly from its chapter list resumes where that specific chapter was
// left off, not just the most recently visited one.
export function getChapterProgress(book: string, chapterId: number): number | null {
  const verse = readChapterProgress(book)[chapterId];
  return typeof verse === "number" ? verse : null;
}

export function setChapterProgress(
  book: string,
  chapterId: number,
  verse: number,
): void {
  if (typeof window === "undefined") return;

  try {
    const data = readChapterProgress(book);
    data[chapterId] = verse;
    window.localStorage.setItem(chapterProgressKey(book), JSON.stringify(data));
  } catch {
    // localStorage may be unavailable (private mode, quota) — fail silently
  }
}
