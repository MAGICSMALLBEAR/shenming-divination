// Vercel Serverless Function
// POST /api/transcribe
// DeepSeek has no speech-to-text API, so transcription uses its own provider:
//   TRANSCRIPTION_API_KEY (or OPENAI_API_KEY), optional TRANSCRIPTION_API_BASE_URL
//   and TRANSCRIPTION_MODEL (default gpt-transcribe; whisper-style models also work).

// Base64 is sent inside JSON through a Vercel Function (4.5 MB request limit).
const MAX_AUDIO_BYTES = 3 * 1024 * 1024;
const TRANSCRIPTION_TIMEOUT_MS = 25_000;

const MIME_EXTENSIONS = {
  'audio/mp4': 'question.m4a',
  'audio/m4a': 'question.m4a',
  'audio/x-m4a': 'question.m4a',
  'audio/wav': 'question.wav',
  'audio/x-wav': 'question.wav',
  'audio/webm': 'question.webm',
  'audio/ogg': 'question.ogg',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** ISO-639-1 code the transcription API expects, e.g. 'zh-TW' → 'zh'. */
export function toIsoLanguage(language) {
  return String(language || 'zh').slice(0, 2).toLowerCase();
}

/** Strips codec parameters: 'audio/webm;codecs=opus' → 'audio/webm'. */
export function baseMimeType(mimeType) {
  return String(mimeType || '').split(';')[0].trim().toLowerCase();
}

async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = process.env.TRANSCRIPTION_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: 'Voice transcription is not configured on this server.' }, 503);

  try {
    const { audioBase64, mimeType: rawMimeType, language = 'zh-TW' } = await req.json();
    const mimeType = baseMimeType(rawMimeType);
    const filename = MIME_EXTENSIONS[mimeType];
    if (!audioBase64 || !filename) {
      return json({ error: 'Provide an audio file in a supported format.' }, 400);
    }

    const audio = Buffer.from(audioBase64, 'base64');
    if (!audio.length || audio.length > MAX_AUDIO_BYTES) {
      return json({ error: 'Audio must be between 1 byte and 3 MB.' }, 413);
    }

    const form = new FormData();
    const model = process.env.TRANSCRIPTION_MODEL || 'gpt-transcribe';
    form.append('file', new Blob([audio], { type: mimeType }), filename);
    form.append('model', model);
    // gpt-transcribe takes a `languages` array, older models a single `language`;
    // both expect ISO-639-1 codes, so a region tag like zh-TW is reduced to zh.
    if (model === 'gpt-transcribe') form.append('languages[]', toIsoLanguage(language));
    else form.append('language', toIsoLanguage(language));
    form.append('prompt', '這是一段台灣民間信仰與神明占卜相關的繁體中文提問。請依原意轉寫。');
    form.append('response_format', 'json');

    const baseUrl = (process.env.TRANSCRIPTION_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TRANSCRIPTION_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(`${baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.text?.trim()) {
      console.error('Transcription API error:', response.status, payload);
      return json({ error: 'Voice transcription failed. Please try again.' }, 502);
    }

    return json({ text: payload.text.trim(), language: payload.languages?.[0]?.code || payload.language || language });
  } catch (error) {
    console.error('Transcription error:', error);
    return json(
      { error: error?.name === 'AbortError' ? 'Voice transcription timed out. Please try again.' : 'Voice transcription failed. Please try again.' },
      error?.name === 'AbortError' ? 504 : 500,
    );
  }
}

// Web-standard export: see the note at the end of api/interpret.js.
export default { fetch: handler };
