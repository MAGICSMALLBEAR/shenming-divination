// 姓名學（三才五格） — 純計算服務
// 使用康熙字典筆畫標準（繁體中文姓名學）

export interface GeResult {
  value: number;
  element: string;
  meaning: string;
}

export interface NameAnalysisResult {
  surname: string;
  givenName: string;
  surnameStrokes: number;
  givenNameStrokes: number;
  totalStrokes: number;
  tianGe: GeResult;
  renGe: GeResult;
  diGe: GeResult;
  waiGe: GeResult;
  zongGe: GeResult;
  sanCai: { combination: string; judgment: string; detail: string };
  overallJudgment: string;
  luckyStrokes: number[];
}

// ─── 筆畫查詢表（康熙字典標準） ───
// 收錄常用姓氏（80+）與常見命名用字，共250+字，無重複鍵
const STROKE_MAP: Record<string, number> = {
  // ═══ 常用台灣姓氏 ═══
  陳: 16, 林: 8, 黃: 12, 張: 11, 李: 7, 王: 4, 吳: 7, 劉: 15, 蔡: 15,
  楊: 13, 許: 11, 鄭: 19, 謝: 17, 郭: 15, 洪: 10, 邱: 12, 曾: 12, 廖: 14,
  賴: 16, 徐: 10, 周: 8, 葉: 15, 蘇: 22, 莊: 13, 江: 7, 呂: 7, 何: 7,
  羅: 20, 高: 10, 蕭: 19, 潘: 16, 朱: 6, 簡: 18, 彭: 12, 游: 13,
  詹: 13, 胡: 11, 施: 9, 沈: 8, 余: 7, 趙: 14, 盧: 16, 梁: 11, 顏: 18,
  柯: 9, 孫: 10, 魏: 21, 翁: 10, 戴: 17, 范: 11, 宋: 7, 方: 4, 鄧: 19,
  曹: 11, 傅: 12, 溫: 13, 薛: 19, 馬: 10, 蔣: 17, 唐: 10, 卓: 8, 藍: 20,
  石: 5, 姚: 9, 董: 15, 紀: 9, 歐: 15, 程: 12, 連: 14, 古: 5, 汪: 8,
  湯: 13, 姜: 9, 田: 5, 康: 11, 白: 5, 涂: 11, 尤: 4, 巫: 7, 韓: 17,
  龔: 22, 嚴: 20, 黎: 15, 金: 8, 阮: 12, 童: 12, 萬: 15, 錢: 16,
  鐘: 20, 于: 3, 丁: 2, 侯: 9, 龍: 16, 倪: 10, 夏: 10, 歐陽: 26, 諸葛: 25,

  // ═══ 筆畫 1-4 ═══
  一: 1, 乙: 1, 七: 2, 乃: 2, 九: 2, 了: 2, 二: 2, 人: 2,
  八: 2, 力: 2, 十: 2, 又: 2, 三: 3, 下: 3, 久: 3, 也: 3,
  千: 3, 口: 3, 土: 3, 大: 3, 女: 3, 子: 3, 寸: 3, 小: 3, 山: 3,
  工: 3, 己: 3, 已: 3, 弓: 3, 才: 4, 之: 4, 元: 4, 公: 4, 孔: 4,
  少: 4, 心: 4, 戈: 4, 戶: 4, 手: 4, 文: 4, 斗: 4, 斤: 4,
  日: 4, 月: 4, 木: 4, 比: 4, 毛: 4, 水: 4, 火: 4, 父: 4, 牛: 4,
  犬: 4, 天: 4, 中: 4, 不: 4, 仁: 4, 友: 4, 化: 4, 升: 4,

  // ═══ 筆畫 5-8 ═══
  世: 5, 主: 5, 以: 5, 冬: 5, 可: 5, 右: 5, 生: 5, 目: 5,
  立: 5, 甲: 5, 申: 5, 皮: 5, 示: 5, 正: 5, 平: 5,
  永: 5, 弘: 5, 民: 5, 玉: 5, 卉: 5, 北: 5, 出: 5, 功: 5, 加: 5,
  亦: 6, 光: 6, 全: 6, 共: 6, 冰: 6, 吉: 6, 同: 6, 名: 6, 地: 6,
  多: 6, 好: 6, 如: 6, 宇: 6, 安: 6, 年: 6, 成: 7, 有: 6,
  汝: 6, 竹: 6, 米: 6, 老: 6, 臣: 6, 自: 6, 至: 6, 行: 6,
  衣: 6, 西: 6, 羽: 6, 伊: 6, 仰: 6, 任: 6, 字: 6, 守: 6, 百: 6,
  克: 7, 利: 7, 呈: 7, 均: 7, 坊: 7, 宏: 7, 志: 7, 村: 7, 步: 7,
  每: 7, 秀: 7, 良: 7, 見: 7, 言: 7, 豆: 7, 貝: 7, 走: 7, 身: 7,
  車: 7, 辛: 7, 辰: 7, 里: 7, 玖: 7, 亨: 7, 伯: 7, 佑: 7, 伶: 7,
  妙: 7, 孝: 7, 序: 7, 廷: 7, 彤: 7, 含: 7, 君: 7, 吟: 7,
  亞: 8, 享: 8, 佳: 8, 來: 8, 依: 8, 佩: 8, 宗: 8, 宜: 8, 尚: 8,
  承: 8, 昌: 8, 明: 8, 東: 8, 欣: 8, 武: 8, 河: 8, 法: 8,
  知: 8, 花: 8, 芳: 8, 雨: 8, 青: 8, 其: 8, 坤: 8, 孟: 8,
  季: 8, 定: 8, 宛: 8, 念: 8, 忠: 8, 怡: 8, 昀: 8, 昕: 8, 杰: 8,
  秉: 8, 竺: 8, 芷: 8, 采: 8, 長: 8, 岸: 8, 岳: 8, 幸: 8,
  弦: 8, 征: 8,

  // ═══ 筆畫 9-12 ═══
  俊: 9, 冠: 9, 則: 9, 品: 9, 姣: 9, 宣: 9, 建: 9, 彥: 9, 思: 9,
  柔: 9, 柏: 9, 泉: 9, 炫: 9, 玫: 9, 玲: 9, 珊: 9, 珍: 9, 盈: 9,
  研: 9, 秋: 9, 科: 9, 紅: 9, 美: 9, 致: 9, 英: 9, 若: 9,
  茂: 9, 信: 9, 亮: 9, 亭: 9, 俞: 9, 勇: 9, 勉: 9, 南: 9, 厚: 9,
  威: 9, 姿: 9, 星: 9, 春: 9, 昭: 9, 映: 9,
  昱: 9, 政: 9, 柄: 9, 治: 9, 泓: 9, 勁: 9, 禹: 9,
  育: 10, 倩: 10, 凌: 10, 剛: 10, 原: 10, 峰: 10, 庭: 10, 恩: 10,
  恭: 10, 哲: 10, 娟: 10, 宸: 10, 容: 10, 展: 10, 峻: 10,
  時: 10, 書: 10, 栩: 10, 真: 10, 祐: 10, 純: 10, 素: 10, 紋: 10,
  耕: 10, 航: 10, 芝: 10, 芮: 10, 芯: 10, 芬: 10, 芸: 10,
  修: 10, 倫: 10, 兼: 10, 家: 10, 師: 10,
  晏: 10, 晉: 10, 朔: 10, 桓: 10, 桂: 10, 桐: 10, 殷: 10, 泰: 10,
  浩: 10, 益: 10, 記: 10, 訓: 10, 軒: 10, 釗: 10,
  偉: 11, 健: 11, 唯: 11, 國: 11, 基: 11, 培: 11, 婉: 11, 崇: 11,
  彩: 11, 敏: 11, 啟: 11, 晨: 11, 涵: 11, 淑: 11, 清: 11, 祥: 11,
  羚: 11, 翎: 11, 聆: 11, 莘: 11, 訪: 11, 翊: 11, 堉: 11,
  尉: 11, 得: 11, 彬: 11, 曼: 11, 望: 11, 淳: 11, 涴: 11,
  現: 11, 章: 11, 翌: 11, 貫: 11, 帷: 11, 崧: 11, 偵: 11, 寄: 11,
  富: 12, 嵐: 12, 弼: 12, 復: 12, 惠: 12, 揚: 12, 敦: 12, 晴: 12,
  晶: 12, 智: 12, 期: 12, 棠: 12, 棋: 12, 湘: 12, 琪: 12,
  琳: 12, 皓: 12, 硯: 12, 竣: 12, 翔: 12, 舜: 12, 菁: 12, 華: 12,
  詠: 12, 超: 12, 閎: 12, 雅: 12, 集: 12, 雲: 12, 凱: 12, 勝: 12,
  博: 12, 善: 12, 喬: 12, 堯: 12, 婷: 12, 媛: 12, 惇: 12,
  斐: 12, 斯: 12, 普: 12, 景: 12, 欽: 12, 渲: 12,
  渝: 12, 澔: 12, 然: 12, 絜: 12,
  舒: 12, 茵: 12, 証: 12, 貴: 12, 鈞: 12, 閔: 12, 雯: 12, 馮: 12,

  // ═══ 筆畫 13-16 ═══
  勤: 13, 暉: 13, 楠: 13, 楷: 13, 煒: 13, 瑞: 13, 敬: 13, 新: 13,
  暄: 13, 楨: 13, 榆: 13, 歆: 13, 煜: 13, 煥: 13, 煌: 13,
  聖: 13, 群: 13, 萱: 13, 詩: 13, 詳: 13, 資: 13, 載: 13,
  農: 13, 雍: 13, 靖: 13, 雷: 13, 馳: 13, 鼎: 13, 禎: 13, 義: 13,
  裕: 13, 詮: 13, 暘: 13, 楹: 13, 筠: 13, 楀: 13, 業: 13,
  煦: 13, 瑟: 13, 瑋: 13, 睦: 13, 督: 13, 粲: 13, 落: 13,
  暐: 14, 睿: 14, 碩: 14, 維: 14, 綸: 14, 誌: 14, 豪: 14, 輔: 14,
  銘: 14, 齊: 14, 榮: 14, 槐: 14, 榛: 14, 榕: 14, 瑀: 14, 瑄: 14,
  碧: 14, 福: 14, 語: 14, 誠: 14, 賓: 14, 赫: 14,
  銀: 14, 銓: 14, 韶: 14, 鳳: 14, 嘉: 14, 寧: 14, 綺: 14,
  聞: 14, 裴: 14, 誥: 14, 遠: 14, 閣: 14,
  誼: 15, 賢: 15, 輝: 15, 鋒: 15, 震: 15, 霆: 15, 頡: 15, 璇: 15,
  瑾: 15, 瑩: 15, 樂: 15, 毅: 15, 潔: 15, 潁: 15,
  勳: 16, 學: 16, 憲: 16, 樺: 16, 樹: 16, 穎: 16, 翰: 16, 臻: 16,
  融: 16, 衡: 16, 錡: 16, 錦: 16, 霖: 16, 靜: 16, 諺: 16, 諭: 16,
  豫: 16, 羲: 16, 熹: 16, 燁: 16, 燕: 16, 積: 16, 穆: 16,
  興: 16, 鋼: 16, 築: 16, 寰: 16, 儒: 16,

  // ═══ 筆畫 17+ ═══
  濬: 17, 燦: 17, 禧: 17, 謙: 17, 襄: 17, 翼: 17, 聰: 17,
  聯: 17, 薇: 17, 鴻: 17, 駿: 17, 勵: 17, 彌: 17, 擎: 17,
  鍾: 17, 霞: 17, 璘: 17, 璿: 17, 繁: 17, 嬬: 17, 孺: 17, 嶺: 17,
  嶸: 17, 應: 17, 營: 17, 濂: 17,
  璧: 18, 織: 18, 翹: 18, 薩: 18, 覲: 18, 豐: 18, 馥: 18,
  禮: 18, 繡: 18, 謹: 18, 鎮: 18, 雙: 18, 騏: 18,
  璨: 18, 蕊: 18, 韜: 18, 題: 18, 鵲: 18, 鯉: 18,
  瀚: 19, 懷: 19, 璽: 19, 藝: 19, 鵬: 19, 麒: 19, 麗: 19,
  瓊: 20, 寶: 20, 曦: 20, 獻: 20, 繼: 20, 耀: 20,
  艦: 20, 釋: 20, 騰: 20, 齡: 20, 瀧: 20, 蘊: 20, 競: 20,
  譽: 21, 躍: 21, 鶯: 21, 鶴: 21, 櫻: 21, 蘭: 21, 鐵: 21, 辯: 21,
  權: 22, 懿: 22, 鑑: 22, 歡: 22, 疊: 22, 籠: 22, 讀: 22, 霽: 22,
  麟: 23, 巖: 23, 顯: 23, 驗: 23, 鷹: 24, 靈: 24, 鑫: 24,
  觀: 25, 鑾: 25,
};

