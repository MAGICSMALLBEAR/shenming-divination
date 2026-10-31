/**
 * @jest-environment node
 */
import chat from '../api/chat.js';
import interpret from '../api/interpret.js';
import transcribe, { baseMimeType, toIsoLanguage } from '../api/transcribe.js';
import { resolveChatProvider } from '../api/_aiProvider.js';

type FetchHandler = { fetch: (request: Request) => Promise<Response> };

const ENV_KEYS = [
  'AI_API_KEY', 'AI_BASE_URL', 'AI_MODEL', 'DEEPSEEK_API_KEY', 'OPENAI_API_KEY',
  'TRANSCRIPTION_API_KEY', 'TRANSCRIPTION_API_BASE_URL', 'TRANSCRIPTION_MODEL',
];
const savedEnv: Record<string, string | undefined> = {};
const realFetch = global.fetch;

function post(path: string, body: unknown) {
  return new Request(`https://shenming.example${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockUpstream(response: () => Promise<Response> | Response) {
  const calls: { url: string; init: RequestInit }[] = [];
  global.fetch = jest.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return response();
  }) as typeof fetch;
  return calls;
}

const chatReply = (content: string) => new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });

beforeEach(() => {
  for (const key of ENV_KEYS) { savedEnv[key] = process.env[key]; delete process.env[key]; }
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  global.fetch = realFetch;
  jest.restoreAllMocks();
});

describe('Vercel function exports', () => {
  it.each([
    ['interpret', interpret],
    ['chat', chat],
    ['transcribe', transcribe],
  ])('%s uses the Web-standard fetch export and answers immediately', async (_name, handler) => {
    // A default-exported function would be called as (req, res) and its Response ignored.
    expect(typeof (handler as FetchHandler).fetch).toBe('function');
    const res = await (handler as FetchHandler).fetch(new Request('https://shenming.example/api/x'));
    expect(res.status).toBe(405);
  });

  it.each([
    ['interpret', interpret, '/api/interpret', { question: '測試' }],
    ['chat', chat, '/api/chat', { messages: [{ role: 'user', content: '測試' }] }],
    ['transcribe', transcribe, '/api/transcribe', { audioBase64: 'AAAA', mimeType: 'audio/webm' }],
  ])('%s reports 503 without any key instead of hanging', async (_name, handler, path, body) => {
    const res = await (handler as FetchHandler).fetch(post(path, body));
    expect(res.status).toBe(503);
  });
});

describe('chat provider selection', () => {
  it('uses DeepSeek with thinking disabled when only a DeepSeek key is set', () => {
    process.env.DEEPSEEK_API_KEY = 'ds-key';
    expect(resolveChatProvider()).toEqual({
      apiKey: 'ds-key',
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-flash',
      extraBody: { thinking: { type: 'disabled' } },
    });
  });

  it('prefers AI_API_KEY, then DeepSeek, then OpenAI, and honours overrides', () => {
    process.env.OPENAI_API_KEY = 'oa-key';
    expect(resolveChatProvider()).toMatchObject({ apiKey: 'oa-key', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', extraBody: {} });

    process.env.DEEPSEEK_API_KEY = 'ds-key';
    expect(resolveChatProvider()).toMatchObject({ apiKey: 'ds-key', model: 'deepseek-flash' });

    process.env.AI_API_KEY = 'other-key';
    process.env.AI_BASE_URL = 'https://llm.example/v1/';
    process.env.AI_MODEL = 'custom-model';
    expect(resolveChatProvider()).toEqual({ apiKey: 'other-key', baseUrl: 'https://llm.example/v1', model: 'custom-model', extraBody: {} });
  });

  it('returns null without credentials', () => {
    expect(resolveChatProvider()).toBeNull();
  });
});

describe('/api/interpret and /api/chat with DeepSeek', () => {
  it.each([
    ['yuelao-taiwan-100', '月老靈籤・台灣版', 'taiwan-v1'],
    ['yuelao-hongkong-101', '月老靈簽・香港版', 'hongkong-v1'],
  ])('keeps edition %s and history in the upstream prompt', async (editionId, editionLabel, editionVersionTag) => {
    process.env.DEEPSEEK_API_KEY = 'ds-key';
    const calls = mockUpstream(() => chatReply('【一句結論】解讀'));
    await (interpret as FetchHandler).fetch(post('/api/interpret', {
      godName: '月下老人', poemNumber: 1, poemContent: '本次原文', editionId, editionLabel, editionVersionTag,
      editionTemple: '廟本名稱', editionSource: '來源說明', editionSourceUrl: 'https://example.org/source',
      drawMethod: 'stick-confirmation', recentHistorySummary: '月老第1籤／另一廟本／舊版',
    }));
    const { messages } = JSON.parse(String(calls[0].init.body));
    expect(messages[0].content).toContain('不得將同號的其他廟本混為一談');
    expect(messages[0].content).toContain('不得宣稱為廟方原解');
    for (const value of [editionId, editionLabel, editionVersionTag, '廟本名稱', '來源說明', 'https://example.org/source', 'stick-confirmation', '月老第1籤／另一廟本／舊版', '本次原文']) {
      expect(messages[1].content).toContain(value);
    }
  });

  it('sends the reading request to DeepSeek and returns the interpretation', async () => {
    process.env.DEEPSEEK_API_KEY = 'ds-key';
    const calls = mockUpstream(() => chatReply('【一句結論】順勢而為'));

    const res = await (interpret as FetchHandler).fetch(post('/api/interpret', { godName: '文昌帝君', question: '考試順利嗎', poemNumber: 3 }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ interpretation: '【一句結論】順勢而為' });

    expect(calls[0].url).toBe('https://api.deepseek.com/chat/completions');
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer ds-key');
    const body = JSON.parse(String(calls[0].init.body));
    expect(body).toMatchObject({ model: 'deepseek-flash', thinking: { type: 'disabled' }, max_tokens: 800 });
    expect(body.messages[1].content).toContain('考試順利嗎');
  });

  it('passes chat messages through and keeps the friendly fallback reply', async () => {
    process.env.DEEPSEEK_API_KEY = 'ds-key';
    mockUpstream(() => chatReply(''));
    const res = await (chat as FetchHandler).fetch(post('/api/chat', { messages: [{ role: 'user', content: '再說明' }] }));
    expect(await res.json()).toEqual({ reply: '抱歉，我暫時無法給出回應。' });
  });

  it('maps an upstream error to 502 and a timeout to 504', async () => {
    process.env.DEEPSEEK_API_KEY = 'ds-key';
    mockUpstream(() => new Response('bad key', { status: 401 }));
    expect((await (interpret as FetchHandler).fetch(post('/api/interpret', {}))).status).toBe(502);

    mockUpstream(() => Promise.reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    expect((await (chat as FetchHandler).fetch(post('/api/chat', { messages: [{ role: 'user', content: 'x' }] }))).status).toBe(504);
  });
});

describe('/api/transcribe', () => {
  const audio = Buffer.from('fake audio bytes').toString('base64');

  it('sends an ISO-639-1 language to gpt-transcribe and accepts codec-tagged webm', async () => {
    process.env.TRANSCRIPTION_API_KEY = 'tr-key';
    process.env.DEEPSEEK_API_KEY = 'ds-key';
    const calls = mockUpstream(() => new Response(JSON.stringify({ text: ' 請問考試 ', languages: [{ code: 'zh' }] }), { status: 200 }));

    const res = await (transcribe as FetchHandler).fetch(post('/api/transcribe', { audioBase64: audio, mimeType: 'audio/webm;codecs=opus', language: 'zh-TW' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ text: '請問考試', language: 'zh' });

    expect(calls[0].url).toBe('https://api.openai.com/v1/audio/transcriptions');
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer tr-key');
    const form = calls[0].init.body as FormData;
    expect(form.get('model')).toBe('gpt-transcribe');
    expect(form.getAll('languages[]')).toEqual(['zh']);
    expect(form.get('language')).toBeNull();
    expect((form.get('file') as File).name).toBe('question.webm');
  });

  it('uses a single language field for whisper-style models', async () => {
    process.env.OPENAI_API_KEY = 'oa-key';
    process.env.TRANSCRIPTION_MODEL = 'whisper-1';
    const calls = mockUpstream(() => new Response(JSON.stringify({ text: '你好' }), { status: 200 }));
    await (transcribe as FetchHandler).fetch(post('/api/transcribe', { audioBase64: audio, mimeType: 'audio/ogg', language: 'zh-TW' }));

    const form = calls[0].init.body as FormData;
    expect(form.get('language')).toBe('zh');
    expect(form.getAll('languages[]')).toEqual([]);
  });

  it('does not treat a DeepSeek key as a transcription key', async () => {
    process.env.DEEPSEEK_API_KEY = 'ds-key';
    const res = await (transcribe as FetchHandler).fetch(post('/api/transcribe', { audioBase64: audio, mimeType: 'audio/webm' }));
    expect(res.status).toBe(503);
  });

  it('normalises language and mime type values', () => {
    expect(toIsoLanguage('zh-TW')).toBe('zh');
    expect(toIsoLanguage(undefined)).toBe('zh');
    expect(baseMimeType('audio/webm;codecs=opus')).toBe('audio/webm');
    expect(baseMimeType(' Audio/MP4 ')).toBe('audio/mp4');
  });
});
