// 解夢服務 — 後端 API 不可用時的本地規則分析
// 基於常見夢境元素的心理象徵與傳統解夢

export interface DreamResult {
  symbols: string[];
  interpretation: string;
  fortune: '吉' | '中' | '凶';
  advice: string;
}

/** 50+ 常見夢境元素及其象徵意義 */
const SYMBOL_DICTIONARY: Record<string, { interpretation: string; fortune: '吉' | '中' | '凶'; advice: string }> = {
  // 自然元素
  '水': {
    interpretation: '水象徵情感與財運。清澈平靜的水代表內心平和、財運順遂；渾濁洶湧的水則暗示情緒波動或財務不穩。',
    fortune: '中',
    advice: '注意自己的情緒狀態，水流的方向就是你的心之所向。順流而行，不必逆勢而為。',
  },
  '海': {
    interpretation: '大海代表潛意識與無窮的可能性。平靜的海面象徵內心的安定，波濤洶湧則反映潛在的焦慮。',
    fortune: '中',
    advice: '你的潛意識正在傳達訊息，靜心傾聽內在的聲音。',
  },
  '火': {
    interpretation: '火象徵熱情、憤怒或轉化。溫暖的火焰代表創造力與生命力；失控的大火則暗示壓抑的怒氣或危機。',
    fortune: '中',
    advice: '火焰需要控制才能照亮黑暗。善用你的熱情，但不要讓它燒傷自己或他人。',
  },
  '風': {
    interpretation: '風代表變動、訊息與無形的力量。和風吹拂象徵好消息將至；狂風則暗示突如其來的變故。',
    fortune: '中',
    advice: '風向已變，順勢調整你的計畫。變動是最好的老師。',
  },
  '山': {
    interpretation: '山象徵目標、障礙或靠山。登上山頂表示克服困難、達成目標；望山興嘆則反映現實中的阻礙。',
    fortune: '吉',
    advice: '高山仰止，景行行止。你的目標清晰可及，堅持攀登就能到達頂峰。',
  },
  '雨': {
    interpretation: '雨水象徵洗滌、恩澤或憂傷。綿綿細雨代表情感的滋潤與療癒；傾盆大雨則暗示壓力的釋放。',
    fortune: '中',
    advice: '讓雨水洗去你的煩惱，雨過天晴後自會見到彩虹。',
  },
  '日月': {
    interpretation: '日月同輝象徵光明、智慧與陰陽平衡。夢見太陽代表活力與成功，月亮則代表直覺與潛意識。',
    fortune: '吉',
    advice: '光明在前，遵循你內心的指引。日月之光會照亮你的道路。',
  },
  '星空': {
    interpretation: '滿天星斗代表希望、夢想與指引。每顆星都是一個可能性，浩瀚星空提醒你格局可以更大。',
    fortune: '吉',
    advice: '你的夢想如同星空般燦爛，選定一顆星作為導航，勇敢前行。',
  },
  '地震': {
    interpretation: '地震象徵生活根基的動搖、突如其來的變故或內心深處的不安。這是潛意識的警鐘。',
    fortune: '凶',
    advice: '生活可能正在經歷震盪期，先穩住核心價值，不要急著做大變動。',
  },

  // 動物
  '蛇': {
    interpretation: '蛇在傳統解夢中雙重含義：一方面代表智慧、療癒與轉化（蛻皮新生），另一方面也可能暗示隱藏的危險或背叛。',
    fortune: '中',
    advice: '注意身邊是否有隱藏的訊息或未被察覺的威脅。同時這也是自我蛻變的契機。',
  },
  '魚': {
    interpretation: '魚在水中游代表財運亨通、生機勃勃。捕到魚更是好兆頭，象徵收穫與富足。懷孕夢見魚則有胎夢之意。',
    fortune: '吉',
    advice: '財運活躍，把握好眼前的機會。魚躍龍門，你的努力將獲得意想不到的回報。',
  },
  '鳥': {
    interpretation: '飛鳥代表自由、靈魂與高遠的理想。鳥兒展翅高飛象徵突破限制；籠中鳥則暗示受到束縛。',
    fortune: '吉',
    advice: '你的精神渴望自由，該是掙脫束縛、追求理想的時候了。',
  },
  '狗': {
    interpretation: '狗象徵忠誠、友誼與保護。友善的狗代表身邊有可靠的朋友；兇惡的狗則暗示人際關係中的矛盾。',
    fortune: '吉',
    advice: '珍惜身邊忠誠的朋友，他們是你最寶貴的資產。',
  },
  '貓': {
    interpretation: '貓代表直覺、獨立與神秘。溫馴的貓象徵女性的智慧與靈性；野貓則暗示需要更加獨立自主。',
    fortune: '中',
    advice: '相信你的直覺，貓的靈敏嗅覺能察覺到常人忽略的細節。',
  },
  '老虎': {
    interpretation: '老虎象徵權威、勇氣與潛在的危險。馴服老虎代表掌控了自己的力量；被老虎追逐則反映現實中的壓力。',
    fortune: '中',
    advice: '你內心有一股強大的力量，學會駕馭它而非逃避它。老虎也能成為你的守護者。',
  },
  '龍': {
    interpretation: '龍在東方文化中是至高無上的神獸，代表權威、貴人與大運。夢見龍騰飛天，是極其吉祥的徵兆。',
    fortune: '吉',
    advice: '大運將至，貴人將現。做好準備迎接生命中的重大轉機。',
  },
  '蜘蛛': {
    interpretation: '蜘蛛織網象徵編織命運、耐心與創造力。它是勤奮的編織者，提醒你正在編織自己的人生網絡。',
    fortune: '中',
    advice: '你的努力正在一點一滴地累積成效，如同蜘蛛耐心織網，終將捕獲屬於你的機會。',
  },
  '老鼠': {
    interpretation: '老鼠代表機敏、生存本能，但也暗示細微的損失或隱藏的煩惱。老鼠偷食則提醒注意財務上的小漏洞。',
    fortune: '中',
    advice: '留意生活中的小細節，小問題不及時處理可能變成大麻煩。',
  },
  '馬': {
    interpretation: '駿馬奔騰象徵進取、事業發展與自由精神。騎馬而行代表掌控人生方向；脫韁之馬則暗示局勢失控。',
    fortune: '吉',
    advice: '時機成熟，全力衝刺！馬到成功指日可待。',
  },
  '蝴蝶': {
    interpretation: '蝴蝶是蛻變與重生的終極象徵。毛毛蟲蛻變成蝴蝶，代表你正在經歷深層的轉變，美好的結果即將展現。',
    fortune: '吉',
    advice: '改變已經發生，美麗的成果正在醞釀中。擁抱這個蛻變的過程。',
  },
  '蜜蜂': {
    interpretation: '蜜蜂代表勤勞、合作與甜蜜的成果。蜂巢象徵秩序井然的社群與財富積累。被蜂螫則提醒注意小人。',
    fortune: '吉',
    advice: '勤奮的工作將帶來甜蜜的回報。團隊合作比單打獨鬥更有成效。',
  },

  // 人物
  '死': {
    interpretation: '夢見死亡並不代表真正的不幸，而是象徵轉變、結束與新生。某個階段的終結正在為下一個階段鋪路。',
    fortune: '中',
    advice: '放手過去才能擁抱未來。新生的力量正在舊事物的消亡中萌芽。',
  },
  '嬰兒': {
    interpretation: '嬰兒代表新的開始、純真與無限的潛能。夢見嬰兒常是新生計畫或創意的象徵，也可能是內心對呵護的渴望。',
    fortune: '吉',
    advice: '一個新的開始正在萌芽，呵護這個脆弱的起步，它將成長為強大的力量。',
  },
  '婚禮': {
    interpretation: '婚禮象徵結合、承諾與新的聯盟。不一定是愛情上的結合，也可能預示事業上的合作或內在的整合。',
    fortune: '吉',
    advice: '新的合作關係正在形成，無論是感情還是事業，都值得用心經營。',
  },
  '考試': {
    interpretation: '夢見考試反映你對自己能力的焦慮，或正在面對現實中的某種考驗。準備不足的夢境暗示你對某件事缺乏信心。',
    fortune: '中',
    advice: '你比自己想像的更準備充分。考試夢在提醒你，放鬆心情、相信自己的實力。',
  },
  '老師': {
    interpretation: '老師代表智慧、指引與學習。夢中的老師可能是你內心智慧的投射，或是你需要虛心學習的領域。',
    fortune: '吉',
    advice: '生命中正在出現一位導師，或者你內在的智慧正在覺醒。保持學習的心態。',
  },
  '父母': {
    interpretation: '夢見父母通常反映你對安全感、權威或責任的感受。健康的父母象徵內心的安定；生病的父母則暗示對家庭責任的擔憂。',
    fortune: '中',
    advice: '多關心家人，同時也注意自己是否需要更多的情感支持。',
  },
  '追': {
    interpretation: '被追逐是最常見的夢境之一，代表你在逃避某種情緒、責任或決定。追逐你的事物，正是你需要面對的課題。',
    fortune: '凶',
    advice: '轉身面對追趕你的事物，你會發現它的力量源自你的恐懼。勇敢面對是最好的解方。',
  },

  // 動作與狀態
  '飛': {
    interpretation: '飛翔是人類最嚮往的夢境體驗。自由飛翔代表突破限制、獲得自由；飛行困難則暗示現實中的阻力。',
    fortune: '吉',
    advice: '你的精神渴望超越現實的限制。勇敢地展翅高飛，天空才是你的極限。',
  },
  '墜落': {
    interpretation: '墜落夢反映對失控的恐懼、對失敗的焦慮，或感覺生活中的某些部分正在崩解。這也是放下控制慾的提醒。',
    fortune: '凶',
    advice: '你不需要掌控一切。適度的放手反而能讓你安全著陸。',
  },
  '游泳': {
    interpretation: '在水中游泳代表你在情感的海洋中航行。輕鬆游泳表示能從容處理情緒；掙扎溺水則暗示情感超載。',
    fortune: '中',
    advice: '情感如同水流，與其抵抗不如順勢而為。學會與自己的情緒共游。',
  },
  '迷路': {
    interpretation: '迷路象徵你在人生某個領域失去了方向感，或對未來感到迷茫。這不是悲觀的夢，而是自我探索的開始。',
    fortune: '中',
    advice: '暫時的迷失是為了找到更好的方向。停下來重新定位，你比你想像的更靠近目標。',
  },
  '裸體': {
    interpretation: '夢見自己裸體或衣不蔽體，通常反映脆弱感、害怕被看穿，或是對真實自我的不安。也可能代表渴望卸下面具。',
    fortune: '中',
    advice: '你不需要隨時完美。願意展現真實的自己，反而能獲得真正的接納。',
  },
  '牙齒掉落': {
    interpretation: '牙齒掉落的夢非常普遍，通常反映對外表、能力或溝通能力的焦慮。也可能是對衰老或失去掌控的恐懼。',
    fortune: '凶',
    advice: '這可能反映你對某件事感到無力或失去信心。回到基本面，強化自己的核心能力。',
  },
  '遲到': {
    interpretation: '趕不上車或遲到的夢境，反映對錯失機會的焦慮，或是感覺準備不足就要上場的壓力。',
    fortune: '中',
    advice: '時間不是你的敵人，焦慮才是。放慢腳步，重要的時刻你會準時到達。',
  },
  '流產': {
    interpretation: '流產夢不代表真實的生育問題，而是象徵某個計畫、創意或關係的中斷與失落。',
    fortune: '凶',
    advice: '允許自己哀悼那些未能實現的計畫，但要知道新的可能性正在等待萌芽。',
  },

  // 場所
  '家': {
    interpretation: '家是你內心世界的縮影。熟悉溫暖的老家代表安全感與歸屬感；陌生的房子則代表未被探索的內心領域。',
    fortune: '吉',
    advice: '你的內心需要一個安穩的避風港，花時間經營你的心靈之家。',
  },
  '學校': {
    interpretation: '學校代表學習、成長與社會化。夢見回到學校通常與自我提升、技能學習，或某種需要重新學習的人生課題有關。',
    fortune: '中',
    advice: '人生總有學不完的課，保持學生的心態，每一個經歷都是最好的老師。',
  },
  '醫院': {
    interpretation: '醫院象徵療癒、恢復與健康的關注。夢見醫院可能是身體在發出訊號，或是心靈需要被治癒。',
    fortune: '中',
    advice: '無論是身體還是心靈，都需要定期保養。給自己一個療癒的空間。',
  },
  '寺廟': {
    interpretation: '寺廟代表靈性、信仰與內心的安寧。在寺廟中夢境通常與精神寄託、尋求指引或與更高的智慧連結有關。',
    fortune: '吉',
    advice: '你的靈性正在覺醒，寺廟是心靈的避難所。多花時間傾聽內在的聲音。',
  },
  '墳墓': {
    interpretation: '墳墓不是不祥之兆，而是象徵埋葬過去、放下執念。這是潛意識在告訴你，某些事情該入土為安了。',
    fortune: '中',
    advice: '有些過往需要正式告別，放下之後你會發現肩膀輕了許多。',
  },
  '橋': {
    interpretation: '橋象徵過渡、連結與轉變。過橋代表從一個階段走向另一個階段；橋斷了則暗示需要尋找新的路徑。',
    fortune: '中',
    advice: '你正站在轉變的關口，勇敢地跨過這座橋，彼岸有新的風景等著你。',
  },
  '廁所': {
    interpretation: '廁所象徵排毒、清理與釋放。夢見廁所通常表示你需要釋放某種負面情緒或與過去的不愉快告別。',
    fortune: '中',
    advice: '是時候清理內心的垃圾了。釋放那些壓抑的情緒，讓自己煥然一新。',
  },

  // 物品
  '錢': {
    interpretation: '金錢在夢中不僅代表財富，還代表自我價值、能量與權力。撿到錢象徵獲得新的機會或能力；遺失錢財則暗示自信心的流失。',
    fortune: '吉',
    advice: '你的能量正在增值，珍惜並善用你的資源。自我價值不只在金錢數字上。',
  },
  '手機': {
    interpretation: '手機代表溝通、連結與資訊。手機壞掉或遺失可能反映你害怕與外界失去聯繫，或是需要暫時斷絕干擾。',
    fortune: '中',
    advice: '真正的連結不在手機上，而是在人與人之間。給自己一個數位排毒的時間。',
  },
  '車': {
    interpretation: '車子代表你人生的掌控權與前進方向。自己開車表示主導人生方向；車子失控則暗示對現狀的無力感。',
    fortune: '中',
    advice: '方向盤在你手中，你決定人生的速度與方向。如果累了，可以靠邊休息再上路。',
  },
  '鏡子': {
    interpretation: '鏡子代表自我認知與反思。清晰的鏡子表示你對自己有清楚的認識；模糊的鏡子則暗示自我認同的困惑。',
    fortune: '中',
    advice: '攬鏡自照，認識真實的自己。鏡中的你是你最好的對話者。',
  },
  '食物': {
    interpretation: '食物象徵滋養、滿足與生命能量。豐盛的美食代表生活的富足與滿足；腐敗的食物則暗示某方面缺乏精神食糧。',
    fortune: '吉',
    advice: '滋養自己的身心，不只餵養身體，也要餵養靈魂。你值得最好的精神食糧。',
  },
  '血': {
    interpretation: '血液代表生命力、情感與家族連結。流血可能象徵能量的流失或情感的創傷；但也可能代表生命的活力與連結。',
    fortune: '凶',
    advice: '注意自己的能量消耗，不要過度付出導致心力交瘁。保護好自己的生命力。',
  },
  '衣服': {
    interpretation: '衣服代表身份、面具與社會角色。換衣服表示轉變角色或心態；穿著不恰當則暗示對自我定位的困惑。',
    fortune: '中',
    advice: '你正在重新定義自己的社會角色。選擇讓自己舒適的身份，而不是迎合他人的期待。',
  },
  '花朵': {
    interpretation: '花象徵美麗、愛情與短暫的美好。盛開的花朵代表感情或事業的蓬勃發展；凋謝的花則暗示需要把握當下。',
    fortune: '吉',
    advice: '美好的人事物正在你的生命中綻放，珍惜這段繽紛的時光。',
  },
  '鑰匙': {
    interpretation: '鑰匙代表解決方案、機會與權力。找到鑰匙表示你即將解開某個難題；遺失鑰匙則暗示需要尋找新的解決方法。',
    fortune: '吉',
    advice: '解決問題的鑰匙就在你手邊，只是你還沒發現。換個角度看事情，答案就在眼前。',
  },
  '門': {
    interpretation: '門代表機會、選擇與新的可能。門打開象徵機會降臨；門關閉則暗示某條路已到了盡頭，需要另闢蹊徑。',
    fortune: '中',
    advice: '當一扇門關閉時，另一扇窗已經打開。留意身邊出現的新機會。',
  },
  '書': {
    interpretation: '書代表知識、智慧與過往的經驗。閱讀書籍象徵自我提升的需求；合上書本則暗示某個階段的學習已完成。',
    fortune: '吉',
    advice: '知識是你最好的武器。持續學習、保持好奇，答案就在書本的某個頁面中。',
  },
  '鬼': {
    interpretation: '鬼魂代表未解決的過去、未處理的創傷或未說出口的話。被鬼追逐可能反映你內心無法放下的愧疚或恐懼。',
    fortune: '凶',
    advice: '那些糾纏你的過去，需要被正視而非逃避。勇敢地面對內心深處的幽靈，它們其實是你的一部分。',
  },
  '棺材': {
    interpretation: '棺材在傳統解夢中反而是吉兆，象徵「升官發財」（棺與官諧音）。代表舊事物終結、新階段開始，有破舊立新之意。',
    fortune: '吉',
    advice: '舊的格局已經結束，新的機會正在開啟。以嶄新的心態迎接人生的下一個階段。',
  },
};

