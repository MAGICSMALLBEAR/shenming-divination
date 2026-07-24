// 姓名學（三才五格）分析頁面
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFadeIn } from '@/hooks/useEntranceAnimation';
import { useI18n } from '@/hooks/useI18n';
import { analyzeName, ELEMENT_COLORS, getStrokes, type NameAnalysisResult, type GeResult } from '@/services/nameAnalysis';
import type { ThemeColors } from '@/constants/themes';

const GE_LABELS: Record<string, string> = {
  tianGe: '天格',
  renGe: '人格',
  diGe: '地格',
  waiGe: '外格',
  zongGe: '總格',
};

const GE_ORDER: (keyof Pick<NameAnalysisResult, 'tianGe' | 'renGe' | 'diGe' | 'waiGe' | 'zongGe'>)[] = [
  'tianGe', 'renGe', 'diGe', 'waiGe', 'zongGe',
];

export default function NameAnalysisScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const layout = useResponsiveLayout();
  const s = useMemo(() => createStyles(theme), [theme]);

  const [surname, setSurname] = useState('');
  const [givenName, setGivenName] = useState('');
  const [result, setResult] = useState<NameAnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const surnameStrokes = surname ? [...surname].map((ch) => ({ ch, strokes: getStrokes(ch) })) : [];
  const givenStrokes = givenName ? [...givenName].map((ch) => ({ ch, strokes: getStrokes(ch) })) : [];

  const handleAnalyze = () => {
    setError('');
    if (!surname.trim()) {
      setError(t('nameAnalysisErrorEmptySurname'));
      return;
    }
    if (!givenName.trim()) {
      setError(t('nameAnalysisErrorEmptyGiven'));
      return;
    }

    const hasUnknownInSurname = [...surname].some((ch) => getStrokes(ch) === 0);
    const hasUnknownInGiven = [...givenName].some((ch) => getStrokes(ch) === 0);

    if (hasUnknownInSurname || hasUnknownInGiven) {
      setError(t('nameAnalysisErrorUnknown'));
      return;
    }

    setLoading(true);
    // 短暫延遲讓 loading 狀態可視
    setTimeout(() => {
      const r = analyzeName(surname.trim(), givenName.trim());
      if (!r) {
        setError(t('nameAnalysisErrorFailed'));
      } else {
        setResult(r);
      }
      setLoading(false);
    }, 100);
  };

  const judgmentBadgeColor = useMemo(() => {
    if (!result) return theme.textMuted;
    switch (result.sanCai.judgment) {
      case '大吉': return theme.success;
      case '吉': return theme.gold;
      case '中吉': return theme.warning;
      case '凶': return theme.danger;
      case '大凶': return theme.red;
      default: return theme.textMuted;
    }
  }, [result, theme]);

  const fadeIn = useFadeIn({ delay: 0 });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t('nameAnalysisPageTitle')}</Text>
        <Text style={s.subtitle}>{t('nameAnalysisSubtitle')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { maxWidth: layout.contentMaxWidth, alignSelf: 'center', width: '100%' }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── 輸入區 ── */}
        <View style={s.inputCard}>
          <Text style={s.inputLabel}>{t('nameAnalysisLabelSurname')}</Text>
          <TextInput
            style={s.input}
            value={surname}
            onChangeText={setSurname}
            placeholder={t('nameAnalysisPlaceholderSurname')}
            placeholderTextColor={theme.textMuted}
            maxLength={4}
          />
          {surnameStrokes.length > 0 && (
            <View style={s.strokeHintRow}>
              {surnameStrokes.map((item, i) => (
                <Text key={i} style={s.strokeHint}>
                  {item.ch}（{item.strokes}畫）
                </Text>
              ))}
            </View>
          )}

          <Text style={[s.inputLabel, { marginTop: TempleSpacing.md }]}>{t('nameAnalysisLabelGiven')}</Text>
          <TextInput
            style={s.input}
            value={givenName}
            onChangeText={setGivenName}
            placeholder={t('nameAnalysisPlaceholderGiven')}
            placeholderTextColor={theme.textMuted}
            maxLength={4}
          />
          {givenStrokes.length > 0 && (
            <View style={s.strokeHintRow}>
              {givenStrokes.map((item, i) => (
                <Text key={i} style={s.strokeHint}>
                  {item.ch}（{item.strokes}畫）
                </Text>
              ))}
            </View>
          )}

          {error !== '' && <Text style={s.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[s.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleAnalyze}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.submitText}>{t('nameAnalysisButtonSubmit')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── 結果區 ── */}
        {result && (
          <Animated.View style={[s.resultArea, { opacity: fadeIn.opacity, transform: [{ translateY: fadeIn.translateY }] }]}>
            {/* 三才組合 */}
            <View style={s.sancaiCard}>
              <Text style={s.sancaiTitle}>{t('nameAnalysisSancaiTitle')}</Text>
              <View style={s.sancaiCombo}>
                {[result.tianGe, result.renGe, result.diGe].map((ge, i) => (
                  <View key={i} style={[s.elementTag, { backgroundColor: ELEMENT_COLORS[ge.element] + '30', borderColor: ELEMENT_COLORS[ge.element] }]}>
                    <Text style={[s.elementTagText, { color: ELEMENT_COLORS[ge.element] }]}>{ge.element}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.sancaiCombination}>{result.sanCai.combination}</Text>
              <View style={[s.judgmentBadge, { backgroundColor: judgmentBadgeColor + '25', borderColor: judgmentBadgeColor }]}>
                <Text style={[s.judgmentText, { color: judgmentBadgeColor }]}>{result.sanCai.judgment}</Text>
              </View>
              <Text style={s.sancaiDetail}>{result.sanCai.detail}</Text>
            </View>

            {/* 五格表格 */}
            <View style={s.geTable}>
              <Text style={s.sectionTitle}>{t('nameAnalysisGeTitle')}</Text>
              {GE_ORDER.map((key) => {
                const ge: GeResult = result[key];
                const label = GE_LABELS[key] || key;
                const elColor = ELEMENT_COLORS[ge.element] || theme.gold;
                return (
                  <View key={key} style={s.geRow}>
                    <View style={s.geLabelCol}>
                      <Text style={[s.geLabel, { color: theme.goldLight }]}>{label}</Text>
                      <View style={[s.elementDot, { backgroundColor: elColor }]} />
                    </View>
                    <View style={s.geValueCol}>
                      <Text style={[s.geValue, { color: elColor }]}>{ge.value}</Text>
                      <Text style={[s.geElement, { color: elColor + 'CC' }]}>{ge.element}</Text>
                    </View>
                    <View style={s.geMeaningCol}>
                      <Text style={s.geMeaning}>{ge.meaning}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* 整體評判 */}
            <View style={s.overallCard}>
              <Text style={s.sectionTitle}>{t('nameAnalysisOverallTitle')}</Text>
              <Text style={s.overallText}>{result.overallJudgment}</Text>
            </View>

            {/* 吉數清單 */}
            <View style={s.luckyCard}>
              <Text style={s.sectionTitle}>{t('nameAnalysisLuckyTitle')}</Text>
              <View style={s.luckyRow}>
                {result.luckyStrokes.map((n) => (
                  <View key={n} style={s.luckyBadge}>
                    <Text style={s.luckyText}>{n}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.luckyHint}>
                {t('nameAnalysisLuckyHint')}
              </Text>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bgDark },
    header: {
      paddingHorizontal: TempleSpacing.lg,
      paddingTop: TempleSpacing.md,
      paddingBottom: TempleSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.goldDark + '28',
    },
    backBtn: { marginBottom: TempleSpacing.sm, alignSelf: 'flex-start' },
    backBtnText: { color: theme.gold, fontSize: TempleFonts.small, fontWeight: '600' },
    title: { color: theme.goldLight, fontSize: TempleFonts.heading, fontWeight: '900' },
    subtitle: { color: theme.textMuted, fontSize: TempleFonts.small, marginTop: 4 },
    scroll: { padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl },

    // 輸入區
    inputCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '30',
      padding: TempleSpacing.lg,
      marginBottom: TempleSpacing.lg,
    },
    inputLabel: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '700', marginBottom: 8 },
    input: {
      backgroundColor: theme.bgDark,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.goldDark + '40',
      color: theme.textLight,
      fontSize: TempleFonts.heading,
      paddingHorizontal: TempleSpacing.md,
      paddingVertical: 12,
      textAlign: 'center',
    },
    strokeHintRow: { flexDirection: 'row', gap: 12, marginTop: 8, justifyContent: 'center' },
    strokeHint: { color: theme.textMuted, fontSize: TempleFonts.small },
    errorText: { color: theme.danger, fontSize: TempleFonts.small, marginTop: 12, textAlign: 'center' },
    submitBtn: {
      marginTop: TempleSpacing.lg,
      backgroundColor: theme.gold,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
    },
    submitText: { color: '#1A1210', fontSize: TempleFonts.body, fontWeight: '800' },

    // 三才卡
    sancaiCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '25',
      padding: TempleSpacing.lg,
      marginBottom: TempleSpacing.md,
      alignItems: 'center',
    },
    sancaiTitle: { color: theme.goldLight, fontSize: TempleFonts.subtitle, fontWeight: '900', marginBottom: 12 },
    sancaiCombo: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    elementTag: {
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    elementTagText: { fontSize: TempleFonts.body, fontWeight: '700' },
    sancaiCombination: { color: theme.textMuted, fontSize: TempleFonts.small, marginBottom: 10 },
    judgmentBadge: {
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 20,
      paddingVertical: 6,
      marginBottom: 12,
    },
    judgmentText: { fontSize: TempleFonts.heading, fontWeight: '900' },
    sancaiDetail: { color: theme.textMuted, fontSize: TempleFonts.small, textAlign: 'center', lineHeight: 22 },

    // 五格
    geTable: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '25',
      padding: TempleSpacing.lg,
      marginBottom: TempleSpacing.md,
    },
    sectionTitle: { color: theme.goldLight, fontSize: TempleFonts.subtitle, fontWeight: '900', marginBottom: 16 },
    geRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.goldDark + '18',
    },
    geLabelCol: { width: 50, alignItems: 'center', marginRight: 8 },
    geLabel: { fontSize: TempleFonts.small, fontWeight: '800' },
    elementDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
    geValueCol: { width: 50, alignItems: 'center', marginRight: 8 },
    geValue: { fontSize: TempleFonts.heading, fontWeight: '900' },
    geElement: { fontSize: TempleFonts.caption, fontWeight: '600' },
    geMeaningCol: { flex: 1 },
    geMeaning: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 20 },

    // 整體
    overallCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '25',
      padding: TempleSpacing.lg,
      marginBottom: TempleSpacing.md,
    },
    overallText: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 26 },

    // 吉數
    luckyCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '25',
      padding: TempleSpacing.lg,
      marginBottom: TempleSpacing.md,
    },
    luckyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    luckyBadge: {
      backgroundColor: theme.gold + '20',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.gold + '35',
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    luckyText: { color: theme.goldLight, fontSize: TempleFonts.small, fontWeight: '700' },
    luckyHint: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 20 },

    resultArea: { marginTop: TempleSpacing.sm },
  });
}
