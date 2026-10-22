import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import type { ThemeColors } from '@/constants/themes';
import { transcribeVoiceQuestion, VoiceTranscriptionError } from '@/services/voiceTranscription';

type VoiceState = 'idle' | 'recording' | 'transcribing';

interface VoiceQuestionInputProps {
  theme: ThemeColors;
  disabled?: boolean;
  onTranscript: (text: string) => void;
}

async function toBase64(uri: string): Promise<string> {
  if (Platform.OS !== 'web') {
    return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  }

  const blob = await (await fetch(uri)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') return reject(new Error('Could not read audio.'));
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(new Error('Could not read audio.'));
    reader.readAsDataURL(blob);
  });
}

export function VoiceQuestionInput({ theme, disabled, onTranscript }: VoiceQuestionInputProps) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [state, setState] = useState<VoiceState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const styles = createStyles(theme);

  const startRecording = async () => {
    try {
      setMessage(null);
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setMessage('請允許麥克風權限後再試一次。');
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
    try {
      setState('transcribing');
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error('No recording was created.');

      const audioBase64 = await toBase64(uri);
      if (Platform.OS !== 'web') {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      const result = await transcribeVoiceQuestion(
        audioBase64,
        Platform.OS === 'web' ? 'audio/webm' : 'audio/mp4'
      );
      if (!result.text) throw new Error('No speech recognized.');
      onTranscript(result.text);
      setMessage('已轉成文字，可再自行修改。');
    } catch (error) {
      if (error instanceof VoiceTranscriptionError && error.message.includes('not configured')) {
        setMessage('語音服務尚未啟用，請先完成 Whisper 伺服器設定。');
      } else {
        setMessage('語音辨識失敗，請再試一次。');
      }
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
        accessibilityHint="錄音只會送到您設定的 Whisper 伺服器進行一次辨識"
      >
        <Text style={styles.buttonText}>{isRecording ? '■ ' : '🎙 '}{label}</Text>
      </TouchableOpacity>
      <Text style={styles.privacyText}>
        {isRecording ? '正在錄音；再按一次即可辨識。' : '短句語音辨識，不保留錄音檔。'}
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
