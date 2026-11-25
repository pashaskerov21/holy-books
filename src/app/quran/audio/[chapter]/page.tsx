import { notFound } from "next/navigation";
import { QuranAudioPlayer } from "@/components/quran-audio-player";
import { getAllChapters } from "@/lib/quran-data";

export function generateStaticParams() {
  return getAllChapters()
    .filter((chapter) => chapter.audio)
    .map((chapter) => ({ chapter: String(chapter.id) }));
}

export default async function QuranAudioPlayerPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: chapterParam } = await params;
  const chapterId = Number(chapterParam);
  const chapters = getAllChapters().filter((chapter) => chapter.audio);
  const currentIndex = chapters.findIndex((chapter) => chapter.id === chapterId);

  if (currentIndex < 0) notFound();

  const tracks = chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.chapter,
    src: `/audio/quran/${chapter.audio}`,
  }));

  return <QuranAudioPlayer tracks={tracks} initialIndex={currentIndex} />;
}
