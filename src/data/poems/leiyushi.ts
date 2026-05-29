// 雷雨師百首籤詩 (完整100首)
// 又稱「雷雨師籤」，台灣常見籤詩系統，關聖帝君、觀世音菩薩等均採用

export interface Poem {
  id: number;
  number: number;
  ganzhi: string;        // 干支
  level: string;         // 吉凶等級: 上上, 大吉, 中平, 下下, 中吉, 下下
  title: string;         // 籤題
  content: string;       // 籤詩本文
  vernacular: string;    // 白話解釋
  story: string;         // 典故
  jieYue: JieYue;        // 解曰(傳統籤解)
}

export interface JieYue {
  marriage: string;
  wealth: string;
  career: string;
  health: string;
  travel: string;
  study: string;
  general: string;
}

export const leiyushiPoems: Poem[] = [
  {
    id: 1, number: 1, ganzhi: '甲子', level: '大吉', title: '周幽王舉烽火',
    content: '巍巍獨步向雲間，玉殿千官在此班。\n玉殿千官皆拱手，天然富貴逼人來。',
    vernacular: '你就像獨自走向雲端一樣出眾，身處於眾人仰慕的高位。身邊的人都對你禮敬有加，富貴自然而然地降臨到你身上。這是一支大吉之籤，表示時運亨通，凡事順遂。',
    story: '周幽王為博褒姒一笑，舉烽火戲諸侯。此典故提醒得勢者不可得意忘形，應珍惜當下。',
    jieYue: { marriage: '良緣天成，佳偶可覓', wealth: '財運亨通，自有收穫', career: '平步青雲，位高權重', health: '身心安康', travel: '一帆風順', study: '金榜題名', general: '大吉大利，萬事順遂' }
  },
  {
    id: 2, number: 2, ganzhi: '乙丑', level: '上上', title: '蘇武牧羊',
    content: '於今此景正當時，看看欲吐百花奇。\n若能遇得春風到，直上雲霄在及時。',
    vernacular: '現在正是時機成熟的時候，萬事都準備開花結果。只要等待春風（貴人、機遇）一到，就能立刻青雲直上。提醒你要把握時機。',
    story: '蘇武出使匈奴被扣留，牧羊北海十九年，終得歸漢。象徵堅忍不屈終得回報。',
    jieYue: { marriage: '時機成熟，良緣將至', wealth: '守得雲開見月明', career: '耐心等待，即將升遷', health: '日漸康復', travel: '等待時機', study: '時機到自然有成', general: '等待時機，萬事可成' }
  },
  {
    id: 3, number: 3, ganzhi: '丙寅', level: '中平', title: '張良遇黃石公',
    content: '勸君耐守舊生涯，把定身心莫信邪。\n直待有人輕著力，滿園枯木再開花。',
    vernacular: '建議你安守本分，堅定心志不要被誘惑所迷惑。等待有貴人輕輕相助，就像枯木花園重新開花一樣，困境終將好轉。',
    story: '張良在下邳橋上遇黃石公，為其拾鞋而得兵書。象徵虛心等待，終遇貴人。',
    jieYue: { marriage: '勿急躁，時候未到', wealth: '守成為上', career: '安守崗位，等待時機', health: '慢性病需耐心調理', travel: '暫不宜遠行', study: '專心致志，勿投機', general: '守成待時，不可妄動' }
  },
  {
    id: 4, number: 4, ganzhi: '丁卯', level: '中平', title: '呂后害韓信',
    content: '富貴由命天註定，心高必然誤君期。\n不如且回依舊路，雲開月出自分明。',
    vernacular: '富貴是上天註定的，強求反而耽誤了自己。不如回到原本的路上，時候到了自然會明朗。提醒不要好高騖遠。',
    story: '韓信功高震主，被呂后設計殺害。提醒功成身退、知足常樂的道理。',
    jieYue: { marriage: '強求無益，隨緣為上', wealth: '勿投機取巧', career: '安分守己，勿爭強鬥狠', health: '放寬心，勿過勞', travel: '謹慎行事', study: '腳踏實地', general: '知足常樂，不可強求' }
  },
  {
    id: 5, number: 5, ganzhi: '戊辰', level: '上上', title: '姜太公釣魚',
    content: '春雷發聲震乾坤，蟄戶驚開百鳥喧。\n一朝天氣回溫暖，枯木寒枝自發根。',
    vernacular: '像春雷震動天地，萬物甦醒，百鳥齊鳴。天氣回暖後，連枯木都會重新生根發芽。象徵時來運轉，萬象更新。',
    story: '姜太公垂釣渭水，願者上鉤，八十歲遇周文王。象徵耐心等待終遇明主。',
    jieYue: { marriage: '春風得意，良緣將至', wealth: '財運將要好轉', career: '苦盡甘來，升遷在即', health: '疾病將癒', travel: '大吉', study: '茅塞頓開', general: '時來運轉，萬事更新' }
  },
  {
    id: 6, number: 6, ganzhi: '己巳', level: '下下', title: '韓信受胯下之辱',
    content: '投身巖下飼於菟，須是其人會點筹。\n誰識始終皆得計，一時意氣不須求。',
    vernacular: '如同投身虎穴餵虎，需要有智慧的人才能算計周全。沒有人能看透事情的全貌，不要一時意氣用事。提醒你要忍耐。',
    story: '韓信少年時受胯下之辱，忍辱負重終成大器。此籤提醒忍耐的重要性。',
    jieYue: { marriage: '暫且忍耐，不宜強求', wealth: '守成為上，不宜投資', career: '忍辱負重，等待時機', health: '謹慎調理', travel: '暫不宜動', study: '埋頭苦讀', general: '忍一時風平浪靜' }
  },
  {
    id: 7, number: 7, ganzhi: '庚午', level: '中平', title: '唐明皇遊月宮',
    content: '一場春夢幾時休，名利猶如水上漚。\n若得清風明月夜，不知何處是瀛洲。',
    vernacular: '人生如春夢般短暫，名利就像水上的泡沫。若能清風明月相伴，何必尋找虛無的仙境。提醒看淡名利。',
    story: '唐明皇夢遊月宮，醒來一切成空。象徵富貴如浮雲，知足常樂。',
    jieYue: { marriage: '勿過於執著', wealth: '名利如浮雲', career: '放寬心胸', health: '清心寡慾', travel: '隨遇而安', study: '淡泊明志', general: '看淡得失，隨緣自在' }
  },
  {
    id: 8, number: 8, ganzhi: '辛未', level: '上上', title: '劉備三顧茅廬',
    content: '鸞鳳沖霄意氣雄，文章擲地作金聲。\n雲程有路終須到，丹桂生香在此行。',
    vernacular: '像鸞鳳直飛沖天，氣勢雄壯，文章落地有金石之聲。青雲之路一定能走到，功名就在這一次的行動中。',
    story: '劉備三顧茅廬請諸葛亮出山，誠意感動賢才。象徵誠心必有所成。',
    jieYue: { marriage: '良緣可成', wealth: '名利雙收', career: '青雲直上', health: '精力充沛', travel: '前程似錦', study: '必定高中', general: '萬事亨通，心想事成' }
  },
  {
    id: 9, number: 9, ganzhi: '壬申', level: '中平', title: '陶淵明歸隱',
    content: '富貴由來未許求，何必騎鶴上揚州。\n與其十事九如夢，不如隨緣莫強求。',
    vernacular: '富貴從來不是強求能得的，何必妄想騎鶴上揚州（指奢求）。與其十件事九件不如意，不如隨緣不強求。',
    story: '陶淵明不為五斗米折腰，歸隱田園。象徵放下執著，回歸本心。',
    jieYue: { marriage: '隨緣莫強求', wealth: '平淡是福', career: '不宜冒進', health: '清心寡慾', travel: '隨心而行', study: '平常心應對', general: '知足常樂' }
  },
  {
    id: 10, number: 10, ganzhi: '癸酉', level: '大吉', title: '孔明借東風',
    content: '好將錦繡作生涯，到處江湖可作家。\n何必區區分爾我，長安市上酒如花。',
    vernacular: '好好運用你的才華來規劃人生，到處都可以是安身立命之處。何必分得那麼清楚你我，長安市上的美酒如花盛開。心胸開闊，處處是家。',
    story: '諸葛亮借東風火燒赤壁，善用天時地利。象徵把握時機，大展鴻圖。',
    jieYue: { marriage: '良緣天成', wealth: '財源廣進', career: '大展鴻圖', health: '精力旺盛', travel: '四海為家', study: '學業大進', general: '大吉大利，前程萬里' }
  },
  {
    id: 11, number: 11, ganzhi: '甲戌', level: '上上', title: '劉備娶親',
    content: '事端百出慮雖長，莫聽人言自主張。\n一著仙機君記取，紛紛俗子自招殃。',
    vernacular: '事情雖然複雜，但不要聽信他人，要有自己的主張。把握關鍵的時機點，那些庸俗之人自然會自食其果。',
    story: '劉備過江娶孫尚香，憑藉智慧化險為夷。提醒要有主見。',
    jieYue: { marriage: '自有主見，良緣可成', wealth: '獨立判斷，財源自來', career: '堅持己見，終有所成', health: '自主調理', travel: '可行', study: '獨立思考', general: '相信自己，莫聽讒言' }
  },
  {
    id: 12, number: 12, ganzhi: '乙亥', level: '中平', title: '蘇東坡遊赤壁',
    content: '時運未通未可為，欲求無事亦難知。\n不如退守安全地，等待春風送暖時。',
    vernacular: '時運還沒到，做什麼都不太順利，想求平安也很難。不如退守安全的地方，等待春風（轉機）的到來。',
    story: '蘇東坡貶謫黃州，遊赤壁寫下千古文章。困境中孕育偉大作品。',
    jieYue: { marriage: '暫緩為宜', wealth: '以守代攻', career: '暫且忍耐', health: '休養生息', travel: '不宜遠行', study: '默默耕耘', general: '韜光養晦，以待時機' }
  },
  {
    id: 13, number: 13, ganzhi: '丙子', level: '大吉', title: '姜子牙封神',
    content: '禹門跳浪自天來，變化魚龍上九垓。\n但得風雲多際會，一聲雷動上天台。',
    vernacular: '像鯉魚躍龍門，從天而降的浪濤中，變化成龍飛上九天。只要風雲際會（遇到好時機），一聲雷響就飛上天台。',
    story: '姜子牙封神，從漁夫到位極人臣。象徵命運大轉變。',
    jieYue: { marriage: '吉，良緣將至', wealth: '暴發之象', career: '飛黃騰達', health: '轉危為安', travel: '一路順風', study: '一舉成名', general: '大吉，天命所歸' }
  },
  {
    id: 14, number: 14, ganzhi: '丁丑', level: '中平', title: '莊子夢蝶',
    content: '宛如仙鶴出樊籠，脫却羈縻處處通。\n南北東西無障礙，任君直上九霄中。',
    vernacular: '就像仙鶴掙脫牢籠，擺脫束縛後到處通達。東南西北再無阻礙，可以直上九雲霄。但需先能脫困。',
    story: '莊子夢蝶，不知是莊周夢蝶還是蝶夢莊周。象徵超脫束縛的智慧。',
    jieYue: { marriage: '脫離困境後可成', wealth: '先難後易', career: '換環境則通', health: '病去如抽絲', travel: '離開原地為佳', study: '換方法則通', general: '突破束縛，海闊天空' }
  },
  {
    id: 15, number: 15, ganzhi: '戊寅', level: '大吉', title: '鍾馗捉鬼',
    content: '管取雲程還萬仞，等閑平步到天衢。\n功名富貴皆前定，何必區區嘆路途。',
    vernacular: '你的前程就像萬仞高山，但可以輕鬆平步走到天上去。功名富貴都是前世註定的，何必為了一時的不順而嘆氣。',
    story: '鍾馗雖貌醜但才高八斗，死後被封為捉鬼大神。象徵外表不重要，本事才是關鍵。',
    jieYue: { marriage: '命中註定', wealth: '富貴在天', career: '平步青雲', health: '吉人天相', travel: '一路順遂', study: '功名在望', general: '天命所歸，無需憂慮' }
  },
  {
    id: 16, number: 16, ganzhi: '己卯', level: '中平', title: '伍子胥過昭關',
    content: '一夕春雷震地聲，風吹雲散見天清。\n園林自有新景象，萬紫千紅總是春。',
    vernacular: '一夜春雷震地響，風吹散了烏雲見清天。園林自然會有新氣象，萬紫千紅都是春的象徵。黑暗過後就是光明。',
    story: '伍子胥過昭關一夜白頭，終逃出生天。象徵歷經磨難終見曙光。',
    jieYue: { marriage: '柳暗花明', wealth: '困境將過', career: '轉機將至', health: '病將癒', travel: '障礙可過', study: '豁然開朗', general: '否極泰來，轉危為安' }
  },
  {
    id: 17, number: 17, ganzhi: '庚辰', level: '中平', title: '李廣不遇時',
    content: '聞道今宵是上元，銀燈火樹照乾坤。\n千金不換今宵樂，誰識蓬門有至尊。',
    vernacular: '聽說今晚是元宵佳節，銀色燈光照亮天地。千金也換不來今宵的快樂，誰知道平凡人家也有其快樂。珍惜當下的美好。',
    story: '飛將軍李廣一生征戰卻未能封侯。提醒時運的重要，才華也需要機遇。',
    jieYue: { marriage: '享受當下', wealth: '知足常樂', career: '時運未到', health: '小病無礙', travel: '近遊為佳', study: '厚積薄發', general: '珍惜當下，勿好高騖遠' }
  },
  {
    id: 18, number: 18, ganzhi: '辛巳', level: '上上', title: '孟嘗君食客',
    content: '十年寒窗苦讀書，一朝得志見龍魚。\n禹門三汲桃花浪，平地一聲震太虛。',
    vernacular: '十年寒窗苦讀，一朝得志就像見到龍和魚一樣。越過禹門三汲的桃花浪，平地一聲雷震動天地。苦讀終有出頭日。',
    story: '孟嘗君廣納食客三千，雞鳴狗盜之輩亦能救其性命。象徵廣結善緣的重要性。',
    jieYue: { marriage: '苦盡甘來', wealth: '收穫可期', career: '一飛沖天', health: '日漸好轉', travel: '大展鴻圖', study: '金榜題名', general: '天道酬勤，功不唐捐' }
  },
  {
    id: 19, number: 19, ganzhi: '壬午', level: '中平', title: '劉伶醉酒',
    content: '世事到頭都是夢，不如高臥且加餐。\n世間無限丹青手，一片傷心畫不成。',
    vernacular: '世間萬事到頭來都是一場夢，不如好好吃飯休息。再好的畫家也畫不出這種傷心的感覺。有些事只能自己體會。',
    story: '劉伶嗜酒避世，為竹林七賢之一。提醒適時放下，不必過於強求。',
    jieYue: { marriage: '看淡些', wealth: '不強求', career: '隨遇而安', health: '靜養為上', travel: '暫歇', study: '順其自然', general: '一切都是最好的安排' }
  },
  {
    id: 20, number: 20, ganzhi: '癸未', level: '大吉', title: '范進中舉',
    content: '鯉魚跳躍出深淵，直上雲霄會衆仙。\n一躍便登龍虎榜，風雲際會在人前。',
    vernacular: '像鯉魚從深淵一躍而出，直飛雲霄與眾仙相會。一躍就登上龍虎榜，風雲際會就在眼前。即將飛黃騰達。',
    story: '范進中舉，年過半百終考取功名。象徵堅持不懈終有回報，但也提醒勿得意忘形。',
    jieYue: { marriage: '佳偶天成', wealth: '名利雙收', career: '一步登天', health: '精力旺盛', travel: '前程似錦', study: '一舉成名', general: '大吉大利，青雲直上' }
  },
  {
    id: 21, number: 21, ganzhi: '甲申', level: '中吉', title: '關羽過五關',
    content: '一關度過一關來，此事猶如花謝開。\n若得東君著力處，何愁枯木不花開。',
    vernacular: '一關過了又來一關，就像花謝了又開一樣。如果能得到貴人（東君）相助，何必擔心枯木不開花。',
    story: '關羽過五關斬六將，千里尋兄。象徵忠義兩全，終能克服萬難。',
    jieYue: { marriage: '一波三折終有成', wealth: '漸入佳境', career: '關關難過關關過', health: '逐步康復', travel: '謹慎前行', study: '循序漸進', general: '有志者事竟成' }
  },
  {
    id: 22, number: 22, ganzhi: '乙酉', level: '中平', title: '伯牙碎琴',
    content: '當初無意種良緣，此日相逢似有緣。\n無奈人情多反覆，花開花落兩難全。',
    vernacular: '當初無意中種下了緣分，今日相逢好像真有緣。無奈人情反覆無常，花開花落兩難全。提醒珍惜當下。',
    story: '伯牙因子期死而碎琴，從此不再彈琴。知音難覓。',
    jieYue: { marriage: '有情卻多磨難', wealth: '得失無常', career: '貴人難遇', health: '情緒影響', travel: '隨緣而行', study: '需要良師', general: '珍惜眼前人' }
  },
  {
    id: 23, number: 23, ganzhi: '丙戌', level: '中吉', title: '觀音菩薩收紅孩兒',
    content: '日出扶桑萬里明，貴人指引得前程。\n行人從此無阻滯，一舉成名天下聞。',
    vernacular: '太陽從扶桑升起照亮萬里，有貴人指引得到好前程。從此一路順遂無阻，一舉成名天下皆知。貴人將至。',
    story: '觀音菩薩收服紅孩兒，以慈悲智慧化解干戈。象徵以柔克剛。',
    jieYue: { marriage: '貴人牽線', wealth: '貴人相助', career: '得遇伯樂', health: '遇良醫', travel: '有貴人相助', study: '名師指點', general: '貴人將至，萬事可成' }
  },
  {
    id: 24, number: 24, ganzhi: '丁亥', level: '下下', title: '杜鵑啼血',
    content: '一聲杜宇夕陽中，暮雨瀟瀟溼翠叢。\n自是春歸無處覓，可憐花落滿階紅。',
    vernacular: '夕陽中杜鵑鳥叫，晚雨瀟瀟淋濕了翠綠的樹叢。春天已經過去無處可尋，可憐花瓣落滿階梯。提醒時機已過。',
    story: '杜鵑啼血，望帝春心託杜鵑。象徵時不我予、無可奈何。',
    jieYue: { marriage: '時機已過', wealth: '景氣不佳', career: '錯失良機', health: '需多休養', travel: '不宜遠行', study: '暫時低落', general: '韜光養晦，等待下一個春天' }
  },
  {
    id: 25, number: 25, ganzhi: '戊子', level: '中吉', title: '文王渭水訪賢',
    content: '求賢若渴訪溪頭，渭水茫茫不斷流。\n幸得老臣施妙策，從今國祚永無憂。',
    vernacular: '君王求賢若渴來到溪邊，渭水茫茫不斷流。有幸得到老臣的妙策，從此國家永遠無憂。將遇貴人。',
    story: '周文王渭水訪姜太公，用八百年周朝基業回報。象徵禮賢下士的回報。',
    jieYue: { marriage: '需人介紹', wealth: '需請教高人', career: '遇明主', health: '求良醫', travel: '有人指引', study: '拜名師', general: '求教於人，必有所獲' }
  },
  {
    id: 26, number: 26, ganzhi: '己丑', level: '中平', title: '劉禹錫遊玄都觀',
    content: '滿園桃李正芳菲，紅白相交映翠微。\n不必移根栽別處，此間風水自光輝。',
    vernacular: '滿園桃李正盛開芬芳，紅白相間映著翠綠。不必移到別處栽種，這裡的風水自然光輝。守在原地即可。',
    story: '劉禹錫兩度遊玄都觀作詩，雖遭貶謫不改其志。象徵堅守本心。',
    jieYue: { marriage: '現有對象為佳', wealth: '守成為上', career: '不宜跳槽', health: '原地調養', travel: '暫不宜遠行', study: '在原校為佳', general: '安定為上，以守代攻' }
  },
  {
    id: 27, number: 27, ganzhi: '庚寅', level: '中吉', title: '王昭君出塞',
    content: '遠看山色近看無，春風不度玉門關。\n羌笛何須怨楊柳，人生何處不青山。',
    vernacular: '遠看有山色近看卻沒有，春風吹不到玉門關。何必用羌笛悲傷楊柳，人生哪裡沒有青山。向前看，前方自有出路。',
    story: '王昭君出塞和親，犧牲小我完成大我。象徵顧全大局，犧牲有時是另一種成全。',
    jieYue: { marriage: '遠嫁或異地', wealth: '往遠處發展', career: '換環境為佳', health: '異地調養', travel: '遠方有利', study: '出外求學佳', general: '人生處處有轉機' }
  },
  {
    id: 28, number: 28, ganzhi: '辛卯', level: '大吉', title: '諸葛亮七擒孟獲',
    content: '龍門得到變通津，變化飛騰在此辰。\n從此一身長發奮，自然富貴百年身。',
    vernacular: '龍門一旦通過便暢通無阻，飛騰變化就在此刻。從此奮發向上，自然能得到百年富貴。時機已至，全力以赴。',
    story: '諸葛亮七擒七縱孟獲，以德服人。象徵以智慧與耐心最終獲勝。',
    jieYue: { marriage: '天賜良緣', wealth: '財源滾滾', career: '青雲直上', health: '龍馬精神', travel: '路路暢通', study: '高中在望', general: '大吉，從此風生水起' }
  },
  {
    id: 29, number: 29, ganzhi: '壬辰', level: '中平', title: '西施浣紗',
    content: '傾國傾城貌若仙，含羞無語立花前。\n心中自有分明事，何必逢人說可憐。',
    vernacular: '像西施一樣美麗傾城，含羞無語站在花前。心中自有分明的事情，何必遇到人就說自己可憐。自信自強，不必向外人解釋。',
    story: '西施浣紗溪邊，因美貌被選入宮。象徵美貌（優勢）也可能是負擔。',
    jieYue: { marriage: '無需急躁', wealth: '自有定數', career: '實力為本', health: '心安則健', travel: '隨緣', study: '自有分寸', general: '相信自己，無需解釋' }
  },
  {
    id: 30, number: 30, ganzhi: '癸巳', level: '上上', title: '劉秀起兵',
    content: '雷聲霹靂震天門，萬物逢春自發根。\n若遇貴人相指引，何愁金榜不題名。',
    vernacular: '雷霆霹靂震動天門，萬物遇到春天自然發根。若遇到貴人指引，何必擔心金榜不能題名。貴人相助，成功在望。',
    story: '劉秀起兵復興漢室，為光武帝。象徵從逆境中崛起。',
    jieYue: { marriage: '貴人牽線', wealth: '遇貴人指引', career: '得貴人提攜', health: '遇良醫', travel: '有貴人同行', study: '師長提攜', general: '吉星高照，貴人相助' }
  },
  {
    id: 31, number: 31, ganzhi: '甲午', level: '中平', title: '李清照悲秋',
    content: '秋風吹動桂花香，玉露凋傷樹葉黃。\n二十四番風信後，不知人在水中央。',
    vernacular: '秋風吹動桂花香，露水凋傷了枯黃的樹葉。二十四番花信風過後，不知人在哪裡。時節變換，人事已非。',
    story: '李清照南渡後，詞風轉為淒涼。象徵時局變遷、物是人非。',
    jieYue: { marriage: '聚散無常', wealth: '起落不定', career: '環境變遷', health: '季節性不適', travel: '時機未到', study: '靜待時機', general: '世事無常，平心靜氣' }
  },
  {
    id: 32, number: 32, ganzhi: '乙未', level: '大吉', title: '包公審奇案',
    content: '青天自有日分明，鐵面無私判斷清。\n一紙文書從此定，不須憂慮心頭驚。',
    vernacular: '青天自有太陽照亮，鐵面無私的判斷清楚。一紙文書就能定案，不必憂心驚慌。正義終將伸張。',
    story: '包拯鐵面無私，日審陽夜審陰。象徵公正終將到來。',
    jieYue: { marriage: '正緣將至', wealth: '公道自在', career: '公正處理', health: '良醫診治', travel: '平安無事', study: '考試順利', general: '公道自在人心，正義終將到來' }
  },
  {
    id: 33, number: 33, ganzhi: '丙申', level: '上上', title: '觀音菩薩顯靈',
    content: '紫竹林中觀自在，白蓮臺上現如來。\n若能誠心多禮拜，自然消災又免難。',
    vernacular: '紫竹林中觀世音菩薩自在現身，白蓮臺上顯現如來佛。若能誠心禮拜，自然能消災免難。誠心感動天。',
    story: '觀音菩薩聞聲救苦，大慈大悲。象徵只要誠心祈求，必得庇佑。',
    jieYue: { marriage: '誠心可得良緣', wealth: '善有善報', career: '真誠待人', health: '心誠則靈', travel: '平安', study: '專心致志', general: '心誠則靈，有求必應' }
  },
  {
    id: 34, number: 34, ganzhi: '丁酉', level: '中平', title: '韓愈被貶',
    content: '一封朝奏九重天，夕貶潮州路八千。\n欲為聖明除弊事，肯將衰朽惜殘年。',
    vernacular: '早上還在朝廷上奏，傍晚就被貶到八千里外的潮州。想為國家除弊事，卻落得如此下場。堅持正義卻遭挫折。',
    story: '韓愈諫迎佛骨被貶潮州，忠言逆耳。象徵即使做好事也可能遭誤解。',
    jieYue: { marriage: '遭人反對', wealth: '暫時損失', career: '堅持立場卻受阻', health: '過勞傷身', travel: '被逼遠行', study: '不被理解', general: '堅持正道，終有回報' }
  },
  {
    id: 35, number: 35, ganzhi: '戊戌', level: '中平', title: '李白醉寫清平調',
    content: '醉後清平調自成，雲裳花貌想容情。\n若非群玉山頭見，會向瑤臺月下迎。',
    vernacular: '醉後寫下清平調，雲裳花容令人傾倒。若不在群玉山頭相見，也要在瑤臺月下相逢。才華終被賞識。',
    story: '李白醉寫清平調三首，唐玄宗讚賞不已。象徵才華終有發揮之時。',
    jieYue: { marriage: '終會相遇', wealth: '才華可變現', career: '遇到欣賞者', health: '心曠神怡', travel: '有意外收穫', study: '才華被發現', general: '天生我材必有用' }
  },
  {
    id: 36, number: 36, ganzhi: '己亥', level: '上上', title: '趙匡胤陳橋兵變',
    content: '黃袍加身自有天，風雲際會在人前。\n從今以後名聲震，富貴榮華萬萬年。',
    vernacular: '黃袍加身是天的安排，風雲際會就在眼前。從此以後名聲大震，富貴榮華長長久久。天命所歸。',
    story: '趙匡胤陳橋兵變，黃袍加身建立宋朝。象徵時勢造英雄。',
    jieYue: { marriage: '天作之合', wealth: '富貴逼人', career: '一步登天', health: '身強體健', travel: '前程似錦', study: '名揚天下', general: '天命所歸，富貴可期' }
  },
  {
    id: 37, number: 37, ganzhi: '庚子', level: '中平', title: '阮籍哭窮途',
    content: '行到山窮水盡時，不如守己待天時。\n一朝春至冰霜解，枯木逢春發舊枝。',
    vernacular: '走到山窮水盡的時候，不如安守本分等待天時。春天一到冰霜就會溶解，枯木也會重新發芽。困境將過。',
    story: '阮籍駕車至窮途大哭而返。象徵絕望中的轉機。',
    jieYue: { marriage: '目前困難，日後可成', wealth: '先困後亨', career: '山窮水盡疑無路', health: '耐心調理', travel: '暫不宜行', study: '堅持不懈', general: '柳暗花明又一村' }
  },
  {
    id: 38, number: 38, ganzhi: '辛丑', level: '下下', title: '楊貴妃馬嵬坡',
    content: '繁華一夢轉頭空，玉碎珠沉在手中。\n莫道不消魂簾捲，西風吹盡滿樓空。',
    vernacular: '繁華如同一場夢，轉頭就空了，玉碎珠沉都在手中。不要說不傷心，西風吹盡滿樓都空了。繁華落盡。',
    story: '楊貴妃馬嵬坡被迫自盡，一代紅顏命喪黃泉。象徵盛極必衰。',
    jieYue: { marriage: '鏡花水月', wealth: '繁華落盡', career: '盛極必衰', health: '需要警惕', travel: '不宜', study: '一時挫折', general: '物極必反，謹慎行事' }
  },
  {
    id: 39, number: 39, ganzhi: '壬寅', level: '中吉', title: '唐僧取經',
    content: '西方路上十萬程，魔怪重重百樣生。\n幸有悟空來護法，取經歸去一身輕。',
    vernacular: '西方路上有十萬里，魔怪重重百般阻撓。幸有悟空護法，取經歸來一身輕。有幫手就能克服困難。',
    story: '唐三藏師徒四人西天取經，歷經八十一難。象徵團隊合作的重要。',
    jieYue: { marriage: '需要媒人', wealth: '合夥有利', career: '團隊合作', health: '需人照顧', travel: '有伴同行為佳', study: '結伴學習', general: '眾人拾柴火焰高' }
  },
  {
    id: 40, number: 40, ganzhi: '癸卯', level: '上上', title: '漢武帝見西王母',
    content: '瑤池王母降凡來，漢武宮中會玉臺。\n從今不用尋仙藥，自有長生不老胎。',
    vernacular: '西王母從瑤池降臨凡間，在漢武帝宮中相會。從此不用再尋找仙藥，自然有長生不老的機緣。奇遇將至。',
    story: '漢武帝夢見西王母賜仙桃。象徵福報深厚，奇遇連連。',
    jieYue: { marriage: '天賜良緣', wealth: '意外之財', career: '奇遇良機', health: '健康長壽', travel: '仙境之旅', study: '豁然開朗', general: '福星高照，奇遇連連' }
  },
  {
    id: 41, number: 41, ganzhi: '甲辰', level: '中吉', title: '張騫通西域',
    content: '欲求富貴須奔波，南北東西任去留。\n若遇貴人相助力，功名成就自無憂。',
    vernacular: '想要富貴必須四處奔波，東西南北任你去留。如果遇到貴人相助，功名成就自然無憂。走出去才有機會。',
    story: '張騫出使西域，開拓絲綢之路。象徵開拓精神帶來豐碩成果。',
    jieYue: { marriage: '異地姻緣', wealth: '四方得利', career: '外出發展', health: '多運動', travel: '遠行有利', study: '遊學有成', general: '路是人走出來的' }
  },
  {
    id: 42, number: 42, ganzhi: '乙巳', level: '中平', title: '嫦娥奔月',
    content: '碧海青天夜夜心，嫦娥應悔竊靈藥。\n高處不勝寒起舞，何如在世共徘徊。',
    vernacular: '碧海青天夜夜思念，嫦娥應該後悔偷了靈藥。高處不勝寒，獨自起舞，何如在人間相伴。高處不勝寒。',
    story: '嫦娥偷吃靈藥飛上廣寒宮，從此孤獨。象徵犧牲換來的未必是幸福。',
    jieYue: { marriage: '勿因小失大', wealth: '得不償失', career: '高處不勝寒', health: '注意保養', travel: '遠離未必好', study: '腳踏實地', general: '珍惜眼前，勿好高騖遠' }
  },
  {
    id: 43, number: 43, ganzhi: '丙午', level: '中吉', title: '岳飛精忠報國',
    content: '精誠所至石為開，壯志凌雲不可摧。\n他日功成名就後，滿堂金玉自然來。',
    vernacular: '精誠所至金石為開，凌雲壯志不可摧毀。將來功成名就後，滿堂金玉自然會來。堅持就能成功。',
    story: '岳飛背上刺「精忠報國」，一生征戰。雖被奸臣所害，但精神永存。',
    jieYue: { marriage: '真心感動天', wealth: '辛勤得財', career: '有志竟成', health: '毅力戰勝病魔', travel: '勇往直前', study: '刻苦有成', general: '精誠所至，金石為開' }
  },
  {
    id: 44, number: 44, ganzhi: '丁未', level: '中平', title: '王羲之蘭亭序',
    content: '筆走龍蛇字有神，文章蓋世獨超群。\n天公不負苦心客，自有聲名動四方。',
    vernacular: '筆走龍蛇寫出的字如有神助，文章蓋世超群。上天不負苦心人，自然有聲名傳遍四方。才華終被肯定。',
    story: '王羲之蘭亭修禊，寫下天下第一行書。象徵藝術境界的巔峰。',
    jieYue: { marriage: '才子佳人', wealth: '才華致富', career: '以才華立足', health: '身心平衡', travel: '雅集聚會', study: '才華出眾', general: '是金子總會發光' }
  },
  {
    id: 45, number: 45, ganzhi: '戊申', level: '中吉', title: '朱元璋放牛',
    content: '莫道出身是賤微，英雄何論出高低。\n一朝運至風雲會，錦繡前程在眼前。',
    vernacular: '不要說出身低微，英雄不論出身。一旦時運到了風雲際會，錦繡前程就在眼前。不論出身，只看努力。',
    story: '朱元璋從放牛娃到皇帝。象徵出身不代表一切。',
    jieYue: { marriage: '不計較出身', wealth: '白手起家', career: '英雄不問出處', health: '體質日好', travel: '外出闖蕩', study: '勤能補拙', general: '英雄不問出處' }
  },
  {
    id: 46, number: 46, ganzhi: '己酉', level: '中平', title: '黃粱一夢',
    content: '人生富貴似浮雲，一夢黃粱幾度春。\n欲問前程何處好，不如回首看前津。',
    vernacular: '人生富貴就像浮雲一樣短暫，黃粱一夢過了幾個春天。想問前程在哪裡，不如回頭看看來時路。幸福可能就在身邊。',
    story: '盧生黃粱一夢，夢中歷經一生富貴榮華，醒來黃粱飯尚未煮熟。象徵人生短暫、富貴如夢。',
    jieYue: { marriage: '珍惜眼前人', wealth: '知足為上', career: '回頭是岸', health: '放寬心', travel: '回家為佳', study: '溫故知新', general: '驀然回首，那人卻在燈火闌珊處' }
  },
  {
    id: 47, number: 47, ganzhi: '庚戌', level: '上上', title: '大禹治水',
    content: '疏通水道導河川，三過家門不入眠。\n終使洪流歸大海，功成名就萬年傳。',
    vernacular: '疏通水道引導河川，三過家門而不入。終於讓洪水流入大海，功成名就萬年傳頌。犧牲奉獻終有回報。',
    story: '大禹治水十三年，三過家門而不入。象徵大公無私的奉獻精神。',
    jieYue: { marriage: '暫時犧牲換長久幸福', wealth: '先苦後甘', career: '專注事業有成', health: '勞而有功', travel: '奔波有成', study: '專心致志', general: '天下無難事，只怕有心人' }
  },
  {
    id: 48, number: 48, ganzhi: '辛亥', level: '中平', title: '林黛玉葬花',
    content: '花開花謝兩無情，春去秋來百感生。\n借問世間誰是主，暫時相賞莫相輕。',
    vernacular: '花開花謝都是無情的，春去秋來百感交集。請問世間誰是真正的主宰，暫時相聚就好好珍惜不要輕視。珍惜當下。',
    story: '林黛玉葬花，感嘆紅顏薄命。提醒美好事物易逝。',
    jieYue: { marriage: '珍惜當下', wealth: '花開堪折直須折', career: '把握時機', health: '青春易逝', travel: '及時行樂', study: '把握光陰', general: '有花堪折直須折' }
  },
  {
    id: 49, number: 49, ganzhi: '壬子', level: '中吉', title: '孫悟空大鬧天宮',
    content: '天生一個大聖人，神通廣大震乾坤。\n雖然鬧得天宮亂，到頭終是有前程。',
    vernacular: '天生就是一個大聖人，神通廣大震動天地。雖然鬧得天宮混亂，到頭來還是有前程。有能力者終有出路。',
    story: '孫悟空大鬧天宮，被壓五指山下五百年，終隨唐僧取經成正果。象徵桀驁不馴終被馴服。',
    jieYue: { marriage: '先難後順', wealth: '波動後穩定', career: '鋒芒畢露後沉穩', health: '活力充沛', travel: '波折但可達', study: '天才需磨練', general: '玉不琢，不成器' }
  },
  {
    id: 50, number: 50, ganzhi: '癸丑', level: '中平', title: '達摩面壁',
    content: '九年面壁默無言，終得如來正法傳。\n若要工夫深到底，鐵杵磨成繡花針。',
    vernacular: '九年面壁不曾說話，終於得到如來的正法傳承。只要工夫下得深，鐵杵也能磨成繡花針。堅持就是勝利。',
    story: '達摩祖師面壁九年，終得禪宗心法。象徵堅忍不拔的精神。',
    jieYue: { marriage: '日久生情', wealth: '日積月累', career: '堅持不懈', health: '長期調理', travel: '不急不躁', study: '鐵杵磨針', general: '只要工夫深，鐵杵磨成針' }
  },
  {
    id: 51, number: 51, ganzhi: '甲寅', level: '中平', title: '屈原投江',
    content: '一片丹心照玉壺，忠臣自古命如蒲。\n雖然江水深千尺，不及君恩一半多。',
    vernacular: '一片丹心照耀著玉壺，忠臣自古以來的命運都像蒲草般飄搖。雖然江水有千尺深，也比不上君王恩情的一半。忠誠可貴。',
    story: '屈原投汨羅江殉國。象徵忠貞不渝的高尚情操。',
    jieYue: { marriage: '忠誠為上', wealth: '不義之財不可取', career: '忠心耿耿', health: '憂思傷身', travel: '不得已遠行', study: '堅持理想', general: '路漫漫其修遠兮' }
  },
  {
    id: 52, number: 52, ganzhi: '乙卯', level: '上上', title: '劉備稱帝',
    content: '漢室宗親自有天，三分天下在其間。\n從今以後龍飛去，一統山河在此年。',
    vernacular: '漢室宗親自天命所歸，三分天下中有他一份。從今以後像龍一樣飛去，統一天下就在這一年。天命降臨。',
    story: '劉備成都稱帝，繼承漢室正統。象徵正名定分的重要。',
    jieYue: { marriage: '正緣可成', wealth: '正財可圖', career: '正位可得', health: '正氣充沛', travel: '正路可行', study: '正果可期', general: '名正言順，大事可成' }
  },
  {
    id: 53, number: 53, ganzhi: '丙辰', level: '中平', title: '賈寶玉夢遊太虛',
    content: '一場幽夢太虛中，醒後方知色是空。\n富貴榮華皆幻影，何如歸去伴青松。',
    vernacular: '在太虛幻境中做了一場夢，醒來才知色即是空。富貴榮華都是幻影，不如歸去伴著青松。一切皆空。',
    story: '賈寶玉夢遊太虛幻境，預知十二金釵命運。象徵繁華皆為夢幻。',
    jieYue: { marriage: '看淡情愛', wealth: '富貴如雲', career: '不必太執著', health: '清心寡慾', travel: '退隱為佳', study: '返璞歸真', general: '色即是空，空即是色' }
  },
  {
    id: 54, number: 54, ganzhi: '丁巳', level: '中平', title: '呂洞賓度人',
    content: '玄機妙理在人為，點鐵成金未足奇。\n若問神仙何處有，眼前就是小瑤池。',
    vernacular: '玄妙道理在於人的作為，點鐵成金並不稀奇。若問神仙在哪裡，眼前就是小瑤池。幸福就在身邊。',
    story: '呂洞賓點石成金度化世人。象徵真理不在遠處。',
    jieYue: { marriage: '良緣就在身邊', wealth: '機會就在眼前', career: '貴人即是身邊人', health: '養生貴在日常', travel: '近處即是風景', study: '活用所學', general: '踏破鐵鞋無覓處，得來全不費工夫' }
  },
  {
    id: 55, number: 55, ganzhi: '戊午', level: '中吉', title: '薛仁貴征東',
    content: '英雄未遇此時窮，一朝得志便成龍。\n他年若遂凌雲志，敢笑黃巢不丈夫。',
    vernacular: '英雄未遇到機會時也是窮困的，一旦得志就飛黃騰達了。將來如果實現了凌雲壯志，可以笑黃巢不算大丈夫。抱負遠大。',
    story: '薛仁貴從貧寒到征東元帥。象徵時來運轉的傳奇。',
    jieYue: { marriage: '窮時結髮，貴時不棄', wealth: '時來運轉', career: '大器晚成', health: '漸入佳境', travel: '往東發展', study: '大器晚成', general: '莫欺少年窮' }
  },
  {
    id: 56, number: 56, ganzhi: '己未', level: '中平', title: '華佗行醫',
    content: '妙手回春自有方，仁心仁術濟四方。\n雖然世俗多譭譽，自有青天作主張。',
    vernacular: '妙手回春自有方法，仁心仁術救助四方。雖然世俗多有毀譽，自有青天來作主張。行善不必在意他人評價。',
    story: '華佗被曹操殺害，醫書失傳。象徵善行未必有善報，但歷史自有公評。',
    jieYue: { marriage: '真心終被理解', wealth: '好心有好報', career: '專業為本', health: '遇到良醫', travel: '施比受更有福', study: '精益求精', general: '人在做，天在看' }
  },
  {
    id: 57, number: 57, ganzhi: '庚申', level: '大吉', title: '福祿壽三星',
    content: '三星在戶照高堂，福祿壽全百事昌。\n積善之家有餘慶，代代兒孫享富康。',
    vernacular: '福祿壽三星照耀家中高堂，福祿壽俱全百事昌盛。積善的人家會有餘慶，子孫世代都會享受富康。福報降臨。',
    story: '福祿壽三星高照，象徵人世間最大的幸福。',
    jieYue: { marriage: '美滿姻緣', wealth: '財源廣進', career: '福星高照', health: '健康長壽', travel: '福至心靈', study: '學業有成', general: '三星報喜，萬事如意' }
  },
  {
    id: 58, number: 58, ganzhi: '辛酉', level: '中平', title: '白蛇傳',
    content: '千年修煉在峨眉，為報君恩下翠微。\n可惜人妖終有別，雷峰塔下苦相違。',
    vernacular: '在峨眉山修煉千年，為了報答恩情下了青山。可惜人妖終究有別，在雷峰塔下苦苦相望。深情但受阻。',
    story: '白素貞與許仙的愛情故事。象徵深情可能被現實所困。',
    jieYue: { marriage: '情深緣淺', wealth: '為情所困', career: '受到束縛', health: '積鬱成疾', travel: '被困一方', study: '心煩意亂', general: '情深不壽，強極則辱' }
  },
  {
    id: 59, number: 59, ganzhi: '壬戌', level: '中平', title: '塞翁失馬',
    content: '塞翁失馬豈非福，禍福由來本一家。\n得失榮枯天註定，不須煩惱亂如麻。',
    vernacular: '塞翁失馬未必不是福氣，禍福本來就是一家。得失榮枯都是天註定的，不需要煩惱得像麻一樣亂。禍福相依。',
    story: '塞翁失馬，焉知非福。象徵福禍相倚的道理。',
    jieYue: { marriage: '塞翁失馬', wealth: '先失後得', career: '得失心放寬', health: '小病是福', travel: '隨遇而安', study: '一時失意勿灰心', general: '禍兮福所倚，福兮禍所伏' }
  },
  {
    id: 60, number: 60, ganzhi: '癸亥', level: '上上', title: '宋郊兄弟同科',
    content: '羨君兄弟好名聲，一意和同任死生。\n侯霸侯威分左右，明君成紀要扶傾。',
    vernacular: '羨慕你們兄弟好名聲，同心協力生死與共。像兩位侯爺左右相輔，賢明的君主成就事業需要扶持。兄弟同心。',
    story: '宋郊宋祁兄弟同科中進士，傳為佳話。象徵兄弟齊心、其利斷金。',
    jieYue: { marriage: '兄弟同心，良緣天成', wealth: '合作致富', career: '得兄弟朋友相助', health: '互相扶持', travel: '結伴同行', study: '互相砥礪', general: '二人同心，其利斷金' }
  },
  {
    id: 61, number: 61, ganzhi: '甲子', level: '中平', title: '孟姜女哭長城',
    content: '千里尋夫到塞邊，哭聲震動長城巔。\n雖然不得團圓樂，節義千秋萬古傳。',
    vernacular: '千里尋找丈夫來到邊塞，哭聲震動了長城頂。雖然無法團圓，但節義千秋萬代流傳。堅貞感人。',
    story: '孟姜女哭倒長城尋夫。象徵至情至性的力量。',
    jieYue: { marriage: '堅貞不渝', wealth: '不計得失', career: '以誠動人', health: '悲傷傷身', travel: '千里奔波', study: '堅持不懈', general: '精誠所至' }
  },
  {
    id: 62, number: 62, ganzhi: '乙丑', level: '中吉', title: '管鮑之交',
    content: '管仲鮑叔兩心知，患難相交見義時。\n自古交情貴知己，何須多語說分離。',
    vernacular: '管仲和鮑叔牙兩心相知，患難時才見真情義。自古交情貴在知己，不需要多說什麼分離的話。知己難得。',
    story: '管仲與鮑叔牙的知己之情。象徵真正友誼不求回報。',
    jieYue: { marriage: '知己成伴侶', wealth: '合作無間', career: '得貴人知己', health: '心安體健', travel: '有好友同行', study: '良師益友', general: '人生得一知己足矣' }
  },
  {
    id: 63, number: 63, ganzhi: '丙寅', level: '中平', title: '荊軻刺秦王',
    content: '風蕭蕭兮易水寒，壯士一去不復還。\n圖窮匕首終難逞，天命歸秦豈偶然。',
    vernacular: '風蕭蕭吹過易水寒冷，壯士一去不復返。圖窮匕見但難以成功，天命歸於秦國豈是偶然。有些事強求不得。',
    story: '荊軻刺秦王失敗身亡。象徵即使有萬全準備，天命難違。',
    jieYue: { marriage: '強求不得', wealth: '大計畫未必成', career: '謀事在人成事在天', health: '勿過激', travel: '危險勿行', study: '欲速則不達', general: '天命不可違' }
  },
  {
    id: 64, number: 64, ganzhi: '丁卯', level: '上上', title: '鯉魚躍龍門',
    content: '龍門高躍出風塵，一舉成名天下聞。\n從此聲華傳四海，富貴榮華百世新。',
    vernacular: '從龍門高處躍出脫離凡塵，一舉成名天下皆知。從此聲名傳遍四海，富貴榮華百代更新。功成名就。',
    story: '鯉魚躍龍門化為龍的傳說。象徵一舉成名。',
    jieYue: { marriage: '一舉定終身', wealth: '一朝暴富', career: '一飛沖天', health: '活力旺盛', travel: '前途光明', study: '金榜題名', general: '鯉魚躍龍門，身價百倍' }
  },
  {
    id: 65, number: 65, ganzhi: '戊辰', level: '中平', title: '司馬相如題橋',
    content: '當年題柱志凌雲，今日功成萬古聞。\n駟馬高車歸故里，滿城爭看卓文君。',
    vernacular: '當年題柱凌雲壯志，今日功成名就萬古流傳。駟馬高車回到家鄉，滿城人都爭看卓文君。衣錦還鄉。',
    story: '司馬相如題橋柱明志，後以賦聞名天下。象徵有志者事竟成。',
    jieYue: { marriage: '衣錦榮歸', wealth: '功成名就', career: '實現抱負', health: '精神飽滿', travel: '榮歸故里', study: '學有所成', general: '不負初心' }
  },
  {
    id: 66, number: 66, ganzhi: '己巳', level: '中平', title: '范蠡泛舟',
    content: '功成身退泛扁舟，一葉隨風任去留。\n富貴榮華皆是夢，五湖煙景勝封侯。',
    vernacular: '功成身退搭小船泛舟，一葉扁舟隨風飄去。富貴榮華都是夢，五湖美景勝過封侯。急流勇退。',
    story: '范蠡助勾踐復國後，攜西施泛舟五湖。象徵急流勇退的智慧。',
    jieYue: { marriage: '如魚得水', wealth: '見好就收', career: '功成身退', health: '悠遊自在', travel: '遊山玩水', study: '學以致用', general: '知進退，明得失' }
  },
  {
    id: 67, number: 67, ganzhi: '庚午', level: '中吉', title: '玄奘取經歸',
    content: '西方取經萬里程，歸來白馬負金經。\n天龍八部皆歡喜，從此東土有佛乘。',
    vernacular: '西方取經走過萬里路，歸來白馬背負金經。天龍八部都歡喜，從此東土有了佛法。圓滿達成使命。',
    story: '玄奘法師取經歸來，弘揚佛法。象徵圓滿完成使命。',
    jieYue: { marriage: '終成眷屬', wealth: '收穫滿滿', career: '功成名就', health: '康復在望', travel: '滿載而歸', study: '學業圓滿', general: '圓滿成就' }
  },
  {
    id: 68, number: 68, ganzhi: '辛未', level: '中平', title: '梁祝化蝶',
    content: '同窗三載兩無猜，十八相送淚滿腮。\n化蝶雙飛終遂願，人間從此有樓臺。',
    vernacular: '同窗三年兩小無猜，十八相送淚流滿面。化成蝴蝶雙雙飛舞終於如願，人間從此有樓臺會。真情感人。',
    story: '梁山伯與祝英台的愛情悲劇。象徵真情至死不渝。',
    jieYue: { marriage: '情深緣深', wealth: '情感勝於金錢', career: '志同道合', health: '情志不暢', travel: '比翼雙飛', study: '同窗共勉', general: '有情人終成眷屬' }
  },
  {
    id: 69, number: 69, ganzhi: '壬申', level: '中平', title: '嚴子陵釣臺',
    content: '富春江上釣魚翁，天子呼來不上船。\n自稱臣是酒中仙，清風明月不論錢。',
    vernacular: '富春江上的釣魚老翁，天子呼喚他都不上船。自稱是酒中之仙，清風明月不用錢買。高風亮節。',
    story: '嚴子陵與漢光武帝同學，卻不願作官隱居垂釣。象徵不慕榮利。',
    jieYue: { marriage: '不慕虛榮', wealth: '淡泊名利', career: '獨立自主', health: '清心寡慾', travel: '隨心所欲', study: '不為名利', general: '無欲則剛' }
  },
  {
    id: 70, number: 70, ganzhi: '癸酉', level: '中吉', title: '周處除三害',
    content: '少年為害里中聞，一旦回頭作好人。\n斬蛟射虎除三害，英名從此震乾坤。',
    vernacular: '少年時為害鄉里出了名，一旦回頭就做了好人。斬蛟龍射老虎除了三害，英名從此震動天地。浪子回頭。',
    story: '周處年少為害鄉里，後改過自新，斬蛟除虎。象徵浪子回頭金不換。',
    jieYue: { marriage: '浪子回頭', wealth: '改過後得財', career: '洗心革面', health: '斷除惡習', travel: '改道易轍', study: '發奮圖強', general: '放下屠刀，立地成佛' }
  },
  {
    id: 71, number: 71, ganzhi: '甲戌', level: '上上', title: '文曲星下凡',
    content: '天上文星降下來，人間從此出奇才。\n文章錦繡傳千古，子子孫孫拜相台。',
    vernacular: '天上的文曲星降臨凡間，人間從此出了奇才。錦繡文章流傳千古，子孫世代都拜相封侯。文運大開。',
    story: '文曲星下凡轉世為才子。象徵文運昌隆。',
    jieYue: { marriage: '才子佳人', wealth: '以文致富', career: '文職高陞', health: '神清氣爽', travel: '文名遠播', study: '文思泉湧', general: '文曲星照，才華洋溢' }
  },
  {
    id: 72, number: 72, ganzhi: '乙亥', level: '中平', title: '八仙過海',
    content: '八仙過海顯神通，各展奇能各不同。\n只要心誠功力到，何愁萬事不成空。',
    vernacular: '八仙過海各顯神通，各自展現不同的奇能。只要心誠功力深厚，何愁萬事不成。各有各的辦法。',
    story: '八仙過海各顯神通。象徵各憑本事、殊途同歸。',
    jieYue: { marriage: '各有緣法', wealth: '各顯神通', career: '發揮所長', health: '各安天命', travel: '自有妙計', study: '因材施教', general: '八仙過海，各顯神通' }
  },
  {
    id: 73, number: 73, ganzhi: '丙子', level: '中平', title: '鶯鶯傳',
    content: '待月西廂下，迎風戶半開。\n拂牆花影動，疑是玉人來。',
    vernacular: '在西廂下等待月亮升起，迎著微風門半開著。牆上的花影搖曳，還以為是意中人來了。期待又忐忑。',
    story: '崔鶯鶯與張生的愛情故事。象徵美好姻緣需耐心等待。',
    jieYue: { marriage: '待月西廂，良宵將至', wealth: '耐心等待', career: '期待轉機', health: '心神不寧', travel: '等待時機出發', study: '期待佳音', general: '好事多磨' }
  },
  {
    id: 74, number: 74, ganzhi: '丁丑', level: '中平', title: '魯智深倒拔楊柳',
    content: '力拔山兮氣蓋世，英雄好漢出蒿萊。\n雖然粗魯無文采，一片丹心照九垓。',
    vernacular: '力大能拔山氣概蓋世，英雄好漢出身草莽。雖然粗魯沒有文采，但一片丹心照耀天地。真心勝過一切。',
    story: '魯智深倒拔垂楊柳。象徵真誠比技巧重要。',
    jieYue: { marriage: '真心相待', wealth: '以力掙錢', career: '實力為本', health: '身強體健', travel: '勇往直前', study: '勤能補拙', general: '大巧若拙，大智若愚' }
  },
  {
    id: 75, number: 75, ganzhi: '戊寅', level: '中吉', title: '郭子儀拜壽',
    content: '七子八婿滿床笏，富貴壽考古今無。\n忠君愛國全臣節，始信人間有丈夫。',
    vernacular: '七個兒子八個女婿滿床都是笏板（官位），富貴長壽古今少有。忠君愛國保全了臣子的節操，才相信人間真有這樣的大丈夫。圓滿人生。',
    story: '郭子儀一生戎馬，晚年七子八婿皆為官。象徵圓滿人生。',
    jieYue: { marriage: '子孫滿堂', wealth: '富貴綿長', career: '功成名就', health: '福壽雙全', travel: '榮歸故里', study: '功名成就', general: '圓滿如意' }
  },
  {
    id: 76, number: 76, ganzhi: '己卯', level: '中平', title: '杞人憂天',
    content: '世人何必自相欺，憂慮從頭到尾癡。\n日月循環天地久，何曾見有泰山移。',
    vernacular: '世人何必自欺欺人，憂慮從頭到尾都是癡的。日月循環天地長久，何曾見過泰山移動。不必過度擔心。',
    story: '杞人憂天傾，終日憂慮。象徵過度擔心是多餘的。',
    jieYue: { marriage: '勿過慮', wealth: '穩如泰山', career: '不必擔憂', health: '放寬心', travel: '安然無事', study: '從容以對', general: '天下本無事，庸人自擾之' }
  },
  {
    id: 77, number: 77, ganzhi: '庚辰', level: '中吉', title: '周文王演易',
    content: '羑里城中演易經，六十四卦自分明。\n天人合一窺玄妙，萬古長明照世程。',
    vernacular: '在羑里城中推演易經，六十四卦自然分明。天人合一窺見玄妙，萬古照亮世人的前程。智慧開悟。',
    story: '周文王被囚羑里而演周易。象徵困境中產生智慧。',
    jieYue: { marriage: '深思熟慮', wealth: '智慧致富', career: '謀定後動', health: '靜養開悟', travel: '以智取勝', study: '觸類旁通', general: '困而知之，智慧大開' }
  },
  {
    id: 78, number: 78, ganzhi: '辛巳', level: '中平', title: '鴻門宴',
    content: '鴻門宴上殺機藏，項莊舞劍意難防。\n若非樊噲來相救，沛公性命恐難長。',
    vernacular: '鴻門宴上暗藏殺機，項莊舞劍意在沛公難以防範。如果不是樊噲來救援，劉邦性命恐怕不保。危機四伏。',
    story: '鴻門宴上劉邦險些被殺。提醒危機中要保持冷靜。',
    jieYue: { marriage: '需防第三者', wealth: '商場如戰場', career: '暗藏危機', health: '防意外', travel: '注意安全', study: '競爭激烈', general: '小心駛得萬年船' }
  },
  {
    id: 79, number: 79, ganzhi: '壬午', level: '中平', title: '莊子鼓盆',
    content: '鼓盆而歌豈無情，生死由來一夢輕。\n大道無形通萬化，何須悲喜累心旌。',
    vernacular: '莊子鼓盆唱歌豈是無情，生死從來就像一場夢一樣輕。大道無形貫通萬物變化，何必悲喜讓心情疲累。看淡生死。',
    story: '莊子妻死鼓盆而歌，看透生死。象徵超脫生死的智慧。',
    jieYue: { marriage: '看淡得失', wealth: '得失隨緣', career: '不以物喜不以己悲', health: '心寬體健', travel: '逍遙自在', study: '悟道為上', general: '生死有命，富貴在天' }
  },
  {
    id: 80, number: 80, ganzhi: '癸未', level: '上上', title: '蟠桃盛會',
    content: '瑤池王母宴群仙，蟠桃會上壽千年。\n從今喜氣盈門戶，福壽康寧在眼前。',
    vernacular: '瑤池王母宴請群仙，蟠桃會上祝賀千年壽。從此喜氣充滿家門，福壽康寧就在眼前。喜氣洋洋。',
    story: '西王母蟠桃盛會宴請群仙。象徵喜慶圓滿。',
    jieYue: { marriage: '喜結良緣', wealth: '喜從天降', career: '喜訊將至', health: '福壽雙全', travel: '喜慶之旅', study: '喜報頻傳', general: '喜氣洋洋，萬事如意' }
  },
  {
    id: 81, number: 81, ganzhi: '甲申', level: '中平', title: '霸王別姬',
    content: '力拔山兮氣蓋世，時不利兮騅不逝。\n騅不逝兮可奈何，虞兮虞兮奈若何。',
    vernacular: '力能拔山氣概蓋世，時運不濟連馬都跑不動了。馬跑不動了又能怎樣，虞姬啊虞姬又該怎麼辦。英雄末路。',
    story: '項羽垓下被圍，與虞姬訣別。象徵英雄也有末路。',
    jieYue: { marriage: '悲歡離合', wealth: '大勢已去', career: '時不我予', health: '大限將至', travel: '窮途末路', study: '功虧一簣', general: '時來天地皆同力，運去英雄不自由' }
  },
  {
    id: 82, number: 82, ganzhi: '乙酉', level: '中吉', title: '神農嘗百草',
    content: '親嘗百草為蒼生，中毒渾然不懼驚。\n從此醫方傳後世，萬年香火報功成。',
    vernacular: '親自嘗百草為了天下蒼生，中毒也渾然不懼。從此醫方流傳後世，萬年香火報答功成。犧牲自我造福人群。',
    story: '神農氏親嘗百草以定藥性。象徵犧牲奉獻的精神。',
    jieYue: { marriage: '真愛付出', wealth: '積德致富', career: '奉獻精神', health: '良藥苦口', travel: '探尋新知', study: '身體力行', general: '一分耕耘，一分收穫' }
  },
  {
    id: 83, number: 83, ganzhi: '丙戌', level: '中平', title: '牛郎織女',
    content: '銀河相隔兩茫茫，七夕相逢淚滿裳。\n鵲橋高架通天地，一年一度會牛郎。',
    vernacular: '銀河相隔兩人都茫茫，七夕相逢淚流滿衣裳。鵲橋高高架起貫通天地，一年才能和牛郎相會一次。聚少離多。',
    story: '牛郎織女七夕鵲橋相會。象徵雖然分離但終能團聚。',
    jieYue: { marriage: '聚少離多', wealth: '時來時去', career: '需耐心等待', health: '相思成疾', travel: '來回奔波', study: '日積月累', general: '兩情若是久長時，又豈在朝朝暮暮' }
  },
  {
    id: 84, number: 84, ganzhi: '丁亥', level: '中吉', title: '程門立雪',
    content: '立雪程門志氣堅，尊師重道古今傳。\n若非誠意感天地，焉得文章萬古篇。',
    vernacular: '在程頤門前站立雪中意志堅定，尊師重道的美德古今傳頌。如果不是誠意感動天地，怎能寫出萬古文章。尊師重道。',
    story: '楊時、游酢程門立雪求教。象徵尊師重道的精神。',
    jieYue: { marriage: '真誠感動對方', wealth: '誠信為本', career: '虛心求教', health: '耐心治療', travel: '求師訪友', study: '尊師重道', general: '虛心使人進步' }
  },
  {
    id: 85, number: 85, ganzhi: '戊子', level: '中平', title: '蘇武回漢',
    content: '十九年來北海濱，牧羊嚙雪守忠貞。\n一朝漢使通消息，白髮歸來淚滿巾。',
    vernacular: '十九年在北海邊，牧羊吃雪堅守忠貞。漢朝使節終於通了消息，白髮蒼蒼歸來淚流滿巾。堅守終有回報。',
    story: '蘇武被扣匈奴十九年，終得歸漢。象徵堅忍忠貞終有回報。',
    jieYue: { marriage: '守得雲開', wealth: '久後必得', career: '堅持到底', health: '久病初癒', travel: '終於歸鄉', study: '久久為功', general: '堅持就是勝利' }
  },
  {
    id: 86, number: 86, ganzhi: '己丑', level: '大吉', title: '財神到',
    content: '財神降福到門庭，金玉滿堂百事興。\n從此經營皆順利，堆金積玉享安寧。',
    vernacular: '財神降福到了家門口，金玉滿堂百事興旺。從此經營都順順利利，堆金積玉享受安寧。財運亨通。',
    story: '財神爺賜福人間。象徵財運大開。',
    jieYue: { marriage: '財子佳人', wealth: '財源廣進', career: '生意興隆', health: '福壽安康', travel: '滿載而歸', study: '金榜題名', general: '財神到，福氣到' }
  },
  {
    id: 87, number: 87, ganzhi: '庚寅', level: '中平', title: '陶朱公經商',
    content: '三致千金不為難，經商有道在心間。\n薄利多銷和氣待，自然財富積如山。',
    vernacular: '三次賺到千金並不難，經商有道藏在心中。薄利多銷和氣待人，自然財富堆積如山。經商有道。',
    story: '范蠡化名陶朱公經商，三致千金。象徵商業智慧。',
    jieYue: { marriage: '和氣致祥', wealth: '經商有道', career: '和氣生財', health: '心平氣和', travel: '經商遠行', study: '學以致用', general: '和氣生財' }
  },
  {
    id: 88, number: 88, ganzhi: '辛卯', level: '中吉', title: '張良拾履',
    content: '橋下拾鞋志氣高，黃公兵法授英豪。\n若非忍得一時氣，焉得漢朝四百年。',
    vernacular: '在橋下撿鞋志氣高遠，黃石公傳授兵法給英豪。如果不是忍住一時的氣，漢朝哪裡有四百年江山。忍耐成就大事。',
    story: '張良為黃石公橋下拾履，得太公兵法。象徵忍一時成就大業。',
    jieYue: { marriage: '耐心終獲良緣', wealth: '先屈後伸', career: '忍耐可成大事', health: '耐心調理', travel: '先難後易', study: '虛心受教', general: '小不忍則亂大謀' }
  },
  {
    id: 89, number: 89, ganzhi: '壬辰', level: '中平', title: '伯夷叔齊',
    content: '首陽山下採薇人，不食周粟守節貞。\n清風明月常相伴，萬古高風說到今。',
    vernacular: '首陽山下採薇而食的人，不吃周朝的糧食堅守節操。清風明月常常相伴，萬古高風亮節流傳至今。堅守原則。',
    story: '伯夷叔齊不食周粟，餓死首陽山。象徵堅守原則、不隨波逐流。',
    jieYue: { marriage: '堅守承諾', wealth: '不義之財不取', career: '不為五斗米折腰', health: '清心寡慾', travel: '獨善其身', study: '守正不阿', general: '寧為玉碎，不為瓦全' }
  },
  {
    id: 90, number: 90, ganzhi: '癸巳', level: '中吉', title: '天官賜福',
    content: '天官賜福降人間，紫氣東來滿院環。\n從今以後無災難，闔家平安樂綿綿。',
    vernacular: '天官賜福降臨人間，紫氣從東而來充滿了院落。從今以後沒有災難，全家平安快樂綿長。平安是福。',
    story: '天官大帝賜福人間。象徵天降福氣。',
    jieYue: { marriage: '天賜良緣', wealth: '福祿自來', career: '天官賜福', health: '無災無病', travel: '平安順遂', study: '福至心靈', general: '天官賜福，百無禁忌' }
  },
  {
    id: 91, number: 91, ganzhi: '甲午', level: '中平', title: '司馬遷著史記',
    content: '身受極刑志未灰，忍辱著書萬古才。\n史家絕唱無韻處，留取丹心照汗青。',
    vernacular: '身受極刑但意志未消沉，忍辱寫書是萬古奇才。史家的絕唱無可比擬，留取丹心照耀汗青。苦難成就偉業。',
    story: '司馬遷受宮刑後發憤著史記。象徵逆境中創造成就。',
    jieYue: { marriage: '患難見真情', wealth: '先難後得', career: '逆境中成長', health: '大病重生', travel: '忍辱負重', study: '發憤圖強', general: '天將降大任於斯人也' }
  },
  {
    id: 92, number: 92, ganzhi: '乙未', level: '中平', title: '王冕畫荷',
    content: '池邊畫荷不顧家，丹青妙筆寫生涯。\n雖然貧困衣衫破，留得清名萬古誇。',
    vernacular: '在池邊畫荷花不顧家，用妙筆丹青寫自己的人生。雖然貧困衣衫破爛，但留得清名萬古傳頌。安貧樂道。',
    story: '王冕貧困好學，以畫荷聞名。象徵貧賤不能移。',
    jieYue: { marriage: '貧賤之交', wealth: '精神富足', career: '安貧樂道', health: '清心寡慾', travel: '獨行於道', study: '專注所學', general: '君子固窮' }
  },
  {
    id: 93, number: 93, ganzhi: '丙申', level: '上上', title: '狀元及第',
    content: '十年寒窗無人問，一舉成名天下知。\n瓊林宴上簪花日，正是金榜題名時。',
    vernacular: '十年寒窗苦讀沒有人問，一舉成名天下人都知道了。瓊林宴上插花的那天，正是金榜題名的時候。即將成功。',
    story: '古代科舉狀元及第的榮耀。象徵努力終有回報。',
    jieYue: { marriage: '良緣喜事', wealth: '名利雙收', career: '一舉成名', health: '精力充沛', travel: '功成名就', study: '金榜題名', general: '一舉成名天下知' }
  },
  {
    id: 94, number: 94, ganzhi: '丁酉', level: '中平', title: '愚公移山',
    content: '太行王屋兩山高，愚公立志要移逃。\n子子孫孫無窮盡，終教天帝動悲號。',
    vernacular: '太行山和王屋山兩座高山，愚公立志要把它們移走。子子孫孫無窮無盡，終於讓天帝也感動了。堅持不懈。',
    story: '愚公移山感動天帝。象徵堅韌不拔的精神。',
    jieYue: { marriage: '代代相傳', wealth: '日積月累', career: '持之以恆', health: '持續調理', travel: '堅持到底', study: '水滴石穿', general: '天下無難事，只怕有心人' }
  },
  {
    id: 95, number: 95, ganzhi: '戊戌', level: '中平', title: '孟母三遷',
    content: '慈母三遷擇鄰居，斷機教子惜三餘。\n若非賢母殷勤教，亞聖何由萬古譽。',
    vernacular: '慈母三次搬家選擇鄰居，割斷布機教導孩子珍惜時間。如果不是賢母的殷勤教導，亞聖孟子哪裡有萬古美譽。母教偉大。',
    story: '孟母三遷教子，斷機勸學。象徵環境與教育的重要。',
    jieYue: { marriage: '為子女擇良緣', wealth: '投資教育', career: '換環境則通', health: '擇良醫', travel: '擇地而居', study: '擇良師益友', general: '近朱者赤，近墨者黑' }
  },
  {
    id: 96, number: 96, ganzhi: '己亥', level: '中吉', title: '貴人指引',
    content: '迷途自有貴人來，指引前程不用猜。\n只要心誠多善念，青雲有路自然開。',
    vernacular: '迷路時自然有貴人會來，指引你的前程不用猜疑。只要心存誠懇善念，青雲之路自然會為你打開。貴人扶持。',
    story: '許多人在人生關鍵時刻遇貴人相助。鼓勵行善積德。',
    jieYue: { marriage: '貴人牽線', wealth: '貴人指引財路', career: '得貴人提攜', health: '遇見良醫', travel: '貴人同行', study: '良師益友', general: '行善之人，天必佑之' }
  },
  {
    id: 97, number: 97, ganzhi: '庚子', level: '中平', title: '梅花三弄',
    content: '梅花三弄雪中開，不與群芳鬥豔才。\n待到春來百花放，暗香疏影自徘徊。',
    vernacular: '梅花在雪中獨自開放，不和其他花爭豔。等到春天百花齊放，暗香疏影獨自徘徊。不爭而善勝。',
    story: '梅花傲雪而開，象徵君子的品格。不與人爭，自有清香。',
    jieYue: { marriage: '不爭不搶緣自來', wealth: '時機未到', career: '不與人爭', health: '靜待康復', travel: '獨善其身', study: '默默耕耘', general: '桃李不言，下自成蹊' }
  },
  {
    id: 98, number: 98, ganzhi: '辛丑', level: '中平', title: '葉公好龍',
    content: '葉公好龍畫滿堂，真龍下降卻驚惶。\n口是心非終誤己，虛情假意費思量。',
    vernacular: '葉公到處畫龍說喜歡龍，真龍來了卻嚇得驚慌。口是心非最終耽誤了自己，虛情假意只是浪費心思。要誠實面對自己。',
    story: '葉公好龍，真龍來訪卻嚇得魂飛魄散。諷刺言行不一。',
    jieYue: { marriage: '真心換真心', wealth: '誠信為本', career: '表裡如一', health: '心口一致', travel: '真心實意', study: '腳踏實地', general: '知行合一' }
  },
  {
    id: 99, number: 99, ganzhi: '壬寅', level: '上上', title: '日出東方',
    content: '雞鳴報曉五更風，日出東方萬里紅。\n從今掃盡陰霾氣，一路光明處處通。',
    vernacular: '公雞報曉五更的風吹來，太陽從東方升起萬里通紅。從此掃盡陰霾之氣，一路光明處處暢通。黎明到來。',
    story: '旭日東升，象徵新的開始和希望。',
    jieYue: { marriage: '光明正大', wealth: '財路光明', career: '前景光明', health: '康復在望', travel: '一路順風', study: '茅塞頓開', general: '撥雲見日，光明在前' }
  },
  {
    id: 100, number: 100, ganzhi: '癸卯', level: '上上', title: '滿載而歸',
    content: '扁舟一葉出滄海，載得明珠滿載歸。\n從今不用觀人面，自有餘光照錦衣。',
    vernacular: '一艘小船出海，載著明珠滿載而歸。從此不用看人臉色，自有光芒照耀錦繡前程。收穫滿滿。',
    story: '出海尋寶滿載而歸。象徵付出終有豐厚回報。',
    jieYue: { marriage: '終成眷屬', wealth: '滿載而歸', career: '功成名就', health: '康復痊癒', travel: '滿載而歸', study: '滿分高中', general: '付出終有回報，滿載而歸' }
  }
];