/** 情緒詞彙 → 對解讀的調整 */
const FEELING_ADJUSTMENTS: Record<string, { direction: 'positive' | 'negative' | 'neutral'; modifier: string; advicePrefix: string }> = {
  // 負面情緒 → 調降吉凶、增加保守建議
  '害怕': { direction: 'negative', modifier: '但夢者感到恐懼，可能暗示內心對當前局面有深層不安。', advicePrefix: '此時不必強求突破，先安頓自己的情緒。' },
  '恐懼': { direction: 'negative', modifier: '然而夢中伴有強烈的恐懼感，這可能是潛意識的警鐘。', advicePrefix: '恐懼是保護機制而非敵人，理解恐懼的來源比克服它更重要。' },
  '焦慮': { direction: 'negative', modifier: '夢中的焦慮情緒暗示你對某事過於擔憂。', advicePrefix: '焦慮源於對未知的過度想像，把注意力拉回當下。' },
  '悲傷': { direction: 'negative', modifier: '悲傷的情緒在夢中蔓延，可能反映你內心的失落感。', advicePrefix: '允許自己難過，悲傷是療癒的第一步。' },
  '難過': { direction: 'negative', modifier: '難過的情緒提醒你內心有需要被撫慰的傷口。', advicePrefix: '給自己一些溫柔的時間，不要急著恢復正常。' },
  '生氣': { direction: 'negative', modifier: '夢中的憤怒反映你可能在現實中壓抑了太多不滿。', advicePrefix: '適度地表達你的不滿是健康的，不要讓怒氣在內心發酵。' },
  '憤怒': { direction: 'negative', modifier: '強烈的憤怒暗示有一個被忽略的問題需要你正視。', advicePrefix: '憤怒是指向問題的箭頭，用它來指引你的行動，而非傷人傷己。' },
  '緊張': { direction: 'negative', modifier: '緊張的情緒反映你對即將到來的事物感到準備不足。', advicePrefix: '深呼吸，你比自己想像的更準備充分。' },
  '無助': { direction: 'negative', modifier: '夢中的無助感暗示你覺得自己失去了對生活的掌控。', advicePrefix: '尋求幫助不是軟弱，而是智慧。你不必獨自面對一切。' },
  '孤獨': { direction: 'negative', modifier: '孤獨感在夢中特別清晰，提醒你需要與人連結。', advicePrefix: '主動走出舒適圈，真實的連結來自真誠的交流。' },
  '絕望': { direction: 'negative', modifier: '絕望的情緒雖然強烈，但往往意味著轉機就在谷底。', advicePrefix: '一切都會過去，包括此刻的絕望。尋求專業協助是勇敢的選擇。' },
  '後悔': { direction: 'negative', modifier: '後悔的情緒反映你放不下過去的某個決定。', advicePrefix: '過去無法改變，但你可以從中學習。原諒自己，然後向前走。' },
  '痛苦': { direction: 'negative', modifier: '痛苦是最直接的警訊，告訴你某件事需要被正視。', advicePrefix: '痛苦是內心的求救訊號，請不要忽視它。必要時尋求專業幫助。' },
  '壓力': { direction: 'negative', modifier: '壓力在夢境中浮現，暗示你需要為自己減壓。', advicePrefix: '適度紓壓是對自己負責的表現，排入你的生活日程中。' },
  '混亂': { direction: 'negative', modifier: '混亂的感受反映你覺得生活失去秩序。', advicePrefix: '一次只處理一件事，小步前進就能理清混亂。' },

  // 正面情緒 → 調升吉凶、增加積極建議
  '開心': { direction: 'positive', modifier: '夢中的快樂情緒是好的信號，代表身心處於愉悅狀態。', advicePrefix: '保持這份正面的能量，好運會被你吸引而來。' },
  '快樂': { direction: 'positive', modifier: '愉悅的夢境感受預示著接下來的運勢順遂。', advicePrefix: '享受這份快樂的同時，也把喜悅傳遞給身邊的人。' },
  '幸福': { direction: 'positive', modifier: '幸福的夢境感受是最美好的心靈禮物。', advicePrefix: '感恩此刻的美好，幸福的能量會產生漣漪效應。' },
  '感動': { direction: 'positive', modifier: '夢中的感動來自心靈深處，暗示你與某件重要的事物產生了連結。', advicePrefix: '追隨這份感動，它會帶你找到人生重要的方向。' },
  '平靜': { direction: 'positive', modifier: '平靜的夢境感受顯示你的內心處於和諧狀態。', advicePrefix: '這份平靜是內心強大的證明，繼續保持這份定力。' },
  '興奮': { direction: 'positive', modifier: '興奮的情緒預示好消息或有趣的轉變即將到來。', advicePrefix: '保持敏銳的觸覺，機會可能以意想不到的方式出現。' },
  '期待': { direction: 'positive', modifier: '期待的心情是對未來最正面的投資。', advicePrefix: '你的期待會轉化為行動的動力，好事正在路上。' },
  '安心': { direction: 'positive', modifier: '安心的感覺代表你已做出了正確的決定或走在對的路上。', advicePrefix: '相信自己，你正在對的方向上穩步前進。' },
  '愛': { direction: 'positive', modifier: '夢中感受到愛，是最強大的心靈滋養。', advicePrefix: '愛與被愛的能力是你與生俱來的禮物，多去表達你的愛。' },
  '溫暖': { direction: 'positive', modifier: '溫暖的夢境感受如同被宇宙擁抱，一切都會好起來。', advicePrefix: '這份溫暖是來自你內在的力量，讓它持續照耀你的生活。' },
  '自由': { direction: 'positive', modifier: '自由的感受表示你正在掙脫某種束縛，迎向更大的可能性。', advicePrefix: '這份自由是靈魂的呼喚，追隨它走向更廣闊的天地。' },
  '好奇': { direction: 'positive', modifier: '好奇的情緒是探索的起點，暗示新的領域等待你去發現。', advicePrefix: '保持這份好奇心，未知的領域藏著意想不到的禮物。' },
  '希望': { direction: 'positive', modifier: '希望感是黑暗中的光芒，告訴你困境中依然有出路。', advicePrefix: '抓住這絲希望，它會引領你穿越迷霧。' },
  '感恩': { direction: 'positive', modifier: '夢中的感恩之情是最高的心靈能量，你的福報正在顯化。', advicePrefix: '持續懷抱感恩之心，宇宙會以更多值得感恩的事物回應你。' },
  '驚喜': { direction: 'positive', modifier: '驚喜的情緒預示好事將以意想不到的方式降臨。', advicePrefix: '保持開放的心態，生活會給你意外的驚喜。' },
};

