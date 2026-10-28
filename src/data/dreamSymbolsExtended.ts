/**
 * 擴充夢象資料庫。
 *
 * 夢境沒有單一、可驗證的「預言式」答案；本資料以常見的文化象徵與
 * 自我覺察角度提供可採納或忽略的線索。每個條目都含同義詞，讓自然語句
 * 也能被本機離線分析辨識。
 */
export type DreamFortune = '吉' | '中' | '凶';

export interface DreamSymbolEntry {
  aliases: string[];
  interpretation: string;
  fortune: DreamFortune;
  advice: string;
}

export const EXTENDED_DREAM_SYMBOL_ENTRIES: DreamSymbolEntry[] = [
  { aliases: ['太陽', '日出', '陽光'], interpretation: '太陽常象徵清晰、活力與重新看見方向；若光線溫暖，也可能反映你正恢復信心。', fortune: '吉', advice: '挑一件最想推進的事，趁能量較好時完成第一步。' },
  { aliases: ['月亮', '月光', '滿月'], interpretation: '月亮連結情緒、直覺與尚未說出口的感受。夢中的月相與亮度可作為你內在狀態的提示。', fortune: '中', advice: '先記下直覺與情緒，再決定是否要立刻行動。' },
  { aliases: ['星星', '星空', '流星'], interpretation: '星光象徵希望、遠方目標與在不確定中尋找方向。流星也可能反映短暫但重要的念頭。', fortune: '吉', advice: '把最近浮現的願望化為一個可在本週完成的小目標。' },
  { aliases: ['彩虹'], interpretation: '彩虹常被視為風雨後的轉機，象徵不同面向逐漸取得平衡。', fortune: '吉', advice: '回想近期的難關；找出已經出現的一項改善跡象。' },
  { aliases: ['雲', '烏雲', '黑雲'], interpretation: '雲代表暫時的不明朗；厚重烏雲較常反映壓力或擔憂，而非必然的壞事。', fortune: '中', advice: '將模糊的擔憂寫成具體問題，區分能處理與暫時無法控制的部分。' },
  { aliases: ['下雨', '雨', '大雨', '暴雨'], interpretation: '雨可象徵情緒釋放、滋養或累積的壓力。雨勢與夢中感受，比單一符號更值得參考。', fortune: '中', advice: '為情緒留出出口，例如休息、書寫或找可信任的人聊聊。' },
  { aliases: ['雷', '打雷', '閃電'], interpretation: '雷電象徵突如其來的覺察、衝突或需要被正視的訊息。', fortune: '中', advice: '遇到意外消息時先確認事實，避免在情緒高點做重大決定。' },
  { aliases: ['風', '大風', '颱風'], interpretation: '風反映外在變動與內在不安。順風可能是推動力，強風則提醒你穩住節奏。', fortune: '中', advice: '先守住作息與優先順序，再回應外界的變化。' },
  { aliases: ['雪', '下雪'], interpretation: '雪常象徵停頓、潔淨與情緒被暫時凍結；也可能是你需要安靜整理自己的訊號。', fortune: '中', advice: '放慢一點，讓尚未成熟的答案有時間浮現。' },
  { aliases: ['火', '火焰', '失火', '火災'], interpretation: '火象徵熱情、怒氣與轉化。失控的火較常對應壓力或衝突，不宜解作必然災兆。', fortune: '中', advice: '辨認目前最強烈的情緒，選擇安全而直接的方式表達需求。' },
  { aliases: ['海', '大海', '海浪'], interpretation: '海洋代表深層情緒與未知。平靜的海可反映接納，巨浪則可能表示情緒或責任感湧來。', fortune: '中', advice: '先處理眼前最迫切的一件事，別試圖一次解決所有問題。' },
  { aliases: ['河', '溪流', '瀑布'], interpretation: '流動的水常象徵過程與情感流動；順暢或阻塞的景象可連結近期進展感。', fortune: '中', advice: '檢查哪一個環節卡住了，替它安排一個更小的下一步。' },
  { aliases: ['洪水', '淹水'], interpretation: '洪水多反映被情緒、工作或資訊淹沒的感受，而非對未來的預告。', fortune: '中', advice: '減少一項非必要負荷，必要時向身邊的人尋求支援。' },
  { aliases: ['山', '爬山', '高山'], interpretation: '山象徵目標、挑戰與累積。登山過程比登頂本身更能提示你對目前任務的感受。', fortune: '吉', advice: '把大目標拆成里程碑，肯定已累積的進度。' },
  { aliases: ['森林', '樹林'], interpretation: '森林代表探索、未知與內在資源。迷路時可能反映選項太多或缺少指引。', fortune: '中', advice: '暫時縮小選項；先選一條風險較低的路測試。' },
  { aliases: ['樹', '大樹', '開花', '花朵'], interpretation: '樹與花常象徵成長、根基與關係的滋養；枯萎也可提醒你留意耗損。', fortune: '吉', advice: '回到能長期滋養你的習慣、關係或環境。' },
  { aliases: ['蛇', '蟒蛇'], interpretation: '蛇可代表警覺、轉化、療癒或不安；它在夢中的距離與你的感受決定解讀重點。', fortune: '中', advice: '不要急著把不安視為威脅；找出需要設立界線的地方。' },
  { aliases: ['老虎', '虎'], interpretation: '老虎象徵力量、權威與本能。害怕牠可能反映壓力；與牠共處則可能是重新拿回力量。', fortune: '中', advice: '面對壓力時保持尊重與界線，避免逞強或逃避。' },
  { aliases: ['獅子'], interpretation: '獅子常連結領導、勇氣與被看見的需求，也可能映照強勢人物帶來的壓迫感。', fortune: '中', advice: '練習清楚說出立場，同時留意不要壓過他人的聲音。' },
  { aliases: ['狗', '小狗'], interpretation: '狗多象徵忠誠、陪伴與保護。牠的親近或吠叫，可能映照你對信任與安全感的狀態。', fortune: '吉', advice: '珍惜可靠關係；若有誤會，主動用溫和方式確認彼此想法。' },
  { aliases: ['貓', '小貓'], interpretation: '貓與直覺、獨立和界線相關。牠的姿態可能提示你需要更多自主空間或休息。', fortune: '中', advice: '尊重自己的節奏，為休息與獨處留一點空白。' },
  { aliases: ['馬', '騎馬'], interpretation: '馬象徵行動力、自由與前進速度。失控的馬常反映節奏過快，平穩騎乘則是掌握感。', fortune: '吉', advice: '讓行動有方向，也替自己保留調整步調的空間。' },
  { aliases: ['牛', '黃牛'], interpretation: '牛代表耐力、務實與長期耕耘，提醒你成果往往來自穩定累積。', fortune: '吉', advice: '持續做可重複的小行動，不必急著求立即結果。' },
  { aliases: ['鳥', '小鳥', '燕子'], interpretation: '鳥常象徵訊息、自由與視野；飛向何處可反映你想靠近或離開的方向。', fortune: '吉', advice: '為自己創造一點新視角，例如散步、閱讀或和不同的人交流。' },
  { aliases: ['烏鴉'], interpretation: '烏鴉常被投射為不安，但在夢中也可象徵智慧、觀察與尚待理解的訊息。', fortune: '中', advice: '先不要急著判斷吉凶，留意近期被你忽略的細節。' },
  { aliases: ['蝴蝶'], interpretation: '蝴蝶象徵轉變與重新展開，常出現在身份、關係或生活階段正在改變時。', fortune: '吉', advice: '允許自己調整，不必用舊角色限制新的可能。' },
  { aliases: ['蜜蜂'], interpretation: '蜜蜂代表合作、勤勞與群體節奏，也可能提醒你別讓忙碌取代真正重要的事。', fortune: '中', advice: '盤點待辦事項，保留高價值工作並適度分工。' },
  { aliases: ['蜘蛛', '蜘蛛網'], interpretation: '蜘蛛網常象徵複雜關係、細節與被困感；也可提示你正在編織新的連結。', fortune: '中', advice: '理清關係或任務的界線，先解開最關鍵的一個結。' },
  { aliases: ['魚', '金魚'], interpretation: '魚與潛意識、機會和資源流動相關。活躍的魚可能反映靈感，缺水則提醒照顧需求。', fortune: '吉', advice: '留意新機會，但先確認自己是否有足夠時間與資源承接。' },
  { aliases: ['烏龜', '龜'], interpretation: '烏龜象徵耐心、保護與穩健進展。它提醒你慢一點不代表落後。', fortune: '吉', advice: '按自己的可持續節奏前進，避免為了比較而過度消耗。' },
  { aliases: ['死亡', '死人', '屍體'], interpretation: '死亡在夢裡多象徵結束、轉換或對失去的擔憂，通常不應直接理解為現實預言。', fortune: '中', advice: '辨認正在告一段落的事，替自己安排一個溫和的告別或整理。' },
  { aliases: ['嬰兒', '寶寶'], interpretation: '嬰兒象徵新開始、脆弱需求或剛萌芽的計畫，需要耐心照顧。', fortune: '吉', advice: '給新計畫足夠小而穩定的投入，不要太早要求它成熟。' },
  { aliases: ['懷孕', '生小孩', '生產'], interpretation: '懷孕與生產常象徵醞釀與創造，可能對應一項即將成形的想法或人生轉折。', fortune: '吉', advice: '留意需要準備的資源，讓新階段以可承受的速度到來。' },
  { aliases: ['婚禮', '結婚', '新娘'], interpretation: '婚禮象徵承諾、結合與關係角色的變化；也可反映你對承諾的期待或顧慮。', fortune: '中', advice: '釐清自己真正願意承諾的是什麼，先從坦誠溝通開始。' },
  { aliases: ['前任', '舊情人'], interpretation: '夢見前任不一定表示想復合，更常是某段關係的感受、模式或未竟課題被喚起。', fortune: '中', advice: '問問自己：這個夢勾起的是想念、遺憾，還是目前關係中的相似感受？' },
  { aliases: ['家', '老家', '房子'], interpretation: '房子常比喻自我與安全感；不同房間可對應你願意或尚未願意面對的生活面向。', fortune: '中', advice: '整理一個真實空間，或檢視最近最需要安全感的領域。' },
  { aliases: ['搬家', '搬遷'], interpretation: '搬家象徵環境與身份轉換，可能反映你正準備離開熟悉模式。', fortune: '中', advice: '為轉變列出保留、放下與嘗試三件事，減輕未知感。' },
  { aliases: ['學校', '教室', '上課'], interpretation: '學校反映學習、評價與成長壓力；它可能連結近期被檢視或自我要求的經驗。', fortune: '中', advice: '把「必須完美」改成「下一次比這次更懂一點」。' },
  { aliases: ['考試', '考卷'], interpretation: '考試是常見的能力焦慮夢，通常反映正在接受挑戰、評估或自我比較。', fortune: '中', advice: '確認準備範圍，將焦慮轉化為一小段具體練習。' },
  { aliases: ['遲到', '趕不上車'], interpretation: '遲到或錯過交通工具常對應害怕錯失、時間壓力或覺得準備不足。', fortune: '中', advice: '重新估算時程，提早安排緩衝，而不是只責怪自己。' },
  { aliases: ['迷路', '走失'], interpretation: '迷路象徵方向感暫時失去或選擇太多；它也可能是在邀請你探索新路。', fortune: '中', advice: '先找一個可信的參考點：價值、期限或能幫你討論的人。' },
  { aliases: ['開車', '汽車', '車子'], interpretation: '車輛常象徵對生活方向的掌控感。誰在駕駛、車況如何，是解讀的重要細節。', fortune: '中', advice: '檢查目前最重要的決定是否由你主導；必要時把方向盤拿回來。' },
  { aliases: ['飛機', '搭飛機'], interpretation: '飛機象徵跨越距離、視野提升或即將展開的計畫，也可能帶出對失控的焦慮。', fortune: '中', advice: '為新計畫做好基本準備，同時接受無法完全掌控的部分。' },
  { aliases: ['墜落', '跌倒', '掉下去'], interpretation: '墜落多和失控感、壓力或害怕失敗有關，是常見的身心警訊式夢境。', fortune: '中', advice: '降低近期一項過高要求；若睡眠持續受影響，考慮和專業人士聊聊。' },
  { aliases: ['飛翔', '飛起來'], interpretation: '飛翔象徵自由、突破與擴大視野；飛不穩時則可能反映對改變的猶豫。', fortune: '吉', advice: '把想嘗試的突破先做成低風險實驗。' },
  { aliases: ['被追', '追趕', '被追殺'], interpretation: '被追逐常反映你在迴避的情緒、衝突或責任；追你的對象可提供更多線索。', fortune: '中', advice: '用一句話寫下最不想面對的是什麼，再選擇最小的面對行動。' },
  { aliases: ['裸體', '沒穿衣服'], interpretation: '裸體常關於暴露感、脆弱與害怕被評價，也可能是在尋求更真實地表達自己。', fortune: '中', advice: '分辨哪些事需要保護隱私，哪些事可以安心做自己。' },
  { aliases: ['牙齒掉', '掉牙'], interpretation: '掉牙常被連結到外貌、自信、失去掌控或人生階段改變；不宜解讀為具體預兆。', fortune: '中', advice: '留意近期是否有讓你覺得不夠好的情境，給自己更務實的支持。' },
  { aliases: ['廁所', '尿', '大便'], interpretation: '排泄相關夢境常象徵釋放、界線或對私密需求的忽略。', fortune: '中', advice: '把一件積壓已久的小事處理掉，為生活騰出一點空間。' },
  { aliases: ['廟', '寺廟', '神明', '拜拜'], interpretation: '廟宇與神明意象可象徵尋求安定、價值指引與精神寄託，也反映你重視的傳統連結。', fortune: '吉', advice: '安靜整理心願；若要祈求，將心意連結到可實踐的善意行動。' },
  { aliases: ['觀音', '媽祖', '土地公'], interpretation: '熟悉的信仰角色常帶來守護、慈悲或在困難中尋求依靠的意義，解讀可回到你自身的感受。', fortune: '吉', advice: '從感到被安慰的部分出發，做一件照顧自己或他人的小事。' },
  { aliases: ['棺材', '棺木'], interpretation: '棺材在傳統裡常有轉換意涵；以心理角度看，也可能象徵一段狀態的結束與重新開始。', fortune: '中', advice: '別急著恐慌；思考是否有舊習慣、關係模式或工作階段需要收尾。' },
  { aliases: ['錢', '鈔票', '撿到錢'], interpretation: '金錢象徵資源、價值感與安全感。撿錢可能映照被看見的機會，也提醒務實評估。', fortune: '吉', advice: '盤點可用資源與真正重視的價值，再決定如何投入。' },
  { aliases: ['偷竊', '被偷', '小偷'], interpretation: '失竊常反映界線受侵犯、資源被耗損或害怕失去，而不是現實事件的預告。', fortune: '中', advice: '檢視時間、金錢與情緒界線；保護重要帳號與物品也是實際的安心行動。' },
];

