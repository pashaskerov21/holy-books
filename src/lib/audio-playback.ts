"use client";

let activeAudio: HTMLAudioElement | null = null;

export async function playAudioExclusively(audio: HTMLAudioElement): Promise<boolean> {
  if (activeAudio && activeAudio !== audio) activeAudio.pause();
  activeAudio = audio;

  try {
    await audio.play();
    return true;
  } catch {
    if (activeAudio === audio) activeAudio = null;
    return false;
  }
}

export function releaseAudio(audio: HTMLAudioElement) {
  if (activeAudio === audio) activeAudio = null;
}
