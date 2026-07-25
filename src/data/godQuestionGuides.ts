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
  26: {
    title: '玄壇元帥問事法',
    intro: '適合問正財、生意、合作與資源風險；先列成本、現金流與責任條件。',
    preferredCategories: ['wealth', 'career', 'general'],
    steps: ['說明財務目標', '列出成本與合作條件', '請示先守財或可開源'],
    prompts: [
      { category: 'wealth', text: '目前這項投入的財務風險，最需要先控制哪一項？' },
      { category: 'career', text: '這個合作是否值得推進，責任與利益該如何談清楚？' },
      { category: 'general', text: '眼前應先守住資源，還是可以逐步開拓？' },
    ],
  },
  27: {
    title: '虎爺問事法',
    intro: '適合問家宅、孩童、安全與守財；問題宜直接聚焦眼前風險。',
    preferredCategories: ['family', 'wealth', 'general'],
    steps: ['說明需要守護的人事物', '問風險來源', '請示先做哪個防護'],
    prompts: [
      { category: 'family', text: '家宅與家人近期最需要注意哪一項安全問題？' },
      { category: 'wealth', text: '目前求財時，最該避免哪種急躁或漏洞？' },
      { category: 'general', text: '眼前這件事是否應先觀察與防守？' },
    ],
  },
  28: {
    title: '九天玄女問事法',
    intro: '適合問策略、競爭、團隊與危機；先描述局勢，再問進退與布局。',
    preferredCategories: ['career', 'wealth', 'general'],
    steps: ['整理全局與目標', '分清主要阻力', '請示時機與資源配置'],
    prompts: [
      { category: 'career', text: '這個競爭局勢中，我應該先布局哪一步？' },
      { category: 'wealth', text: '目前資源應集中主攻，還是保留後手？' },
      { category: 'general', text: '這件事現在適合進、守，還是暫退觀勢？' },
    ],
  },
  29: {
    title: '太歲星君問事法',
    intro: '適合問年度風險、作息與重大變動；把時間範圍和計畫說清楚。',
    preferredCategories: ['general', 'health', 'wealth'],
    steps: ['說明年度目標', '問主要風險', '請示應建立的規律與緩衝'],
    prompts: [
      { category: 'general', text: '今年最需要留意的風險與修正方向是什麼？' },
      { category: 'health', text: '今年在作息與健康管理上，最該先穩住哪一點？' },
      { category: 'wealth', text: '今年重大財務安排應保留多少緩衝與退路？' },
    ],
  },
  30: {
    title: '臨水夫人問事法',
    intro: '適合問婦幼照護、親子安全與家庭支持；健康問題仍須配合專業醫療。',
    preferredCategories: ['health', 'family', 'general'],
    steps: ['說明照護現況', '問主要風險與壓力', '請示可先建立的支持'],
    prompts: [
      { category: 'health', text: '目前的身心與照護安排，最需要先調整哪一部分？' },
      { category: 'family', text: '家庭照顧責任應如何分工，才能彼此支持？' },
      { category: 'general', text: '眼前最該優先保護與安頓的是什麼？' },
    ],
  },
  31: {
    title: '義民爺問事法',
    intro: '適合問團隊、地方、責任與共同利益；把相關人物與長期影響說清楚。',
    preferredCategories: ['career', 'family', 'general'],
    steps: ['說明共同目標', '問責任是否公平', '請示如何守義又維持團結'],
    prompts: [
      { category: 'career', text: '團隊目前的責任與利益如何調整才公平？' },
      { category: 'family', text: '關於家園與共同資源，我們最該先守住什麼？' },
      { category: 'general', text: '這件事如何兼顧原則與眾人的長期利益？' },
    ],
  },
  32: {
    title: '至聖先師問事法',
    intro: '適合問學習、教育、志向與品德；先說目前程度與實際困難。',
    preferredCategories: ['study', 'career', 'general'],
    steps: ['描述學習問題', '問方法而非只問結果', '請示能長期實踐的功課'],
    prompts: [
      { category: 'study', text: '目前學習最需要補強的方法或基礎是什麼？' },
      { category: 'career', text: '為了長期發展，我該培養哪項能力與品德？' },
      { category: 'general', text: '眼前這個選擇是否符合我的志向與責任？' },
    ],
  },
  33: {
    title: '藥師佛問事法',
    intro: '適合問健康照護、求醫心態與復原規律；籤意不能代替診斷。',
    preferredCategories: ['health', 'general', 'family'],
    steps: ['說明已知健康狀況', '問照護與心態', '請示如何建立規律並尋求協助'],
    prompts: [
      { category: 'health', text: '面對目前健康狀況，我該先建立哪種照護規律？' },
      { category: 'general', text: '如何安定焦慮，理性安排下一步求助？' },
      { category: 'family', text: '家人之間如何分工，才能提供穩定照護？' },
    ],
  },
  34: {
    title: '齊天大聖問事法',
    intro: '適合問突破難關、化解小人與行動策略；大聖爺喜歡直接明快的問題。',
    preferredCategories: ['career', 'general', 'family'],
    steps: ['先說明想突破的關卡', '問是否有隱性障礙', '請示最該出手的時機與方式'],
    prompts: [
      { category: 'career', text: '眼前這個難關，我該硬闖、繞路，還是先變個法子？' },
      { category: 'general', text: '最近是否有小人或看不見的阻力在干擾我？' },
      { category: 'family', text: '家中目前的狀況，該用什麼新的角度來面對？' },
    ],
  },
  35: {
    title: '鍾馗天師問事法',
    intro: '適合問驅邪、家宅平安、小人退散與是非化解；問題宜直接清楚。',
    preferredCategories: ['protection', 'family', 'general'],
    steps: ['先說明不安的來源', '問是否需驅邪或防護', '請示守住平安的具體做法'],
    prompts: [
      { category: 'protection', text: '家中或身邊是否有不好的氣息需要化解？' },
      { category: 'family', text: '家人近期平安最需要注意哪一方面？' },
      { category: 'general', text: '身邊的小人與是非，該如何防範與化解？' },
    ],
  },
  36: {
    title: '王母娘娘問事法',
    intro: '適合問長壽健康、家庭和合、姻緣圓滿與貴人助力；語氣宜柔和恭敬。',
    preferredCategories: ['family', 'love', 'health'],
    steps: ['先說明所求的福分', '問如何和合與圓滿', '請示該如何累積福緣'],
    prompts: [
      { category: 'family', text: '家中相處該如何調整，才能更和諧圓滿？' },
      { category: 'love', text: '這段姻緣是否值得用心栽培與等待？' },
      { category: 'health', text: '關於長輩或自身的健康，近期該如何守護？' },
    ],
  },
  37: {
    title: '巧聖先師問事法',
    intro: '適合問技術精進、工程專案、創業開局與技能學習；先備好細節再問。',
    preferredCategories: ['career', 'settlement', 'wealth'],
    steps: ['先說明專案或技術目標', '問基礎是否穩固', '請示最該補強的能力或步驟'],
    prompts: [
      { category: 'career', text: '目前專案或技術上，最該先補強哪個基礎？' },
      { category: 'settlement', text: '這個新局或工程方向是否值得投入？' },
      { category: 'wealth', text: '創業或投資所需的資源與技術是否成熟？' },
    ],
  },
  38: {
    title: '東嶽大帝問事法',
    intro: '適合問家運、延壽增福、消災解厄與重大決策；問題宜莊重清楚。',
    preferredCategories: ['general', 'health', 'family'],
    steps: ['先稟明所求大事', '問天時與因果', '請示該守、該進或該化解'],
    prompts: [
      { category: 'general', text: '關於家運與整體方向，近期最該先穩住什麼？' },
      { category: 'health', text: '家人長輩的健康與福壽，該如何用心守護？' },
      { category: 'family', text: '家中有無需要化解的隱性牽掛或因果？' },
    ],
  },
  39: {
    title: '閻羅天子問事法',
    intro: '適合問因果業障、先人超度、是非善惡與消災解厄；問題宜正心誠意。',
    preferredCategories: ['general', 'protection', 'family'],
    steps: ['先說明所求因果或先人', '問是否有業障需化解', '請示該如何行善積德'],
    prompts: [
      { category: 'general', text: '關於我目前的處境，是否有過去累積的因果業障需要化解？' },
      { category: 'protection', text: '先人是否安好，是否有需要我代為完成的祭祀或功德？' },
      { category: 'family', text: '家中的陰陽調理是否得當，最近要注意什麼？' },
    ],
  },
  40: {
    title: '酆都大帝問事法',
    intro: '適合問超度先亡、化解陰債、冥府事務與家宅平安；先稟明歷代祖先姓名。',
    preferredCategories: ['general', 'family', 'protection'],
    steps: ['先說明所要超度的對象', '問陰債或冤愆是否已化解', '請示應如何做功德或祭祀'],
    prompts: [
      { category: 'general', text: '歷代祖先是否安好，是否有什麼需要我為他們做的？' },
      { category: 'family', text: '家中的陰陽兩界是否需要調理，最近該注意什麼？' },
      { category: 'protection', text: '是否有無形的陰債或冤愆影響著我的家運？' },
    ],
  },
  41: {
    title: '五顯大帝問事法',
    intro: '適合問演藝創作、創意靈感、事業突破與驅邪護身；問題宜直接熱情。',
    preferredCategories: ['career', 'protection', 'general'],
    steps: ['先說明創作或事業目標', '問是否有阻礙或邪煞', '請示最該出手的方向'],
    prompts: [
      { category: 'career', text: '關於我的演藝或創作之路，近期最該往哪個方向發展？' },
      { category: 'protection', text: '身邊是否有邪煞或小人需要化解？' },
      { category: 'general', text: '最近的瓶頸該如何突破，靈感從何而來？' },
    ],
  },
  42: {
    title: '池府千歲問事法',
    intro: '適合問健康防疫、家宅平安、事業順遂與身體調理；先說明症狀或狀況。',
    preferredCategories: ['health', 'family', 'general'],
    steps: ['先說明健康狀況或擔憂', '問是否需驅疫避邪', '請示調理與恢復的方向'],
    prompts: [
      { category: 'health', text: '關於我目前的健康狀況，近期是否能夠穩定好轉？' },
      { category: 'family', text: '家中是否有疫氣或不好的氣息需要化解？' },
      { category: 'general', text: '事業與家宅的平安，最近最該注意哪一方面？' },
    ],
  },
  43: {
    title: '五年千歲問事法',
    intro: '適合問年度平安、驅瘟除疫、家運健康與消災解厄；可涵蓋全家祈求。',
    preferredCategories: ['general', 'health', 'family'],
    steps: ['先說明年度祈求', '問是否有災厄需化解', '請示應如何消災補運'],
    prompts: [
      { category: 'general', text: '今年我們全家最該注意的災厄或風險是什麼？' },
      { category: 'health', text: '家人健康是否需要特別留意哪方面？' },
      { category: 'family', text: '家運要如何保持平安順遂，是否有該做的事？' },
    ],
  },
  44: {
    title: '關平太子問事法',
    intro: '適合問學業、事業、忠孝與品德；非常適合青少年與考生請示。',
    preferredCategories: ['study', 'career', 'general'],
    steps: ['先說明學業或事業目標', '問該補強的方向', '請示如何兼顧品德與成就'],
    prompts: [
      { category: 'study', text: '關於近期學業或考試，我最該加強哪個科目或能力？' },
      { category: 'career', text: '事業發展上，該如何兼顧正當性與成功？' },
      { category: 'general', text: '如何在做決定時，同時做到忠孝兩全？' },
    ],
  },
  45: {
    title: '周倉將軍問事法',
    intro: '適合問驅邪鎮煞、小人化解、勇氣加持與忠誠原則；問題宜正直不繞彎。',
    preferredCategories: ['protection', 'general', 'career'],
    steps: ['先說明遇到的阻礙或小人', '問是否需要鎮煞驅邪', '請示該如何守住原則'],
    prompts: [
      { category: 'protection', text: '身邊是否有小人或口舌是非需要化解？' },
      { category: 'general', text: '面對挑戰時，如何獲得更多勇氣與果斷力？' },
      { category: 'career', text: '工作上是否該堅守原則，還是需要靈活調整？' },
    ],
  },
  46: {
    title: '千里眼將軍問事法',
    intro: '適合問方向判斷、真相調查、遠見洞察與風險預知；先描述已知資訊。',
    preferredCategories: ['general', 'career', 'travel'],
    steps: ['先描述你看到的情況', '問是否有隱藏真相', '請示該從哪個角度看全局'],
    prompts: [
      { category: 'general', text: '眼前這件事的真相到底是什麼，有沒有我沒看到的部分？' },
      { category: 'career', text: '關於事業方向，是否有我忽略的風險或機會？' },
      { category: 'travel', text: '接下來的行程或移動，是否有需要注意的安全問題？' },
    ],
  },
  47: {
    title: '順風耳將軍問事法',
    intro: '適合問溝通、消息等待、人際關係與資訊通達；先說明溝通對象或等待的訊息。',
    preferredCategories: ['general', 'love', 'career'],
    steps: ['先說明溝通問題或等待的消息', '問時機與方式', '請示如何改善溝通'],
    prompts: [
      { category: 'general', text: '我等的那個消息何時會有回音，近期是否該主動追問？' },
      { category: 'love', text: '該如何與對方溝通才能讓關係更和諧？' },
      { category: 'career', text: '工作上的溝通問題該如何改善，有什麼我沒聽到的？' },
    ],
  },
  48: {
    title: '太陽星君問事法',
    intro: '適合問事業光明、前途發展、正面能量與光明方向；問題宜充滿正向能量。',
    preferredCategories: ['career', 'wealth', 'general'],
    steps: ['先描述事業或前途目標', '問光明方向在哪', '請示如何驅散陰暗與阻礙'],
    prompts: [
      { category: 'career', text: '我的事業前途是否光明，近期該如何大步前進？' },
      { category: 'wealth', text: '財運未來的走勢如何，如何讓財庫更光明穩定？' },
      { category: 'general', text: '如何驅散目前生命中的陰暗，迎向更光明的未來？' },
    ],
  },
  49: {
    title: '太陰娘娘問事法',
    intro: '適合問感情姻緣、女性健康、美容養顏與家庭和諧；語氣宜溫柔真誠。',
    preferredCategories: ['love', 'family', 'health'],
    steps: ['先說明感情或女性相關的祈求', '問時機與方式', '請示如何讓關係更圓融'],
    prompts: [
      { category: 'love', text: '我的姻緣何時會有訊息，這段感情是否值得用心等待？' },
      { category: 'family', text: '家庭中的關係該如何調和，讓氣氛更溫暖和諧？' },
      { category: 'health', text: '關於女性健康與身心調理，近期最該注意什麼？' },
    ],
  },
  50: {
    title: '法主真君問事法',
    intro: '適合問驅邪除煞、疾病化解、法術護身與災厄防範；問題宜誠心敬意。',
    preferredCategories: ['protection', 'health', 'general'],
    steps: ['先說明遇到的邪煞或病況', '問是否需要法術護身', '請示化解的方法與步驟'],
    prompts: [
      { category: 'protection', text: '身邊是否有邪煞或不好的能量需要法主真君驅除？' },
      { category: 'health', text: '目前的疾病該如何配合醫療與法事來化解？' },
      { category: 'general', text: '如何祈求法主真君護身，讓日常出入更加平安？' },
    ],
  },
};

export function getGodQuestionGuide(godId?: number | null): GodQuestionGuide {
  return godId && guides[godId] ? guides[godId] : defaultGuide;
}
