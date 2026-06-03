export interface GodProfile {
  aliases: string[];
  patronages: string[];
  suitableTopics: string[];
  worshipTips: string[];
}

export const godProfiles: Record<number, GodProfile> = {
  1: {
    aliases: ['關帝', '關聖帝君', '恩主公'],
    patronages: ['正義決斷', '事業關卡', '官司文書'],
    suitableTopics: ['是否要堅持原則', '合作對象是否可靠', '關鍵決策要不要出手'],
    worshipTips: ['問題要明確', '適合問是非曲直', '不適合過度反覆試問同一題'],
  },
  2: {
    aliases: ['觀音佛祖', '觀世音菩薩'],
    patronages: ['感情和合', '心性安定', '困局轉念'],
    suitableTopics: ['感情是否有轉圜', '當下應先放下還是先行動', '需要先安定哪個面向'],
    worshipTips: ['先整理情緒再問', '適合問因緣與內在選擇', '可搭配還願或行善願心'],
  },
  3: {
    aliases: ['天上聖母', '媽祖婆'],
    patronages: ['出行平安', '海運交通', '家庭照應'],
    suitableTopics: ['出遠門是否順利', '搬遷交通安排', '家人平安與照護'],
    worshipTips: ['適合問旅程與行程安排', '也常被拿來問家宅平安', '若是代問家人可在心中先稟明'],
  },
  4: {
    aliases: ['千歲爺', '代天巡狩'],
    patronages: ['化煞除穢', '地方事務', '是非阻隔'],
    suitableTopics: ['眼前阻力從哪來', '是否有隱性風險', '要先處理哪個卡點'],
    worshipTips: ['適合問卡關與干擾', '不確定方向時可先求排障', '問完後宜照建議減少衝動行動'],
  },
  5: {
    aliases: ['大道公', '保生大帝'],
    patronages: ['身心修復', '醫療判斷', '照護安排'],
    suitableTopics: ['療程節奏怎麼安排', '恢復期該注意什麼', '如何兼顧休養與工作'],
    worshipTips: ['醫療問題仍以專業意見優先', '籤意更適合輔助判斷節奏', '適合問保養與恢復方向'],
  },
  6: {
    aliases: ['土地公', '福德正神'],
    patronages: ['財務踏實', '店面生意', '地方人和'],
    suitableTopics: ['收入節奏能否穩住', '這筆投資值不值', '是否適合開店或調整位置'],
    worshipTips: ['很適合問務實財務題', '問題越貼近日常越準', '適合搭配還願與感謝'],
  },
  7: {
    aliases: ['註生娘娘', '註生媽'],
    patronages: ['子嗣因緣', '孕育照護', '家庭祝福'],
    suitableTopics: ['備孕節奏', '家庭期待如何協調', '照護安排如何更穩'],
    worshipTips: ['適合問家庭與孕育方向', '涉及醫療仍要配合專業', '可以用溫和、具體的提問方式'],
  },
  8: {
    aliases: ['文昌帝君', '梓潼帝君'],
    patronages: ['考試讀書', '表達文書', '升遷評核'],
    suitableTopics: ['考試準備先補哪塊', '轉職履歷是否成熟', '如何提升表達與成果'],
    worshipTips: ['適合問讀書方法和應試節奏', '問題可聚焦單一目標', '問完後最好立刻安排實作'],
  },
  9: {
    aliases: ['武侯', '諸葛武侯'],
    patronages: ['策略推演', '局勢觀察', '選項取捨'],
    suitableTopics: ['A/B 方案怎麼選', '風險藏在哪', '當下最該先做哪一步'],
    worshipTips: ['適合問策略題', '數字起卦時要專注', '問法越聚焦越有幫助'],
  },
};

export function getGodProfile(godId?: number | null): GodProfile | null {
  if (!godId) {
    return null;
  }

  return godProfiles[godId] ?? null;
}
