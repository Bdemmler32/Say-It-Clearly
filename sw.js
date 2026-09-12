// Say It Clearly — service worker
//
// BUMP THIS EVERY TIME YOU PUSH A CHANGE. It's the only line you need to
// touch. Changing it makes the browser treat this as a new service worker,
// which triggers install/activate again and — critically — deletes the old
// cache in activate() below, so nothing stale can ever linger in storage.
const VERSION = 'v16';
const CACHE_NAME = 'say-it-clearly-' + VERSION;

const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './phrases.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-48.png',
  './icons/bg-texture.webp',
];

self.addEventListener('install', (event) => {
  // Activate this new version immediately instead of waiting for every
  // open tab to close first.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only ever handle real http(s) requests. A page's service worker
  // intercepts EVERY outgoing fetch from that page, including ones made
  // by unrelated browser extensions running alongside it (chrome-extension:
  // URLs) — the Cache API can't store those, and trying to throws on every
  // single request, which was spamming the console and adding overhead on
  // any desktop browser with extensions installed (not an issue on mobile,
  // which doesn't support extensions).
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin) {
    // Network-first for our own files: always prefer whatever's actually
    // deployed right now. This is the main defense against staleness —
    // even if you forget to bump VERSION, anyone online still gets the
    // latest files. Cache is purely an offline fallback.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Cache-first for third-party assets (Google Fonts) — they essentially
    // never change, so there's no downside to caching aggressively.
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        });
      })
    );
  }
});
