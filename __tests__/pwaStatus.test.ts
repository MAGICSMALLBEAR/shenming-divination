/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createPwaStatus, MESSAGES } = require('../public/pwa-status.js');

type Listener = (event?: unknown) => void;

function emitter() {
  const listeners: Record<string, Listener[]> = {};
  return {
    addEventListener: (type: string, fn: Listener) => {
      (listeners[type] ||= []).push(fn);
    },
    emit: (type: string, event?: unknown) => (listeners[type] || []).forEach((fn) => fn(event)),
  };
}

function fakeWorker(state = 'installing') {
  return { ...emitter(), state, postMessage: jest.fn() };
}

function setup({
  onLine = true,
  controller = {} as object | null,
  registration = {} as Record<string, unknown>,
  register = undefined as undefined | (() => Promise<unknown>),
  estimate = undefined as undefined | { quota: number; usage: number },
  noServiceWorker = false,
} = {}) {
  const win = emitter() as ReturnType<typeof emitter> & Record<string, unknown>;
  const reload = jest.fn();
  win.location = { reload };
  win.setTimeout = setTimeout;
  win.caches = {
    keys: jest.fn(() => Promise.resolve(['old-cache'])),
    delete: jest.fn(() => Promise.resolve(true)),
  };
  const reg = {
    ...emitter(),
    waiting: null as ReturnType<typeof fakeWorker> | null,
    installing: null as ReturnType<typeof fakeWorker> | null,
    active: {},
    update: jest.fn(() => Promise.resolve()),
    ...registration,
  };
  const serviceWorker = {
    ...emitter(),
    controller,
    register: jest.fn(register ?? (() => Promise.resolve(reg))),
  };
  const nav: Record<string, unknown> = {
    onLine,
    storage: estimate ? { estimate: () => Promise.resolve(estimate) } : undefined,
  };
  if (!noServiceWorker) nav.serviceWorker = serviceWorker;

  const status = createPwaStatus({ window: win, document, navigator: nav });
  return { status, win, reg, serviceWorker, reload };
}

function noticeText(kind: string) {
  return document.querySelector(`[data-pwa-notice="${kind}"]`)?.textContent ?? null;
}

