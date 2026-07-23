// 袁天罡稱骨算命 — 依出生年月日時計算骨重並對應歌訣
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { calculateBoneWeight, type BoneWeightResult } from '@/services/boneWeight';
import { getSettings } from '@/services/storage';
import { parseBirthYear } from '@/services/bazi';

const SHICHEN_INFO = [
  { name: '子', hour: 23, range: '23:00-01:00', wuxing: '水' },
  { name: '丑', hour: 1, range: '01:00-03:00', wuxing: '土' },
  { name: '寅', hour: 3, range: '03:00-05:00', wuxing: '木' },
  { name: '卯', hour: 5, range: '05:00-07:00', wuxing: '木' },
  { name: '辰', hour: 7, range: '07:00-09:00', wuxing: '土' },
  { name: '巳', hour: 9, range: '09:00-11:00', wuxing: '火' },
  { name: '午', hour: 11, range: '11:00-13:00', wuxing: '火' },
  { name: '未', hour: 13, range: '13:00-15:00', wuxing: '土' },
  { name: '申', hour: 15, range: '15:00-17:00', wuxing: '金' },
  { name: '酉', hour: 17, range: '17:00-19:00', wuxing: '金' },
  { name: '戌', hour: 19, range: '19:00-21:00', wuxing: '土' },
  { name: '亥', hour: 21, range: '21:00-23:00', wuxing: '水' },
];

const FORTUNE_COLORS: Record<string, string> = {
  '上上': '#fbc02d',
  '上吉': '#81c784',
  '中吉': '#64b5f6',
  '中平': '#a09880',
  '中下': '#ffb74d',
  '下下': '#e57373',
};

function weightFormat(weight: number): string {
  const liang = Math.floor(weight);
  const qian = Math.round((weight - liang) * 10);
  if (qian === 0) return `${liang}兩`;
  return `${liang}兩${qian}錢`;
}

