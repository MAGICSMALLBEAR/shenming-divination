// Service Worker for 神明占卜 PWA
// scripts/patch-pwa.js replaces __BUILD_ID__ with a hash of the exported bundle,
// so every web export gets a fresh cache name without a manual version bump.
const BUILD_ID = '__BUILD_ID__';
const CACHE_NAME = `shenming-divination-${BUILD_ID}`;
const OFFLINE_PAGE = '/offline.html';
// Hashed JS/CSS chunks of this export, filled in by scripts/patch-pwa.js so
// routes the visitor has not opened yet still start offline.
const BUNDLE_ASSETS = [/* __BUNDLE_ASSETS__ */];
const CORE_ASSETS = [
  '/',
  '/index.html',
  OFFLINE_PAGE,
  '/pwa-status.js',
  '/manifest.json',
];
// Nice to have offline, but a missing icon must never block the install.
const OPTIONAL_ASSETS = [
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

function isQuotaError(error) {
  return Boolean(error) && (error.name === 'QuotaExceededError' || error.code === 22);
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  clients.forEach((client) => client.postMessage(message));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll([...CORE_ASSETS, ...BUNDLE_ASSETS]);
      await Promise.all(OPTIONAL_ASSETS.map((asset) => cache.add(asset).catch(() => undefined)));
    }).catch(async (error) => {
      if (isQuotaError(error)) await notifyClients({ type: 'storage-full' });
      // Failing install keeps the previous worker and its cache in charge.
      throw error;
    })
  );
  // First install has no page running an older bundle, so take over at once.
  // Updates wait for the page to ask (SKIP_WAITING) so an open tab never loses
  // the cached chunks of the bundle it is still running.
  if (!self.registration.active) self.skipWaiting();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    ).then(() => self.clients.claim())
  );
});

async function cacheResponse(request, response) {
  if (!response || response.status !== 200 || request.method !== 'GET') return response;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  } catch (error) {
    // Running out of space must not break the page; it just won't work offline.
    if (isQuotaError(error)) await notifyClients({ type: 'storage-full' });
  }
  return response;
}

// Hosts with clean URLs redirect /index.html and /offline.html; a redirected
// response cannot answer a navigation, so hand back a plain copy instead.
function unredirected(response) {
  if (!response || !response.redirected) return response;
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
}

async function navigationResponse(request) {
  try {
    return await cacheResponse(request, await fetch(request));
  } catch {
    const cached = (await caches.match(request))
      || (await caches.match('/'))
      || (await caches.match('/index.html'))
      || (await caches.match(OFFLINE_PAGE));
    if (cached) return unredirected(cached);
    return new Response('目前離線，且此裝置尚未儲存離線版本。請連線後重新開啟。', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function staticResponse(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    return await cacheResponse(request, await fetch(request));
  } catch {
    // A bundle chunk that is neither cached nor reachable means the offline copy
    // is stale or was evicted; the page offers a reload once it is back online.
    if (new URL(request.url).pathname.startsWith('/_expo/')) {
      await notifyClients({ type: 'asset-missing', url: request.url });
    }
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate' || OFFLINE_ROUTES.includes(url.pathname)) {
    event.respondWith(navigationResponse(request));
    return;
  }

  event.respondWith(staticResponse(request));
});
