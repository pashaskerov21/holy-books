"use client";

import { useEffect, useState } from "react";

export function OfflineDownloadButton() {
  const [controller, setController] = useState<ServiceWorker | null>(null);
  const [status, setStatus] = useState<"idle" | "downloading" | "complete" | "error">("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const updateController = () => setController(navigator.serviceWorker.controller);
    const handleMessage = (event: MessageEvent<{ type?: string; success?: boolean }>) => {
      if (event.data?.type !== "CACHE_ALL_RESULT") return;
      setStatus(event.data.success ? "complete" : "error");
    };

    updateController();
    navigator.serviceWorker.addEventListener("controllerchange", updateController);
    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", updateController);
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  if (status === "complete") return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {status === "downloading" && (
        <span
          aria-hidden="true"
          className="absolute -inset-1 animate-spin rounded-full border-2 border-transparent border-t-foreground"
        />
      )}
      <button
        type="button"
        aria-label={
          status === "downloading"
            ? "Oflayn yüklənir"
            : status === "error"
              ? "Yükləmə alınmadı. Yenidən cəhd et"
              : "Bütün məzmunu oflayn yüklə"
        }
        title={
          status === "error"
            ? "Yükləmə alınmadı. Yenidən cəhd et"
            : "Bütün məzmunu oflayn yüklə"
        }
        disabled={!controller || status === "downloading"}
        onClick={() => {
          if (!controller) return;
          setStatus("downloading");
          controller.postMessage({ type: "CACHE_ALL" });
        }}
        className={`relative flex h-12 w-12 items-center justify-center rounded-full border bg-surface text-foreground shadow-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${
          status === "error" ? "border-red-500" : "border-border"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
          <path d="M5 16v4h14v-4" />
        </svg>
        <span className="sr-only" aria-live="polite">
          {status === "downloading"
            ? "Oflayn məzmun yüklənir"
            : status === "error"
              ? "Yükləmə alınmadı, yenidən cəhd edə bilərsiniz"
              : "Bütün məzmunu oflayn yüklə"}
        </span>
      </button>
    </div>
  );
}
