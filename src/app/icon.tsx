import { ImageResponse } from "next/og";
import { BookIconGlyph } from "@/components/book-icon-glyph";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<BookIconGlyph size={size.width} />, size);
}
