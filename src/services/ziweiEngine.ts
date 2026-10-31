/**
 * 正統紫微斗數排盤核心引擎
 * 依據出生農曆年、月、日、時辰排布十二宮位、十四主星、五行局、生年四化與吉煞副星
 */

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export type Stem = typeof STEMS[number];
export type Branch = typeof BRANCHES[number];

export const PALACE_NAMES = [
  '命宮', '兄弟宮', '夫妻宮', '子女宮',
  '財帛宮', '疾厄宮', '遷移宮', '僕役宮',
  '官祿宮', '田宅宮', '福德宮', '父母宮',
] as const;

export type PalaceName = typeof PALACE_NAMES[number];

export interface StarInfo {
  name: string;
  type: 'main' | 'lucky' | 'harmful' | 'aux';
  brightness?: '廟' | '旺' | '得' | '利' | '平' | '不' | '陷';
  transformation?: '祿' | '權' | '科' | '忌';
}

export interface PalaceData {
  index: number;              // 0-11, 0: 命宮
  name: PalaceName;           // 宮位名稱
  branch: Branch;             // 地支宮位（子~亥）
  stem: Stem;                 // 宮干
  isBodyPalace: boolean;      // 是否為身宮所在
  mainStars: StarInfo[];      // 主星
  minorStars: StarInfo[];     // 輔吉煞星
  summary: string;            // 宮位解析
  advice: string;             // 指引建議
}

export interface ZiweiChart {
  solarYear: number;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  birthHourBranch: Branch;
  stem: Stem;
  branch: Branch;
  ganZhi: string;
  bureau: { name: string; number: number }; // 五行局
  mingBranch: Branch;
  shenBranch: Branch;
  palaces: PalaceData[];
  fourTransformations: {
    lu: { star: string; palace: PalaceName };
    quan: { star: string; palace: PalaceName };
    ke: { star: string; palace: PalaceName };
    ji: { star: string; palace: PalaceName };
  };
  overview: {
    destinyPattern: string;   // 格局特徵
    lifeTheme: string;        // 人生核心主題
    temperament: string;      // 心性特質
    careerGuidance: string;   // 事業指引
    wealthGuidance: string;   // 財富指引
    relationshipGuidance: string; // 感情指引
  };
}

// ─── 納音五行局計算 ───────────────────────────────────────────
// 甲乙1, 丙丁2, 戊己3, 庚辛4, 壬癸5
const STEM_NUMBER: Record<Stem, number> = {
  甲: 1, 乙: 1, 丙: 2, 丁: 2, 戊: 3, 己: 3, 庚: 4, 辛: 4, 壬: 5, 癸: 5,
};
// 子丑午未1, 寅卯申酉2, 辰巳戌亥3
const BRANCH_NUMBER: Record<Branch, number> = {
  子: 1, 丑: 1, 午: 1, 未: 1,
  寅: 2, 卯: 2, 申: 2, 酉: 2,
  辰: 3, 巳: 3, 戌: 3, 亥: 3,
};
// 和數對應局：1金四局, 2水二局, 3火六局, 4土五局, 5木三局
const BUREAU_MAP: Record<number, { name: string; number: number }> = {
  1: { name: '金四局', number: 4 },
  2: { name: '水二局', number: 2 },
  3: { name: '火六局', number: 6 },
  4: { name: '土五局', number: 5 },
  5: { name: '木三局', number: 3 },
};

function calculateBureau(stem: Stem, branch: Branch): { name: string; number: number } {
  let sum = STEM_NUMBER[stem] + BRANCH_NUMBER[branch];
  if (sum > 5) sum -= 5;
  return BUREAU_MAP[sum] || { name: '水二局', number: 2 };
}

