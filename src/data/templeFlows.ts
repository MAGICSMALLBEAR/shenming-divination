import type { God } from '@/data/gods';

export interface TemplePrayerFlow {
  title: string;
  offering: string;
  lightName: string;
  flowerName: string;
  prompts: string[];
}

const flowByGodId: Record<number, TemplePrayerFlow> = {
  1: {
    title: '忠義決斷祈願',
    offering: '稟明是非曲直，願心守正不偏。',
    lightName: '義氣明燈',
    flowerName: '赤心金菊',
    prompts: ['我想堅守的原則是...', '目前最需要判斷的是...', '我願意承擔的行動是...'],
  },
  2: {
    title: '慈悲安心水願',
    offering: '先安住心，再把願望交給慈悲光中。',
    lightName: '慈航心燈',
    flowerName: '白蓮供花',
    prompts: ['我希望被溫柔照看的是...', '我願意先放下的是...', '我想祝福的人是...'],
  },
  3: {
    title: '平安護航祈願',
    offering: '為旅途、家人與前路點一盞平安燈。',
    lightName: '航海平安燈',
    flowerName: '海風牡丹',
    prompts: ['我想祈求平安的旅程是...', '我牽掛的家人是...', '我希望前路順遂的是...'],
  },
  5: {
    title: '保生康泰祈願',
    offering: '為身心修復立願，也提醒自己照顧身體。',
    lightName: '康泰藥師燈',
    flowerName: '青葉福花',
    prompts: ['我想照顧的身體狀態是...', '我願意開始的保養行動是...', '我想感謝身體的是...'],
  },
  6: {
    title: '福德安宅財願',
    offering: '向土地公稟明生活與財務，求踏實穩進。',
    lightName: '福德財燈',
    flowerName: '金穗供花',
    prompts: ['我想守住的生活基礎是...', '我希望財務更穩的是...', '我願意踏實完成的是...'],
  },
  8: {
    title: '文昌開智慧願',
    offering: '把讀書、考試、文書與表達交給清明之光。',
    lightName: '文昌智慧燈',
    flowerName: '桂香文花',
    prompts: ['我正在準備的目標是...', '我最需要補強的能力是...', '我今天願意完成的讀書行動是...'],
  },
  13: {
    title: '月老紅線祈願',
    offering: '把關係願望說清楚，讓紅線牽向適合的緣分。',
    lightName: '良緣紅線燈',
    flowerName: '合歡姻緣花',
    prompts: ['我期待的關係品質是...', '我想修復或靠近的人是...', '我願意先成為怎樣的人是...'],
  },
  14: {
    title: '明鏡是非祈願',
    offering: '把是非與不安放在明鏡前，求清楚與公正。',
    lightName: '明鏡正氣燈',
    flowerName: '玄金供花',
    prompts: ['我想釐清的是非是...', '我希望被看見的真相是...', '我願意正面處理的是...'],
  },
};

export function getTemplePrayerFlow(god: God): TemplePrayerFlow {
  if (flowByGodId[god.id]) return flowByGodId[god.id];

  switch (god.category) {
    case 'war':
      return {
        title: '突破護身祈願',
        offering: '請神明護持勇氣，斬斷阻礙。',
        lightName: '護身勇氣燈',
        flowerName: '赤焰供花',
        prompts: ['我想突破的難關是...', '我需要守住的底線是...', '我願意立刻行動的是...'],
      };
    case 'compassion':
      return flowByGodId[2];
    case 'sea':
      return flowByGodId[3];
    case 'health':
      return flowByGodId[5];
    case 'wealth':
      return flowByGodId[6];
    default:
      return {
        title: '日常安定祈願',
        offering: '把眼前最真實的願望，安放在神明殿前。',
        lightName: '平安順心燈',
        flowerName: '金桂供花',
        prompts: ['我此刻最想祈求的是...', '我希望被指引的方向是...', '我願意回到生活中實踐的是...'],
      };
  }
}
