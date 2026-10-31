// 紫微斗數十二宮排盤系統 — 依出生年月日時排布十二宮位、十四主星與吉凶四化
import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DecorativeBg } from '@/components/DecorativeBg';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import type { ThemeColors } from '@/constants/themes';
import {
  calculateZiweiChart,
  type ZiweiChart,
} from '@/services/ziweiEngine';
import { getSettings } from '@/services/storage';
import { parseBirthYear } from '@/services/bazi';

const SHICHEN_LIST = [
  { branch: '子', range: '23:00 - 01:00' },
  { branch: '丑', range: '01:00 - 03:00' },
  { branch: '寅', range: '03:00 - 05:00' },
  { branch: '卯', range: '05:00 - 07:00' },
  { branch: '辰', range: '07:00 - 09:00' },
  { branch: '巳', range: '09:00 - 11:00' },
  { branch: '午', range: '11:00 - 13:00' },
  { branch: '未', range: '13:00 - 15:00' },
  { branch: '申', range: '15:00 - 17:00' },
  { branch: '酉', range: '17:00 - 19:00' },
  { branch: '戌', range: '19:00 - 21:00' },
  { branch: '亥', range: '21:00 - 23:00' },
];

// 傳統十二宮盤面地支順序（環形佈局或方格盤）
// 頂列：巳(5), 午(6), 未(7), 申(8)
// 右欄：酉(9), 戌(10)
// 底列：亥(11), 子(0), 丑(1), 寅(2)
// 左欄：卯(3), 辰(4)
const GRID_LAYOUT = [
  ['巳', '午', '未', '申'],
  ['辰', 'center', 'center', '酉'],
  ['卯', 'center', 'center', '戌'],
  ['寅', '丑', '子', '亥'],
];

