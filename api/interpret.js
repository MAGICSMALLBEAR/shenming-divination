// Vercel Serverless Function — AI 解籤
// POST /api/interpret
// 支援 OpenAI 相容 API（含 DeepSeek，見 _aiProvider.js），若無 API key 則回傳錯誤讓前端觸發 fallback

import { createChatCompletion, jsonResponse, resolveChatProvider } from './_aiProvider.js';

async function handler(req) {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const provider = resolveChatProvider();
  if (!provider) return jsonResponse({ error: 'AI API key not configured' }, 503);

  try {
    const body = await req.json();
    const {
      godName = '神明',
      userName = '信眾',
      question = '未填寫問題',
      questionCategory = 'general',
      poemNumber = 0,
      poemContent = '',
      poemMeaning = '',
      poemStory = '',
      poemLevel = '',
    } = body;

    const categoryMap = {
      career: '工作事業',
      love: '感情關係',
      wealth: '財務進帳',
      health: '健康身心',
      study: '學業考試',
      family: '家庭家運',
      travel: '出行變動',
      general: '近期整體運勢',
    };
    const categoryLabel = categoryMap[questionCategory] || categoryMap.general;

    const systemPrompt = `你是台灣廟宇解籤老師，用溫和、具體、白話的方式解讀籤詩。
你正在為信眾解讀${godName}的籤詩。請根據籤文內容、白話解釋和信眾的問題，給出個人化的解讀。

回覆格式（請嚴格遵守）：
【一句結論】
用一句話總結這支籤對信眾問題的整體態度。

【籤意重點】
2-3 句話解釋籤詩如何對應信眾的問題和現況。

【建議行動】
2-3 項具體、可執行的小步驟，排在越前面的越優先。

【需要留意】
1-2 個需要特別注意的風險或提醒。

【適合追問】
建議信眾可以再深入追問的方向。`;

    const userPrompt = [
      `信眾稱呼：${userName}`,
      `請示神明：${godName}`,
      `問題類型：${categoryLabel}`,
      `信眾問題：${question}`,
      `籤詩編號：第 ${poemNumber} 籤`,
      `籤詩等級：${poemLevel}`,
      `籤詩內容：${poemContent}`,
      `白話解釋：${poemMeaning}`,
      poemStory ? `典故：${poemStory}` : '',
      '',
      '請幫我解讀這支籤詩對我問題的指引。',
    ]
      .filter(Boolean)
      .join('\n');

    const interpretation = await createChatCompletion(provider, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 800,
    });

    return jsonResponse({ interpretation });
  } catch (error) {
    console.error('Interpret error:', error.message);
    return jsonResponse({ error: 'AI service unavailable' }, error.status || 500);
  }
}

// Vercel's Node runtime only uses a returned Response from the Web-standard
// `fetch` export; a default-exported function is called as (req, res) and its
// return value is ignored, which left every request hanging until the timeout.
export default { fetch: handler };
