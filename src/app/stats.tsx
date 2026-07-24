import React, { useEffect, useMemo, useState } from 'react';
import { Animated, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { useFadeIn, useStaggeredList } from '@/hooks/useEntranceAnimation';
import { SkeletonBlock } from '@/components/Skeleton';
import type { ThemeColors } from '@/constants/themes';
import { getStats, getYearlySummary, type Stats, type YearlySummary } from '@/services/statsService';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

function AnimatedCard({ delay, children }: { delay: number; children: React.ReactNode }) {
  const { opacity, translateY } = useFadeIn({ delay });
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function StatsScreen() {
  const layout = useResponsiveLayout();
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [yearly, setYearly] = useState<YearlySummary | null>(null);

  useEffect(() => {
    getStats().then(setStats);
    getYearlySummary().then(setYearly);
  }, []);
  const sectionDelays = useStaggeredList({ itemCount: 8, staggerDelay: 60 });

  if (!stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.bgDark} />
        <View style={styles.loading}>
          <SkeletonBlock width={200} height={24} borderRadius={12} />
          <SkeletonBlock width="80%" height={16} style={{ marginTop: 16 }} />
          <SkeletonBlock width="60%" height={16} style={{ marginTop: 12 }} />
          <SkeletonBlock width="90%" height={16} style={{ marginTop: 12 }} />
          <SkeletonBlock width="70%" height={16} style={{ marginTop: 12 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bgDark} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { maxWidth: layout.contentMaxWidth, paddingHorizontal: layout.gutter },
        ]}
      >
        <Text style={styles.pageTitle}>{t('statsPageHeader')}</Text>

        <AnimatedCard delay={sectionDelays[0].delay}>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiNumber}>{stats.totalDraws}</Text>
              <Text style={styles.kpiLabel}>{t('statsTotalDraws')}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiNumber}>{stats.favorites}</Text>
              <Text style={styles.kpiLabel}>{t('statsFavorites')}</Text>
            </View>
          </View>
        </AnimatedCard>

        <View style={[styles.sectionGrid, layout.isDesktop && styles.sectionGridDesktop]}>
          <AnimatedCard delay={sectionDelays[1].delay}>
            <View style={[styles.section, layout.isDesktop && styles.sectionGridItem]}>
              <Text style={styles.sectionTitle}>{t('statsVerificationTitle')}</Text>
              <View style={styles.verificationRow}>
                <StatPill label={t('poemVerifyPending')} value={stats.verification.pending} color={theme.warning} />
                <StatPill label={t('poemVerified')} value={stats.verification.matched} color={theme.success} />
                <StatPill label={t('poemUnmatched')} value={stats.verification.unmatched} color={theme.danger} />
              </View>
            </View>
          </AnimatedCard>

          <AnimatedCard delay={sectionDelays[2].delay}>
            <View style={[styles.section, layout.isDesktop && styles.sectionGridItem]}>
              <Text style={styles.sectionTitle}>{t('statsTopGod')}</Text>
              <View style={styles.highlightRow}>
                <Text style={styles.highlightName}>{stats.topGod.name}</Text>
                <Text style={styles.highlightCount}>{stats.topGod.count} 次</Text>
              </View>
            </View>
          </AnimatedCard>

          <AnimatedCard delay={sectionDelays[3].delay}>
            <View style={[styles.section, layout.isDesktop && styles.sectionGridItem]}>
              <Text style={styles.sectionTitle}>{t('statsTopCategory')}</Text>
              <View style={styles.highlightRow}>
                <Text style={styles.highlightName}>{stats.topCategory.name}</Text>
                <Text style={styles.highlightCount}>{stats.topCategory.count} 次</Text>
              </View>
            </View>
          </AnimatedCard>
        </View>

        {stats.topPoems.length > 0 ? (
          <AnimatedCard delay={sectionDelays[4].delay}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('statsTopPoems')}</Text>
              {stats.topPoems.map((poem, index) => (
                <View key={poem.number} style={styles.rankRow}>
                  <Text style={styles.rankNum}>#{index + 1}</Text>
                  <Text style={styles.rankName}>第 {poem.number} 籤</Text>
                  <Text style={styles.rankCount}>{poem.count} 次</Text>
                </View>
              ))}
            </View>
          </AnimatedCard>
        ) : null}

        <AnimatedCard delay={sectionDelays[5].delay}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('statsLevelDistribution')}</Text>
          <View style={styles.levelBar}>
            {stats.levelDistribution.map((item) => (
              <View key={item.level} style={styles.levelRow}>
                <Text style={styles.levelName}>{item.level}</Text>
                <View style={styles.levelBarTrack}>
                  <View
                    style={[
                      styles.levelBarFill,
                      {
                        width: `${Math.min(
                          (item.count / Math.max(1, stats.totalDraws)) * 100,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.levelCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
        </AnimatedCard>

        {stats.weeklyDraws.length > 0 ? (
          <AnimatedCard delay={sectionDelays[6].delay}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('statsWeeklyTitle')}</Text>
              <WeeklyChart data={stats.weeklyDraws} />
            </View>
          </AnimatedCard>
        ) : null}

        {yearly ? (
          <AnimatedCard delay={sectionDelays[7].delay}>
            <YearlySummaryCard summary={yearly} />
          </AnimatedCard>
        ) : null}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={[styles.pill, { borderColor: color + '55' }]}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

function WeeklyChart({ data }: { data: Stats['weeklyDraws'] }) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <View style={styles.weekChart}>
      {data.map((item) => (
        <View key={item.day} style={styles.weekCol}>
          <Text style={styles.weekCount}>{item.count}</Text>
          <View style={styles.weekBarTrack}>
            <View
              style={[
                styles.weekBarFill,
                { height: `${Math.round((item.count / max) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.weekDay}>{item.day}</Text>
        </View>
      ))}
    </View>
  );
}

function YearlySummaryCard({ summary }: { summary: YearlySummary }) {
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const yearlyStyles = useMemo(() => createYearlyStyles(theme), [theme]);
  const luckyColor =
    summary.luckyRate >= 50
      ? theme.success
      : summary.luckyRate >= 30
        ? theme.warning
        : theme.danger;

  const statItems = [
    {
      icon: '🏛️',
      label: t('statsYearlyTopGod'),
      value: summary.topGod?.name ?? t('statsYearlyNoData'),
      sub: summary.topGod ? `${summary.topGod.count} 次` : '',
    },
    {
      icon: '🧭',
      label: t('statsYearlyTopCategory'),
      value: summary.topCategory?.name ?? t('statsYearlyNoData'),
      sub: summary.topCategory ? `${summary.topCategory.count} 次` : '',
    },
    {
      icon: '🎋',
      label: t('statsYearlyTopPoem'),
      value: summary.topPoem ? `第 ${summary.topPoem.number} 籤` : t('statsYearlyNoData'),
      sub: summary.topPoem?.level ?? '',
    },
    {
      icon: '📅',
      label: t('statsYearlyPeakMonth'),
      value: summary.peakMonth ?? t('statsYearlyNoData'),
      sub: '',
    },
    {
      icon: '🔥',
      label: t('statsYearlyStreak'),
      value: `${summary.longestStreak} 天`,
      sub: '',
    },
    {
      icon: '⏰',
      label: t('statsYearlyWeekday'),
      value: summary.mostActiveWeekday ?? t('statsYearlyNoData'),
      sub: '',
    },
  ];

  return (
    <View style={yearlyStyles.card}>
      <View style={yearlyStyles.titleRow}>
        <Text style={yearlyStyles.title}>{t('statsYearlyTitle', { year: summary.year })}</Text>
        <Text style={yearlyStyles.totalBadge}>{t('statsYearlyTotal', { count: summary.totalDraws })}</Text>
      </View>

      <View style={yearlyStyles.luckySection}>
        <Text style={yearlyStyles.luckySub}>{t('statsYearlyLuckyRate')}</Text>
        <Text style={[yearlyStyles.luckyRate, { color: luckyColor }]}>{summary.luckyRate}%</Text>
        <View style={yearlyStyles.luckyBarTrack}>
          <View
            style={[
              yearlyStyles.luckyBarFill,
              { width: `${summary.luckyRate}%`, backgroundColor: luckyColor },
            ]}
          />
        </View>
      </View>

      <View style={yearlyStyles.divider} />

      <View style={yearlyStyles.grid}>
        {statItems.map((item) => (
          <View key={item.label} style={yearlyStyles.gridItem}>
            <Text style={yearlyStyles.gridIcon}>{item.icon}</Text>
            <Text style={yearlyStyles.gridLabel}>{item.label}</Text>
            <Text style={yearlyStyles.gridValue} numberOfLines={1}>
              {item.value}
            </Text>
            {item.sub ? <Text style={yearlyStyles.gridSub}>{item.sub}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function createYearlyStyles(theme: ThemeColors) {
  return StyleSheet.create({
  card: {
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.goldDark + '50',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TempleSpacing.md,
  },
  title: {
    fontSize: TempleFonts.body,
    fontWeight: '900',
    color: theme.goldLight,
    letterSpacing: 1,
  },
  totalBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.bgDark,
    backgroundColor: theme.gold,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  luckySection: { alignItems: 'center', marginBottom: TempleSpacing.md },
  luckySub: { fontSize: 11, color: theme.textMuted, marginBottom: 4 },
  luckyRate: { fontSize: 52, fontWeight: '900', lineHeight: 58 },
  luckyBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: theme.bgDark + '60',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 8,
  },
  luckyBarFill: { height: '100%', borderRadius: 4, minWidth: 4 },
  divider: {
    height: 1,
    backgroundColor: theme.goldDark + '20',
    marginBottom: TempleSpacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: TempleSpacing.sm },
  gridItem: {
    width: '30%',
    flex: 1,
    backgroundColor: theme.bgDark + '40',
    borderRadius: 10,
    padding: TempleSpacing.sm,
    alignItems: 'center',
    minWidth: 90,
  },
  gridIcon: { fontSize: 20, marginBottom: 2 },
  gridLabel: { fontSize: 10, color: theme.textMuted, marginBottom: 2 },
  gridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.goldLight,
    textAlign: 'center',
  },
  gridSub: { fontSize: 10, color: theme.gold, marginTop: 1 },
  });
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bgDark },
  container: { flex: 1 },
  content: { paddingVertical: TempleSpacing.md, width: '100%', alignSelf: 'center' },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: theme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.lg,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.bgDark,
  },
  loadingText: { color: theme.textMuted },
  kpiRow: { flexDirection: 'row', gap: TempleSpacing.sm, marginBottom: TempleSpacing.lg },
  kpiCard: {
    flex: 1,
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    padding: TempleSpacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
  },
  kpiNumber: { fontSize: 36, fontWeight: '900', color: theme.goldLight },
  kpiLabel: { fontSize: TempleFonts.small, color: theme.textMuted, marginTop: 4 },
  section: {
    backgroundColor: theme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    borderWidth: 1,
    borderColor: theme.goldDark + '20',
  },
  sectionGrid: {},
  sectionGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  sectionGridItem: {
    flex: 1,
    minWidth: 300,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: theme.goldLight,
    marginBottom: TempleSpacing.sm,
  },
  verificationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TempleSpacing.sm,
  },
  pill: {
    flex: 1,
    minWidth: 88,
    borderWidth: 1,
    borderRadius: 12,
    padding: TempleSpacing.sm,
    backgroundColor: theme.bgDark + '45',
    alignItems: 'center',
  },
  pillValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  pillLabel: {
    marginTop: 4,
    fontSize: 11,
    color: theme.textMuted,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.bgDark + '40',
    padding: TempleSpacing.sm,
    borderRadius: 8,
  },
  highlightName: { fontSize: TempleFonts.body, color: theme.textLight, fontWeight: '600' },
  highlightCount: { fontSize: TempleFonts.body, color: theme.gold, fontWeight: '700' },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.goldDark + '10',
  },
  rankNum: { width: 30, fontSize: TempleFonts.small, color: theme.textMuted },
  rankName: { flex: 1, fontSize: TempleFonts.small, color: theme.textLight },
  rankCount: { fontSize: TempleFonts.small, color: theme.gold, fontWeight: '600' },
  levelBar: { gap: 6 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: TempleSpacing.sm },
  levelName: { width: 70, fontSize: 12, color: theme.textLight, fontWeight: '600' },
  levelBarTrack: {
    flex: 1,
    height: 16,
    backgroundColor: theme.bgDark + '60',
    borderRadius: 8,
    overflow: 'hidden',
  },
  levelBarFill: {
    height: '100%',
    backgroundColor: theme.goldDark,
    borderRadius: 8,
    minWidth: 4,
  },
  levelCount: { width: 30, fontSize: 12, color: theme.textMuted, textAlign: 'right' },
  weekChart: { flexDirection: 'row', alignItems: 'flex-end', gap: TempleSpacing.xs, height: 100 },
  weekCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  weekCount: { fontSize: 10, color: theme.textMuted, marginBottom: 2 },
  weekBarTrack: {
    width: '70%',
    backgroundColor: theme.bgDark + '60',
    borderRadius: 4,
    overflow: 'hidden',
    minHeight: 4,
    justifyContent: 'flex-end',
  },
  weekBarFill: {
    width: '100%',
    backgroundColor: theme.goldDark,
    borderRadius: 4,
    minHeight: 4,
  },
  weekDay: { fontSize: 10, color: theme.textMuted, marginTop: 4 },
  });
}