export default function ZiweiScreen() {
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const s = useMemo(() => createStyles(theme), [theme]);

  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('1');
  const [birthDay, setBirthDay] = useState('15');
  const [selectedHourIdx, setSelectedHourIdx] = useState(0);

  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalaceIndex, setSelectedPalaceIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('cards');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 自動讀取使用者設定之出生年
  useEffect(() => {
    getSettings().then((settings) => {
      if (settings?.birthDate) {
        const y = parseBirthYear(settings.birthDate);
        if (y) setBirthYear(String(y));
      } else {
        setBirthYear('1995');
      }
    });
  }, []);

  const handleCalc = () => {
    const y = parseInt(birthYear, 10);
    const m = parseInt(birthMonth, 10);
    const d = parseInt(birthDay, 10);

    if (isNaN(y) || y < 1900 || y > 2100) {
      setError('請輸入 1900 至 2100 之間的西元出生年份');
      return;
    }
    if (isNaN(m) || m < 1 || m > 12) {
      setError('請輸入正確的農曆月份（1 至 12）');
      return;
    }
    if (isNaN(d) || d < 1 || d > 30) {
      setError('請輸入正確的農曆日期（1 至 30）');
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      try {
        const result = calculateZiweiChart(y, m, d, selectedHourIdx);
        setChart(result);
        setSelectedPalaceIndex(0); // 預設聚焦命宮
      } catch {
        setError('排盤計算失敗，請檢查輸入數值');
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const selectedPalace = chart ? chart.palaces[selectedPalaceIndex] : null;

  return (
    <SafeAreaView style={s.safe}>
      <DecorativeBg pattern="diamond" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.title}>{t('ziweiPageTitle')}</Text>
          <Text style={s.subtitle}>正統紫微斗數・十二宮十四主星排盤與四化吉煞精解</Text>

          {/* 輸入卡片 */}
          <View style={s.inputCard}>
            <Text style={s.sectionHeader}>生辰資料輸入（農曆）</Text>

            <View style={s.inputGrid}>
              <View style={s.inputCol}>
                <Text style={s.fieldLabel}>出生西元年</Text>
                <TextInput
                  style={s.textInput}
                  value={birthYear}
                  onChangeText={(v) => { setBirthYear(v); setError(''); }}
                  placeholder="如: 1995"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>

              <View style={s.inputCol}>
                <Text style={s.fieldLabel}>農曆月份</Text>
                <TextInput
                  style={s.textInput}
                  value={birthMonth}
                  onChangeText={(v) => { setBirthMonth(v); setError(''); }}
                  placeholder="1-12"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={s.inputCol}>
                <Text style={s.fieldLabel}>農曆日</Text>
                <TextInput
                  style={s.textInput}
                  value={birthDay}
                  onChangeText={(v) => { setBirthDay(v); setError(''); }}
                  placeholder="1-30"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>

            {/* 出生時辰選擇器 */}
            <Text style={[s.fieldLabel, { marginTop: 12 }]}>出生時辰（十二時辰）</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.shichenRow}>
              {SHICHEN_LIST.map((item, idx) => {
                const isSelected = selectedHourIdx === idx;
                return (
                  <TouchableOpacity
                    key={item.branch}
                    style={[s.shichenChip, isSelected && s.shichenChipSelected]}
                    onPress={() => setSelectedHourIdx(idx)}
                  >
                    <Text style={[s.shichenBranch, isSelected && s.shichenTextSelected]}>{item.branch}時</Text>
                    <Text style={[s.shichenRange, isSelected && s.shichenRangeSelected]}>{item.range}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={s.calcBtn} onPress={handleCalc}>
              <Text style={s.calcBtnText}>🌟 立即排盤解析</Text>
            </TouchableOpacity>

            {error ? <Text style={s.error}>{error}</Text> : null}
          </View>

          {loading ? (
            <View style={s.loadingCard}>
              <Text style={s.loadingIcon}>⭐</Text>
              <Text style={s.loadingText}>正依古法星曜演算法推排十二宮與十四主星中…</Text>
            </View>
          ) : null}

          {/* 排盤結果呈現 */}
          {chart && !loading ? (
            <>
              {/* 天盤總覽頭部 */}
              <View style={s.summaryCard}>
                <Text style={s.ganZhi}>{chart.ganZhi} 年生・{chart.bureau.name}</Text>
                <Text style={s.destinyBadge}>{chart.overview.destinyPattern}</Text>

                <View style={s.metaRow}>
                  <Text style={s.metaText}>命宮：<Text style={s.highlight}>{chart.mingBranch}宮</Text></Text>
                  <Text style={s.metaDivider}>|</Text>
                  <Text style={s.metaText}>身宮：<Text style={s.highlight}>{chart.shenBranch}宮</Text></Text>
                  <Text style={s.metaDivider}>|</Text>
                  <Text style={s.metaText}>生時：<Text style={s.highlight}>{chart.birthHourBranch}時</Text></Text>
                </View>

                {/* 生年四化徽章列 */}
                <View style={s.sihuaContainer}>
                  <View style={[s.sihuaBadge, { backgroundColor: '#2E7D3222', borderColor: '#2E7D32' }]}>
                    <Text style={[s.sihuaLabel, { color: '#81C784' }]}>化祿</Text>
                    <Text style={s.sihuaValue}>{chart.fourTransformations.lu.star} ({chart.fourTransformations.lu.palace})</Text>
                  </View>
                  <View style={[s.sihuaBadge, { backgroundColor: '#C2185B22', borderColor: '#C2185B' }]}>
                    <Text style={[s.sihuaLabel, { color: '#F48FB1' }]}>化權</Text>
                    <Text style={s.sihuaValue}>{chart.fourTransformations.quan.star} ({chart.fourTransformations.quan.palace})</Text>
                  </View>
                  <View style={[s.sihuaBadge, { backgroundColor: '#0288D122', borderColor: '#0288D1' }]}>
                    <Text style={[s.sihuaLabel, { color: '#4FC3F7' }]}>化科</Text>
                    <Text style={s.sihuaValue}>{chart.fourTransformations.ke.star} ({chart.fourTransformations.ke.palace})</Text>
                  </View>
                  <View style={[s.sihuaBadge, { backgroundColor: '#D32F2F22', borderColor: '#D32F2F' }]}>
                    <Text style={[s.sihuaLabel, { color: '#E57373' }]}>化忌</Text>
                    <Text style={s.sihuaValue}>{chart.fourTransformations.ji.star} ({chart.fourTransformations.ji.palace})</Text>
                  </View>
                </View>
              </View>

              {/* 視圖切換標籤 */}
              <View style={s.viewToggleRow}>
                <TouchableOpacity
                  style={[s.toggleBtn, viewMode === 'cards' && s.toggleBtnActive]}
                  onPress={() => setViewMode('cards')}
                >
                  <Text style={[s.toggleBtnText, viewMode === 'cards' && s.toggleBtnTextActive]}>📋 十二宮位詳解</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.toggleBtn, viewMode === 'grid' && s.toggleBtnActive]}
                  onPress={() => setViewMode('grid')}
                >
                  <Text style={[s.toggleBtnText, viewMode === 'grid' && s.toggleBtnTextActive]}>🏛️ 命盤方陣九宮</Text>
                </TouchableOpacity>
              </View>

              {/* 模式一：方格天盤 */}
              {viewMode === 'grid' ? (
                <View style={s.gridContainer}>
                  <Text style={s.gridHint}>點擊方格可切換並檢視該宮位星曜細節：</Text>
                  {GRID_LAYOUT.map((row, rIdx) => (
                    <View key={`row-${rIdx}`} style={s.gridRow}>
                      {row.map((cellBranch, cIdx) => {
                        if (cellBranch === 'center') {
                          if (rIdx === 1 && cIdx === 1) {
                            return (
                              <View key="center-block" style={s.gridCenterCell}>
                                <Text style={s.centerTitle}>紫微天盤</Text>
                                <Text style={s.centerSub}>{chart.ganZhi}年生</Text>
                                <Text style={s.centerBureau}>{chart.bureau.name}</Text>
                              </View>
                            );
                          }
                          return null;
                        }

                        const pData = chart.palaces.find((p) => p.branch === cellBranch);
                        if (!pData) return <View key={`empty-${cIdx}`} style={s.gridCell} />;

                        const isFocused = pData.index === selectedPalaceIndex;
                        const isMing = pData.name === '命宮';

                        return (
                          <TouchableOpacity
                            key={cellBranch}
                            style={[
                              s.gridCell,
                              isFocused && s.gridCellFocused,
                              isMing && s.gridCellMing,
                            ]}
                            onPress={() => setSelectedPalaceIndex(pData.index)}
                          >
                            <View style={s.cellTopRow}>
                              <Text style={[s.cellPalaceName, isMing && s.cellMingText]}>
                                {pData.name}
                                {pData.isBodyPalace ? ' (身)' : ''}
                              </Text>
                              <Text style={s.cellBranchText}>{pData.stem}{pData.branch}</Text>
                            </View>
                            <View style={s.cellStarsRow}>
                              {pData.mainStars.length > 0 ? (
                                pData.mainStars.map((ms) => (
                                  <Text key={ms.name} style={s.cellMainStar}>
                                    {ms.name}{ms.transformation ? `[${ms.transformation}]` : ''}
                                  </Text>
                                ))
                              ) : (
                                <Text style={s.cellNoMainStar}>空宮</Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              ) : null}

              {/* 宮位快捷導覽橫條 */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.palaceTabStrip}>
                {chart.palaces.map((p, idx) => {
                  const isCur = idx === selectedPalaceIndex;
                  return (
                    <TouchableOpacity
                      key={p.name}
                      style={[s.palaceTabChip, isCur && s.palaceTabChipActive]}
                      onPress={() => setSelectedPalaceIndex(idx)}
                    >
                      <Text style={[s.palaceTabName, isCur && s.palaceTabNameActive]}>
                        {p.name}
                      </Text>
                      <Text style={[s.palaceTabBranch, isCur && s.palaceTabBranchActive]}>
                        {p.stem}{p.branch}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* 選取宮位深度卡片 */}
              {selectedPalace ? (
                <View style={s.detailCard}>
                  <View style={s.detailHeader}>
                    <View>
                      <Text style={s.detailPalaceName}>
                        {selectedPalace.name}
                        {selectedPalace.isBodyPalace ? '【身宮所在】' : ''}
                      </Text>
                      <Text style={s.detailGanzhi}>坐守 {selectedPalace.stem}{selectedPalace.branch} 宮</Text>
                    </View>
                    <View style={s.palaceBadge}>
                      <Text style={s.palaceBadgeText}>第 {selectedPalace.index + 1} 宮</Text>
                    </View>
                  </View>

                  {/* 主星區塊 */}
                  <Text style={s.starSectionTitle}>主星曜</Text>
                  {selectedPalace.mainStars.length > 0 ? (
                    <View style={s.starChipRow}>
                      {selectedPalace.mainStars.map((ms) => (
                        <View key={ms.name} style={s.mainStarChip}>
                          <Text style={s.mainStarName}>{ms.name}星</Text>
                          {ms.transformation ? (
                            <View style={[
                              s.transformationTag,
                              ms.transformation === '祿' && { backgroundColor: '#2E7D32' },
                              ms.transformation === '權' && { backgroundColor: '#C2185B' },
                              ms.transformation === '科' && { backgroundColor: '#0288D1' },
                              ms.transformation === '忌' && { backgroundColor: '#D32F2F' },
                            ]}>
                              <Text style={s.transformationText}>化{ms.transformation}</Text>
                            </View>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={s.emptyStarNote}>此宮無十四主星坐守（命理俗稱空宮），借對宮主星之氣象涵養。</Text>
                  )}

                  {/* 輔星與吉煞星 */}
                  <Text style={[s.starSectionTitle, { marginTop: 12 }]}>輔曜與吉煞星</Text>
                  {selectedPalace.minorStars.length > 0 ? (
                    <View style={s.starChipRow}>
                      {selectedPalace.minorStars.map((ms) => (
                        <View
                          key={ms.name}
                          style={[
                            s.minorStarChip,
                            ms.type === 'lucky' && s.luckyStarChip,
                            ms.type === 'harmful' && s.harmfulStarChip,
                          ]}
                        >
                          <Text style={[
                            s.minorStarName,
                            ms.type === 'lucky' && { color: '#81C784' },
                            ms.type === 'harmful' && { color: '#E57373' },
                          ]}>
                            {ms.name}
                          </Text>
                          {ms.transformation ? (
                            <Text style={s.minorStarTrans}>[{ms.transformation}]</Text>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={s.emptyStarNote}>無主要六吉六煞入宮，氣象平和清吉。</Text>
                  )}

                  <View style={s.divider} />

                  <Text style={s.summaryTitle}>【宮位涵義與氣象】</Text>
                  <Text style={s.summaryContent}>{selectedPalace.summary}</Text>

                  <View style={s.adviceBox}>
                    <Text style={s.adviceTitle}>💡 處世修持建議</Text>
                    <Text style={s.adviceContent}>{selectedPalace.advice}</Text>
                  </View>
                </View>
              ) : null}

              {/* 一生整體運勢與核心格局指引 */}
              <View style={s.overviewCard}>
                <Text style={s.overviewHeader}>📜 命盤整體格局指引</Text>

                <View style={s.overviewItem}>
                  <Text style={s.overviewItemTitle}>🌟 核心主題</Text>
                  <Text style={s.overviewItemBody}>{chart.overview.lifeTheme}</Text>
                </View>

                <View style={s.overviewItem}>
                  <Text style={s.overviewItemTitle}>💼 事業功名指引</Text>
                  <Text style={s.overviewItemBody}>{chart.overview.careerGuidance}</Text>
                </View>

                <View style={s.overviewItem}>
                  <Text style={s.overviewItemTitle}>💰 財帛資產指引</Text>
                  <Text style={s.overviewItemBody}>{chart.overview.wealthGuidance}</Text>
                </View>

                <View style={s.overviewItem}>
                  <Text style={s.overviewItemTitle}>❤️ 情感夫妻指引</Text>
                  <Text style={s.overviewItemBody}>{chart.overview.relationshipGuidance}</Text>
                </View>
              </View>

              <View style={s.disclaimer}>
                <Text style={s.disclaimerText}>
                  紫微斗數乃中華傳統五術星命之學，星曜之吉凶在於心性之修持與自覺發揮，命由天定，運在人為。
                </Text>
              </View>
            </>
          ) : null}

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bgDark },
    scroll: { padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl },
    title: { fontSize: TempleFonts.title, fontWeight: 'bold', color: theme.textGold, textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: TempleFonts.small, color: theme.textMuted, textAlign: 'center', marginBottom: TempleSpacing.md, lineHeight: 18 },

    inputCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '40',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    sectionHeader: { color: theme.textGold, fontSize: TempleFonts.heading, fontWeight: 'bold', marginBottom: TempleSpacing.sm },
    inputGrid: { flexDirection: 'row', gap: 8 },
    inputCol: { flex: 1 },
    fieldLabel: { color: theme.textLight, fontSize: TempleFonts.small, marginBottom: 4 },
    textInput: {
      backgroundColor: theme.bgMedium,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.gold + '80',
      padding: 10,
      color: theme.textLight,
      fontSize: TempleFonts.body,
      textAlign: 'center',
    },

    shichenRow: { flexDirection: 'row', gap: 8, paddingVertical: 6 },
    shichenChip: {
      backgroundColor: theme.bgMedium,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.goldDark + '60',
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      minWidth: 72,
    },
    shichenChipSelected: {
      backgroundColor: theme.gold + '25',
      borderColor: theme.gold,
    },
    shichenBranch: { color: theme.textLight, fontWeight: 'bold', fontSize: TempleFonts.body },
    shichenTextSelected: { color: theme.textGold },
    shichenRange: { color: theme.textMuted, fontSize: 10, marginTop: 2 },
    shichenRangeSelected: { color: theme.textGold },

    calcBtn: {
      backgroundColor: theme.gold,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: TempleSpacing.md,
    },
    calcBtnText: { color: theme.bgDark, fontWeight: 'bold', fontSize: TempleFonts.heading },
    error: { color: theme.danger, fontSize: TempleFonts.small, marginTop: 8, textAlign: 'center' },

    loadingCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '40',
      padding: TempleSpacing.xl,
      alignItems: 'center',
      marginBottom: TempleSpacing.md,
    },
    loadingIcon: { fontSize: 32, marginBottom: 8 },
    loadingText: { color: theme.textGold, fontSize: TempleFonts.body, textAlign: 'center' },

    summaryCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.gold + '80',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
      alignItems: 'center',
    },
    ganZhi: { fontSize: TempleFonts.title, fontWeight: 'bold', color: theme.goldLight, marginBottom: 4 },
    destinyBadge: {
      color: theme.textLight,
      fontSize: TempleFonts.body,
      backgroundColor: theme.bgMedium,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 8,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    metaText: { color: theme.textMuted, fontSize: TempleFonts.small },
    metaDivider: { color: theme.goldDark + '80' },
    highlight: { color: theme.goldLight, fontWeight: 'bold' },

    sihuaContainer: { flexDirection: 'row', gap: 6, width: '100%', justifyContent: 'space-between' },
    sihuaBadge: {
      flex: 1,
      borderRadius: 8,
      borderWidth: 1,
      paddingVertical: 6,
      alignItems: 'center',
    },
    sihuaLabel: { fontWeight: 'bold', fontSize: 12, marginBottom: 2 },
    sihuaValue: { color: theme.textLight, fontSize: 11, fontWeight: '600' },

    viewToggleRow: { flexDirection: 'row', gap: 8, marginBottom: TempleSpacing.md },
    toggleBtn: {
      flex: 1,
      backgroundColor: theme.bgCard,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.goldDark + '60',
    },
    toggleBtnActive: {
      backgroundColor: theme.gold + '25',
      borderColor: theme.gold,
    },
    toggleBtnText: { color: theme.textMuted, fontSize: TempleFonts.body, fontWeight: '600' },
    toggleBtnTextActive: { color: theme.textGold, fontWeight: 'bold' },

    // 方格盤
    gridContainer: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '50',
      padding: 6,
      marginBottom: TempleSpacing.md,
    },
    gridHint: { color: theme.textMuted, fontSize: 11, textAlign: 'center', marginBottom: 6 },
    gridRow: { flexDirection: 'row', height: 72 },
    gridCell: {
      flex: 1,
      borderWidth: 0.5,
      borderColor: theme.goldDark + '60',
      padding: 4,
      justifyContent: 'space-between',
      backgroundColor: theme.bgMedium + '80',
    },
    gridCellFocused: {
      backgroundColor: theme.gold + '30',
      borderColor: theme.gold,
    },
    gridCellMing: {
      borderWidth: 1.5,
      borderColor: '#E879A0',
    },
    gridCenterCell: {
      position: 'absolute',
      left: '25%',
      top: 0,
      width: '50%',
      height: 144, // 2 rows
      zIndex: 10,
      backgroundColor: theme.bgDark,
      borderWidth: 1,
      borderColor: theme.gold + '80',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    centerTitle: { color: theme.textGold, fontSize: TempleFonts.heading, fontWeight: 'bold' },
    centerSub: { color: theme.textLight, fontSize: 12, marginTop: 2 },
    centerBureau: { color: theme.goldLight, fontSize: 12, marginTop: 2, fontWeight: '600' },

    cellTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cellPalaceName: { fontSize: 11, fontWeight: 'bold', color: theme.textLight },
    cellMingText: { color: '#FF80AB' },
    cellBranchText: { fontSize: 10, color: theme.textMuted },
    cellStarsRow: { flexWrap: 'wrap', flexDirection: 'row', gap: 2 },
    cellMainStar: { fontSize: 10, color: theme.goldLight, fontWeight: '600' },
    cellNoMainStar: { fontSize: 10, color: theme.textMuted, fontStyle: 'italic' },

    // 橫向宮位標籤
    palaceTabStrip: { flexDirection: 'row', gap: 6, marginBottom: TempleSpacing.md },
    palaceTabChip: {
      backgroundColor: theme.bgCard,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.goldDark + '60',
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      minWidth: 70,
    },
    palaceTabChipActive: {
      backgroundColor: theme.gold,
      borderColor: theme.gold,
    },
    palaceTabName: { color: theme.textLight, fontSize: 13, fontWeight: 'bold' },
    palaceTabNameActive: { color: theme.bgDark },
    palaceTabBranch: { color: theme.textMuted, fontSize: 11 },
    palaceTabBranchActive: { color: theme.bgDark, opacity: 0.8 },

    // 宮位詳細卡片
    detailCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.gold + '80',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    detailPalaceName: { fontSize: TempleFonts.title, fontWeight: 'bold', color: theme.textGold },
    detailGanzhi: { color: theme.textMuted, fontSize: TempleFonts.small, marginTop: 2 },
    palaceBadge: { backgroundColor: theme.bgMedium, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    palaceBadgeText: { color: theme.goldLight, fontSize: 11, fontWeight: '600' },

    starSectionTitle: { color: theme.textLight, fontSize: TempleFonts.small, fontWeight: 'bold', marginBottom: 6 },
    starChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    mainStarChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.bgMedium,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.goldLight,
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 6,
    },
    mainStarName: { color: theme.goldLight, fontWeight: 'bold', fontSize: 14 },
    transformationTag: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
    transformationText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    emptyStarNote: { color: theme.textMuted, fontSize: 12, fontStyle: 'italic', marginBottom: 4 },

    minorStarChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.bgMedium,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.goldDark + '60',
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    luckyStarChip: { borderColor: '#2E7D3280' },
    harmfulStarChip: { borderColor: '#D32F2F80' },
    minorStarName: { fontSize: 12, fontWeight: '600' },
    minorStarTrans: { color: theme.goldLight, fontSize: 10, marginLeft: 2 },

    divider: { height: 1, backgroundColor: theme.goldDark + '40', marginVertical: 12 },
    summaryTitle: { color: theme.textGold, fontSize: TempleFonts.body, fontWeight: 'bold', marginBottom: 4 },
    summaryContent: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 22, marginBottom: 12 },
    adviceBox: {
      backgroundColor: theme.bgMedium,
      borderRadius: 10,
      borderLeftWidth: 3,
      borderLeftColor: theme.gold,
      padding: TempleSpacing.sm,
    },
    adviceTitle: { color: theme.textGold, fontWeight: 'bold', fontSize: TempleFonts.small, marginBottom: 4 },
    adviceContent: { color: theme.textMuted, fontSize: 13, lineHeight: 19 },

    // 格局大綱
    overviewCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '50',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    overviewHeader: { fontSize: TempleFonts.heading, fontWeight: 'bold', color: theme.textGold, marginBottom: 12 },
    overviewItem: { marginBottom: 12 },
    overviewItemTitle: { color: theme.goldLight, fontWeight: 'bold', fontSize: 13, marginBottom: 3 },
    overviewItemBody: { color: theme.textLight, fontSize: 13, lineHeight: 20 },

    disclaimer: { backgroundColor: theme.bgMedium, borderRadius: 10, padding: TempleSpacing.sm, marginTop: 4 },
    disclaimerText: { color: theme.textMuted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  });
}
