// 塔羅牌 — 22 張大阿爾克那 (Major Arcana)
export interface TarotCard {
  number: number;      // 0-21
  name: string;        // 英文名
  chineseName: string; // 中文名
  symbol: string;      // 象徵符號
  upright: string;     // 正位含義（占卜解說）
  action: string;      // 建議行動
  caution: string;     // 逆位提醒
  luck: 'great' | 'good' | 'neutral' | 'caution' | 'challenge';
}

export const TAROT_MAJOR: TarotCard[] = [
  {
    number: 0, name: 'The Fool', chineseName: '愚者', symbol: '🌄',
    upright: '新的開始，勇敢踏上未知旅程，充滿無限可能。',
    action: '放下顧慮，勇敢邁向新方向。',
    caution: '避免莽撞衝動，需做基本準備。',
    luck: 'good',
  },
  {
    number: 1, name: 'The Magician', chineseName: '魔術師', symbol: '✨',
    upright: '掌握資源與技能，意志力強大，是付諸行動的最佳時機。',
    action: '充分運用現有資源，主動出擊。',
    caution: '避免利用技巧操弄他人。',
    luck: 'great',
  },
  {
    number: 2, name: 'The High Priestess', chineseName: '女祭司', symbol: '🌙',
    upright: '直覺靈感強烈，靜觀其變，答案藏在內心深處。',
    action: '相信直覺，靜下來聆聽內心聲音。',
    caution: '不要過於依賴外在意見而忽視內在聲音。',
    luck: 'neutral',
  },
  {
    number: 3, name: 'The Empress', chineseName: '女皇', symbol: '👑',
    upright: '豐盛創造，感情圓滿，財富與幸福觸手可及。',
    action: '培育你的創意，關愛身邊的人。',
    caution: '過於依賴他人可能削弱自主能力。',
    luck: 'great',
  },
  {
    number: 4, name: 'The Emperor', chineseName: '皇帝', symbol: '⚔️',
    upright: '穩固的基礎，領導力強，秩序與規律帶來成功。',
    action: '建立結構，主導局勢。',
    caution: '過於控制可能壓制創意與靈活性。',
    luck: 'good',
  },
  {
    number: 5, name: 'The Hierophant', chineseName: '教皇', symbol: '⛪',
    upright: '傳統智慧，導師指引，尋求認可與教導。',
    action: '向有經驗的前輩請教，遵循正規途徑。',
    caution: '不要盲目服從，需有獨立思考。',
    luck: 'neutral',
  },
  {
    number: 6, name: 'The Lovers', chineseName: '戀人', symbol: '💕',
    upright: '感情甜蜜，重要選擇，關係中的和諧與愛。',
    action: '跟隨內心做出對感情的重要決定。',
    caution: '不要逃避關係中的困難話題。',
    luck: 'great',
  },
  {
    number: 7, name: 'The Chariot', chineseName: '戰車', symbol: '🏆',
    upright: '意志堅定，勇往直前，克服障礙贏得勝利。',
    action: '以強大意志力推進目標，不受阻撓。',
    caution: '避免因急於勝利而忽視他人感受。',
    luck: 'great',
  },
  {
    number: 8, name: 'Strength', chineseName: '力量', symbol: '🦁',
    upright: '內在力量，溫柔的勇氣，以愛與耐心克服困難。',
    action: '以柔克剛，用善意影響局勢。',
    caution: '不要以蠻力解決問題。',
    luck: 'good',
  },
  {
    number: 9, name: 'The Hermit', chineseName: '隱者', symbol: '🕯️',
    upright: '獨處沉思，內在智慧，尋找深層的人生意義。',
    action: '暫時退出喧囂，靜心思考方向。',
    caution: '長期孤立可能與現實脫節。',
    luck: 'neutral',
  },
  {
    number: 10, name: 'Wheel of Fortune', chineseName: '命運之輪', symbol: '☸️',
    upright: '命運轉機，好運降臨，抓住機遇扭轉乾坤。',
    action: '順應變化，積極把握轉機。',
    caution: '運勢輪流，切勿因得意而大意。',
    luck: 'great',
  },
  {
    number: 11, name: 'Justice', chineseName: '正義', symbol: '⚖️',
    upright: '公正平衡，因果報應，誠信為本。',
    action: '以誠信待人，做出公平的決定。',
    caution: '逃避責任只會讓問題更嚴重。',
    luck: 'neutral',
  },
  {
    number: 12, name: 'The Hanged Man', chineseName: '倒吊人', symbol: '🙃',
    upright: '暫停等待，換個角度看問題，放棄舊觀念。',
    action: '暫時放下，從不同角度重新審視。',
    caution: '不願改變觀點，陷入困境。',
    luck: 'caution',
  },
  {
    number: 13, name: 'Death', chineseName: '死神', symbol: '🌑',
    upright: '結束即是開始，蛻變轉化，勇敢放下舊的。',
    action: '接受改變，放下不再適合的事物。',
    caution: '抗拒改變只會延長痛苦。',
    luck: 'neutral',
  },
  {
    number: 14, name: 'Temperance', chineseName: '節制', symbol: '🌊',
    upright: '平衡節制，耐心調和，找到最佳解決方案。',
    action: '保持平衡，融合不同觀點。',
    caution: '極端主義會破壞和諧。',
    luck: 'good',
  },
  {
    number: 15, name: 'The Devil', chineseName: '惡魔', symbol: '⛓️',
    upright: '受到束縛，物質誘惑，正視執念與恐懼。',
    action: '正視讓你不自由的事物，尋求突破。',
    caution: '不要讓物質或欲望控制你的判斷。',
    luck: 'challenge',
  },
  {
    number: 16, name: 'The Tower', chineseName: '塔', symbol: '⚡',
    upright: '突如其來的衝擊，打破舊框架，帶來解放。',
    action: '接受突變，從廢墟中重建更好的一切。',
    caution: '不要固執於即將崩潰的事物。',
    luck: 'challenge',
  },
  {
    number: 17, name: 'The Star', chineseName: '星星', symbol: '⭐',
    upright: '希望、癒合與靈感，前途光明，信念更新。',
    action: '保持希望，相信未來。',
    caution: '過度理想化可能脫離現實。',
    luck: 'great',
  },
  {
    number: 18, name: 'The Moon', chineseName: '月亮', symbol: '🌕',
    upright: '幻覺混亂，直覺敏感，深層潛意識浮現。',
    action: '相信直覺，但也要核實事實。',
    caution: '不要被恐懼或錯覺帶偏判斷。',
    luck: 'caution',
  },
  {
    number: 19, name: 'The Sun', chineseName: '太陽', symbol: '☀️',
    upright: '喜悅成功，活力充沛，一切明朗順利。',
    action: '自信展現自己，積極享受生命。',
    caution: '不要因過於樂觀而忽視潛在風險。',
    luck: 'great',
  },
  {
    number: 20, name: 'Judgement', chineseName: '審判', symbol: '🔔',
    upright: '覺醒召喚，回顧過去，做出最終判斷。',
    action: '反思過去，做出清明的選擇。',
    caution: '不要讓過去的遺憾束縛未來。',
    luck: 'good',
  },
  {
    number: 21, name: 'The World', chineseName: '世界', symbol: '🌍',
    upright: '圓滿完成，世界在你腳下，完整實現目標。',
    action: '慶祝成就，準備踏上下一個旅程。',
    caution: '不要在成功後停滯不前。',
    luck: 'great',
  },
];

export function drawTarot(seed?: number): TarotCard {
  const s = seed ?? Date.now();
  const idx = ((s * 1664525 + 1013904223) >>> 0) % 22;
  return TAROT_MAJOR[idx];
}
