/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import vm from 'vm';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { patchDist, patchHtml } = require('../scripts/patch-pwa.js');

const SW_SOURCE = fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.js'), 'utf8');
const ORIGIN = 'https://shenming.example';

type Handler = (event: Record<string, unknown>) => void;

function quotaError() {
  return Object.assign(new Error('quota'), { name: 'QuotaExceededError' });
}

function loadWorker({
  active = null as object | null,
  fetchImpl = (() => Promise.reject(new TypeError('offline'))) as (request: Request) => Promise<Response>,
  putImpl = undefined as undefined | (() => Promise<void>),
  addAllImpl = undefined as undefined | (() => Promise<void>),
} = {}) {
  const store = new Map<string, Response>();
  const handlers: Record<string, Handler> = {};
  const posted: unknown[] = [];
  const keyOf = (request: Request | string) => new URL(typeof request === 'string' ? request : request.url, ORIGIN).pathname;
  const cache = {
    add: jest.fn(async (url: string) => { store.set(url, new Response(`cached ${url}`)); }),
    addAll: jest.fn(addAllImpl ?? (async (urls: string[]) => urls.forEach((url) => store.set(url, new Response(`cached ${url}`))))),
    put: jest.fn(putImpl ?? (async (request: Request, response: Response) => { store.set(keyOf(request), response); })),
  };
  const caches = {
    open: jest.fn(async () => cache),
    match: jest.fn(async (request: Request | string) => store.get(keyOf(request))?.clone()),
    keys: jest.fn(async () => ['shenming-divination-old', 'shenming-divination-__BUILD_ID__']),
    delete: jest.fn(async () => true),
  };
  const self = {
    location: new URL(ORIGIN),
    registration: { active },
    skipWaiting: jest.fn(),
    clients: {
      claim: jest.fn(async () => undefined),
      matchAll: jest.fn(async () => [{ postMessage: (message: unknown) => posted.push(message) }]),
    },
    addEventListener: (type: string, handler: Handler) => {
      handlers[type] = handler;
    },
  };
  vm.runInNewContext(SW_SOURCE, { self, caches, fetch: fetchImpl, Response, URL, Promise, console });

  async function dispatchFetch(pathname: string, mode = 'no-cors') {
    let responded: Promise<Response> | undefined;
    handlers.fetch({
      request: { url: ORIGIN + pathname, method: 'GET', mode },
      respondWith: (value: Promise<Response>) => { responded = value; },
    });
    return responded ? await responded : undefined;
  }

  async function dispatch(type: string, data?: unknown) {
    let waited: Promise<unknown> = Promise.resolve();
    handlers[type]({ data, waitUntil: (value: Promise<unknown>) => { waited = value; } });
    return waited;
  }

  return { self, caches, cache, store, posted, dispatchFetch, dispatch };
}

describe('service worker resilience', () => {
  it('takes over immediately on first install but waits for the page on updates', async () => {
    const first = loadWorker();
    await first.dispatch('install');
    expect(first.self.skipWaiting).toHaveBeenCalled();
    expect(first.cache.addAll).toHaveBeenCalledWith(expect.arrayContaining(['/offline.html', '/pwa-status.js']));

    const update = loadWorker({ active: {} });
    await update.dispatch('install');
    expect(update.self.skipWaiting).not.toHaveBeenCalled();

    update.dispatch('message', { type: 'SKIP_WAITING' });
    expect(update.self.skipWaiting).toHaveBeenCalledTimes(1);
  });

  it('does not let a missing icon block the install', async () => {
    const worker = loadWorker();
    worker.cache.add = jest.fn((_url: string) => Promise.reject(new TypeError('404')));
    await expect(worker.dispatch('install')).resolves.toBeUndefined();
    expect(worker.cache.addAll).not.toHaveBeenCalledWith(expect.arrayContaining(['/assets/images/icon.png']));
  });

  it('fails the install and warns the page when precaching runs out of space', async () => {
    const worker = loadWorker({ active: {}, addAllImpl: () => Promise.reject(quotaError()) });
    await expect(worker.dispatch('install')).rejects.toThrow('quota');
    expect(worker.posted).toContainEqual({ type: 'storage-full' });
  });

  it('removes caches from older builds on activate', async () => {
    const worker = loadWorker();
    await worker.dispatch('activate');
    expect(worker.caches.delete).toHaveBeenCalledWith('shenming-divination-old');
    expect(worker.self.clients.claim).toHaveBeenCalled();
  });

  it('still serves fresh pages when caching hits the storage quota', async () => {
    const worker = loadWorker({
      fetchImpl: async () => new Response('fresh page', { status: 200 }),
      putImpl: () => Promise.reject(quotaError()),
    });

    const response = await worker.dispatchFetch('/temple', 'navigate');
    expect(await response!.text()).toBe('fresh page');
    expect(worker.posted).toContainEqual({ type: 'storage-full' });
  });

  it('falls back to the cached app shell for an unvisited route while offline', async () => {
    const worker = loadWorker();
    await worker.dispatch('install');

    const response = await worker.dispatchFetch('/library', 'navigate');
    expect(await response!.text()).toBe('cached /');
  });

  it('uses the offline page when the app shell was evicted, and plain text when nothing is cached', async () => {
    const worker = loadWorker();
    worker.store.set('/offline.html', new Response('offline page'));
    expect(await (await worker.dispatchFetch('/wishes', 'navigate'))!.text()).toBe('offline page');

    worker.store.clear();
    const bare = await worker.dispatchFetch('/wishes', 'navigate');
    expect(bare!.status).toBe(503);
    expect(await bare!.text()).toContain('目前離線');
  });

  it('unwraps redirected cached responses from clean-URL hosts', async () => {
    const worker = loadWorker();
    const redirected = new Response('offline page');
    Object.defineProperty(redirected, 'redirected', { value: true });
    Object.defineProperty(redirected, 'clone', { value: () => redirected });
    worker.store.set('/offline.html', redirected);

    const response = await worker.dispatchFetch('/wishes', 'navigate');
    expect(response!.redirected).toBe(false);
    expect(await response!.text()).toBe('offline page');
  });

  it('tells the page when a bundle chunk is missing offline', async () => {
    const worker = loadWorker();
    const response = await worker.dispatchFetch('/_expo/static/js/web/route-abc.js');

    expect(response!.status).toBe(504);
    expect(worker.posted).toContainEqual({ type: 'asset-missing', url: `${ORIGIN}/_expo/static/js/web/route-abc.js` });
  });

  it('leaves API calls and other origins to the network', async () => {
    const worker = loadWorker();
    expect(await worker.dispatchFetch('/api/interpret')).toBeUndefined();
  });
});

