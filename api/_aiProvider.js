// Shared by /api/interpret and /api/chat. The leading underscore keeps Vercel
// from deploying this file as its own function.
//
// Provider selection (first match wins):
//   AI_API_KEY        + optional AI_BASE_URL / AI_MODEL (any OpenAI-compatible API)
//   DEEPSEEK_API_KEY  → https://api.deepseek.com, model deepseek-flash
//   OPENAI_API_KEY    → https://api.openai.com/v1, model gpt-4o-mini

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';
export const AI_TIMEOUT_MS = 25_000;

export function resolveChatProvider(env = process.env) {
  let provider = null;
  if (env.AI_API_KEY) {
    provider = { apiKey: env.AI_API_KEY, baseUrl: env.AI_BASE_URL || OPENAI_BASE_URL, model: env.AI_MODEL || 'gpt-4o-mini' };
  } else if (env.DEEPSEEK_API_KEY) {
    provider = { apiKey: env.DEEPSEEK_API_KEY, baseUrl: env.AI_BASE_URL || DEEPSEEK_BASE_URL, model: env.AI_MODEL || 'deepseek-flash' };
  } else if (env.OPENAI_API_KEY) {
    provider = { apiKey: env.OPENAI_API_KEY, baseUrl: env.AI_BASE_URL || OPENAI_BASE_URL, model: env.AI_MODEL || 'gpt-4o-mini' };
  }
  if (!provider) return null;
  provider.baseUrl = provider.baseUrl.replace(/\/+$/, '');
  // DeepSeek thinks by default, which is slow and ignores temperature; a
  // reading needs a direct answer within the function time limit.
  provider.extraBody = provider.baseUrl.includes('deepseek.com') ? { thinking: { type: 'disabled' } } : {};
  return provider;
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Calls /chat/completions and returns the reply text; throws with `status` on failure. */
export async function createChatCompletion(provider, { messages, temperature, maxTokens }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        ...provider.extraBody,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    const failure = new Error(error?.name === 'AbortError' ? 'AI API timed out' : 'AI API unreachable');
    failure.status = error?.name === 'AbortError' ? 504 : 502;
    throw failure;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    console.error('AI API error:', response.status, await response.text().catch(() => ''));
    const failure = new Error(`AI API error: ${response.status}`);
    failure.status = 502;
    throw failure;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
