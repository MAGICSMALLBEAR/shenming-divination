// 解夢占卜 — 輸入夢境描述，AI/本地分析夢境象徵與吉凶
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFadeIn } from '@/hooks/useEntranceAnimation';
import { useI18n } from '@/hooks/useI18n';
import type { ThemeColors } from '@/constants/themes';
import { analyzeDream, DreamResult } from '@/services/dreamAnalysis';

const API_BASE = 'http://localhost:3001';

const EMOJI_QUICK_SELECT = [
  { emoji: '😨', label: '害怕' },
  { emoji: '😢', label: '悲傷' },
  { emoji: '😊', label: '開心' },
  { emoji: '😡', label: '生氣' },
  { emoji: '🤔', label: '困惑' },
];

function FortuneBadge({ fortune, theme }: { fortune: string; theme: ThemeColors }) {
  const bgColor =
    fortune === '吉' ? theme.success :
    fortune === '凶' ? theme.danger :
    theme.warning;
  const label = fortune;
  return (
    <View style={[fortuneBadgeStyles.badge, { backgroundColor: bgColor + '25', borderColor: bgColor }]}>
      <Text style={[fortuneBadgeStyles.text, { color: bgColor }]} accessibilityLabel={`運勢：${label}`}>{label}</Text>
    </View>
  );
}

const fortuneBadgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
  },
  text: {
    fontSize: TempleFonts.heading,
    fontWeight: 'bold',
  },
});

