// 測字占卜 — 輸入單一中文字，AI/本地分析字義與吉凶
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { analyzeCharacter } from '@/services/characterDivination';

const API_BASE = 'http://localhost:3001';

interface CharacterResult {
  character: string;
  interpretation: string;
  meaning: string;
  structure: string;
  fortune: '吉' | '中' | '凶';
  fortuneLabel: string;
  advice: string;
  provider: string;
}

function FortuneBadge({ fortune, theme }: { fortune: string; theme: ThemeColors }) {
  const badge = useMemo(() => createBadgeStyles(theme, fortune), [theme, fortune]);
  const bgColor =
    fortune === '吉' ? theme.success :
    fortune === '凶' ? theme.danger :
    theme.warning;
  const label =
    fortune === '吉' ? '吉' :
    fortune === '凶' ? '凶' : '中';
  return (
    <View style={[badge.badge, { backgroundColor: bgColor + '25', borderColor: bgColor }]}>
      <Text style={[badge.text, { color: bgColor }]}>{label}</Text>
    </View>
  );
}

export default function CharacterScreen() {
  const { theme } = useAppTheme();
  const layout = useResponsiveLayout();
  const s = useMemo(() => createStyles(theme), [theme]);

  const [character, setCharacter] = useState('');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<CharacterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isCJKCharacter = (ch: string): boolean => {
    if (!ch || ch.length !== 1) return false;
    const code = ch.codePointAt(0)!;
    return (
      (code >= 0x4E00 && code <= 0x9FFF) ||
      (code >= 0x3400 && code <= 0x4DBF) ||
      (code >= 0x20000 && code <= 0x2A6DF) ||
      (code >= 0xF900 && code <= 0xFAFF)
    );
  };

  const handleSubmit = async () => {
    if (!character.trim() || !isCJKCharacter(character.trim())) {
      setError('請輸入一個中文字（例如：福、安、龍）');
      return;
    }
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/character`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: character.trim(),
          question: question.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `伺服器錯誤 (${res.status})`);
      }

      const data = (await res.json()) as CharacterResult;
      setResult(data);
    } catch {
      // 後端不可用時，改用本地規則分析
      const ch = character.trim();
      const localResult = analyzeCharacter(ch, question.trim() || undefined);
      setResult({
        character: ch,
        interpretation: [
          '【字義解析】',
          localResult.meaning,
          '',
          '【字形結構】',
          localResult.structure,
          '',
          '【吉凶判斷】',
          localResult.fortuneLabel,
          '',
          '【建議】',
          localResult.advice,
          '',
          '(此為本地分析結果，連線 AI 可獲得更詳細的解讀)',
        ].join('\n'),
        meaning: localResult.meaning,
        structure: localResult.structure,
        fortune: localResult.fortune,
        fortuneLabel: localResult.fortuneLabel,
        advice: localResult.advice,
        provider: 'local',
      });
    } finally {
      setLoading(false);
    }
  };

  const maxWidth = layout.isDesktop ? 700 : 600;

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
          <Text style={s.title}>測字占卜</Text>
          <Text style={s.subtitle}>以字形斷吉凶，以字義解疑惑</Text>

          {/* 輸入區 */}
          <View style={s.inputCard}>
            <Text style={s.inputLabel}>請輸入一個中文字</Text>
            <TextInput
              style={s.charInput}
              value={character}
              onChangeText={(t) => {
                setCharacter(t.slice(0, 1));
                setError('');
                setResult(null);
              }}
              placeholder="字"
              placeholderTextColor={theme.textMuted}
              maxLength={1}
              autoFocus
            />
            <Text style={s.inputHint}>輸入一個你想問的中文字，例如：福、安、龍、變</Text>

            <Text style={[s.inputLabel, { marginTop: TempleSpacing.md }]}>想問的事情（選填）</Text>
            <TextInput
              style={s.questionInput}
              value={question}
              onChangeText={setQuestion}
              placeholder="例如：最近的工作運勢如何？"
              placeholderTextColor={theme.textMuted}
              maxLength={200}
              multiline
            />

            {error ? <Text style={s.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[s.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={theme.bgDark} size="small" />
              ) : (
                <Text style={s.submitText}>開始測字</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 結果區 */}
          {result && (
            <View style={s.resultCard}>
              {/* 大字顯示 */}
              <View style={s.charDisplay}>
                <Text style={s.charLarge}>{result.character}</Text>
              </View>

              {/* 吉凶標籤 */}
              <View style={s.fortuneRow}>
                <FortuneBadge fortune={result.fortune} theme={theme} />
                <Text style={s.providerTag}>
                  {result.provider === 'local' ? '本地分析' : result.provider === 'fallback' ? '基礎分析' : 'AI 分析'}
                </Text>
              </View>

              {/* 字義解析 */}
              {result.meaning ? (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>字義解析</Text>
                  <Text style={s.sectionText}>{result.meaning}</Text>
                </View>
              ) : null}

              {/* 字形結構 */}
              {result.structure ? (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>字形結構</Text>
                  <Text style={s.sectionText}>{result.structure}</Text>
                </View>
              ) : null}

              {/* 建議 */}
              {result.advice ? (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>建議</Text>
                  <Text style={s.sectionText}>{result.advice}</Text>
                </View>
              ) : null}

              {/* AI 完整解讀（如果有且不同於摘要） */}
              {result.interpretation && result.provider !== 'local' ? (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>完整解讀</Text>
                  <Text style={s.interpretationText}>{result.interpretation}</Text>
                </View>
              ) : null}
            </View>
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
      alignItems: 'center',
    },
    inputLabel: {
      fontSize: TempleFonts.body,
      fontWeight: '600',
      color: theme.textLight,
      marginBottom: TempleSpacing.sm,
      alignSelf: 'flex-start',
    },
    charInput: {
      width: 120,
      height: 120,
      backgroundColor: theme.bgMedium,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.gold + '60',
      color: theme.textGold,
      fontSize: 48,
      fontWeight: 'bold',
      textAlign: 'center',
      textAlignVertical: 'center',
      marginVertical: TempleSpacing.sm,
    },
    inputHint: {
      fontSize: TempleFonts.caption,
      color: theme.textMuted,
      textAlign: 'center',
      marginTop: 4,
    },
    questionInput: {
      width: '100%',
      backgroundColor: theme.bgMedium,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.gold + '25',
      color: theme.textLight,
      fontSize: TempleFonts.body,
      padding: TempleSpacing.md,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: TempleSpacing.md,
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
      alignItems: 'center',
    },
    charDisplay: {
      width: 100,
      height: 100,
      backgroundColor: theme.bgMedium,
      borderRadius: 50,
      borderWidth: 2,
      borderColor: theme.gold + '50',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: TempleSpacing.md,
    },
    charLarge: {
      fontSize: 42,
      fontWeight: 'bold',
      color: theme.textGold,
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
      width: '100%',
      marginBottom: TempleSpacing.md,
    },
    sectionTitle: {
      fontSize: TempleFonts.heading,
      fontWeight: 'bold',
      color: theme.textGold,
      marginBottom: TempleSpacing.xs,
    },
    sectionText: {
      fontSize: TempleFonts.body,
      color: theme.textLight,
      lineHeight: TempleFonts.body * 1.6,
    },
    interpretationText: {
      fontSize: TempleFonts.body,
      color: theme.textLight,
      lineHeight: TempleFonts.body * 1.7,
      backgroundColor: theme.bgMedium,
      borderRadius: 10,
      padding: TempleSpacing.md,
    },
  });
}

function createBadgeStyles(theme: ThemeColors, _fortune: string) {
  return StyleSheet.create({
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
}
