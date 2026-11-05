import { ImageResponse } from "next/og";
import { BookIconGlyph } from "@/components/book-icon-glyph";

const size = { width: 192, height: 192 };

export async function GET() {
  return new ImageResponse(<BookIconGlyph size={size.width} />, size);
}
