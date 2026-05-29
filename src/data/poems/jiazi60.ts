// 六十甲子籤詩（獨立資料，非雷雨師子集）
// 台灣媽祖廟、王爺廟常見的六十甲子籤系統
import type { Poem } from './leiyushi';

export const jiazi60Poems: Poem[] = [
  {
    id: 2001, number: 1, ganzhi: '甲子', level: '大吉', title: '劉備入川',
    content: '日出扶桑萬里明，貴人指引得前程。\n行人從此無阻滯，一舉成名天下聞。',
    vernacular: '太陽從東方升起照亮大地，有貴人指引前途光明。從此一路順遂無阻，一舉成名天下皆知。大吉之兆。',
    story: '劉備入蜀得諸葛亮輔佐，終成大業。象徵得遇明主、貴人相助。',
    jieYue: { marriage: '良緣天成', wealth: '財運亨通', career: '得遇貴人', health: '身體康健', travel: '一帆風順', study: '金榜題名', general: '大吉大利' }
  },
  {
    id: 2002, number: 2, ganzhi: '乙丑', level: '中平', title: '韓信胯下辱',
    content: '投身虎穴飼於菟，須是其人識點籌。\n誰識始終皆得計，一時意氣不須求。',
    vernacular: '如同投身虎穴餵虎，需要有智慧的人才能算計周全。暫時忍辱負重，日後終有回報。勿因一時意氣用事。',
    story: '韓信忍胯下之辱，後成一代名將。提醒忍一時可成大業。',
    jieYue: { marriage: '暫忍可成', wealth: '守成為上', career: '忍辱負重', health: '耐心調理', travel: '暫不宜行', study: '埋頭苦讀', general: '忍一時海闊天空' }
  },
  {
    id: 2003, number: 3, ganzhi: '丙寅', level: '中吉', title: '姜太公釣魚',
    content: '勸君耐守舊生涯，把定身心莫信邪。\n直待有人輕著力，滿園枯木再開花。',
    vernacular: '建議安守本分，堅定心志不被誘惑。等待貴人輕輕相助，困境就會像枯木花園重新開花。',
    story: '姜太公八十歲渭水垂釣遇文王。象徵時機未到時耐心等待。',
    jieYue: { marriage: '時候未到', wealth: '守成待時', career: '安守崗位', health: '耐心調理', travel: '暫不宜遠行', study: '專心致志', general: '守成待時' }
  },
  {
    id: 2004, number: 4, ganzhi: '丁卯', level: '上上', title: '關羽過五關',
    content: '龍門得渡變通津，變化飛騰在此辰。\n從此一身長發奮，自然富貴百年身。',
    vernacular: '越過龍門從此一路暢通，飛騰變化就在此刻。從此奮發向上，自然富貴百年。大吉大利。',
    story: '關羽過五關斬六將千里尋兄。象徵克服萬難終成大業。',
    jieYue: { marriage: '佳偶天成', wealth: '名利雙收', career: '飛黃騰達', health: '身強體健', travel: '路路暢通', study: '名列前茅', general: '大吉大利' }
  },
  {
    id: 2005, number: 5, ganzhi: '戊辰', level: '下下', title: '霸王別姬',
    content: '一場春夢幾時休，名利猶如水上漚。\n若得清風明月夜，不知何處是瀛洲。',
    vernacular: '人生如春夢般短暫，名利像水上泡沫。若能清風明月相伴，何必尋找虛無仙境。看淡得失。',
    story: '項羽垓下之圍，英雄末路。提醒物極必反、盛極必衰。',
    jieYue: { marriage: '看淡情緣', wealth: '名利如浮雲', career: '盛極必衰', health: '清心寡慾', travel: '隨遇而安', study: '淡泊明志', general: '世事如夢' }
  },
  {
    id: 2006, number: 6, ganzhi: '己巳', level: '大吉', title: '孔明借東風',
    content: '春雷發聲震乾坤，蟄戶驚開百鳥喧。\n一朝天氣回溫暖，枯木寒枝自發根。',
    vernacular: '春雷震動天地，萬物甦醒百鳥齊鳴。天氣回暖，連枯木都重新生根發芽。時來運轉。',
    story: '諸葛亮借東風火燒赤壁。象徵善用天時地利人和。',
    jieYue: { marriage: '春風得意', wealth: '財運將至', career: '苦盡甘來', health: '疾病將癒', travel: '大吉', study: '豁然開朗', general: '時來運轉' }
  },
  {
    id: 2007, number: 7, ganzhi: '庚午', level: '中平', title: '唐明皇遊月',
    content: '富貴由命天註定，心高必然誤君期。\n不如且回依舊路，雲開月出自分明。',
    vernacular: '富貴天註定，強求反誤自己。不如回到原路，時機到了自然清明。不要好高騖遠。',
    story: '唐明皇夢遊月宮，醒來成空。感嘆富貴如浮雲。',
    jieYue: { marriage: '強求無益', wealth: '勿投機', career: '安分守己', health: '放寬心', travel: '謹慎行事', study: '腳踏實地', general: '知足常樂' }
  },
  {
    id: 2008, number: 8, ganzhi: '辛未', level: '上上', title: '劉備三顧茅廬',
    content: '鸞鳳沖霄意氣雄，文章擲地作金聲。\n雲程有路終須到，丹桂生香在此行。',
    vernacular: '像鸞鳳直飛沖天氣勢雄壯，文章落地有金石之聲。青雲之路必能走到，功名就在此行。',
    story: '劉備三顧茅廬請諸葛亮出山。象徵誠心感動天地。',
    jieYue: { marriage: '良緣可成', wealth: '名利雙收', career: '青雲直上', health: '精力充沛', travel: '前程似錦', study: '必定高中', general: '心想事成' }
  },
  {
    id: 2009, number: 9, ganzhi: '壬申', level: '中平', title: '蘇武牧羊',
    content: '於今此景正當時，看看欲吐百花奇。\n若能遇得春風到，直上雲霄在及時。',
    vernacular: '現在正是時機成熟之時，萬事準備開花結果。等待春風一到就能直上青雲。把握時機。',
    story: '蘇武牧羊北海十九年終得歸漢。象徵堅持終有回報。',
    jieYue: { marriage: '時機成熟', wealth: '守得雲開', career: '即將升遷', health: '日漸康復', travel: '等待時機', study: '時機到自有成', general: '等待時機' }
  },
  {
    id: 2010, number: 10, ganzhi: '癸酉', level: '中吉', title: '孟嘗君食客',
    content: '好將錦繡作生涯，到處江湖可作家。\n何必區區分爾我，長安市上酒如花。',
    vernacular: '好好運用才華規劃人生，到處都是安身立命之處。心胸開闊，處處是家。',
    story: '孟嘗君廣納食客三千，雞鳴狗盜亦能救命。象徵廣結善緣。',
    jieYue: { marriage: '良緣天成', wealth: '財源廣進', career: '大展鴻圖', health: '精力旺盛', travel: '四海為家', study: '學業大進', general: '前程萬里' }
  },
  {
    id: 2011, number: 11, ganzhi: '甲戌', level: '上上', title: '文王渭水聘賢',
    content: '事端百出慮雖長，莫聽人言自主張。\n一著仙機君記取，紛紛俗子自招殃。',
    vernacular: '事情雖多但要有主見，不要聽信他人。把握關鍵時機，庸俗之人自食其果。',
    story: '周文王渭水聘姜太公。象徵慧眼識英雄。',
    jieYue: { marriage: '自有主見', wealth: '獨立判斷', career: '堅持己見', health: '自主調理', travel: '可行', study: '獨立思考', general: '相信自己' }
  },
  {
    id: 2012, number: 12, ganzhi: '乙亥', level: '中平', title: '屈原投江',
    content: '時運未通未可為，欲求無事亦難知。\n不如退守安全地，等待春風送暖時。',
    vernacular: '時運未到不宜妄動，不如退守安全之地等待春風到來。韜光養晦。',
    story: '屈原遭讒被放逐。提醒知進退、明得失。',
    jieYue: { marriage: '暫緩為宜', wealth: '以守代攻', career: '暫且忍耐', health: '休養生息', travel: '不宜遠行', study: '默默耕耘', general: '韜光養晦' }
  },
  {
    id: 2013, number: 13, ganzhi: '丙子', level: '大吉', title: '鯉魚躍龍門',
    content: '禹門跳浪自天來，變化魚龍上九垓。\n但得風雲多際會，一聲雷動上天台。',
    vernacular: '鯉魚躍龍門從天而降，變化成龍飛上九天。風雲際會時，一聲雷動飛上天台。命運大轉變。',
    story: '鯉魚躍龍門化龍傳說。象徵一舉成名天下知。',
    jieYue: { marriage: '良緣將至', wealth: '暴發之象', career: '飛黃騰達', health: '轉危為安', travel: '一路順風', study: '一舉成名', general: '天命所歸' }
  },
  {
    id: 2014, number: 14, ganzhi: '丁丑', level: '中平', title: '莊周夢蝶',
    content: '宛如仙鶴出樊籠，脫却羈縻處處通。\n南北東西無障礙，任君直上九霄中。',
    vernacular: '像仙鶴掙脫牢籠，擺脫束縛到處通達。東南西北再無阻礙，可直上九雲霄。突破困境。',
    story: '莊子夢蝶，不知周之夢為蝴蝶與。象徵超脫。',
    jieYue: { marriage: '脫困後可成', wealth: '先難後易', career: '換環境則通', health: '病去如抽絲', travel: '離開原地佳', study: '換方法則通', general: '突破束縛' }
  },
  {
    id: 2015, number: 15, ganzhi: '戊寅', level: '中吉', title: '鍾馗捉鬼',
    content: '管取雲程還萬仞，等閑平步到天衢。\n功名富貴皆前定，何必區區嘆路途。',
    vernacular: '前程如萬仞高山，但可平步到天上。功名富貴皆前定，何必為一時不順嘆氣。',
    story: '鍾馗貌醜才高，死後封捉鬼大神。象徵外表不重要。',
    jieYue: { marriage: '命中註定', wealth: '富貴在天', career: '平步青雲', health: '吉人天相', travel: '一路順遂', study: '功名在望', general: '天命所歸' }
  },
  {
    id: 2016, number: 16, ganzhi: '己卯', level: '中平', title: '伍子胥過昭關',
    content: '一夕春雷震地聲，風吹雲散見天清。\n園林自有新景象，萬紫千紅總是春。',
    vernacular: '一夜春雷震地，風吹雲散見青天。園林有新景象，萬紫千紅都是春。黑暗過後是光明。',
    story: '伍子胥過昭關一夜白頭。象徵歷經磨難終見曙光。',
    jieYue: { marriage: '柳暗花明', wealth: '困境將過', career: '轉機將至', health: '病將癒', travel: '障礙可過', study: '豁然開朗', general: '否極泰來' }
  },
  {
    id: 2017, number: 17, ganzhi: '庚辰', level: '中平', title: '司馬相如題橋',
    content: '當年題柱志凌雲，今日功成萬古聞。\n駟馬高車歸故里，滿城爭看卓文君。',
    vernacular: '當年立下凌雲壯志，今日功成萬古流傳。衣錦還鄉。有志竟成。',
    story: '司馬相如題橋柱明志。象徵有志者事竟成。',
    jieYue: { marriage: '衣錦榮歸', wealth: '功成名就', career: '實現抱負', health: '精神飽滿', travel: '榮歸故里', study: '學有所成', general: '不負初心' }
  },
  {
    id: 2018, number: 18, ganzhi: '辛巳', level: '中吉', title: '大禹治水',
    content: '疏通水道導河川，三過家門不入眠。\n終使洪流歸大海，功成名就萬年傳。',
    vernacular: '疏導河川三過家門不入。終於讓洪水入大海，功成名就萬年傳頌。犧牲奉獻終有回報。',
    story: '大禹治水十三年三過家門不入。大公無私。',
    jieYue: { marriage: '暫時犧牲換幸福', wealth: '先苦後甘', career: '專注事業有成', health: '勞而有功', travel: '奔波有成', study: '專心致志', general: '天下無難事' }
  },
  {
    id: 2019, number: 19, ganzhi: '壬午', level: '中平', title: '劉伶醉酒',
    content: '聞道今宵是上元，銀燈火樹照乾坤。\n千金不換今宵樂，誰識蓬門有至尊。',
    vernacular: '元宵佳節銀燈照亮天地。千金也換不來今宵快樂，誰知平凡人家有快樂。珍惜當下。',
    story: '竹林七賢劉伶嗜酒避世。提醒適時放下。',
    jieYue: { marriage: '享受當下', wealth: '知足常樂', career: '時運未到', health: '小病無礙', travel: '近遊為佳', study: '厚積薄發', general: '珍惜當下' }
  },
  {
    id: 2020, number: 20, ganzhi: '癸未', level: '大吉', title: '福祿壽三星',
    content: '三星在戶照高堂，福祿壽全百事昌。\n積善之家有餘慶，代代兒孫享富康。',
    vernacular: '福祿壽三星照耀家中，百事昌盛。積善人家有餘慶，子孫世代享富康。福報降臨。',
    story: '福祿壽三星高照。人世間最大幸福。',
    jieYue: { marriage: '美滿姻緣', wealth: '財源廣進', career: '福星高照', health: '健康長壽', travel: '福至心靈', study: '學業有成', general: '三星報喜' }
  },
  {
    id: 2021, number: 21, ganzhi: '甲申', level: '中吉', title: '玄奘取經',
    content: '西方取經萬里程，歸來白馬負金經。\n天龍八部皆歡喜，從此東土有佛乘。',
    vernacular: '取經走過萬里路，歸來白馬背負金經。圓滿達成使命，從此東土有了佛法。',
    story: '玄奘法師西天取經。象徵圓滿完成使命。',
    jieYue: { marriage: '終成眷屬', wealth: '收穫滿滿', career: '功成名就', health: '康復在望', travel: '滿載而歸', study: '學業圓滿', general: '圓滿成就' }
  },
  {
    id: 2022, number: 22, ganzhi: '乙酉', level: '中平', title: '蘇東坡遊赤壁',
    content: '世事到頭都是夢，不如高臥且加餐。\n世間無限丹青手，一片傷心畫不成。',
    vernacular: '世間萬事到頭來都是夢，不如好好休息。有些事情只能自己體會，無法對人言說。',
    story: '蘇東坡貶謫黃州遊赤壁。困境中孕育偉大作品。',
    jieYue: { marriage: '看淡些', wealth: '不強求', career: '隨遇而安', health: '靜養為上', travel: '暫歇', study: '順其自然', general: '順其自然' }
  },
  {
    id: 2023, number: 23, ganzhi: '丙戌', level: '中吉', title: '文曲星下凡',
    content: '天上文星降下來，人間從此出奇才。\n文章錦繡傳千古，子子孫孫拜相台。',
    vernacular: '文曲星降臨凡間，人間從此出了奇才。錦繡文章流傳千古，子孫世代拜相封侯。文運大開。',
    story: '文曲星下凡轉世為才子。文運昌隆。',
    jieYue: { marriage: '才子佳人', wealth: '以文致富', career: '文職高陞', health: '神清氣爽', travel: '文名遠播', study: '文思泉湧', general: '文曲星照' }
  },
  {
    id: 2024, number: 24, ganzhi: '丁亥', level: '下下', title: '楊貴妃馬嵬坡',
    content: '繁華一夢轉頭空，玉碎珠沉在手中。\n莫道不消魂簾捲，西風吹盡滿樓空。',
    vernacular: '繁華如夢轉頭空，玉碎珠沉都在手中。不要說不傷心，西風吹盡滿樓都空了。',
    story: '楊貴妃馬嵬坡被迫自盡。盛極必衰、物極必反。',
    jieYue: { marriage: '鏡花水月', wealth: '繁華落盡', career: '盛極必衰', health: '需警惕', travel: '不宜', study: '一時挫折', general: '物極必反' }
  },
  {
    id: 2025, number: 25, ganzhi: '戊子', level: '大吉', title: '趙匡胤陳橋兵變',
    content: '黃袍加身自有天，風雲際會在人前。\n從今以後名聲震，富貴榮華萬萬年。',
    vernacular: '黃袍加身是天的安排，風雲際會就在眼前。從此名聲大震，富貴榮華長長久久。天命所歸。',
    story: '趙匡胤陳橋兵變黃袍加身。時勢造英雄。',
    jieYue: { marriage: '天作之合', wealth: '富貴逼人', career: '一步登天', health: '身強體健', travel: '前程似錦', study: '名揚天下', general: '天命所歸' }
  },
  {
    id: 2026, number: 26, ganzhi: '己丑', level: '中平', title: '范蠡泛舟',
    content: '功成身退泛扁舟，一葉隨風任去留。\n富貴榮華皆是夢，五湖煙景勝封侯。',
    vernacular: '功成身退搭小船泛舟，一葉隨風飄去。富貴榮華都是夢，五湖美景勝過封侯。急流勇退。',
    story: '范蠡助勾踐復國後攜西施泛舟。知進退。',
    jieYue: { marriage: '如魚得水', wealth: '見好就收', career: '功成身退', health: '悠遊自在', travel: '遊山玩水', study: '學以致用', general: '知進退' }
  },
  {
    id: 2027, number: 27, ganzhi: '庚寅', level: '中平', title: '塞翁失馬',
    content: '塞翁失馬豈非福，禍福由來本一家。\n得失榮枯天註定，不須煩惱亂如麻。',
    vernacular: '塞翁失馬未必不是福氣，禍福本來是一家。得失都是天註定，不須煩惱。禍福相依。',
    story: '塞翁失馬焉知非福。福禍相倚。',
    jieYue: { marriage: '塞翁失馬', wealth: '先失後得', career: '得失心放寬', health: '小病是福', travel: '隨遇而安', study: '一時失意勿灰心', general: '禍福相依' }
  },
  {
    id: 2028, number: 28, ganzhi: '辛卯', level: '上上', title: '包公審奇案',
    content: '青天自有日分明，鐵面無私判斷清。\n一紙文書從此定，不須憂慮心頭驚。',
    vernacular: '青天自有太陽照亮，鐵面無私的判斷清楚。一紙文書就能定案，不必憂心驚慌。正義伸張。',
    story: '包拯鐵面無私日審陽夜審陰。公正終將到來。',
    jieYue: { marriage: '正緣將至', wealth: '公道自在', career: '公正處理', health: '良醫診治', travel: '平安無事', study: '考試順利', general: '公道自在人心' }
  },
  {
    id: 2029, number: 29, ganzhi: '壬辰', level: '中平', title: '伯牙碎琴',
    content: '當初無意種良緣，此日相逢似有緣。\n無奈人情多反覆，花開花落兩難全。',
    vernacular: '當初無意種下緣分，今日相逢似有緣。無奈人情反覆，花開花落兩難全。珍惜當下。',
    story: '伯牙因子期死而碎琴。知音難覓。',
    jieYue: { marriage: '有情卻多磨難', wealth: '得失無常', career: '貴人難遇', health: '情緒影響', travel: '隨緣而行', study: '需良師', general: '珍惜眼前人' }
  },
  {
    id: 2030, number: 30, ganzhi: '癸巳', level: '上上', title: '天官賜福',
    content: '天官賜福降人間，紫氣東來滿院環。\n從今以後無災難，闔家平安樂綿綿。',
    vernacular: '天官賜福降臨人間，紫氣東來充滿院落。從今以後無災難，全家平安快樂。平安是福。',
    story: '天官大帝賜福人間。天降福氣。',
    jieYue: { marriage: '天賜良緣', wealth: '福祿自來', career: '天官賜福', health: '無災無病', travel: '平安順遂', study: '福至心靈', general: '百無禁忌' }
  },
  {
    id: 2031, number: 31, ganzhi: '甲午', level: '中平', title: '曹操煮酒論英雄',
    content: '青梅煮酒論英雄，天下誰人與我同。\n韜光養晦藏鋒銳，時機一到便成龍。',
    vernacular: '煮酒論英雄天下誰能與我相提並論。暫時隱藏鋒芒韜光養晦，時機一到馬上飛黃騰達。',
    story: '曹操與劉備煮酒論英雄。藏鋒避禍、審時度勢。',
    jieYue: { marriage: '暫且隱忍', wealth: '韜光養晦', career: '等待時機', health: '潛心調養', travel: '時機未到', study: '蓄力待發', general: '厚積薄發' }
  },
  {
    id: 2032, number: 32, ganzhi: '乙未', level: '中平', title: '愚公移山',
    content: '太行王屋兩山高，愚公立志要移逃。\n子子孫孫無窮盡，終教天帝動悲號。',
    vernacular: '兩座高山愚公立志要移走。子子孫孫無窮盡，終於感動天帝。堅持不懈。',
    story: '愚公移山感動天帝。堅韌不拔。',
    jieYue: { marriage: '代代相傳', wealth: '日積月累', career: '持之以恆', health: '持續調理', travel: '堅持到底', study: '水滴石穿', general: '天下無難事' }
  },
  {
    id: 2033, number: 33, ganzhi: '丙申', level: '上上', title: '狀元及第',
    content: '十年寒窗無人問，一舉成名天下知。\n瓊林宴上簪花日，正是金榜題名時。',
    vernacular: '十年苦讀無人問，一舉成名天下知。瓊林宴上插花日，正是金榜題名時。努力終有回報。',
    story: '古代科舉狀元及第榮耀。努力終有回報。',
    jieYue: { marriage: '良緣喜事', wealth: '名利雙收', career: '一舉成名', health: '精力充沛', travel: '功成名就', study: '金榜題名', general: '一舉成名' }
  },
  {
    id: 2034, number: 34, ganzhi: '丁酉', level: '中平', title: '西施浣紗',
    content: '傾國傾城貌若仙，含羞無語立花前。\n心中自有分明事，何必逢人說可憐。',
    vernacular: '像西施一樣美麗傾城，含羞無語站在花前。心中自有分明事，何必逢人說可憐。自信自強。',
    story: '西施浣紗溪邊因美貌被選入宮。美貌亦可是負擔。',
    jieYue: { marriage: '無需急躁', wealth: '自有定數', career: '實力為本', health: '心安則健', travel: '隨緣', study: '自有分寸', general: '相信自己' }
  },
  {
    id: 2035, number: 35, ganzhi: '戊戌', level: '中平', title: '李清照悲秋',
    content: '秋風吹動桂花香，玉露凋傷樹葉黃。\n二十四番風信後，不知人在水中央。',
    vernacular: '秋風吹動桂花香，露水凋傷了枯黃樹葉。時節變換人事已非。世事無常。',
    story: '李清照南渡後詞風轉淒涼。時局變遷。',
    jieYue: { marriage: '聚散無常', wealth: '起落不定', career: '環境變遷', health: '季節不適', travel: '時機未到', study: '靜待時機', general: '世事無常' }
  },
  {
    id: 2036, number: 36, ganzhi: '己亥', level: '中吉', title: '達摩面壁',
    content: '九年面壁默無言，終得如來正法傳。\n若要工夫深到底，鐵杵磨成繡花針。',
    vernacular: '九年面壁不曾說話，終於得到如來正法傳承。只要工夫下得深，鐵杵也能磨成繡花針。',
    story: '達摩祖師面壁九年。堅忍不拔。',
    jieYue: { marriage: '日久生情', wealth: '日積月累', career: '堅持不懈', health: '長期調理', travel: '不急不躁', study: '鐵杵磨針', general: '功夫不負有心人' }
  },
  {
    id: 2037, number: 37, ganzhi: '庚子', level: '中平', title: '阮籍哭窮途',
    content: '行到山窮水盡時，不如守己待天時。\n一朝春至冰霜解，枯木逢春發舊枝。',
    vernacular: '走到山窮水盡時，不如安守本分等待天時。春天一到冰霜溶解，枯木重新發芽。困境將過。',
    story: '阮籍駕車至窮途大哭而返。絕望中的轉機。',
    jieYue: { marriage: '目前困難日後可成', wealth: '先困後亨', career: '柳暗花明', health: '耐心調理', travel: '暫不宜行', study: '堅持不懈', general: '柳暗花明' }
  },
  {
    id: 2038, number: 38, ganzhi: '辛丑', level: '中吉', title: '劉秀起兵',
    content: '雷聲霹靂震天門，萬物逢春自發根。\n若遇貴人相指引，何愁金榜不題名。',
    vernacular: '雷霆震動天門萬物逢春自發根。若遇貴人指引，何愁金榜不能題名。貴人相助。',
    story: '劉秀起兵復興漢室。從逆境中崛起。',
    jieYue: { marriage: '貴人牽線', wealth: '遇貴人指引', career: '得貴人提攜', health: '遇良醫', travel: '有貴人同行', study: '師長提攜', general: '吉星高照' }
  },
  {
    id: 2039, number: 39, ganzhi: '壬寅', level: '中平', title: '杞人憂天',
    content: '世人何必自相欺，憂慮從頭到尾癡。\n日月循環天地久，何曾見有泰山移。',
    vernacular: '世人何必自欺欺人，憂慮從頭到尾都是癡的。日月循環天地長久，何曾見過泰山移動。不必過度擔心。',
    story: '杞人憂天傾。過度擔心是多餘的。',
    jieYue: { marriage: '勿過慮', wealth: '穩如泰山', career: '不必擔憂', health: '放寬心', travel: '安然無事', study: '從容以對', general: '庸人自擾' }
  },
  {
    id: 2040, number: 40, ganzhi: '癸卯', level: '上上', title: '財神到',
    content: '財神降福到門庭，金玉滿堂百事興。\n從此經營皆順利，堆金積玉享安寧。',
    vernacular: '財神降福到家門口，金玉滿堂百事興旺。從此經營順利，堆金積玉享受安寧。財運亨通。',
    story: '財神爺賜福人間。財運大開。',
    jieYue: { marriage: '財子佳人', wealth: '財源廣進', career: '生意興隆', health: '福壽安康', travel: '滿載而歸', study: '金榜題名', general: '財神到福氣到' }
  },
  {
    id: 2041, number: 41, ganzhi: '甲辰', level: '中吉', title: '張騫通西域',
    content: '欲求富貴須奔波，南北東西任去留。\n若遇貴人相助力，功名成就自無憂。',
    vernacular: '想要富貴必須四處奔波，東西南北任你去留。遇到貴人相助，功名成就自然無憂。走出去才有機會。',
    story: '張騫出使西域開拓絲綢之路。開拓精神。',
    jieYue: { marriage: '異地姻緣', wealth: '四方得利', career: '外出發展', health: '多運動', travel: '遠行有利', study: '遊學有成', general: '路是人走出來的' }
  },
  {
    id: 2042, number: 42, ganzhi: '乙巳', level: '中平', title: '嫦娥奔月',
    content: '碧海青天夜夜心，嫦娥應悔竊靈藥。\n高處不勝寒起舞，何如在世共徘徊。',
    vernacular: '碧海青天夜夜思念，嫦娥後悔偷了靈藥。高處不勝寒獨自起舞，何如在人間相伴。',
    story: '嫦娥偷吃靈藥飛上廣寒宮。犧牲換來的未必是幸福。',
    jieYue: { marriage: '勿因小失大', wealth: '得不償失', career: '高處不勝寒', health: '注意保養', travel: '遠離未必好', study: '腳踏實地', general: '珍惜眼前' }
  },
  {
    id: 2043, number: 43, ganzhi: '丙午', level: '中吉', title: '岳飛精忠報國',
    content: '精誠所至石為開，壯志凌雲不可摧。\n他日功成名就後，滿堂金玉自然來。',
    vernacular: '精誠所至金石為開，凌雲壯志不可摧毀。將來功成名就後，滿堂金玉自然會來。堅持就能成功。',
    story: '岳飛背上刺精忠報國。精神永存。',
    jieYue: { marriage: '真心感動天', wealth: '辛勤得財', career: '有志竟成', health: '毅力戰勝', travel: '勇往直前', study: '刻苦有成', general: '精誠所至' }
  },
  {
    id: 2044, number: 44, ganzhi: '丁未', level: '中平', title: '梁祝化蝶',
    content: '同窗三載兩無猜，十八相送淚滿腮。\n化蝶雙飛終遂願，人間從此有樓臺。',
    vernacular: '同窗三年兩小無猜，十八相送淚流滿面。化蝶雙飛終於如願，人間從此有樓臺會。真情感人。',
    story: '梁山伯與祝英台愛情悲劇。真情至死不渝。',
    jieYue: { marriage: '情深緣深', wealth: '情感勝金錢', career: '志同道合', health: '情志不暢', travel: '比翼雙飛', study: '同窗共勉', general: '有情人終成眷屬' }
  },
  {
    id: 2045, number: 45, ganzhi: '戊申', level: '中吉', title: '朱元璋放牛',
    content: '莫道出身是賤微，英雄何論出高低。\n一朝運至風雲會，錦繡前程在眼前。',
    vernacular: '不要說出身低微，英雄不論出身。時運到了風雲際會，錦繡前程就在眼前。不論出身只看努力。',
    story: '朱元璋從放牛娃到皇帝。出身不代表一切。',
    jieYue: { marriage: '不計較出身', wealth: '白手起家', career: '英雄不問出處', health: '體質日好', travel: '外出闖蕩', study: '勤能補拙', general: '英雄不問出處' }
  },
  {
    id: 2046, number: 46, ganzhi: '己酉', level: '中平', title: '黃粱一夢',
    content: '人生富貴似浮雲，一夢黃粱幾度春。\n欲問前程何處好，不如回首看前津。',
    vernacular: '人生富貴如浮雲般短暫，黃粱一夢過了幾個春天。想問前程在哪裡，不如回頭看看來時路。',
    story: '盧生黃粱一夢歷盡一生榮華。人生短暫富貴如夢。',
    jieYue: { marriage: '珍惜眼前人', wealth: '知足為上', career: '回頭是岸', health: '放寬心', travel: '回家為佳', study: '溫故知新', general: '驀然回首' }
  },
  {
    id: 2047, number: 47, ganzhi: '庚戌', level: '大吉', title: '郭子儀拜壽',
    content: '七子八婿滿床笏，富貴壽考古今無。\n忠君愛國全臣節，始信人間有丈夫。',
    vernacular: '七子八婿滿床都是官位，富貴長壽古今少有。忠君愛國保全了臣節，人間真有這樣的大丈夫。',
    story: '郭子儀一生戎馬七子八婿皆為官。圓滿人生。',
    jieYue: { marriage: '子孫滿堂', wealth: '富貴綿長', career: '功成名就', health: '福壽雙全', travel: '榮歸故里', study: '功名成就', general: '圓滿如意' }
  },
  {
    id: 2048, number: 48, ganzhi: '辛亥', level: '中平', title: '林黛玉葬花',
    content: '花開花謝兩無情，春去秋來百感生。\n借問世間誰是主，暫時相賞莫相輕。',
    vernacular: '花開花謝都是無情的，春去秋來百感交集。暫時相聚就好好珍惜不要輕視。珍惜當下。',
    story: '林黛玉葬花感嘆紅顏薄命。美好事物易逝。',
    jieYue: { marriage: '珍惜當下', wealth: '花開堪折直須折', career: '把握時機', health: '青春易逝', travel: '及時行樂', study: '把握光陰', general: '有花堪折直須折' }
  },
  {
    id: 2049, number: 49, ganzhi: '壬子', level: '中吉', title: '管鮑之交',
    content: '管仲鮑叔兩心知，患難相交見義時。\n自古交情貴知己，何須多語說分離。',
    vernacular: '管仲鮑叔牙兩心相知，患難時才見真情義。知己難得不需多說。真友誼不求回報。',
    story: '管仲與鮑叔牙的知己之情。人生得一知己足矣。',
    jieYue: { marriage: '知己成伴侶', wealth: '合作無間', career: '得貴人知己', health: '心安體健', travel: '好友同行', study: '良師益友', general: '知己難得' }
  },
  {
    id: 2050, number: 50, ganzhi: '癸丑', level: '中平', title: '王昭君出塞',
    content: '遠看山色近看無，春風不度玉門關。\n羌笛何須怨楊柳，人生何處不青山。',
    vernacular: '遠看有山色近看沒有，春風吹不到玉門關。何必悲傷，人生哪裡沒有青山。向前看自有出路。',
    story: '王昭君出塞和親。犧牲有時是另一種成全。',
    jieYue: { marriage: '遠嫁或異地', wealth: '往遠處發展', career: '換環境為佳', health: '異地調養', travel: '遠方有利', study: '出外求學佳', general: '人生處處有轉機' }
  },
  {
    id: 2051, number: 51, ganzhi: '甲寅', level: '中平', title: '孫悟空大鬧天宮',
    content: '天生一個大聖人，神通廣大震乾坤。\n雖然鬧得天宮亂，到頭終是有前程。',
    vernacular: '天生大聖人神通廣大震動天地。雖然鬧得天宮混亂，到頭來還是有前程。有能力者終有出路。',
    story: '孫悟空大鬧天宮後隨唐僧取經成正果。',
    jieYue: { marriage: '先難後順', wealth: '波動後穩定', career: '鋒芒畢露後沉穩', health: '活力充沛', travel: '波折但可達', study: '天才需磨練', general: '玉不琢不成器' }
  },
  {
    id: 2052, number: 52, ganzhi: '乙卯', level: '中平', title: '孟母三遷',
    content: '慈母三遷擇鄰居，斷機教子惜三餘。\n若非賢母殷勤教，亞聖何由萬古譽。',
    vernacular: '慈母三次搬家選擇鄰居，割斷布機教導孩子。賢母殷勤教導才成就亞聖孟子。環境與教育的重要。',
    story: '孟母三遷教子斷機勸學。近朱者赤。',
    jieYue: { marriage: '為子女擇良緣', wealth: '投資教育', career: '換環境則通', health: '擇良醫', travel: '擇地而居', study: '擇良師益友', general: '近朱者赤' }
  },
  {
    id: 2053, number: 53, ganzhi: '丙辰', level: '中吉', title: '八仙過海',
    content: '八仙過海顯神通，各展奇能各不同。\n只要心誠功力到，何愁萬事不成空。',
    vernacular: '八仙過海各顯神通各展奇能。只要心誠功力深厚，何愁萬事不成。各憑本事殊途同歸。',
    story: '八仙過海各顯神通。殊途同歸。',
    jieYue: { marriage: '各有緣法', wealth: '各顯神通', career: '發揮所長', health: '各安天命', travel: '自有妙計', study: '因材施教', general: '各顯神通' }
  },
  {
    id: 2054, number: 54, ganzhi: '丁巳', level: '中平', title: '白蛇傳',
    content: '千年修煉在峨眉，為報君恩下翠微。\n可惜人妖終有別，雷峰塔下苦相違。',
    vernacular: '在峨眉山修煉千年，為了報答恩情下了青山。可惜人妖終究有別，在雷峰塔下苦苦相望。',
    story: '白素貞與許仙的愛情故事。情深可能被現實所困。',
    jieYue: { marriage: '情深緣淺', wealth: '為情所困', career: '受到束縛', health: '積鬱成疾', travel: '被困一方', study: '心煩意亂', general: '情深不壽' }
  },
  {
    id: 2055, number: 55, ganzhi: '戊午', level: '中吉', title: '周處除三害',
    content: '少年為害里中聞，一旦回頭作好人。\n斬蛟射虎除三害，英名從此震乾坤。',
    vernacular: '少年為害鄉里出了名，一旦回頭就做了好人。斬蛟龍射老虎除三害，英名震動天地。浪子回頭。',
    story: '周處年少為害鄉里後改過自新。浪子回頭金不換。',
    jieYue: { marriage: '浪子回頭', wealth: '改過後得財', career: '洗心革面', health: '斷除惡習', travel: '改道易轍', study: '發奮圖強', general: '放下屠刀立地成佛' }
  },
  {
    id: 2056, number: 56, ganzhi: '己未', level: '中平', title: '葉公好龍',
    content: '葉公好龍畫滿堂，真龍下降卻驚惶。\n口是心非終誤己，虛情假意費思量。',
    vernacular: '葉公到處畫龍說喜歡龍，真龍來了卻嚇得驚慌。口是心非最終耽誤自己，要誠實面對自己。',
    story: '葉公好龍真龍來訪卻嚇得魂飛魄散。言行不一。',
    jieYue: { marriage: '真心換真心', wealth: '誠信為本', career: '表裡如一', health: '心口一致', travel: '真心實意', study: '腳踏實地', general: '知行合一' }
  },
  {
    id: 2057, number: 57, ganzhi: '庚申', level: '大吉', title: '日出東方',
    content: '雞鳴報曉五更風，日出東方萬里紅。\n從今掃盡陰霾氣，一路光明處處通。',
    vernacular: '公雞報曉五更風吹，太陽從東方升起萬里通紅。從此掃盡陰霾之氣，一路光明處處暢通。黎明到來。',
    story: '旭日東升象徵新開始和希望。',
    jieYue: { marriage: '光明正大', wealth: '財路光明', career: '前景光明', health: '康復在望', travel: '一路順風', study: '茅塞頓開', general: '撥雲見日' }
  },
  {
    id: 2058, number: 58, ganzhi: '辛酉', level: '中平', title: '嚴子陵釣臺',
    content: '富春江上釣魚翁，天子呼來不上船。\n自稱臣是酒中仙，清風明月不論錢。',
    vernacular: '富春江上釣魚老翁，天子呼喚都不上船。自稱酒中之仙，清風明月不用錢買。不慕榮利。',
    story: '嚴子陵與漢光武帝同學卻不願作官。不慕榮利。',
    jieYue: { marriage: '不慕虛榮', wealth: '淡泊名利', career: '獨立自主', health: '清心寡慾', travel: '隨心所欲', study: '不為名利', general: '無欲則剛' }
  },
  {
    id: 2059, number: 59, ganzhi: '壬戌', level: '中平', title: '神農嘗百草',
    content: '親嘗百草為蒼生，中毒渾然不懼驚。\n從此醫方傳後世，萬年香火報功成。',
    vernacular: '親自嘗百草為了蒼生，中毒也不懼怕。從此醫方流傳後世，萬年香火報答功成。犧牲奉獻。',
    story: '神農氏親嘗百草以定藥性。犧牲奉獻的精神。',
    jieYue: { marriage: '真愛付出', wealth: '積德致富', career: '奉獻精神', health: '良藥苦口', travel: '探尋新知', study: '身體力行', general: '一分耕耘一分收穫' }
  },
  {
    id: 2060, number: 60, ganzhi: '癸亥', level: '上上', title: '滿載而歸',
    content: '扁舟一葉出滄海，載得明珠滿載歸。\n從今不用觀人面，自有餘光照錦衣。',
    vernacular: '一艘小船出海載著明珠滿載而歸。從此不用看人臉色，自有光芒照耀錦繡前程。收穫滿滿。',
    story: '出海尋寶滿載而歸。付出終有豐厚回報。',
    jieYue: { marriage: '終成眷屬', wealth: '滿載而歸', career: '功成名就', health: '康復痊癒', travel: '滿載而歸', study: '滿分高中', general: '滿載而歸' }
  }
];
