import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import type { ThemeColors } from '@/constants/themes';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { DailyDeityOracle } from '@/services/dailyDeityOracle';

interface DailyDeityCardProps {
  oracle: DailyDeityOracle;
  onConsult: () => void;
}

export function DailyDeityCard({ oracle, onConsult }: DailyDeityCardProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [expanded, setExpanded] = useState(false);
  const poemLines = oracle.poem.content.split(/\\n|\n/).filter(Boolean);

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: oracle.god.accentColor + '70',
          backgroundColor: theme.bgCard,
        },
      ]}
      accessibilityLabel={`神明日課，今日神明${oracle.god.name}`}
    >
      <View style={[styles.aura, { backgroundColor: oracle.god.auraColor + '22' }]} />

      <View style={styles.headerRow}>
        <View style={[styles.portraitFrame, { borderColor: oracle.god.accentColor + '88' }]}>
          <Image source={oracle.god.image} style={styles.portrait} contentFit={'cover'} contentPosition={'top'} />
          <View style={[styles.portraitVeil, { backgroundColor: oracle.god.primaryColor + '12' }]} />
        </View>

        <View style={styles.identity}>
          <View style={styles.eyebrowRow}>
            <Text style={[styles.eyebrow, { color: oracle.god.accentColor }]}>神明日課</Text>
            <Text style={styles.date}>{oracle.dateKey.replaceAll('-', '/')}</Text>
          </View>
          <Text style={styles.godName}>{oracle.god.name}</Text>
          <Text style={[styles.godTitle, { color: oracle.god.accentColor }]}>{oracle.god.title}</Text>
          <Text style={styles.reason}>{oracle.reasonLabel}</Text>
        </View>
      </View>

      <View style={[styles.poemPanel, { borderColor: oracle.god.accentColor + '38' }]}>
        <View style={styles.poemMetaRow}>
          <Text style={[styles.poemBadge, { color: oracle.god.accentColor }]}>
            今日籤語 · 第 {oracle.poem.number} 籤
          </Text>
          <Text style={styles.poemLevel}>{oracle.poem.level}</Text>
        </View>
        <Text style={styles.poemTitle}>{oracle.poem.title}</Text>
        {poemLines.map((line, index) => (
          <Text key={`${oracle.poem.id}-${index}`} style={styles.poemLine}>{line}</Text>
        ))}
      </View>

      <View style={styles.messageBlock}>
        <Text style={styles.messageLabel}>今日提醒</Text>
        <Text style={styles.message}>{oracle.dailyMessage}</Text>
        <Text style={styles.action}>今日行動：{oracle.dailyAction}</Text>
      </View>

      {expanded ? (
        <View style={styles.details}>
          <Text style={styles.detailLabel}>白話籤意</Text>
          <Text style={styles.detailText}>{oracle.poem.vernacular}</Text>
          <Text style={styles.disclaimer}>
            神明日課供每日閱讀與自我反思，不等同正式求籤。若有明確問題，可依完整儀式向神明請示。
          </Text>
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setExpanded((value) => !value)}
          accessibilityRole={'button'}
          accessibilityLabel={expanded ? '收起神明日課解說' : '展開神明日課解說'}
        >
          <Text style={styles.secondaryButtonText}>{expanded ? '收起解說' : '查看解說'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: oracle.god.primaryColor, borderColor: oracle.god.accentColor }]}
          onPress={onConsult}
          accessibilityRole={'button'}
          accessibilityLabel={`向${oracle.god.name}正式求籤`}
        >
          <Text style={styles.primaryButtonText}>向此神明正式求籤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    card: {
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      borderWidth: 1,
      borderRadius: 18,
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    aura: {
      position: 'absolute',
      width: 240,
      height: 240,
      borderRadius: 120,
      top: -110,
      right: -80,
    },
    headerRow: { flexDirection: 'row', gap: TempleSpacing.md, alignItems: 'center' },
    portraitFrame: {
      width: 96,
      height: 118,
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
      backgroundColor: theme.bgDark,
    },
    portrait: { width: '100%', height: '100%' },
    portraitVeil: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    identity: { flex: 1, minWidth: 0 },
    eyebrowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    eyebrow: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
    date: { color: theme.textMuted, fontSize: 11 },
    godName: { color: theme.goldLight, fontSize: 25, fontWeight: '900', marginTop: 6 },
    godTitle: { fontSize: 12, fontWeight: '700', marginTop: 2 },
    reason: { color: theme.textMuted, fontSize: 12, lineHeight: 18, marginTop: 8 },
    poemPanel: {
      marginTop: TempleSpacing.md,
      borderWidth: 1,
      borderRadius: 14,
      padding: TempleSpacing.md,
      backgroundColor: theme.bgDark + '70',
      alignItems: 'center',
    },
    poemMetaRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    poemBadge: { fontSize: 12, fontWeight: '800' },
    poemLevel: { color: theme.textMuted, fontSize: 11 },
    poemTitle: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '800', marginVertical: 10 },
    poemLine: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 25, textAlign: 'center' },
    messageBlock: { paddingTop: TempleSpacing.md },
    messageLabel: { color: theme.gold, fontSize: 12, fontWeight: '800', marginBottom: 5 },
    message: { color: theme.textLight, fontSize: TempleFonts.small, lineHeight: 21 },
    action: { color: theme.goldLight, fontSize: TempleFonts.small, lineHeight: 20, marginTop: 8, fontWeight: '700' },
    details: { borderTopWidth: 1, borderTopColor: theme.goldDark + '28', marginTop: 12, paddingTop: 12 },
    detailLabel: { color: theme.gold, fontSize: 12, fontWeight: '800', marginBottom: 5 },
    detailText: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 20 },
    disclaimer: { color: theme.textMuted, opacity: 0.78, fontSize: 11, lineHeight: 17, marginTop: 10 },
    actionRow: { flexDirection: 'row', gap: 10, marginTop: TempleSpacing.md },
    secondaryButton: {
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '55',
      justifyContent: 'center',
    },
    secondaryButtonText: { color: theme.gold, fontSize: 12, fontWeight: '700' },
    primaryButton: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: { color: '#FFF8E7', fontSize: 12, fontWeight: '900' },
  });
}
