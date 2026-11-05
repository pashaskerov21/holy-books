"use client";

import { useEffect, useRef, useState } from "react";

interface CopyVerseButtonProps {
  text: string;
  onClick?: (event: React.MouseEvent) => void;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

export function CopyVerseButton({ text, onClick }: CopyVerseButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = async (event: React.MouseEvent) => {
    onClick?.(event);

    const didCopy = await copyToClipboard(text);
    if (!didCopy) return;

    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? "Kopyalandı" : "Kopyala"}
      className={`relative flex h-6 w-6 shrink-0 items-center justify-center transition-colors duration-300 ${
        copied ? "text-accent" : "text-foreground/55 hover:text-foreground"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={`absolute h-4 w-4 transition-opacity duration-150 ease-in-out ${
          copied ? "opacity-0" : "opacity-100"
        }`}
      >
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M14.5 9V6.5A2.5 2.5 0 0 0 12 4H6.5A2.5 2.5 0 0 0 4 6.5V12a2.5 2.5 0 0 0 2.5 2.5H9" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={`absolute h-4 w-4 transition-opacity duration-150 ease-in-out ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>
  );
}