// 複姓集合
const COMPOUND_SURNAMES = new Set(['歐陽', '司徒', '諸葛', '司馬', '上官', '夏侯', '令狐', '慕容', '尉遲']);

export function getStrokes(char: string): number {
  return STROKE_MAP[char] ?? 0;
}

export function getCharStrokes(name: string): number[] {
  const chars = [...name];
  return chars.map((ch) => getStrokes(ch));
}

// ─── 五行推導 ───
// 尾數：1-2=木, 3-4=火, 5-6=土, 7-8=金, 9-0=水
export function strokesToElement(value: number): string {
  const lastDigit = value % 10;
  if (lastDigit === 1 || lastDigit === 2) return '木';
  if (lastDigit === 3 || lastDigit === 4) return '火';
  if (lastDigit === 5 || lastDigit === 6) return '土';
  if (lastDigit === 7 || lastDigit === 8) return '金';
  return '水';
}

// ─── 五行顏色 ───
export const ELEMENT_COLORS: Record<string, string> = {
  木: '#4CAF50',
  火: '#F44336',
  土: '#FF9800',
  金: '#FFD700',
  水: '#2196F3',
};

// ─── 三才配置評判 ───
interface SanCaiEntry {
  combination: string;
  judgment: string;
  detail: string;
}

function buildSanCaiDB(): Record<string, SanCaiEntry> {
  const elements = ['木', '火', '土', '金', '水'];
  const db: Record<string, SanCaiEntry> = {};

  const generatesNext: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const generatedBy: Record<string, string> = { 火: '木', 土: '火', 金: '土', 水: '金', 木: '水' };
  const overcomes: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  const overcomeBy: Record<string, string> = { 土: '木', 水: '土', 火: '水', 金: '火', 木: '金' };

  for (const t of elements) {
    for (const r of elements) {
      for (const d of elements) {
        const comb = `${t}${r}${d}`;
        let score = 0;
        const reasons: string[] = [];

        // 天人關係：天格(t)→人格(r)
        if (generatesNext[t] === r) {
          score += 3;
          reasons.push('天格生人格，祖蔭深厚、福澤綿長');
        } else if (generatedBy[t] === r) {
          score += 2;
          reasons.push('人格生天格，奮發向上、光耀門楣');
        } else if (overcomes[t] === r) {
          score -= 1;
          reasons.push('天格克人格，祖業壓力、身心勞苦');
        } else if (overcomeBy[t] === r) {
          score -= 2;
          reasons.push('人格克天格，叛逆孤高、事倍功半');
        } else if (t === r) {
          score += 1;
          reasons.push('天格人格同五行，安定平穩');
        }

        // 人地關係：人格(r)→地格(d)
        if (generatesNext[r] === d) {
          score += 3;
          reasons.push('人格生地格，晚年昌隆、子女有成');
        } else if (generatedBy[r] === d) {
          score += 2;
          reasons.push('地格生人格，根基穩固、晚運亨通');
        } else if (overcomes[r] === d) {
          score -= 1;
          reasons.push('人格克地格，對下屬或子女期許過高，易生隔閡');
        } else if (overcomeBy[r] === d) {
          score -= 2;
          reasons.push('地格克人格，晚運多舛、下犯上之憂');
        } else if (r === d) {
          score += 1;
          reasons.push('人格地格同五行，根基平穩');
        }

        // 天格與地格的間接關係
        if (t === d) {
          score += 1;
          reasons.push('天格地格呼應，始終如一');
        }

        const judgment =
          score >= 5 ? '大吉' :
          score >= 3 ? '吉' :
          score >= 1 ? '中吉' :
          score >= -1 ? '凶' : '大凶';

        db[comb] = { combination: comb, judgment, detail: reasons.join('；') };
      }
    }
  }
  return db;
}

