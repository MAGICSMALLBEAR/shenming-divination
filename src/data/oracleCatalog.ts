export interface OracleCatalogEntry {
  label: string;
  totalPoems: number;
  sourceNote: string;
  completenessNote: string;
  strengths: string[];
  sourceType: string;
  editionNote: string;
  suitabilityNote: string;
  versionTag: string;
}

const defaultEntry: OracleCatalogEntry = {
  label: '通用籤系',
  totalPoems: 0,
  sourceNote: '目前沒有額外來源標註。',
  completenessNote: '結構完整，但還可以補更多來源與流派說明。',
  strengths: ['通用提問'],
  sourceType: 'App 內建資料',
  editionNote: '尚未指定版本，建議後續補來源與修訂紀錄。',
  suitabilityNote: '適合一般請示，若有明確主題可改向更專門的神明請示。',
  versionTag: 'internal-general-v1',
};

export function getOracleCatalogByGodId(godId?: number | null): OracleCatalogEntry {
  switch (godId) {
    case 1:
    case 8:
    case 14:
    case 15:
      return {
        label: '雷雨師百首籤',
        totalPoems: 100,
        sourceNote: '以民間常見雷雨師百首籤為骨幹，前端欄位已補齊白話、典故與分類解曰。',
        completenessNote: '100 首筆數完整；下一步可補廟宇流傳版本、異文與逐籤來源索引。',
        strengths: ['事業決策', '功名學業', '長線規劃'],
        sourceType: '傳統籤系 + App 白話修訂',
        editionNote: '目前為內建修訂版，保留傳統籤詩核心句，白話與各類解曰由本 App 統一整理。',
        suitabilityNote: '適合問事業、功名、長期方向與需要權衡吉凶的題目。',
        versionTag: 'leiyushi-100-app-v2',
      };
    case 2:
      return {
        label: '觀音靈籤',
        totalPoems: 100,
        sourceNote: '以民間常見觀音靈籤百首為骨幹，適合感情、心性、困境轉折類問題。',
        completenessNote: '100 首筆數完整；未來可補寺廟版本差異、典故來源與常見解法脈絡。',
        strengths: ['感情因緣', '內在狀態', '困局轉念'],
        sourceType: '傳統籤系 + App 白話修訂',
        editionNote: '目前為內建修訂版，保留籤號與籤意結構，白話與解曰由本 App 統一整理。',
        suitabilityNote: '適合問平安、感情、身心狀態、困局如何轉念。',
        versionTag: 'guanyin-100-app-v2',
      };
    case 3:
    case 4:
    case 6:
    case 7:
      return {
        label: '甲子六十籤',
        totalPoems: 60,
        sourceNote: '以六十甲子籤為骨幹，對日常、家宅、財務與現實選擇很夠用。',
        completenessNote: '60 首筆數完整；若要更在地，可再補各神明常見廟口解法與適用範圍。',
        strengths: ['家宅平安', '財務現實題', '日常抉擇'],
        sourceType: '傳統籤系 + App 白話修訂',
        editionNote: '目前為內建修訂版，保留六十甲子排序，白話與分類解曰由本 App 統一整理。',
        suitabilityNote: '適合問家運、財務、日常抉擇與短中期現實安排。',
        versionTag: 'jiazi-60-app-v2',
      };
    case 5:
      return {
        label: '保生健康籤（雷雨師）',
        totalPoems: 100,
        sourceNote: '以雷雨師百首為骨幹，加入保生大帝信仰中重視的身心調養、疾病復原與生活節律語境。',
        completenessNote: '100 首完整可抽；此為 App 專屬健康向解籤層，並非標榜某間廟宇唯一定本。',
        strengths: ['健康身體', '復原調養', '生活作息'],
        sourceType: '傳統籤系骨幹 + 神明專屬白話解籤',
        editionNote: '雷雨師原籤不改，新增保生大帝健康向標題、典故前言與健康解曰。',
        suitabilityNote: '適合問身心調養、醫療選擇前的心態整理、生活節律與復原方向。',
        versionTag: 'baosheng-health-leiyushi-v1',
      };
    case 9:
      return {
        label: '諸葛神數',
        totalPoems: 64,
        sourceNote: '以六十四卦象義推演為核心，使用報數取模對應 1 到 64 的策略型籤解。',
        completenessNote: '64 數完整可用；已補數理規則與卦象索引入口，後續可再擴充爻辭與典故來源。',
        strengths: ['策略推演', '方案選擇', '風險辨識'],
        sourceType: '易卦象義 + App 策略型白話解籤',
        editionNote: '目前為 App 內建六十四卦白話版，重點在決策提醒，不等同完整易經占筮。',
        suitabilityNote: '適合用在選方案、判斷風險、釐清下一步策略。',
        versionTag: 'zhuge-64-hexagram-app-v2',
      };
    case 10:
      return {
        label: '二十八宿靈籤',
        totalPoems: 28,
        sourceNote: '以二十八星宿為序，每宿一籤，搭配玄天上帝鎮煞、護境與穩局的請示語境。',
        completenessNote: '28 宿筆數完整；後續可補星宿方位、值日宜忌與道教科儀脈絡。',
        strengths: ['消災制煞', '家宅平安', '穩固局勢'],
        sourceType: '星宿籤系 + App 白話修訂',
        editionNote: '目前為內建二十八宿白話版，保留星宿序列並補分類解曰。',
        suitabilityNote: '適合問家宅、消災、是非小人、事業穩固與行動時機。',
        versionTag: 'ershibaxiu-28-app-v1',
      };
    case 11:
      return {
        label: '濟公活佛籤（雷雨師）',
        totalPoems: 100,
        sourceNote: '以雷雨師百首為骨幹，加入濟公活佛破執、轉念與化解疑難的白話語境。',
        completenessNote: '100 首完整可抽；此為 App 專屬點化向解籤層，並非標榜某間廟宇唯一定本。',
        strengths: ['困局轉念', '疑難雜症', '心結放下'],
        sourceType: '傳統籤系骨幹 + 神明專屬白話解籤',
        editionNote: '雷雨師原籤不改，新增濟公活佛點化向標題、典故前言與總論解曰。',
        suitabilityNote: '適合問想不通的事、情緒卡住、關係僵局與需要換角度的題目。',
        versionTag: 'jigong-leiyushi-v1',
      };
    case 12:
      return {
        label: '三太子衝關籤（六十甲子）',
        totalPoems: 60,
        sourceNote: '以六十甲子籤為骨幹，加入三太子行動力、突破卡關與衝刺節奏的白話語境。',
        completenessNote: '60 首完整可抽；此為 App 專屬行動向解籤層，並非標榜某間廟宇唯一定本。',
        strengths: ['突破難關', '創意行動', '事業衝刺'],
        sourceType: '傳統籤系骨幹 + 神明專屬白話解籤',
        editionNote: '六十甲子原籤不改，新增三太子衝關向標題、典故前言與事業解曰。',
        suitabilityNote: '適合問衝刺目標、創意執行、卡關突破與何時該出手。',
        versionTag: 'santaizi-jiazi-v1',
      };
    case 13:
      return {
        label: '月老姻緣籤（六十甲子）',
        totalPoems: 60,
        sourceNote: '以六十甲子籤為骨幹，加入月老紅線、相處節奏與關係修復的白話語境。',
        completenessNote: '60 首完整可抽；此為 App 專屬姻緣向解籤層，並非標榜某間廟宇唯一定本。',
        strengths: ['姻緣桃花', '關係修復', '相處時機'],
        sourceType: '傳統籤系骨幹 + 神明專屬白話解籤',
        editionNote: '六十甲子原籤不改，新增月老姻緣向標題、典故前言與婚姻解曰。',
        suitabilityNote: '適合問曖昧、復合、穩定關係、婚姻與是否該主動表達。',
        versionTag: 'yuelao-jiazi-v1',
      };
    default:
      return defaultEntry;
  }
}
