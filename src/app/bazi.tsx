// 八字命理完整頁 — 四柱顯示、五行分布、十神、大運
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { useFadeIn } from '@/hooks/useEntranceAnimation';
import type { ThemeColors } from '@/constants/themes';
import {
  calculateFullBazi, getCurrentDaYun, getMissingWuxing,
  type FullBaziInfo,
} from '@/services/baziAdvanced';

const PILLARS = ['年柱', '月柱', '日柱', '時柱'] as const;
const WUXING_COLORS: Record<string, string> = { 木: '#4CAF50', 火: '#F44336', 土: '#FF9800', 金: '#B8860B', 水: '#2196F3' };
const WUXING_EMOJI: Record<string, string> = { 木: '🌿', 火: '🔥', 土: '🏔️', 金: '⚜️', 水: '💧' };

function WuxingBar({ element, count, total }: { element: string; count: number; total: number }) {
  const { theme } = useAppTheme();
  const bar = useMemo(() => createBarStyles(theme), [theme]);
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const color = WUXING_COLORS[element] ?? theme.gold;
  return (
    <View style={bar.row}>
      <Text style={bar.label}>{WUXING_EMOJI[element]} {element}</Text>
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={bar.count}>{count}</Text>
    </View>
  );
}

export default function BaziScreen() {
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const s = useMemo(() => createStyles(theme), [theme]);
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthHour, setBirthHour] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [bazi, setBazi] = useState<FullBaziInfo | null>(null);
  const [error, setError] = useState('');

  const currentDaYun = useMemo(() => {
    if (!bazi || !birthYear) return null;
    return getCurrentDaYun(bazi.daYun, parseInt(birthYear));
  }, [bazi, birthYear]);

  const missingWuxing = useMemo(() => {
    if (!bazi) return [];
    return getMissingWuxing(bazi.wuxingBalance);
  }, [bazi]);

  const totalWuxing = useMemo(() => {
    if (!bazi) return 0;
    return Object.values(bazi.wuxingBalance).reduce((a, b) => a + b, 0);
  }, [bazi]);

  const handleCalculate = () => {
    const y = parseInt(birthYear), m = parseInt(birthMonth), d = parseInt(birthDay);
    if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) {
      setError(t('baziErrorInvalidDate'));
      return;
    }
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = calculateFullBazi({
        birthYear: y, birthMonth: m, birthDay: d,
        birthHour: birthHour ? parseInt(birthHour) : 12,
        gender,
      });
      setBazi(result);
    } catch {
      setError(t('baziErrorCalcFailed'));
    }
  };

  const pillarData = bazi ? [bazi.year, bazi.month, bazi.day, bazi.hour] : [];
  const fadeIn = useFadeIn({ delay: 0 });

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          <Text style={s.title}>{t('baziPageTitle')}</Text>
          <Text style={s.sub}>{t('baziSubtitle')}</Text>
        </View>
        <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

          {/* 輸入區 */}
          <View style={s.card}>
            <Text style={s.cardTitle}>{t('baziInputTitle')}</Text>
            <View style={s.inputRow}>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>{t('baziLabelYear')}</Text>
                <TextInput style={s.input} placeholder="1990" placeholderTextColor={theme.textMuted}
                  value={birthYear} onChangeText={setBirthYear} keyboardType="number-pad" maxLength={4} />
              </View>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>{t('commonMonth')}</Text>
                <TextInput style={s.input} placeholder="8" placeholderTextColor={theme.textMuted}
                  value={birthMonth} onChangeText={setBirthMonth} keyboardType="number-pad" maxLength={2} />
              </View>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>{t('commonDay')}</Text>
                <TextInput style={s.input} placeholder="15" placeholderTextColor={theme.textMuted}
                  value={birthDay} onChangeText={setBirthDay} keyboardType="number-pad" maxLength={2} />
              </View>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>{t('baziLabelHour')}</Text>
                <TextInput style={s.input} placeholder="14" placeholderTextColor={theme.textMuted}
                  value={birthHour} onChangeText={setBirthHour} keyboardType="number-pad" maxLength={2} />
              </View>
            </View>
            <View style={s.genderRow}>
              {(['male', 'female'] as const).map(g => (
                <TouchableOpacity key={g} style={[s.genderBtn, gender === g && s.genderActive]} onPress={() => setGender(g)}>
                  <Text style={[s.genderText, gender === g && s.genderTextActive]}>{g === 'male' ? t('baziGenderMale') : t('baziGenderFemale')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {error !== '' && <Text style={s.error}>{error}</Text>}
            <TouchableOpacity style={s.calcBtn} onPress={handleCalculate}>
              <Text style={s.calcBtnText}>{t('baziButtonCalculate')}</Text>
            </TouchableOpacity>
          </View>

          {bazi && (
            <Animated.View style={{ opacity: fadeIn.opacity, transform: [{ translateY: fadeIn.translateY }] }}>
              {/* 四柱表 */}
              <View style={s.card}>
                <Text style={s.cardTitle}>{t('baziTitleFourPillars')}</Text>
                <View style={s.pillarsTable}>
                  {PILLARS.map((name, i) => {
                    const p = pillarData[i];
                    const shiShenEntry = i !== 2 ? Object.entries(bazi.shiShen).find(([k]) => k === ['year', 'month', 'hour'][i < 2 ? i : i - 1]) : null;
                    const ss = shiShenEntry?.[1];
                    return (
                      <View key={name} style={[s.pillarCol, i === 2 && s.pillarColDay]}>
                        <Text style={s.pillarName}>{name}</Text>
                        <View style={[s.ganBox, i === 2 && s.ganBoxDay]}>
                          <Text style={[s.ganText, i === 2 && s.ganTextDay]}>{p?.gan ?? '—'}</Text>
                          {ss && <Text style={s.shiShenBadge}>{ss.name}</Text>}
                        </View>
                        <View style={s.zhiBox}>
                          <Text style={s.zhiText}>{p?.zhi ?? '—'}</Text>
                        </View>
                        <Text style={s.naYin} numberOfLines={2}>{p?.naYin ?? ''}</Text>
                        <Text style={[s.wuxingDot, { color: WUXING_COLORS[p?.wuxing ?? ''] ?? theme.textMuted }]}>
                          {p?.wuxing ?? ''}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <View style={s.dayMasterRow}>
                  <Text style={s.dayMasterLabel}>{t('baziLabelDayMaster')}：</Text>
                  <Text style={s.dayMasterValue}>{bazi.dayMaster} ({bazi.dayMasterWuxing})</Text>
                </View>
                <Text style={s.personalityText}>{bazi.personality}</Text>
              </View>

              {/* 五行分布 */}
              <View style={s.card}>
                <Text style={s.cardTitle}>{t('baziTitleWuxingDistribution')}</Text>
                {Object.entries(bazi.wuxingBalance).map(([el, cnt]) => (
                  <WuxingBar key={el} element={el} count={cnt} total={totalWuxing} />
                ))}
                {missingWuxing.length > 0 && (
                  <View style={s.missingBox}>
                    <Text style={s.missingTitle}>{t('baziTitleMissing')}：{missingWuxing.join('、')}</Text>
                    <Text style={s.missingDesc}>
                      {t('baziTextMissingHint', { missing: missingWuxing.join('、') })}
                    </Text>
                  </View>
                )}
              </View>

              {/* 人生主題 */}
              <View style={s.card}>
                <Text style={s.cardTitle}>{t('baziTitleLifeTheme')}</Text>
                <Text style={s.lifeTheme}>{bazi.lifeTheme}</Text>
                <Text style={[s.cardTitle, { marginTop: 12, color: theme.goldLight }]}>2026丙午年運勢</Text>
                <Text style={s.lifeTheme}>{bazi.yearFortune2026}</Text>
              </View>

              {/* 大運 */}
              <View style={s.card}>
                <Text style={s.cardTitle}>{t('baziTitleDaYun')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={s.daYunRow}>
                    {bazi.daYun.map((dy, i) => (
                      <View key={i} style={[s.daYunItem, currentDaYun === dy && s.daYunItemActive]}>
                        <Text style={[s.daYunAge, currentDaYun === dy && s.daYunAgeActive]}>
                          {dy.startAge}–{dy.endAge}歲
                        </Text>
                        <Text style={[s.daYunGan, currentDaYun === dy && s.daYunGanActive]}>{dy.pillar.gan}</Text>
                        <Text style={[s.daYunZhi, currentDaYun === dy && s.daYunZhiActive]}>{dy.pillar.zhi}</Text>
                        {currentDaYun === dy && <Text style={s.currentBadge}>{t('baziBadgeCurrent')}</Text>}
                      </View>
                    ))}
                  </View>
                </ScrollView>
                {currentDaYun && (
                  <View style={s.currentDaYunDetail}>
                    <Text style={s.currentDaYunTitle}>
                      {t('baziLabelCurrentDaYun')}：{currentDaYun.pillar.gan}{currentDaYun.pillar.zhi}（{currentDaYun.startAge}–{currentDaYun.endAge}歲）
                    </Text>
                    <Text style={s.currentDaYunText}>{currentDaYun.overview}</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          <View style={s.disclaimer}>
            <Text style={s.disclaimerText}>{t('baziDisclaimer')}</Text>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createBarStyles(theme: ThemeColors) {
  return StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  label: { color: theme.textMuted, fontSize: 13, width: 40 },
  track: { flex: 1, height: 12, backgroundColor: '#2A2020', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  count: { color: theme.gold, fontSize: 13, width: 20, textAlign: 'right' },
  });
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgDark },
  header: { paddingHorizontal: TempleSpacing.lg, paddingTop: TempleSpacing.md, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#2A2020' },
  title: { color: theme.gold, fontSize: 20, fontWeight: '900' },
  sub: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: TempleSpacing.md },
  card: { backgroundColor: theme.bgCard, borderRadius: 12, borderWidth: 1, borderColor: '#2A2020', padding: TempleSpacing.md, marginBottom: 14 },
  cardTitle: { color: theme.gold, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  inputGroup: { flex: 1 },
  inputLabel: { color: theme.textMuted, fontSize: 11, marginBottom: 3 },
  input: { backgroundColor: theme.bgDark, borderWidth: 1, borderColor: '#3A2A20', borderRadius: 8, color: theme.textLight, fontSize: 14, paddingHorizontal: 8, paddingVertical: 8, textAlign: 'center' },
  genderRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  genderBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#3A2A20', alignItems: 'center', backgroundColor: theme.bgDark },
  genderActive: { backgroundColor: theme.gold, borderColor: theme.gold },
  genderText: { color: theme.textMuted, fontWeight: '700' },
  genderTextActive: { color: theme.bgDark },
  error: { color: theme.danger, fontSize: 12, marginBottom: 8 },
  calcBtn: { backgroundColor: theme.gold, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  calcBtnText: { color: theme.bgDark, fontSize: 16, fontWeight: '900' },
  pillarsTable: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  pillarCol: { flex: 1, alignItems: 'center', gap: 4 },
  pillarColDay: { backgroundColor: '#1E1408', borderRadius: 10, padding: 4 },
  pillarName: { color: theme.textMuted, fontSize: 11 },
  ganBox: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#2A2020', justifyContent: 'center', alignItems: 'center' },
  ganBoxDay: { backgroundColor: theme.gold + '33', borderWidth: 1, borderColor: theme.gold },
  ganText: { color: theme.textLight, fontSize: 20, fontWeight: '700' },
  ganTextDay: { color: theme.gold, fontSize: 22, fontWeight: '900' },
  shiShenBadge: { color: theme.textMuted, fontSize: 9, marginTop: 1 },
  zhiBox: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#1A1810', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2A2020' },
  zhiText: { color: theme.textLight, fontSize: 20, fontWeight: '600' },
  naYin: { color: theme.textMuted, fontSize: 9, textAlign: 'center' },
  wuxingDot: { fontSize: 11, fontWeight: '700' },
  dayMasterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 4 },
  dayMasterLabel: { color: theme.textMuted, fontSize: 13 },
  dayMasterValue: { color: theme.goldLight, fontSize: 15, fontWeight: '700' },
  personalityText: { color: theme.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  missingBox: { marginTop: 10, backgroundColor: '#1A0E08', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#3A1A08' },
  missingTitle: { color: '#FF9800', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  missingDesc: { color: theme.textMuted, fontSize: 12, lineHeight: 18 },
  lifeTheme: { color: theme.textLight, fontSize: 13, lineHeight: 22 },
  daYunRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  daYunItem: { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, borderRadius: 10, backgroundColor: '#2A2020', borderWidth: 1, borderColor: '#3A2A20', minWidth: 64 },
  daYunItemActive: { backgroundColor: '#2A1A08', borderColor: theme.gold },
  daYunAge: { color: theme.textMuted, fontSize: 10, marginBottom: 4 },
  daYunAgeActive: { color: theme.gold },
  daYunGan: { color: theme.textLight, fontSize: 18, fontWeight: '700' },
  daYunGanActive: { color: theme.goldLight },
  daYunZhi: { color: theme.textMuted, fontSize: 16 },
  daYunZhiActive: { color: theme.gold },
  currentBadge: { color: theme.gold, fontSize: 9, marginTop: 2, fontWeight: '700' },
  currentDaYunDetail: { marginTop: 12, backgroundColor: '#1E1408', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#3A2A10' },
  currentDaYunTitle: { color: theme.gold, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  currentDaYunText: { color: theme.textLight, fontSize: 13, lineHeight: 22 },
  disclaimer: { alignItems: 'center', marginTop: 10 },
  disclaimerText: { color: theme.textMuted, fontSize: 11 },
  });
}
