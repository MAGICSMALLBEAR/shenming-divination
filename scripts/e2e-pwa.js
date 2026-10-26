// End-to-end check of the exported PWA in a real Chromium: offline start,
// unvisited routes offline, update prompt, failed update, low storage and an
// evicted bundle cache.
//
// Usage: npm run export:web && npm run test:e2e:pwa
//        npm run test:e2e:pwa -- --url https://shenming-divination.vercel.app
// With --url the deployed site is tested through a local proxy that can cut the
// network; the new-build scenario needs a controllable sw.js and is skipped.
// Playwright is not a project dependency; install it globally
// (npm i -g playwright && npx playwright install chromium) or set PLAYWRIGHT_PATH.
const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');

function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    'playwright',
    process.env.APPDATA && path.join(process.env.APPDATA, 'npm', 'node_modules', 'playwright'),
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      // try the next location
    }
  }
  throw new Error('Playwright not found. Install it globally or set PLAYWRIGHT_PATH.');
}

const DIST = path.join(__dirname, '..', 'dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
};

// Mutable server behaviour so scenarios can ship a "new build" or break sw.js.
const server = { swOverride: null, swStatus: 200, down: false };
const remoteUrl = (() => {
  const index = process.argv.indexOf('--url');
  return index === -1 ? null : process.argv[index + 1].replace(/\/+$/, '');
})();

// context.setOffline flips navigator.onLine for the page but does not stop the
// service worker's own fetches, so the server (or proxy) also drops every connection.
async function setOffline(context, offline) {
  cutNetwork(offline);
  await context.setOffline(offline);
}

const tunnels = new Set();
function cutNetwork(down) {
  server.down = down;
  if (down) tunnels.forEach((socket) => socket.destroy());
}

// Forward-only proxy for --url mode: plain HTTP requests and HTTPS CONNECT tunnels.
function startProxy() {
  const proxy = http.createServer((req, res) => {
    if (server.down) return req.socket.destroy();
    const target = new URL(req.url);
    const upstream = http.request(
      { host: target.hostname, port: target.port || 80, path: target.pathname + target.search, method: req.method, headers: req.headers },
      (response) => {
        res.writeHead(response.statusCode, response.headers);
        response.pipe(res);
      }
    );
    upstream.on('error', () => res.destroy());
    req.pipe(upstream);
  });
  proxy.on('connect', (req, client, head) => {
    if (server.down) return client.destroy();
    const [host, port] = req.url.split(':');
    const upstream = net.connect(Number(port) || 443, host, () => {
      client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      upstream.write(head);
      upstream.pipe(client);
      client.pipe(upstream);
    });
    for (const socket of [client, upstream]) {
      tunnels.add(socket);
      socket.on('close', () => tunnels.delete(socket));
      socket.on('error', () => {
        client.destroy();
        upstream.destroy();
      });
    }
  });
  return new Promise((resolve) => proxy.listen(0, '127.0.0.1', () => resolve(proxy)));
}

function resolveFile(pathname) {
  const clean = decodeURIComponent(pathname).replace(/\/+$/, '') || '/index';
  for (const candidate of [clean, `${clean}.html`, `/(tabs)${clean}.html`]) {
    const file = path.join(DIST, candidate);
    if (file.startsWith(DIST) && fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return null;
}

function startServer() {
  const httpServer = http.createServer((req, res) => {
    if (server.down) {
      req.socket.destroy();
      return;
    }
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname === '/sw.js' && (server.swOverride || server.swStatus !== 200)) {
      res.writeHead(server.swStatus, { 'Content-Type': TYPES['.js'], 'Cache-Control': 'no-cache' });
      res.end(server.swStatus === 200 ? server.swOverride : 'broken');
      return;
    }
    const file = resolveFile(pathname);
    if (!file) {
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => httpServer.listen(0, '127.0.0.1', () => resolve(httpServer)));
}

const results = [];
async function scenario(name, fn, { localOnly = false } = {}) {
  if (localOnly && remoteUrl) {
    results.push({ name, ok: true, skipped: true });
    console.log(`  - ${name}（正式站無法替換 sw.js，略過）`);
    return;
  }
  const started = Date.now();
  Object.assign(server, { swOverride: null, swStatus: 200 });
  cutNetwork(false);
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - started });
    console.log(`  ✓ ${name}`);
  } catch (error) {
    results.push({ name, ok: false, error });
    console.log(`  ✗ ${name}\n      ${error.message.split('\n')[0]}`);
  }
}

function notice(page, kind) {
  return page.locator(`[data-pwa-notice="${kind}"]`);
}

async function waitForApp(page) {
  await page.waitForFunction(() => document.getElementById('root')?.childElementCount > 0, null, { timeout: 30000 });
}

async function waitForController(page) {
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 60000 });
}

