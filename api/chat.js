// Vercel Serverless Function — AI 追問
// POST /api/chat
// 支援 OpenAI 相容 API，若無 API key 則回傳錯誤讓前端觸發 fallback

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'AI API key not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { messages = [] } = body;

    if (!messages.length) {
      return new Response(JSON.stringify({ reply: '請輸入想追問的內容。' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('AI Chat API error:', response.status, err);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，我暫時無法給出回應。';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    return new Response(
      JSON.stringify({ error: 'AI service unavailable' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
