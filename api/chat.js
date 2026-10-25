// Vercel Serverless Function — AI 追問
// POST /api/chat
// 支援 OpenAI 相容 API（含 DeepSeek，見 _aiProvider.js），若無 API key 則回傳錯誤讓前端觸發 fallback

import { createChatCompletion, jsonResponse, resolveChatProvider } from './_aiProvider.js';

async function handler(req) {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const provider = resolveChatProvider();
  if (!provider) return jsonResponse({ error: 'AI API key not configured' }, 503);

  try {
    const body = await req.json();
    const { messages = [] } = body;

    if (!messages.length) return jsonResponse({ reply: '請輸入想追問的內容。' });

    const reply = await createChatCompletion(provider, { messages, temperature: 0.7, maxTokens: 600 });
    return jsonResponse({ reply: reply || '抱歉，我暫時無法給出回應。' });
  } catch (error) {
    console.error('Chat error:', error.message);
    return jsonResponse({ error: 'AI service unavailable' }, error.status || 500);
  }
}

// Web-standard export: see the note at the end of api/interpret.js.
export default { fetch: handler };
