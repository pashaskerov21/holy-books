import { ImageResponse } from "next/og";
import { BookIconGlyph } from "@/components/book-icon-glyph";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<BookIconGlyph size={size.width} />, size);
}
