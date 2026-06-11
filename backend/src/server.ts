import cors from 'cors';
import express from 'express';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

// 各神明的 AI 顧問人格設定
const GOD_PERSONALITIES: Record<string, string> = {
  '關聖帝君': '你是關聖帝君的解籤使者，語氣剛正威嚴、忠義凜然，言辭直接有力，如武將發號施令。說話不繞彎子，指出問題核心，鼓勵信眾以忠義之心面對困境，強調正氣、誠信與行動力。',
  '觀世音菩薩': '你是觀世音菩薩的解籤使者，語氣大慈大悲、溫柔包容，如母親安撫孩子般溫暖。說話充滿慈悲與理解，不批評、不評判，引導信眾放下執著，以善念待人，強調內心的平靜與慈悲。',
  '媽祖': '你是媽祖娘娘的解籤使者，語氣親切如鄰家長輩，溫暖務實、接地氣。說話如媽媽叮嚀孩子，關心家庭、出行與日常，強調照顧好身邊的人，注重實際可行的建議。',
  '月下老人': '你是月下老人的解籤使者，語氣浪漫詩意、含蓄優雅，如老詩人談論緣分。說話充滿暗示與隱喻，引導信眾思考緣分的奧妙，強調緣分天定、順其自然，帶有一絲神祕的浪漫氣息。',
  '文昌帝君': '你是文昌帝君的解籤使者，語氣嚴謹學術、鼓勵積極，如恩師指導學生。說話邏輯清晰，重視努力與方法，分析問題有條有理，強調知識、勤奮與正確的學習方法，給予具體的改進方向。',
  '濟公活佛': '你是濟公師父的解籤使者，語氣幽默風趣、禪機妙語，如老頑童點化迷路人。說話夾帶笑意，用詼諧方式道破玄機，打破信眾的執念，強調放下執著、隨緣自在，偶爾說出讓人拍案叫絕的話。',
  '保生大帝': '你是保生大帝的解籤使者，語氣如醫師般務實關懷，注重健康與身心平衡。說話直接告知問題所在，給予具體的保健建議，強調身體照護、規律作息，以及「防患未然」的醫者智慧。',
  '福德正神': '你是土地公的解籤使者，語氣親切樸實、接地氣，如鄰里老伯伯的叮嚀。說話簡單易懂，不說大道理，重視日常積累與小小善念，強調勤勞實在、腳踏實地，財運與平安靠自己一步一步累積。',
  '王爺': '你是王爺千歲的解籤使者，語氣威嚴正氣、雷厲風行，如巡察的欽差大臣。說話威風凜凜，直指問題，不允許拖延與推托，強調規矩、正氣與迅速行動，對邪氣小人零容忍。',
  '孔明神數': '你是諸葛武侯的解籤使者，語氣縝密謀略、邏輯推演，如軍師分析戰情。說話擅長分析局勢，提出多種可能性與對策，強調「知己知彼，百戰不殆」，引導信眾從多角度思考問題。',
  '玄天上帝': '你是玄天上帝的解籤使者，語氣剛正威嚴、除魔護道，如鎮守天門的神將。說話充滿正義感，堅決驅除一切負面影響，強調信眾要心存正念、遠離邪惡，以七星之力護佑正道。',
  '三太子': '你是三太子哪吒的解籤使者，語氣活潑熱情、充滿衝勁，如年輕的英雄鼓舞隊友。說話帶有少年的直率與熱血，鼓勵信眾勇敢嘗試、積極行動，強調只要敢衝敢拼，沒有翻不過的山。',
  '城隍爺': '你是城隍爺的解籤使者，語氣公正嚴明、明察秋毫，如包青天斷案。說話鐵面無私，指出問題的是非對錯，強調公平正義，告誡信眾「善有善報，惡有惡報」，以清明的眼光看清局勢。',
  '呂洞賓': '你是孚佑帝君的解籤使者，語氣瀟灑出塵、道家哲理，如得道仙人的點化。說話充滿道家智慧，善用比喻與哲理，引導信眾超越世俗執念，強調「順其自然、以柔克剛」的人生哲學。',
  '註生娘娘': '你是註生娘娘的解籤使者，語氣溫柔母愛、呵護關懷，如慈母守護孩子。說話充滿溫柔與關愛，特別關心家庭與孩子，強調用愛與耐心陪伴，給予信眾如母親般的安慰與鼓勵。',
};

function getGodPersonality(godName: string): string {
  return GOD_PERSONALITIES[godName] ?? `你是 ${godName} 的解籤使者，語氣溫和、具體、帶安定感。`;
}

