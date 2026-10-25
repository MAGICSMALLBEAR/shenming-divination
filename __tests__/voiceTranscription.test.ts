import {
  getTranscriptionErrorMessage,
  normalizeAudioMimeType,
  transcribeVoiceQuestion,
  VoiceTranscriptionError,
} from '@/services/voiceTranscription';

describe('voice transcription client', () => {
  const realFetch = global.fetch;
  afterEach(() => { global.fetch = realFetch; });

  it('shows Chinese for every server failure, never the English log text', () => {
    const english = (code: string) => new VoiceTranscriptionError('Voice transcription failed. Please try again.', code);
    expect(getTranscriptionErrorMessage(english('HTTP_503'))).toBe('語音服務尚未啟用，請改用文字輸入。');
    expect(getTranscriptionErrorMessage(english('HTTP_504'))).toBe('語音服務回應逾時，請檢查網路後再試一次。');
    for (const code of ['HTTP_500', 'HTTP_502', 'HTTP_418']) {
      expect(getTranscriptionErrorMessage(english(code))).toBe('語音辨識失敗，請再試一次。');
    }
    expect(getTranscriptionErrorMessage(new Error('boom'))).toBe('語音辨識失敗，請再試一次。');
  });

  it('keeps the client-side Chinese messages for network, timeout and size errors', () => {
    const network = new VoiceTranscriptionError('無法連線至語音服務，請檢查網路後再試一次。', 'NETWORK_ERROR');
    expect(getTranscriptionErrorMessage(network)).toBe(network.message);
  });

  it('reports the real browser recording type', () => {
    expect(normalizeAudioMimeType('audio/webm;codecs=opus', 'audio/webm')).toBe('audio/webm');
    expect(normalizeAudioMimeType('audio/ogg; codecs=opus', 'audio/webm')).toBe('audio/ogg');
    expect(normalizeAudioMimeType('audio/mp4', 'audio/webm')).toBe('audio/mp4');
    expect(normalizeAudioMimeType('', 'audio/webm')).toBe('audio/webm');
    expect(normalizeAudioMimeType('video/webm', 'audio/webm')).toBe('audio/webm');
  });

  it('turns a server error status into a coded error', async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify({ error: 'Voice transcription failed. Please try again.' }), { status: 502 })) as typeof fetch;
    await expect(transcribeVoiceQuestion('AAAA', 'audio/webm')).rejects.toMatchObject({ code: 'HTTP_502' });
  });
});
