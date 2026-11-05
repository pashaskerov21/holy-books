import { useSyncExternalStore } from "react";

export interface WishlistItem {
  id: string;
  bookName: string;
  chapterName: string;
  verseText: string;
  addedAt: number;
}

const STORAGE_KEY = "wishlist";

const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readAll(): WishlistItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: WishlistItem[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    cachedRaw = null;
    emitChange();
  } catch {
    // localStorage may be unavailable (private mode, quota) — fail silently
  }
}

let cachedRaw: string | null = null;
let cachedSnapshot: WishlistItem[] = [];

export function getWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return cachedSnapshot;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = readAll().sort((a, b) => b.addedAt - a.addedAt);
  }

  return cachedSnapshot;
}

export function isInWishlist(id: string): boolean {
  return readAll().some((item) => item.id === id);
}

export function useIsInWishlist(id: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isInWishlist(id),
    () => false,
  );
}

const EMPTY_WISHLIST: WishlistItem[] = [];

export function useWishlist(): WishlistItem[] {
  return useSyncExternalStore(
    subscribe,
    getWishlist,
    () => EMPTY_WISHLIST,
  );
}

export function addToWishlist(item: Omit<WishlistItem, "addedAt">): void {
  const items = readAll();
  if (items.some((existing) => existing.id === item.id)) return;

  writeAll([...items, { ...item, addedAt: Date.now() }]);
}

export function removeFromWishlist(id: string): void {
  writeAll(readAll().filter((item) => item.id !== id));
}

export function toggleWishlist(item: Omit<WishlistItem, "addedAt">): boolean {
  if (isInWishlist(item.id)) {
    removeFromWishlist(item.id);
    return false;
  }

  addToWishlist(item);
  return true;
}
