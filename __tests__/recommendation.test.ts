import { recommendGods } from '@/services/recommendation';

describe('recommendGods', () => {
  it('prioritizes deities suited to blessing, protection, and settlement questions', () => {
    expect(recommendGods({ questionCategory: 'blessing' }).some((item) => ['玉皇上帝', '三官大帝', '地藏王菩薩'].includes(item.god.name))).toBe(true);
    expect(recommendGods({ questionCategory: 'protection' }).some((item) => ['王爺', '清水祖師', '溫府千歲', '玄天上帝'].includes(item.god.name))).toBe(true);
    expect(recommendGods({ questionCategory: 'settlement' }).some((item) => ['開漳聖王', '廣澤尊王', '三山國王', '媽祖'].includes(item.god.name))).toBe(true);
  });
});