async function installedContext(browser, baseUrl, entry = '/temple') {
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto(baseUrl + entry, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitForApp(page);
  await waitForController(page);
  // Precache is part of install; make sure it has finished before going offline.
  await page.evaluate(() => navigator.serviceWorker.ready);
  return { context, page };
}

async function main() {
  let swSource = '';
  if (!remoteUrl) {
    if (!fs.existsSync(path.join(DIST, 'sw.js'))) throw new Error('dist/ is missing; run npm run export:web first.');
    swSource = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8');
    if (/const BUILD_ID = '__BUILD_ID__';/.test(swSource)) {
      throw new Error('dist/sw.js was not patched; run npm run export:web.');
    }
  }

  const { chromium } = loadPlaywright();
  const httpServer = await (remoteUrl ? startProxy() : startServer());
  const baseUrl = remoteUrl || `http://127.0.0.1:${httpServer.address().port}`;
  const browser = await chromium.launch(
    remoteUrl ? { proxy: { server: `http://127.0.0.1:${httpServer.address().port}` }, args: ['--disable-quic'] } : {}
  );
  if (remoteUrl) {
    const deployed = await (await fetch(`${remoteUrl}/sw.js`)).text();
    console.log(`deployed ${deployed.match(/const BUILD_ID = '[^']*'/)?.[0] ?? 'sw.js without BUILD_ID'}`);
  }
  console.log(`PWA e2e against ${baseUrl}`);

  try {
    await scenario('deep link registers the service worker and starts offline', async () => {
      const { context, page } = await installedContext(browser, baseUrl, '/temple');
      if (await notice(page, 'sw-unavailable').count()) throw new Error('service worker reported unavailable');

      await setOffline(context, true);
      await notice(page, 'offline').waitFor({ timeout: 5000 });
      await page.reload();
      await waitForApp(page);
      await notice(page, 'offline').waitFor({ timeout: 5000 });

      await setOffline(context, false);
      await page.waitForFunction(() => !document.querySelector('[data-pwa-notice="offline"]'));
      await context.close();
    });

    await scenario('a route never visited still opens offline', async () => {
      const { context, page } = await installedContext(browser, baseUrl, '/');
      await setOffline(context, true);
      await page.goto(baseUrl + '/library', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await waitForApp(page);
      if (await notice(page, 'asset-missing').count()) throw new Error('bundle chunk missing offline');
      await context.close();
    });

    await scenario('a new build prompts for reload and activates only after consent', async () => {
      const { context, page } = await installedContext(browser, baseUrl, '/');
      const before = await page.evaluate(() => navigator.serviceWorker.controller.scriptURL);
      server.swOverride = swSource.replace(/const BUILD_ID = '[^']*'/, "const BUILD_ID = 'e2e-next'");
      try {
        await page.evaluate(() => window.ShenmingPwaStatus.instance.checkForUpdate());
        await notice(page, 'update-ready').waitFor({ timeout: 30000 });
        const stillOld = await page.evaluate(() => caches.keys());
        if (!stillOld.some((name) => !name.endsWith('e2e-next'))) throw new Error('old cache dropped before consent');

        await Promise.all([
          page.waitForEvent('load', { timeout: 30000 }),
          notice(page, 'update-ready').getByRole('button', { name: '重新整理' }).click(),
        ]);
        await waitForApp(page);
        await page.waitForFunction(async () => (await caches.keys()).every((name) => name.endsWith('e2e-next')), null, { timeout: 15000 });
        if (!before) throw new Error('no controller before update');
      } finally {
        server.swOverride = null;
      }
      await context.close();
    }, { localOnly: true });

    await scenario('a failed update is reported and the current version keeps working', async () => {
      const { context, page } = await installedContext(browser, baseUrl, '/');
      // Locally the server answers 500; against the deployed site the update
      // request is cut while the page still believes it is online.
      if (remoteUrl) cutNetwork(true);
      else server.swStatus = 500;
      try {
        await page.evaluate(() => window.ShenmingPwaStatus.instance.checkForUpdate());
        await notice(page, 'update-failed').waitFor({ timeout: 15000 });
        await setOffline(context, true);
        await page.reload();
        await waitForApp(page);
      } finally {
        server.swStatus = 200;
      }
      await context.close();
    });

    await scenario('low storage is surfaced', async () => {
      const context = await browser.newContext({ serviceWorkers: 'allow' });
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'storage', {
          configurable: true,
          value: { estimate: () => Promise.resolve({ quota: 60 * 1024 * 1024, usage: 55 * 1024 * 1024 }) },
        });
      });
      const page = await context.newPage();
      await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await notice(page, 'storage-low').waitFor({ timeout: 15000 });
      await context.close();
    });

    await scenario('an evicted bundle cache is explained and can be cleared', async () => {
      const { context, page } = await installedContext(browser, baseUrl, '/');
      await page.evaluate(async () => {
        for (const name of await caches.keys()) {
          const cache = await caches.open(name);
          for (const request of await cache.keys()) {
            if (request.url.includes('/_expo/static/js/')) await cache.delete(request);
          }
        }
      });
      // A real eviction also loses the HTTP cache copy the worker would fall back to.
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.clearBrowserCache');
      await setOffline(context, true);
      await page.reload();
      await notice(page, 'boot-failed').waitFor({ timeout: 15000 });

      await setOffline(context, false);
      await Promise.all([
        page.waitForEvent('load', { timeout: 30000 }),
        notice(page, 'boot-failed').getByRole('button', { name: '清除快取並重新載入' }).click(),
      ]);
      await waitForApp(page);
      await context.close();
    });
  } finally {
    await browser.close();
    httpServer.closeAllConnections();
    httpServer.close();
  }

  const failed = results.filter((result) => !result.ok);
  const skipped = results.filter((result) => result.skipped).length;
  const ran = results.length - skipped;
  console.log(`\n${ran - failed.length}/${ran} PWA scenarios passed${skipped ? `, ${skipped} skipped` : ''}`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
