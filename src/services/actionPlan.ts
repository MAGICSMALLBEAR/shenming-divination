import type { Poem } from '@/data/poems/leiyushi';

const CATEGORY_LABELS: Record<string, string> = {
  career: '工作',
  love: '感情',
  wealth: '財務',
  health: '健康',
  study: '學業',
  family: '家庭',
  travel: '出行',
  general: '近期安排',
};

function isPositive(level: string): boolean {
  return level.includes('上') || level.includes('吉');
}

function isCautious(level: string): boolean {
  return level.includes('下') || level.includes('凶');
}

export function buildActionPlan(params: {
  poem: Poem;
  questionCategory?: string;
  question?: string;
}): string[] {
  const label = CATEGORY_LABELS[params.questionCategory ?? 'general'] ?? CATEGORY_LABELS.general;
  const positive = isPositive(params.poem.level);
  const cautious = isCautious(params.poem.level);
  const focus = params.question?.trim() || label;

  const steps = [
    `先把「${focus}」拆成一個本週可完成的小目標，避免只停在想像。`,
    positive
      ? `這支籤偏順勢，今天就安排一個和${label}有關的主動行動。`
      : cautious
        ? `這支籤偏提醒，先檢查${label}裡最不穩的一個環節，再決定下一步。`
        : `這支籤偏觀察，先記錄${label}的現況，再選擇最穩的推進方式。`,
    `三天後回頭檢查：你是否比今天更清楚自己要怎麼面對「${focus}」。`,
  ];

  return steps;
}
