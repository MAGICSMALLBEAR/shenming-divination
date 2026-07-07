import {
  extractInterpretationSections,
  formatStructuredInterpretation,
  normalizeInterpretationText,
} from '@/services/interpretation';

describe('extractInterpretationSections', () => {
  it('categorizes every known heading to a distinct key (no duplicate keys)', () => {
    const text = [
      '【一句結論】', 'a',
      '【目前狀態】', 'b',
      '【籤意重點】', 'c',
      '【建議行動】', 'd',
      '【過去脈絡】', 'e',
      '【需要留意】', 'f',
      '【不宜做什麼】', 'g',
      '【適合追問】', 'h',
    ].join('\n');

    const sections = extractInterpretationSections(text);
    const keys = sections.map((s) => s.key);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual([
      'summary', 'state', 'insight', 'actions', 'history', 'cautions', 'avoid', 'followUp',
    ]);
  });

  it('falls back to a single summary section for unheaded text', () => {
    const sections = extractInterpretationSections('just some plain text\nmore text');
    expect(sections).toHaveLength(1);
    expect(sections[0].key).toBe('summary');
  });

  it('returns an empty array for empty/null input', () => {
    expect(extractInterpretationSections('')).toEqual([]);
    expect(extractInterpretationSections(null)).toEqual([]);
    expect(extractInterpretationSections(undefined)).toEqual([]);
  });
});

describe('normalizeInterpretationText', () => {
  it('passes already-structured text through unchanged', () => {
    const raw = '【一句結論】\n先穩住節奏。';
    expect(normalizeInterpretationText(raw)).toBe(raw);
  });

  it('returns empty string for blank input', () => {
    expect(normalizeInterpretationText('   ')).toBe('');
  });

  it('builds all 7 fallback sections from freeform paragraphs', () => {
    const raw = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].join('\n\n');
    const result = normalizeInterpretationText(raw, '我的問題');

    expect(result).toContain('【一句結論】');
    expect(result).toContain('【適合追問】');
    expect(result).toContain('我的問題');
  });
});

describe('formatStructuredInterpretation', () => {
  it('drops sections with no lines', () => {
    const result = formatStructuredInterpretation([
      { key: 'summary', title: '一句結論', lines: ['hello'] },
      { key: 'state', title: '目前狀態', lines: [] },
    ]);
    expect(result).toBe('【一句結論】\nhello');
  });
});
