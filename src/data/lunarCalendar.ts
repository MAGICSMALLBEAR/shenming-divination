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
  '2026-05': [
    { solarDate: '5/1',  lunarMonth: 3, lunarDay: 14, yi: ['祭祀', '祈福', '出行'], ji: ['動土', '破土'] },
    { solarDate: '5/2',  lunarMonth: 3, lunarDay: 15, yi: ['嫁娶', '開市', '入宅'], ji: ['安葬'] },
    { solarDate: '5/3',  lunarMonth: 3, lunarDay: 16, yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉', '出財'] },
    { solarDate: '5/4',  lunarMonth: 3, lunarDay: 17, yi: ['出行', '交易', '訂盟'], ji: ['動土', '修造'] },
    { solarDate: '5/5',  lunarMonth: 3, lunarDay: 18, yi: ['嫁娶', '祭祀', '祈福'], ji: ['移徙', '入宅'], jieqi: '立夏' },
    { solarDate: '5/6',  lunarMonth: 3, lunarDay: 19, yi: ['開市', '交易', '立券'], ji: ['訴訟', '爭訟'] },
    { solarDate: '5/7',  lunarMonth: 3, lunarDay: 20, yi: ['祭祀', '祈福', '出行'], ji: ['破土', '安葬'] },
    { solarDate: '5/8',  lunarMonth: 3, lunarDay: 21, yi: ['嫁娶', '開市', '入宅'], ji: ['詞訟'] },
    { solarDate: '5/9',  lunarMonth: 3, lunarDay: 22, yi: ['祭祀', '祈福', '會友'], ji: ['開倉', '出財'] },
    { solarDate: '5/10', lunarMonth: 3, lunarDay: 23, yi: ['出行', '交易', '移徙'], ji: ['動土', '修造'] },
    { solarDate: '5/11', lunarMonth: 3, lunarDay: 24, yi: ['嫁娶', '祭祀', '祈福'], ji: ['安葬'] },
    { solarDate: '5/12', lunarMonth: 3, lunarDay: 25, yi: ['開市', '交易', '入宅'], ji: ['訴訟'] },
    { solarDate: '5/13', lunarMonth: 3, lunarDay: 26, yi: ['祈福', '出行', '會友'], ji: ['破土'] },
    { solarDate: '5/14', lunarMonth: 3, lunarDay: 27, yi: ['嫁娶', '祭祀', '開市'], ji: ['詞訟'], godBirthday: '關聖帝君聖誕' },
    { solarDate: '5/15', lunarMonth: 3, lunarDay: 28, yi: ['祈福', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '5/16', lunarMonth: 3, lunarDay: 29, yi: ['嫁娶', '開市', '入宅'], ji: ['安葬'] },
    { solarDate: '5/17', lunarMonth: 3, lunarDay: 30, yi: ['祭祀', '祈福', '出行'], ji: ['開倉'] },
    { solarDate: '5/18', lunarMonth: 4, lunarDay: 1,  yi: ['祈福', '會友', '開市'], ji: ['訴訟'] },
    { solarDate: '5/19', lunarMonth: 4, lunarDay: 2,  yi: ['嫁娶', '祭祀', '交易'], ji: ['破土'] },
    { solarDate: '5/20', lunarMonth: 4, lunarDay: 3,  yi: ['出行', '移徙', '入宅'], ji: ['詞訟'], jieqi: '小滿' },
    { solarDate: '5/21', lunarMonth: 4, lunarDay: 4,  yi: ['祭祀', '祈福', '求嗣'], ji: ['動土', '破土'] },
    { solarDate: '5/22', lunarMonth: 4, lunarDay: 5,  yi: ['嫁娶', '開市', '立券'], ji: ['安葬'] },
    { solarDate: '5/23', lunarMonth: 4, lunarDay: 6,  yi: ['祭祀', '祈福', '出行'], ji: ['開倉', '出財'] },
    { solarDate: '5/24', lunarMonth: 4, lunarDay: 7,  yi: ['出行', '交易', '移徙'], ji: ['動土', '修造'] },
    { solarDate: '5/25', lunarMonth: 4, lunarDay: 8,  yi: ['祈福', '祭祀', '沐浴'], ji: ['嫁娶', '入宅'], godBirthday: '佛祖聖誕' },
    { solarDate: '5/26', lunarMonth: 4, lunarDay: 9,  yi: ['開市', '交易', '立券'], ji: ['訴訟'] },
    { solarDate: '5/27', lunarMonth: 4, lunarDay: 10, yi: ['祭祀', '祈福', '出行'], ji: ['破土', '安葬'] },
    { solarDate: '5/28', lunarMonth: 4, lunarDay: 11, yi: ['嫁娶', '開市', '入宅'], ji: ['詞訟'] },
    { solarDate: '5/29', lunarMonth: 4, lunarDay: 12, yi: ['祈福', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '5/30', lunarMonth: 4, lunarDay: 13, yi: ['嫁娶', '祭祀', '出行'], ji: ['破土'] },
    { solarDate: '5/31', lunarMonth: 4, lunarDay: 14, yi: ['祭祀', '祈福', '會友'], ji: ['開倉'] },
  ],
  '2026-06': [
    { solarDate: '6/1',  lunarMonth: 4, lunarDay: 15, yi: ['祭祀', '祈福', '出行'], ji: ['動土', '破土'] },
    { solarDate: '6/2',  lunarMonth: 4, lunarDay: 16, yi: ['嫁娶', '開市', '入宅'], ji: ['安葬'] },
    { solarDate: '6/3',  lunarMonth: 4, lunarDay: 17, yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '6/4',  lunarMonth: 4, lunarDay: 18, yi: ['出行', '交易', '立券'], ji: ['動土', '修造'] },
    { solarDate: '6/5',  lunarMonth: 4, lunarDay: 19, yi: ['嫁娶', '祭祀', '祈福'], ji: ['移徙', '入宅'] },
    { solarDate: '6/6',  lunarMonth: 4, lunarDay: 20, yi: ['開市', '交易', '祈福'], ji: ['訴訟'], jieqi: '芒種' },
    { solarDate: '6/7',  lunarMonth: 4, lunarDay: 21, yi: ['祭祀', '祈福', '出行'], ji: ['破土', '安葬'] },
    { solarDate: '6/8',  lunarMonth: 4, lunarDay: 22, yi: ['嫁娶', '開市', '入宅'], ji: ['詞訟'] },
    { solarDate: '6/9',  lunarMonth: 4, lunarDay: 23, yi: ['祭祀', '出行', '會友'], ji: ['開倉', '出財'] },
    { solarDate: '6/10', lunarMonth: 4, lunarDay: 24, yi: ['出行', '交易', '移徙'], ji: ['動土', '修造'] },
    { solarDate: '6/11', lunarMonth: 4, lunarDay: 25, yi: ['嫁娶', '祭祀', '祈福'], ji: ['安葬'] },
    { solarDate: '6/12', lunarMonth: 4, lunarDay: 26, yi: ['開市', '交易', '入宅'], ji: ['訴訟'] },
    { solarDate: '6/13', lunarMonth: 4, lunarDay: 27, yi: ['祈福', '出行', '會友'], ji: ['破土'] },
    { solarDate: '6/14', lunarMonth: 4, lunarDay: 28, yi: ['嫁娶', '祭祀', '開市'], ji: ['詞訟'] },
    { solarDate: '6/15', lunarMonth: 4, lunarDay: 29, yi: ['祈福', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '6/16', lunarMonth: 5, lunarDay: 1,  yi: ['嫁娶', '開市', '入宅'], ji: ['安葬'], godBirthday: '城隍爺聖誕' },
    { solarDate: '6/17', lunarMonth: 5, lunarDay: 2,  yi: ['祭祀', '祈福', '出行'], ji: ['開倉'] },
    { solarDate: '6/18', lunarMonth: 5, lunarDay: 3,  yi: ['出行', '交易', '訂盟'], ji: ['破土'] },
    { solarDate: '6/19', lunarMonth: 5, lunarDay: 4,  yi: ['嫁娶', '祭祀', '祈福'], ji: ['移徙'] },
    { solarDate: '6/20', lunarMonth: 5, lunarDay: 5,  yi: ['祭祀', '沐浴', '解除'], ji: ['嫁娶', '入宅', '出行'] },
    { solarDate: '6/21', lunarMonth: 5, lunarDay: 6,  yi: ['開市', '祈福', '立券'], ji: ['動土'], jieqi: '夏至' },
    { solarDate: '6/22', lunarMonth: 5, lunarDay: 7,  yi: ['祭祀', '出行', '會友'], ji: ['破土', '安葬'] },
    { solarDate: '6/23', lunarMonth: 5, lunarDay: 8,  yi: ['嫁娶', '開市', '入宅'], ji: ['訴訟'] },
    { solarDate: '6/24', lunarMonth: 5, lunarDay: 9,  yi: ['祈福', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '6/25', lunarMonth: 5, lunarDay: 10, yi: ['嫁娶', '祭祀', '出行'], ji: ['破土'] },
    { solarDate: '6/26', lunarMonth: 5, lunarDay: 11, yi: ['祭祀', '祈福', '會友'], ji: ['開倉'] },
    { solarDate: '6/27', lunarMonth: 5, lunarDay: 12, yi: ['出行', '交易', '訂盟'], ji: ['動土', '修造'] },
    { solarDate: '6/28', lunarMonth: 5, lunarDay: 13, yi: ['嫁娶', '祭祀', '祈福'], ji: ['安葬'] },
    { solarDate: '6/29', lunarMonth: 5, lunarDay: 14, yi: ['開市', '交易', '入宅'], ji: ['訴訟'] },
    { solarDate: '6/30', lunarMonth: 5, lunarDay: 15, yi: ['祭祀', '祈福', '出行'], ji: ['破土'] },
  ],
  '2026-07': [
    { solarDate: '7/1',  lunarMonth: 5, lunarDay: 16, yi: ['嫁娶', '開市', '入宅'], ji: ['動土', '安葬'] },
    { solarDate: '7/2',  lunarMonth: 5, lunarDay: 17, yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '7/3',  lunarMonth: 5, lunarDay: 18, yi: ['出行', '交易', '移徙'], ji: ['動土', '修造'] },
    { solarDate: '7/4',  lunarMonth: 5, lunarDay: 19, yi: ['嫁娶', '祭祀', '祈福'], ji: ['訴訟'] },
    { solarDate: '7/5',  lunarMonth: 5, lunarDay: 20, yi: ['開市', '交易', '立券'], ji: ['破土', '安葬'] },
    { solarDate: '7/6',  lunarMonth: 5, lunarDay: 21, yi: ['祭祀', '出行', '會友'], ji: ['詞訟'] },
    { solarDate: '7/7',  lunarMonth: 5, lunarDay: 22, yi: ['嫁娶', '開市', '入宅'], ji: ['動土'], jieqi: '小暑' },
    { solarDate: '7/8',  lunarMonth: 5, lunarDay: 23, yi: ['祈福', '交易', '移徙'], ji: ['破土'] },
    { solarDate: '7/9',  lunarMonth: 5, lunarDay: 24, yi: ['嫁娶', '祭祀', '出行'], ji: ['開倉'] },
    { solarDate: '7/10', lunarMonth: 5, lunarDay: 25, yi: ['祭祀', '祈福', '會友'], ji: ['動土', '修造'] },
    { solarDate: '7/11', lunarMonth: 5, lunarDay: 26, yi: ['出行', '交易', '訂盟'], ji: ['安葬'] },
    { solarDate: '7/12', lunarMonth: 5, lunarDay: 27, yi: ['嫁娶', '開市', '入宅'], ji: ['訴訟'] },
    { solarDate: '7/13', lunarMonth: 5, lunarDay: 28, yi: ['祭祀', '祈福', '出行'], ji: ['破土'] },
    { solarDate: '7/14', lunarMonth: 5, lunarDay: 29, yi: ['嫁娶', '祭祀', '交易'], ji: ['詞訟'] },
    { solarDate: '7/15', lunarMonth: 5, lunarDay: 30, yi: ['祈福', '出行', '會友'], ji: ['動土'] },
    { solarDate: '7/16', lunarMonth: 6, lunarDay: 1,  yi: ['嫁娶', '開市', '入宅'], ji: ['安葬'] },
    { solarDate: '7/17', lunarMonth: 6, lunarDay: 2,  yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '7/18', lunarMonth: 6, lunarDay: 3,  yi: ['出行', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '7/19', lunarMonth: 6, lunarDay: 4,  yi: ['嫁娶', '祭祀', '祈福'], ji: ['訴訟'] },
    { solarDate: '7/20', lunarMonth: 6, lunarDay: 5,  yi: ['開市', '交易', '立券'], ji: ['破土', '安葬'] },
    { solarDate: '7/21', lunarMonth: 6, lunarDay: 6,  yi: ['祭祀', '出行', '會友'], ji: ['詞訟'] },
    { solarDate: '7/22', lunarMonth: 6, lunarDay: 7,  yi: ['嫁娶', '開市', '入宅'], ji: ['動土'] },
    { solarDate: '7/23', lunarMonth: 6, lunarDay: 8,  yi: ['祭祀', '祈福', '出行'], ji: ['破土'], jieqi: '大暑' },
    { solarDate: '7/24', lunarMonth: 6, lunarDay: 9,  yi: ['嫁娶', '交易', '移徙'], ji: ['開倉'] },
    { solarDate: '7/25', lunarMonth: 6, lunarDay: 10, yi: ['祈福', '祭祀', '會友'], ji: ['動土'] },
    { solarDate: '7/26', lunarMonth: 6, lunarDay: 11, yi: ['出行', '交易', '訂盟'], ji: ['安葬'] },
    { solarDate: '7/27', lunarMonth: 6, lunarDay: 12, yi: ['嫁娶', '開市', '入宅'], ji: ['訴訟'] },
    { solarDate: '7/28', lunarMonth: 6, lunarDay: 13, yi: ['祭祀', '祈福', '出行'], ji: ['破土'] },
    { solarDate: '7/29', lunarMonth: 6, lunarDay: 14, yi: ['嫁娶', '祭祀', '交易'], ji: ['詞訟'] },
    { solarDate: '7/30', lunarMonth: 6, lunarDay: 15, yi: ['祈福', '出行', '會友'], ji: ['動土'] },
    { solarDate: '7/31', lunarMonth: 6, lunarDay: 16, yi: ['開市', '交易', '入宅'], ji: ['安葬'] },
  ],
  '2026-08': [
    { solarDate: '8/1',  lunarMonth: 6, lunarDay: 17, yi: ['祭祀', '祈福', '出行'], ji: ['動土', '破土'] },
    { solarDate: '8/2',  lunarMonth: 6, lunarDay: 18, yi: ['嫁娶', '開市', '入宅'], ji: ['安葬'] },
    { solarDate: '8/3',  lunarMonth: 6, lunarDay: 19, yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '8/4',  lunarMonth: 6, lunarDay: 20, yi: ['出行', '交易', '移徙'], ji: ['動土', '修造'] },
    { solarDate: '8/5',  lunarMonth: 6, lunarDay: 21, yi: ['嫁娶', '祭祀', '祈福'], ji: ['訴訟'] },
    { solarDate: '8/6',  lunarMonth: 6, lunarDay: 22, yi: ['開市', '交易', '立券'], ji: ['破土', '安葬'] },
    { solarDate: '8/7',  lunarMonth: 6, lunarDay: 23, yi: ['祭祀', '出行', '會友'], ji: ['詞訟'], jieqi: '立秋' },
    { solarDate: '8/8',  lunarMonth: 6, lunarDay: 24, yi: ['嫁娶', '開市', '入宅'], ji: ['動土'], godBirthday: '關聖帝君聖誕' },
    { solarDate: '8/9',  lunarMonth: 6, lunarDay: 25, yi: ['祈福', '交易', '移徙'], ji: ['破土'] },
    { solarDate: '8/10', lunarMonth: 6, lunarDay: 26, yi: ['嫁娶', '祭祀', '出行'], ji: ['開倉'] },
    { solarDate: '8/11', lunarMonth: 6, lunarDay: 27, yi: ['祭祀', '祈福', '會友'], ji: ['動土', '修造'] },
    { solarDate: '8/12', lunarMonth: 6, lunarDay: 28, yi: ['出行', '交易', '訂盟'], ji: ['安葬'] },
    { solarDate: '8/13', lunarMonth: 6, lunarDay: 29, yi: ['嫁娶', '開市', '入宅'], ji: ['訴訟'] },
    { solarDate: '8/14', lunarMonth: 7, lunarDay: 1,  yi: ['祭祀', '祈福', '出行'], ji: ['破土'] },
    { solarDate: '8/15', lunarMonth: 7, lunarDay: 2,  yi: ['嫁娶', '祭祀', '交易'], ji: ['詞訟'] },
    { solarDate: '8/16', lunarMonth: 7, lunarDay: 3,  yi: ['祈福', '出行', '會友'], ji: ['動土'] },
    { solarDate: '8/17', lunarMonth: 7, lunarDay: 4,  yi: ['開市', '交易', '入宅'], ji: ['安葬'] },
    { solarDate: '8/18', lunarMonth: 7, lunarDay: 5,  yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '8/19', lunarMonth: 7, lunarDay: 6,  yi: ['出行', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '8/20', lunarMonth: 7, lunarDay: 7,  yi: ['嫁娶', '祭祀', '祈福'], ji: ['訴訟'] },
    { solarDate: '8/21', lunarMonth: 7, lunarDay: 8,  yi: ['開市', '交易', '立券'], ji: ['破土'], jieqi: '處暑' },
    { solarDate: '8/22', lunarMonth: 7, lunarDay: 9,  yi: ['祭祀', '出行', '會友'], ji: ['詞訟'] },
    { solarDate: '8/23', lunarMonth: 7, lunarDay: 10, yi: ['嫁娶', '開市', '入宅'], ji: ['動土'] },
    { solarDate: '8/24', lunarMonth: 7, lunarDay: 11, yi: ['祈福', '交易', '移徙'], ji: ['破土'] },
    { solarDate: '8/25', lunarMonth: 7, lunarDay: 12, yi: ['嫁娶', '祭祀', '出行'], ji: ['開倉'] },
    { solarDate: '8/26', lunarMonth: 7, lunarDay: 13, yi: ['祭祀', '祈福', '會友'], ji: ['動土'] },
    { solarDate: '8/27', lunarMonth: 7, lunarDay: 14, yi: ['出行', '交易', '訂盟'], ji: ['安葬'] },
    { solarDate: '8/28', lunarMonth: 7, lunarDay: 15, yi: ['祭祀', '祈福', '出行'], ji: ['嫁娶', '動土'], godBirthday: '中元普度' },
    { solarDate: '8/29', lunarMonth: 7, lunarDay: 16, yi: ['嫁娶', '開市', '入宅'], ji: ['訴訟'] },
    { solarDate: '8/30', lunarMonth: 7, lunarDay: 17, yi: ['祈福', '交易', '移徙'], ji: ['破土'] },
    { solarDate: '8/31', lunarMonth: 7, lunarDay: 18, yi: ['嫁娶', '祭祀', '出行'], ji: ['詞訟'] },
  ],
  '2026-09': [
    { solarDate: '9/1',  lunarMonth: 7, lunarDay: 19, yi: ['祭祀', '祈福', '出行'], ji: ['動土', '破土'] },
    { solarDate: '9/2',  lunarMonth: 7, lunarDay: 20, yi: ['嫁娶', '開市', '入宅'], ji: ['安葬'] },
    { solarDate: '9/3',  lunarMonth: 7, lunarDay: 21, yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '9/4',  lunarMonth: 7, lunarDay: 22, yi: ['出行', '交易', '移徙'], ji: ['動土', '修造'] },
    { solarDate: '9/5',  lunarMonth: 7, lunarDay: 23, yi: ['嫁娶', '祭祀', '祈福'], ji: ['訴訟'] },
    { solarDate: '9/6',  lunarMonth: 7, lunarDay: 24, yi: ['開市', '交易', '立券'], ji: ['破土', '安葬'] },
    { solarDate: '9/7',  lunarMonth: 7, lunarDay: 25, yi: ['祭祀', '出行', '會友'], ji: ['詞訟'], jieqi: '白露' },
    { solarDate: '9/8',  lunarMonth: 7, lunarDay: 26, yi: ['嫁娶', '開市', '入宅'], ji: ['動土'] },
    { solarDate: '9/9',  lunarMonth: 7, lunarDay: 27, yi: ['祈福', '交易', '移徙'], ji: ['破土'] },
    { solarDate: '9/10', lunarMonth: 7, lunarDay: 28, yi: ['嫁娶', '祭祀', '出行'], ji: ['開倉'] },
    { solarDate: '9/11', lunarMonth: 7, lunarDay: 29, yi: ['祭祀', '祈福', '會友'], ji: ['動土'], godBirthday: '地藏王菩薩聖誕' },
    { solarDate: '9/12', lunarMonth: 8, lunarDay: 1,  yi: ['出行', '交易', '入宅'], ji: ['安葬'] },
    { solarDate: '9/13', lunarMonth: 8, lunarDay: 2,  yi: ['嫁娶', '開市', '祈福'], ji: ['訴訟'] },
    { solarDate: '9/14', lunarMonth: 8, lunarDay: 3,  yi: ['祭祀', '祈福', '出行'], ji: ['破土'] },
    { solarDate: '9/15', lunarMonth: 8, lunarDay: 4,  yi: ['嫁娶', '祭祀', '交易'], ji: ['詞訟'] },
    { solarDate: '9/16', lunarMonth: 8, lunarDay: 5,  yi: ['祈福', '出行', '會友'], ji: ['動土'] },
    { solarDate: '9/17', lunarMonth: 8, lunarDay: 6,  yi: ['開市', '交易', '入宅'], ji: ['安葬'] },
    { solarDate: '9/18', lunarMonth: 8, lunarDay: 7,  yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '9/19', lunarMonth: 8, lunarDay: 8,  yi: ['出行', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '9/20', lunarMonth: 8, lunarDay: 9,  yi: ['嫁娶', '祭祀', '祈福'], ji: ['訴訟'] },
    { solarDate: '9/21', lunarMonth: 8, lunarDay: 10, yi: ['開市', '交易', '立券'], ji: ['破土'] },
    { solarDate: '9/22', lunarMonth: 8, lunarDay: 11, yi: ['祭祀', '出行', '會友'], ji: ['詞訟'] },
    { solarDate: '9/23', lunarMonth: 8, lunarDay: 12, yi: ['嫁娶', '開市', '入宅'], ji: ['動土'], jieqi: '秋分' },
    { solarDate: '9/24', lunarMonth: 8, lunarDay: 13, yi: ['祈福', '交易', '移徙'], ji: ['破土'] },
    { solarDate: '9/25', lunarMonth: 8, lunarDay: 14, yi: ['嫁娶', '祭祀', '出行'], ji: ['開倉'] },
    { solarDate: '9/26', lunarMonth: 8, lunarDay: 15, yi: ['祭祀', '祈福', '出行'], ji: ['嫁娶'], godBirthday: '中秋・拜月' },
    { solarDate: '9/27', lunarMonth: 8, lunarDay: 16, yi: ['出行', '交易', '訂盟'], ji: ['安葬'] },
    { solarDate: '9/28', lunarMonth: 8, lunarDay: 17, yi: ['嫁娶', '開市', '入宅'], ji: ['訴訟'] },
    { solarDate: '9/29', lunarMonth: 8, lunarDay: 18, yi: ['祭祀', '祈福', '出行'], ji: ['破土'] },
    { solarDate: '9/30', lunarMonth: 8, lunarDay: 19, yi: ['嫁娶', '祭祀', '交易'], ji: ['詞訟'] },
  ],
  '2026-10': [
    { solarDate: '10/1',  lunarMonth: 8, lunarDay: 20, yi: ['祭祀', '祈福', '出行'], ji: ['動土', '破土'] },
    { solarDate: '10/2',  lunarMonth: 8, lunarDay: 21, yi: ['嫁娶', '開市', '入宅'], ji: ['安葬'] },
    { solarDate: '10/3',  lunarMonth: 8, lunarDay: 22, yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '10/4',  lunarMonth: 8, lunarDay: 23, yi: ['出行', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '10/5',  lunarMonth: 8, lunarDay: 24, yi: ['嫁娶', '祭祀', '祈福'], ji: ['訴訟'] },
    { solarDate: '10/6',  lunarMonth: 8, lunarDay: 25, yi: ['開市', '交易', '立券'], ji: ['破土', '安葬'] },
    { solarDate: '10/7',  lunarMonth: 8, lunarDay: 26, yi: ['祭祀', '出行', '會友'], ji: ['詞訟'] },
    { solarDate: '10/8',  lunarMonth: 8, lunarDay: 27, yi: ['嫁娶', '開市', '入宅'], ji: ['動土'], jieqi: '寒露' },
    { solarDate: '10/9',  lunarMonth: 8, lunarDay: 28, yi: ['祈福', '交易', '移徙'], ji: ['破土'] },
    { solarDate: '10/10', lunarMonth: 8, lunarDay: 29, yi: ['嫁娶', '祭祀', '出行'], ji: ['開倉'] },
    { solarDate: '10/11', lunarMonth: 9, lunarDay: 1,  yi: ['祭祀', '祈福', '會友'], ji: ['動土'] },
    { solarDate: '10/12', lunarMonth: 9, lunarDay: 2,  yi: ['出行', '交易', '訂盟'], ji: ['安葬'] },
    { solarDate: '10/13', lunarMonth: 9, lunarDay: 3,  yi: ['嫁娶', '開市', '入宅'], ji: ['訴訟'] },
    { solarDate: '10/14', lunarMonth: 9, lunarDay: 4,  yi: ['祭祀', '祈福', '出行'], ji: ['破土'] },
    { solarDate: '10/15', lunarMonth: 9, lunarDay: 5,  yi: ['嫁娶', '祭祀', '交易'], ji: ['詞訟'] },
    { solarDate: '10/16', lunarMonth: 9, lunarDay: 6,  yi: ['祈福', '出行', '會友'], ji: ['動土'] },
    { solarDate: '10/17', lunarMonth: 9, lunarDay: 7,  yi: ['開市', '交易', '入宅'], ji: ['安葬'] },
    { solarDate: '10/18', lunarMonth: 9, lunarDay: 8,  yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '10/19', lunarMonth: 9, lunarDay: 9,  yi: ['重陽祭祖', '出行', '爬山'], ji: ['動土'], godBirthday: '重陽・九皇大帝' },
    { solarDate: '10/20', lunarMonth: 9, lunarDay: 10, yi: ['嫁娶', '祭祀', '祈福'], ji: ['訴訟'] },
    { solarDate: '10/21', lunarMonth: 9, lunarDay: 11, yi: ['開市', '交易', '立券'], ji: ['破土'] },
    { solarDate: '10/22', lunarMonth: 9, lunarDay: 12, yi: ['祭祀', '出行', '會友'], ji: ['詞訟'] },
    { solarDate: '10/23', lunarMonth: 9, lunarDay: 13, yi: ['嫁娶', '開市', '入宅'], ji: ['動土'], jieqi: '霜降' },
    { solarDate: '10/24', lunarMonth: 9, lunarDay: 14, yi: ['祈福', '交易', '移徙'], ji: ['破土'] },
    { solarDate: '10/25', lunarMonth: 9, lunarDay: 15, yi: ['嫁娶', '祭祀', '出行'], ji: ['開倉'] },
    { solarDate: '10/26', lunarMonth: 9, lunarDay: 16, yi: ['祭祀', '祈福', '會友'], ji: ['動土'] },
    { solarDate: '10/27', lunarMonth: 9, lunarDay: 17, yi: ['出行', '交易', '訂盟'], ji: ['安葬'] },
    { solarDate: '10/28', lunarMonth: 9, lunarDay: 18, yi: ['嫁娶', '開市', '入宅'], ji: ['訴訟'] },
    { solarDate: '10/29', lunarMonth: 9, lunarDay: 19, yi: ['祭祀', '祈福', '出行'], ji: ['破土'], godBirthday: '觀音菩薩出家紀念日' },
    { solarDate: '10/30', lunarMonth: 9, lunarDay: 20, yi: ['嫁娶', '祭祀', '交易'], ji: ['詞訟'] },
    { solarDate: '10/31', lunarMonth: 9, lunarDay: 21, yi: ['祈福', '出行', '會友'], ji: ['動土'] },
  ],
  '2026-11': [
    { solarDate: '11/1',  lunarMonth: 9, lunarDay: 22, yi: ['祭祀', '祈福', '出行'], ji: ['動土', '破土'] },
    { solarDate: '11/2',  lunarMonth: 9, lunarDay: 23, yi: ['嫁娶', '開市', '入宅'], ji: ['安葬'] },
    { solarDate: '11/3',  lunarMonth: 9, lunarDay: 24, yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '11/4',  lunarMonth: 9, lunarDay: 25, yi: ['出行', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '11/5',  lunarMonth: 9, lunarDay: 26, yi: ['嫁娶', '祭祀', '祈福'], ji: ['訴訟'] },
    { solarDate: '11/6',  lunarMonth: 9, lunarDay: 27, yi: ['開市', '交易', '立券'], ji: ['破土'] },
    { solarDate: '11/7',  lunarMonth: 9, lunarDay: 28, yi: ['祭祀', '出行', '會友'], ji: ['詞訟'], jieqi: '立冬' },
    { solarDate: '11/8',  lunarMonth: 9, lunarDay: 29, yi: ['嫁娶', '開市', '入宅'], ji: ['動土'] },
    { solarDate: '11/9',  lunarMonth: 10, lunarDay: 1,  yi: ['祈福', '交易', '移徙'], ji: ['破土'] },
    { solarDate: '11/10', lunarMonth: 10, lunarDay: 2,  yi: ['嫁娶', '祭祀', '出行'], ji: ['開倉'] },
    { solarDate: '11/11', lunarMonth: 10, lunarDay: 3,  yi: ['祭祀', '祈福', '會友'], ji: ['動土'] },
    { solarDate: '11/12', lunarMonth: 10, lunarDay: 4,  yi: ['出行', '交易', '訂盟'], ji: ['安葬'] },
    { solarDate: '11/13', lunarMonth: 10, lunarDay: 5,  yi: ['嫁娶', '開市', '入宅'], ji: ['訴訟'] },
    { solarDate: '11/14', lunarMonth: 10, lunarDay: 6,  yi: ['祭祀', '祈福', '出行'], ji: ['破土'] },
    { solarDate: '11/15', lunarMonth: 10, lunarDay: 7,  yi: ['嫁娶', '祭祀', '交易'], ji: ['詞訟'] },
    { solarDate: '11/16', lunarMonth: 10, lunarDay: 8,  yi: ['祈福', '出行', '會友'], ji: ['動土'] },
    { solarDate: '11/17', lunarMonth: 10, lunarDay: 9,  yi: ['開市', '交易', '入宅'], ji: ['安葬'] },
    { solarDate: '11/18', lunarMonth: 10, lunarDay: 10, yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '11/19', lunarMonth: 10, lunarDay: 11, yi: ['出行', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '11/20', lunarMonth: 10, lunarDay: 12, yi: ['嫁娶', '祭祀', '祈福'], ji: ['訴訟'] },
    { solarDate: '11/21', lunarMonth: 10, lunarDay: 13, yi: ['開市', '交易', '立券'], ji: ['破土'] },
    { solarDate: '11/22', lunarMonth: 10, lunarDay: 14, yi: ['祭祀', '出行', '會友'], ji: ['詞訟'], jieqi: '小雪' },
    { solarDate: '11/23', lunarMonth: 10, lunarDay: 15, yi: ['嫁娶', '開市', '入宅'], ji: ['動土'], godBirthday: '財神爺聖誕・下元節' },
    { solarDate: '11/24', lunarMonth: 10, lunarDay: 16, yi: ['祈福', '交易', '移徙'], ji: ['破土'] },
    { solarDate: '11/25', lunarMonth: 10, lunarDay: 17, yi: ['嫁娶', '祭祀', '出行'], ji: ['開倉'] },
    { solarDate: '11/26', lunarMonth: 10, lunarDay: 18, yi: ['祭祀', '祈福', '會友'], ji: ['動土'] },
    { solarDate: '11/27', lunarMonth: 10, lunarDay: 19, yi: ['出行', '交易', '訂盟'], ji: ['安葬'] },
    { solarDate: '11/28', lunarMonth: 10, lunarDay: 20, yi: ['嫁娶', '開市', '入宅'], ji: ['訴訟'] },
    { solarDate: '11/29', lunarMonth: 10, lunarDay: 21, yi: ['祭祀', '祈福', '出行'], ji: ['破土'] },
    { solarDate: '11/30', lunarMonth: 10, lunarDay: 22, yi: ['嫁娶', '祭祀', '交易'], ji: ['詞訟'] },
  ],
  '2026-12': [
    { solarDate: '12/1',  lunarMonth: 10, lunarDay: 23, yi: ['祭祀', '祈福', '出行'], ji: ['動土', '破土'] },
    { solarDate: '12/2',  lunarMonth: 10, lunarDay: 24, yi: ['嫁娶', '開市', '入宅'], ji: ['安葬'] },
    { solarDate: '12/3',  lunarMonth: 10, lunarDay: 25, yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '12/4',  lunarMonth: 10, lunarDay: 26, yi: ['出行', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '12/5',  lunarMonth: 10, lunarDay: 27, yi: ['嫁娶', '祭祀', '祈福'], ji: ['訴訟'] },
    { solarDate: '12/6',  lunarMonth: 10, lunarDay: 28, yi: ['開市', '交易', '立券'], ji: ['破土'] },
    { solarDate: '12/7',  lunarMonth: 10, lunarDay: 29, yi: ['祭祀', '出行', '會友'], ji: ['詞訟'], jieqi: '大雪' },
    { solarDate: '12/8',  lunarMonth: 11, lunarDay: 1,  yi: ['嫁娶', '開市', '入宅'], ji: ['動土'] },
    { solarDate: '12/9',  lunarMonth: 11, lunarDay: 2,  yi: ['祈福', '交易', '移徙'], ji: ['破土'] },
    { solarDate: '12/10', lunarMonth: 11, lunarDay: 3,  yi: ['嫁娶', '祭祀', '出行'], ji: ['開倉'] },
    { solarDate: '12/11', lunarMonth: 11, lunarDay: 4,  yi: ['祭祀', '祈福', '會友'], ji: ['動土'] },
    { solarDate: '12/12', lunarMonth: 11, lunarDay: 5,  yi: ['出行', '交易', '訂盟'], ji: ['安葬'] },
    { solarDate: '12/13', lunarMonth: 11, lunarDay: 6,  yi: ['嫁娶', '開市', '入宅'], ji: ['訴訟'] },
    { solarDate: '12/14', lunarMonth: 11, lunarDay: 7,  yi: ['祭祀', '祈福', '出行'], ji: ['破土'] },
    { solarDate: '12/15', lunarMonth: 11, lunarDay: 8,  yi: ['嫁娶', '祭祀', '交易'], ji: ['詞訟'] },
    { solarDate: '12/16', lunarMonth: 11, lunarDay: 9,  yi: ['祈福', '出行', '會友'], ji: ['動土'] },
    { solarDate: '12/17', lunarMonth: 11, lunarDay: 10, yi: ['開市', '交易', '入宅'], ji: ['安葬'] },
    { solarDate: '12/18', lunarMonth: 11, lunarDay: 11, yi: ['祭祀', '祈福', '求嗣'], ji: ['開倉'] },
    { solarDate: '12/19', lunarMonth: 11, lunarDay: 12, yi: ['出行', '交易', '移徙'], ji: ['動土'] },
    { solarDate: '12/20', lunarMonth: 11, lunarDay: 13, yi: ['嫁娶', '祭祀', '祈福'], ji: ['訴訟'] },
    { solarDate: '12/21', lunarMonth: 11, lunarDay: 14, yi: ['祭祀', '祈福', '冬至祭'], ji: ['嫁娶'], jieqi: '冬至' },
    { solarDate: '12/22', lunarMonth: 11, lunarDay: 15, yi: ['開市', '交易', '立券'], ji: ['破土'] },
    { solarDate: '12/23', lunarMonth: 11, lunarDay: 16, yi: ['祭祀', '出行', '會友'], ji: ['詞訟'] },
    { solarDate: '12/24', lunarMonth: 11, lunarDay: 17, yi: ['嫁娶', '開市', '入宅'], ji: ['動土'] },
    { solarDate: '12/25', lunarMonth: 11, lunarDay: 18, yi: ['祈福', '交易', '會友'], ji: ['破土'] },
    { solarDate: '12/26', lunarMonth: 11, lunarDay: 19, yi: ['嫁娶', '祭祀', '出行'], ji: ['開倉'] },
    { solarDate: '12/27', lunarMonth: 11, lunarDay: 20, yi: ['祭祀', '祈福', '會友'], ji: ['動土'] },
    { solarDate: '12/28', lunarMonth: 11, lunarDay: 21, yi: ['出行', '交易', '訂盟'], ji: ['安葬'] },
    { solarDate: '12/29', lunarMonth: 11, lunarDay: 22, yi: ['嫁娶', '開市', '入宅'], ji: ['訴訟'] },
    { solarDate: '12/30', lunarMonth: 11, lunarDay: 23, yi: ['祭祀', '祈福', '出行'], ji: ['破土'] },
    { solarDate: '12/31', lunarMonth: 11, lunarDay: 24, yi: ['嫁娶', '祭祀', '交易'], ji: ['詞訟'] },
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

// 完整神明農曆聖誕資料表（15 尊）
export interface GodBirthdayEntry {
  godId: number;
  name: string;
  lunarMonth: number;
  lunarDay: number;
  worshipTips: string[];
  offerings: string[];
  prayerFor: string[];
}

export const GOD_BIRTHDAYS_LUNAR: GodBirthdayEntry[] = [
  {
    godId: 1, name: '關聖帝君', lunarMonth: 1, lunarDay: 13,
    worshipTips: ['準備豬肉、花生、高粱酒', '早晨7~9點參拜效果最佳', '誠心稟報事業、官訟或財運心願'],
    offerings: ['豬肉', '花生', '高粱酒', '壽金', '五果'],
    prayerFor: ['事業發展', '考試功名', '財運亨通', '化解官司'],
  },
  {
    godId: 2, name: '觀世音菩薩', lunarMonth: 2, lunarDay: 19,
    worshipTips: ['素食供品最為虔誠', '心存善念、輕聲誠禱', '可持誦「南無觀世音菩薩」108遍'],
    offerings: ['鮮花', '素果', '清茶', '香燭', '白蓮花'],
    prayerFor: ['平安健康', '求子求嗣', '化解災厄', '感情圓滿'],
  },
  {
    godId: 3, name: '媽祖', lunarMonth: 3, lunarDay: 23,
    worshipTips: ['可備鮮花、素果、清水', '家有孕婦或出海者特別靈驗', '心誠則靈，默禱即可'],
    offerings: ['鮮花', '素果', '清水', '壽金', '鳳梨'],
    prayerFor: ['家庭平安', '出行順利', '航海保護', '闔家和樂'],
  },
  {
    godId: 4, name: '王爺', lunarMonth: 5, lunarDay: 5,
    worshipTips: ['可備三牲酒禮', '稟報家宅或出入安全事宜', '燒金紙時心誠最重要'],
    offerings: ['三牲', '水果', '壽金', '刈金', '清酒'],
    prayerFor: ['驅邪保平安', '家宅安寧', '出入平安', '化解瘟疫病災'],
  },
  {
    godId: 5, name: '保生大帝', lunarMonth: 3, lunarDay: 15,
    worshipTips: ['藥材或清茶為佳供品', '誠心祈求病痛康復或身體健康', '可攜帶藥方來祝聖'],
    offerings: ['清茶', '素果', '鮮花', '藥草', '壽金'],
    prayerFor: ['疾病痊癒', '身體健康', '藥方有效', '福壽綿長'],
  },
  {
    godId: 6, name: '福德正神', lunarMonth: 2, lunarDay: 2,
    worshipTips: ['每月初二、十六拜土地公最靈', '準備糕點、壽桃', '求財時可多準備刈金'],
    offerings: ['糕點', '壽桃', '水果', '刈金', '土地公金'],
    prayerFor: ['財源廣進', '家宅平安', '生意興隆', '出入順利'],
  },
  {
    godId: 7, name: '註生娘娘', lunarMonth: 3, lunarDay: 20,
    worshipTips: ['備鮮花、素果，心存慈悲', '已懷孕者可額外感謝', '求子時可帶紅蛋'],
    offerings: ['鮮花', '素果', '紅蛋', '粉圓', '壽金'],
    prayerFor: ['懷孕順產', '孩子健康', '求賜子嗣', '孩童平安長大'],
  },
  {
    godId: 8, name: '文昌帝君', lunarMonth: 2, lunarDay: 3,
    worshipTips: ['筆墨紙硯或書本為供品', '考試前攜帶準考證來祝聖', '保持心靜、誠心祈求'],
    offerings: ['文具', '書本', '素果', '壽金', '文昌筆'],
    prayerFor: ['考試順利', '學業進步', '金榜題名', '文思泉湧'],
  },
  {
    godId: 9, name: '孔明神數', lunarMonth: 7, lunarDay: 23,
    worshipTips: ['心中默念問題，靜心推算', '求智慧決策時最靈驗', '誠心報一數即可'],
    offerings: ['清茶', '素果', '文房四寶', '壽金'],
    prayerFor: ['智慧決策', '謀略分析', '突破困境', '洞察先機'],
  },
  {
    godId: 10, name: '玄天上帝', lunarMonth: 3, lunarDay: 3,
    worshipTips: ['可備素食或葷食三牲', '誠心稟報家宅安危或小人事宜', '可燃七星香'],
    offerings: ['三牲', '素果', '清酒', '壽金', '七星香'],
    prayerFor: ['鎮宅除煞', '小人退散', '事業穩固', '斬妖除魔'],
  },
  {
    godId: 11, name: '濟公活佛', lunarMonth: 2, lunarDay: 2,
    worshipTips: ['酒肉不避，誠心即可', '求突破困境、化解煩憂', '可輕鬆訴說心中煩惱'],
    offerings: ['雞腿', '清酒', '水果', '壽金', '香燭'],
    prayerFor: ['突破困境', '化解煩惱', '心開意解', '化險為夷'],
  },
  {
    godId: 12, name: '三太子', lunarMonth: 9, lunarDay: 9,
    worshipTips: ['可備麻薏、鮮花、糖果', '年輕人求事業衝刺最靈', '活潑誠心即可'],
    offerings: ['麻薏', '糖果', '鮮花', '壽金', '刈金'],
    prayerFor: ['事業衝刺', '突破難關', '身體健康', '創意靈感'],
  },
  {
    godId: 13, name: '月下老人', lunarMonth: 8, lunarDay: 15,
    worshipTips: ['中秋月圓夜祭拜最靈驗', '備鮮花、紅豆湯、芋頭', '誠心稟報感情心願'],
    offerings: ['鮮花', '紅豆湯', '芋頭', '月餅', '紅線'],
    prayerFor: ['良緣早成', '感情和合', '婚姻美滿', '相思解惑'],
  },
  {
    godId: 14, name: '城隍爺', lunarMonth: 5, lunarDay: 11,
    worshipTips: ['備三牲酒禮，誠心稟報', '官司或是非紛爭時特別靈驗', '心存正義最重要'],
    offerings: ['三牲', '水果', '清酒', '壽金', '刈金'],
    prayerFor: ['官司順利', '是非分明', '冤屈昭雪', '消災解厄'],
  },
  {
    godId: 15, name: '呂洞賓', lunarMonth: 4, lunarDay: 14,
    worshipTips: ['清茶素果為佳', '求考試、健康或感情均可', '心清如水最相應'],
    offerings: ['清茶', '素果', '鮮花', '壽金', '香燭'],
    prayerFor: ['考試功名', '身體健康', '感情順遂', '智慧清明'],
  },
];

// 推算「近似公曆日期」：農曆 M 月 D 日 ≈ 公曆 (M+1) 月 D 日（粗略）
function approxSolarFromLunar(year: number, lunarMonth: number, lunarDay: number): Date {
  // 農曆通常比公曆晚 1-2 個月，這裡用 +1 個月粗略換算
  const approxMonth = lunarMonth + 1;
  if (approxMonth > 12) {
    return new Date(year + 1, 0, lunarDay);
  }
  return new Date(year, approxMonth - 1, lunarDay);
}

// 今日推薦禮拜的神明
export function getTodayRecommendedGod(): {
  godId: number;
  name: string;
  reason: string;
  isSpecialDay: boolean;
  worshipTips: string[];
  offerings: string[];
  prayerFor: string[];
} {
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const dayIndex = today.getDate() - 1;
  const monthData = MONTHLY_DATA[key];
  const todayData = monthData?.[dayIndex];

  // 檢查今天是否有神明聖誕
  if (todayData?.godBirthday) {
    const birthdayName = todayData.godBirthday;
    const match = GOD_BIRTHDAYS_LUNAR.find(g =>
      birthdayName.includes(g.name) || g.name.includes(birthdayName.replace('聖誕', ''))
    );
    if (match) {
      return {
        godId: match.godId,
        name: match.name,
        reason: `今日是${match.name}聖誕，是與祂特別有緣的吉日！`,
        isSpecialDay: true,
        worshipTips: match.worshipTips,
        offerings: match.offerings,
        prayerFor: match.prayerFor,
      };
    }
  }

  // 根據農曆日推薦（初一、十五拜土地公；初二、十六也拜土地公）
  const lunarDay = todayData?.lunarDay ?? today.getDate();
  if (lunarDay === 1 || lunarDay === 15 || lunarDay === 2 || lunarDay === 16) {
    const fuDe = GOD_BIRTHDAYS_LUNAR.find(g => g.godId === 6)!;
    return {
      godId: 6,
      name: '福德正神',
      reason: `農曆${lunarDay}日是拜土地公的吉日，求財求平安最靈驗。`,
      isSpecialDay: false,
      worshipTips: fuDe.worshipTips,
      offerings: fuDe.offerings,
      prayerFor: fuDe.prayerFor,
    };
  }

  // 根據星期推薦
  const weekday = today.getDay();
  const weekdayGodMap: Record<number, number> = {
    0: 2,  // 週日 → 觀世音菩薩
    1: 1,  // 週一 → 關聖帝君
    2: 8,  // 週二 → 文昌帝君
    3: 5,  // 週三 → 保生大帝
    4: 3,  // 週四 → 媽祖
    5: 6,  // 週五 → 福德正神
    6: 13, // 週六 → 月下老人
  };
  const recommendedGodId = weekdayGodMap[weekday] ?? 1;
  const entry = GOD_BIRTHDAYS_LUNAR.find(g => g.godId === recommendedGodId)!;
  const weekdayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

  return {
    godId: entry.godId,
    name: entry.name,
    reason: `${weekdayNames[weekday]}是禮拜${entry.name}的好日子，祈求${entry.prayerFor[0]}最靈驗。`,
    isSpecialDay: false,
    worshipTips: entry.worshipTips,
    offerings: entry.offerings,
    prayerFor: entry.prayerFor,
  };
}

// 取得近期神明聖誕（未來 N 天的近似日期）
export function getUpcomingGodBirthdays(daysAhead: number = 60): {
  godId: number;
  name: string;
  lunarDateStr: string;
  approxSolarDate: string;
  daysUntil: number;
  offerings: string[];
}[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const results: {
    godId: number;
    name: string;
    lunarDateStr: string;
    approxSolarDate: string;
    daysUntil: number;
    offerings: string[];
  }[] = [];

  for (const entry of GOD_BIRTHDAYS_LUNAR) {
    for (const y of [year, year + 1]) {
      const approx = approxSolarFromLunar(y, entry.lunarMonth, entry.lunarDay);
      approx.setHours(0, 0, 0, 0);
      const diff = Math.round((approx.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff <= daysAhead) {
        results.push({
          godId: entry.godId,
          name: entry.name,
          lunarDateStr: `農曆${entry.lunarMonth}月${entry.lunarDay}日`,
          approxSolarDate: `${approx.getMonth() + 1}/${approx.getDate()}（約）`,
          daysUntil: diff,
          offerings: entry.offerings,
        });
        break;
      }
    }
  }

  return results.sort((a, b) => a.daysUntil - b.daysUntil);
}

// 取得特定神明的祭拜建議
export function getGodWorshipInfo(godId: number): GodBirthdayEntry | null {
  return GOD_BIRTHDAYS_LUNAR.find(g => g.godId === godId) ?? null;
}

// 取得指定年度全部神明聖誕（含實際 Date 物件）
export function getAllGodBirthdays(year = new Date().getFullYear()): {
  date: Date;
  name: string;
  solarDateStr: string;
}[] {
  const result: { date: Date; name: string; solarDateStr: string }[] = [];

  for (const [monthKey, days] of Object.entries(MONTHLY_DATA)) {
    const [y] = monthKey.split('-').map(Number);
    if (y !== year) continue;

    for (const day of days) {
      if (!day.godBirthday || !day.solarDate) continue;
      const parts = day.solarDate.split('/');
      const mo = parseInt(parts[0], 10);
      const d  = parseInt(parts[1], 10);
      result.push({
        date: new Date(year, mo - 1, d, 8, 0, 0),
        name: day.godBirthday,
        solarDateStr: `${mo}月${d}日`,
      });
    }
  }

  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
}
