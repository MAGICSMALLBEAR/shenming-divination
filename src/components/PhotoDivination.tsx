// 拍照解籤元件
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { pickAndIdentifyPoem, type MatchedPoem, type VisionResult } from '@/services/photoDivination';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUsePoem?: (matchedPoem: MatchedPoem) => void;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

export function PhotoDivination({ visible, onClose, onUsePoem }: Props) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [status, setStatus] = useState<Status>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const [matchedPoem, setMatchedPoem] = useState<MatchedPoem | null>(null);

  const reset = () => {
    setStatus('idle');
    setImageUri(null);
    setVisionResult(null);
    setMatchedPoem(null);
  };

  const handlePick = async (source: 'camera' | 'library') => {
    setStatus('loading');
    setImageUri(null);
    setVisionResult(null);
    setMatchedPoem(null);

    const result = await pickAndIdentifyPoem(source);
    setImageUri(result.imageUri);
    setVisionResult(result.visionResult);
    setMatchedPoem(result.matchedPoem);
    setStatus(result.visionResult.success ? 'done' : 'error');
  };

  const confidenceLabel: Record<string, string> = {
    high: '辨識信心：高',
    medium: '辨識信心：中（建議確認）',
    low: '辨識信心：低（請手動核對）',
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>拍照解籤</Text>
          <Text style={styles.subtitle}>拍攝實體籤詩，自動辨識籤號並查詢籤義</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>關閉</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {status === 'idle' && (
            <View style={styles.actionGroup}>
              <Text style={styles.hint}>請選擇要辨識的籤詩圖片</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => handlePick('camera')}>
                <Text style={styles.primaryBtnText}>拍攝籤詩</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => handlePick('library')}>
                <Text style={styles.secondaryBtnText}>從相簿選取</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'loading' && (
            <View style={styles.loadingGroup}>
              <ActivityIndicator size="large" color={theme.gold} />
              <Text style={styles.loadingText}>AI 正在辨識籤詩中...</Text>
              <Text style={styles.loadingHint}>約需 5~15 秒</Text>
            </View>
          )}

          {(status === 'done' || status === 'error') && (
            <View>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="contain" />
              ) : null}

              {status === 'error' || !visionResult?.success ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>辨識失敗</Text>
                  <Text style={styles.errorText}>
                    {visionResult?.error ?? '無法辨識此圖片，請確認圖片清晰且包含完整籤詩。'}
                  </Text>
                  {visionResult?.notes ? (
                    <Text style={styles.notesText}>{visionResult.notes}</Text>
                  ) : null}
                </View>
              ) : (
                <View style={styles.resultCard}>
                  <Text style={styles.resultTitle}>辨識結果</Text>

                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>籤號</Text>
                    <Text style={styles.resultValue}>
                      {visionResult.poemNumber ? `第 ${visionResult.poemNumber} 籤` : '未辨識'}
                    </Text>
                  </View>

                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>籤系統</Text>
                    <Text style={styles.resultValue}>{visionResult.poemSystem ?? '未辨識'}</Text>
                  </View>

                  {visionResult.poemLevel ? (
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>籤等</Text>
                      <Text style={[styles.resultValue, styles.levelText]}>{visionResult.poemLevel}</Text>
                    </View>
                  ) : null}

                  {visionResult.poemTextHint ? (
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>籤文線索</Text>
                      <Text style={styles.resultValue}>{visionResult.poemTextHint}</Text>
                    </View>
                  ) : null}

                  <Text style={styles.confidence}>
                    {confidenceLabel[visionResult.confidence ?? 'medium'] ?? confidenceLabel.medium}
                  </Text>

                  {visionResult.notes ? (
                    <Text style={styles.notesText}>{visionResult.notes}</Text>
                  ) : null}
                </View>
              )}

              {matchedPoem ? (
                <View style={styles.matchCard}>
                  <Text style={styles.matchTitle}>找到對應籤詩</Text>
                  <Text style={styles.matchGod}>{matchedPoem.godName} · {matchedPoem.poemSystem}</Text>
                  <Text style={styles.matchNumber}>第 {matchedPoem.poem.number} 籤 · {matchedPoem.poem.level}</Text>
                  <Text style={styles.matchContent} numberOfLines={4}>{matchedPoem.poem.content}</Text>
                  <Text style={styles.matchMeaning} numberOfLines={3}>{matchedPoem.poem.vernacular}</Text>

                  {onUsePoem ? (
                    <TouchableOpacity
                      style={styles.usePoemBtn}
                      onPress={() => {
                        onUsePoem(matchedPoem);
                        onClose();
                      }}
                    >
                      <Text style={styles.usePoemBtnText}>使用此籤繼續解籤</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : visionResult?.success && visionResult.poemNumber ? (
                <View style={styles.noMatchCard}>
                  <Text style={styles.noMatchText}>
                    辨識到籤號，但在資料庫中找不到完全符合的籤詩。
                    請確認籤系統是否正確，或嘗試手動查詢第 {visionResult.poemNumber} 籤。
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity style={styles.retryBtn} onPress={reset}>
                <Text style={styles.retryBtnText}>重新辨識</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bgDark,
  },
  header: {
    padding: TempleSpacing.lg,
    paddingTop: TempleSpacing.xl ?? 32,
    borderBottomWidth: 1,
    borderBottomColor: theme.goldDark + '28',
    position: 'relative',
  },
  title: {
    color: theme.goldLight,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: TempleSpacing.xl ?? 32,
    right: TempleSpacing.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.goldDark + '50',
  },
  closeBtnText: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  body: { flex: 1 },
  bodyContent: {
    padding: TempleSpacing.lg,
    paddingBottom: 60,
  },
  hint: {
    color: theme.textMuted,
    fontSize: TempleFonts.body,
    textAlign: 'center',
    marginBottom: TempleSpacing.md,
    lineHeight: 22,
  },
  actionGroup: {
    gap: TempleSpacing.sm,
    alignItems: 'stretch',
    paddingTop: TempleSpacing.xl ?? 32,
  },
  primaryBtn: {
    backgroundColor: theme.red,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: theme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '900',
    letterSpacing: 2,
  },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.goldDark + '50',
  },
  secondaryBtnText: {
    color: theme.textLight,
    fontSize: TempleFonts.body,
    fontWeight: '700',
  },
  loadingGroup: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
  },
  loadingText: {
    color: theme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '700',
  },
  loadingHint: {
    color: theme.textMuted,
    fontSize: 13,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: TempleSpacing.md,
    backgroundColor: theme.bgCard,
  },
  errorCard: {
    backgroundColor: '#3B1212',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8B2020',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  errorTitle: {
    color: '#FF6B6B',
    fontSize: TempleFonts.heading,
    fontWeight: '900',
    marginBottom: 8,
  },
  errorText: {
    color: theme.textLight,
    fontSize: TempleFonts.small,
    lineHeight: 22,
  },
  notesText: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  resultCard: {
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.goldDark + '40',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  resultTitle: {
    color: theme.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: TempleSpacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.goldDark + '18',
  },
  resultLabel: {
    color: theme.textMuted,
    fontSize: TempleFonts.small,
  },
  resultValue: {
    color: theme.goldLight,
    fontSize: TempleFonts.small,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  levelText: {
    color: theme.gold,
  },
  confidence: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: TempleSpacing.sm,
    fontStyle: 'italic',
  },
  matchCard: {
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.gold + '55',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  matchTitle: {
    color: theme.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  matchGod: {
    color: theme.goldLight,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    marginBottom: 4,
  },
  matchNumber: {
    color: theme.gold,
    fontSize: TempleFonts.heading,
    fontWeight: '900',
    marginBottom: TempleSpacing.sm,
  },
  matchContent: {
    color: theme.textLight,
    fontSize: TempleFonts.small,
    lineHeight: 22,
    marginBottom: 8,
  },
  matchMeaning: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: TempleSpacing.md,
  },
  usePoemBtn: {
    backgroundColor: theme.red,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  usePoemBtnText: {
    color: theme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '900',
    letterSpacing: 1,
  },
  noMatchCard: {
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  noMatchText: {
    color: theme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 22,
  },
  retryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.goldDark + '50',
    marginTop: 8,
  },
  retryBtnText: {
    color: theme.textLight,
    fontSize: TempleFonts.body,
    fontWeight: '700',
  },
  });
}
