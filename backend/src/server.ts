import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || '3001', 10);

// AI Provider 設定
type AIProvider = 'openai' | 'deepseek' | 'custom';

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
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
    case 'openai':
    default:
      return {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL || 'gpt-4o',
      };
  }
}

// 使用 OpenAI 相容 API 格式呼叫 LLM
async function callLLM(config: AIConfig, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || '目前神明正在靜修，請稍後再試。';
}

// AI 解籤 API
app.post('/api/interpret', async (req, res) => {
  try {
    const { godName, userName, question, questionCategory, poemNumber, poemContent, poemMeaning, poemStory, poemLevel } = req.body;

    if (!godName || !poemContent) {
      res.status(400).json({ error: '缺少必要參數' });
      return;
    }

    const config = getAIConfig();

    if (!config.apiKey || config.apiKey.startsWith('sk-your-') || config.apiKey === '') {
      res.json({
        interpretation: generateFallbackInterpretation(godName, poemContent, poemMeaning, poemStory, poemLevel, question, questionCategory),
        provider: 'fallback',
      });
      return;
    }

    const catLabel = questionCategory === 'career' ? '事業工作' :
      questionCategory === 'love' ? '感情姻緣' :
      questionCategory === 'wealth' ? '財運投資' :
      questionCategory === 'health' ? '健康身體' :
      questionCategory === 'study' ? '學業考試' :
      questionCategory === 'family' ? '家庭家運' :
      questionCategory === 'travel' ? '出行遷移' : '綜合運勢';

    const levelGuide = poemLevel?.includes('上') || poemLevel?.includes('大吉')
      ? '此籤為吉籤，請以恭喜、鼓勵的語氣回應，勉勵信眾把握良機積極行動。'
      : poemLevel?.includes('下')
        ? '此籤為下籤，請以安慰、溫暖的語氣回應，將逆境轉化為成長的養分，絕對不可恐嚇或讓信眾絕望。'
        : '此籤為平籤，請以平穩、智慧的語氣回應，提醒信眾隨緣而行。';

    const systemPrompt = `你現在是【${godName}】，請以慈祥、智慧且具備神威的語氣回覆信眾。
信眾姓名：${userName || '善信'}
問事類別：${catLabel}
所求之事：${question || '未說明'}

核心原則：
1. 絕對正向引導：無論籤詩吉凶，最終都必須導向積極行動、自我反省與希望，不可給出極端負面、恐嚇或絕對化的判斷。
2. 免責聲明意識：對於醫療、投資等重大決策，需委婉提醒信眾尋求專業協助。
3. 語氣設定：第一人稱，溫暖、安定的長者風範，有如廟中老住持為信眾解籤的語氣。
4. 結合籤詩典故給予有深度的解說。
5. ${levelGuide}

請根據信眾提供的資訊與籤詩，針對【${catLabel}】面向給出結構化指引：

1. 當前狀況點評（結合籤詩典故，圍繞信眾的${catLabel}問題）
2. 近期需要注意的事項（針對${catLabel}給出具體提醒）
3. 一個積極可行的行動建議（針對${catLabel}的具體建議）

最後，附上一句【${godName}】專屬的經典祝福語。`;

    const userPrompt = `
信眾：${userName || '善信'}
問事類別：${catLabel}
所求之事：${question || '未說明'}
求得籤詩：第 ${poemNumber} 籤（${poemLevel || '未知'}）
籤詩內容：「${poemContent}」
籤詩白話：${poemMeaning || '無'}
籤詩典故：${poemStory || '無'}

請為我解籤。`;

    const interpretation = await callLLM(config, systemPrompt, userPrompt);

    res.json({ interpretation, provider: config.provider });
  } catch (error) {
    console.error('AI 解籤錯誤:', error);
    // 發生錯誤時使用後備解籤
    const { godName, poemContent, poemMeaning, poemStory, poemLevel, question, questionCategory } = req.body;
    res.json({
      interpretation: generateFallbackInterpretation(godName, poemContent, poemMeaning, poemStory, poemLevel, question, questionCategory),
      provider: 'fallback',
    });
  }
});

