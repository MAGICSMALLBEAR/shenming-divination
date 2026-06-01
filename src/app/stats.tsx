// 統計儀表板
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
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
        <View style={styles.loading}><Text style={styles.loadingText}>載入中...</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>📊 求籤統計</Text>

        {/* KPI 卡片 */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiNumber}>{stats.totalDraws}</Text>
            <Text style={styles.kpiLabel}>總求籤次數</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiNumber}>{stats.favorites}</Text>
            <Text style={styles.kpiLabel}>收藏籤詩</Text>
          </View>
        </View>

        {/* 最常求的神明 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏛️ 最常求的神明</Text>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightName}>{stats.topGod.name}</Text>
            <Text style={styles.highlightCount}>{stats.topGod.count} 次</Text>
          </View>
        </View>

        {/* 最常問的事 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 最常問的事</Text>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightName}>{stats.topCategory.name}</Text>
            <Text style={styles.highlightCount}>{stats.topCategory.count} 次</Text>
          </View>
        </View>

        {/* 最常抽到的籤 */}
        {stats.topPoems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎋 最常抽到的籤</Text>
            {stats.topPoems.map((p, i) => (
              <View key={i} style={styles.rankRow}>
                <Text style={styles.rankNum}>#{i + 1}</Text>
                <Text style={styles.rankName}>第 {p.number} 籤</Text>
                <Text style={styles.rankCount}>{p.count} 次</Text>
              </View>
            ))}
          </View>
        )}

        {/* 吉凶分佈 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 籤運分佈</Text>
          <View style={styles.levelBar}>
            {stats.levelDistribution.map((l, i) => (
              <View key={i} style={styles.levelRow}>
                <Text style={styles.levelName}>{l.level}</Text>
                <View style={styles.levelBarTrack}>
                  <View style={[styles.levelBarFill, { width: `${Math.min((l.count / Math.max(1, stats.totalDraws)) * 100, 100)}%` }]} />
                </View>
                <Text style={styles.levelCount}>{l.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 近期求籤紀錄 */}
        {stats.weeklyDraws.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 近期求籤</Text>
            {(() => {
              const max = Math.max(...stats.weeklyDraws.map(d => d.count), 1);
              return (
                <View style={styles.weekChart}>
                  {stats.weeklyDraws.map((d, i) => (
                    <View key={i} style={styles.weekCol}>
                      <Text style={styles.weekCount}>{d.count}</Text>
                      <View style={styles.weekBarTrack}>
                        <View style={[styles.weekBarFill, { height: `${Math.round((d.count / max) * 100)}%` }]} />
                      </View>
                      <Text style={styles.weekDay}>{d.day}</Text>
                    </View>
                  ))}
                </View>
              );
            })()}
          </View>
        )}

        {/* 年度回顧 */}
        {yearly && <YearlySummaryCard summary={yearly} />}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 年度回顧卡 ───────────────────────────────────────────────
