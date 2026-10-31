import { gods, getPoemsByGod } from '@/data/gods';
import {
  ORACLE_SOURCE_PENDING,
  getOracleSourceCardByEditionId,
  getOracleSourceCardByGodId,
  getOracleSourceCardForRecord,
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

  it('以 editionId 關聯來源卡，共用詩文的版次不互相覆蓋', () => {
    // 媽祖與廣澤共用六十甲子詩文，但能各自以 editionId 追溯底本
    const mazuCard = getOracleSourceCardByEditionId('mazu-jiazi-60');
    const guangzeCard = getOracleSourceCardByEditionId('guangze-jiazi-60');
    expect(mazuCard?.id).toBe('jiazi-60');
    expect(guangzeCard?.id).toBe('jiazi-60');

    // 觀音通行本與東嶽觀音百首
    const guanyinCommon = getOracleSourceCardByEditionId('guanyin-common-100');
    const dongyueGuanyin = getOracleSourceCardByEditionId('dongyue-guanyin-100');
    expect(guanyinCommon?.id).toBe('guanyin-100');
    expect(dongyueGuanyin?.id).toBe('guanyin-100');

    // 月老台版與港版獨立對應
    expect(getOracleSourceCardByEditionId('yuelao-taiwan-100')?.id).toBe('yuelao-taiwan-100');
    expect(getOracleSourceCardByEditionId('yuelao-hongkong-101')?.id).toBe('yuelao-hongkong-101');

    // 候選特殊籤本（如紫竹寺 28 首、祀典大天后宮月老 27 首）依其獨立 editionId 取得，不與通行本混淆
    const zizhuCard = getOracleSourceCardByEditionId('zizhu-guanyin-28');
    expect(zizhuCard?.id).toBe('zizhu-guanyin-28');
    expect(zizhuCard?.title).toContain('紫竹寺');
    expect(zizhuCard?.id).not.toBe('guanyin-100');

    const tainanCard = getOracleSourceCardByEditionId('tainan-tianhou-yuelao-27');
    expect(tainanCard?.id).toBe('tainan-tianhou-yuelao-27');
    expect(tainanCard?.title).toContain('祀典大天后宮');
    expect(tainanCard?.id).not.toBe('yuelao-taiwan-100');
  });

  it('getOracleSourceCardForRecord 優先依據 record.editionId 查找來源卡', () => {
    const recordWithEdition = {
      editionId: 'yuelao-hongkong-101',
      godId: 13,
      poem: { number: 1, content: '關關雎鳩，在河之洲。' },
    };
    const card = getOracleSourceCardForRecord(recordWithEdition);
    expect(card?.id).toBe('yuelao-hongkong-101');

    const recordWithoutEdition = {
      godId: 1, // 關聖帝君
      poem: { number: 1, content: '巍巍獨步向雲間' },
    };
    const fallbackCard = getOracleSourceCardForRecord(recordWithoutEdition);
    expect(fallbackCard?.id).toBe('leiyushi-100');
  });
});