export default function BoneWeightScreen() {
  const { theme } = useAppTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthHour, setBirthHour] = useState('');
  const [result, setResult] = useState<BoneWeightResult | null>(null);
  const [error, setError] = useState('');

  // 自動讀取設定中的出生年份
  useEffect(() => {
    getSettings().then((settings) => {
      if (!settings?.birthDate) return;
      const year = parseBirthYear(settings.birthDate);
      if (year) setBirthYear(String(year));
    });
  }, []);

  const selectedShichen = useMemo(() => {
    const h = parseInt(birthHour, 10);
    if (isNaN(h) || h < 0 || h > 23) return null;
    const idx = Math.floor(((h + 1) % 24) / 2);
    return { ...SHICHEN_INFO[idx], index: idx };
  }, [birthHour]);

  const handleCalculate = () => {
    setError('');
    setResult(null);

    const year = parseInt(birthYear, 10);
    const month = parseInt(birthMonth, 10);
    const day = parseInt(birthDay, 10);
    const hour = parseInt(birthHour, 10);

    if (isNaN(year) || year < 1900 || year > 2100) { setError('請輸入有效的出生年份 (1900-2100)'); return; }
    if (isNaN(month) || month < 1 || month > 12) { setError('請輸入有效的農曆月份 (1-12)'); return; }
    if (isNaN(day) || day < 1 || day > 30) { setError('請輸入有效的農曆日期 (1-30)'); return; }
    if (isNaN(hour) || hour < 0 || hour > 23) { setError('請輸入有效的出生時辰 (0-23)'); return; }

    const res = calculateBoneWeight(year, month, day, hour);
    if (!res) { setError('查無該年份骨重資料，請確認出生年份是否在可用範圍內'); return; }

    setResult(res);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.pageTitle}>⚖️ 袁天罡稱骨算命</Text>
          <Text style={s.subtitle}>輸入農曆出生年月日時，推算八字骨重與命運歌訣</Text>

          {/* 輸入區 */}
          <View style={s.card}>
            <Text style={s.cardTitle}>出生資料</Text>

            <Text style={s.label}>出生年份（西元年）</Text>
            <TextInput
              style={s.input}
              value={birthYear}
              onChangeText={setBirthYear}
              placeholder="例：1990"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              maxLength={4}
            />

            <Text style={s.label}>農曆出生月份</Text>
            <View style={s.pickerRow}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <TouchableOpacity
                  key={m}
                  style={[s.pickerBtn, birthMonth === String(m) && s.pickerBtnActive]}
                  onPress={() => setBirthMonth(String(m))}
                >
                  <Text style={[s.pickerBtnText, birthMonth === String(m) && s.pickerBtnTextActive]}>
                    {m}月
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={s.input}
              value={birthMonth}
              onChangeText={setBirthMonth}
              placeholder="或直接輸入 1-12"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              maxLength={2}
            />

            <Text style={s.label}>農曆出生日</Text>
            <TextInput
              style={s.input}
              value={birthDay}
              onChangeText={setBirthDay}
              placeholder="例：15（農曆 1-30 日）"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              maxLength={2}
            />

            <Text style={s.label}>出生時辰（西元小時 0-23）</Text>
            <TextInput
              style={s.input}
              value={birthHour}
              onChangeText={setBirthHour}
              placeholder="例：8（上午8時）"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              maxLength={2}
            />

            {/* 時辰對照表 */}
            <Text style={s.label}>十二時辰對照表</Text>
            <View style={s.shichenGrid}>
              {SHICHEN_INFO.map(sc => (
                <View
                  key={sc.name}
                  style={[
                    s.shichenCell,
                    selectedShichen?.name === sc.name && s.shichenCellActive,
                  ]}
                >
                  <Text style={s.shichenName}>{sc.name}時</Text>
                  <Text style={s.shichenRange}>{sc.range}</Text>
                </View>
              ))}
            </View>
            {selectedShichen && (
              <Text style={s.shichenHint}>
                您輸入的 {birthHour} 時對應「{selectedShichen.name}時」（{selectedShichen.range}）
              </Text>
            )}

            {error ? <Text style={s.errorText}>{error}</Text> : null}

            <TouchableOpacity style={s.submitBtn} onPress={handleCalculate} activeOpacity={0.7}>
              <Text style={s.submitBtnText}>推算骨重</Text>
            </TouchableOpacity>
          </View>

          {/* 結果區 */}
          {result && (
            <View style={s.card}>
              <Text style={s.cardTitle}>📜 稱骨結果</Text>

              {/* 總骨重 */}
              <View style={s.totalSection}>
                <Text style={s.totalLabel}>命重</Text>
                <Text style={s.totalValue}>{result.totalLabel}</Text>
                <View style={[s.fortuneBadge, { backgroundColor: FORTUNE_COLORS[result.fortune] || theme.gold }]}>
                  <Text style={s.fortuneBadgeText}>{result.fortune}</Text>
                </View>
              </View>

              {/* 骨重明細表 */}
              <View style={s.detailTable}>
                <View style={s.detailHeader}>
                  <Text style={s.detailHeaderText}>項目</Text>
                  <Text style={s.detailHeaderText}>骨重</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>年柱</Text>
                  <Text style={s.detailValue}>{weightFormat(result.yearWeight)}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>月柱</Text>
                  <Text style={s.detailValue}>{weightFormat(result.monthWeight)}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>日柱</Text>
                  <Text style={s.detailValue}>{weightFormat(result.dayWeight)}</Text>
                </View>
                <View style={s.detailRow}>
                  <Text style={s.detailLabel}>時柱</Text>
                  <Text style={s.detailValue}>{weightFormat(result.hourWeight)}</Text>
                </View>
              </View>

              {/* 歌訣 */}
              <View style={s.poemSection}>
                <Text style={s.poemSectionTitle}>稱骨歌訣</Text>
                <Text style={s.poemText}>{result.poem}</Text>
              </View>

              {/* 白話解釋 */}
              <View style={s.interpretSection}>
                <Text style={s.interpretTitle}>白話解釋</Text>
                <Text style={s.interpretText}>{result.interpretation}</Text>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgDark },
  scroll: { padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: theme.goldLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
    textAlign: 'center',
    marginBottom: TempleSpacing.lg,
  },
  card: {
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.goldDark + '24',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  cardTitle: {
    color: theme.goldLight,
    fontWeight: '800',
    fontSize: TempleFonts.body,
    marginBottom: 12,
  },
  label: {
    color: theme.textMuted,
    fontSize: TempleFonts.small,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: theme.bgDark,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.goldDark + '40',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.textLight,
    fontSize: TempleFonts.body,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  pickerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.goldDark + '40',
    backgroundColor: theme.bgDark,
  },
  pickerBtnActive: {
    backgroundColor: theme.goldDark + '55',
    borderColor: theme.gold,
  },
  pickerBtnText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  pickerBtnTextActive: {
    color: theme.gold,
    fontWeight: '800',
  },
  shichenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  shichenCell: {
    width: '23%',
    backgroundColor: theme.bgDark,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.goldDark + '22',
  },
  shichenCellActive: {
    borderColor: theme.gold + '80',
    backgroundColor: theme.goldDark + '22',
  },
  shichenName: { color: theme.goldLight, fontWeight: '700', fontSize: 13 },
  shichenRange: { color: theme.textMuted, fontSize: 10, marginTop: 3, textAlign: 'center' },
  shichenHint: {
    color: theme.gold,
    fontSize: TempleFonts.small,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#e57373',
    fontSize: TempleFonts.small,
    marginTop: 10,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 16,
    backgroundColor: theme.goldDark,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.gold,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: TempleFonts.body,
    fontWeight: '800',
  },

  // 結果區
  totalSection: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: theme.bgDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.gold + '40',
  },
  totalLabel: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  totalValue: {
    color: theme.goldLight,
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 8,
  },
  fortuneBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fortuneBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  // 明細表
  detailTable: {
    backgroundColor: theme.bgDark,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.goldDark + '22',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.goldDark + '30',
  },
  detailHeaderText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    color: theme.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    color: theme.gold,
    fontSize: 14,
    fontWeight: '800',
  },

  // 歌訣
  poemSection: {
    backgroundColor: theme.bgDark,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
    borderLeftWidth: 4,
    borderLeftColor: theme.gold,
  },
  poemSectionTitle: {
    color: theme.gold,
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 10,
  },
  poemText: {
    color: theme.textLight,
    fontSize: TempleFonts.poem,
    lineHeight: 28,
  },

  // 解釋
  interpretSection: {
    backgroundColor: theme.goldDark + '18',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
  },
  interpretTitle: {
    color: theme.gold,
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 6,
  },
  interpretText: {
    color: theme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 22,
  },
  });
}
