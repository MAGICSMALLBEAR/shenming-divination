// AI 解籤服務 - 支援多種 LLM 後端
// 預設使用 OpenAI 相容 API (也可用 DeepSeek 等)
import { Platform } from 'react-native';

// Android 模擬器用 10.0.2.2，iOS 模擬器用 localhost，實體手機需設定環境變數
const getDefaultApiUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001/api/interpret';
  return 'http://localhost:3001/api/interpret';
};

interface AIInterpretRequest {
  godName: string;
  userName: string;
  question: string;
  questionCategory: string;
  poemNumber: number;
  poemContent: string;
  poemMeaning: string;
  poemStory: string;
  poemLevel: string;
}

export async function getAIInterpretation(params: AIInterpretRequest): Promise<string> {
  const apiUrl = process.env.EXPO_PUBLIC_AI_API_URL || getDefaultApiUrl();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.interpretation;
  } catch (error) {
    console.warn('AI 解籤服務無法連線，使用本地解籤', error instanceof Error ? error.message : error);
    return generateLocalInterpretation(params);
  }
}

// 問事類別對應的語氣描述
const categoryContext: Record<string, string> = {
  career: '針對事業工作發展給予建議',
  love: '針對感情姻緣給予建議',
  wealth: '針對財運投資給予建議',
  health: '針對健康身體給予建議',
  study: '針對學業考試給予建議',
  family: '針對家庭家運給予建議',
  travel: '針對出行遷移給予建議',
  general: '針對整體運勢給予綜合建議',
};

// 本地離線解籤（含吉凶自適應）
function generateLocalInterpretation(params: AIInterpretRequest): string {
  const { godName, poemContent, poemMeaning, poemStory, poemLevel, question, questionCategory } = params;
  const catLabel = categoryContext[questionCategory] || '針對所求之事給予建議';

  const isGood = poemLevel.includes('上') || poemLevel.includes('大吉') || poemLevel.includes('中吉');
  const isBad = poemLevel.includes('下');

  const toneOpening = isGood
    ? `此籤為${poemLevel}，實屬吉兆！${godName}慈悲護佑，你所問之事前景光明。`
    : isBad
      ? `此籤為${poemLevel}，但請勿灰心。${godName}提醒你，逆境是成長的養分，心念一轉即是轉機。`
      : `此籤為${poemLevel}，${godName}示下：一切隨緣而行，心靜自然明朗。`;

  const toneAdvice = isGood
    ? '既然天時地利，更應積極行動，把握良機。'
    : isBad
      ? '建議暫時守成，韜光養晦，多行善事累積福報。時機到了自然撥雲見日。'
      : '建議保持平常心，不求速成，穩紮穩打。機會往往在你最不經意時出現。';

  return `【${godName}慈悲指引】

${toneOpening}

1. 當前狀況點評（${catLabel}）：
此籤所示，${poemMeaning.slice(0, 80)}...${poemStory ? `典故出自「${poemStory}」，其中的智慧正好對應你目前${question || '的情況'}。` : ''}

2. 近期注意事項：
保持心平氣和，注意身邊的人事物變化。時機未到時切勿急躁，時機一到自然水到渠成。多行善事，廣結善緣，自有貴人相助。

3. 行動建議：
${toneAdvice}遇事多向${godName}祈求，心誠則靈。

${poemContent.split('\n').map(line => `　　${line}`).join('\n')}

願${godName}保佑你，平安順心，心想事成！`;
}
