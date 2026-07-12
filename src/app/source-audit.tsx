import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { auditAllOracles, type OracleAuditRow } from '@/services/oracleAudit';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';

function statusLabel(row: OracleAuditRow) {
  if (row.status === 'critical') return '需要修補';
  if (row.status === 'review') return '等待校勘';
  return '結構完整';
}

export default function SourceAuditScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const audit = useMemo(() => auditAllOracles(), []);
  const rows = audit.rows;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>籤詩版本校勘</Text>
        <Text style={styles.subtitle}>檢視每位神明目前使用的籤詩系統、來源型態與版本標記。</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{audit.completeCount} / {rows.length}</Text>
          <Text style={styles.summaryLabel}>套籤系結構完整</Text>
          <Text style={styles.summaryText}>目前共映射 {audit.totalMappedPoems} 首籤詩；{audit.criticalCount} 套有結構缺口，{audit.reviewCount} 套等待來源或重複內容校勘。部分籤系統為 App 白話整理版，後續仍可補逐字傳統定本、異文與宮廟來源索引。</Text>
        </View>

        {rows.map((row) => {
          const { god, catalog } = row;
          return (
          <View key={god.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleGroup}>
                <Text style={styles.godName}>{god.name}</Text>
                <Text style={styles.systemName}>{catalog.label} · {catalog.totalPoems} 首</Text>
              </View>
              <View style={[styles.statusPill, { borderColor: god.accentColor + '66' }]}>
                <Text style={[styles.statusText, { color: god.accentColor }]}>{statusLabel(row)}</Text>
              </View>
            </View>

            <Text style={styles.sourceNote}>{catalog.sourceNote}</Text>
            <Text style={styles.versionText}>版本：{catalog.versionTag}</Text>
            <Text style={styles.auditText}>欄位完整度 {row.completenessPercent}% · 原文唯一 {row.uniqueContentCount}/{row.poemCount}</Text>
            <Text style={styles.metaTitle}>完整度</Text>
            <Text style={styles.metaText}>{catalog.completenessNote}</Text>
            <Text style={styles.metaTitle}>適用題型</Text>
            <Text style={styles.metaText}>{catalog.suitabilityNote}</Text>
            {row.errors.map((issue) => <Text key={`error-${god.id}-${issue}`} style={styles.errorText}>需修補：{issue}</Text>)}
            {row.warnings.map((issue) => <Text key={`warning-${god.id}-${issue}`} style={styles.warningText}>待校勘：{issue}</Text>)}
            <View style={styles.chipRow}>
              {catalog.strengths.map((item) => (
                <View key={`${god.id}-${item}`} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
          );
        })}

        <View style={styles.nextCard}>
          <Text style={styles.nextTitle}>建議校勘流程</Text>
          <Text style={styles.nextText}>1. 先確定每套籤詩的授權與來源。</Text>
          <Text style={styles.nextText}>2. 對照宮廟版本、民間流通本與異文。</Text>
          <Text style={styles.nextText}>3. 將逐字原文、白話整理、AI 解讀分層保存。</Text>
          <Text style={styles.nextText}>4. 每次修訂更新 versionTag 與 completenessNote。</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.bgDark },
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
    subtitle: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 20, marginTop: 4 },
    content: { padding: TempleSpacing.lg, paddingBottom: 60 },
    summaryCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '35',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    summaryNumber: { color: theme.goldLight, fontSize: 36, fontWeight: '900' },
    summaryLabel: { color: theme.textLight, fontSize: TempleFonts.body, fontWeight: '800', marginBottom: 8 },
    summaryText: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 22 },
    card: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '25',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: TempleSpacing.sm, marginBottom: 8 },
    cardTitleGroup: { flex: 1 },
    godName: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '900' },
    systemName: { color: theme.textLight, fontSize: TempleFonts.small, marginTop: 3 },
    statusPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
    statusText: { fontSize: 11, fontWeight: '800' },
    sourceNote: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 21, marginBottom: 8 },
    versionText: { color: theme.gold, fontSize: 12, fontWeight: '800', marginBottom: 8 },
    auditText: { color: theme.textLight, fontSize: 12, fontWeight: '700', marginBottom: 6 },
    errorText: { color: theme.danger, fontSize: 12, lineHeight: 18, marginTop: 5 },
    warningText: { color: theme.warning, fontSize: 12, lineHeight: 18, marginTop: 5 },
    metaTitle: { color: theme.goldLight, fontSize: 12, fontWeight: '800', marginTop: 6, marginBottom: 3 },
    metaText: { color: theme.textMuted, fontSize: 12, lineHeight: 18 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
    chip: { borderRadius: 999, borderWidth: 1, borderColor: theme.goldDark + '35', paddingHorizontal: 9, paddingVertical: 4 },
    chipText: { color: theme.textMuted, fontSize: 11, fontWeight: '700' },
    nextCard: {
      backgroundColor: theme.bgMedium,
      borderRadius: 12,
      padding: TempleSpacing.md,
      borderWidth: 1,
      borderColor: theme.goldDark + '30',
    },
    nextTitle: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '900', marginBottom: 8 },
    nextText: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 22 },
  });
}
