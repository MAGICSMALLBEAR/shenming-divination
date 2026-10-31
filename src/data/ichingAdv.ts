/**
 * 周易六爻起卦、動爻與變卦（之卦）推演演算法
 */
import { HEXAGRAMS, type Hexagram } from './iching';

export type LineValue = 6 | 7 | 8 | 9; // 6: 老陰(動), 7: 少陽(靜), 8: 少陰(靜), 9: 老陽(動)

export interface YaoLine {
  position: number;    // 1 (初爻) 到 6 (上爻)
  positionName: string;// 初爻、二爻、三爻、四爻、五爻、上爻
  value: LineValue;
  isYang: boolean;     // 原始陰陽 (7, 9 為陽)
  isMoving: boolean;   // 是否為動爻 (6 或 9)
  coins: [number, number, number]; // 3 枚銅錢 (2: 背/陰, 3: 字/陽)
  changedYang?: boolean;// 變爻後陰陽 (9變陰, 6變陽)
  lineText: string;    // 爻位說明
}

export interface IChingDivinationResult {
  lines: YaoLine[];           // 六爻（由初爻到上爻）
  primaryHexagram: Hexagram;  // 本卦
  changedHexagram: Hexagram | null; // 變卦（之卦，無動爻時為 null）
  movingLineIndices: number[];// 動爻位置 (1-6)
  movingLineSummary: string;  // 動爻解析
  overallVerdict: string;     // 斷事指引總結
}

// 三枚銅錢擲爻單次模擬
// 銅錢：正面(字)為 3 (陽)，背面為 2 (陰)
export function tossCoins(seed?: number): { value: LineValue; coins: [number, number, number] } {
  const r1 = Math.random() > 0.5 ? 3 : 2;
  const r2 = Math.random() > 0.5 ? 3 : 2;
  const r3 = Math.random() > 0.5 ? 3 : 2;
  const sum = (r1 + r2 + r3) as LineValue;
  return { value: sum, coins: [r1, r2, r3] };
}

const LINE_POSITION_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

// 八卦三爻對應表（由下而上：第1爻、第2爻、第3爻）
const LINES_TO_TRIGRAM: Record<string, string> = {
  '1,1,1': '☰', // 乾
  '1,1,0': '☱', // 兌
  '1,0,1': '☲', // 離
  '1,0,0': '☳', // 震
  '0,1,1': '☴', // 巽
  '0,1,0': '☵', // 坎
  '0,0,1': '☶', // 艮
  '0,0,0': '☷', // 坤
};

// 依六個爻的陰陽找對應六十四卦
export function findHexagramByLines(yangBits: boolean[]): Hexagram {
  if (yangBits.length !== 6) return HEXAGRAMS[0];
  const lowerKey = `${yangBits[0] ? 1 : 0},${yangBits[1] ? 1 : 0},${yangBits[2] ? 1 : 0}`;
  const upperKey = `${yangBits[3] ? 1 : 0},${yangBits[4] ? 1 : 0},${yangBits[5] ? 1 : 0}`;
  const lowerTrigram = LINES_TO_TRIGRAM[lowerKey] || '☰';
  const upperTrigram = LINES_TO_TRIGRAM[upperKey] || '☰';
  const symbol = `${upperTrigram}${lowerTrigram}`;

  const match = HEXAGRAMS.find((h) => h.symbol === symbol);
  return match || HEXAGRAMS[0];
}

// 產生完整六爻占卜結果
export function castIChing(presetLineValues?: LineValue[]): IChingDivinationResult {
  const lines: YaoLine[] = [];

  for (let i = 0; i < 6; i++) {
    const toss = presetLineValues && presetLineValues[i] != null
      ? { value: presetLineValues[i], coins: [2, 2, 3] as [number, number, number] }
      : tossCoins();

    const isYang = toss.value === 7 || toss.value === 9;
    const isMoving = toss.value === 6 || toss.value === 9;
    const changedYang = isMoving ? !isYang : isYang;

    const valueName = toss.value === 9 ? '老陽 (動爻)'
      : toss.value === 6 ? '老陰 (動爻)'
      : toss.value === 7 ? '少陽 (靜爻)'
      : '少陰 (靜爻)';

    lines.push({
      position: i + 1,
      positionName: LINE_POSITION_NAMES[i],
      value: toss.value,
      isYang,
      isMoving,
      coins: toss.coins,
      changedYang,
      lineText: `${LINE_POSITION_NAMES[i]}：${valueName}`,
    });
  }

  // 1. 本卦
  const primaryYangBits = lines.map((l) => l.isYang);
  const primaryHexagram = findHexagramByLines(primaryYangBits);

  // 2. 動爻與變卦
  const movingLineIndices = lines.filter((l) => l.isMoving).map((l) => l.position);
  let changedHexagram: Hexagram | null = null;
  let movingLineSummary = '';
  let overallVerdict = '';

  if (movingLineIndices.length > 0) {
    const changedYangBits = lines.map((l) => (l.isMoving ? !l.isYang : l.isYang));
    changedHexagram = findHexagramByLines(changedYangBits);

    const movingNames = movingLineIndices.map((idx) => {
      const line = lines[idx - 1];
      const yangLabel = line.isYang ? '九' : '六';
      if (idx === 1) return `初${yangLabel}`;
      if (idx === 6) return `上${yangLabel}`;
      return `${yangLabel === '九' ? '九' : '六'}${idx}`;
    }).join('、');

    movingLineSummary = `本卦有 ${movingLineIndices.length} 個動爻發動（${movingNames}），時局由【${primaryHexagram.name}卦】轉變趨向【${changedHexagram.name}卦】。`;

    if (movingLineIndices.length === 1) {
      overallVerdict = `以發動之「${movingNames}」爻辭為主要契機。當前處於【${primaryHexagram.name}卦】之情境，但隨著該爻位之推展，事態終將轉往【${changedHexagram.name}卦】之格局發展，宜順應爻變之勢。`;
    } else {
      overallVerdict = `動爻多處發動，象徵此時局勢正逢大變動之交界點。需以本卦【${primaryHexagram.name}卦】為立足根基，參考之卦【${changedHexagram.name}卦】之未來徵兆，審時度勢，切忌刻舟求劍。`;
    }
  } else {
    movingLineSummary = '六爻皆靜，全卦無動爻。';
    overallVerdict = `全卦六爻皆安靜不動，人事時機處於本位穩定狀態。直接以本卦【${primaryHexagram.name}卦】卦辭與卦象為主要決斷依據。`;
  }

  return {
    lines,
    primaryHexagram,
    changedHexagram,
    movingLineIndices,
    movingLineSummary,
    overallVerdict,
  };
}

