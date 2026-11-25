const CACHE_VERSION = "v8";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-${CACHE_VERSION}`;
const AUDIO_CACHE = `audio-${CACHE_VERSION}`;

const CORE_URLS = ["/", "/quran", "/quran/audio", "/incil", "/tovrat", "/tenqrizm"];

const AZ_CHAR_MAP = { ə: "e", ı: "i", ö: "o", ü: "u", ş: "s", ç: "c", ğ: "g" };

function slugifyBookName(name) {
  return name.toLowerCase().replace(/[əıöüşçğ]/g, (char) => AZ_CHAR_MAP[char] ?? char);
}

async function getPrecacheUrls() {
  const urls = [...CORE_URLS];
  const audioUrls = [];

  try {
    const manifestRes = await fetch("/api/offline-manifest");
    if (!manifestRes.ok) throw new Error("offline manifest unavailable");
    const manifest = await manifestRes.json();

    for (const chapterId of manifest.quranChapterIds ?? []) {
      urls.push(`/quran/${chapterId}`);
    }
    for (const track of manifest.audioTracks ?? []) {
      if (typeof track.audio !== "string" || !/^[\w-]+\.mp3$/i.test(track.audio)) continue;
      urls.push(`/quran/audio/${track.id}`);
      audioUrls.push(`/audio/quran/${track.audio}`);
    }
    for (const book of manifest.incilBooks ?? []) {
      urls.push(`/incil/${book.slug}`);
      for (const chapterId of book.chapterIds ?? []) urls.push(`/incil/${book.slug}/${chapterId}`);
    }
    for (const book of manifest.tovratBooks ?? []) {
      urls.push(`/tovrat/${book.slug}`);
      for (const chapterId of book.chapterIds ?? []) urls.push(`/tovrat/${book.slug}/${chapterId}`);
    }
    for (const chapterId of manifest.tenqrizmChapterIds ?? []) {
      urls.push(`/tenqrizm/${chapterId}`);
    }
  } catch {
    // precache the core pages; other routes will be cached after first visit
  }

  return { urls, audioUrls };
}

// A page's HTML references the JS chunks it needs via <script src>. A plain
// fetch() during install (unlike a real browser navigation) never triggers the
// browser to load those chunks, so without this they'd only get cached the
// first time someone actually visits that route online — meaning any
// never-visited chapter would silently fail to hydrate offline (no swipe, no
// buttons, no verse-position correction) even though its HTML was precached.
function extractStaticAssetUrls(html) {
  const urls = new Set();
  const pattern = /<script[^>]+src="(\/_next\/static\/[^"]+)"/g;
  for (const match of html.matchAll(pattern)) {
    urls.add(match[1]);
  }
  return urls;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pagesCache = await caches.open(PAGES_CACHE);
      const staticCache = await caches.open(STATIC_CACHE);
      const audioCache = await caches.open(AUDIO_CACHE);
      const { urls, audioUrls } = await getPrecacheUrls();
      const discoveredAssets = new Set();

      await runWithConcurrency(urls, 5, async (url) => {
          try {
            const response = await fetch(url);
            if (!response.ok) return;

            await pagesCache.put(url, response.clone());
            const html = await response.text();
            for (const assetUrl of extractStaticAssetUrls(html)) {
              discoveredAssets.add(assetUrl);
            }
          } catch {
            // this page will simply get cached on its first visit instead
          }
      });

      await runWithConcurrency([...discoveredAssets], 6, async (assetUrl) => {
          try {
            const response = await fetch(assetUrl);
            if (response.ok) await staticCache.put(assetUrl, response);
          } catch {
            // this asset will simply get cached on its first visit instead
          }
      });

      for (let index = 0; index < audioUrls.length; index += 2) {
        await Promise.all(audioUrls.slice(index, index + 2).map(async (audioUrl) => {
          try {
            const response = await fetch(audioUrl);
            if (response.ok && response.status === 200) {
              await audioCache.put(audioUrl, response);
            }
          } catch {
            // this audio remains available online and can be cached on first use
          }
        }));
      }

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== PAGES_CACHE && key !== AUDIO_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

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

  if (url.pathname === "/quran/audio") {
    event.waitUntil(cacheConfiguredAudios());
  }

  if (request.mode === "navigate") {
    const updatePromise = fetchAndCachePage(request, PAGES_CACHE);
    event.waitUntil(updatePromise.then(() => undefined).catch(() => undefined));
    event.respondWith(staleWhileRevalidatePage(request, PAGES_CACHE, updatePromise));
    return;
  }

  event.respondWith(networkFirst(request, PAGES_CACHE));
});

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

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached =
      (await cache.match(request)) ||
      (await cache.match(request, { ignoreSearch: true }));
    if (cached) return cached;
    throw new Error("offline and no cached response available");
  }
}

async function networkFirstAudio(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const cached = await cache.match(request.url);

  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      await cache.put(request.url, response.clone());
    }
    return response;
  } catch {
    if (cached) return audioResponseFromCache(request, cached);
    return new Response("Audio is not available offline", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
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

async function cacheConfiguredAudios() {
  try {
    const response = await fetch("/api/offline-manifest", { cache: "no-store" });
    if (!response.ok) return;

    const manifest = await response.json();
    const audioUrls = (manifest.audioTracks ?? [])
      .filter((track) => typeof track.audio === "string" && /^[\w-]+\.mp3$/i.test(track.audio))
      .map((track) => `/audio/quran/${track.audio}`);
    const cache = await caches.open(AUDIO_CACHE);

    for (let index = 0; index < audioUrls.length; index += 2) {
      await Promise.all(audioUrls.slice(index, index + 2).map(async (audioUrl) => {
        if (await cache.match(audioUrl)) return;
        const audioResponse = await fetch(audioUrl);
        if (audioResponse.ok && audioResponse.status === 200) {
          await cache.put(audioUrl, audioResponse);
        }
      }));
    }
  } catch {
    // the saved audio remains available when this refresh cannot reach the network
  }
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
