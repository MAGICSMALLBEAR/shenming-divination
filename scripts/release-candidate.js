// Release-candidate flow for native builds.
//
//   npm run release:rc -- --bump patch   # 1) bump version + build numbers, then commit
//   npm run release:rc                   # 2) on a clean commit: run gates, write the RC note
//
// The RC note (docs/releases/v<version>-rc.<n>.md) records the tested SHA, gate
// results, changes since the previous RC, device QA records and open blockers.
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RELEASES_DIR = path.join(ROOT, 'docs', 'releases');
const QA_DIR = path.join(ROOT, 'docs', 'qa');
const DEVICES = [
  { code: 'A', label: '低階 Android' },
  { code: 'I', label: 'iPhone' },
  { code: 'T', label: '平板' },
  { code: 'W', label: '部署版 Web/PWA' },
];
const GATES = [
  { name: '型別檢查', command: 'npx tsc --noEmit' },
  { name: 'Lint', command: 'npm run lint' },
  { name: '單元測試', command: 'npm test -- --ci --runInBand' },
  { name: 'Web 匯出', command: 'npm run export:web' },
];

function parseArgs(argv) {
  const args = { bump: null, skipChecks: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--bump') args.bump = argv[++i];
    else if (argv[i] === '--skip-checks') args.skipChecks = true;
    else throw new Error(`未知參數：${argv[i]}`);
  }
  if (args.bump === undefined) throw new Error('--bump 需要 patch、minor、major 或 x.y.z');
  return args;
}

function bumpVersion(version, bump) {
  if (/^\d+\.\d+\.\d+$/.test(bump)) return bump;
  const [major, minor, patch] = version.split('.').map(Number);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  if (bump === 'patch') return `${major}.${minor}.${patch + 1}`;
  throw new Error(`無法辨識的版本調整：${bump}`);
}

// Store builds need a strictly increasing build number even when the
// user-facing version stays the same, so every bump raises both.
function applyBump(appJson, bump) {
  const expo = appJson.expo;
  const version = bumpVersion(expo.version, bump);
  const buildNumber = Math.max(Number(expo.android?.versionCode ?? 0), Number(expo.ios?.buildNumber ?? 0)) + 1;
  return {
    ...appJson,
    expo: {
      ...expo,
      version,
      ios: { ...expo.ios, buildNumber: String(buildNumber) },
      android: { ...expo.android, versionCode: buildNumber },
    },
  };
}

function rcFileName(version, rc) {
  return `v${version}-rc.${rc}.md`;
}

function nextRcNumber(version, existingFiles) {
  const prefix = `v${version}-rc.`;
  const numbers = existingFiles
    .filter((file) => file.startsWith(prefix) && file.endsWith('.md'))
    .map((file) => Number(file.slice(prefix.length, -3)))
    .filter(Number.isInteger);
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

function rcOrderKey(file) {
  const match = file.match(/^v(\d+)\.(\d+)\.(\d+)-rc\.(\d+)\.md$/);
  return match ? match.slice(1).map(Number) : null;
}

function compareRcFiles(a, b) {
  const keyA = rcOrderKey(a);
  const keyB = rcOrderKey(b);
  for (let i = 0; i < 4; i += 1) {
    if (keyA[i] !== keyB[i]) return keyA[i] - keyB[i];
  }
  return 0;
}

// The previous RC note records the SHA it tested; changes are listed from there.
// Ordered by version rather than file time, which a fresh checkout resets.
function previousRcSha(releaseNotes) {
  const latest = releaseNotes
    .filter((note) => rcOrderKey(note.file))
    .map((note) => ({ file: note.file, sha: note.content.match(/^- 測試 SHA：`([0-9a-f]{7,40})`/m)?.[1] }))
    .filter((entry) => entry.sha)
    .sort((a, b) => compareRcFiles(b.file, a.file))[0];
  return latest ? latest.sha : null;
}

function findQaRecords(qaFiles) {
  return DEVICES.map((device) => {
    const records = qaFiles.filter((file) => file.startsWith(`device-${device.code}-`) && file.endsWith('.md')).sort();
    return { ...device, record: records.length ? records[records.length - 1] : null };
  });
}

function detectBlockers(appJson, qaRecords) {
  const expo = appJson.expo;
  const blockers = [];
  if (!expo.android?.package) blockers.push('app.json 尚未設定 `android.package`（Android application id，上架後不可更改）');
  if (!expo.ios?.bundleIdentifier) blockers.push('app.json 尚未設定 `ios.bundleIdentifier`（iOS bundle id，上架後不可更改）');
  const sentry = (expo.plugins || []).find((plugin) => plugin === '@sentry/react-native' || (Array.isArray(plugin) && plugin[0] === '@sentry/react-native'));
  const sentryOptions = Array.isArray(sentry) ? sentry[1] || {} : {};
  if (!sentryOptions.organization || !sentryOptions.project) blockers.push('Sentry plugin 尚未設定 `organization` 與 `project`，候選版收不到錯誤事件');
  const missing = qaRecords.filter((device) => !device.record).map((device) => device.code);
  if (missing.length) blockers.push(`尚缺真機 QA 回填紀錄：${missing.join('、')}（見 docs/device-qa-protocol.md）`);
  return blockers;
}

function renderReleaseNote({ version, rc, buildNumber, sha, date, gates, changes, previousSha, qaRecords, blockers }) {
  const gatesFailed = gates.some((gate) => gate.status === 'fail');
  const gatesSkipped = gates.some((gate) => gate.status === 'skipped');
  const verdict = gatesFailed ? '不可發佈（自動檢查失敗）' : gatesSkipped ? '不可發佈（略過自動檢查，僅供預覽）' : blockers.length ? '待處理阻擋項目' : '可交付真機驗收';
  const lines = [
    `# v${version}-rc.${rc} 候選發佈紀錄`,
    '',
    `- 版本：${version}（build ${buildNumber}）`,
    `- 測試 SHA：\`${sha}\``,
    `- 產生日期：${date}`,
    `- 判定：${verdict}`,
    '',
    '## 自動檢查',
    '',
    '| 項目 | 指令 | 結果 | 秒數 |',
    '| --- | --- | --- | --- |',
    ...gates.map((gate) => `| ${gate.name} | \`${gate.command}\` | ${{ pass: '通過', fail: '失敗', skipped: '略過' }[gate.status]} | ${gate.seconds ?? '-'} |`),
    '',
    `## 變更摘要${previousSha ? `（自 \`${previousSha}\` 起）` : '（首個候選版，列最近 20 筆）'}`,
    '',
    ...(changes.length ? changes.map((change) => `- ${change}`) : ['- （無程式變更）']),
    '',
    '## 真機 QA 紀錄',
    '',
    '| 代號 | 裝置 | 紀錄 |',
    '| --- | --- | --- |',
    ...qaRecords.map((device) => `| ${device.code} | ${device.label} | ${device.record ? `[${device.record}](../qa/${device.record})` : '未回填'} |`),
    '',
    '## 阻擋項目',
    '',
    ...(blockers.length ? blockers.map((blocker) => `- [ ] ${blocker}`) : ['- 無']),
    '',
    '## 建置',
    '',
    '以本紀錄的測試 SHA 建置，安裝後在 App「設定 → 關於」底部確認版本與 build 號與上方一致：',
    '',
    '```powershell',
    `git checkout ${sha}`,
    'npx.cmd expo run:android --variant release --device',
    'npx.cmd expo run:ios --configuration Release --device   # macOS',
    '```',
    '',
  ];
  return lines.join('\n');
}

