"use client";

import { useEffect, useState } from "react";

export function OfflineDownloadButton() {
  const [controller, setController] = useState<ServiceWorker | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const updateController = () => setController(navigator.serviceWorker.controller);
    updateController();
    navigator.serviceWorker.addEventListener("controllerchange", updateController);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", updateController);
  }, []);

  return (
    <button
      type="button"
      aria-label={sent ? "Oflayn yükləmə başladı" : "Bütün məzmunu oflayn yüklə"}
      title={sent ? "Oflayn yükləmə başladı" : "Bütün məzmunu oflayn yüklə"}
      disabled={!controller}
      onClick={() => {
        controller?.postMessage({ type: "CACHE_ALL" });
        setSent(true);
      }}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
        <path d="M5 16v4h14v-4" />
      </svg>
      <span className="sr-only" aria-live="polite">
        {sent ? "Oflayn yükləmə başladı" : "Bütün məzmunu oflayn yüklə"}
      </span>
    </button>
  );
}
