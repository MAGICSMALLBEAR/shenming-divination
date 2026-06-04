import cors from 'cors';
import express from 'express';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || '3001');

type AIProvider = 'openai' | 'deepseek' | 'custom';

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function getAIConfig(): AIConfig {
  const provider = (process.env.AI_PROVIDER || 'openai') as AIProvider;

  switch (provider) {
    case 'deepseek':
      return {
        provider: 'deepseek',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      };
    case 'custom':
      return {
        provider: 'custom',
        apiKey: process.env.OPENAI_API_KEY || '',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL || 'gpt-4o',
      };
    default:
      return {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL || 'gpt-4o',
      };
  }
}

function hasUsableApiKey(config: AIConfig): boolean {
  return Boolean(config.apiKey && !config.apiKey.startsWith('sk-your-'));
}

async function callLLM(config: AIConfig, messages: ChatMessage[]): Promise<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content || '目前沒有取得可用回覆。';
}

function buildStructuredFallback(params: {
  godName: string;
  poemMeaning?: string;
  poemLevel?: string;
  question?: string;
  questionCategory?: string;
}): string {
  const categoryLabel =
    {
      career: '工作與事業',
      love: '感情關係',
      wealth: '財務與進帳',
      health: '健康與身心',
      study: '學業與考試',
      family: '家庭與家運',
      travel: '出行與變動',
      general: '近期整體運勢',
    }[params.questionCategory || 'general'] || '近期整體運勢';

  const isPositive = params.poemLevel?.includes('上') || params.poemLevel?.includes('吉');
  const isCautious = params.poemLevel?.includes('下') || params.poemLevel?.includes('凶');

  const summary = isPositive
    ? `${params.godName}這次給的訊號偏正面，事情可以慢慢推進，但仍要自己補上行動。`
    : isCautious
      ? `${params.godName}這次更像是在提醒你先穩住，再決定要不要往前。`
      : `${params.godName}給的是觀察型提醒，現在最重要的是看清局勢。`;

  return [
    '【一句結論】',
    summary,
    '',
    '【籤意重點】',
    `你問的是${categoryLabel}。目前這題的關鍵，不只在結果，也在你怎麼拿捏節奏與判斷。`,
    params.poemMeaning ? `白話重點可先抓成：${params.poemMeaning.slice(0, 50)}。` : '',
    '',
    '【建議行動】',
    isPositive
      ? '先安排一個三天內能完成的小行動，讓好勢頭真的落地。'
      : '先確認眼前最不穩的一個環節，再決定下一步。',
    '',
    '【需要留意】',
    '不要一次想解決所有問題，也不要在情緒最重的時候做大決定。',
    '',
    '【適合追問】',
    params.question
      ? `可以追問：「關於${params.question}，我下一步最該先確認什麼？」`
      : '可以追問下一步、時機點，或最該先避開什麼。',
  ]
    .filter(Boolean)
    .join('\n');
}

app.post('/api/interpret', async (req, res) => {
  try {
    const {
      godName,
      userName,
      question,
      questionCategory,
      poemNumber,
      poemContent,
      poemMeaning,
      poemStory,
      poemLevel,
    } = req.body as Record<string, string>;

    if (!godName || !poemContent) {
      res.status(400).json({ error: '缺少必要欄位' });
      return;
    }

    const config = getAIConfig();

    if (!hasUsableApiKey(config)) {
      res.json({
        interpretation: buildStructuredFallback({
          godName,
          poemMeaning,
          poemLevel,
          question,
          questionCategory,
        }),
        provider: 'fallback',
      });
      return;
    }

    const categoryLabel =
      {
        career: '工作與事業',
        love: '感情關係',
        wealth: '財務與進帳',
        health: '健康與身心',
        study: '學業與考試',
        family: '家庭與家運',
        travel: '出行與變動',
        general: '近期整體運勢',
      }[questionCategory || 'general'] || '近期整體運勢';

    const systemPrompt = [
      `你是 ${godName} 的解籤助手，語氣溫和、具體、帶安定感。`,
      `使用者稱呼：${userName || '信眾'}`,
      '請直接輸出以下五段，標題必須完全一致：',
      '【一句結論】',
      '【籤意重點】',
      '【建議行動】',
      '【需要留意】',
      '【適合追問】',
      '不要輸出 JSON，也不要寫前言。',
      '每段 1 到 3 句即可，重點放在可理解與可執行。',
    ].join('\n');

    const userPrompt = [
      `問題類型：${categoryLabel}`,
      `使用者問題：${question || '未提供'}`,
      `籤號：第 ${poemNumber} 籤`,
      `籤等：${poemLevel || '未提供'}`,
      `籤文：${poemContent}`,
      `白話：${poemMeaning || '未提供'}`,
      `典故：${poemStory || '未提供'}`,
    ].join('\n');

    const interpretation = await callLLM(config, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    res.json({ interpretation, provider: config.provider });
  } catch (error) {
    console.error('Interpret API error:', error);
    const { godName, poemMeaning, poemLevel, question, questionCategory } = req.body as Record<
      string,
      string
    >;
    res.json({
      interpretation: buildStructuredFallback({
        godName: godName || '神明',
        poemMeaning,
        poemLevel,
        question,
        questionCategory,
      }),
      provider: 'fallback',
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body as { messages?: ChatMessage[] };
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: '缺少 messages 陣列' });
      return;
    }

    const config = getAIConfig();
    if (!hasUsableApiKey(config)) {
      res.json({
        reply:
          '目前沒有連上雲端 AI，但我仍建議你先把問題縮成一句最核心的提問，再從一個最小可做的步驟開始。',
        provider: 'fallback',
      });
      return;
    }

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: [
        '你是神明占卜 App 的追問助手。',
        '回答要溫和、具體、避免神神叨叨。',
        '優先幫使用者整理下一步、提醒與判斷角度。',
        '盡量控制在 180 字內，除非使用者要求更詳細。',
      ].join('\n'),
    };

    const reply = await callLLM(config, [systemPrompt, ...messages]);
    res.json({ reply, provider: config.provider });
  } catch (error) {
    console.error('Chat API error:', error);
    res.json({
      reply:
        '我剛剛沒有順利拿到 AI 回覆。先這樣抓重點：別急著求一次到位，先把眼前最在意的那件事拆成一個小步驟去做。',
      provider: 'fallback',
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  const config = getAIConfig();
  console.log(`神明占卜 API 已啟動：http://localhost:${PORT}`);
  console.log(`Interpret endpoint: POST http://localhost:${PORT}/api/interpret`);
  console.log(`Chat endpoint: POST http://localhost:${PORT}/api/chat`);
  console.log(`Health endpoint: GET http://localhost:${PORT}/api/health`);
  console.log(
    hasUsableApiKey(config)
      ? `AI provider: ${config.provider} (${config.model})`
      : 'AI provider: fallback only（尚未設定有效 API Key）'
  );
});
