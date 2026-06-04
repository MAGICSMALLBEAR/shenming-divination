export interface QuestionReview {
  issue: string;
  suggestion: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  career: '工作與事業',
  love: '感情關係',
  wealth: '財務與進帳',
  health: '健康與身心',
  study: '學業與考試',
  family: '家庭與家運',
  travel: '出行與變動',
  general: '近期整體運勢',
};

function normalizeQuestion(question: string): string {
  return question.replace(/\s+/g, ' ').trim();
}

function buildFocus(question: string, category: string): string {
  const clean = normalizeQuestion(question);
  if (!clean) return CATEGORY_LABELS[category] ?? CATEGORY_LABELS.general;
  return clean.replace(/[？?。!！]+$/g, '');
}

export function reviewQuestion(question: string): QuestionReview[] {
  const clean = normalizeQuestion(question);
  const reviews: QuestionReview[] = [];

  if (clean.length < 8) {
    reviews.push({
      issue: '題目有點太短',
      suggestion: '可以補上時間範圍、對象或你最在意的結果。',
    });
  }

  if ((clean.match(/[？?]/g) ?? []).length > 1 || clean.includes('還是')) {
    reviews.push({
      issue: '題目可能一次問了兩件事',
      suggestion: '先只保留一個最重要的判斷點，籤意會更集中。',
    });
  }

  if (clean.length > 42) {
    reviews.push({
      issue: '題目偏長',
      suggestion: '濃縮成一句核心問題，保留真正想確認的那一件事。',
    });
  }

  return reviews;
}

export function suggestQuestionDrafts(question: string, category: string): string[] {
  const focus = buildFocus(question, category);

  const templates: Record<string, string[]> = {
    career: [
      `若我在未來三個月專注於「${focus}」，是否有利於工作發展？`,
      `關於「${focus}」，我現在應該主動推進還是先穩住觀察？`,
      `若我朝「${focus}」努力，近期是否會有好的職涯轉機？`,
    ],
    love: [
      `關於「${focus}」，我該繼續投入還是先放慢腳步？`,
      `在「${focus}」這件事上，近期感情是否有機會往穩定發展？`,
      `面對「${focus}」，我現在最適合採取什麼態度？`,
    ],
    wealth: [
      `關於「${focus}」，近期財務規劃是否適合積極推進？`,
      `若我處理「${focus}」，是否有助於改善收入與支出平衡？`,
      `面對「${focus}」，我應該保守為先還是可以適度把握機會？`,
    ],
    health: [
      `關於「${focus}」，我近期最需要留意的身心提醒是什麼？`,
      `若我現在處理「${focus}」，是否有助於恢復穩定狀態？`,
      `面對「${focus}」，我該先調整作息、情緒，還是另尋幫助？`,
    ],
    study: [
      `若我把重心放在「${focus}」，近期是否有助於考試與學習成果？`,
      `關於「${focus}」，我應該加強衝刺還是調整節奏？`,
      `在「${focus}」這件事上，我現在最適合採取什麼讀書策略？`,
    ],
    family: [
      `關於「${focus}」，近期家庭關係是否有機會慢慢改善？`,
      `面對「${focus}」，我現在該主動溝通還是先安定自己的心？`,
      `若我處理「${focus}」，是否有助於家運與氣氛轉穩？`,
    ],
    travel: [
      `關於「${focus}」，近期出行與變動是否順利？`,
      `若我安排「${focus}」，現在是否是合適的時機？`,
      `面對「${focus}」，我應該先準備再行動，還是可以放心推進？`,
    ],
    general: [
      `關於「${focus}」，我近期最應該把握的方向是什麼？`,
      `面對「${focus}」，現在是適合推進還是先穩住觀察？`,
      `若我處理「${focus}」，近期整體運勢是否會更順一些？`,
    ],
  };

  return templates[category] ?? templates.general;
}