/** 將同義詞展開為既有分析器可直接比對的索引。 */
export const EXTENDED_DREAM_SYMBOLS: Record<string, Omit<DreamSymbolEntry, 'aliases'>> =
  EXTENDED_DREAM_SYMBOL_ENTRIES.reduce<Record<string, Omit<DreamSymbolEntry, 'aliases'>>>((index, entry) => {
    const { aliases, ...details } = entry;
    for (const alias of aliases) index[alias] = details;
    return index;
  }, {});

export const EXTENDED_DREAM_SYMBOL_COUNT = EXTENDED_DREAM_SYMBOL_ENTRIES.length;

export const DREAM_DICTIONARY_CATEGORIES = ['全部', '自然', '動物', '人物人生', '場所與行動', '身心感受', '信仰與象徵'] as const;
export type DreamDictionaryCategory = typeof DREAM_DICTIONARY_CATEGORIES[number];

const categoryKeywords: Record<Exclude<DreamDictionaryCategory, '全部'>, string[]> = {
  '自然': ['太陽', '月亮', '星星', '彩虹', '雲', '下雨', '雷', '風', '雪', '火', '海', '河', '洪水', '山', '森林', '樹'],
  '動物': ['蛇', '老虎', '獅子', '狗', '貓', '馬', '牛', '鳥', '烏鴉', '蝴蝶', '蜜蜂', '蜘蛛', '魚', '烏龜'],
  '人物人生': ['死亡', '嬰兒', '懷孕', '婚禮', '前任', '錢', '偷竊'],
  '場所與行動': ['家', '搬家', '學校', '考試', '遲到', '迷路', '開車', '飛機', '墜落', '飛翔', '被追', '廁所'],
  '身心感受': ['裸體', '牙齒掉', '棺材'],
  '信仰與象徵': ['廟', '觀音'],
};

export function getDreamSymbolCategory(entry: DreamSymbolEntry): DreamDictionaryCategory {
  for (const [category, keywords] of Object.entries(categoryKeywords) as [Exclude<DreamDictionaryCategory, '全部'>, string[]][]) {
    if (entry.aliases.some((alias) => keywords.includes(alias))) return category;
  }
  return '信仰與象徵';
}