/** 分析夢境內容，提取關鍵符號 */
function extractSymbols(dream: string): string[] {
  const found: string[] = [];
  const dreamLower = dream.toLowerCase();

  // 按符號長度排序（長的優先匹配，避免「日月」被「日」或「月」單獨匹配）
  const keys = Object.keys(SYMBOL_DICTIONARY).sort((a, b) => b.length - a.length);

  for (const key of keys) {
    if (dream.includes(key) || dreamLower.includes(key.toLowerCase())) {
      if (!found.includes(key)) {
        found.push(key);
      }
      // 限制最多 8 個符號
      if (found.length >= 8) break;
    }
  }

  return found;
}

/** 根據情緒詞調整結果 */
function applyFeelingAdjustment(
  baseResult: Omit<DreamResult, 'symbols'>,
  feeling: string | undefined,
): Omit<DreamResult, 'symbols'> {
  if (!feeling) return baseResult;

  // 尋找匹配的情緒詞
  for (const [keyword, adjustment] of Object.entries(FEELING_ADJUSTMENTS)) {
    if (feeling.includes(keyword)) {
      const adjustedInterpretation = `${baseResult.interpretation}\n\n【情緒提示】${adjustment.modifier}`;

      // 正面情緒→傾向吉；負面情緒→傾向凶
      let adjustedFortune = baseResult.fortune;
      if (adjustment.direction === 'positive' && baseResult.fortune === '中') {
        adjustedFortune = '吉';
      } else if (adjustment.direction === 'positive' && baseResult.fortune === '凶') {
        adjustedFortune = '中';
      } else if (adjustment.direction === 'negative' && baseResult.fortune === '吉') {
        adjustedFortune = '中';
      } else if (adjustment.direction === 'negative' && baseResult.fortune === '中') {
        adjustedFortune = '凶';
      }

      const adjustedAdvice = `${adjustment.advicePrefix}\n${baseResult.advice}`;

      return {
        interpretation: adjustedInterpretation,
        fortune: adjustedFortune,
        advice: adjustedAdvice,
      };
    }
  }

  return baseResult;
}

