// 統計儀表板
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { getStats, type Stats } from '@/services/statsService';

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getStats().then(setStats);
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

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
