import { getYuelaoEdition, type YuelaoEdition } from './yuelaoEdition';

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
  sourceNote: '100 首全文經逐首比對 fortune-poems.blogspot.com、stellarnier.com、fate.superd.org 等多個獨立公開來源，確認與行天宮、城隍廟等廟宇通用之雷雨師百首（關聖帝君靈籤）傳統籤文逐字吻合。',
  completenessNote: '100 首筆數完整，每首皆已補齊吉凶、白話、典故與七類解曰；日後可補廟宇流傳版本異文。',
  strengths: ['事業決策', '功名學業', '長線規劃'],
  sourceType: '傳統籤系（雷雨師百首全文逐字沿用）',
  editionNote: '籤詩原文以台灣廟宇現行版本為準（2026-07-17 稽核）；2026-10-17 再以《正統道藏・護國嘉濟江東王靈籤》（明代刊本，同一套籤）與台灣好廟網版本三方比對，修正 7 首中台灣版與道藏一致、唯獨本 App 不同的錯字（#26、#35、#38、#39、#59、#74、#76）。其餘 116 處屬明代刊本與台灣現行版本的版本差異，依台灣版保留。白話、典故與各類解曰由本 App 撰寫。',
  suitabilityNote: '適合問事業、功名、長期方向與需要權衡吉凶的題目。',
  versionTag: 'leiyushi-100-verified-v4',
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

const yuelaoTaiwanEntry = entry({
  label: '月老靈籤・台灣版',
  totalPoems: 100,
  sourceNote: '新竹普天宮「月老聖籤一百籤」，籤號依台灣好廟網（temples.tw）收錄。籤文為一百則經典名句與俗語，出自《詩經》、四書、《左傳》、《西廂記》、唐宋詩詞等。',
  completenessNote: '100 首筆數完整；籤號排序目前只有台灣好廟網一個來源。籤本未標吉凶，一律以「籤本未標」呈現，不另行判定。',
  strengths: ['姻緣桃花', '交往時機', '婚嫁抉擇'],
  sourceType: '廟宇籤系（新竹普天宮月老聖籤）',
  editionNote: '與香港版是同一批名句，籤號排序不同。網站籤文錯字凡可考出處者依原典定字（逐首紀錄見 docs/yuelao-oracle-editions.md），出處未明者保留籤本文字。白話、出處說明與七類解曰由本 App 撰寫。2026-10-19 取代原本借用六十甲子籤的「月老姻緣籤」。',
  suitabilityNote: '適合問曖昧、交往、復合、婚嫁與是否該主動表達。',
  versionTag: 'yuelao-taiwan-putian-100-v1',
});

const yuelaoHongKongEntry = entry({
  label: '月老靈簽・香港版',
  totalPoems: 101,
  sourceNote: '香港通行「月老靈簽」一百零一簽，第 101 簽為簽王；籤號與吉凶依 golla.tw 與 hkir.com 收錄（兩站錯字相同，屬同一來源）。',
  completenessNote: '101 簽筆數完整；籤號與吉凶目前只有一個來源，籤文已用原典校正。',
  strengths: ['姻緣桃花', '交往時機', '婚嫁抉擇'],
  sourceType: '香港通行籤系（月老靈簽）',
  editionNote: '與台灣版是同一批名句，籤號排序不同，另有簽王一首。網站籤文錯字凡可考出處者依原典定字（逐首紀錄見 docs/yuelao-oracle-editions.md），出處未明者保留籤本文字。白話、出處說明與七類解曰由本 App 撰寫，兩版共用。',
  suitabilityNote: '適合問曖昧、交往、復合、婚嫁與是否該主動表達。',
  versionTag: 'yuelao-hongkong-101-v1',
});

