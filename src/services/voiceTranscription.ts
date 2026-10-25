import { Platform } from 'react-native';

export interface VoiceTranscriptionResult {
  text: string;
  language?: string;
}

export class VoiceTranscriptionError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'VoiceTranscriptionError';
  }
}

const TRANSCRIPTION_MESSAGES: Record<string, string> = {
  HTTP_400: '錄音格式無法辨識，請再試一次。',
  HTTP_401: '語音服務驗證失敗，請聯絡管理員檢查服務設定。',
  HTTP_413: '錄音檔太長，請以較短的句子再試一次。',
  HTTP_429: '語音服務暫時忙碌，請稍候再試一次。',
  HTTP_503: '語音服務尚未啟用，請改用文字輸入。',
  HTTP_504: '語音服務回應逾時，請檢查網路後再試一次。',
};

/**
 * Message shown to the user for a failed transcription. Server errors carry
 * English text meant for logs, so anything unmapped falls back to Chinese.
 */
export function getTranscriptionErrorMessage(error: unknown): string {
  if (error instanceof VoiceTranscriptionError) {
    if (error.code && TRANSCRIPTION_MESSAGES[error.code]) return TRANSCRIPTION_MESSAGES[error.code];
    if (error.code && !error.code.startsWith('HTTP_')) return error.message;
  }
  return '語音辨識失敗，請再試一次。';
}

/** 'audio/webm;codecs=opus' → 'audio/webm'; empty or unknown types fall back per platform. */
export function normalizeAudioMimeType(mimeType: string | undefined, fallback: string): string {
  const base = (mimeType || '').split(';')[0].trim().toLowerCase();
  return base.startsWith('audio/') ? base : fallback;
}

// Vercel functions accept a 4.5 MB request body. Base64 expands audio by about 33%,
// so keep the original recording under 3 MB before serialising it as JSON.
const MAX_AUDIO_BASE64_CHARS = 4 * 1024 * 1024;
const TRANSCRIPTION_TIMEOUT_MS = 35_000;

function resolveTranscriptionUrl(url: string): string {
  if (Platform.OS === 'web' || /^https?:\/\//i.test(url)) return url;
  // Native fetch has no page origin, so a relative Vercel route must become absolute.
  const siteUrl = process.env.EXPO_PUBLIC_SITE_URL || 'https://shenming-divination.vercel.app';
  return new URL(url, siteUrl).toString();
}

function getTranscriptionUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_TRANSCRIBE_URL;
  if (configuredUrl) return resolveTranscriptionUrl(configuredUrl);

  const interpretationUrl = process.env.EXPO_PUBLIC_AI_API_URL;
  if (interpretationUrl) {
    return resolveTranscriptionUrl(interpretationUrl.replace('/api/interpret', '/api/transcribe'));
  }

  // A released native app cannot reach the user's own localhost. Local native
  // development can still set EXPO_PUBLIC_TRANSCRIBE_URL explicitly.
  if (Platform.OS !== 'web') return resolveTranscriptionUrl('/api/transcribe');
  return 'http://localhost:3001/api/transcribe';
}

export async function transcribeVoiceQuestion(audioBase64: string, mimeType: string): Promise<VoiceTranscriptionResult> {
  if (!audioBase64 || audioBase64.length > MAX_AUDIO_BASE64_CHARS) {
    throw new VoiceTranscriptionError('錄音檔太長，請以較短的句子再試一次。', 'AUDIO_TOO_LARGE');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TRANSCRIPTION_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(getTranscriptionUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType, language: 'zh-TW' }),
      signal: controller.signal,
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    throw new VoiceTranscriptionError(
      isTimeout ? '語音服務回應逾時，請檢查網路後再試一次。' : '無法連線至語音服務，請檢查網路後再試一次。',
      isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
    );
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.json().catch(() => ({})) as {
    text?: string;
    language?: string;
    error?: string;
  };

  if (!response.ok || !payload.text) {
    throw new VoiceTranscriptionError(payload.error || 'Voice transcription failed.', `HTTP_${response.status}`);
  }

  return { text: payload.text.trim(), language: payload.language };
}
