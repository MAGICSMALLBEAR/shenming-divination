// Service Worker for 神明占卜 PWA
const CACHE_NAME = 'shenming-divination-v4';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/images/icon.png',
  '/assets/images/favicon.png',
];
const OFFLINE_ROUTES = [
  '/',
  '/daily',
  '/temple',
  '/collection',
  '/library',
  '/more',
  '/settings',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    )
  );
  self.clients.claim();
});

async function cacheResponse(request, response) {
  if (!response || response.status !== 200 || request.method !== 'GET') return response;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
}

async function navigationResponse(request) {
  try {
    return await cacheResponse(request, await fetch(request));
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match('/') || caches.match('/index.html');
  }
}

async function staticResponse(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    return await cacheResponse(request, await fetch(request));
  } catch {
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate' || OFFLINE_ROUTES.some((route) => new URL(request.url).pathname === route)) {
    event.respondWith(navigationResponse(request));
    return;
  }

  event.respondWith(staticResponse(request));
});