function YearlySummaryCard({ summary }: { summary: YearlySummary }) {
  const luckyColor =
    summary.luckyRate >= 50 ? TempleTheme.success :
    summary.luckyRate >= 30 ? TempleTheme.warning : TempleTheme.danger;

  const statItems = [
    { icon: '🏛️', label: '最常拜',   value: summary.topGod?.name ?? '—',       sub: summary.topGod ? `${summary.topGod.count} 次` : '' },
    { icon: '📝', label: '最常問',   value: summary.topCategory?.name ?? '—',   sub: summary.topCategory ? `${summary.topCategory.count} 次` : '' },
    { icon: '🎋', label: '最常籤',   value: summary.topPoem ? `第 ${summary.topPoem.number} 籤` : '—', sub: summary.topPoem?.level ?? '' },
    { icon: '📅', label: '最愛月份', value: summary.peakMonth ?? '—',            sub: '' },
    { icon: '🔥', label: '最長連求', value: `${summary.longestStreak} 天`,       sub: '' },
    { icon: '🗓️', label: '最常',     value: summary.mostActiveWeekday ?? '—',   sub: '求籤' },
  ];

  return (
    <View style={yStyles.card}>
      {/* 標題 */}
      <View style={yStyles.titleRow}>
        <Text style={yStyles.title}>✨ {summary.year} 年度回顧</Text>
        <Text style={yStyles.totalBadge}>{summary.totalDraws} 次求籤</Text>
      </View>

      {/* 籤運占比 */}
      <View style={yStyles.luckySection}>
        <Text style={yStyles.luckySub}>今年吉籤率</Text>
        <Text style={[yStyles.luckyRate, { color: luckyColor }]}>{summary.luckyRate}%</Text>
        <View style={yStyles.luckyBarTrack}>
          <View style={[yStyles.luckyBarFill, { width: `${summary.luckyRate}%` as any, backgroundColor: luckyColor }]} />
        </View>
        <Text style={yStyles.luckyDesc}>
          {summary.luckyRate >= 60 ? '今年鴻運當頭，神明特別眷顧！' :
           summary.luckyRate >= 40 ? '今年運勢平穩，中吉居多。' :
           '今年多磨礪，修身積德明年更旺！'}
        </Text>
      </View>

      <View style={yStyles.divider} />

      {/* 6 格統計 */}
      <View style={yStyles.grid}>
        {statItems.map((item, i) => (
          <View key={i} style={yStyles.gridItem}>
            <Text style={yStyles.gridIcon}>{item.icon}</Text>
            <Text style={yStyles.gridLabel}>{item.label}</Text>
            <Text style={yStyles.gridValue} numberOfLines={1}>{item.value}</Text>
            {item.sub ? <Text style={yStyles.gridSub}>{item.sub}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const yStyles = StyleSheet.create({
  card: {
    backgroundColor: TempleTheme.bgCard, borderRadius: 16,
    borderWidth: 1.5, borderColor: TempleTheme.goldDark + '50',
    padding: TempleSpacing.md, marginBottom: TempleSpacing.md,
    overflow: 'hidden',
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: TempleSpacing.md },
  title: { fontSize: TempleFonts.body, fontWeight: '900', color: TempleTheme.goldLight, letterSpacing: 1 },
  totalBadge: {
    fontSize: 11, fontWeight: '700', color: TempleTheme.bgDark,
    backgroundColor: TempleTheme.gold, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
  },
  luckySection: { alignItems: 'center', marginBottom: TempleSpacing.md },
  luckySub: { fontSize: 11, color: TempleTheme.textMuted, marginBottom: 4 },
  luckyRate: { fontSize: 52, fontWeight: '900', lineHeight: 58 },
  luckyBarTrack: {
    width: '100%', height: 8, backgroundColor: TempleTheme.bgDark + '60',
    borderRadius: 4, overflow: 'hidden', marginTop: 6, marginBottom: 8,
  },
  luckyBarFill: { height: '100%', borderRadius: 4, minWidth: 4 },
  luckyDesc: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, textAlign: 'center', fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: TempleTheme.goldDark + '20', marginBottom: TempleSpacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: TempleSpacing.sm },
  gridItem: {
    width: '30%', flex: 1,
    backgroundColor: TempleTheme.bgDark + '40', borderRadius: 10,
    padding: TempleSpacing.sm, alignItems: 'center', minWidth: 90,
  },
  gridIcon: { fontSize: 20, marginBottom: 2 },
  gridLabel: { fontSize: 10, color: TempleTheme.textMuted, marginBottom: 2 },
  gridValue: { fontSize: 13, fontWeight: '700', color: TempleTheme.goldLight, textAlign: 'center' },
  gridSub: { fontSize: 10, color: TempleTheme.gold, marginTop: 1 },
});
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  container: { flex: 1 },
  content: { padding: TempleSpacing.md },
  pageTitle: {
    fontSize: TempleFonts.subtitle, fontWeight: '900',
    color: TempleTheme.goldLight, textAlign: 'center', marginBottom: TempleSpacing.lg,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: TempleTheme.bgDark },
  loadingText: { color: TempleTheme.textMuted },
  kpiRow: { flexDirection: 'row', gap: TempleSpacing.sm, marginBottom: TempleSpacing.lg },
  kpiCard: {
    flex: 1, backgroundColor: TempleTheme.bgCard, borderRadius: 16, padding: TempleSpacing.lg,
    alignItems: 'center', borderWidth: 1, borderColor: TempleTheme.goldDark + '30',
  },
  kpiNumber: { fontSize: 36, fontWeight: '900', color: TempleTheme.goldLight },
  kpiLabel: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, marginTop: 4 },
  section: {
    backgroundColor: TempleTheme.bgCard, borderRadius: 12, padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md, borderWidth: 1, borderColor: TempleTheme.goldDark + '20',
  },
  sectionTitle: {
    fontSize: TempleFonts.body, fontWeight: '700', color: TempleTheme.goldLight, marginBottom: TempleSpacing.sm,
  },
  highlightRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: TempleTheme.bgDark + '40', padding: TempleSpacing.sm, borderRadius: 8,
  },
  highlightName: { fontSize: TempleFonts.body, color: TempleTheme.textLight, fontWeight: '600' },
  highlightCount: { fontSize: TempleFonts.body, color: TempleTheme.gold, fontWeight: '700' },
  rankRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: TempleTheme.goldDark + '10',
  },
  rankNum: { width: 30, fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  rankName: { flex: 1, fontSize: TempleFonts.small, color: TempleTheme.textLight },
  rankCount: { fontSize: TempleFonts.small, color: TempleTheme.gold, fontWeight: '600' },
  levelBar: { gap: 6 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: TempleSpacing.sm },
  levelName: { width: 50, fontSize: 12, color: TempleTheme.textLight, fontWeight: '600' },
  levelBarTrack: { flex: 1, height: 16, backgroundColor: TempleTheme.bgDark + '60', borderRadius: 8, overflow: 'hidden' },
  levelBarFill: { height: '100%', backgroundColor: TempleTheme.goldDark, borderRadius: 8, minWidth: 4 },
  levelCount: { width: 30, fontSize: 12, color: TempleTheme.textMuted, textAlign: 'right' },
  weekChart: { flexDirection: 'row', alignItems: 'flex-end', gap: TempleSpacing.xs, height: 100 },
  weekCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  weekCount: { fontSize: 10, color: TempleTheme.textMuted, marginBottom: 2 },
  weekBarTrack: { width: '70%', backgroundColor: TempleTheme.bgDark + '60', borderRadius: 4, overflow: 'hidden', minHeight: 4, justifyContent: 'flex-end' },
  weekBarFill: { width: '100%', backgroundColor: TempleTheme.goldDark, borderRadius: 4, minHeight: 4 },
  weekDay: { fontSize: 10, color: TempleTheme.textMuted, marginTop: 4 },
});
