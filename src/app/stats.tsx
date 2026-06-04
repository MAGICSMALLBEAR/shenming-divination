import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import { getStats, getYearlySummary, type Stats, type YearlySummary } from '@/services/statsService';

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [yearly, setYearly] = useState<YearlySummary | null>(null);

  useEffect(() => {
    getStats().then(setStats);
    getYearlySummary().then(setYearly);
  }, []);

  if (!stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>整理統計中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>你的求籤統計</Text>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiNumber}>{stats.totalDraws}</Text>
            <Text style={styles.kpiLabel}>總抽籤次數</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiNumber}>{stats.favorites}</Text>
            <Text style={styles.kpiLabel}>收藏籤詩</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>應驗追蹤</Text>
          <View style={styles.verificationRow}>
            <StatPill label="待驗證" value={stats.verification.pending} color={TempleTheme.warning} />
            <StatPill label="已應驗" value={stats.verification.matched} color={TempleTheme.success} />
            <StatPill label="不太符合" value={stats.verification.unmatched} color={TempleTheme.danger} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最常請示的神明</Text>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightName}>{stats.topGod.name}</Text>
            <Text style={styles.highlightCount}>{stats.topGod.count} 次</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最常詢問的題型</Text>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightName}>{stats.topCategory.name}</Text>
            <Text style={styles.highlightCount}>{stats.topCategory.count} 次</Text>
          </View>
        </View>

        {stats.topPoems.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>最常抽到的籤</Text>
            {stats.topPoems.map((poem, index) => (
              <View key={poem.number} style={styles.rankRow}>
                <Text style={styles.rankNum}>#{index + 1}</Text>
                <Text style={styles.rankName}>第 {poem.number} 籤</Text>
                <Text style={styles.rankCount}>{poem.count} 次</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>吉凶分布</Text>
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

        {stats.weeklyDraws.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>最近七天的求籤節奏</Text>
            <WeeklyChart data={stats.weeklyDraws} />
          </View>
        ) : null}

        {yearly ? <YearlySummaryCard summary={yearly} /> : null}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.pill, { borderColor: color + '55' }]}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

function WeeklyChart({ data }: { data: Stats['weeklyDraws'] }) {
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
  const luckyColor =
    summary.luckyRate >= 50
      ? TempleTheme.success
      : summary.luckyRate >= 30
        ? TempleTheme.warning
        : TempleTheme.danger;

  const statItems = [
    {
      icon: '🏛️',
      label: '最常請示',
      value: summary.topGod?.name ?? '尚無資料',
      sub: summary.topGod ? `${summary.topGod.count} 次` : '',
    },
    {
      icon: '🧭',
      label: '最常題型',
      value: summary.topCategory?.name ?? '尚無資料',
      sub: summary.topCategory ? `${summary.topCategory.count} 次` : '',
    },
    {
      icon: '🎋',
      label: '最常抽到',
      value: summary.topPoem ? `第 ${summary.topPoem.number} 籤` : '尚無資料',
      sub: summary.topPoem?.level ?? '',
    },
    {
      icon: '📅',
      label: '最旺月份',
      value: summary.peakMonth ?? '尚無資料',
      sub: '',
    },
    {
      icon: '🔥',
      label: '連續紀錄',
      value: `${summary.longestStreak} 天`,
      sub: '',
    },
    {
      icon: '⏰',
      label: '最常求籤日',
      value: summary.mostActiveWeekday ?? '尚無資料',
      sub: '',
    },
  ];

  return (
    <View style={yearlyStyles.card}>
      <View style={yearlyStyles.titleRow}>
        <Text style={yearlyStyles.title}>{summary.year} 年回顧</Text>
        <Text style={yearlyStyles.totalBadge}>{summary.totalDraws} 次求籤</Text>
      </View>

      <View style={yearlyStyles.luckySection}>
        <Text style={yearlyStyles.luckySub}>吉籤比例</Text>
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

const yearlyStyles = StyleSheet.create({
  card: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: TempleTheme.goldDark + '50',
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
    color: TempleTheme.goldLight,
    letterSpacing: 1,
  },
  totalBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: TempleTheme.bgDark,
    backgroundColor: TempleTheme.gold,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  luckySection: { alignItems: 'center', marginBottom: TempleSpacing.md },
  luckySub: { fontSize: 11, color: TempleTheme.textMuted, marginBottom: 4 },
  luckyRate: { fontSize: 52, fontWeight: '900', lineHeight: 58 },
  luckyBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: TempleTheme.bgDark + '60',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 8,
  },
  luckyBarFill: { height: '100%', borderRadius: 4, minWidth: 4 },
  divider: {
    height: 1,
    backgroundColor: TempleTheme.goldDark + '20',
    marginBottom: TempleSpacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: TempleSpacing.sm },
  gridItem: {
    width: '30%',
    flex: 1,
    backgroundColor: TempleTheme.bgDark + '40',
    borderRadius: 10,
    padding: TempleSpacing.sm,
    alignItems: 'center',
    minWidth: 90,
  },
  gridIcon: { fontSize: 20, marginBottom: 2 },
  gridLabel: { fontSize: 10, color: TempleTheme.textMuted, marginBottom: 2 },
  gridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    textAlign: 'center',
  },
  gridSub: { fontSize: 10, color: TempleTheme.gold, marginTop: 1 },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  container: { flex: 1 },
  content: { padding: TempleSpacing.md },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.lg,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TempleTheme.bgDark,
  },
  loadingText: { color: TempleTheme.textMuted },
  kpiRow: { flexDirection: 'row', gap: TempleSpacing.sm, marginBottom: TempleSpacing.lg },
  kpiCard: {
    flex: 1,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 16,
    padding: TempleSpacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
  },
  kpiNumber: { fontSize: 36, fontWeight: '900', color: TempleTheme.goldLight },
  kpiLabel: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, marginTop: 4 },
  section: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
  },
  sectionTitle: {
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: TempleTheme.goldLight,
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
    backgroundColor: TempleTheme.bgDark + '45',
    alignItems: 'center',
  },
  pillValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  pillLabel: {
    marginTop: 4,
    fontSize: 11,
    color: TempleTheme.textMuted,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: TempleTheme.bgDark + '40',
    padding: TempleSpacing.sm,
    borderRadius: 8,
  },
  highlightName: { fontSize: TempleFonts.body, color: TempleTheme.textLight, fontWeight: '600' },
  highlightCount: { fontSize: TempleFonts.body, color: TempleTheme.gold, fontWeight: '700' },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '10',
  },
  rankNum: { width: 30, fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  rankName: { flex: 1, fontSize: TempleFonts.small, color: TempleTheme.textLight },
  rankCount: { fontSize: TempleFonts.small, color: TempleTheme.gold, fontWeight: '600' },
  levelBar: { gap: 6 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: TempleSpacing.sm },
  levelName: { width: 70, fontSize: 12, color: TempleTheme.textLight, fontWeight: '600' },
  levelBarTrack: {
    flex: 1,
    height: 16,
    backgroundColor: TempleTheme.bgDark + '60',
    borderRadius: 8,
    overflow: 'hidden',
  },
  levelBarFill: {
    height: '100%',
    backgroundColor: TempleTheme.goldDark,
    borderRadius: 8,
    minWidth: 4,
  },
  levelCount: { width: 30, fontSize: 12, color: TempleTheme.textMuted, textAlign: 'right' },
  weekChart: { flexDirection: 'row', alignItems: 'flex-end', gap: TempleSpacing.xs, height: 100 },
  weekCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  weekCount: { fontSize: 10, color: TempleTheme.textMuted, marginBottom: 2 },
  weekBarTrack: {
    width: '70%',
    backgroundColor: TempleTheme.bgDark + '60',
    borderRadius: 4,
    overflow: 'hidden',
    minHeight: 4,
    justifyContent: 'flex-end',
  },
  weekBarFill: {
    width: '100%',
    backgroundColor: TempleTheme.goldDark,
    borderRadius: 4,
    minHeight: 4,
  },
  weekDay: { fontSize: 10, color: TempleTheme.textMuted, marginTop: 4 },
});