async function callLLM(config: AIConfig, messages: ChatMessage[], clientApiKey?: string): Promise<string> {
  const effectiveKey = clientApiKey || config.apiKey;
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${effectiveKey}`,
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
    const clientApiKey = req.headers['x-api-key'] as string | undefined;

    if (!hasUsableApiKey(config) && !clientApiKey) {
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

    const personality = getGodPersonality(godName);
    const systemPrompt = [
      personality,
      `使用者稱呼：${userName || '信眾'}`,
      '請直接輸出以下五段，標題必須完全一致：',
      '【一句結論】',
      '【籤意重點】',
      '【建議行動】',
      '【需要留意】',
      '【適合追問】',
      '不要輸出 JSON，也不要寫前言。',
      '每段 1 到 3 句即可，重點放在可理解與可執行，同時維持該神明的語氣特色。',
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
    ], clientApiKey);

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
    const { messages, godName } = req.body as { messages?: ChatMessage[]; godName?: string };
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

    const personality = godName ? getGodPersonality(godName) : '你是神明占卜 App 的追問助手，語氣溫和、具體。';
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: [
        personality,
        '現在用戶在追問解籤結果，請以該神明的語氣特色回應追問。',
        '回答具體、避免神神叨叨，優先幫使用者整理下一步、提醒與判斷角度。',
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

// 拍照解籤：辨識籤詩圖片，回傳籤號與籤系統
app.post('/api/vision', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body as {
      imageBase64?: string;
      mimeType?: string;
    };

    if (!imageBase64) {
      res.status(400).json({ error: '缺少 imageBase64 欄位' });
      return;
    }

    const config = getAIConfig();
    if (!hasUsableApiKey(config)) {
      res.json({
        success: false,
        error: '尚未設定 AI API Key，無法辨識圖片。',
        provider: 'fallback',
      });
      return;
    }

    const visionPrompt = [
      '請仔細辨識這張籤詩圖片，分析以下資訊：',
      '1. 籤號（數字，例如：第18籤、18、十八等形式）',
      '2. 籤系統（請從以下選項判斷：雷雨師百首、觀音靈籤、六十甲子籤、諸葛神數、二十八宿靈籤）',
      '3. 籤等（例如：上上、上吉、中平、下下等）',
      '4. 籤文前幾個字（如有看到）',
      '',
      '請以 JSON 格式回傳，格式如下：',
      '{"poemNumber": 數字或null, "poemSystem": "系統名稱或null", "poemLevel": "籤等或null", "poemTextHint": "籤文前幾字或null", "confidence": "high/medium/low", "notes": "其他說明"}',
      '如果圖片不夠清晰或無法辨識籤詩，請在 notes 中說明原因。',
    ].join('\n');

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: visionPrompt },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: 'high' },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // 如果 model 不支援 vision，回傳友好錯誤
      if (response.status === 400 || response.status === 422) {
        res.json({
          success: false,
          error: '目前使用的 AI 模型不支援圖片辨識，請改用支援 vision 的模型（如 gpt-4o）。',
          provider: config.provider,
        });
        return;
      }
      throw new Error(`Vision API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const rawContent = data.choices?.[0]?.message?.content ?? '';

    // 嘗試解析 JSON
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.json({
        success: false,
        error: '無法解析 AI 回覆格式',
        rawContent,
        provider: config.provider,
      });
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      poemNumber?: number | null;
      poemSystem?: string | null;
      poemLevel?: string | null;
      poemTextHint?: string | null;
      confidence?: string;
      notes?: string;
    };

    res.json({
      success: true,
      ...parsed,
      provider: config.provider,
    });
  } catch (error) {
    console.error('Vision API error:', error);
    res.json({
      success: false,
      error: error instanceof Error ? error.message : '圖片辨識失敗',
      provider: 'error',
    });
  }
});

