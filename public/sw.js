const CACHE_VERSION = "v5";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-${CACHE_VERSION}`;

const CORE_URLS = ["/", "/quran", "/incil", "/tovrat", "/tenqrizm"];

const AZ_CHAR_MAP = { ə: "e", ı: "i", ö: "o", ü: "u", ş: "s", ç: "c", ğ: "g" };

function slugifyBookName(name) {
  return name.toLowerCase().replace(/[əıöüşçğ]/g, (char) => AZ_CHAR_MAP[char] ?? char);
}

async function getPrecacheUrls() {
  const urls = [...CORE_URLS];

  try {
    const infoRes = await fetch("/api/quran/info");
    const info = await infoRes.json();
    for (let i = 1; i <= info.total_chapters; i++) {
      urls.push(`/quran/${i}`);
    }
  } catch {
    // quran info unreachable during install; chapters get cached on first visit instead
  }

  try {
    const incilRes = await fetch("/api/incil");
    const incil = await incilRes.json();
    for (const book of incil.books ?? []) {
      const slug = slugifyBookName(book.name);
      urls.push(`/incil/${slug}`);
      for (const chapter of book.chapters ?? []) {
        urls.push(`/incil/${slug}/${chapter.chapter}`);
      }
    }
  } catch {
    // incil data unreachable during install; books/chapters get cached on first visit instead
  }

  try {
    const tovratRes = await fetch("/api/tovrat");
    const tovrat = await tovratRes.json();
    for (const book of tovrat.books ?? []) {
      const slug = slugifyBookName(book.name);
      urls.push(`/tovrat/${slug}`);
      for (const chapter of book.chapters ?? []) {
        urls.push(`/tovrat/${slug}/${chapter.chapter}`);
      }
    }
  } catch {
    // tovrat data unreachable during install; books/chapters get cached on first visit instead
  }

  try {
    const tenqrizmRes = await fetch("/api/tenqrizm");
    const chapters = await tenqrizmRes.json();
    for (const chapter of chapters ?? []) {
      urls.push(`/tenqrizm/${chapter.chapter}`);
    }
  } catch {
    // tenqrizm data unreachable during install; chapters get cached on first visit instead
  }

  return urls;
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
      const urls = await getPrecacheUrls();
      const discoveredAssets = new Set();

      await Promise.all(
        urls.map(async (url) => {
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
        }),
      );

      await Promise.all(
        [...discoveredAssets].map(async (assetUrl) => {
          try {
            const response = await fetch(assetUrl);
            if (response.ok) await staticCache.put(assetUrl, response);
          } catch {
            // this asset will simply get cached on its first visit instead
          }
        }),
      );

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
          .filter((key) => key !== STATIC_CACHE && key !== PAGES_CACHE)
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

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, PAGES_CACHE));
});

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
