"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // A cache-first SW in dev serves stale chunks after every edit,
      // causing hydration mismatches against the freshly rebuilt HTML.
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) registration.unregister();
        })
        .catch(() => {});
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // offline capability just won't be available this session
    });
  }, []);

  return null;
}
