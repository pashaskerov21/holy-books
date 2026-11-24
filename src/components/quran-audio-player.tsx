"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { playAudioExclusively, releaseAudio } from "@/lib/audio-playback";

interface AudioTrack {
  id: number;
  title: string;
  src: string;
}

export function QuranAudioPlayer({
  tracks,
  initialIndex,
}: {
  tracks: AudioTrack[];
  initialIndex: number;
}) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedSourceRef = useRef<string | null>(null);
  const [trackIndex, setTrackIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [repeatCurrent, setRepeatCurrent] = useState(false);
  const track = tracks[trackIndex];
  const trackSrc = track?.src;

  const moveToTrack = useCallback((index: number) => {
    const nextIndex = (index + tracks.length) % tracks.length;
    setTrackIndex(nextIndex);
    setIsPlaying(true);
    router.replace(`/quran/audio/${tracks[nextIndex].id}`, { scroll: false });
  }, [router, tracks]);

  useEffect(() => {
    setTrackIndex(initialIndex);
    setIsPlaying(true);
  }, [initialIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !trackSrc) return;
    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }
    if (startedSourceRef.current === trackSrc) return;
    startedSourceRef.current = trackSrc;
    void playAudioExclusively(audio).then(setIsPlaying);
  }, [trackSrc]);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) {
      cleanupTimerRef.current = setTimeout(() => {
        audio.pause();
        releaseAudio(audio);
        cleanupTimerRef.current = null;
      }, 0);
    }
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      setIsPlaying(await playAudioExclusively(audio));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    if (repeatCurrent) {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      void playAudioExclusively(audio).then(setIsPlaying);
      return;
    }
    moveToTrack(trackIndex + 1);
  };

  const toggleRepeatMode = () => setRepeatCurrent((repeat) => !repeat);

  if (!track) return null;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
        <PageHeader
          title=""
          backHref="/quran/audio"
          titleClassName="font-serif text-xl font-semibold text-foreground/90 sm:text-2xl"
          actions={(
            <button
              type="button"
              onClick={toggleRepeatMode}
              aria-pressed={repeatCurrent}
              aria-label={repeatCurrent ? "Cari audionu təkrarla" : "Bütün audioları növbə ilə çal"}
              title={repeatCurrent ? "Cari audionu təkrarla" : "Bütün audioları növbə ilə çal"}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-foreground/5 ${repeatCurrent ? "text-foreground" : "text-foreground/55 hover:text-foreground"}`}
            >
              <span className="relative inline-flex h-4 w-4 items-center justify-center">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3" /></svg>
                {repeatCurrent && <span className="absolute text-[9px] font-bold">1</span>}
              </span>
            </button>
          )}
        />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <p className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">{track.title}</p>
          </div>

          <audio
            ref={audioRef}
            src={trackSrc}
            preload="auto"
            onPlay={() => setIsPlaying(true)}
            onPause={(event) => {
              setIsPlaying(false);
              releaseAudio(event.currentTarget);
            }}
            onEnded={handleEnded}
          />

          <div className="flex items-center justify-center gap-8">
            <button type="button" onClick={() => moveToTrack(trackIndex - 1)} aria-label="Əvvəlki audio" className="flex h-12 w-12 items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-foreground/5 hover:text-foreground">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M6 5h2v14H6zm13 0L9 12l10 7V5Z" /></svg>
            </button>
            <button type="button" onClick={togglePlayback} aria-label={isPlaying ? "Audionu saxla" : "Audionu oynat"} className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-95">
              {isPlaying ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7"><path d="M7 4.5v15l12-7.5-12-7.5Z" /></svg>
              )}
            </button>
            <button type="button" onClick={() => moveToTrack(trackIndex + 1)} aria-label="Növbəti audio" className="flex h-12 w-12 items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-foreground/5 hover:text-foreground">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M16 5h2v14h-2zM5 5l10 7-10 7V5Z" /></svg>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
