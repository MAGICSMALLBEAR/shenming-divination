/**
 * 塔羅牌陣與正逆位系統
 */
import { TAROT_MAJOR, type TarotCard } from './tarot';

export type TarotSpreadType = 'single' | 'three-time' | 'holy-triangle';

export interface SpreadPosition {
  index: number;
  name: string;        // 如「過去因緣」、「現況處境」、「未來指引」
  description: string; // 該位置在牌陣中的含義
}

export interface TarotSpreadConfig {
  type: TarotSpreadType;
  title: string;
  cardCount: number;
  description: string;
  positions: SpreadPosition[];
}

export interface DrawnTarotCard {
  card: TarotCard;
  isReversed: boolean;
  position: SpreadPosition;
  interpretation: string;
  actionGuidance: string;
}

export const TAROT_SPREADS: Record<TarotSpreadType, TarotSpreadConfig> = {
  single: {
    type: 'single',
    title: '單張靈感啟示',
    cardCount: 1,
    description: '一事一問，以最直接凝練的一張牌點出核心啟發與當下處境。',
    positions: [
      {
        index: 0,
        name: '當下核心啟發',
        description: '反映問題核心、宇宙給予的第一直覺指引與關鍵力量。',
      },
    ],
  },
  'three-time': {
    type: 'three-time',
    title: '時間之流三牌陣',
    cardCount: 3,
    description: '縱觀事情發展之脈絡：過去因由、當前狀態與若順勢而行之未來趨勢。',
    positions: [
      {
        index: 0,
        name: '過去因由',
        description: '導致此問題的前因、已成過往之影響或過去的經驗積累。',
      },
      {
        index: 1,
        name: '當前處境',
        description: '目前所處之現實情勢、當下心態與眼前關鍵挑戰。',
      },
      {
        index: 2,
        name: '未來趨勢',
        description: '依當前能量順行之可能走向與後續展現之結果。',
      },
    ],
  },
  'holy-triangle': {
    type: 'holy-triangle',
    title: '聖三角抉擇牌陣',
    cardCount: 3,
    description: '針對抉擇或困局，深入洞察問題本質、最大阻礙及突破之道。',
    positions: [
      {
        index: 0,
        name: '問題本質',
        description: '事情的核心真相，穿透表面現象看清深層癥結。',
      },
      {
        index: 1,
        name: '阻礙與考驗',
        description: '內在盲點、外在阻力或需要克服之執念考驗。',
      },
      {
        index: 2,
        name: '突破指引',
        description: '解決問題之關鍵做法、轉化困局之具體行動策略。',
      },
    ],
  },
};

