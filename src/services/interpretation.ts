export interface InterpretationSection {
  key: 'summary' | 'state' | 'insight' | 'actions' | 'cautions' | 'avoid' | 'history' | 'followUp';
  title: string;
  lines: string[];
}

const SECTION_TITLES: InterpretationSection[] = [
  { key: 'summary', title: '一句結論', lines: [] },
  { key: 'state', title: '目前狀態', lines: [] },
  { key: 'insight', title: '籤意重點', lines: [] },
  { key: 'actions', title: '建議行動', lines: [] },
  { key: 'cautions', title: '需要留意', lines: [] },
  { key: 'avoid', title: '不宜做什麼', lines: [] },
  { key: 'followUp', title: '適合追問', lines: [] },
];

function cleanLine(line: string): string {
  return line.replace(/^[\-\d.、\s]+/, '').trim();
}

export function formatStructuredInterpretation(sections: InterpretationSection[]): string {
  return sections
    .filter((section) => section.lines.length > 0)
    .map((section) => `【${section.title}】\n${section.lines.join('\n')}`)
    .join('\n\n');
}

export function normalizeInterpretationText(raw: string, fallbackQuestion?: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  if (trimmed.includes('【一句結論】') || trimmed.includes('【建議行動】')) {
    return trimmed;
  }

  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const sections: InterpretationSection[] = SECTION_TITLES.map((section) => ({
    ...section,
    lines: [],
  }));

  sections[0].lines.push(paragraphs[0] ?? '這支籤提醒你先定下心，再看清真正要處理的重點。');
  sections[1].lines.push(
    paragraphs[1] ?? '目前的狀態需要先穩住節奏，別急著把所有結果一次定案。'
  );
  sections[2].lines.push(
    paragraphs[2] ?? '目前不只是結果問題，更重要的是你的節奏、判斷與耐心。'
  );
  sections[3].lines.push(
    paragraphs[3] ?? '先做一個最小但明確的行動，讓籤意落到生活裡。'
  );
  sections[4].lines.push(
    paragraphs[4] ?? '留意情緒、資訊不足與外界壓力，這些都可能讓判斷失準。'
  );
  sections[5].lines.push(
    paragraphs[5] ?? '不宜在心急時做不可逆決定，也不宜同時處理太多方向。'
  );
  sections[6].lines.push(
    fallbackQuestion
      ? `可以追問：「關於${fallbackQuestion}，我下一步最該確認的是什麼？」`
      : '可以追問下一步、時間點，或該先避開什麼。'
  );

  return formatStructuredInterpretation(sections);
}

export function extractInterpretationSections(text?: string | null): InterpretationSection[] {
  if (!text?.trim()) return [];

  const lines = text.split('\n');
  const sections: InterpretationSection[] = [];
  let current: InterpretationSection | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const headingMatch = line.match(/^【(.+?)】$/);

    if (headingMatch) {
      const title = headingMatch[1];
      const key =
        title.includes('結論')
          ? 'summary'
          : title.includes('狀態')
            ? 'state'
            : title.includes('重點')
              ? 'insight'
              : title.includes('行動')
                ? 'actions'
                : title.includes('留意')
                  ? 'cautions'
                  : title.includes('不宜') || title.includes('避免')
                    ? 'avoid'
                    : title.includes('脈絡') || title.includes('過去')
                      ? 'history'
                      : 'followUp';

      current = { key, title, lines: [] };
      sections.push(current);
      continue;
    }

    if (!current || !line) continue;
    current.lines.push(cleanLine(line));
  }

  if (sections.length > 0) {
    return sections.filter((section) => section.lines.length > 0);
  }

  return [
    {
      key: 'summary',
      title: '解籤內容',
      lines: text
        .split('\n')
        .map((line) => cleanLine(line))
        .filter(Boolean),
    },
  ];
}
