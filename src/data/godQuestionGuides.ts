export interface GodQuestionGuide {
  title: string;
  intro: string;
  preferredCategories: string[];
  steps: string[];
  prompts: { category: string; text: string }[];
}

const defaultGuide: GodQuestionGuide = {
  title: '先把問題收成一件事',
  intro: '求籤前先定下主題、時間範圍與你真正想確認的下一步，籤意會更集中。',
  preferredCategories: ['general', 'career', 'love'],
  steps: ['先說明事件', '加上近期或三個月內', '問下一步或是否宜推進'],
  prompts: [
    { category: 'general', text: '關於我近期最在意的這件事，下一步應該先確認什麼？' },
    { category: 'career', text: '我在未來三個月是否適合主動推進目前的工作計畫？' },
    { category: 'love', text: '這段關係近期是否適合繼續投入，還是先放慢腳步？' },
  ],
};

const guides: Record<number, GodQuestionGuide> = {
  1: {
    title: '關聖帝君問事法',
    intro: '適合問事業、是非、合作與重大決策；問題越正直具體，越容易得到清楚提醒。',
    preferredCategories: ['career', 'wealth', 'general'],
    steps: ['先說明責任或選擇', '問是否合乎正道', '請示下一步該守或該進'],
    prompts: [
      { category: 'career', text: '關於目前的工作選擇，我近期應該主動承擔還是先守穩本分？' },
      { category: 'wealth', text: '這個合作或財務決定，是否符合長遠正道與穩健利益？' },
      { category: 'general', text: '面對眼前的是非與壓力，我最該守住的原則是什麼？' },
    ],
  },
  2: {
    title: '觀音菩薩問事法',
    intro: '適合問感情、平安、身心狀態與困局轉念；把痛點說清楚，菩薩的提醒會更柔和可用。',
    preferredCategories: ['love', 'health', 'family'],
    steps: ['先說明牽掛', '問如何放下或修復', '請示最慈悲的下一步'],
    prompts: [
      { category: 'love', text: '關於這段關係，我近期最該放下什麼、又該珍惜什麼？' },
      { category: 'health', text: '面對目前的身心壓力，我近期最需要調整的是什麼？' },
      { category: 'family', text: '關於家人之間的相處，我現在適合主動和解還是先安定自己？' },
    ],
  },
  5: {
    title: '保生大帝問事法',
    intro: '適合問健康、復原、作息與照護安排；請把症狀、壓力或生活習慣放進問題裡。',
    preferredCategories: ['health', 'family', 'general'],
    steps: ['先描述身心狀態', '加上近期照護目標', '問最該先調整的生活環節'],
    prompts: [
      { category: 'health', text: '關於我近期的身心狀態，最該優先調整作息、飲食還是情緒壓力？' },
      { category: 'health', text: '若我接下來三十天好好調養，目前狀態是否有機會穩定改善？' },
      { category: 'family', text: '面對家人的健康照護，我近期最該注意哪個安排？' },
    ],
  },
  8: {
    title: '文昌帝君問事法',
    intro: '適合問考試、學習、升遷與寫作表達；把目標和期限說出來，建議會更像讀書計畫。',
    preferredCategories: ['study', 'career', 'general'],
    steps: ['先說目標與期限', '問該補強哪一塊', '請示讀書或準備節奏'],
    prompts: [
      { category: 'study', text: '關於近期考試或學習目標，我最該先補強哪個部分？' },
      { category: 'career', text: '若我準備升遷或轉職，近期最該累積哪項能力？' },
      { category: 'study', text: '未來三個月我適合衝刺進度，還是先穩固基礎？' },
    ],
  },
  9: {
    title: '孔明神數問事法',
    intro: '適合問策略、方案選擇與風險；先在心中定題，再報一數，重點是看局勢與下一步。',
    preferredCategories: ['career', 'wealth', 'general'],
    steps: ['先列出你正在權衡的方案', '報一個直覺浮現的數字', '把卦意用在風險與策略'],
    prompts: [
      { category: 'career', text: '在目前兩個方向之間，我近期應該選擇哪種策略較穩？' },
      { category: 'wealth', text: '關於這個投資或資源安排，我最需要避開的風險是什麼？' },
      { category: 'general', text: '面對眼前局勢，我下一步該攻、該守，還是先觀察？' },
    ],
  },
  11: {
    title: '濟公活佛問事法',
    intro: '適合問卡關、心結、想不通的人事物；不必太拘束，但問題要誠實。',
    preferredCategories: ['general', 'love', 'career'],
    steps: ['先承認卡住的點', '問自己執著在哪裡', '請示換角度的一步'],
    prompts: [
      { category: 'general', text: '我現在最想不通的這件事，真正卡住我的執著是什麼？' },
      { category: 'love', text: '面對這段關係的糾結，我該放下、溝通，還是先看清自己？' },
      { category: 'career', text: '目前工作卡關時，我該換方法、換心態，還是先暫緩？' },
    ],
  },
  12: {
    title: '三太子問事法',
    intro: '適合問突破、創意、行動與衝刺；把目標說明白，請示什麼時候衝、哪裡要煞車。',
    preferredCategories: ['career', 'study', 'general'],
    steps: ['先說你想突破的關卡', '問該衝刺或先準備', '請示最小可行行動'],
    prompts: [
      { category: 'career', text: '關於我想突破的工作目標，近期適合主動衝刺還是先補裝備？' },
      { category: 'study', text: '接下來一個月我該用什麼節奏衝刺學習或考試？' },
      { category: 'general', text: '面對眼前難關，我第一個該出手的行動是什麼？' },
    ],
  },
  13: {
    title: '月老問事法',
    intro: '適合問曖昧、復合、正緣、相處與婚姻；問題請聚焦一段關係或一個互動狀態。',
    preferredCategories: ['love', 'family', 'general'],
    steps: ['先說明關係狀態', '問近期是否宜主動', '請示相處方式與界線'],
    prompts: [
      { category: 'love', text: '關於我和對方目前的互動，近期適合主動表達還是先觀察？' },
      { category: 'love', text: '這段關係未來三個月是否有機會往穩定方向發展？' },
      { category: 'love', text: '若想修復這段關係，我現在最該調整的相處方式是什麼？' },
    ],
  },
  14: {
    title: '城隍爺問事法',
    intro: '適合問是非、公道、合約、官司與人際邊界；請把事實講清楚，不要只問輸贏。',
    preferredCategories: ['career', 'family', 'general'],
    steps: ['先說清楚爭點', '問是非與責任', '請示如何保護自己且不失正道'],
    prompts: [
      { category: 'career', text: '面對目前的是非或合約問題，我近期最該留意哪個風險？' },
      { category: 'family', text: '關於家中這件爭執，怎麼做才比較公平且能保護彼此？' },
      { category: 'general', text: '這件事的是非責任，我現在應該如何看清並穩妥處理？' },
    ],
  },
  16: {
    title: '玉皇上帝問事法',
    intro: '適合問年度方向、重大決策、家運與整體福分；問題宜莊重、範圍清楚。',
    preferredCategories: ['general', 'career', 'family'],
    steps: ['先稟明大方向', '說明時間範圍', '請示該順天時推進或先修整'],
    prompts: [
      { category: 'general', text: '關於我未來一年的整體方向，現在最該先穩住哪件事？' },
      { category: 'career', text: '這個重大決策是否合天時，近期適合推進還是先等待？' },
      { category: 'family', text: '關於家運與家中平安，近期最需要注意什麼？' },
    ],
  },
  17: {
    title: '清水祖師問事法',
    intro: '適合問消災解厄、護境與事業穩定；把困厄或卡點說清楚。',
    preferredCategories: ['general', 'career', 'family'],
    steps: ['先說困厄來源', '問該避或該解', '請示最穩的修整步驟'],
    prompts: [
      { category: 'general', text: '面對目前的困厄，我應該先避開什麼風險？' },
      { category: 'career', text: '目前事業適合守穩、調整，還是慢慢推進？' },
      { category: 'family', text: '家宅或家庭氣氛近期該如何安定？' },
    ],
  },
  18: {
    title: '瑤池金母問事法',
    intro: '適合問家庭和合、身心安定、貴人與長輩緣；問題可柔和但要具體。',
    preferredCategories: ['family', 'health', 'love'],
    steps: ['先說心中牽掛', '問如何和合或安定', '請示可借力的貴人與節奏'],
    prompts: [
      { category: 'family', text: '關於家中目前的相處，我最該先調和哪個部分？' },
      { category: 'health', text: '面對近期身心不安，我該如何先把自己穩住？' },
      { category: 'love', text: '這段關係是否需要更柔和的溝通方式？' },
    ],
  },
  19: {
    title: '地藏王菩薩問事法',
    intro: '適合問心結、家族牽掛、失落與長期壓力；重點不是快，而是安定與願心。',
    preferredCategories: ['general', 'family', 'health'],
    steps: ['先承認心結', '問如何安放與修補', '請示當下可做的善行或和解'],
    prompts: [
      { category: 'general', text: '我心中這個長期放不下的牽掛，現在該如何安放？' },
      { category: 'family', text: '關於家族或親人的牽掛，我能先做什麼修補？' },
      { category: 'health', text: '這段壓力對身心的影響，我該如何慢慢調整？' },
    ],
  },
  20: {
    title: '溫府千歲問事法',
    intro: '適合問排障、除煞、阻力與家宅平安；問題宜直接，不要繞太遠。',
    preferredCategories: ['general', 'career', 'family'],
    steps: ['先說卡住的事', '問阻力來源', '請示先排除哪個風險'],
    prompts: [
      { category: 'general', text: '目前這件事的阻力主要來自哪裡，我該先避開什麼？' },
      { category: 'career', text: '工作上的卡關是否適合先排障再推進？' },
      { category: 'family', text: '家宅或家人近期是否需要特別留意平安？' },
    ],
  },
  21: {
    title: '神農大帝問事法',
    intro: '適合問健康、飲食、作息、實業與長期耕耘；把身體狀態或資源條件說清楚。',
    preferredCategories: ['health', 'wealth', 'career'],
    steps: ['先描述現況', '問該調哪個生活或資源環節', '請示長期耕耘方式'],
    prompts: [
      { category: 'health', text: '關於近期健康與作息，我最該先調整哪個習慣？' },
      { category: 'wealth', text: '這個實業或資源投入是否值得長期耕耘？' },
      { category: 'career', text: '目前工作該先補基礎，還是可以逐步擴大？' },
    ],
  },
  22: {
    title: '三官大帝問事法',
    intro: '適合問祈福、解厄、年度運勢與資源分配；先反省責任，再請示轉機。',
    preferredCategories: ['general', 'wealth', 'family'],
    steps: ['先說欲求的福或欲解的厄', '問責任與可修之處', '請示如何累積福德'],
    prompts: [
      { category: 'general', text: '近期若想消災解厄，我最該先修正哪個部分？' },
      { category: 'wealth', text: '目前資源分配是否穩妥，哪裡需要收斂？' },
      { category: 'family', text: '家運與福德如何透過行動慢慢補足？' },
    ],
  },
  23: {
    title: '三山國王問事法',
    intro: '適合問遷移、安居、地方人和與根基；把地點、時間與人際條件放進問題。',
    preferredCategories: ['family', 'travel', 'career'],
    steps: ['先說地點或環境', '問根基是否穩', '請示人和與長期條件'],
    prompts: [
      { category: 'family', text: '關於目前居住或家業根基，近期最該先穩住什麼？' },
      { category: 'travel', text: '這次搬遷或移動是否有利於長期安定？' },
      { category: 'career', text: '這個地方或團隊是否適合我長期耕耘？' },
    ],
  },
  24: {
    title: '廣澤尊王問事法',
    intro: '適合問新局、青年與晚輩、事業開展；問題宜明快，並聚焦第一步行動。',
    preferredCategories: ['career', 'study', 'family'],
    steps: ['先說想打開的新局', '問是否有助力', '請示最合適的第一步'],
    prompts: [
      { category: 'career', text: '這個新計畫近期是否值得推進，第一步該做什麼？' },
      { category: 'study', text: '關於學習或能力開展，我接下來該先補哪一塊？' },
      { category: 'family', text: '家中晚輩或青年近期最需要哪種支持？' },
    ],
  },
  25: {
    title: '開漳聖王問事法',
    intro: '適合問創業、拓展、遷移與新環境開局；先列清資源與風險。',
    preferredCategories: ['career', 'travel', 'wealth'],
    steps: ['先說開局目標', '問資源是否足夠', '請示該先攻哪一段路'],
    prompts: [
      { category: 'career', text: '這個新案或創業方向是否適合現在開局？' },
      { category: 'travel', text: '搬遷或拓展到新環境，近期是否有利？' },
      { category: 'wealth', text: '開局所需資源是否足夠，哪個風險要先控管？' },
    ],
  },
};

export function getGodQuestionGuide(godId?: number | null): GodQuestionGuide {
  return godId && guides[godId] ? guides[godId] : defaultGuide;
}
