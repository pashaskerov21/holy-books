import { ImageResponse } from "next/og";
import { BookIconGlyph } from "@/components/book-icon-glyph";

const size = { width: 512, height: 512 };

export async function GET() {
  return new ImageResponse(<BookIconGlyph size={size.width} />, size);
}
