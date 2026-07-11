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

function entry(params: OracleCatalogEntry): OracleCatalogEntry {
  return params;
}

const defaultEntry: OracleCatalogEntry = entry({
  label: '通用籤系',
  totalPoems: 0,
  sourceNote: '目前沒有額外來源標註。',
  completenessNote: '結構完整，但還可以補更多來源與流派說明。',
  strengths: ['通用提問'],
  sourceType: 'App 內建資料',
  editionNote: '尚未指定版本，建議後續補來源與修訂紀錄。',
  suitabilityNote: '適合一般請示，若有明確主題可改向更專門的神明請示。',
  versionTag: 'internal-general-v1',
});

const leiyushiEntry = entry({
  label: '雷雨師百首籤',
  totalPoems: 100,
  sourceNote: '以民間常見雷雨師百首籤為骨幹，前端欄位已補齊白話、典故與分類解曰。',
  completenessNote: '100 首筆數完整；下一步可補廟宇流傳版本、異文與逐籤來源索引。',
  strengths: ['事業決策', '功名學業', '長線規劃'],
  sourceType: '傳統籤系 + App 白話修訂',
  editionNote: '目前為內建修訂版，保留傳統籤詩核心句，白話與各類解曰由本 App 統一整理。',
  suitabilityNote: '適合問事業、功名、長期方向與需要權衡吉凶的題目。',
  versionTag: 'leiyushi-100-app-v2',
});

const jiaziEntry = entry({
  label: '甲子六十籤',
  totalPoems: 60,
  sourceNote: '以六十甲子籤為骨幹，對日常、家宅、財務與現實選擇很夠用。',
  completenessNote: '60 首筆數完整；若要更在地，可再補各神明常見廟口解法與適用範圍。',
  strengths: ['家宅平安', '財務現實題', '日常抉擇'],
  sourceType: '傳統籤系 + App 白話修訂',
  editionNote: '目前為內建修訂版，保留六十甲子排序，白話與分類解曰由本 App 統一整理。',
  suitabilityNote: '適合問家運、財務、日常抉擇與短中期現實安排。',
  versionTag: 'jiazi-60-app-v2',
});

