const CACHE_VERSION = "v9";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-${CACHE_VERSION}`;
const AUDIO_CACHE = `audio-${CACHE_VERSION}`;

const CORE_URLS = ["/", "/quran", "/quran/audio", "/incil", "/tovrat", "/tenqrizm"];

self.addEventListener("install", (event) => {
  // Activate this lightweight worker immediately; only its six entry pages
  // are fetched as part of installation.
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(PAGES_CACHE);
    await runWithConcurrency(CORE_URLS, 4, async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) await cache.put(url, response);
      } catch {
        // A page can be cached after the first successful visit.
      }
    });
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key !== STATIC_CACHE && key !== PAGES_CACHE && key !== AUDIO_CACHE)
        .map((key) => caches.delete(key)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_ALL") {
    event.waitUntil(cacheAllContent(event.source));
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.headers.has("RSC") || request.headers.get("accept")?.includes("text/x-component")) {
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (url.pathname.startsWith("/audio/quran/") && url.pathname.endsWith(".mp3")) {
    event.respondWith(cacheFirstAudio(request));
    return;
  }

  if (request.mode === "navigate") {
    const updatePromise = fetchAndCachePage(request, PAGES_CACHE);
    event.waitUntil(updatePromise.then(() => undefined).catch(() => undefined));
    event.respondWith(staleWhileRevalidatePage(request, PAGES_CACHE, updatePromise));
  }
});

async function cacheAllContent(client) {
  let failed = false;
  try {
    const response = await fetch("/api/offline-manifest", { cache: "no-store" });
    if (!response.ok) throw new Error("Offline manifest request failed");

    const manifest = await response.json();
    const pageUrls = [...CORE_URLS];
    const audioUrls = [];

    for (const chapterId of manifest.quranChapterIds ?? []) {
      pageUrls.push(`/quran/${chapterId}`);
    }
    for (const track of manifest.audioTracks ?? []) {
      if (typeof track.audio !== "string" || !/^[\w-]+\.mp3$/i.test(track.audio)) continue;
      pageUrls.push(`/quran/audio/${track.id}`);
      audioUrls.push(`/audio/quran/${track.audio}`);
    }
    for (const book of manifest.incilBooks ?? []) {
      pageUrls.push(`/incil/${book.slug}`);
      for (const chapterId of book.chapterIds ?? []) pageUrls.push(`/incil/${book.slug}/${chapterId}`);
    }
    for (const book of manifest.tovratBooks ?? []) {
      pageUrls.push(`/tovrat/${book.slug}`);
      for (const chapterId of book.chapterIds ?? []) pageUrls.push(`/tovrat/${book.slug}/${chapterId}`);
    }
    for (const chapterId of manifest.tenqrizmChapterIds ?? []) {
      pageUrls.push(`/tenqrizm/${chapterId}`);
    }

    const pagesCache = await caches.open(PAGES_CACHE);
    const staticCache = await caches.open(STATIC_CACHE);
    const assetUrls = new Set();

    await runWithConcurrency(pageUrls, 5, async (pageUrl) => {
      try {
        const pageResponse = await fetch(pageUrl);
        if (!pageResponse.ok) return;

        await pagesCache.put(pageUrl, pageResponse.clone());
        const html = await pageResponse.text();
        for (const match of html.matchAll(/<(?:script|link)[^>]+(?:src|href)="(\/_next\/static\/[^\"]+)"/g)) {
          assetUrls.add(match[1]);
        }
      } catch {
        failed = true;
      }
    });

    await runWithConcurrency([...assetUrls], 6, async (assetUrl) => {
      try {
        if (await staticCache.match(assetUrl)) return;
        const assetResponse = await fetch(assetUrl);
        if (assetResponse.ok) await staticCache.put(assetUrl, assetResponse);
      } catch {
        failed = true;
      }
    });

    const audioCache = await caches.open(AUDIO_CACHE);
    await runWithConcurrency(audioUrls, 2, async (audioUrl) => {
      try {
        if (await audioCache.match(audioUrl)) return;
        const audioResponse = await fetch(audioUrl);
        if (audioResponse.ok && audioResponse.status === 200) {
          await audioCache.put(audioUrl, audioResponse);
        }
      } catch {
        failed = true;
      }
    });
  } catch {
    failed = true;
  } finally {
    client?.postMessage({ type: "CACHE_ALL_RESULT", success: !failed });
  }
}

async function runWithConcurrency(items, limit, task) {
  let nextIndex = 0;
  const workerCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      await task(items[index]);
    }
  }));
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function cacheFirstAudio(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const cached = await cache.match(request.url);
  if (cached) return audioResponseFromCache(request, cached);

  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      await cache.put(request.url, response.clone());
    }
    return response;
  } catch {
    return new Response("Audio is not available offline", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function fetchAndCachePage(request, cacheName) {
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidatePage(request, cacheName, updatePromise) {
  const cache = await caches.open(cacheName);
  const cached =
    (await cache.match(request)) ||
    (await cache.match(request, { ignoreSearch: true }));
  return cached || updatePromise;
}

async function audioResponseFromCache(request, cached) {
  const range = request.headers.get("range");
  if (!range) return cached;

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  const blob = await cached.blob();
  const size = blob.size;
  if (!match || (!match[1] && !match[2])) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes" },
    });
  }

  const isSuffixRange = !match[1];
  const suffixLength = isSuffixRange ? Number(match[2]) : null;
  const start = isSuffixRange ? Math.max(size - suffixLength, 0) : Number(match[1]);
  const requestedEnd = isSuffixRange || !match[2] ? size - 1 : Number(match[2]);
  const end = Math.min(requestedEnd, size - 1);
  if (start >= size || start > end) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes" },
    });
  }

  const headers = new Headers(cached.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  headers.set("Content-Type", cached.headers.get("Content-Type") ?? "audio/mpeg");
  return new Response(blob.slice(start, end + 1), { status: 206, headers });
}
