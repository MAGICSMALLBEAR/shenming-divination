import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useStaggeredList } from '@/hooks/useEntranceAnimation';
import { useFadeIn } from '@/hooks/useEntranceAnimation';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { generateYearlyReview, getAvailableYears, type YearlyReview } from '@/services/yearlyReview';
import { gods } from '@/data/gods';
import type { ThemeColors } from '@/constants/themes';

const MONTH_NAMES = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

function ReviewCard({
  children,
  delay,
  style,
}: {
  children: React.ReactNode;
  delay: number;
  style?: any;
}) {
  const { opacity, translateY } = useFadeIn({ delay });
  const { theme } = useAppTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, s.card, style]}>
      {children}
    </Animated.View>
  );
}

function MiniBarChart({
  data,
  maxValue,
  colorActive,
  colorInactive,
  labels,
}: {
  data: number[];
  maxValue: number;
  colorActive: string;
  colorInactive: string;
  labels?: string[];
}) {
  const { theme } = useAppTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={s.barChartRow}>
      {data.map((value, i) => {
        const height = maxValue > 0 ? Math.max(4, (value / maxValue) * 60) : 4;
        return (
          <View key={i} style={s.barCol}>
            <View
              style={[
                s.bar,
                {
                  height,
                  backgroundColor: value > 0 ? colorActive : colorInactive,
                },
              ]}
            />
            {labels ? (
              <Text style={s.barLabel}>{labels[i]}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function LevelBar({
  level,
  count,
  total,
  color,
  maxCount,
}: {
  level: string;
  count: number;
  total: number;
  color: string;
  maxCount: number;
}) {
  const { theme } = useAppTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const barWidth = maxCount > 0 ? Math.max(4, (count / maxCount) * 100) : 4;
  return (
    <View style={s.levelRow}>
      <Text style={s.levelLabel}>{level}</Text>
      <View style={s.levelBarBg}>
        <View
          style={[
            s.levelBarFill,
            { width: `${barWidth}%` as any, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={s.levelCount}>
        {count} ({pct}%)
      </Text>
    </View>
  );
}

export default function YearlyReviewScreen() {
  const { theme } = useAppTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const layout = useResponsiveLayout();
  const [review, setReview] = useState<YearlyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const loadData = useCallback(async (year: number) => {
    setLoading(true);
    const [data, years] = await Promise.all([
      generateYearlyReview(year),
      getAvailableYears(),
    ]);
    setReview(data);
    setAvailableYears(years);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData(selectedYear);
  }, [selectedYear, loadData]);

  const cardDelays = useStaggeredList({ itemCount: 10, staggerDelay: 80 });

  const godData = review?.favoriteGod
    ? gods.find((g) => g.name === review.favoriteGod?.name)
    : null;

  const handleShare = async () => {
    if (!review || review.insufficient) return;

    const lines = [
      `📊 ${review.year} 年度求籤回顧`,
      `━━━━━━━━━━━━━━━━`,
      `📈 總抽籤次數：${review.totalDraws} 次`,
      review.favoriteGod
        ? `🙏 最常請示的神明：${review.favoriteGod.name}（${review.favoriteGod.count} 次）`
        : '',
      review.favoriteQuestionCategory
        ? `💬 最常問的問題類別：${review.favoriteQuestionCategory.name}`
        : '',
      review.topPoem
        ? `📝 最常抽到的籤：第 ${review.topPoem.number} 籤（${review.topPoem.level}，${review.topPoem.count} 次）`
        : '',
      review.luckyMonth
        ? `⭐ 最幸運月份：${MONTH_NAMES[review.luckyMonth.month - 1]}（吉率 ${review.luckyMonth.ratio}%）`
        : '',
      `🔥 連續求籤紀錄：${review.longestStreak} 天`,
      `📝 許願統計：${review.totalWishes} 個願望 / ${review.wishesFulfilled} 個已還願`,
      `🔮 應驗：${review.matchedCount} 支 / 未應驗：${review.unmatchedCount} 支`,
      '',
      `—— 來自《神明占卜》App`,
    ].filter(Boolean);

    const text = lines.join('\n');

    if (Platform.OS === 'web') {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${review.year}_年度回顧.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      await Share.share({ message: text, title: `${review.year} 年度求籤回顧` }).catch(() => {});
    }
  };

  const maxMonthly = review ? Math.max(...review.monthlyDraws, 1) : 1;
  const levelColors: Record<string, string> = {
    '上上': theme.success,
    '大吉': theme.success,
    '上吉': theme.goldLight,
    '中吉': theme.gold,
    '中平': theme.warning,
    '下下': theme.danger,
  };
  const maxLevelCount = review
    ? Math.max(...review.levelDistribution.map((l) => l.count), 1)
    : 1;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scroll,
          { maxWidth: layout.contentMaxWidth, alignSelf: 'center', width: '100%' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={s.title}>📊 年度求籤回顧</Text>
        </View>

        {/* Year Selector */}
        <View style={s.yearSelector}>
          <TouchableOpacity
            style={s.yearArrow}
            onPress={() => {
              const prev = availableYears.find((y) => y < selectedYear);
              if (prev) setSelectedYear(prev);
            }}
          >
            <Text style={s.yearArrowText}>◀</Text>
          </TouchableOpacity>
          <Text style={s.yearText}>{selectedYear} 年</Text>
          <TouchableOpacity
            style={s.yearArrow}
            onPress={() => {
              const next = availableYears.find((y) => y > selectedYear);
              if (next) setSelectedYear(next);
            }}
          >
            <Text style={s.yearArrowText}>▶</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={s.loading}>
            <ActivityIndicator size="large" color={theme.goldLight} />
            <Text style={s.loadingText}>正在彙整年度數據...</Text>
          </View>
        ) : review?.insufficient ? (
          /* Empty State */
          <ReviewCard delay={0}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyTitle}>記錄不足</Text>
            <Text style={s.emptyMsg}>{review.message}</Text>
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => router.push('/(tabs)/temple' as any)}
            >
              <Text style={s.emptyBtnText}>前往求籤</Text>
            </TouchableOpacity>
          </ReviewCard>
        ) : review ? (
          <>
            {/* Total Draws */}
            <ReviewCard delay={cardDelays[0]?.delay ?? 0}>
              <Text style={s.cardIcon}>📈</Text>
              <Text style={s.cardTitle}>總抽籤次數</Text>
              <Text style={s.hugeNumber}>{review.totalDraws}</Text>
              <Text style={s.cardSub}>次</Text>
            </ReviewCard>

            {/* Favorite God */}
            <ReviewCard delay={cardDelays[1]?.delay ?? 0}>
              <Text style={s.cardIcon}>🙏</Text>
              <Text style={s.cardTitle}>最常請示的神明</Text>
              {review.favoriteGod ? (
                <View style={s.godRow}>
                  <Text style={s.godIcon}>
                    {godData ? godData.tagline.slice(0, 2) : '🛕'}
                  </Text>
                  <View>
                    <Text style={s.godName}>{review.favoriteGod.name}</Text>
                    <Text style={s.godCount}>共 {review.favoriteGod.count} 次</Text>
                  </View>
                </View>
              ) : (
                <Text style={s.cardSub}>尚無資料</Text>
              )}
            </ReviewCard>

            {/* Favorite Category */}
            <ReviewCard delay={cardDelays[2]?.delay ?? 0}>
              <Text style={s.cardIcon}>💬</Text>
              <Text style={s.cardTitle}>最常問的問題類別</Text>
              {review.favoriteQuestionCategory ? (
                <View>
                  <Text style={s.categoryName}>
                    {review.favoriteQuestionCategory.name}
                  </Text>
                  <Text style={s.godCount}>
                    共 {review.favoriteQuestionCategory.count} 次
                  </Text>
                </View>
              ) : (
                <Text style={s.cardSub}>尚無資料</Text>
              )}
            </ReviewCard>

            {/* Level Distribution */}
            <ReviewCard delay={cardDelays[3]?.delay ?? 0}>
              <Text style={s.cardIcon}>📊</Text>
              <Text style={s.cardTitle}>籤詩吉凶分佈</Text>
              <View style={s.levelChart}>
                {review.levelDistribution.map((entry) => {
                  const color =
                    levelColors[entry.level] ??
                    (entry.level.includes('上') || entry.level.includes('吉')
                      ? theme.success
                      : entry.level.includes('下') || entry.level.includes('凶')
                      ? theme.danger
                      : theme.warning);
                  return (
                    <LevelBar
                      key={entry.level}
                      level={entry.level}
                      count={entry.count}
                      total={review.totalDraws}
                      color={color}
                      maxCount={maxLevelCount}
                    />
                  );
                })}
              </View>
            </ReviewCard>

            {/* Monthly Heat */}
            <ReviewCard delay={cardDelays[4]?.delay ?? 0}>
              <Text style={s.cardIcon}>🗓️</Text>
              <Text style={s.cardTitle}>每月抽籤熱度</Text>
              <MiniBarChart
                data={review.monthlyDraws}
                maxValue={maxMonthly}
                colorActive={theme.goldLight}
                colorInactive={theme.goldDark + '40'}
                labels={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']}
              />
              <View style={s.monthLabelsRow}>
                {MONTH_NAMES.map((m, i) => (
                  <Text key={m} style={s.monthLabelSmall}>
                    {review.monthlyDraws[i] > 0 ? review.monthlyDraws[i] : ''}
                  </Text>
                ))}
              </View>
            </ReviewCard>

            {/* Lucky Month */}
            <ReviewCard delay={cardDelays[5]?.delay ?? 0}>
              <Text style={s.cardIcon}>⭐</Text>
              <Text style={s.cardTitle}>最幸運月份</Text>
              {review.luckyMonth ? (
                <View style={s.luckyRow}>
                  <Text style={s.luckyMonthName}>
                    {MONTH_NAMES[review.luckyMonth.month - 1]}
                  </Text>
                  <Text style={s.luckyRate}>
                    吉籤比率 {review.luckyMonth.ratio}%
                  </Text>
                </View>
              ) : (
                <Text style={s.cardSub}>尚無資料</Text>
              )}
            </ReviewCard>

            {/* Streak */}
            <ReviewCard delay={cardDelays[6]?.delay ?? 0}>
              <Text style={s.cardIcon}>🔥</Text>
              <Text style={s.cardTitle}>連續求籤紀錄</Text>
              <Text style={s.hugeNumber}>{review.longestStreak}</Text>
              <Text style={s.cardSub}>天</Text>
            </ReviewCard>

            {/* Top Poem */}
            <ReviewCard delay={cardDelays[7]?.delay ?? 0}>
              <Text style={s.cardIcon}>📝</Text>
              <Text style={s.cardTitle}>最常抽到的籤詩</Text>
              {review.topPoem ? (
                <View>
                  <View style={s.topPoemRow}>
                    <Text style={s.topPoemNumber}>第 {review.topPoem.number} 籤</Text>
                    <View
                      style={[
                        s.topPoemLevel,
                        {
                          backgroundColor:
                            review.topPoem.level.includes('上') ||
                            review.topPoem.level.includes('吉')
                              ? theme.success + '30'
                              : theme.warning + '30',
                        },
                      ]}
                    >
                      <Text style={s.topPoemLevelText}>{review.topPoem.level}</Text>
                    </View>
                  </View>
                  <Text style={s.godCount}>出現 {review.topPoem.count} 次</Text>
                </View>
              ) : (
                <Text style={s.cardSub}>尚無資料</Text>
              )}
            </ReviewCard>

            {/* Wishes */}
            <ReviewCard delay={cardDelays[8]?.delay ?? 0}>
              <Text style={s.cardIcon}>📝</Text>
              <Text style={s.cardTitle}>許願統計</Text>
              <View style={s.wishRow}>
                <View style={s.wishStat}>
                  <Text style={s.wishNum}>{review.totalWishes}</Text>
                  <Text style={s.wishLabel}>個願望</Text>
                </View>
                <Text style={s.wishSep}>/</Text>
                <View style={s.wishStat}>
                  <Text style={[s.wishNum, { color: theme.success }]}>
                    {review.wishesFulfilled}
                  </Text>
                  <Text style={s.wishLabel}>個已還願</Text>
                </View>
              </View>
            </ReviewCard>

            {/* Word Cloud */}
            {review.wordCloud.length > 0 && (
              <ReviewCard delay={cardDelays[9]?.delay ?? 0}>
                <Text style={s.cardIcon}>☁️</Text>
                <Text style={s.cardTitle}>問題關鍵詞</Text>
                <View style={s.wordCloudWrap}>
                  {review.wordCloud.map((item, i) => {
                    const fontSize = 12 + (item.count / Math.max(...review.wordCloud.map((w) => w.count))) * 14;
                    const opacity = 0.5 + (item.count / Math.max(...review.wordCloud.map((w) => w.count))) * 0.5;
                    return (
                      <Text
                        key={item.word}
                        style={[
                          s.wordCloudItem,
                          {
                            fontSize,
                            opacity,
                            color:
                              i % 3 === 0
                                ? theme.goldLight
                                : i % 3 === 1
                                ? theme.textLight
                                : theme.success,
                          },
                        ]}
                      >
                        {item.word}
                      </Text>
                    );
                  })}
                </View>
              </ReviewCard>
            )}

            {/* Share Button */}
            <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
              <Text style={s.shareBtnText}>📤 分享年度回顧</Text>
            </TouchableOpacity>
          </>
        ) : null}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bgDark },
    scroll: { padding: TempleSpacing.md },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: TempleSpacing.lg,
      gap: TempleSpacing.sm,
    },
    backBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.bgCard,
      borderWidth: 1,
      borderColor: theme.goldDark + '30',
    },
    backText: {
      fontSize: TempleFonts.small,
      color: theme.goldLight,
      fontWeight: '600',
    },
    title: {
      fontSize: TempleFonts.subtitle,
      fontWeight: '900',
      color: theme.goldLight,
      flex: 1,
      textAlign: 'center',
      marginRight: 50,
    },
    yearSelector: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
      marginBottom: TempleSpacing.lg,
    },
    yearArrow: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.bgCard,
      borderWidth: 1,
      borderColor: theme.goldDark + '30',
      justifyContent: 'center',
      alignItems: 'center',
    },
    yearArrowText: {
      color: theme.goldLight,
      fontSize: 16,
    },
    yearText: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.goldLight,
      minWidth: 100,
      textAlign: 'center',
    },
    loading: {
      alignItems: 'center',
      paddingVertical: 80,
      gap: 16,
    },
    loadingText: {
      fontSize: TempleFonts.body,
      color: theme.textMuted,
    },
    emptyIcon: {
      fontSize: 48,
      textAlign: 'center',
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: TempleFonts.heading,
      fontWeight: '700',
      color: theme.goldLight,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptyMsg: {
      fontSize: TempleFonts.small,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 20,
    },
    emptyBtn: {
      alignSelf: 'center',
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 24,
      backgroundColor: theme.goldDark + '40',
      borderWidth: 1,
      borderColor: theme.gold,
    },
    emptyBtnText: {
      fontSize: TempleFonts.body,
      color: theme.goldLight,
      fontWeight: '700',
    },
    card: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      padding: TempleSpacing.lg,
      marginBottom: TempleSpacing.md,
      borderWidth: 1,
      borderColor: theme.goldDark + '25',
    },
    cardIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: TempleFonts.small,
      color: theme.textMuted,
      marginBottom: 12,
      fontWeight: '600',
    },
    cardSub: {
      fontSize: TempleFonts.caption,
      color: theme.textMuted,
    },
    hugeNumber: {
      fontSize: 48,
      fontWeight: '900',
      color: theme.goldLight,
      lineHeight: 54,
    },
    godRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    godIcon: {
      fontSize: 28,
      width: 44,
      height: 44,
      textAlign: 'center',
      textAlignVertical: 'center',
      lineHeight: 44,
      backgroundColor: theme.bgDark + '40',
      borderRadius: 12,
    },
    godName: {
      fontSize: TempleFonts.heading,
      fontWeight: '700',
      color: theme.goldLight,
    },
    godCount: {
      fontSize: TempleFonts.caption,
      color: theme.textMuted,
      marginTop: 2,
    },
    categoryName: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.goldLight,
    },
    levelChart: {
      gap: 8,
    },
    levelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    levelLabel: {
      fontSize: TempleFonts.caption,
      color: theme.textLight,
      width: 40,
      fontWeight: '600',
    },
    levelBarBg: {
      flex: 1,
      height: 14,
      backgroundColor: theme.bgDark + '40',
      borderRadius: 7,
      overflow: 'hidden',
    },
    levelBarFill: {
      height: '100%',
      borderRadius: 7,
      minWidth: 4,
    },
    levelCount: {
      fontSize: TempleFonts.caption,
      color: theme.textMuted,
      width: 55,
      textAlign: 'right',
    },
    barChartRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 70,
      marginBottom: 4,
    },
    barCol: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 2,
    },
    bar: {
      width: '70%',
      maxWidth: 28,
      borderRadius: 4,
      minWidth: 4,
    },
    barLabel: {
      fontSize: 9,
      color: theme.textMuted,
    },
    monthLabelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    monthLabelSmall: {
      flex: 1,
      fontSize: 9,
      color: theme.textMuted,
      textAlign: 'center',
    },
    luckyRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 12,
    },
    luckyMonthName: {
      fontSize: 32,
      fontWeight: '900',
      color: theme.goldLight,
    },
    luckyRate: {
      fontSize: TempleFonts.body,
      color: theme.success,
      fontWeight: '600',
    },
    topPoemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    topPoemNumber: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.goldLight,
    },
    topPoemLevel: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    topPoemLevelText: {
      fontSize: TempleFonts.caption,
      fontWeight: '600',
      color: theme.goldLight,
    },
    wishRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    wishStat: {
      alignItems: 'center',
    },
    wishNum: {
      fontSize: 36,
      fontWeight: '900',
      color: theme.goldLight,
    },
    wishLabel: {
      fontSize: TempleFonts.caption,
      color: theme.textMuted,
      marginTop: 2,
    },
    wishSep: {
      fontSize: 24,
      color: theme.textMuted,
      fontWeight: '300',
    },
    wordCloudWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 8,
    },
    wordCloudItem: {
      fontWeight: '600',
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    shareBtn: {
      width: '100%',
      marginTop: TempleSpacing.lg,
      paddingVertical: 14,
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.gold,
      backgroundColor: theme.goldDark + '30',
    },
    shareBtnText: {
      fontSize: TempleFonts.body,
      color: theme.goldLight,
      fontWeight: '700',
    },
  });
}