describe('patch-pwa export step', () => {
  let dist: string;

  beforeEach(() => {
    dist = fs.mkdtempSync(path.join(os.tmpdir(), 'pwa-dist-'));
    fs.mkdirSync(path.join(dist, '_expo', 'static', 'js', 'web'), { recursive: true });
    fs.mkdirSync(path.join(dist, '(tabs)'), { recursive: true });
    fs.writeFileSync(path.join(dist, '_expo', 'static', 'js', 'web', 'entry-111.js'), '');
    fs.writeFileSync(path.join(dist, 'sw.js'), SW_SOURCE);
    fs.writeFileSync(path.join(dist, 'offline.html'), '<html><head></head><body></body></html>');
    const page = '<!DOCTYPE html><html  lang="en"><head><title data-rh="true"></title></head><body><div id="root"></div></body></html>';
    fs.writeFileSync(path.join(dist, 'index.html'), page);
    fs.writeFileSync(path.join(dist, 'temple.html'), page);
    fs.writeFileSync(path.join(dist, '(tabs)', 'daily.html'), page);
  });

  afterEach(() => {
    fs.rmSync(dist, { recursive: true, force: true });
  });

  it('patches every exported page once, not just the home page', () => {
    const result = patchDist(dist);
    expect(result.pages).toBe(3);

    for (const file of ['index.html', 'temple.html', path.join('(tabs)', 'daily.html')]) {
      const html = fs.readFileSync(path.join(dist, file), 'utf8');
      expect(html).toContain('<html lang="zh-TW">');
      expect(html).toContain('<script src="/pwa-status.js" defer></script>');
      expect(html).toContain('<link rel="manifest" href="/manifest.json" />');
      expect(html).toContain('<title data-rh="true">神明占卜</title>');
      expect(html.indexOf('window.__pwaBootErrors=[]')).toBeLessThan(html.indexOf('<div id="root">'));
    }
    expect(fs.readFileSync(path.join(dist, 'offline.html'), 'utf8')).not.toContain('pwa-status.js');

    const once = fs.readFileSync(path.join(dist, 'temple.html'), 'utf8');
    expect(patchHtml(once)).toBe(once);
  });

  it('ships the icons that manifest.json points at', () => {
    patchDist(dist);
    const manifestText = fs.readFileSync(path.join(__dirname, '..', 'public', 'manifest.json'), 'utf8');
    const manifest = JSON.parse(manifestText.replace(/^﻿/, ''));
    for (const icon of manifest.icons) {
      expect(fs.existsSync(path.join(dist, icon.src))).toBe(true);
    }
  });

  it('stamps the service worker with a build id and the bundle list', () => {
    const { buildId } = patchDist(dist);
    const sw = fs.readFileSync(path.join(dist, 'sw.js'), 'utf8');

    expect(buildId).toMatch(/^[0-9a-f]{12}$/);
    expect(sw).toContain(`const BUILD_ID = '${buildId}'`);
    expect(sw).toContain('const BUNDLE_ASSETS = ["/_expo/static/js/web/entry-111.js"]');

    fs.writeFileSync(path.join(dist, 'sw.js'), SW_SOURCE);
    fs.writeFileSync(path.join(dist, '_expo', 'static', 'js', 'web', 'entry-222.js'), '');
    expect(patchDist(dist).buildId).not.toBe(buildId);
  });
});