// ─── 生日除局法定紫微 ─────────────────────────────────────────
function calculateZiweiBranch(day: number, bureauNum: number): number {
  let q: number;
  let x = 0;
  if (day % bureauNum === 0) {
    q = day / bureauNum;
  } else {
    x = bureauNum - (day % bureauNum);
    q = (day + x) / bureauNum;
  }
  // 寅宮 index = 2
  let pos = (2 + q - 1) % 12;
  if (x > 0) {
    if (x % 2 === 1) {
      pos = (pos - x + 12) % 12;
    } else {
      pos = (pos + x) % 12;
    }
  }
  return (pos + 12) % 12;
}

// ─── 生年四化表 ─────────────────────────────────────────────
const SI_HUA_MAP: Record<Stem, { lu: string; quan: string; ke: string; ji: string }> = {
  甲: { lu: '廉貞', quan: '破軍', ke: '武曲', ji: '太陽' },
  乙: { lu: '天機', quan: '天梁', ke: '紫微', ji: '太陰' },
  丙: { lu: '天同', quan: '天機', ke: '文昌', ji: '廉貞' },
  丁: { lu: '太陰', quan: '天同', ke: '天機', ji: '巨門' },
  戊: { lu: '貪狼', quan: '太陰', ke: '右弼', ji: '天機' },
  己: { lu: '武曲', quan: '貪狼', ke: '天梁', ji: '文曲' },
  庚: { lu: '太陽', quan: '武曲', ke: '太陰', ji: '天同' },
  辛: { lu: '巨門', quan: '太陽', ke: '文曲', ji: '文昌' },
  壬: { lu: '天梁', quan: '紫微', ke: '左輔', ji: '武曲' },
  癸: { lu: '破軍', quan: '巨門', ke: '太陰', ji: '貪狼' },
};

// ─── 祿存與魁鉞地支 ─────────────────────────────────────────
const LUCUN_BRANCH: Record<Stem, number> = {
  甲: 2, 乙: 3, 丙: 5, 丁: 6, 戊: 5, 己: 6, 庚: 8, 辛: 9, 壬: 11, 癸: 0,
};

const KUI_YUE_BRANCH: Record<Stem, { kui: number; yue: number }> = {
  甲: { kui: 1, yue: 7 }, // 丑未
  乙: { kui: 0, yue: 8 }, // 子申
  丙: { kui: 11, yue: 9 }, // 亥酉
  丁: { kui: 11, yue: 9 },
  戊: { kui: 1, yue: 7 },
  己: { kui: 0, yue: 8 },
  庚: { kui: 1, yue: 7 },
  辛: { kui: 6, yue: 2 }, // 午寅
  壬: { kui: 3, yue: 5 }, // 卯巳
  癸: { kui: 3, yue: 5 },
};

