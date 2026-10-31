// Vercel Serverless Function — AI 智慧解夢
// POST /api/dream
// 支援 OpenAI 相容 API（含 DeepSeek，見 _aiProvider.js）
// 若無 API key 則回傳 { fallback: true } 讓前端無縫觸發本地離線解夢

import { createChatCompletion, jsonResponse, resolveChatProvider } from './_aiProvider.js';

async function handler(req) {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const provider = resolveChatProvider();
  if (!provider) {
    // 雲端尚未設定 AI API Key 時，回傳 fallback: true 讓前端使用本地專家規則
    return jsonResponse({ fallback: true, provider: 'fallback' });
  }

  try {
    const body = await req.json();
    const { dream = '', feeling = '' } = body;

    if (!dream || !dream.trim()) {
      return jsonResponse({ error: '請提供夢境描述' }, 400);
    }

    const systemPrompt = [
      '你是一位兼具東方傳統民俗解夢與現代深度心理學（榮格/阿德勒）的資深解夢導師。',
      '語氣溫和、慈悲且具啟發性，尊重使用者的個人感受，不給予定論式的恐嚇或迷信預言。',
      '請對使用者的夢境進行深入解析，並嚴格以 JSON 格式回應，包含以下欄位：',
      '1. symbols: 提取夢中的核心象徵關鍵詞陣列（至少 2~4 個，如 ["蛇", "水", "奔跑"]）',
      '2. interpretation: 夢境核心整體解析（約 120~180 字）',
      '3. traditionalView: 傳統民俗與周公解夢原典視角（約 80~120 字，著重於吉凶徵兆與文化隱喻）',
      '4. psychologicalView: 現代心理學與自我覺察視角（約 80~120 字，著重於潛意識情緒、壓力投射與內在需求）',
      '5. fortune: "吉"、"中"、"凶" 三選一',
      '6. advice: 具體溫暖的現實生活行動指引（約 60~100 字）',
      '',
      '請直接輸出符合標準格式的合法 JSON 字串，切勿加入 Markdown 標記（如 ```json）或額外贅字：',
      '{"symbols":["符號1","符號2"],"interpretation":"...","traditionalView":"...","psychologicalView":"...","fortune":"吉","advice":"..."}',
    ].join('\n');

    const userPrompt = [
      `【夢境內容】：${dream.trim()}`,
      feeling ? `【醒來感受】：${feeling.trim()}` : '',
      '請依照 JSON 格式解析此夢境。',
    ].filter(Boolean).join('\n');

    const reply = await createChatCompletion(provider, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 800,
    });

    const jsonMatch = reply ? reply.match(/\{[\s\S]*\}/) : null;
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return jsonResponse({
          symbols: Array.isArray(parsed.symbols) ? parsed.symbols : [],
          interpretation: parsed.interpretation || '夢境象徵正在轉變與重組中。',
          traditionalView: parsed.traditionalView || '周公解夢示警：萬事順其自然，心存善念則逢凶化吉。',
          psychologicalView: parsed.psychologicalView || '反映近期內心對於變化的感受，宜給予自己更多沉澱空間。',
          fortune: ['吉', '中', '凶'].includes(parsed.fortune) ? parsed.fortune : '中',
          advice: parsed.advice || '建議順應身心步調，適度休息並理清近期生活優先順序。',
          provider: provider.model,
        });
      } catch {
        // fallback to text parse
      }
    }

    // 若非標準 JSON，包裝文字後回傳
    return jsonResponse({
      symbols: [],
      interpretation: reply || '已接收夢境，建議靜心回顧其中訊息。',
      traditionalView: '夢由心生，動靜相隨。',
      psychologicalView: '夢境反映當下潛意識的情緒起伏。',
      fortune: '中',
      advice: '建議保持規律作息，傾聽內在感受。',
      provider: provider.model,
    });
  } catch (error) {
    console.error('Dream API error:', error.message);
    return jsonResponse({ fallback: true, error: error.message });
  }
}

export default { fetch: handler };

