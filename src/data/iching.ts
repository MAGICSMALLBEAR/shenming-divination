// 六十四卦 — 卦名、符號、簡明占卜解說
export interface Hexagram {
  number: number;     // 1-64
  name: string;       // 卦名
  symbol: string;     // 六爻符號（上卦/下卦）
  image: string;      // 卦象
  guidance: string;   // 占卜指引（一句話）
  action: string;     // 建議行動
  caution: string;    // 需要留意
  luck: 'great' | 'good' | 'neutral' | 'caution' | 'challenge';
}

export const HEXAGRAMS: Hexagram[] = [
  { number: 1,  name: '乾',   symbol: '☰☰', image: '天', guidance: '天行健，君子以自強不息。運勢旺盛，大有可為。', action: '主動出擊，積極推進計畫。', caution: '剛強有餘，避免過於強勢。', luck: 'great' },
  { number: 2,  name: '坤',   symbol: '☷☷', image: '地', guidance: '地勢坤，君子以厚德載物。以柔克剛，靜待時機。', action: '順勢而為，包容配合。', caution: '過於被動可能錯失良機。', luck: 'good' },
  { number: 3,  name: '屯',   symbol: '☵☳', image: '水雷', guidance: '萬事起頭難，草創初期宜穩扎穩打。', action: '先做好準備，不要急於求成。', caution: '起步艱難，多尋貴人協助。', luck: 'caution' },
  { number: 4,  name: '蒙',   symbol: '☶☵', image: '山水', guidance: '啟蒙學習之時，謙虛受教為上。', action: '虛心求教，積累知識與經驗。', caution: '莫輕視他人的建議。', luck: 'neutral' },
  { number: 5,  name: '需',   symbol: '☵☰', image: '水天', guidance: '等待時機，養精蓄銳，時機未到不可輕動。', action: '耐心等待，做好準備工作。', caution: '切忌焦躁，強行而為必生波折。', luck: 'neutral' },
  { number: 6,  name: '訟',   symbol: '☰☵', image: '天水', guidance: '口舌是非多，凡事宜協商，避免爭訟。', action: '退讓一步，以和為貴。', caution: '堅持到底可能兩敗俱傷。', luck: 'caution' },
  { number: 7,  name: '師',   symbol: '☷☵', image: '地水', guidance: '統籌規劃，領導眾人，以德服人。', action: '善用人才，分工合作。', caution: '獨斷獨行難以成事。', luck: 'good' },
  { number: 8,  name: '比',   symbol: '☵☷', image: '水地', guidance: '親密合作，相輔相成，貴在誠信。', action: '主動建立合作關係。', caution: '擇友需慎，避免依賴錯誤的人。', luck: 'good' },
  { number: 9,  name: '小畜', symbol: '☴☰', image: '風天', guidance: '積小成多，循序漸進，暫時蓄勢。', action: '做好細節，積累資源。', caution: '大展宏圖的時機尚未成熟。', luck: 'neutral' },
  { number: 10, name: '履',   symbol: '☰☱', image: '天澤', guidance: '謹慎踏實，步步為營，如履薄冰。', action: '循規蹈矩，避免冒險。', caution: '莽撞行事容易惹禍上身。', luck: 'neutral' },
  { number: 11, name: '泰',   symbol: '☷☰', image: '地天', guidance: '天地交泰，萬物通順，否極泰來。', action: '把握順境，積極進取。', caution: '盛極而衰，居安思危。', luck: 'great' },
  { number: 12, name: '否',   symbol: '☰☷', image: '天地', guidance: '天地不交，運勢受阻，暫時韜光養晦。', action: '靜待時機，充實自己。', caution: '強行推進只會徒勞無功。', luck: 'challenge' },
  { number: 13, name: '同人', symbol: '☰☲', image: '天火', guidance: '志同道合，廣結善緣，合作共贏。', action: '尋找有共同目標的夥伴。', caution: '小圈子思維限制發展。', luck: 'good' },
  { number: 14, name: '大有', symbol: '☲☰', image: '火天', guidance: '大豐收之象，才華與機運兼備。', action: '大膽展示自己的才能。', caution: '財多惹禍，善加管理。', luck: 'great' },
  { number: 15, name: '謙',   symbol: '☷☶', image: '地山', guidance: '謙遜卑下，福澤深厚，謙受益滿招損。', action: '放低姿態，虛懷若谷。', caution: '過於自大將失去貴人。', luck: 'good' },
  { number: 16, name: '豫',   symbol: '☳☷', image: '雷地', guidance: '順應民心，與眾同樂，凝聚人心之時。', action: '激勵眾人，分享成果。', caution: '貪圖安逸容易荒廢正事。', luck: 'good' },
  { number: 17, name: '隨',   symbol: '☱☳', image: '澤雷', guidance: '隨機應變，順勢而行，跟隨正確方向。', action: '靈活調整，跟隨大局。', caution: '隨波逐流可能迷失自我。', luck: 'neutral' },
  { number: 18, name: '蠱',   symbol: '☶☴', image: '山風', guidance: '舊弊革新，除舊布新，整頓內部。', action: '找出問題根源，徹底解決。', caution: '拖延整改問題會愈加嚴重。', luck: 'caution' },
  { number: 19, name: '臨',   symbol: '☷☱', image: '地澤', guidance: '居高臨下，親自督察，把握有利時機。', action: '親力親為，掌控局面。', caution: '機會轉瞬即逝，切勿猶豫。', luck: 'good' },
  { number: 20, name: '觀',   symbol: '☴☷', image: '風地', guidance: '觀察全局，靜觀其變，深思熟慮。', action: '廣泛收集資訊，全面評估。', caution: '看而不動，時機可能流失。', luck: 'neutral' },
  { number: 21, name: '噬嗑', symbol: '☲☳', image: '火雷', guidance: '克服阻礙，果斷行事，咬緊牙關突破。', action: '直面問題，勇敢解決。', caution: '手段過激可能傷及無辜。', luck: 'good' },
  { number: 22, name: '賁',   symbol: '☶☲', image: '山火', guidance: '注重外表形象，以美修飾，但本質更重要。', action: '適度包裝，提升個人形象。', caution: '過度注重外表忽略內涵。', luck: 'neutral' },
  { number: 23, name: '剝',   symbol: '☶☷', image: '山地', guidance: '根基動搖，運勢消退，宜守不宜攻。', action: '保守守成，減少損耗。', caution: '任何冒險行動都可能造成損失。', luck: 'challenge' },
  { number: 24, name: '復',   symbol: '☷☳', image: '地雷', guidance: '一陽來復，否極泰來，重新出發。', action: '重新整頓，從頭再來。', caution: '操之過急反而欲速則不達。', luck: 'good' },
  { number: 25, name: '無妄', symbol: '☰☳', image: '天雷', guidance: '自然真誠，無私無欲，順其自然。', action: '誠實行事，勿懷機心。', caution: '凡事需合情理，勿強求。', luck: 'good' },
  { number: 26, name: '大畜', symbol: '☶☰', image: '山天', guidance: '大量積蓄，養精蓄銳，厚積薄發。', action: '持續積累，不急於變現。', caution: '好高騖遠，忽視基礎。', luck: 'good' },
  { number: 27, name: '頤',   symbol: '☶☳', image: '山雷', guidance: '頤養正道，慎言慎食，養護身心。', action: '注重健康，管好飲食起居。', caution: '縱情聲色將損耗元氣。', luck: 'neutral' },
  { number: 28, name: '大過', symbol: '☱☴', image: '澤風', guidance: '超出常軌，危機與機遇並存，需大智慧。', action: '非常時期需非常手段。', caution: '過度冒險可能崩潰，需有退路。', luck: 'caution' },
  { number: 29, name: '坎',   symbol: '☵☵', image: '水水', guidance: '險難重重，但君子坦蕩蕩，誠信化險。', action: '保持誠信，堅持正道。', caution: '慌亂行事只會深陷困境。', luck: 'challenge' },
  { number: 30, name: '離',   symbol: '☲☲', image: '火火', guidance: '光明才智，如日中天，凡事清明。', action: '展示才華，光芒四射。', caution: '鋒芒過露易遭嫉妒。', luck: 'great' },
  { number: 31, name: '咸',   symbol: '☱☶', image: '澤山', guidance: '感應交流，情感相通，感情運佳。', action: '主動溝通，表達情感。', caution: '衝動行事可能破壞關係。', luck: 'good' },
  { number: 32, name: '恆',   symbol: '☳☴', image: '雷風', guidance: '持之以恆，堅定不移，始終如一。', action: '堅持既定方向，不輕易放棄。', caution: '固執不知變通亦是缺陷。', luck: 'good' },
  { number: 33, name: '遯',   symbol: '☰☶', image: '天山', guidance: '適時退隱，以退為進，韜光養晦。', action: '暫時撤退，保存實力。', caution: '勉強堅守只會耗損精力。', luck: 'neutral' },
  { number: 34, name: '大壯', symbol: '☳☰', image: '雷天', guidance: '壯盛之極，勇氣十足，但需量力而行。', action: '勇往直前，把握有利局勢。', caution: '過於剛猛，容易橫生枝節。', luck: 'good' },
  { number: 35, name: '晉',   symbol: '☲☷', image: '火地', guidance: '晉升進步，前途光明，受到賞識。', action: '積極表現，爭取晉升機會。', caution: '驕傲自滿可能前功盡棄。', luck: 'great' },
  { number: 36, name: '明夷', symbol: '☷☲', image: '地火', guidance: '光明受壓，處境艱難，宜韜光養晦。', action: '低調行事，默默積蓄力量。', caution: '鋒芒太露可能招致打壓。', luck: 'caution' },
  { number: 37, name: '家人', symbol: '☴☲', image: '風火', guidance: '家庭和睦，各守本分，齊心協力。', action: '重視家庭關係，以誠待人。', caution: '不修內政難以外治。', luck: 'good' },
  { number: 38, name: '睽',   symbol: '☲☱', image: '火澤', guidance: '意見相左，分歧對立，尋求共識。', action: '放下成見，尋找共同點。', caution: '固執己見只會擴大分歧。', luck: 'caution' },
  { number: 39, name: '蹇',   symbol: '☵☶', image: '水山', guidance: '前路多阻，舉步維艱，需靠貴人相助。', action: '尋求援助，調整方向。', caution: '勉強前行只會更加艱難。', luck: 'challenge' },
  { number: 40, name: '解',   symbol: '☳☵', image: '雷水', guidance: '困難解除，撥雲見日，行動的好時機。', action: '把握時機，迅速行動。', caution: '懶散拖延可能讓機會溜走。', luck: 'good' },
  { number: 41, name: '損',   symbol: '☶☱', image: '山澤', guidance: '有所損失方能有所得，捨得之道。', action: '放下執念，以損換益。', caution: '不必要的節省可能因小失大。', luck: 'neutral' },
  { number: 42, name: '益',   symbol: '☴☳', image: '風雷', guidance: '增益豐收，大好時機，廣積善緣。', action: '積極行動，廣結人緣。', caution: '不思進取可能錯失良機。', luck: 'great' },
  { number: 43, name: '夬',   symbol: '☱☰', image: '澤天', guidance: '決斷果敢，公開宣示，毫不妥協。', action: '果斷決策，勇於表達立場。', caution: '衝動行事可能引起反彈。', luck: 'good' },
  { number: 44, name: '姤',   symbol: '☰☴', image: '天風', guidance: '邂逅良機，意外遇見，緣分之卦。', action: '保持開放心態，把握意外機緣。', caution: '輕易受誘惑容易犯錯。', luck: 'neutral' },
  { number: 45, name: '萃',   symbol: '☱☷', image: '澤地', guidance: '人才聚集，共謀大事，凝聚力強。', action: '聚集人才，共同奮鬥。', caution: '人多口雜，決策需明確。', luck: 'good' },
  { number: 46, name: '升',   symbol: '☷☴', image: '地風', guidance: '向上晉升，步步高升，前途光明。', action: '踏實進取，循序漸進往上走。', caution: '急於求成可能適得其反。', luck: 'great' },
  { number: 47, name: '困',   symbol: '☱☵', image: '澤水', guidance: '陷入困境，四面受阻，考驗意志力。', action: '保持信念，等待突破時機。', caution: '怨天尤人於事無補。', luck: 'challenge' },
  { number: 48, name: '井',   symbol: '☵☴', image: '水風', guidance: '如井之水，取之不盡，修養內德。', action: '深耕專業，提升核心價值。', caution: '不思進修，才能會逐漸枯竭。', luck: 'neutral' },
  { number: 49, name: '革',   symbol: '☱☲', image: '澤火', guidance: '革舊鼎新，除舊布新，大變革之時。', action: '勇於創新，推動變革。', caution: '變革需循序漸進，莫操之過急。', luck: 'good' },
  { number: 50, name: '鼎',   symbol: '☲☴', image: '火風', guidance: '鼎盛之象，功成名就，轉化昇華。', action: '整合資源，展現成果。', caution: '固步自封會阻礙進一步發展。', luck: 'great' },
  { number: 51, name: '震',   symbol: '☳☳', image: '雷雷', guidance: '雷聲震天，驚而不懼，振作精神。', action: '保持警惕，積極應對衝擊。', caution: '驚慌失措只會加劇混亂。', luck: 'caution' },
  { number: 52, name: '艮',   symbol: '☶☶', image: '山山', guidance: '靜止不動，止於所止，守靜待變。', action: '沉澱自己，不要輕舉妄動。', caution: '過於保守可能錯失機會。', luck: 'neutral' },
  { number: 53, name: '漸',   symbol: '☴☶', image: '風山', guidance: '循序漸進，穩紮穩打，水到渠成。', action: '一步一步來，勿求速成。', caution: '跳躍式發展往往不穩固。', luck: 'good' },
  { number: 54, name: '歸妹', symbol: '☳☱', image: '雷澤', guidance: '遵循正道，名正言順，注重關係的本質。', action: '踏實處理關係，勿追求虛名。', caution: '不顧現實的期待容易受傷。', luck: 'caution' },
  { number: 55, name: '豐',   symbol: '☳☲', image: '雷火', guidance: '豐盛之極，光明遠大，把握豐收時機。', action: '大膽行動，收穫豐厚成果。', caution: '盛極而衰，要有居安思危之心。', luck: 'great' },
  { number: 56, name: '旅',   symbol: '☲☶', image: '火山', guidance: '旅途奔波，客居他鄉，隨遇而安。', action: '靈活應變，廣結善緣。', caution: '過於固執己見容易惹麻煩。', luck: 'neutral' },
  { number: 57, name: '巽',   symbol: '☴☴', image: '風風', guidance: '柔順入微，貫徹始終，影響深遠。', action: '溫和但堅定地推動計畫。', caution: '過於謙退可能顯得軟弱。', luck: 'good' },
  { number: 58, name: '兌',   symbol: '☱☱', image: '澤澤', guidance: '喜悅和悅，廣受歡迎，人際和諧。', action: '和顏悅色，主動與人交流。', caution: '過於取悅他人失去自我。', luck: 'good' },
  { number: 59, name: '渙',   symbol: '☴☵', image: '風水', guidance: '渙散渙解，化解隔閡，凝聚共識。', action: '打破隔閡，促進溝通合作。', caution: '注意資源和人心的渙散流失。', luck: 'neutral' },
  { number: 60, name: '節',   symbol: '☵☱', image: '水澤', guidance: '節制有度，守中持正，適可而止。', action: '適度節制，量力而行。', caution: '過度節省可能因小失大。', luck: 'neutral' },
  { number: 61, name: '中孚', symbol: '☴☱', image: '風澤', guidance: '誠信感人，以誠服人，信念堅定。', action: '以真誠打動人心。', caution: '言行不一將失去他人信任。', luck: 'great' },
  { number: 62, name: '小過', symbol: '☳☶', image: '雷山', guidance: '行小事可，行大事難，謹慎為上。', action: '做好眼前的小事，積少成多。', caution: '好高騖遠，貪大求全。', luck: 'neutral' },
  { number: 63, name: '既濟', symbol: '☵☲', image: '水火', guidance: '大事已成，圓滿完成，防患未然。', action: '鞏固成果，防止功虧一簣。', caution: '自以為功成名就而鬆懈大意。', luck: 'good' },
  { number: 64, name: '未濟', symbol: '☲☵', image: '火水', guidance: '事業未竟，繼續奮鬥，前途有望。', action: '不要放棄，繼續努力衝刺。', caution: '輕率行事在最後階段容易功虧一簣。', luck: 'caution' },
];

const LUCK_COLOR: Record<Hexagram['luck'], string> = {
  great: '#FFD700',
  good: '#7EC850',
  neutral: '#C9A96E',
  caution: '#E8A030',
  challenge: '#E05050',
};
const LUCK_LABEL: Record<Hexagram['luck'], string> = {
  great: '大吉', good: '吉', neutral: '平', caution: '小吉帶戒', challenge: '需謹慎',
};

export function getLuckColor(luck: Hexagram['luck']): string { return LUCK_COLOR[luck]; }
export function getLuckLabel(luck: Hexagram['luck']): string { return LUCK_LABEL[luck]; }

export function drawHexagram(seed?: number): Hexagram {
  const s = seed ?? Date.now();
  const idx = ((s * 1664525 + 1013904223) >>> 0) % 64;
  return HEXAGRAMS[idx];
}