// 逆位專屬解讀衍生庫
export const REVERSED_INTERPRETATIONS: Record<number, { reversedMeaning: string; reversedAdvice: string }> = {
  0: { reversedMeaning: '冒進莽撞，忽視現實風險，或猶豫不決錯失出發契機。', reversedAdvice: '腳踏實地評估環境，避免無準備的盲目跳躍。' },
  1: { reversedMeaning: '才華被壓抑、溝通不暢，或有自作聰明濫用技巧之危險。', reversedAdvice: '回歸誠信踏實，梳理真正可用之資源重新定位。' },
  2: { reversedMeaning: '忽視直覺、心煩氣躁，內心閉塞而無法看清真實情感。', reversedAdvice: '暫停紛擾思緒，透過靜坐沉澱找回內在清明。' },
  3: { reversedMeaning: '創造力匱乏、過度溺愛依賴，或在物質享受中迷失方向。', reversedAdvice: '建立健康的情感邊界，先學會照顧好自己的獨立身心。' },
  4: { reversedMeaning: '過度專斷控制、缺乏彈性，或遭遇體制權威打壓而受困。', reversedAdvice: '適度放權聆聽他人，學會以柔克剛化解僵局。' },
  5: { reversedMeaning: '拘泥教條形式、被傳統規範束縛，或遇到不合宜的指引。', reversedAdvice: '敢於質疑不合理常規，傾聽獨立內心良知。' },
  6: { reversedMeaning: '情感產生隔閡、價值觀分歧，或陷入兩難抉擇難以取捨。', reversedAdvice: '坦誠面對內心渴望，不要因恐懼而勉強妥協。' },
  7: { reversedMeaning: '方向失控、缺乏定力，被外在混亂牽制而衝動受挫。', reversedAdvice: '重新校正前進目標，踩剎車整理內在矛盾再啟程。' },
  8: { reversedMeaning: '內在懷疑動搖、情緒失控，或被恐懼壓抑了原有勇氣。', reversedAdvice: '溫柔接納內在脆弱，真正的力量源於耐心與包容。' },
  9: { reversedMeaning: '孤立封閉、過度逃避人群，或陷入孤芳自賞之偏狹。', reversedAdvice: '適度向外界伸出雙手，將內在領悟回饋於現實生活。' },
  10: { reversedMeaning: '運勢遭遇阻滯、看似處於低谷，或是抗拒既定的生命轉變。', reversedAdvice: '順應起伏週期，低潮時蓄勢養精，靜待時來運轉。' },
  11: { reversedMeaning: '評斷有失公允、推卸責任，或深陷繁複糾紛與不平之中。', reversedAdvice: '以客觀理智面對過失，勇於承擔責任才能重拾平衡。' },
  12: { reversedMeaning: '無謂的犧牲、停滯不前，或執著於無法改變的僵局。', reversedAdvice: '換個角度看待問題，放下自憐心態主動解鎖束縛。' },
  13: { reversedMeaning: '抗拒結束、恐懼改變，緊抓著已凋零的事物不願放手。', reversedAdvice: '唯有勇敢向過去告別，新的生命奇蹟才能破土萌芽。' },
  14: { reversedMeaning: '失衡極端、急於求成，或身心溝通不良產生磨擦。', reversedAdvice: '尋求中庸之道，調和兩極衝突，節制過激的生活步調。' },
  15: { reversedMeaning: '擺脫執念枷鎖、認清誘惑虛妄，正在從沉溺中甦醒。', reversedAdvice: '果斷切斷不良連結，重獲靈魂之自由與主控權。' },
  16: { reversedMeaning: '逃避必要改革，危機潛伏壓抑，或巨變後的創傷餘波。', reversedAdvice: '瓦解虛偽包裝才能重建真實根基，不必害怕徹底重建。' },
  17: { reversedMeaning: '失去信心希望、感到迷茫灰心，對未來產生幻滅之感。', reversedAdvice: '黑夜深處星光更顯明亮，重燃微小的希望火苗向前走。' },
  18: { reversedMeaning: '迷霧漸散、騙局與自欺浮出水面，恐懼逐漸轉為清醒。', reversedAdvice: '直面潛意識的恐懼陰影，以理性陽光驅散盲目猜忌。' },
  19: { reversedMeaning: '暫時的烏雲遮日、缺乏熱情活力，或成功稍微延後。', reversedAdvice: '保持樂觀童心，適度休息充電，光芒終將重新綻放。' },
  20: { reversedMeaning: '忽視內心召喚、逃避自省檢討，或自我懷疑裹足不前。', reversedAdvice: '勇敢聆聽內在深沉呼喚，原諒過去才能走向新生。' },
  21: { reversedMeaning: '尚未圓滿、臨門一腳受阻，或因細節拖延延誤成果整合。', reversedAdvice: '補齊最後拼圖，持之以恆把事情做完方得圓滿。' },
};

// 抽牌演算法（依牌陣抽取不重複卡片與隨機正逆位）
export function drawTarotSpread(spreadType: TarotSpreadType): DrawnTarotCard[] {
  const config = TAROT_SPREADS[spreadType];
  const deck = [...TAROT_MAJOR];

  // Fisher-Yates 洗牌
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const drawn: DrawnTarotCard[] = [];

  for (let i = 0; i < config.cardCount; i++) {
    const card = deck[i];
    const isReversed = Math.random() < 0.5; // 50% 機率正逆位
    const position = config.positions[i];

    const revData = REVERSED_INTERPRETATIONS[card.number] || {
      reversedMeaning: card.caution,
      reversedAdvice: '謹慎反思，適時調整心態步調。',
    };

    const interpretation = isReversed
      ? `【逆位象徵】${revData.reversedMeaning}`
      : `【正位象徵】${card.upright}`;

    const actionGuidance = isReversed
      ? revData.reversedAdvice
      : card.action;

    drawn.push({
      card,
      isReversed,
      position,
      interpretation,
      actionGuidance,
    });
  }

  return drawn;
}