// ─── 宮位解析說明文庫 ─────────────────────────────────────────
const PALACE_BASE_INTERPRETATION: Record<PalaceName, { summary: string; advice: string }> = {
  命宮: {
    summary: '此宮為命盤之主軸樞紐，顯現個人天賦格局、性格本質、心智傾向與一生立身之根本氣象。',
    advice: '順應本性所長，修持身心弱項；知命者不怨天，知己者常能得貴人相應。',
  },
  兄弟宮: {
    summary: '主管兄弟手足緣份、平輩知交、事業合夥之助力，亦為家庭現金流儲備與周轉之庫位。',
    advice: '待手足知心以寬，合夥財務分明；多結益友，少生猜忌，能穩固根基。',
  },
  夫妻宮: {
    summary: '主看伴侶性情模樣、婚姻相處氛圍、情感依託模式與早婚晚娶之機緣節奏。',
    advice: '感情之道在於互相尊重與包容。多溝通理解對方內在需求，可享和順美滿。',
  },
  子女宮: {
    summary: '主子女後代資質、晚輩學生互動、生育傳承，亦為個人才華展現與外在桃花機緣之宮。',
    advice: '因材施教，以身作則；給予後輩自由成長之空間，莫過度束縛。',
  },
  財帛宮: {
    summary: '顯現求財方式、進財渠道、理財思維、金錢波動特徵及是否利於商業投資或穩健積蓄。',
    advice: '守正得財，急躁難聚。依照命盤適合之道規劃資產，留有防備金以應無虞。',
  },
  疾厄宮: {
    summary: '主掌先天體質強弱、脾氣情緒深層投射、容易好發之身心課題與養生照護重點。',
    advice: '起居有節，心平氣和；注重日常飲食保養，及早預防勝過病時求藥。',
  },
  遷移宮: {
    summary: '主管出外遠行、異地發展機遇、社交群眾印象、公眾人際魅力與對外拓展之順逆。',
    advice: '出外多行善結緣，廣結善信；在外遇變通達，利於開拓更廣大之眼界天地。',
  },
  僕役宮: {
    summary: '主下屬、部屬、合作團隊、客戶群眾及一般朋友交往之互動緣份與忠誠度。',
    advice: '待人以誠，寬以御眾；選才用人當看品德，建立制度勝於人情猜忌。',
  },
  官祿宮: {
    summary: '主事業功名、職涯舞台、追求榮譽、工作勝任能力與創業合宜性。',
    advice: '腳踏實地，深耕專業。不畏一時挫折，秉持忠義誠信方能長久亨通。',
  },
  田宅宮: {
    summary: '主家庭家運環境、不動產購置置產機運、祖業承繼與內在安全感之停泊港。',
    advice: '重視家庭和氣，家和萬事興；在不動產置產上宜慎選穩健，不宜過度槓桿。',
  },
  福德宮: {
    summary: '顯現精神修養、內在幸福感、福報厚薄、潛在嗜好享受與遇險時之自癒化解力。',
    advice: '心寬念純，常懷慈悲與感恩。多行善積德，福報自然如影隨形。',
  },
  父母宮: {
    summary: '主與長輩父母緣份、祖德庇蔭、上司師長提攜，亦為法規公文官非之觀照宮位。',
    advice: '百善孝為先，感恩父母養育與師長提攜；行事恪守規矩，免惹是非。',
  },
};

