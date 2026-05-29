// 簡易農民曆資料 - 2026年每月宜忌與節氣
// 完整農民曆需大量天文資料，此處提供基本框架

export interface LunarDayInfo {
  solarDate: string;        // 國曆日期
  lunarMonth: number;       // 農曆月
  lunarDay: number;         // 農曆日
  ganzhiDay: string;        // 日干支
  yi: string[];             // 宜
  ji: string[];             // 忌
  jieqi?: string;           // 節氣
  godBirthday?: string;     // 神明聖誕
}

const MONTHLY_DATA: Record<string, Partial<LunarDayInfo>[]> = {
  // 2026年簡化資料
  '2026-05': [
    { solarDate: '5/1', lunarMonth: 3, lunarDay: 14, yi: ['祭祀', '祈福', '出行'], ji: ['動土', '破土'] },
    { solarDate: '5/2', lunarMonth: 3, lunarDay: 15, yi: ['嫁娶', '開市', '入宅'], ji: ['安葬'] },
    { solarDate: '5/3', lunarMonth: 3, lunarDay: 16, yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉', '出財'] },
    { solarDate: '5/4', lunarMonth: 3, lunarDay: 17, yi: ['出行', '交易', '訂盟'], ji: ['動土', '修造'] },
    { solarDate: '5/5', lunarMonth: 3, lunarDay: 18, yi: ['嫁娶', '祭祀', '祈福'], ji: ['移徙', '入宅'], jieqi: '立夏' },
    { solarDate: '5/6', lunarMonth: 3, lunarDay: 19, yi: ['開市', '交易', '立券'], ji: ['訴訟', '爭訟'] },
    { solarDate: '5/7', lunarMonth: 3, lunarDay: 20, yi: ['祭祀', '祈福', '出行'], ji: ['破土', '安葬'] },
    { solarDate: '5/8', lunarMonth: 3, lunarDay: 21, yi: ['嫁娶', '開市', '入宅'], ji: ['詞訟'] },
    { solarDate: '5/9', lunarMonth: 3, lunarDay: 22, yi: ['祭祀', '祈福', '會友'], ji: ['開倉', '出財'] },
    { solarDate: '5/10', lunarMonth: 3, lunarDay: 23, yi: ['出行', '交易', '移徙'], ji: ['動土', '修造'] },
    { solarDate: '5/11', lunarMonth: 3, lunarDay: 24, yi: ['嫁娶', '祭祀', '祈福'], ji: ['安葬'] },
    { solarDate: '5/12', lunarMonth: 3, lunarDay: 25, yi: ['開市', '交易', '入宅'], ji: ['訴訟'] },
    { solarDate: '5/13', lunarMonth: 3, lunarDay: 26, yi: ['祈福', '出行', '會友'], ji: ['破土'] },
    { solarDate: '5/14', lunarMonth: 3, lunarDay: 27, yi: ['嫁娶', '祭祀', '開市'], ji: ['詞訟'], godBirthday: '關聖帝君聖誕' },
    { solarDate: '5/15', lunarMonth: 3, lunarDay: 28, yi: ['祈福', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '5/16', lunarMonth: 3, lunarDay: 29, yi: ['嫁娶', '開市', '入宅'], ji: ['安葬'] },
    { solarDate: '5/17', lunarMonth: 3, lunarDay: 30, yi: ['祭祀', '祈福', '出行'], ji: ['開倉'] },
    { solarDate: '5/18', lunarMonth: 4, lunarDay: 1, yi: ['祈福', '會友', '開市'], ji: ['訴訟'] },
    { solarDate: '5/19', lunarMonth: 4, lunarDay: 2, yi: ['嫁娶', '祭祀', '交易'], ji: ['破土'] },
    { solarDate: '5/20', lunarMonth: 4, lunarDay: 3, yi: ['出行', '移徙', '入宅'], ji: ['詞訟'], jieqi: '小滿' },
  ],
};

// 取得今日宜忌
export function getTodayLunarInfo(): LunarDayInfo | null {
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const day = today.getDate();
  const monthData = MONTHLY_DATA[key];
  if (!monthData || day > monthData.length) return null;
  return monthData[day - 1] as LunarDayInfo;
}

// 取得本月神明聖誕
export function getMonthGodBirthdays(): { date: string; godName: string }[] {
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const monthData = MONTHLY_DATA[key];
  if (!monthData) return [];
  return monthData
    .filter(d => d.godBirthday)
    .map(d => ({ date: d.solarDate!, godName: d.godBirthday!.replace('聖誕', '') }));
}