export function getOracleCatalogByGodId(godId?: number | null): OracleCatalogEntry {
  switch (godId) {
    case 1:
    case 8:
    case 16:
      return leiyushiEntry;
    case 2:
      return entry({
        label: '觀音靈籤',
        totalPoems: 100,
        sourceNote: '以民間常見觀音靈籤百首為骨幹，適合感情、心性、困境轉折類問題。',
        completenessNote: '100 首筆數完整；未來可補寺廟版本差異、典故來源與常見解法脈絡。',
        strengths: ['感情因緣', '內在狀態', '困局轉念'],
        sourceType: '傳統籤系 + App 白話修訂',
        editionNote: '目前為內建修訂版，保留籤號與籤意結構，白話與解曰由本 App 統一整理。',
        suitabilityNote: '適合問平安、感情、身心狀態、困局如何轉念。',
        versionTag: 'guanyin-100-app-v2',
      });
    case 3:
      return entry({
        label: '天后宮靈籤',
        totalPoems: 100,
        sourceNote: '參考天后宮百首籤常見結構，加入媽祖護航、家宅與出行平安的白話語境。',
        completenessNote: '100 首完整可抽；此為 App 內建白話整理版，非標榜特定天后宮唯一定本。',
        strengths: ['出行平安', '家庭照應', '遠行轉折'],
        sourceType: '常見天后宮籤系脈絡 + App 白話修訂',
        editionNote: '保留百籤架構，依媽祖信仰重寫白話、典故前言與分類解曰。',
        suitabilityNote: '適合問旅程、搬遷、家人平安、遠方消息與是否順風推進。',
        versionTag: 'tianhou-100-app-v1',
      });
    case 4:
    case 17:
    case 20:
    case 23:
    case 24:
    case 25:
      return jiaziEntry;
    case 5:
    case 21:
      return entry({
        label: '保生大帝靈籤',
        totalPoems: 64,
        sourceNote: '參考保生大帝靈籤與藥籤文化，轉作身心調養、復原節奏與照護安排的白話籤解。',
        completenessNote: '64 首完整可抽；健康內容為民俗與生活節奏提醒，不能取代醫療診斷。',
        strengths: ['健康身體', '復原調養', '照護安排'],
        sourceType: '保生信仰語境 + App 白話修訂',
        editionNote: '採六十四籤架構，避免提供具體藥方，重點放在求醫、休養與照護決策。',
        suitabilityNote: '適合問身心調養、醫療選擇前的心態整理、生活節律與復原方向。',
        versionTag: 'baosheng-64-app-v1',
      });
    case 6:
    case 22:
      return entry({
        label: '金錢卦三十二籤',
        totalPoems: 32,
        sourceNote: '以民間金錢卦問事脈絡為骨架，轉作資源取捨、財務節奏與現實判斷。',
        completenessNote: '32 首完整可抽；適合作為財務與現實決策提醒，不等同投資建議。',
        strengths: ['財務盤點', '資源取捨', '現實判斷'],
        sourceType: '金錢卦脈絡 + App 白話修訂',
        editionNote: '保留三十二卦數概念，白話與分類解曰由本 App 統一整理。',
        suitabilityNote: '適合問財務、買賣、投資風險、合約條件與資源是否該投入。',
        versionTag: 'jinqian-32-app-v1',
      });
    case 7:
      return entry({
        label: '註生娘娘三十籤',
        totalPoems: 30,
        sourceNote: '參考註生娘娘三十籤常見分類，加入孕育、親子、家庭照護與壓力協調語境。',
        completenessNote: '30 首完整可抽；孕育與健康內容僅作民俗提醒，仍應以專業醫療意見為準。',
        strengths: ['子嗣因緣', '孕育照護', '家庭祝福'],
        sourceType: '註生信仰語境 + App 白話修訂',
        editionNote: '採三十籤架構，白話與分類解曰由本 App 統一整理。',
        suitabilityNote: '適合問備孕、孕產照護、親子關係、家庭期待與照顧分工。',
        versionTag: 'zhusheng-30-app-v1',
      });
    case 9:
      return entry({
        label: '諸葛神數',
        totalPoems: 64,
        sourceNote: '以六十四卦象義推演為核心，使用報數取模對應 1 到 64 的策略型籤解。',
        completenessNote: '64 數完整可用；已補數理規則與卦象索引入口，後續可再擴充爻辭與典故來源。',
        strengths: ['策略推演', '方案選擇', '風險辨識'],
        sourceType: '易卦象義 + App 策略型白話解籤',
        editionNote: '目前為 App 內建六十四卦白話版，重點在決策提醒，不等同完整易經占筮。',
        suitabilityNote: '適合用在選方案、判斷風險、釐清下一步策略。',
        versionTag: 'zhuge-64-hexagram-app-v2',
      });
    case 10:
      return entry({
        label: '二十八宿靈籤',
        totalPoems: 28,
        sourceNote: '以二十八星宿為序，每宿一籤，搭配玄天上帝鎮煞、護境與穩局的請示語境。',
        completenessNote: '28 宿筆數完整；後續可補星宿方位、值日宜忌與道教科儀脈絡。',
        strengths: ['消災制煞', '家宅平安', '穩固局勢'],
        sourceType: '星宿籤系 + App 白話修訂',
        editionNote: '目前為內建二十八宿白話版，保留星宿序列並補分類解曰。',
        suitabilityNote: '適合問家宅、消災、是非小人、事業穩固與行動時機。',
        versionTag: 'ershibaxiu-28-app-v1',
      });
    case 11:
      return entry({
        label: '濟公活佛籤（雷雨師）',
        totalPoems: 100,
        sourceNote: '以雷雨師百首為骨幹，加入濟公活佛破執、轉念與化解疑難的白話語境。',
        completenessNote: '100 首完整可抽；此為 App 專屬點化向解籤層，並非標榜某間廟宇唯一定本。',
        strengths: ['困局轉念', '疑難雜症', '心結放下'],
        sourceType: '傳統籤系骨幹 + 神明專屬白話解籤',
        editionNote: '雷雨師原籤不改，新增濟公活佛點化向標題、典故前言與總論解曰。',
        suitabilityNote: '適合問想不通的事、情緒卡住、關係僵局與需要換角度的題目。',
        versionTag: 'jigong-leiyushi-v1',
      });
    case 12:
      return entry({
        label: '三太子衝關籤（六十甲子）',
        totalPoems: 60,
        sourceNote: '以六十甲子籤為骨幹，加入三太子行動力、突破卡關與衝刺節奏的白話語境。',
        completenessNote: '60 首完整可抽；此為 App 專屬行動向解籤層，並非標榜某間廟宇唯一定本。',
        strengths: ['突破難關', '創意行動', '事業衝刺'],
        sourceType: '傳統籤系骨幹 + 神明專屬白話解籤',
        editionNote: '六十甲子原籤不改，新增三太子衝關向標題、典故前言與事業解曰。',
        suitabilityNote: '適合問衝刺目標、創意執行、卡關突破與何時該出手。',
        versionTag: 'santaizi-jiazi-v1',
      });
    case 13:
      return entry({
        label: '月老姻緣籤（六十甲子）',
        totalPoems: 60,
        sourceNote: '以六十甲子籤為骨幹，加入月老紅線、相處節奏與關係修復的白話語境。',
        completenessNote: '60 首完整可抽；此為 App 專屬姻緣向解籤層，並非標榜某間廟宇唯一定本。',
        strengths: ['姻緣桃花', '關係修復', '相處時機'],
        sourceType: '傳統籤系骨幹 + 神明專屬白話解籤',
        editionNote: '六十甲子原籤不改，新增月老姻緣向標題、典故前言與婚姻解曰。',
        suitabilityNote: '適合問曖昧、復合、穩定關係、婚姻與是否該主動表達。',
        versionTag: 'yuelao-jiazi-v1',
      });
    case 14:
      return entry({
        label: '靈應侯靈籤',
        totalPoems: 60,
        sourceNote: '以城隍、靈應侯信仰中的明察、司法、公道與地方守護為主軸。',
        completenessNote: '60 首完整可抽；此為 App 內建白話整理版，後續可補地方城隍廟異文。',
        strengths: ['官司是非', '合約文書', '公道判斷'],
        sourceType: '城隍信仰語境 + App 白話修訂',
        editionNote: '採六十籤架構，白話與分類解曰由本 App 統一整理。',
        suitabilityNote: '適合問合約、法律、冤屈、責任歸屬、是非口舌與界線。',
        versionTag: 'lingyinghou-60-app-v1',
      });
    case 15:
      return entry({
        label: '呂祖六十籤',
        totalPoems: 60,
        sourceNote: '以呂祖六十籤常見修心、功名、感情取捨與身心清明的語境整理。',
        completenessNote: '60 首完整可抽；此為 App 內建白話整理版，後續可補廟宇版本差異。',
        strengths: ['功名學業', '感情取捨', '修心明志'],
        sourceType: '呂祖籤系脈絡 + App 白話修訂',
        editionNote: '採六十籤架構，白話與分類解曰由本 App 統一整理。',
        suitabilityNote: '適合問考試功名、感情是否該斷或續、身心清明與人生取捨。',
        versionTag: 'luzu-60-app-v1',
      });
    case 18:
      return entry({
        label: '觀音廿八籤',
        totalPoems: 28,
        sourceNote: '以觀音廿八籤的簡明短籤形式，轉作慈悲護念、家庭和合與靈性指引。',
        completenessNote: '28 首完整可抽；此為 App 內建白話整理版。',
        strengths: ['家庭和合', '身心安定', '貴人助力'],
        sourceType: '觀音廿八籤脈絡 + App 白話修訂',
        editionNote: '採二十八籤架構，搭配瑤池金母慈光與和合語境。',
        suitabilityNote: '適合問家庭、心性、貴人、女性長輩緣與溫和轉念。',
        versionTag: 'guanyin-28-jinmu-app-v1',
      });
    case 19:
      return entry({
        label: '觀音二十四籤',
        totalPoems: 24,
        sourceNote: '以觀音二十四籤的平安護念形式，轉作地藏王菩薩安魂、解厄與修心語境。',
        completenessNote: '24 首完整可抽；此為 App 內建白話整理版。',
        strengths: ['苦厄化解', '家族和解', '安心護念'],
        sourceType: '觀音二十四籤脈絡 + App 白話修訂',
        editionNote: '採二十四籤架構，搭配地藏大願與安定身心語境。',
        suitabilityNote: '適合問失落、家族牽掛、冤親和解、心結與平安。',
        versionTag: 'guanyin-24-dizang-app-v1',
      });
    default:
      return defaultEntry;
  }
}
