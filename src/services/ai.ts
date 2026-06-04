import { Platform } from 'react-native';
import { normalizeInterpretationText } from './interpretation';

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

const categoryContext: Record<string, string> = {
  career: '工作與事業',
  love: '感情關係',
  wealth: '財務與進帳',
  health: '健康與身心',
  study: '學業與考試',
  family: '家庭與家運',
  travel: '出行與變動',
  general: '近期整體運勢',
};

function buildFallbackInterpretation(params: AIInterpretRequest): string {
  const categoryLabel = categoryContext[params.questionCategory] ?? categoryContext.general;
  const isPositive = params.poemLevel.includes('上') || params.poemLevel.includes('吉');
  const isCautious = params.poemLevel.includes('下') || params.poemLevel.includes('凶');

  const summary = isPositive
    ? `${params.godName}給出的訊號偏正面，這題有機會順勢推進，但仍要踏實行動。`
    : isCautious
      ? `${params.godName}這次更像是在提醒你放慢腳步，先穩住再決定。`
      : `${params.godName}給的是觀察型提示，現在最重要的是看清局勢再動。`;

  const insight = `這次你問的是${categoryLabel}。籤詩白話提到「${params.poemMeaning.slice(0, 28)}」，表示事情的關鍵不只在結果，也在你的節奏與判斷。`;

  const action = isPositive
    ? '先選一個最小但清楚的行動，在三天內主動推進。'
    : isCautious
      ? '先整理手上的風險與不確定因素，再決定要不要往前。'
      : '先記錄現況，讓自己知道真正卡住的是哪一個環節。';

  const caution = isCautious
    ? '不要因一時心急或外界壓力做出太快的承諾。'
    : '避免同時分心處理太多方向，否則會把原本可解的事做亂。';

  const followUp = params.question
    ? `可以追問：「關於${params.question}，我下一步最該確認的是什麼？」`
    : '可以追問時間點、阻礙來源，或最適合先處理的那一步。';

  return normalizeInterpretationText(
    [
      '【一句結論】',
      summary,
      '',
      '【籤意重點】',
      insight,
      '',
      '【建議行動】',
      action,
      '',
      '【需要留意】',
      caution,
      '',
      '【適合追問】',
      followUp,
    ].join('\n'),
    params.question
  );
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
    const rawText =
      typeof data?.interpretation === 'string' ? data.interpretation : buildFallbackInterpretation(params);

    return normalizeInterpretationText(rawText, params.question);
  } catch (error) {
    console.warn(
      'AI interpretation failed, using local fallback.',
      error instanceof Error ? error.message : error
    );
    return buildFallbackInterpretation(params);
  }
}
