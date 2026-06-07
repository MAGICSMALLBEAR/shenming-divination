import type { Poem } from '@/data/poems/leiyushi';

const CATEGORY_LABELS: Record<string, string> = {
  career: '工作與事業',
  love: '感情與關係',
  wealth: '財務與資源',
  health: '健康與作息',
  study: '學業與考試',
  family: '家庭與溝通',
  travel: '出行與搬遷',
  general: '整體狀態',
};

const CATEGORY_ACTIONS: Record<string, string> = {
  career: '列出一件最能推動進度的工作，今天先完成可交付的小版本。',
  love: '用溫和但清楚的方式整理自己的感受，先確認界線與期待。',
  wealth: '檢查一筆近期支出或投資決策，暫緩衝動性花費。',
  health: '先把睡眠、飲食或運動其中一項拉回穩定節奏。',
  study: '安排一段不被打斷的複習時間，先補最不穩的章節。',
  family: '找一個適合開口的時機，把需求說小、說具體。',
  travel: '再次確認時間、交通、文件與備案，不把風險留到出發當天。',
  general: '把腦中最卡的一件事寫下來，拆成今天能做的一小步。',
};

function isVeryPositive(level: string): boolean {
  return level.includes('大吉') || level.includes('上上');
}

function isPositive(level: string): boolean {
  return isVeryPositive(level) || level.includes('上吉') || level.includes('中吉');
}

function isCautious(level: string): boolean {
  return level.includes('下') || level.includes('凶');
}

export function buildActionPlan(params: {
  poem: Poem;
  questionCategory?: string;
  question?: string;
}): string[] {
  const category = params.questionCategory ?? 'general';
  const label = CATEGORY_LABELS[category] ?? CATEGORY_LABELS.general;
  const focus = params.question?.trim() || label;

  const firstStep = CATEGORY_ACTIONS[category] ?? CATEGORY_ACTIONS.general;
  const level = params.poem.level;

  if (isVeryPositive(level)) {
    return [
      `把「${focus}」視為可以前進的訊號，今天先做一個具體承諾或預約。`,
      firstStep,
      '在三天內回來記錄結果：哪些地方順了、哪些地方仍需要神明提醒。',
    ];
  }

  if (isPositive(level)) {
    return [
      `順著籤意推進「${focus}」，但先從低風險的小行動開始。`,
      firstStep,
      '保留一個備案，讓好運有路可走，也讓自己不被單一路徑綁住。',
    ];
  }

  if (isCautious(level)) {
    return [
      `先不要急著硬推「${focus}」，今天的重點是止損、觀察與保留餘地。`,
      firstStep,
      '把重大決定延後一天，先確認資訊是否完整、情緒是否穩定。',
    ];
  }

  return [
    `先把「${focus}」放回可掌控的範圍，不求一次解完。`,
    firstStep,
    '設定一個回訪時間，之後依實際發展標記為應驗、部分應驗或未應驗。',
  ];
}
