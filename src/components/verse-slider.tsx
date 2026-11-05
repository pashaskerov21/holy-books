"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import type { QuranVerse } from "@/types/quran";
import {
  setReadingProgress,
  setLastActiveBookSlug,
  getChapterProgress,
  setChapterProgress,
} from "@/lib/reading-progress";
import { markVerseRead } from "@/lib/read-status";
import { formatVerseText } from "@/lib/format-verse-text";

interface VerseSliderProps {
  book: string;
  basePath: string;
  chapterId: number;
  verses: QuranVerse[];
  prevChapterId?: number | null;
  nextChapterId?: number | null;
  startVerse?: number;
  onActiveVerseChange?: (verse: QuranVerse) => void;
  onToggleWishlist?: () => void;
}

export function VerseSlider({
  book,
  basePath,
  chapterId,
  verses,
  prevChapterId = null,
  nextChapterId = null,
  startVerse,
  onActiveVerseChange,
  onToggleWishlist,
}: VerseSliderProps) {
  const router = useRouter();
  const startIndex = useMemo(() => {
    if (startVerse == null) return 0;
    const index = verses.findIndex((v) => v.verse === startVerse);
    return index === -1 ? 0 : index;
  }, [verses, startVerse]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    startIndex,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi?.canScrollPrev()) {
      emblaApi.scrollPrev();
      return;
    }

    if (prevChapterId) {
      router.push(`${basePath}/${prevChapterId}?verse=last`);
    }
  }, [emblaApi, basePath, prevChapterId, router]);

  const scrollNext = useCallback(() => {
    if (emblaApi?.canScrollNext()) {
      emblaApi.scrollNext();
      return;
    }

    if (nextChapterId) {
      router.push(`${basePath}/${nextChapterId}`);
    }
  }, [emblaApi, basePath, nextChapterId, router]);

  // The server picks the initial verse from the `?verse=` search param, but an
  // offline-cached page is always served as if that param were absent (the
  // service worker can't precache every verse permutation), so it silently
  // lands on the first verse. Re-resolve the real URL client-side and correct
  // the position once embla is ready — this covers online navigation too,
  // it's just a no-op there since the server already got it right.
  useEffect(() => {
    if (!emblaApi) return;

    const verseParam = new URLSearchParams(window.location.search).get("verse");

    let requestedVerse: number | undefined;
    if (verseParam != null) {
      const lastVerseNumber = verses[verses.length - 1]?.verse;
      requestedVerse = verseParam === "last" ? lastVerseNumber : Number(verseParam);
    } else {
      // No verse in the URL — this chapter was opened directly from its
      // chapter list rather than via "Continue Reading", so resume at this
      // specific chapter's own last-read verse, if it has one.
      requestedVerse = getChapterProgress(book, chapterId) ?? undefined;
    }

    if (requestedVerse == null) return;

    const index = verses.findIndex((v) => v.verse === requestedVerse);
    if (index !== -1 && emblaApi.selectedScrollSnap() !== index) {
      emblaApi.scrollTo(index, true);
    }
  }, [emblaApi, verses, book, chapterId]);

  const readTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setSelectedIndex(index);
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());

      const verseNumber = verses[index]?.verse;
      if (verseNumber != null) {
        setReadingProgress(book, { chapterId, verse: verseNumber });
        setChapterProgress(book, chapterId, verseNumber);
        onActiveVerseChange?.(verses[index]);

        // Only counts as "read" once the verse has stayed active for a
        // moment — a bare swipe-through shouldn't instantly tick every
        // verse it passed over.
        if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
        readTimeoutRef.current = setTimeout(() => {
          markVerseRead(book, chapterId, verseNumber);
        }, 800);

        // basePath is "/tovrat/yaradilis" for a book-within-a-testament chapter,
        // vs. just "/quran" where there's no sub-book — the book-list page
        // (e.g. /tovrat) only needs to know the sub-book case.
        const [module, bookSlug] = basePath.split("/").filter(Boolean);
        if (module && bookSlug) {
          setLastActiveBookSlug(module, bookSlug);
        }

        // Swiping between verses never touches the URL (only crossing a
        // chapter boundary does, via router.push), so a plain page refresh
        // would otherwise always reopen at whatever verse the URL originally
        // had — usually verse 1. history.replaceState (not router.replace)
        // keeps this a pure address-bar update: no RSC re-fetch, no new
        // history entry for every swipe.
        const url = `${basePath}/${chapterId}?verse=${verseNumber}`;
        if (`${window.location.pathname}${window.location.search}` !== url) {
          window.history.replaceState(null, "", url);
        }
      }
    };

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
    };
  }, [emblaApi, verses, chapterId, book, basePath, onActiveVerseChange]);

  // Handle hand-swipes that are released past the first/last verse: embla
  // itself just rubber-bands at the edge, so cross-chapter navigation has
  // to be detected separately from the raw pointer gesture.
  useEffect(() => {
    if (!emblaApi) return;

    const root = emblaApi.rootNode();
    let startX = 0;

    const handlePointerDown = (event: PointerEvent) => {
      startX = event.clientX;
    };

    const handlePointerUp = (event: PointerEvent) => {
      const deltaX = event.clientX - startX;
      const threshold = 60;

      if (deltaX <= -threshold && !emblaApi.canScrollNext() && nextChapterId) {
        router.push(`${basePath}/${nextChapterId}`);
      } else if (
        deltaX >= threshold &&
        !emblaApi.canScrollPrev() &&
        prevChapterId
      ) {
        router.push(`${basePath}/${prevChapterId}?verse=last`);
      }
    };

    root.addEventListener("pointerdown", handlePointerDown);
    root.addEventListener("pointerup", handlePointerUp);

    return () => {
      root.removeEventListener("pointerdown", handlePointerDown);
      root.removeEventListener("pointerup", handlePointerUp);
    };
  }, [emblaApi, basePath, nextChapterId, prevChapterId, router]);

  const prevDisabled = !canPrev && !prevChapterId;
  const nextDisabled = !canNext && !nextChapterId;

  // Only the active slide's scroll state is ever shown, so slides report
  // into this shared ref/state instead of each owning their own floating
  // button — keeps the "scroll down" affordance in the nav rows, clear of
  // the text itself.
  const [activeScrollState, setActiveScrollState] = useState({
    isOverflowing: false,
    isAtBottom: true,
  });
  const activeScrollDownRef = useRef<() => void>(() => {});

  const handleActiveScrollStateChange = useCallback(
    (state: {
      isOverflowing: boolean;
      isAtBottom: boolean;
      scrollDown: () => void;
    }) => {
      setActiveScrollState({
        isOverflowing: state.isOverflowing,
        isAtBottom: state.isAtBottom,
      });
      activeScrollDownRef.current = state.scrollDown;
    },
    []
  );

  const showScrollHint =
    activeScrollState.isOverflowing && !activeScrollState.isAtBottom;
  const scrollActiveDown = useCallback(() => {
    activeScrollDownRef.current();
  }, []);

  return (
    <div className="relative flex w-full flex-1 flex-col items-center">
      <div className="hidden w-full items-center justify-end gap-2 pb-4 sm:flex">
        <ScrollDownButton visible={showScrollHint} onClick={scrollActiveDown} />
        <NavControls
          activeIndex={selectedIndex + 1}
          totalVerses={verses.length}
          prevDisabled={prevDisabled}
          nextDisabled={nextDisabled}
          onPrev={scrollPrev}
          onNext={scrollNext}
        />
      </div>

      <div className="relative w-full flex-1 overflow-hidden" ref={emblaRef}>
        <div className="absolute inset-0 flex items-stretch">
          {verses.map((verse, index) => (
            <div
              key={verse.verse}
              className="flex min-h-0 min-w-0 shrink-0 grow-0 basis-full flex-col px-1 sm:px-2"
            >
              <VerseSlide
                verse={verse}
                isActive={index === selectedIndex}
                onActiveScrollStateChange={handleActiveScrollStateChange}
                onToggleWishlist={onToggleWishlist}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-center gap-4 bg-background/95 py-4 backdrop-blur-sm transition-colors duration-300 sm:hidden">
        <NavControls
          activeIndex={selectedIndex + 1}
          totalVerses={verses.length}
          prevDisabled={prevDisabled}
          nextDisabled={nextDisabled}
          onPrev={scrollPrev}
          onNext={scrollNext}
        />
        <ScrollDownButton visible={showScrollHint} onClick={scrollActiveDown} />
      </div>
    </div>
  );
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface VerseSlideProps {
  verse: QuranVerse;
  isActive: boolean;
  onActiveScrollStateChange: (state: {
    isOverflowing: boolean;
    isAtBottom: boolean;
    scrollDown: () => void;
  }) => void;
  onToggleWishlist?: () => void;
}

// Two clicks/taps within this window count as a double-tap. Matches the
// interval mobile OSes use to recognize a double-tap gesture.
const DOUBLE_TAP_MS = 350;

function VerseSlide({
  verse,
  isActive,
  onActiveScrollStateChange,
  onToggleWishlist,
}: VerseSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const lastTapRef = useRef(0);
  const lastPointerDownRef = useRef(0);

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScrollState = () => {
      setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
      setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight <= 4);
    };

    updateScrollState();

    // Only the container itself is observed: its box is fixed by the flex
    // layout (min-h-0), so shrinking the font below in response to overflow
    // never changes it and can't retrigger this observer into a loop.
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);
    el.addEventListener("scroll", updateScrollState, { passive: true });

    // Serif font metrics can still be settling in when we first measure,
    // which would leave a verse mis-centered until the next resize.
    document.fonts?.ready.then(updateScrollState);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", updateScrollState);
    };
  }, [verse.text]);

  const scrollDown = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const amount = Math.min(320, Math.round(el.clientHeight * 0.7));
    el.scrollBy({ top: amount, behavior: "smooth" });
  }, []);

  // Suppress the browser's native word-selection on the second tap of a
  // double-click/double-tap, before it can happen — preventDefault has to
  // land on pointerdown, since by the time click fires the selection has
  // already occurred.
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    const now = Date.now();
    if (now - lastPointerDownRef.current < DOUBLE_TAP_MS) {
      event.preventDefault();
    }
    lastPointerDownRef.current = now;
  }, []);

  const handleTap = useCallback(() => {
    if (!isActive) return;

    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      lastTapRef.current = 0;
      onToggleWishlist?.();
    } else {
      lastTapRef.current = now;
    }
  }, [isActive, onToggleWishlist]);

  useEffect(() => {
    if (!isActive) return;
    onActiveScrollStateChange({ isOverflowing, isAtBottom, scrollDown });
  }, [isActive, isOverflowing, isAtBottom, scrollDown, onActiveScrollStateChange]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onClick={handleTap}
      className={`flex flex-1 min-h-0 flex-col items-center overflow-y-auto px-2 pt-8 pb-15 text-center scrollbar-thin scrollbar-thumb-foreground/15 scrollbar-track-transparent sm:px-10 sm:py-8 ${
        isOverflowing ? "justify-start" : "justify-center"
      }`}
    >
      <span className="mb-6 text-xs text-muted tabular-nums sm:mb-8">
        {verse.verse}
      </span>
      <p
        className={`max-w-2xl font-serif leading-[1.9] text-foreground sm:leading-loose ${
          isOverflowing
            ? "text-[17px] sm:text-[19px]"
            : "text-[19px] sm:text-[21px]"
        }`}
      >
        {formatVerseText(verse.text)}
      </p>
    </div>
  );
}

