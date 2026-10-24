// Post-export script: inject PWA manifest & status script into every exported
// page and stamp the service worker with this export's build id and bundle list.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PWA_MARKER = '<!-- pwa-patched -->';

const pwaMeta = `${PWA_MARKER}
<meta name="theme-color" content="#1C0E06" />
<meta name="description" content="台灣廟宇風格線上求籤，25 位神明、多套常見籤詩系統、傳統擲筊流程、回訪追蹤與 AI 解籤指引。" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="神明占卜" />
<link rel="apple-touch-icon" href="/assets/images/icon.png" />
<link rel="manifest" href="/manifest.json" />
<link rel="icon" type="image/png" sizes="64x64" href="/assets/images/favicon.png" />
`;

// Registers the service worker and shows offline / update / storage notices.
const statusScript = '<script src="/pwa-status.js" defer></script>\n';

// Runs before the app bundle so a bundle that fails to load (e.g. evicted from
// the offline cache) is recorded even though pwa-status.js executes later.
const bootProbe = '<script>window.__pwaBootErrors=[];addEventListener("error",function(e){var t=e.target;'
  + 'if(t&&t.tagName==="SCRIPT"&&t.src)window.__pwaBootErrors.push(t.src)},true)</script>';

function listFiles(dir, predicate) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full, predicate);
    return predicate(full) ? [full] : [];
  });
}

function toUrlPath(distDir, file) {
  return '/' + path.relative(distDir, file).split(path.sep).join('/');
}

function patchHtml(html) {
  if (html.includes(PWA_MARKER)) return html;
  return html
    .replace('<html  lang="en">', '<html lang="zh-TW">')
    .replace('<head>', `<head>${bootProbe}`)
    .replace('<title data-rh="true"></title>', '<title data-rh="true">神明占卜</title>')
    .replace('</head>', `${pwaMeta}</head>`)
    .replace('</body>', `${statusScript}</body>`)
    .replace(
      '<style id="expo-reset">#root,body,html{height:100%}body{overflow:hidden}#root{display:flex}</style>',
      '<style id="expo-reset">html,body{height:100%;margin:0;background-color:#1C0E06;color:#E8D5B0}body{overflow:hidden}#root{display:flex;min-height:100vh}</style>'
    );
}

function patchServiceWorker(distDir) {
  const swPath = path.join(distDir, 'sw.js');
  const bundleDir = path.join(distDir, '_expo');
  const bundleAssets = fs.existsSync(bundleDir)
    ? listFiles(bundleDir, (file) => /\.(js|css)$/.test(file)).map((file) => toUrlPath(distDir, file)).sort()
    : [];
  const template = fs.readFileSync(swPath, 'utf-8');
  const buildId = crypto.createHash('sha256').update(template).update(bundleAssets.join('\n')).digest('hex').slice(0, 12);

  const sw = template
    .replace("'__BUILD_ID__'", `'${buildId}'`)
    .replace('/* __BUNDLE_ASSETS__ */', bundleAssets.map((asset) => JSON.stringify(asset)).join(', '));
  fs.writeFileSync(swPath, sw, 'utf-8');
  return { buildId, bundleAssets };
}

// manifest.json, apple-touch-icon and the service worker point at these paths,
// but expo export only emits favicon.ico, so copy the source icons across.
const PWA_ICONS = ['icon.png', 'favicon.png', 'splash-icon.png'];

function copyPwaIcons(distDir, sourceDir = path.join(__dirname, '..', 'assets', 'images')) {
  const targetDir = path.join(distDir, 'assets', 'images');
  fs.mkdirSync(targetDir, { recursive: true });
  for (const icon of PWA_ICONS) {
    fs.copyFileSync(path.join(sourceDir, icon), path.join(targetDir, icon));
  }
}

function patchDist(distDir) {
  copyPwaIcons(distDir);
  const pages = listFiles(distDir, (file) => file.endsWith('.html') && !file.endsWith('offline.html'));
  for (const page of pages) {
    fs.writeFileSync(page, patchHtml(fs.readFileSync(page, 'utf-8')), 'utf-8');
  }
  return { pages: pages.length, ...patchServiceWorker(distDir) };
}

module.exports = { PWA_ICONS, copyPwaIcons, patchDist, patchHtml, patchServiceWorker };

if (require.main === module) {
  const result = patchDist(path.join(__dirname, '..', 'dist'));
  console.log(`✅ PWA tags injected into ${result.pages} pages; service worker build ${result.buildId} precaches ${result.bundleAssets.length} bundle files`);
}