export default function DreamScreen() {
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const layout = useResponsiveLayout();
  const s = useMemo(() => createStyles(theme), [theme]);

  const [dream, setDream] = useState('');
  const [feeling, setFeeling] = useState('');
  const [result, setResult] = useState<DreamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('');

  const handleSubmit = async () => {
    if (!dream.trim()) {
      setError(t('dreamErrorEmpty'));
      return;
    }
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setResult(null);
    setProvider('');

    try {
      const res = await fetch(`${API_BASE}/api/dream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dream: dream.trim(),
          feeling: feeling.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `伺服器錯誤 (${res.status})`);
      }

      const data = await res.json();

      if (data.fallback) {
        // 後端無 AI → 使用本地分析
        const localResult = analyzeDream(dream.trim(), feeling.trim() || undefined);
        setResult(localResult);
        setProvider('local');
      } else {
        setResult({
          symbols: data.symbols || [],
          interpretation: data.interpretation || '',
          fortune: data.fortune || '中',
          advice: data.advice || '',
        });
        setProvider(data.provider || 'ai');
      }
    } catch {
      // 後端不可用 → 本地分析
      const localResult = analyzeDream(dream.trim(), feeling.trim() || undefined);
      setResult(localResult);
      setProvider('local');
    } finally {
      setLoading(false);
    }
  };

  const maxWidth = layout.isDesktop ? 700 : 600;
  const fadeIn = useFadeIn({ delay: 0 });

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[s.scroll, { maxWidth, alignSelf: 'center' as any, width: '100%' as any }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* 頁面標題 */}
          <Text style={s.title}>{t('dreamPageTitle')}</Text>
          <Text style={s.subtitle}>{t('dreamSubtitle')}</Text>

          {/* 輸入區 */}
          <View style={s.inputCard}>
            <Text style={s.inputLabel}>{t('dreamLabelDream')}</Text>
            <TextInput
              style={s.dreamInput}
              value={dream}
              onChangeText={(txt) => {
                setDream(txt);
                setError('');
                setResult(null);
              }}
              placeholder={t('dreamPlaceholderDream')}
              placeholderTextColor={theme.textMuted}
              multiline
              textAlignVertical="top"
              accessibilityLabel="夢境描述輸入框"
            />

            <Text style={[s.inputLabel, { marginTop: TempleSpacing.md }]}>{t('dreamLabelFeeling')}</Text>
            <TextInput
              style={s.feelingInput}
              value={feeling}
              onChangeText={setFeeling}
              placeholder={t('dreamPlaceholderFeeling')}
              placeholderTextColor={theme.textMuted}
              accessibilityLabel="夢中感受輸入框"
            />

            {/* 情緒快捷選擇 */}
            <View style={s.emojiRow}>
              {EMOJI_QUICK_SELECT.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    s.emojiChip,
                    feeling === item.label && { backgroundColor: theme.gold + '30', borderColor: theme.gold },
                  ]}
                  onPress={() => {
                    setFeeling(feeling === item.label ? '' : item.label);
                    setResult(null);
                  }}
                  activeOpacity={0.7}
                  accessibilityLabel={`感受：${item.label}`}
                >
                  <Text style={s.emojiText}>{item.emoji}</Text>
                  <Text style={[s.emojiLabel, feeling === item.label && { color: theme.textGold }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {error ? <Text style={s.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[s.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.7}
              accessibilityLabel={t('dreamButtonSubmit')}
            >
              {loading ? (
                <ActivityIndicator color={theme.bgDark} size="small" />
              ) : (
                <Text style={s.submitText}>{t('dreamButtonSubmit')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 結果區 */}
          {result && (
            <Animated.View style={[s.resultCard, { opacity: fadeIn.opacity, transform: [{ translateY: fadeIn.translateY }] }]}>
              {/* 吉凶標籤 + 來源 */}
              <View style={s.fortuneRow}>
                <FortuneBadge fortune={result.fortune} theme={theme} />
                <Text style={s.providerTag}>
                  {provider === 'local' ? '本地分析' : provider === 'fallback' ? '基礎分析' : 'AI 分析'}
                </Text>
              </View>

              {/* 關鍵符號 */}
              {result.symbols && result.symbols.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>關鍵符號</Text>
                  <View style={s.symbolRow}>
                    {result.symbols.map((sym, i) => (
                      <View
                        key={i}
                        style={[
                          s.symbolChip,
                          { backgroundColor: theme.gold + '20', borderColor: theme.gold + '50' },
                        ]}
                      >
                        <Text style={[s.symbolChipText, { color: theme.textGold }]}>{sym}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 夢境解析 */}
              {result.interpretation ? (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>夢境解析</Text>
                  <Text style={s.interpretationText}>{result.interpretation}</Text>
                </View>
              ) : null}

              {/* 建議 */}
              {result.advice ? (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>溫馨建議</Text>
                  <Text style={s.adviceText}>{result.advice}</Text>
                </View>
              ) : null}
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bgDark },
    scroll: { padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl },

    // 標題
    title: {
      fontSize: TempleFonts.title,
      fontWeight: 'bold',
      color: theme.textGold,
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: TempleFonts.small,
      color: theme.textMuted,
      textAlign: 'center',
      marginBottom: TempleSpacing.lg,
    },

    // 輸入區
    inputCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '30',
      padding: TempleSpacing.lg,
      marginBottom: TempleSpacing.lg,
    },
    inputLabel: {
      fontSize: TempleFonts.body,
      fontWeight: '600',
      color: theme.textLight,
      marginBottom: TempleSpacing.sm,
    },
    dreamInput: {
      width: '100%',
      backgroundColor: theme.bgMedium,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.gold + '25',
      color: theme.textLight,
      fontSize: TempleFonts.body,
      padding: TempleSpacing.md,
      minHeight: 140,
      textAlignVertical: 'top',
    },
    feelingInput: {
      width: '100%',
      backgroundColor: theme.bgMedium,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.gold + '25',
      color: theme.textLight,
      fontSize: TempleFonts.body,
      padding: TempleSpacing.md,
      minHeight: 48,
    },
    emojiRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: TempleSpacing.sm,
      marginBottom: TempleSpacing.md,
    },
    emojiChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.gold + '20',
      backgroundColor: theme.bgMedium,
    },
    emojiText: {
      fontSize: 18,
    },
    emojiLabel: {
      fontSize: TempleFonts.small,
      color: theme.textMuted,
    },
    errorText: {
      color: theme.danger,
      fontSize: TempleFonts.small,
      marginBottom: TempleSpacing.sm,
    },
    submitBtn: {
      backgroundColor: theme.gold,
      borderRadius: 25,
      paddingVertical: 14,
      paddingHorizontal: 48,
      marginTop: TempleSpacing.sm,
      minWidth: 180,
      alignItems: 'center',
    },
    submitText: {
      color: theme.bgDark,
      fontSize: TempleFonts.body,
      fontWeight: 'bold',
    },

    // 結果區
    resultCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '40',
      padding: TempleSpacing.lg,
      marginBottom: TempleSpacing.lg,
    },
    fortuneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: TempleSpacing.lg,
    },
    providerTag: {
      fontSize: TempleFonts.caption,
      color: theme.textMuted,
    },
    section: {
      marginBottom: TempleSpacing.md,
    },
    sectionTitle: {
      fontSize: TempleFonts.heading,
      fontWeight: 'bold',
      color: theme.textGold,
      marginBottom: TempleSpacing.xs,
    },
    symbolRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    symbolChip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
    },
    symbolChipText: {
      fontSize: TempleFonts.small,
      fontWeight: '600',
    },
    interpretationText: {
      fontSize: TempleFonts.body,
      color: theme.textLight,
      lineHeight: TempleFonts.body * 1.7,
      backgroundColor: theme.bgMedium,
      borderRadius: 10,
      padding: TempleSpacing.md,
    },
    adviceText: {
      fontSize: TempleFonts.body,
      color: theme.textLight,
      lineHeight: TempleFonts.body * 1.6,
      backgroundColor: theme.bgMedium,
      borderRadius: 10,
      padding: TempleSpacing.md,
      borderLeftWidth: 3,
      borderLeftColor: theme.gold,
    },
  });
}