const SANCAI_DB = buildSanCaiDB();

// ─── 吉數（81 數理） ───
const LUCKY_NUMBERS: number[] = [
  1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25,
  29, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61,
  63, 65, 67, 68, 71, 73, 75, 77, 81,
];

// ─── 五格吉凶解說 ───
function geMeaning(type: string, value: number, element: string): string {
  const lucky = LUCKY_NUMBERS.includes(value);
  const base = lucky
    ? `${type}數${value}（${element}），此數為吉數，`
    : `${type}數${value}（${element}），此數為普通或凶數，`;

  const tips: Record<string, Record<string, string>> = {
    天格: {
      木: '祖上根基穩固，早年運勢平順，得長輩庇蔭。',
      火: '祖運旺盛，家世顯赫，但早年易有波動，需自我調適。',
      土: '祖德深厚，家運敦厚踏實，初期雖緩但後勢可期。',
      金: '祖業堅實，家風剛正，早運較為順遂，但需防剛愎。',
      水: '祖蔭流長，家運如水流動，早年環境變遷較多，適應力強。',
    },
    人格: {
      木: '性格正直仁厚，具領導力與成長性，為人處世有原則。',
      火: '熱情積極，行動力強，但急躁易怒，需修養心性。',
      土: '誠信穩重，包容力強，處事踏實，為可靠之人。',
      金: '剛毅果斷，重義氣，有決斷力，但需防過於固執。',
      水: '智慧靈活，善於變通，人際圓融，但需防優柔寡斷。',
    },
    地格: {
      木: '根基紮實，青年運勢成長迅速，得朋友助力。',
      火: '早年活躍多變，社交能力強，但需防浮動不定。',
      土: '基礎穩固，步步為營，中年之前累積實力。',
      金: '早運剛健，執行力強，但需防過剛易折。',
      水: '適應力佳，早年多歷練，閱歷豐富但易漂泊。',
    },
    外格: {
      木: '社交關係和諧，人緣佳，得貴人相助。',
      火: '外在表現活躍亮眼，但人際易有摩擦，需以和為貴。',
      土: '待人敦厚誠懇，外緣穩定，得信賴。',
      金: '外在形象鮮明，處事明快，但需防主觀過強。',
      水: '外在圓融靈活，適應力強，人際廣泛。',
    },
    總格: {
      木: '一生運勢如大樹成長，晚年根基深厚，福壽綿長。',
      火: '一生充滿活力與變化，晚年需注意健康養生。',
      土: '一生穩健踏實，晚年安泰，家運興旺。',
      金: '一生剛健有成，事業有為，晚年宜守成。',
      水: '一生流轉豐富，智慧通達，晚年宜定心安養。',
    },
  };

  return base + (tips[type]?.[element] ?? '');
}