function clickNoticeButton(kind: string, label: string) {
  const buttons = Array.from(document.querySelectorAll(`[data-pwa-notice="${kind}"] button`));
  const button = buttons.find((b) => b.textContent === label) as HTMLButtonElement | undefined;
  if (!button) throw new Error(`no ${label} button on ${kind}`);
  button.click();
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('PWA status notices', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"><div>app</div></div>';
  });

  it('shows and clears the offline notice as connectivity changes', async () => {
    const { status, win } = setup({ onLine: false });
    await status.start();

    expect(noticeText('offline')).toContain(MESSAGES.offline);
    expect(document.getElementById('pwa-status')?.getAttribute('aria-live')).toBe('polite');

    win.emit('online');
    expect(noticeText('offline')).toBeNull();
    win.emit('offline');
    expect(noticeText('offline')).not.toBeNull();
  });

  it('offers a reload when an update has installed and only reloads after the worker takes over', async () => {
    const { status, reg, serviceWorker, reload } = setup();
    await status.start();

    const worker = fakeWorker();
    reg.installing = worker;
    reg.emit('updatefound');
    worker.state = 'installed';
    worker.emit('statechange');

    expect(noticeText('update-ready')).toContain(MESSAGES['update-ready']);
    clickNoticeButton('update-ready', '重新整理');
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(reload).not.toHaveBeenCalled();

    serviceWorker.emit('controllerchange');
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload or prompt on the very first install', async () => {
    const { status, reg, serviceWorker, reload } = setup({ controller: null });
    await status.start();

    const worker = fakeWorker();
    reg.installing = worker;
    reg.emit('updatefound');
    worker.state = 'installed';
    worker.emit('statechange');
    serviceWorker.emit('controllerchange');

    expect(noticeText('update-ready')).toBeNull();
    expect(reload).not.toHaveBeenCalled();
  });

  it('surfaces a waiting worker left over from an earlier visit', async () => {
    const waiting = fakeWorker('installed');
    const { status } = setup({ registration: { waiting } });
    await status.start();

    expect(noticeText('update-ready')).not.toBeNull();
  });

  it('reports a failed update install and lets the visitor retry', async () => {
    const { status, reg } = setup();
    await status.start();

    const worker = fakeWorker();
    reg.installing = worker;
    reg.emit('updatefound');
    worker.state = 'redundant';
    worker.emit('statechange');

    expect(noticeText('update-failed')).toContain(MESSAGES['update-failed']);
    clickNoticeButton('update-failed', '重試');
    expect(reg.update).toHaveBeenCalled();
    expect(noticeText('update-failed')).toBeNull();
  });

  it('treats an update check that fails online as a failure but stays quiet offline', async () => {
    const online = setup({ registration: { update: jest.fn(() => Promise.reject(new Error('500'))) } });
    await online.status.start();
    await online.status.checkForUpdate();
    expect(noticeText('update-failed')).not.toBeNull();

    document.body.innerHTML = '<div id="root"><div>app</div></div>';
    const offline = setup({ onLine: false, registration: { update: jest.fn(() => Promise.reject(new Error('offline'))) } });
    await offline.status.start();
    await offline.status.checkForUpdate();
    expect(noticeText('update-failed')).toBeNull();
  });

  it('explains when offline support cannot be enabled', async () => {
    const unsupported = setup({ noServiceWorker: true });
    await unsupported.status.start();
    expect(noticeText('sw-unavailable')).toContain(MESSAGES['sw-unavailable']);

    document.body.innerHTML = '<div id="root"><div>app</div></div>';
    const rejected = setup({ register: () => Promise.reject(new Error('blocked')) });
    await rejected.status.start();
    expect(noticeText('sw-unavailable')).not.toBeNull();
  });

  it('relays storage-full and missing-asset messages from the service worker', async () => {
    const { status, serviceWorker, reload } = setup();
    await status.start();

    serviceWorker.emit('message', { data: { type: 'storage-full' } });
    expect(noticeText('storage-full')).toContain(MESSAGES['storage-full']);

    serviceWorker.emit('message', { data: { type: 'asset-missing', url: '/_expo/static/js/web/x.js' } });
    expect(noticeText('asset-missing')).toContain(MESSAGES['asset-missing']);
    clickNoticeButton('asset-missing', '重新整理');
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('warns when the storage estimate leaves little room', async () => {
    const { status } = setup({ estimate: { quota: 100 * 1024 * 1024, usage: 80 * 1024 * 1024 } });
    await status.start();
    await flush();
    expect(noticeText('storage-low')).toContain(MESSAGES['storage-low']);

    document.body.innerHTML = '<div id="root"><div>app</div></div>';
    const roomy = setup({ estimate: { quota: 2000 * 1024 * 1024, usage: 10 * 1024 * 1024 } });
    await roomy.status.start();
    await flush();
    expect(noticeText('storage-low')).toBeNull();
  });

  it('offers to clear stale caches when the app bundle failed to load before it ran', async () => {
    const { status, win, reload } = setup();
    win.__pwaBootErrors = ['https://x/assets/fonts/a.js', 'https://x/_expo/static/js/web/entry-1.js'];
    await status.start();

    expect(noticeText('boot-failed')).toContain(MESSAGES['boot-failed']);
    clickNoticeButton('boot-failed', '清除快取並重新載入');
    await flush();
    expect((win.caches as { delete: jest.Mock }).delete).toHaveBeenCalledWith('old-cache');
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('notices a bundle chunk that fails after start, but ignores unrelated scripts', async () => {
    const { status, win } = setup();
    win.__pwaBootErrors = ['https://x/analytics.js'];
    await status.start();
    expect(noticeText('boot-failed')).toBeNull();

    win.emit('error', { target: { tagName: 'SCRIPT', src: 'https://x/other.js' } });
    expect(noticeText('boot-failed')).toBeNull();
    win.emit('error', { target: { tagName: 'SCRIPT', src: 'https://x/_expo/static/js/web/route.js' } });
    expect(noticeText('boot-failed')).not.toBeNull();
  });

  it('lets the visitor dismiss non-offline notices', async () => {
    const { status } = setup();
    await status.start();
    status.show('storage-full');

    (document.querySelector('[data-pwa-notice="storage-full"] [aria-label="關閉提示"]') as HTMLButtonElement).click();
    expect(status.activeNotices()).not.toContain('storage-full');
  });
});
