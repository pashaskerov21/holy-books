import { NextResponse } from "next/server";
import { getChapterById, getPassage } from "@/lib/tenqrizm-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chapter: string; passage: string }> },
) {
  const { chapter, passage } = await params;
  const chapterId = Number(chapter);
  const passageNumber = Number(passage);

  if (!Number.isInteger(chapterId) || !Number.isInteger(passageNumber)) {
    return NextResponse.json({ error: "Yanlış nömrə" }, { status: 400 });
  }

  if (!getChapterById(chapterId)) {
    return NextResponse.json({ error: "Fəsil tapılmadı" }, { status: 404 });
  }

  const data = getPassage(chapterId, passageNumber);

  if (!data) {
    return NextResponse.json({ error: "Bənd tapılmadı" }, { status: 404 });
  }

  return NextResponse.json(data);
}