/** 當夢境內容無法匹配任何符號時的通用分析 */
function buildGenericAnalysis(dream: string, feeling?: string): Omit<DreamResult, 'symbols'> {
  const dreamLength = dream.length;
  let fortune: '吉' | '中' | '凶' = '中';
  let interpretation = '';
  let advice = '';

  // 基於夢境長度與文字特徵的簡易分析
  if (dreamLength < 10) {
    interpretation = '你的夢境描述較為簡短，可能代表夢境本身是片段式的。簡短的夢境通常反映日常生活的直接投射，較無深層隱喻。';
    advice = '試著在醒來後立刻記錄夢境細節，越是詳盡的記錄越能發現其中的訊息。';
  } else if (dreamLength < 50) {
    interpretation = '你的夢境描述長度適中，顯示這個夢對你來說有一定的重要性。夢境是潛意識的語言，值得你花時間細細品味。';
    advice = '這個夢境可能與你正在面對的某個現實情境相關，試著將夢中情節與生活近況做對照。';
  } else {
    interpretation = '你描述的夢境相當詳細，顯示這個夢對你的衝擊或影響較大。細節豐富的夢境通常承載著重要的潛意識訊息，反映了你對某事物的深層關注。';
    advice = '豐富的夢境細節是解夢的資產。建議你將夢境記錄下來，幾天後重讀，或許能有新的領悟。';
  }

  // 情緒調整
  if (feeling) {
    const positiveWords = ['開心', '快樂', '幸福', '興奮', '平靜', '安心', '溫暖', '感動', '期待', '希望', '感恩', '驚喜', '自由', '好奇', '愛'];
    const negativeWords = ['害怕', '恐懼', '焦慮', '悲傷', '難過', '生氣', '憤怒', '緊張', '無助', '孤獨', '絕望', '後悔', '痛苦', '壓力', '混亂'];

    const isPositive = positiveWords.some(w => feeling.includes(w));
    const isNegative = negativeWords.some(w => feeling.includes(w));

    if (isPositive) {
      fortune = '吉';
      interpretation += '\n\n夢中的正面情緒是好的信號，表示你對目前的處境有較好的心理準備。';
      advice = '保持這份正面的心態，它會帶領你走向更好的方向。' + advice;
    } else if (isNegative) {
      fortune = '凶';
      interpretation += '\n\n夢中的負面情緒可能反映出你在現實中的壓力或不安，這是心靈在提醒你需要關注自己的狀態。';
      advice = '你的負面情緒需要被正視與處理。找一個能傾訴的對象，或是給自己一段安靜的時間。' + advice;
    }
  }

  return { interpretation, fortune, advice };
}

