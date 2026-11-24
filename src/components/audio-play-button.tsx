"use client";

import { useRef, useState } from "react";
import { playAudioExclusively, releaseAudio } from "@/lib/audio-playback";

export function AudioPlayButton({ src, label }: { src: string; label: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      const started = await playAudioExclusively(audio);
      if (!started) setIsPlaying(false);
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <button type="button" onClick={togglePlayback} aria-label={`${isPlaying ? "Dayandır" : "Oynat"}: ${label}`} title={`${isPlaying ? "Dayandır" : "Oynat"}: ${label}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground">
        {isPlaying ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H3v6h3l5 4V5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13" /></svg>
        )}
      </button>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={(event) => {
          setIsPlaying(false);
          releaseAudio(event.currentTarget);
        }}
        onEnded={(event) => {
          setIsPlaying(false);
          releaseAudio(event.currentTarget);
        }}
      />
    </>
  );
}
