// PWA status notices for 神明占卜 web export.
// Plain DOM (not React) on purpose: it must still speak when the app bundle
// itself failed to load from an offline or evicted cache.
(function (root) {
  'use strict';

  var MB = 1024 * 1024;

  var MESSAGES = {
    offline: '目前離線：已開過的頁面仍可使用，AI 解籤與雲端同步需要連線。',
    'update-ready': '新版本已準備好，重新整理即可使用。',
    'update-failed': '離線版本更新失敗，將繼續使用目前版本。',
    'sw-unavailable': '此瀏覽器無法啟用離線功能，請在連線時使用。',
    'asset-missing': '部分頁面資源沒有存到此裝置（離線快取可能已被清除），請連線後重新整理。',
    'boot-failed': '頁面沒有順利載入，可能是離線快取已失效。',
    'storage-full': '裝置儲存空間不足，新的頁面無法存成離線版本，請清出空間。',
    'storage-low': '裝置儲存空間偏低，離線功能可能無法更新。',
  };

  function createPwaStatus(options) {
    var win = options.window;
    var doc = options.document;
    var nav = options.navigator;
    var lowStorageBytes = options.lowStorageBytes || 50 * MB;
    var notices = {};
    var container = null;
    var registration = null;
    var reloading = false;

    function ensureContainer() {
      if (container) return container;
      container = doc.createElement('div');
      container.id = 'pwa-status';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      container.style.cssText = [
        'position:fixed', 'left:12px', 'right:12px', 'bottom:calc(12px + env(safe-area-inset-bottom, 0px))',
        'z-index:2147483647', 'display:flex', 'flex-direction:column', 'gap:8px', 'align-items:center',
        'pointer-events:none', 'font-family:-apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif',
      ].join(';');
      doc.body.appendChild(container);
      return container;
    }

    function show(kind, action) {
      hide(kind);
      var box = doc.createElement('div');
      box.setAttribute('data-pwa-notice', kind);
      box.style.cssText = [
        'pointer-events:auto', 'max-width:520px', 'width:100%', 'box-sizing:border-box', 'display:flex',
        'align-items:center', 'gap:10px', 'padding:10px 14px', 'border-radius:14px', 'border:1px solid #B8860B',
        'background:#2A1409', 'color:#F5E6C8', 'font-size:14px', 'line-height:1.5', 'box-shadow:0 6px 20px rgba(0,0,0,.45)',
      ].join(';');

      var text = doc.createElement('span');
      text.style.flex = '1';
      text.textContent = MESSAGES[kind];
      box.appendChild(text);

      if (action) {
        var button = doc.createElement('button');
        button.type = 'button';
        button.textContent = action.label;
        button.style.cssText = 'flex:none;padding:6px 14px;border-radius:999px;border:1px solid #FFD700;background:#3B160B;color:#FFD700;font-size:14px;font-weight:700;cursor:pointer';
        button.addEventListener('click', action.onPress);
        box.appendChild(button);
      }

      if (kind !== 'offline') {
        var close = doc.createElement('button');
        close.type = 'button';
        close.textContent = '×';
        close.setAttribute('aria-label', '關閉提示');
        close.style.cssText = 'flex:none;border:0;background:transparent;color:#C9A96E;font-size:20px;cursor:pointer';
        close.addEventListener('click', function () { hide(kind); });
        box.appendChild(close);
      }

      ensureContainer().appendChild(box);
      notices[kind] = box;
    }

    function hide(kind) {
      var box = notices[kind];
      if (box && box.parentNode) box.parentNode.removeChild(box);
      delete notices[kind];
    }

    function reload() {
      if (reloading) return;
      reloading = true;
      win.location.reload();
    }

    function reloadAction() {
      return { label: '重新整理', onPress: reload };
    }

    function clearCachesAndReload() {
      var cachesApi = win.caches;
      var done = cachesApi
        ? cachesApi.keys().then(function (names) {
          return Promise.all(names.map(function (name) { return cachesApi.delete(name); }));
        })
        : Promise.resolve();
      return done.catch(function () {}).then(reload);
    }

    function showUpdateReady(worker) {
      show('update-ready', {
        label: '重新整理',
        onPress: function () { worker.postMessage({ type: 'SKIP_WAITING' }); },
      });
    }

    function showUpdateFailed() {
      show('update-failed', {
        label: '重試',
        onPress: function () {
          hide('update-failed');
          checkForUpdate();
        },
      });
    }

    function checkForUpdate() {
      if (!registration) return Promise.resolve();
      return registration.update().catch(function () {
        // Being offline is not a failed update; it simply cannot check yet.
        if (nav.onLine !== false) showUpdateFailed();
      });
    }

    function watchWorker(worker) {
      if (!worker) return;
      worker.addEventListener('statechange', function () {
        if (worker.state === 'installed' && nav.serviceWorker.controller) showUpdateReady(worker);
        if (worker.state === 'redundant' && worker !== registration.active) showUpdateFailed();
      });
    }

    function handleRegistration(reg) {
      registration = reg;
      if (reg.waiting && nav.serviceWorker.controller) showUpdateReady(reg.waiting);
      watchWorker(reg.installing);
      reg.addEventListener('updatefound', function () { watchWorker(reg.installing); });
    }

    function handleWorkerMessage(event) {
      var data = event.data || {};
      if (data.type === 'storage-full') show('storage-full');
      if (data.type === 'asset-missing') show('asset-missing', nav.onLine === false ? null : reloadAction());
    }

    function checkStorage() {
      var storage = nav.storage;
      if (!storage || typeof storage.estimate !== 'function') return Promise.resolve();
      return storage.estimate().then(function (estimate) {
        if (!estimate || !estimate.quota) return;
        if (estimate.quota - (estimate.usage || 0) < lowStorageBytes) show('storage-low');
      }).catch(function () {});
    }

    function isBundleScript(target) {
      return Boolean(target) && target.tagName === 'SCRIPT' && target.src.indexOf('/_expo/') !== -1;
    }

    // The pre-rendered HTML looks fine even when the bundle never ran, so judge
    // boot by bundle script load errors. The inline probe patch-pwa.js puts in
    // <head> records the ones that happened before this deferred script ran.
    function watchBoot() {
      var showBootFailed = function () {
        show('boot-failed', { label: '清除快取並重新載入', onPress: clearCachesAndReload });
      };
      var earlyErrors = win.__pwaBootErrors || [];
      if (earlyErrors.some(function (src) { return src.indexOf('/_expo/') !== -1; })) showBootFailed();
      win.addEventListener('error', function (event) {
        if (isBundleScript(event && event.target)) showBootFailed();
      }, true);
    }

    function start() {
      if (nav.onLine === false) show('offline');
      win.addEventListener('offline', function () { show('offline'); });
      win.addEventListener('online', function () {
        hide('offline');
        checkForUpdate();
      });
      watchBoot();
      checkStorage();

      if (!nav.serviceWorker) {
        show('sw-unavailable');
        return Promise.resolve();
      }
      nav.serviceWorker.addEventListener('message', handleWorkerMessage);
      nav.serviceWorker.addEventListener('controllerchange', function () {
        // Only an update the visitor accepted triggers a reload; the very first
        // install claims the page without needing one.
        if (notices['update-ready']) reload();
      });
      doc.addEventListener('visibilitychange', function () {
        if (doc.visibilityState === 'visible') checkForUpdate();
      });

      return nav.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(handleRegistration, function () {
        show('sw-unavailable');
      });
    }

    return {
      start: start,
      show: show,
      hide: hide,
      checkForUpdate: checkForUpdate,
      activeNotices: function () { return Object.keys(notices); },
    };
  }

  var api = { createPwaStatus: createPwaStatus, MESSAGES: MESSAGES };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    var status = createPwaStatus({ window: root, document: root.document, navigator: root.navigator });
    api.instance = status;
    root.ShenmingPwaStatus = api;
    if (root.document.readyState === 'complete') status.start();
    else root.addEventListener('load', function () { status.start(); });
  }
})(typeof window !== 'undefined' ? window : this);
