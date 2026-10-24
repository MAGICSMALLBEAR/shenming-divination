/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const rc = require('../scripts/release-candidate.js');
const { formatAppVersion } = require('../src/services/appVersion');

const baseAppJson = {
  expo: {
    version: '1.0.0',
    ios: { infoPlist: {} },
    android: { permissions: ['RECORD_AUDIO'] },
    plugins: ['expo-router', '@sentry/react-native'],
  },
};

describe('release-candidate flow', () => {
  it('bumps the version and always raises the shared build number', () => {
    const once = rc.applyBump(baseAppJson, 'patch');
    expect(once.expo.version).toBe('1.0.1');
    expect(once.expo.android).toEqual({ permissions: ['RECORD_AUDIO'], versionCode: 1 });
    expect(once.expo.ios).toEqual({ infoPlist: {}, buildNumber: '1' });

    const twice = rc.applyBump(once, '1.0.1');
    expect(twice.expo.version).toBe('1.0.1');
    expect(twice.expo.android.versionCode).toBe(2);
    expect(twice.expo.ios.buildNumber).toBe('2');

    expect(rc.bumpVersion('1.4.2', 'minor')).toBe('1.5.0');
    expect(rc.bumpVersion('1.4.2', 'major')).toBe('2.0.0');
    expect(() => rc.bumpVersion('1.4.2', 'huge')).toThrow();
  });

  it('parses arguments strictly', () => {
    expect(rc.parseArgs([])).toEqual({ bump: null, skipChecks: false });
    expect(rc.parseArgs(['--bump', 'minor', '--skip-checks'])).toEqual({ bump: 'minor', skipChecks: true });
    expect(() => rc.parseArgs(['--bump'])).toThrow('--bump');
    expect(() => rc.parseArgs(['--tag'])).toThrow('--tag');
  });

  it('numbers candidates per version', () => {
    expect(rc.nextRcNumber('1.0.1', [])).toBe(1);
    expect(rc.nextRcNumber('1.0.1', ['v1.0.1-rc.1.md', 'v1.0.1-rc.2.md', 'v1.0.0-rc.9.md', 'README.md'])).toBe(3);
    expect(rc.rcFileName('1.0.1', 3)).toBe('v1.0.1-rc.3.md');
  });

  it('lists changes from the most recent candidate by version, not file order', () => {
    const notes = [
      { file: 'v1.0.10-rc.1.md', content: '- 測試 SHA：`ccc3333`' },
      { file: 'v1.0.9-rc.4.md', content: '- 測試 SHA：`bbb2222`' },
      { file: 'v1.0.10-rc.2.md', content: '- 測試 SHA：`ddd4444`' },
      { file: 'notes.md', content: '- 測試 SHA：`eee5555`' },
    ];
    expect(rc.previousRcSha(notes)).toBe('ddd4444');
    expect(rc.previousRcSha([])).toBeNull();
  });

  it('picks the latest QA record per device and flags release blockers', () => {
    const qa = rc.findQaRecords(['device-A-2026-10-20.md', 'device-A-2026-10-25.md', 'device-W-2026-10-25.md', 'home.png']);
    expect(qa.find((d: { code: string }) => d.code === 'A').record).toBe('device-A-2026-10-25.md');
    expect(qa.find((d: { code: string }) => d.code === 'I').record).toBeNull();

    const blockers = rc.detectBlockers(baseAppJson, qa);
    expect(blockers.join('\n')).toMatch(/android\.package/);
    expect(blockers.join('\n')).toMatch(/ios\.bundleIdentifier/);
    expect(blockers.join('\n')).toMatch(/Sentry/);
    expect(blockers.join('\n')).toMatch(/I、T/);

    const ready = {
      expo: {
        ...baseAppJson.expo,
        ios: { bundleIdentifier: 'tw.example.app' },
        android: { package: 'tw.example.app' },
        plugins: [['@sentry/react-native', { organization: 'org', project: 'app' }]],
      },
    };
    const allQa = rc.findQaRecords(['device-A-1.md', 'device-I-1.md', 'device-T-1.md', 'device-W-1.md']);
    expect(rc.detectBlockers(ready, allQa)).toEqual([]);
  });

  it('renders a note that records SHA, gates, changes, QA links and verdict', () => {
    const qaRecords = rc.findQaRecords(['device-A-2026-10-25.md']);
    const note = rc.renderReleaseNote({
      version: '1.0.1',
      rc: 2,
      buildNumber: 3,
      sha: 'abc1234',
      date: '2026-10-24',
      gates: [
        { name: '型別檢查', command: 'npx tsc --noEmit', status: 'pass', seconds: 12 },
        { name: '單元測試', command: 'npm test', status: 'fail', seconds: 40 },
      ],
      changes: ['abc1234 feat: x'],
      previousSha: 'fff0000',
      qaRecords,
      blockers: ['尚缺真機 QA 回填紀錄：I'],
    });

    expect(note).toContain('# v1.0.1-rc.2 候選發佈紀錄');
    expect(note).toContain('- 測試 SHA：`abc1234`');
    expect(rc.previousRcSha([{ file: 'v1.0.1-rc.2.md', content: note }])).toBe('abc1234');
    expect(note).toContain('不可發佈（自動檢查失敗）');
    expect(note).toContain('| 單元測試 | `npm test` | 失敗 | 40 |');
    expect(note).toContain('自 `fff0000` 起');
    expect(note).toContain('[device-A-2026-10-25.md](../qa/device-A-2026-10-25.md)');
    expect(note).toContain('| I | iPhone | 未回填 |');
    expect(note).toContain('- [ ] 尚缺真機 QA 回填紀錄：I');
    expect(note).toContain('git checkout abc1234');
  });

  it('never marks a run with skipped checks as releasable', () => {
    const note = rc.renderReleaseNote({
      version: '1.0.1', rc: 1, buildNumber: 1, sha: 'abc1234', date: '2026-10-24',
      gates: [{ name: 'Lint', command: 'npm run lint', status: 'skipped' }],
      changes: [], previousSha: null, qaRecords: rc.findQaRecords([]), blockers: [],
    });
    expect(note).toContain('不可發佈（略過自動檢查，僅供預覽）');
    expect(note).toContain('| Lint | `npm run lint` | 略過 | - |');
  });
});

describe('app version label', () => {
  it('shows the build number for the running platform only', () => {
    const config = { version: '1.0.1', ios: { buildNumber: '3' }, android: { versionCode: 3 } };
    expect(formatAppVersion(config, 'ios')).toBe('v1.0.1 (build 3)');
    expect(formatAppVersion(config, 'android')).toBe('v1.0.1 (build 3)');
    expect(formatAppVersion(config, 'web')).toBe('v1.0.1');
    expect(formatAppVersion({ version: '1.0.0' }, 'android')).toBe('v1.0.0');
    expect(formatAppVersion(null, 'web')).toBe('v0.0.0');
  });
});
