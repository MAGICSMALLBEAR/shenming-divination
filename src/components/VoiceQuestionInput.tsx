import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import type { ThemeColors } from '@/constants/themes';
import { getTranscriptionErrorMessage, normalizeAudioMimeType, transcribeVoiceQuestion } from '@/services/voiceTranscription';

type VoiceState = 'idle' | 'recording' | 'transcribing';

// Where the voice goes depends on the path: browsers with built-in recognition
// (Chrome, Edge, Safari) hand it to their vendor's speech service; other browsers
// and the app upload one recording to this site's transcription service.
const VOICE_PRIVACY = {
  browser: {
    text: '由瀏覽器內建語音辨識處理（Chrome、Edge、Safari 會交由其語音服務），本站不保留錄音。',
    hint: '語音由瀏覽器內建的語音辨識服務轉成文字',
  },
  upload: {
    text: '錄音會傳送至語音辨識服務轉成文字，完成後不保留錄音檔。',
    hint: '錄音會傳送至語音辨識服務轉成一次文字，不會保留',
  },
};
const subscribeNever = () => () => undefined;

/** The Web Speech API is currently exposed with a vendor prefix in Chromium. */
interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getBrowserSpeechRecognition(): BrowserSpeechRecognitionConstructor | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const browserWindow = window as typeof window & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
}

interface VoiceQuestionInputProps {
  theme: ThemeColors;
  disabled?: boolean;
  onTranscript: (text: string) => void;
}

// Browsers record in different containers (Chrome webm, Firefox ogg, Safari mp4),
// so the web path reports the recording's real type instead of assuming webm.
async function readRecording(uri: string): Promise<{ base64: string; mimeType: string }> {
  if (Platform.OS !== 'web') {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    return { base64, mimeType: 'audio/mp4' };
  }

  const blob = await (await fetch(uri)).blob();
  const mimeType = normalizeAudioMimeType(blob.type, 'audio/webm');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') return reject(new Error('Could not read audio.'));
      resolve({ base64: result.split(',')[1] || '', mimeType });
    };
    reader.onerror = () => reject(new Error('Could not read audio.'));
    reader.readAsDataURL(blob);
  });
}

export function VoiceQuestionInput({ theme, disabled, onTranscript }: VoiceQuestionInputProps) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const browserRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const browserReceivedResultRef = useRef(false);
  const [state, setState] = useState<VoiceState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const styles = createStyles(theme);
  // Static web pages are rendered without `window`; read support on the client only.
  const usesBrowserRecognition = useSyncExternalStore(
    subscribeNever,
    () => getBrowserSpeechRecognition() !== null,
    () => false,
  );
  const privacy = usesBrowserRecognition ? VOICE_PRIVACY.browser : VOICE_PRIVACY.upload;

  useEffect(() => () => {
    const recognition = browserRecognitionRef.current;
    browserRecognitionRef.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    }
  }, []);

  const startBrowserRecognition = () => {
    const SpeechRecognition = getBrowserSpeechRecognition();
    if (!SpeechRecognition) return false;

    const recognition = new SpeechRecognition();
    browserReceivedResultRef.current = false;
    recognition.lang = 'zh-TW';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      browserReceivedResultRef.current = Boolean(transcript);
      browserRecognitionRef.current = null;
      setState('idle');
      if (transcript) {
        onTranscript(transcript);
        setMessage('已將語音轉為文字。');
      } else {
        setMessage('沒有辨識到語音，請靠近麥克風後再試一次。');
      }
    };
    recognition.onerror = (event) => {
      browserRecognitionRef.current = null;
      setState('idle');
      const browserMessages: Record<string, string> = {
        'not-allowed': '請允許瀏覽器使用麥克風後再試一次。',
        'service-not-allowed': '此瀏覽器未允許語音辨識服務，請改用 Chrome 或 Edge。',
        'audio-capture': '找不到可用麥克風，請檢查裝置或藍牙耳機設定。',
        'no-speech': '沒有偵測到語音，請靠近麥克風後再試一次。',
        network: '語音辨識需要網路連線，請檢查網路後再試一次。',
        aborted: '已停止語音辨識。',
      };
      setMessage(browserMessages[event.error] || '語音辨識未完成，請再試一次。');
    };
    recognition.onend = () => {
      if (browserRecognitionRef.current !== recognition) return;
      browserRecognitionRef.current = null;
      setState('idle');
      if (!browserReceivedResultRef.current) {
        setMessage('沒有辨識到語音，請靠近麥克風後再試一次。');
      }
    };

    browserRecognitionRef.current = recognition;
    setState('recording');
    setMessage('請開始說話；再按一次即可結束。');
    try {
      recognition.start();
      return true;
    } catch {
      browserRecognitionRef.current = null;
      setState('idle');
      setMessage('無法啟動語音辨識，請確認瀏覽器麥克風權限。');
      return true;
    }
  };

  const startRecording = async () => {
    try {
      setMessage(null);
      // On the web, native recognition works without a separately deployed Whisper server.
      if (startBrowserRecognition()) return;
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setMessage(permission.canAskAgain
          ? '請允許麥克風權限後再試一次。'
          : '麥克風權限已被封鎖，請到裝置設定中開啟後再試一次。');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setState('recording');
    } catch {
      setMessage('無法開始錄音，請確認麥克風可用。');
    }
  };

  const stopAndTranscribe = async () => {
    const browserRecognition = browserRecognitionRef.current;
    if (browserRecognition) {
      setState('transcribing');
      setMessage('正在完成語音辨識…');
      browserRecognition.stop();
      return;
    }

    try {
      setState('transcribing');
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error('No recording was created.');

      const recording = await readRecording(uri);
      if (Platform.OS !== 'web') {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      const result = await transcribeVoiceQuestion(recording.base64, recording.mimeType);
      if (!result.text) throw new Error('No speech recognized.');
      onTranscript(result.text);
      setMessage('已轉成文字，可再自行修改。');
    } catch (error) {
      setMessage(getTranscriptionErrorMessage(error));
    } finally {
      setState('idle');
      await setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    }
  };

  const isRecording = state === 'recording';
  const isBusy = state === 'transcribing';
  const label = isRecording ? '停止並轉文字' : isBusy ? '語音辨識中…' : '語音輸入';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonRecording, (disabled || isBusy) && styles.buttonDisabled]}
        onPress={isRecording ? stopAndTranscribe : startRecording}
        disabled={disabled || isBusy}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={privacy.hint}
      >
        <Text style={styles.buttonText}>{isRecording ? '■ ' : '🎙 '}{label}</Text>
      </TouchableOpacity>
      <Text style={styles.privacyText}>
        {isRecording ? '正在錄音；再按一次即可辨識。' : privacy.text}
      </Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    container: { gap: 5, marginTop: TempleSpacing.sm },
    button: {
      alignSelf: 'flex-start', backgroundColor: theme.bgCard, borderColor: theme.goldDark + '70',
      borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9,
    },
    buttonRecording: { backgroundColor: theme.danger + '28', borderColor: theme.danger },
    buttonDisabled: { opacity: 0.55 },
    buttonText: { color: theme.goldLight, fontSize: TempleFonts.small, fontWeight: TempleFonts.semibold },
    privacyText: { color: theme.textMuted, fontSize: 11 },
    message: { color: theme.textMuted, fontSize: 11 },
  });
}
