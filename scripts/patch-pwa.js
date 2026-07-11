// Post-export script: inject PWA manifest & service worker into dist/index.html
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

// Fix lang
html = html.replace('<html  lang="en">', '<html lang="zh-TW">');

// Add meta tags before </head>
const pwaMeta = `
<meta name="theme-color" content="#1C0E06" />
<meta name="description" content="台灣廟宇風格線上求籤，25 位神明、多套常見籤詩系統、傳統擲筊流程、回訪追蹤與 AI 解籤指引。" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="神明占卜" />
<link rel="apple-touch-icon" href="/assets/images/icon.png" />
<link rel="manifest" href="/manifest.json" />
<link rel="icon" type="image/png" sizes="64x64" href="/assets/images/favicon.png" />
<title>神明占卜</title>
`;
html = html.replace('</head>', `${pwaMeta}</head>`);

// Add SW registration before </body>
const swScript = `
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').then(
        function (r) { console.log('SW registered:', r.scope); },
        function (e) { console.log('SW failed:', e); }
      );
    });
  }
</script>
`;
html = html.replace('</body>', `${swScript}</body>`);

// Fix dark background
html = html.replace(
  '<style id="expo-reset">#root,body,html{height:100%}body{overflow:hidden}#root{display:flex}</style>',
  '<style id="expo-reset">html,body{height:100%;margin:0;background-color:#1C0E06;color:#E8D5B0}body{overflow:hidden}#root{display:flex;min-height:100vh}</style>'
);

fs.writeFileSync(indexPath, html, 'utf-8');
console.log('✅ PWA tags injected into dist/index.html');