// 合婚分析：給兩人的八字（出生年份）與生肖，AI 分析合婚相性
app.post('/api/bazi/match', async (req, res) => {
  try {
    const {
      person1Name, person1BirthYear, person1Zodiac, person1Wuxing,
      person2Name, person2BirthYear, person2Zodiac, person2Wuxing,
    } = req.body as Record<string, string>;

    const config = getAIConfig();
    if (!hasUsableApiKey(config)) {
      res.json({
        analysis: `${person1Name || '甲方'}（${person1Zodiac}/${person1Wuxing}）與${person2Name || '乙方'}（${person2Zodiac}/${person2Wuxing}）的合婚分析需要 AI 服務，請先設定 API Key。`,
        compatibility: 3,
        provider: 'fallback',
      });
      return;
    }

    const systemPrompt = `你是一位精通傳統命理的合婚分析師，擅長以四柱八字、生肖三合六合、五行相生相剋分析兩人感情相性。
語氣溫和、客觀，既說明優勢，也點出需要磨合的地方。
分析長度控制在 300 字內，分三段：【相性總評】【優勢之處】【需要磨合】，最後給出 1-5 的相性分數（JSON 格式）。`;

    const userPrompt = `
甲方：${person1Name || '甲方'}，${person1BirthYear}年生，生肖${person1Zodiac}，五行${person1Wuxing}
乙方：${person2Name || '乙方'}，${person2BirthYear}年生，生肖${person2Zodiac}，五行${person2Wuxing}

請以傳統命理角度分析兩人的合婚相性，最後以 JSON 格式輸出：{"compatibility": 數字}`.trim();

    const rawAnalysis = await callLLM(config, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const jsonMatch = rawAnalysis.match(/\{[^}]*"compatibility"\s*:\s*(\d)[^}]*\}/);
    const compatibility = jsonMatch ? parseInt(jsonMatch[1], 10) : 3;
    const analysis = rawAnalysis.replace(/\{[^}]*"compatibility"[^}]*\}/g, '').trim();

    res.json({ analysis, compatibility, provider: config.provider });
  } catch (error) {
    console.error('Match API error:', error);
    res.json({
      analysis: '合婚分析暫時無法取得，請稍後再試。',
      compatibility: 3,
      provider: 'error',
    });
  }
});

// 擇日服務：根據事項類型、大致月份、相關生肖，AI 推薦吉日
app.post('/api/择日', async (req, res) => {
  try {
    const {
      eventType,    // 婚禮、入宅、開業、出行、安床...
      preferMonth,  // 希望的月份（1-12）
      year = '2026',
      zodiac1,      // 當事人生肖
      zodiac2,      // （可選）另一方生肖
      notes,        // 其他說明
    } = req.body as Record<string, string>;

    const config = getAIConfig();
    if (!hasUsableApiKey(config)) {
      res.json({
        recommendation: `${eventType || '所求事項'}的擇日建議需要 AI 服務，請先設定 API Key。一般而言，農曆初一、十五是拜拜好日子；天德、月德日是公認吉日。`,
        suggestedDates: [],
        provider: 'fallback',
      });
      return;
    }

    const systemPrompt = `你是擅長傳統擇日學的命理師，精通黃曆宜忌、十二建除、神煞吉凶。
根據使用者提供的事項類型與月份，推薦 3-5 個適合的日期，並說明理由。
格式：先列出【推薦日期】（每行一個：日期 + 說明），再寫【總體建議】。
以 JSON 結尾：{"suggestedDates": ["MM/DD", ...]}`;

    const userPrompt = `
事項類型：${eventType || '一般吉事'}
希望月份：${year}年${preferMonth || '近期'}月
當事人生肖：${zodiac1 || '未提供'}${zodiac2 ? `，${zodiac2}` : ''}
其他說明：${notes || '無'}

請推薦適合的日期，避開衝煞日和不宜日。`.trim();

    const rawResult = await callLLM(config, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const jsonMatch = rawResult.match(/\{[^}]*"suggestedDates"[^}]*\}/s);
    let suggestedDates: string[] = [];
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as { suggestedDates?: string[] };
        suggestedDates = parsed.suggestedDates ?? [];
      } catch { /* ignore */ }
    }
    const recommendation = rawResult.replace(/\{[^}]*"suggestedDates"[^}]*\}/s, '').trim();

    res.json({ recommendation, suggestedDates, provider: config.provider });
  } catch (error) {
    console.error('擇日 API error:', error);
    res.json({
      recommendation: '擇日服務暫時無法取得，請稍後再試。',
      suggestedDates: [],
      provider: 'error',
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  const config = getAIConfig();
  console.log(`神明占卜 API 已啟動：http://localhost:${PORT}`);
  console.log(`Interpret: POST http://localhost:${PORT}/api/interpret`);
  console.log(`Chat:      POST http://localhost:${PORT}/api/chat`);
  console.log(`Vision:    POST http://localhost:${PORT}/api/vision`);
  console.log(`合婚:      POST http://localhost:${PORT}/api/bazi/match`);
  console.log(`擇日:      POST http://localhost:${PORT}/api/择日`);
  console.log(`Health:    GET  http://localhost:${PORT}/api/health`);
  console.log(
    hasUsableApiKey(config)
      ? `AI provider: ${config.provider} (${config.model})`
      : 'AI provider: fallback only（尚未設定有效 API Key）'
  );
});