function ScrollDownButton({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  // Kept mounted (just faded out) rather than unmounted: the nav row is
  // centered, so a button popping in/out of the flow would shift the
  // prev/next buttons sideways every time a verse's overflow state flips.
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Aşağı sürüşdür"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`absolute right-2 flex shrink-0 items-center justify-center rounded-full bg-foreground/5 text-foreground/70 transition-all duration-300 hover:text-foreground ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

interface NavControlsProps {
  activeIndex: number;
  totalVerses: number;
  prevDisabled: boolean;
  nextDisabled: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function NavControls({
  activeIndex,
  totalVerses,
  prevDisabled,
  nextDisabled,
  onPrev,
  onNext,
}: NavControlsProps) {
  return (
    <>
      <NavButton direction="prev" onClick={onPrev} disabled={prevDisabled} />
      <span className="min-w-12 text-center text-xs text-muted tabular-nums sm:text-sm">
        {activeIndex}/{totalVerses}
      </span>
      <NavButton direction="next" onClick={onNext} disabled={nextDisabled} />
    </>
  );
}

function NavButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Əvvəlki ayə" : "Növbəti ayə"}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5 text-foreground/70 transition-colors duration-300 disabled:opacity-20 enabled:hover:bg-foreground/10 enabled:hover:text-foreground sm:h-9 sm:w-9"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4"
      >
        {direction === "prev" ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}
