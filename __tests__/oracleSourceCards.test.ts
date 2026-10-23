import { gods, getPoemsByGod } from '@/data/gods';
import {
  ORACLE_SOURCE_PENDING,
  getOracleSourceCardByGodId,
  getOracleSourceCardUsage,
  oracleSourceCards,
} from '@/data/oracleSourceCards';
import type { YuelaoEdition } from '@/data/yuelaoEdition';

const EDITIONS: YuelaoEdition[] = ['taiwan', 'hongkong'];

describe('籤本來源卡', () => {
  it('每位神明（含月老兩版）實際抽到的籤都對應到一張來源卡，首數一致', () => {
    for (const god of gods) {
      for (const edition of EDITIONS) {
        const sourceCard = getOracleSourceCardByGodId(god.id, edition);
        expect([god.name, sourceCard?.id]).toEqual([god.name, expect.any(String)]);
        expect(sourceCard?.totalPoems).toBe(getPoemsByGod(god.id, edition).length);
      }
    }
  });

  it('月老兩版對應到不同來源卡', () => {
    const yuelao = gods.find((god) => god.poemSystem === '月老靈籤');
    expect(getOracleSourceCardByGodId(yuelao!.id, 'taiwan')?.id).toBe('yuelao-taiwan-100');
    expect(getOracleSourceCardByGodId(yuelao!.id, 'hongkong')?.id).toBe('yuelao-hongkong-101');
  });

  it('每張卡都有神明使用，且 id 不重複', () => {
    const ids = oracleSourceCards.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    const usage = getOracleSourceCardUsage();
    for (const item of oracleSourceCards) {
      expect([item.id, (usage.get(item.id) ?? []).length > 0]).toEqual([item.id, true]);
    }
    const totalUsers = [...usage.values()].reduce((sum, list) => sum + list.length, 0);
    expect(totalUsers).toBe(gods.length + 1); // 月老兩版各算一次
  });

  it('欄位格式：上架日期與 commit 可追溯，來源有網址或篇名，沒有紀錄的欄位標「待補」', () => {
    for (const item of oracleSourceCards) {
      expect(item.listedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.listedCommit).toMatch(/^[0-9a-f]{7}$/);
      expect(item.reviewer).toBe(ORACLE_SOURCE_PENDING);
      expect(item.withdrawal).toBe(ORACLE_SOURCE_PENDING);
      for (const field of [item.title, item.origin, item.edition, item.originalImages, item.rights]) {
        expect(field.trim()).not.toBe('');
      }
      if (item.sources.length === 0) expect(item.sourceGapNote).toBeTruthy();
      for (const source of item.sources) {
        expect(source.label.trim()).not.toBe('');
        if (source.url) expect(source.url).toMatch(/^https?:\/\//);
      }
    }
  });
});
