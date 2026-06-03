export interface OracleCatalogEntry {
  label: string;
  totalPoems: number;
  sourceNote: string;
  completenessNote: string;
  strengths: string[];
}

const defaultEntry: OracleCatalogEntry = {
  label: '通用籤系',
  totalPoems: 0,
  sourceNote: '目前沒有額外來源標註。',
  completenessNote: '結構完整，但還可以補更多來源與流派說明。',
  strengths: ['通用提問'],
};

export function getOracleCatalogByGodId(godId?: number | null): OracleCatalogEntry {
  switch (godId) {
    case 1:
    case 5:
    case 8:
      return {
        label: '雷雨師百首籤',
        totalPoems: 100,
        sourceNote: '目前已完整收錄 100 首，前端欄位齊全，但還缺乏廟宇流傳版本與出處標記。',
        completenessNote: '資料筆數完整，下一步最值得補的是來源、異文、典故索引。',
        strengths: ['事業決策', '功名學業', '長線規劃'],
      };
    case 2:
      return {
        label: '觀音靈籤',
        totalPoems: 100,
        sourceNote: '已完整收錄 100 首，適合感情、心性、困境轉折類問題。',
        completenessNote: '數量完整，未來可補寺廟版本差異與常見解法脈絡。',
        strengths: ['感情因緣', '內在狀態', '困局轉念'],
      };
    case 3:
    case 4:
    case 6:
    case 7:
      return {
        label: '甲子六十籤',
        totalPoems: 60,
        sourceNote: '目前 60 首結構完整，對日常與務實題目很夠用，但神明之間仍共用同一套籤系。',
        completenessNote: '資料完整，若要更在地，可再補各神明常見廟口解法與適用範圍。',
        strengths: ['家宅平安', '財務現實題', '日常抉擇'],
      };
    case 9:
      return {
        label: '諸葛神數',
        totalPoems: 64,
        sourceNote: '64 數完整可用，屬於策略型提問體驗，和傳統求籤流程不同。',
        completenessNote: '筆數完整，之後可補卦象對照、數理說明與典故索引。',
        strengths: ['策略推演', '方案選擇', '風險辨識'],
      };
    default:
      return defaultEntry;
  }
}
