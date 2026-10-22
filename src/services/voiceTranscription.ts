import { Platform } from 'react-native';

export interface VoiceTranscriptionResult {
  text: string;
  language?: string;
}

export class VoiceTranscriptionError extends Error {}

function getTranscriptionUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_TRANSCRIBE_URL;
  if (configuredUrl) return configuredUrl;

  const interpretationUrl = process.env.EXPO_PUBLIC_AI_API_URL;
  if (interpretationUrl) {
    return interpretationUrl.replace('/api/interpret', '/api/transcribe');
  }

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:3001/api/transcribe'
    : 'http://localhost:3001/api/transcribe';
}

export async function transcribeVoiceQuestion(audioBase64: string, mimeType: string): Promise<VoiceTranscriptionResult> {
  const response = await fetch(getTranscriptionUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType, language: 'zh' }),
  });

  const payload = await response.json().catch(() => ({})) as {
    text?: string;
    language?: string;
    error?: string;
  };

  if (!response.ok || !payload.text) {
    throw new VoiceTranscriptionError(payload.error || 'Voice transcription failed.');
  }

  return { text: payload.text.trim(), language: payload.language };
}