// ─── 核心排盤函數 ───────────────────────────────────────────
export function calculateZiweiChart(
  year: number,
  month: number, // 農曆 1-12
  day: number,   // 農曆 1-30
  hourBranchIndex: number, // 0: 子, 1: 丑, ..., 11: 亥
): ZiweiChart {
  const safeYear = Math.max(1900, Math.min(2100, Math.floor(year)));
  const safeMonth = Math.max(1, Math.min(12, Math.floor(month)));
  const safeDay = Math.max(1, Math.min(30, Math.floor(day)));
  const safeHour = Math.max(0, Math.min(11, Math.floor(hourBranchIndex)));

  // 1. 生年天干地支
  const stemIdx = (safeYear - 4) % 10;
  const branchIdx = (safeYear - 4) % 12;
  const stem = STEMS[stemIdx < 0 ? stemIdx + 10 : stemIdx];
  const branch = BRANCHES[branchIdx < 0 ? branchIdx + 12 : branchIdx];
  const ganZhi = `${stem}${branch}`;

  // 2. 命宮與身宮地支位
  // 寅(2)起正月順數至生月，逆數至生時定命宮
  const mingBranchIdx = (2 + (safeMonth - 1) - safeHour + 12) % 12;
  // 寅(2)起正月順數至生月，順數至生時定身宮
  const shenBranchIdx = (2 + (safeMonth - 1) + safeHour) % 12;

  const mingBranch = BRANCHES[mingBranchIdx];
  const shenBranch = BRANCHES[shenBranchIdx];

  // 3. 五虎遁定寅宮干
  const yinStemIdx = ((stemIdx % 5) * 2 + 2) % 10;
  const getBranchStem = (bIdx: number): Stem => {
    const offset = (bIdx - 2 + 12) % 12;
    return STEMS[(yinStemIdx + offset) % 10];
  };

  // 4. 定五行局
  const mingStem = getBranchStem(mingBranchIdx);
  const bureau = calculateBureau(mingStem, mingBranch);

  // 5. 定紫微星地支宮位
  const ziweiBranchIdx = calculateZiweiBranch(safeDay, bureau.number);

  // 6. 安紫微星系 (逆排)
  const ziweiSeries: Record<string, number> = {
    紫微: ziweiBranchIdx,
    天機: (ziweiBranchIdx - 1 + 12) % 12,
    太陽: (ziweiBranchIdx - 3 + 12) % 12,
    武曲: (ziweiBranchIdx - 4 + 12) % 12,
    天同: (ziweiBranchIdx - 5 + 12) % 12,
    廉貞: (ziweiBranchIdx - 8 + 12) % 12,
  };

  // 7. 安天府星系 (順排，寅申軸相對稱)
  const tianfuBranchIdx = (4 - ziweiBranchIdx + 12) % 12;
  const tianfuSeries: Record<string, number> = {
    天府: tianfuBranchIdx,
    太陰: (tianfuBranchIdx + 1) % 12,
    貪狼: (tianfuBranchIdx + 2) % 12,
    巨門: (tianfuBranchIdx + 3) % 12,
    天相: (tianfuBranchIdx + 4) % 12,
    天梁: (tianfuBranchIdx + 5) % 12,
    七殺: (tianfuBranchIdx + 6) % 12,
    破軍: (tianfuBranchIdx + 10) % 12,
  };

  // 8. 安吉凶煞星
  const zuofuIdx = (4 + (safeMonth - 1)) % 12;                // 辰起正月順數
  const youbiIdx = (10 - (safeMonth - 1) + 12) % 12;          // 戌起正月逆數
  const wenchangIdx = (10 - safeHour + 12) % 12;              // 戌起子時逆數
  const wenquIdx = (4 + safeHour) % 12;                       // 辰起子時順數
  const lucunIdx = LUCUN_BRANCH[stem];
  const qingyangIdx = (lucunIdx + 1) % 12;                    // 祿前擎羊
  const tuoluoIdx = (lucunIdx - 1 + 12) % 12;                 // 祿後陀羅
  const kuiYue = KUI_YUE_BRANCH[stem];

  const minorStarPositions: { name: string; type: 'lucky' | 'harmful' | 'aux'; branchIdx: number }[] = [
    { name: '左輔', type: 'lucky', branchIdx: zuofuIdx },
    { name: '右弼', type: 'lucky', branchIdx: youbiIdx },
    { name: '文昌', type: 'lucky', branchIdx: wenchangIdx },
    { name: '文曲', type: 'lucky', branchIdx: wenquIdx },
    { name: '天魁', type: 'lucky', branchIdx: kuiYue.kui },
    { name: '天鉞', type: 'lucky', branchIdx: kuiYue.yue },
    { name: '祿存', type: 'lucky', branchIdx: lucunIdx },
    { name: '擎羊', type: 'harmful', branchIdx: qingyangIdx },
    { name: '陀羅', type: 'harmful', branchIdx: tuoluoIdx },
  ];

  // 9. 生年四化
  const sihua = SI_HUA_MAP[stem];

  // 10. 組裝十二宮
  const palaces: PalaceData[] = PALACE_NAMES.map((name, i) => {
    // 逆時針排列十二宮地支位
    const branchIndex = (mingBranchIdx - i + 12) % 12;
    const pBranch = BRANCHES[branchIndex];
    const pStem = getBranchStem(branchIndex);
    const isBodyPalace = branchIndex === shenBranchIdx;

    // 收集入此宮的主星
    const mainStars: StarInfo[] = [];
    Object.entries(ziweiSeries).forEach(([starName, pos]) => {
      if (pos === branchIndex) {
        let transformation: StarInfo['transformation'];
        if (starName === sihua.lu) transformation = '祿';
        else if (starName === sihua.quan) transformation = '權';
        else if (starName === sihua.ke) transformation = '科';
        else if (starName === sihua.ji) transformation = '忌';
        mainStars.push({ name: starName, type: 'main', transformation });
      }
    });

    Object.entries(tianfuSeries).forEach(([starName, pos]) => {
      if (pos === branchIndex) {
        let transformation: StarInfo['transformation'];
        if (starName === sihua.lu) transformation = '祿';
        else if (starName === sihua.quan) transformation = '權';
        else if (starName === sihua.ke) transformation = '科';
        else if (starName === sihua.ji) transformation = '忌';
        mainStars.push({ name: starName, type: 'main', transformation });
      }
    });

    // 收集入此宮的副星
    const minorStars: StarInfo[] = [];
    minorStarPositions.forEach((item) => {
      if (item.branchIdx === branchIndex) {
        let transformation: StarInfo['transformation'];
        if (item.name === sihua.lu) transformation = '祿';
        else if (item.name === sihua.quan) transformation = '權';
        else if (item.name === sihua.ke) transformation = '科';
        else if (item.name === sihua.ji) transformation = '忌';
        minorStars.push({ name: item.name, type: item.type, transformation });
      }
    });

    const baseInfo = PALACE_BASE_INTERPRETATION[name];

    return {
      index: i,
      name,
      branch: pBranch,
      stem: pStem,
      isBodyPalace,
      mainStars,
      minorStars,
      summary: baseInfo.summary,
      advice: baseInfo.advice,
    };
  });

  // 四化星所落宮位
  const findStarPalace = (starName: string): PalaceName => {
    const target = palaces.find((p) =>
      p.mainStars.some((s) => s.name === starName) ||
      p.minorStars.some((s) => s.name === starName)
    );
    return target?.name ?? '命宮';
  };

  const fourTransformations = {
    lu: { star: sihua.lu, palace: findStarPalace(sihua.lu) },
    quan: { star: sihua.quan, palace: findStarPalace(sihua.quan) },
    ke: { star: sihua.ke, palace: findStarPalace(sihua.ke) },
    ji: { star: sihua.ji, palace: findStarPalace(sihua.ji) },
  };

  // 命宮主星特徵總覽
  const mingMainStars = palaces[0].mainStars.map((s) => s.name).join('、') || '借對宮主星（命無正曜）';
  const destinyPattern = `${bureau.name}・命坐${mingBranch}宮・主星【${mingMainStars}】`;

  const overview = {
    destinyPattern,
    lifeTheme: `生年干支【${ganZhi}】，命宮位居【${mingBranch}】，身宮坐【${shenBranch}】。天干${stem}主四化飛星：${sihua.lu}化祿於${fourTransformations.lu.palace}，${sihua.ji}化忌於${fourTransformations.ji.palace}。`,
    temperament: `命宮得${mingMainStars}照臨，賦予自身獨特氣質與處事風範。身宮落於${shenBranch}，象徵人生後半程或行動時更注重${palaces.find((p) => p.branch === shenBranch)?.name ?? '身宮'}之領域。`,
    careerGuidance: `事業宮在【${palaces[8].branch}】，主星【${palaces[8].mainStars.map((s) => s.name).join('、') || '無主星借宮'}】。適宜循序累積專業實力，將長處發揮於擅長之管理、策劃或專業領域。`,
    wealthGuidance: `財帛宮在【${palaces[4].branch}】，主星【${palaces[4].mainStars.map((s) => s.name).join('、') || '無主星借宮'}】。求財宜穩健理財，防範衝動冒險，守成蓄財為第一要務。`,
    relationshipGuidance: `夫妻宮在【${palaces[2].branch}】，主星【${palaces[2].mainStars.map((s) => s.name).join('、') || '無主星借宮'}】。婚姻情感講求同理體諒，相敬如賓方能和樂久遠。`,
  };

  return {
    solarYear: safeYear,
    lunarYear: safeYear,
    lunarMonth: safeMonth,
    lunarDay: safeDay,
    birthHourBranch: BRANCHES[safeHour],
    stem,
    branch,
    ganZhi,
    bureau,
    mingBranch,
    shenBranch,
    palaces,
    fourTransformations,
    overview,
  };
}

