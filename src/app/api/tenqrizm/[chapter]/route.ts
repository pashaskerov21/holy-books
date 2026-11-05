import { NextResponse } from "next/server";
import { getChapterById } from "@/lib/tenqrizm-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chapter: string }> },
) {
  const { chapter } = await params;
  const chapterId = Number(chapter);

  if (!Number.isInteger(chapterId)) {
    return NextResponse.json(
      { error: "Yanlış fəsil nömrəsi" },
      { status: 400 },
    );
  }

  const data = getChapterById(chapterId);

  if (!data) {
    return NextResponse.json({ error: "Fəsil tapılmadı" }, { status: 404 });
  }

  return NextResponse.json(data);
}
