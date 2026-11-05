import { useSyncExternalStore } from "react";

type ChapterReadMap = Record<number, number[]>;

const cache = new Map<string, ChapterReadMap>();
const listeners = new Map<string, Set<() => void>>();

function storageKey(bookKey: string): string {
  return `read-status:${bookKey}`;
}

function emitChange(bookKey: string): void {
  for (const listener of listeners.get(bookKey) ?? []) listener();
}

function subscribe(bookKey: string, listener: () => void): () => void {
  let set = listeners.get(bookKey);
  if (!set) {
    set = new Set();
    listeners.set(bookKey, set);
  }
  set.add(listener);
  return () => set.delete(listener);
}

function readBook(bookKey: string): ChapterReadMap {
  const cached = cache.get(bookKey);
  if (cached) return cached;

  if (typeof window === "undefined") return {};

  let data: ChapterReadMap = {};
  try {
    const raw = window.localStorage.getItem(storageKey(bookKey));
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object") data = parsed;
  } catch {
    // localStorage may be unavailable (private mode) or contain invalid JSON
  }

  cache.set(bookKey, data);
  return data;
}

function writeBook(bookKey: string, data: ChapterReadMap): void {
  cache.set(bookKey, data);

  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey(bookKey), JSON.stringify(data));
  } catch {
    // localStorage may be unavailable (private mode, quota) — fail silently
  }

  emitChange(bookKey);
}

export function isVerseRead(
  bookKey: string,
  chapterId: number,
  verse: number,
): boolean {
  return readBook(bookKey)[chapterId]?.includes(verse) ?? false;
}

export function markVerseRead(
  bookKey: string,
  chapterId: number,
  verse: number,
): void {
  const data = readBook(bookKey);
  const existing = data[chapterId] ?? [];
  if (existing.includes(verse)) return;

  writeBook(bookKey, { ...data, [chapterId]: [...existing, verse] });
}

export function isChapterFullyRead(
  bookKey: string,
  chapterId: number,
  totalCount: number,
): boolean {
  if (totalCount <= 0) return false;
  return (readBook(bookKey)[chapterId]?.length ?? 0) >= totalCount;
}

export function useIsVerseRead(
  bookKey: string,
  chapterId: number,
  verse: number,
): boolean {
  return useSyncExternalStore(
    (listener) => subscribe(bookKey, listener),
    () => isVerseRead(bookKey, chapterId, verse),
    () => false,
  );
}

export function useIsChapterFullyRead(
  bookKey: string,
  chapterId: number,
  totalCount: number,
): boolean {
  return useSyncExternalStore(
    (listener) => subscribe(bookKey, listener),
    () => isChapterFullyRead(bookKey, chapterId, totalCount),
    () => false,
  );
}

// Same underlying store as isChapterFullyRead — read percentage and the
// "fully read" checkmark are always in sync because they're two views of the
// one read-verse list, not two separately-tracked pieces of state.
export function getChapterReadPercent(
  bookKey: string,
  chapterId: number,
  totalCount: number,
): number {
  if (totalCount <= 0) return 0;
  const readCount = readBook(bookKey)[chapterId]?.length ?? 0;
  return Math.min(100, Math.floor((readCount / totalCount) * 100));
}

export function useChapterReadPercent(
  bookKey: string,
  chapterId: number,
  totalCount: number,
): number {
  return useSyncExternalStore(
    (listener) => subscribe(bookKey, listener),
    () => getChapterReadPercent(bookKey, chapterId, totalCount),
    () => 0,
  );
}