// ─── 整體評判 ───
function buildOverallJudgment(sanCai: SanCaiEntry, geList: GeResult[]): string {
  const parts: string[] = [];

  if (sanCai.judgment === '大吉' || sanCai.judgment === '吉') {
    parts.push(`三才配置「${sanCai.combination}」為${sanCai.judgment}，五行生化有情，天地人三才和諧。`);
  } else if (sanCai.judgment === '中吉') {
    parts.push(`三才配置「${sanCai.combination}」為中吉，整體尚可，但部分環節需多加留意與調整。`);
  } else {
    parts.push(`三才配置「${sanCai.combination}」為${sanCai.judgment}，五行有所沖剋，建議搭配吉數或尋求專業命名調整。`);
  }

  const luckyCount = geList.filter((g) => LUCKY_NUMBERS.includes(g.value)).length;
  if (luckyCount >= 4) {
    parts.push('五格中有四格以上為吉數，整體運勢配置優良。');
  } else if (luckyCount >= 3) {
    parts.push('五格中有三格為吉數，配置尚佳，但仍有進步空間。');
  } else if (luckyCount >= 2) {
    parts.push('五格中有兩格為吉數，建議參考吉數清單進行調整。');
  } else {
    parts.push('五格吉數偏少，建議重新擇字以求更佳配置。');
  }

  return parts.join(' ');
}

