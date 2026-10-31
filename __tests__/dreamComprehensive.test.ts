/**
 * 單元測試：夢境專區深度功能與持久化體系
 * 涵蓋雙重視角解夢分析、日記增刪改查、AI 追問問答歷史持久化、早晨提醒與 PIN 碼隱私保護
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  analyzeDream,
  type DreamResult,
} from '../src/services/dreamAnalysis';
import {
  getDreamJournal,
  saveDreamEntry,
  getDreamEntry,
  updateDreamEntry,
  deleteDreamEntry,
  addDreamFollowup,
  DREAM_JOURNAL_KEY,
} from '../src/services/dreamJournal';
import {
  getDreamReminderPreferences,
  setDreamReminderEnabled,
  setDreamReminderTime,
  formatDreamReminderTime,
} from '../src/services/dreamReminder';
import {
  getDreamPrivacySettings,
  setDreamPin,
  unlockDreamJournal,
  clearDreamPin,
  isDreamJournalLocked,
} from '../src/services/dreamPrivacy';
import { removeItem } from '../src/services/storage';

beforeEach(async () => {
  await removeItem(DREAM_JOURNAL_KEY);
  await removeItem('@divination_dream_reminder');
  await removeItem('@divination_dream_privacy');
  await AsyncStorage.clear();
});

describe('解夢雙重視角與分析引擎 (dreamAnalysis)', () => {
  test('空字串應回傳預設提示', () => {
    const result = analyzeDream('');
    expect(result.symbols).toHaveLength(0);
    expect(result.fortune).toBe('中');
    expect(result.advice).toBeTruthy();
  });

  test('能正確提取多個關鍵符號並產出雙重視角', () => {
    // 包含「蛇」與「水」的夢境
    const result = analyzeDream('昨晚夢見在一條清澈的河流邊看到一條大蛇盤旋。', '安心');

    expect(result.symbols).toContain('蛇');
    expect(result.symbols).toContain('河');
    expect(result.interpretation).toContain('蛇');

    // 傳統周公解夢視角與現代心理學覺察視角驗證
    expect(result.traditionalView).toBeDefined();
    expect(result.traditionalView).toContain('周公解夢');
    expect(result.traditionalView).toContain('蛇');

    expect(result.psychologicalView).toBeDefined();
    expect(result.psychologicalView).toContain('心理學');
    expect(result.psychologicalView).toContain('蛇');

    expect(['吉', '中', '凶']).toContain(result.fortune);
    expect(result.advice).toBeTruthy();
  });

  test('無特定關鍵詞時應啟動通用情境與雙重視角分析', () => {
    const result = analyzeDream('一個很奇怪的夢境，周圍一切都在慢慢變換。', '困惑');
    expect(result.symbols).toHaveLength(0);
    expect(result.traditionalView).toContain('周公解夢');
    expect(result.psychologicalView).toContain('心理學');
  });
});

describe('夢境日記與追問問答持久化 (dreamJournal)', () => {
  beforeEach(async () => {
    await removeItem(DREAM_JOURNAL_KEY);
    await AsyncStorage.clear();
  });

  test('儲存、讀取與更新夢境日記', async () => {
    const mockResult: DreamResult = {
      symbols: ['飛翔', '天空'],
      interpretation: '象徵自由與抱負',
      fortune: '吉',
      advice: '勇敢前行',
      traditionalView: '周公解夢：飛翔主青雲直上',
      psychologicalView: '心理學：反映擺脫束縛的渴望',
    };

    const entry = await saveDreamEntry({
      dream: '夢見自己張開雙臂在藍天飛翔',
      feeling: '無比自由',
      tags: ['好夢', '清醒夢'],
      result: mockResult,
    });

    expect(entry.id).toBeTruthy();
    expect(entry.createdAt).toBeGreaterThan(0);

    const list = await getDreamJournal();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(entry.id);
    expect(list[0].dream).toBe('夢見自己張開雙臂在藍天飛翔');
    expect(list[0].tags).toEqual(['好夢', '清醒夢']);
    expect(list[0].followups).toEqual([]);

    // 更新 reflection 心得
    await updateDreamEntry(entry.id, { reflection: '這與最近換新工作有關' });
    const updated = await getDreamEntry(entry.id);
    expect(updated?.reflection).toBe('這與最近換新工作有關');
  });

  test('addDreamFollowup 應能連續保存多輪 AI 追問問答歷史', async () => {
    const entry = await saveDreamEntry({
      dream: '夢見考試遲到走錯教室',
      tags: ['惡夢'],
      result: {
        symbols: ['考試', '遲到'],
        interpretation: '反映壓力焦慮',
        fortune: '中',
        advice: '放鬆緊繃神經',
      },
    });

    // 第一輪追問
    const qa1 = await addDreamFollowup(
      entry.id,
      '為什麼我畢業多年還會夢到考試遲到？',
      '心理學上考試夢常是責任感與近期評估壓力的投射。'
    );
    expect(qa1.question).toContain('畢業多年');
    expect(qa1.reply).toContain('心理學上');

    // 第二輪追問
    const qa2 = await addDreamFollowup(
      entry.id,
      '我該如何緩解這種焦慮？',
      '試著列出近期最擔心的一件事，為它設定安全界線。'
    );

    // 重新載入日記驗證歷史持久化
    const reloaded = await getDreamEntry(entry.id);
    expect(reloaded?.followups).toHaveLength(2);
    expect(reloaded?.followups?.[0].question).toContain('畢業多年');
    expect(reloaded?.followups?.[1].question).toContain('緩解這種焦慮');
    expect(reloaded?.followups?.[1].reply).toContain('設定安全界線');
  });

  test('刪除夢境日記條目', async () => {
    await removeItem(DREAM_JOURNAL_KEY);
    const entry = await saveDreamEntry({
      dream: '待刪除的夢境',
      tags: ['奇異夢'],
      result: { symbols: [], interpretation: '', fortune: '中', advice: '' },
    });

    expect(await getDreamJournal()).toHaveLength(1);
    await deleteDreamEntry(entry.id);
    expect(await getDreamJournal()).toHaveLength(0);
  });
});

describe('夢境早晨提醒配置 (dreamReminder)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('formatDreamReminderTime 補零格式化', () => {
    expect(formatDreamReminderTime(7, 5)).toBe('07:05');
    expect(formatDreamReminderTime(23, 45)).toBe('23:45');
  });

  test('設定與取得提醒時間配置', async () => {
    const defaultPrefs = await getDreamReminderPreferences();
    expect(defaultPrefs.hour).toBe(7);
    expect(defaultPrefs.minute).toBe(30);

    await setDreamReminderTime(8, 15);
    const updated = await getDreamReminderPreferences();
    expect(updated.hour).toBe(8);
    expect(updated.minute).toBe(15);
  });
});

describe('夢境日記 PIN 碼隱私保護 (dreamPrivacy)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('PIN 設定、驗證解鎖與清除', async () => {
    // 預設無鎖定
    expect(await isDreamJournalLocked()).toBe(false);

    // 設定 PIN
    await setDreamPin('1234');
    const settings = await getDreamPrivacySettings();
    expect(settings.pin).toBe('1234');

    // 錯誤密碼
    const wrong = await unlockDreamJournal('9999');
    expect(wrong).toBe(false);

    // 正確密碼
    const right = await unlockDreamJournal('1234');
    expect(right).toBe(true);

    // 清除 PIN
    await clearDreamPin();
    const cleared = await getDreamPrivacySettings();
    expect(cleared.pin).toBeUndefined();
    expect(await isDreamJournalLocked()).toBe(false);
  });
});