/** 主函數：分析夢境 */
export function analyzeDream(dream: string, feeling?: string): DreamResult {
  if (!dream || dream.trim().length === 0) {
    return {
      symbols: [],
      interpretation: '請描述你的夢境內容，才能進行解夢分析。',
      fortune: '中',
      advice: '夢境是通往潛意識的橋樑，請詳細記錄你的夢境，每一個細節都可能蘊含重要的訊息。',
    };
  }

  const symbols = extractSymbols(dream);

  if (symbols.length === 0) {
    const generic = buildGenericAnalysis(dream, feeling);
    return {
      symbols: [],
      ...generic,
    };
  }

  // 合併所有找到的符號解釋
  const interpretations: string[] = [];
  let fortuneScores: number[] = [];

  for (const symbol of symbols) {
    const entry = SYMBOL_DICTIONARY[symbol];
    if (entry) {
      interpretations.push(`【${symbol}】${entry.interpretation}`);
      fortuneScores.push(entry.fortune === '吉' ? 1 : entry.fortune === '凶' ? -1 : 0);
    }
  }

  // 綜合吉凶：加總計算
  const totalScore = fortuneScores.reduce((sum, s) => sum + s, 0);
  let baseFortune: '吉' | '中' | '凶' = '中';
  if (totalScore >= 2) baseFortune = '吉';
  else if (totalScore <= -2) baseFortune = '凶';

  // 整合建議
  const advices: string[] = [];
  for (const symbol of symbols) {
    const entry = SYMBOL_DICTIONARY[symbol];
    if (entry) {
      advices.push(entry.advice);
    }
  }

  const baseInterpretation = [
    `你的夢境中出現了以下關鍵元素：${symbols.map(s => `「${s}」`).join('、')}。以下是各元素的象徵解析：`,
    '',
    ...interpretations,
  ].join('\n');

  const baseAdvice = [
    '【綜合建議】',
    ...advices.map((a, i) => `${i + 1}. ${a}`),
  ].join('\n');

  const baseResult = {
    interpretation: baseInterpretation,
    fortune: baseFortune,
    advice: baseAdvice,
  };

  // 情緒調整
  const adjusted = applyFeelingAdjustment(baseResult, feeling);

  return {
    symbols,
    ...adjusted,
  };
}
