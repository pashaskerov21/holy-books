interface BookIconGlyphProps {
  size: number;
}

export function BookIconGlyph({ size }: BookIconGlyphProps) {
  const glyphSize = Math.round(size * 0.62);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000000",
      }}
    >
      <svg
        width={glyphSize}
        height={glyphSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M48 20 L14 27 L14 80 L48 73 Z" fill="#ffffff" />
        <path d="M52 20 L86 27 L86 80 L52 73 Z" fill="#ffffff" />
      </svg>
    </div>
  );
}