// 後備離線解籤
function generateFallbackInterpretation(
  godName: string,
  poemContent: string,
  poemMeaning: string,
  poemStory: string,
  poemLevel?: string,
  question?: string,
  questionCategory?: string
): string {
  const lines = poemContent.split('\n').filter(Boolean);
  const isGood = poemLevel?.includes('上') || poemLevel?.includes('大吉') || poemLevel?.includes('中吉');
  const isBad = poemLevel?.includes('下');

  const catLabel = questionCategory === 'career' ? '事業工作' :
    questionCategory === 'love' ? '感情姻緣' :
    questionCategory === 'wealth' ? '財運投資' :
    questionCategory === 'health' ? '健康身體' :
    questionCategory === 'study' ? '學業考試' :
    questionCategory === 'family' ? '家庭家運' :
    questionCategory === 'travel' ? '出行遷移' : '綜合運勢';

  const toneOpening = isGood
    ? `此籤為${poemLevel || '吉籤'}，實屬吉兆！${godName}慈悲護佑，針對你所問的${catLabel}，前景光明。`
    : isBad
      ? `此籤為${poemLevel || '下籤'}，但請勿灰心。${godName}提醒你，逆境是成長的養分，心念一轉即是轉機。`
      : `此籤為${poemLevel || '平籤'}，${godName}示下：一切隨緣而行，心靜自然明朗。`;

  const toneAdvice = isGood
    ? '既然天時地利，更應積極行動，把握良機。'
    : isBad
      ? '建議暫時守成，韜光養晦，多行善事累積福報。時機到了自然撥雲見日。'
      : '建議保持平常心，不求速成，穩紮穩打。';

  return `【${godName}慈悲指引】

${toneOpening}

1. 當前狀況點評（${catLabel}）：
此籤所示，${poemMeaning ? poemMeaning.slice(0, 80) + '...' : '寓意深遠，值得細細體會。'}${poemStory ? `典故出自「${poemStory}」，其中的智慧正好對應你目前${question || '的情況'}。` : ''}

2. 近期注意事項：
保持心平氣和，注意身邊的人事物變化。時機未到時切勿急躁，時機一到自然水到渠成。多行善事，廣結善緣，自有貴人相助。

3. 行動建議：
${toneAdvice}遇事多向${godName}祈求，心誠則靈。

${lines.map((l: string) => `　　${l}`).join('\n')}

願${godName}保佑你，平安順心，心想事成！`;
}

// AI 多輪對話 API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: '缺少 messages 陣列' });
      return;
    }

    const config = getAIConfig();
    if (!config.apiKey || config.apiKey.startsWith('sk-your-') || config.apiKey === '') {
      res.json({
        reply: `我聽到了你的心聲 🙏\n\n請保持正向信念，心誠則靈。常念善念、行善事，福報自然降臨。`,
        provider: 'fallback',
      });
      return;
    }

    const systemPrompt = `你現在是一位慈悲智慧的廟中神明，以溫暖、安定的語氣回覆信眾的疑問。
核心原則：
1. 絕對正向引導，不可給出恐嚇、極端負面或絕對化的判斷。
2. 對於醫療、法律、投資問題，提醒信眾尋求專業協助。
3. 以智慧與慈悲回應，結合傳統文化智慧。
4. 回應控制在 200 字以內，簡潔有力。`;

    const reply = await callLLM(config, systemPrompt, messages.map((m: any) => m.content).join('\n'));

    res.json({ reply, provider: config.provider });
  } catch (error) {
    console.error('對話 API 錯誤:', error);
    res.json({
      reply: `我聽到了你的心聲 🙏\n\n請保持正向信念，心誠則靈。`,
      provider: 'fallback',
    });
  }
});

// 健康檢查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🏛️  神明占卜 API 伺服器啟動於 http://localhost:${PORT}`);
  console.log(`   AI 解籤端點: POST http://localhost:${PORT}/api/interpret`);
  console.log(`   健康檢查: GET http://localhost:${PORT}/api/health`);

  const config = getAIConfig();
  if (!config.apiKey || config.apiKey.includes('your-api-key')) {
    console.log('   ⚠️  未設定 AI API Key，將使用離線後備解籤');
    console.log('   請複製 .env.example 為 .env 並填入 API Key');
  } else {
    console.log(`   🤖 AI 服務商: ${config.provider} (${config.model})`);
  }
});