// ─── 主計算函數 ───
export function analyzeName(surname: string, givenName: string): NameAnalysisResult | null {
  const s = surname.trim();
  const g = givenName.trim();
  if (!s || !g) return null;

  const surnameStrokesArr = getCharStrokes(s);
  const givenStrokesArr = getCharStrokes(g);

  const surnameStrokes = surnameStrokesArr.reduce((a, b) => a + b, 0);
  const givenNameStrokes = givenStrokesArr.reduce((a, b) => a + b, 0);
  const totalStrokes = surnameStrokes + givenNameStrokes;

  const isCompoundName = COMPOUND_SURNAMES.has(s);
  const surnameLastCharStrokes = surnameStrokesArr[surnameStrokesArr.length - 1] || 0;
  const givenFirstCharStrokes = givenStrokesArr[0] || 0;

  // 天格：單姓=姓氏筆畫+1，複姓=姓氏各字筆畫和
  const tianGeValue = isCompoundName ? surnameStrokes : surnameStrokes + 1;
  // 人格：姓氏末字筆畫 + 名字首字筆畫
  const renGeValue = surnameLastCharStrokes + givenFirstCharStrokes;
  // 地格：單名=名字筆畫+1，雙名=名字二字筆畫和
  const diGeValue = givenStrokesArr.length === 1 ? givenNameStrokes + 1 : givenNameStrokes;
  // 總格：全部筆畫和
  const zongGeValue = totalStrokes;
  // 外格：總格 - 人格 + 1
  const waiGeValue = zongGeValue - renGeValue + 1;

  const tianElement = strokesToElement(tianGeValue);
  const renElement = strokesToElement(renGeValue);
  const diElement = strokesToElement(diGeValue);
  const waiElement = strokesToElement(waiGeValue);
  const zongElement = strokesToElement(zongGeValue);

  const sanCaiCombo = `${tianElement}${renElement}${diElement}`;
  const sanCaiEntry = SANCAI_DB[sanCaiCombo] ?? {
    combination: sanCaiCombo,
    judgment: '中吉',
    detail: '尚待詳細研判。',
  };

  const geList: GeResult[] = [
    { value: tianGeValue, element: tianElement, meaning: geMeaning('天格', tianGeValue, tianElement) },
    { value: renGeValue, element: renElement, meaning: geMeaning('人格', renGeValue, renElement) },
    { value: diGeValue, element: diElement, meaning: geMeaning('地格', diGeValue, diElement) },
    { value: waiGeValue, element: waiElement, meaning: geMeaning('外格', waiGeValue, waiElement) },
    { value: zongGeValue, element: zongElement, meaning: geMeaning('總格', zongGeValue, zongElement) },
  ];

  return {
    surname: s,
    givenName: g,
    surnameStrokes,
    givenNameStrokes,
    totalStrokes,
    tianGe: geList[0],
    renGe: geList[1],
    diGe: geList[2],
    waiGe: geList[3],
    zongGe: geList[4],
    sanCai: sanCaiEntry,
    overallJudgment: buildOverallJudgment(sanCaiEntry, geList),
    luckyStrokes: LUCKY_NUMBERS,
  };
}