function git(command) {
  return execSync(`git ${command}`, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function runGate(gate) {
  const started = Date.now();
  console.log(`▶ ${gate.name}：${gate.command}`);
  const result = spawnSync(gate.command, { cwd: ROOT, shell: true, stdio: 'inherit' });
  return { ...gate, status: result.status === 0 ? 'pass' : 'fail', seconds: Math.round((Date.now() - started) / 1000) };
}

function readReleaseNotes() {
  if (!fs.existsSync(RELEASES_DIR)) return [];
  return fs.readdirSync(RELEASES_DIR).filter((file) => file.endsWith('.md')).map((file) => {
    const full = path.join(RELEASES_DIR, file);
    return { file, content: fs.readFileSync(full, 'utf8') };
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const appJsonPath = path.join(ROOT, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

  if (args.bump) {
    const next = applyBump(appJson, args.bump);
    fs.writeFileSync(appJsonPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    const pkgPath = path.join(ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.version = next.expo.version;
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
    console.log(`版本已調整為 ${next.expo.version}（build ${next.expo.android.versionCode}）。`);
    console.log('請先 commit app.json 與 package.json，再執行 npm run release:rc 產生候選紀錄。');
    return;
  }

  if (git('status --porcelain --untracked-files=no')) {
    throw new Error('工作區有未 commit 的變更；候選版必須對應一個確定的 commit。');
  }

  const sha = git('rev-parse --short HEAD');
  const gates = args.skipChecks ? GATES.map((gate) => ({ ...gate, status: 'skipped' })) : GATES.map(runGate);
  const notes = readReleaseNotes();
  const previousSha = previousRcSha(notes);
  const range = previousSha ? `${previousSha}..HEAD` : '-20 HEAD';
  const changes = git(`log --no-merges --format=%h%x20%s ${range}`).split('\n').filter(Boolean)
    .filter((line) => !/ docs\(release\):/.test(line));
  const qaRecords = findQaRecords(fs.existsSync(QA_DIR) ? fs.readdirSync(QA_DIR) : []);
  const blockers = detectBlockers(appJson, qaRecords);
  const version = appJson.expo.version;
  const rc = nextRcNumber(version, notes.map((note) => note.file));
  const note = renderReleaseNote({
    version,
    rc,
    buildNumber: appJson.expo.android?.versionCode ?? appJson.expo.ios?.buildNumber ?? '未設定',
    sha,
    date: new Date().toISOString().slice(0, 10),
    gates,
    changes,
    previousSha,
    qaRecords,
    blockers,
  });

  fs.mkdirSync(RELEASES_DIR, { recursive: true });
  const notePath = path.join(RELEASES_DIR, rcFileName(version, rc));
  fs.writeFileSync(notePath, note, 'utf8');
  console.log(`\n候選紀錄：${path.relative(ROOT, notePath)}`);
  if (gates.some((gate) => gate.status === 'fail')) process.exitCode = 1;
}

module.exports = {
  applyBump,
  bumpVersion,
  detectBlockers,
  findQaRecords,
  nextRcNumber,
  parseArgs,
  previousRcSha,
  rcFileName,
  renderReleaseNote,
};

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`✗ ${error.message}`);
    process.exitCode = 1;
  }
}