export function getOracleCatalogByGodId(godId?: number | null, yuelaoEdition?: YuelaoEdition): OracleCatalogEntry {
  switch (godId) {
    case 1:
    case 16:
      return leiyushiEntry;
    case 2:
      return entry({
        label: '觀音靈籤',
        totalPoems: 100,
        sourceNote: '100 首全文經逐首比對 fortune-poems.blogspot.com 等多個獨立公開來源，確認與龍山寺、潭水亭等觀音廟宇通用之觀音靈籤百首傳統籤文逐字吻合。',
        completenessNote: '100 首筆數完整，每首皆已補齊吉凶、白話、典故與七類解曰；日後可補寺廟版本差異。',
        strengths: ['感情因緣', '內在狀態', '困局轉念'],
        sourceType: '傳統籤系（觀音靈籤百首全文逐字沿用）',
        editionNote: '籤詩原文為 2026-07-17 經完整稽核後的權威版本，100 首全數與公開傳統來源吻合；白話、典故與各類解曰由本 App 撰寫。',
        suitabilityNote: '適合問平安、感情、身心狀態、困局如何轉念。',
        versionTag: 'guanyin-100-verified-v3',
      });
    case 3:
      return entry({
        label: '媽祖天后籤（六十甲子）',
        totalPoems: 60,
        sourceNote: '底本為六十甲子籤（媽祖廟、王爺廟、天公廟等廟宇通用之傳統籤系，籤文逐字沿用），加入媽祖護航、家宅與出行平安的白話解讀層。',
        completenessNote: '60 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依媽祖信仰改寫。',
        strengths: ['出行平安', '家庭照應', '遠行轉折'],
        sourceType: '傳統籤系（六十甲子籤）+ 媽祖專屬白話解讀',
        editionNote: '六十甲子原籤不改，新增媽祖聖示向標題、典故前言與分類解曰。',
        suitabilityNote: '適合問旅程、搬遷、家人平安、遠方消息與是否順風推進。',
        versionTag: 'mazu-jiazi-60-focused-v2',
      });
    case 4:
    case 17:
    case 20:
    case 23:
    case 24:
    case 25:
    case 34:
    case 35:
    case 37:
    case 41:
    case 42:
    case 43:
    case 44:
    case 45:
    case 46:
    case 47:
    case 48:
    case 50:
    case 51:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
      return jiaziEntry;
    case 5:
    case 21:
      return entry({
        label: '保生大帝靈籤',
        totalPoems: 100,
        sourceNote: '底本為雷雨師百首（行天宮等廟宇通用之傳統籤系，籤文逐字沿用），加入保生大帝身心調養、復原節奏與照護安排的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依保生信仰改寫，避免提供具體藥方。',
        strengths: ['健康身體', '復原調養', '照護安排'],
        sourceType: '傳統籤系（雷雨師百首）+ 保生專屬白話解讀',
        editionNote: '雷雨師原籤不改，新增保生醫籤向標題、典故前言與健康解曰，重點放在求醫、休養與照護決策。',
        suitabilityNote: '適合問身心調養、醫療選擇前的心態整理、生活節律與復原方向。',
        versionTag: 'baosheng-leiyushi-100-focused-v2',
      });
    case 6:
      return entry({
        label: '土地公厚德籤',
        totalPoems: 60,
        sourceNote: '底本為六十甲子籤（土地公廟等廟宇通用之傳統籤系，籤文逐字沿用），加入福德正神家宅、生意與招財的白話解讀層。',
        completenessNote: '60 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依福德信仰改寫。',
        strengths: ['財務盤點', '家宅平安', '生意興隆'],
        sourceType: '傳統籤系（六十甲子籤）+ 福德正神專屬白話解讀',
        editionNote: '六十甲子原籤不改，新增土地厚德向標題、典故前言與財務解曰。',
        suitabilityNote: '適合問財務、買賣、家宅平安與資源是否該投入。',
        versionTag: 'fudezhengshen-jiazi-60-focused-v1',
      });
    case 22:
      return entry({
        label: '三官賜福籤',
        totalPoems: 60,
        sourceNote: '底本為六十甲子籤（天公廟等廟宇通用之傳統籤系，籤文逐字沿用），加入三官大帝賜福、赦罪、解厄的白話解讀層。',
        completenessNote: '60 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依三官信仰改寫。',
        strengths: ['祈福解厄', '年運消災', '懺悔化解'],
        sourceType: '傳統籤系（六十甲子籤）+ 三官大帝專屬白話解讀',
        editionNote: '六十甲子原籤不改，新增三官賜福向標題、典故前言與消災解曰。',
        suitabilityNote: '適合問年度運勢、消災解厄與化解災厄的心態整理。',
        versionTag: 'sanguan-jiazi-60-focused-v1',
      });
    case 7:
      return entry({
        label: '注生堂靈籤',
        totalPoems: 64,
        sourceNote: '出自《正統道藏》《靈濟真君注生堂靈籤》（Kanripo 漢籍リポジトリ數位版 KR5g0111，底本為三家本）。原為靈濟真君（徐仙）信仰中的求嗣籤，64 首全以求子、安胎、生產為主題，與主掌生育的註生娘娘相合。',
        completenessNote: '64 首筆數完整；第 64 籤原典未標吉凶，以「原典未標」呈現，不另行判定。孕育與健康解讀僅作民俗參考，請以專業醫療意見為準。',
        strengths: ['求子因緣', '安胎待產', '家庭祝福'],
        sourceType: '原典籤系（《正統道藏》靈濟真君注生堂靈籤）',
        editionNote: '籤文與吉凶依原典，古字形轉為通行繁體。原典無籤題與解曰，籤題、白話、典故說明與七類解曰由本 App 撰寫，並說明熊羆、虺蛇、弄璋、弄瓦等傳統求嗣意象。2026-10-17 取代原本借用觀音靈籤的「註生送子籤」。',
        suitabilityNote: '適合問求子、備孕、孕期與待產的心情與準備；醫療問題請以醫師建議為準。',
        versionTag: 'zhusheng-daozang-64-v1',
      });
    case 8:
    case 32:
      return entry({
        label: '文昌功名百籤',
        totalPoems: 100,
        sourceNote: '以雷雨師百首 App 修訂版為骨幹，新增文昌帝君功名、考試、文書與學習方法的專屬解讀層。',
        completenessNote: '100 首完整可抽；專屬解讀層已獨立版本化，並明確標示非特定文昌廟唯一定本。',
        strengths: ['學業考試', '功名文書', '職涯精進'],
        sourceType: '傳統籤系骨幹 + 文昌專屬白話解讀',
        editionNote: '保留原籤號與吉凶，新增文昌策問標題、典故前言、學業專解與版本標記。',
        suitabilityNote: '適合問考試準備、學習節奏、文書申請、升遷與專業能力累積。',
        versionTag: 'wenchang-leiyushi-100-focused-v1',
      });    case 9:
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
        label: '玄天上帝感應靈籤',
        totalPoems: 49,
        sourceNote: '出自《正統道藏》續道藏《玄天上帝百字聖號》所附〈玄天上帝感應靈籤〉（DZ1482，明萬曆三十五年刊；本 App 依 Kanripo 漢籍リポジトリ數位版 KR5h0052，底本為三家本）。原典每籤另有謀望、家宅、婚姻、失物、官事、行人、占病七類詩與「解曰」。',
        completenessNote: '49 首筆數完整；第 21 籤原典缺「行人」詩，第 40 籤原典缺一字（以「□」保留），少數疑似刻誤依原典保留原貌。',
        strengths: ['鎮宅消災', '謀望進退', '官事是非'],
        sourceType: '原典籤系（《正統道藏》玄天上帝感應靈籤）',
        editionNote: '籤文、吉凶與籤題依原典，古字形轉為通行繁體；典故說明為原典「解曰」（斷句由本 App 加上）；白話與七類解曰由本 App 依原典解曰與七類詩撰寫。2026-10-17 取代原本使用的二十八宿值日歌訣（擇日口訣，非籤詩）。',
        suitabilityNote: '適合問家宅平安、謀望進退、官事是非、行人消息與疾病調養。',
        versionTag: 'xuantian-daozang-49-v1',
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
      return (yuelaoEdition ?? getYuelaoEdition()) === 'hongkong' ? yuelaoHongKongEntry : yuelaoTaiwanEntry;
    case 14:
      return entry({
        label: '城隍明鑑籤（雷雨師）',
        totalPoems: 100,
        sourceNote: '底本為雷雨師百首（城隍廟等廟宇通用之傳統籤系，籤文逐字沿用），加入城隍明察、司法與公道的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依城隍信仰改寫。',
        strengths: ['官司是非', '合約文書', '公道判斷'],
        sourceType: '傳統籤系（雷雨師百首）+ 城隍爺專屬白話解讀',
        editionNote: '雷雨師原籤不改，新增城隍明鑑向標題、典故前言與公道解曰。',
        suitabilityNote: '適合問合約、法律、冤屈、責任歸屬、是非口舌與界線。',
        versionTag: 'chenghuang-leiyushi-100-focused-v2',
      });
    case 15:
      return entry({
        label: '純陽指路籤',
        totalPoems: 100,
        sourceNote: '底本為雷雨師百首（文武廟等廟宇通用之傳統籤系，籤文逐字沿用），加入呂洞賓修心、功名與身心清明的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依呂祖信仰改寫。',
        strengths: ['功名學業', '感情取捨', '修心明志'],
        sourceType: '傳統籤系（雷雨師百首）+ 呂洞賓專屬白話解讀',
        editionNote: '雷雨師原籤不改，新增純陽指路向標題、典故前言與取捨解曰。',
        suitabilityNote: '適合問考試功名、感情是否該斷或續、身心清明與人生取捨。',
        versionTag: 'luzu-leiyushi-100-focused-v2',
      });
    case 18:
      return entry({
        label: '金母慈光籤（觀音）',
        totalPoems: 100,
        sourceNote: '底本為觀音靈籤（觀音廟宇通用之傳統籤系，籤文逐字沿用），加入瑤池金母慈悲護念、家庭和合的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依金母信仰改寫。',
        strengths: ['家庭和合', '身心安定', '貴人助力'],
        sourceType: '傳統籤系（觀音靈籤）+ 瑤池金母專屬白話解讀',
        editionNote: '觀音原籤不改，新增金母慈示向標題、典故前言與和合解曰。',
        suitabilityNote: '適合問家庭、心性、貴人、女性長輩緣與溫和轉念。',
        versionTag: 'jinmu-guanyin-100-focused-v2',
      });
    case 19:
      return entry({
        label: '地藏大願籤（觀音）',
        totalPoems: 100,
        sourceNote: '底本為觀音靈籤（觀音廟宇通用之傳統籤系，籤文逐字沿用），加入地藏王菩薩安魂、解厄與修心的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依地藏信仰改寫。',
        strengths: ['苦厄化解', '家族和解', '安心護念'],
        sourceType: '傳統籤系（觀音靈籤）+ 地藏王專屬白話解讀',
        editionNote: '觀音原籤不改，新增地藏願行向標題、典故前言與安心解曰。',
        suitabilityNote: '適合問失落、家族牽掛、冤親和解、心結與平安。',
        versionTag: 'dizang-guanyin-100-focused-v2',
      });
    case 26:
      return entry({
        label: '五路聚財籤',
        totalPoems: 100,
        sourceNote: '底本為雷雨師百首（傳統籤系，籤文逐字沿用），加入玄壇元帥趙公明護商、守信、聚財的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依財神信仰改寫，不構成投資建議。',
        strengths: ['生意財運', '合作合約', '資源風險'],
        sourceType: '傳統籤系（雷雨師百首）+ 趙公明專屬白話解讀',
        editionNote: '雷雨師原籤不改，新增玄壇聚財向標題、典故前言與財務解曰，聚焦正財、信用與風險節制。',
        suitabilityNote: '適合問生意、合作、財務配置、守財與是否適合擴張。',
        versionTag: 'zhaogongming-leiyushi-100-focused-v2',
      });
    case 27:
      return entry({
        label: '虎威護境籤',
        totalPoems: 60,
        sourceNote: '底本為六十甲子籤（傳統籤系，籤文逐字沿用），加入虎爺守廟、護童、鎮煞的白話解讀層。',
        completenessNote: '60 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依虎爺信仰改寫。',
        strengths: ['家宅安全', '孩童守護', '守財避險'],
        sourceType: '傳統籤系（六十甲子籤）+ 虎爺專屬白話解讀',
        editionNote: '六十甲子原籤不改，新增虎威護境向標題、典故前言與安全解曰，不取代醫療或安全專業判斷。',
        suitabilityNote: '適合問家宅、孩童、環境安全、避險與求財節奏。',
        versionTag: 'huye-jiazi-60-focused-v2',
      });
    case 28:
      return entry({
        label: '玄女兵法籤',
        totalPoems: 100,
        sourceNote: '底本為雷雨師百首（傳統籤系，籤文逐字沿用），加入九天玄女智慧、兵法與策略布局的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依玄女信仰改寫。',
        strengths: ['事業布局', '競爭策略', '危機判斷'],
        sourceType: '傳統籤系（雷雨師百首）+ 九天玄女專屬白話解讀',
        editionNote: '雷雨師原籤不改，新增九天授策向標題、典故前言與策略解曰，聚焦全局、進退與資源配置。',
        suitabilityNote: '適合問競爭、團隊、創業策略、危機處理與行動時機。',
        versionTag: 'jiutianxuannu-leiyushi-100-focused-v2',
      });
    case 29:
      return entry({
        label: '太歲鎮年籤',
        totalPoems: 60,
        sourceNote: '底本為六十甲子籤（傳統籤系，籤文逐字沿用），加入值年太歲流年秩序、風險防範的白話解讀層。',
        completenessNote: '60 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依太歲信仰改寫，不代替正式安太歲科儀。',
        strengths: ['年度規劃', '流年風險', '元辰安定'],
        sourceType: '傳統籤系（六十甲子籤）+ 太歲星君專屬白話解讀',
        editionNote: '六十甲子原籤不改，新增太歲鎮年向標題、典故前言與年運解曰，以守規律、留緩衝為核心。',
        suitabilityNote: '適合問年度安排、重大變動、健康作息與財務緩衝。',
        versionTag: 'taisui-jiazi-60-focused-v2',
      });
    case 30:
      return entry({
        label: '衛房聖母靈應寶籤',
        totalPoems: 99,
        sourceNote: '出自《正統道藏》正一部《大慈好生九天衛房聖母元君靈應寶籤》（DZ1300；Kanripo 漢籍リポジトリ數位版 KR5g0109，底本為三家本）。原為九天衛房聖母元君信仰中的求嗣安產籤，99 首以孕產、母子平安與孝親修善為主題，與護佑婦幼的臨水夫人相合。',
        completenessNote: '99 首筆數完整；原典未標吉凶，一律以「原典未標」呈現，不另行判定；第 28 籤原典缺一字，以「□」保留。孕產與健康解讀僅作民俗參考，請以專業醫療意見為準。',
        strengths: ['安胎待產', '母子平安', '孝親修善'],
        sourceType: '原典籤系（《正統道藏》九天衛房聖母元君靈應寶籤）',
        editionNote: '籤文與解曰依原典，古字形轉為通行繁體，解曰斷句為本 App 所加。原典無籤題與白話，籤題、白話與七類解曰由本 App 撰寫；原典部分籤文含勸孝、因果警示，白話保留原意並提醒疾病非個人罪過。2026-10-19 取代原本借用觀音靈籤的「臨水護幼籤」。',
        suitabilityNote: '適合問安胎、待產、母子平安與家庭孝親；醫療問題請以醫師建議為準。',
        versionTag: 'linshuifuren-daozang-weifang-99-v1',
      });
    case 31:
      return entry({
        label: '義民忠義籤',
        totalPoems: 60,
        sourceNote: '底本為六十甲子籤（傳統籤系，籤文逐字沿用），加入臺灣客家義民忠義、守土、團結的白話解讀層。',
        completenessNote: '60 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依義民信仰改寫。',
        strengths: ['團隊責任', '地方守護', '公共公義'],
        sourceType: '傳統籤系（六十甲子籤）+ 義民爺專屬白話解讀',
        editionNote: '六十甲子原籤不改，新增義民守土向標題、典故前言與責任解曰，聚焦共同利益與長期團結。',
        suitabilityNote: '適合問地方事務、團隊、家園、共同資源與責任。',
        versionTag: 'yiminye-jiazi-60-focused-v2',
      });
    case 33:
      return entry({
        label: '藥師護念籤',
        totalPoems: 100,
        sourceNote: '底本為觀音靈籤（傳統籤系，籤文逐字沿用），加入藥師佛身心安定、智慧求醫的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依藥師信仰改寫，不取代醫療診斷與治療。',
        strengths: ['健康照護', '求醫心態', '復原規律'],
        sourceType: '傳統籤系（觀音靈籤）+ 藥師佛專屬白話解讀',
        editionNote: '觀音原籤不改，新增藥師護念向標題、典故前言與照護解曰，聚焦合理求醫與情緒安定。',
        suitabilityNote: '適合問照護安排、健康焦慮、復原作息與家庭支持。',
        versionTag: 'medicinebuddha-guanyin-100-focused-v2',
      });
    case 36:
      return entry({
        label: '瑤池賜福籤',
        totalPoems: 100,
        sourceNote: '底本為觀音靈籤（傳統籤系，籤文逐字沿用），加入瑤池王母娘娘長壽、和合與圓滿的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依王母信仰改寫。',
        strengths: ['家庭和合', '長壽健康', '姻緣圓滿'],
        sourceType: '傳統籤系（觀音靈籤）+ 王母娘娘專屬白話解讀',
        editionNote: '觀音原籤不改，新增瑤池賜福向標題、典故前言與和合解曰，聚焦家庭、健康與福緣。',
        suitabilityNote: '適合問家庭關係、長輩健康、姻緣發展與福分累積。',
        versionTag: 'wangmu-guanyin-100-focused-v1',
      });
    case 38:
      return entry({
        label: '東嶽鎮嶽籤',
        totalPoems: 100,
        sourceNote: '底本為觀音靈籤（傳統籤系，籤文逐字沿用），加入東嶽仁聖大帝延壽、消災與家運的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依東嶽信仰改寫。',
        strengths: ['家運昌隆', '延壽增福', '消災解厄'],
        sourceType: '傳統籤系（觀音靈籤）+ 東嶽大帝專屬白話解讀',
        editionNote: '觀音原籤不改，新增東嶽鎮嶽向標題、典故前言與家運解曰，聚焦安穩、因果與大方向。',
        suitabilityNote: '適合問家運方向、長輩福壽、重大決策與消災解厄。',
        versionTag: 'dongyue-guanyin-100-focused-v1',
      });
    case 39:
      return entry({
        label: '閻羅明鑑籤',
        totalPoems: 100,
        sourceNote: '底本為觀音靈籤（傳統籤系，籤文逐字沿用），加入閻羅天子陰律、因果與超拔的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依閻羅信仰改寫。',
        strengths: ['善惡分明', '超拔先亡', '化解冤業'],
        sourceType: '傳統籤系（觀音靈籤）+ 閻羅天子專屬白話解讀',
        editionNote: '觀音原籤不改，新增閻羅明鑑向標題、典故前言與因果解曰，聚焦善惡、業障與化解。',
        suitabilityNote: '適合問因果業力、先人超度、是非對錯與消災解厄。',
        versionTag: 'yanluo-guanyin-100-focused-v1',
      });
    case 40:
      return entry({
        label: '酆都鎮冥籤',
        totalPoems: 100,
        sourceNote: '底本為觀音靈籤（傳統籤系，籤文逐字沿用），加入酆都大帝冥府、超度與陰陽調理的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依酆都信仰改寫。',
        strengths: ['陰陽調理', '超度先亡', '化解陰債'],
        sourceType: '傳統籤系（觀音靈籤）+ 酆都大帝專屬白話解讀',
        editionNote: '觀音原籤不改，新增酆都鎮冥向標題、典故前言與陰陽解曰，聚焦超度、冥府事務與平安。',
        suitabilityNote: '適合問先人超度、陰陽調理、家宅冥事與化解陰債。',
        versionTag: 'fengdu-guanyin-100-focused-v1',
      });
    case 49:
      return entry({
        label: '太陰月華籤',
        totalPoems: 100,
        sourceNote: '底本為觀音靈籤（傳統籤系，籤文逐字沿用），加入太陰娘娘姻緣、女性與月光守護的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依太陰信仰改寫。',
        strengths: ['姻緣美滿', '女性守護', '美容安產'],
        sourceType: '傳統籤系（觀音靈籤）+ 太陰娘娘專屬白話解讀',
        editionNote: '觀音原籤不改，新增太陰月華向標題、典故前言與姻緣解曰，聚焦感情、女性健康與家庭和諧。',
        suitabilityNote: '適合問感情姻緣、女性健康、美容安產與家庭圓融。',
        versionTag: 'taiyin-guanyin-100-focused-v1',
      });
    case 58:
      return entry({
        label: '佛陀般若籤',
        totalPoems: 100,
        sourceNote: '底本為觀音靈籤（傳統籤系，籤文逐字沿用），加入釋迦牟尼佛慈悲智慧、煩惱解脫與心靈指引的白話解讀層。',
        completenessNote: '100 首完整可抽；籤詩原文為傳統定本，解讀層為 App 依佛陀信仰改寫，重在心靈啟發而非神通感應。',
        strengths: ['智慧開悟', '煩惱解脫', '慈悲增長'],
        sourceType: '傳統籤系（觀音靈籤）+ 釋迦牟尼佛專屬白話解讀',
        editionNote: '觀音原籤不改，新增佛陀般若向標題、典故前言與智慧解曰，聚焦轉念、覺察與身心安定。',
        suitabilityNote: '適合問心靈成長、人生方向、煩惱轉化與智慧啟發。',
        versionTag: 'shijiamouni-guanyin-100-focused-v1',
      });
    case 52:
      return entry({
        label: '黃大仙靈籤',
        totalPoems: 100,
        sourceNote: '香港嗇色園黃大仙祠專屬籤系，相傳為黃初平扶乩所作。100 首籤文、吉凶與古人典故籤題經 m.hkir.com、golla.tw、hktemple88.blogspot.com 三個獨立公開來源逐字比對，以多數決定案。',
        completenessNote: '100 首筆數完整；少數兩個來源共有的簡轉繁誤字（如「出中七日」應為「山中七日」）已改採正確版本。日後可再以嗇色園官方籤書核對。',
        strengths: ['指點迷津', '事業抉擇', '家宅平安'],
        sourceType: '傳統籤系（黃大仙靈籤百首）',
        editionNote: '籤文、吉凶、籤題為 2026-10-16 三方比對版本；白話、典故說明與七類解曰由本 App 依傳統「仙機」改寫，非籤書原文。',
        suitabilityNote: '適合問人生方向、事業抉擇、困境如何化解與家宅平安。',
        versionTag: 'huangdaxian-100-verified-v1',
      });
    case 59:
      return entry({
        label: '車公靈籤',
        totalPoems: 96,
        sourceNote: '香港沙田車公廟專屬籤系，共 96 首七言四句。籤文經 qian.time.actor、hktemple88.blogspot.com、sheup.org 三個獨立公開來源逐字比對，差異僅為異體字。',
        completenessNote: '96 首筆數完整；原籤只分上（35）、中（44）、下（17）三等，App 對應為上吉／中平／下下，原等第標註於典故說明開頭。',
        strengths: ['年度運勢', '轉運開局', '出入平安'],
        sourceType: '傳統籤系（車公靈籤九十六首）',
        editionNote: '籤文與等第為 2026-10-16 三方比對版本；車公籤原無籤題，籤題為 App 依籤意擬定；白話與七類解曰由本 App 依傳統「解曰／斷籤」改寫。',
        suitabilityNote: '適合問年度運勢、困局能否扭轉、出行與新計畫是否順利。',
        versionTag: 'chegong-96-verified-v1',
      });
    default:
      return defaultEntry;
  }
}
