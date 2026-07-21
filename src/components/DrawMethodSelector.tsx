import React, { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import type { DrawMethod } from '@/hooks/useDivination';

interface DrawMethodSelectorProps {
  godName?: string;
  onSelect: (method: DrawMethod) => void;
}

const methodOptions: {
  id: DrawMethod;
  title: string;
  subtitle: string;
  desc: string;
  badge?: string;
  icon: string;
}[] = [
  {
    id: 'jiaobei-shake',
    title: '傳統擲筊搖籤',
    subtitle: '聖筊後親自搖籤筒',
    desc: '保留完整儀式感，適合手機或可拖曳操作的裝置。',
    badge: '最傳統',
    icon: '🎋',
  },
  {
    id: 'jiaobei-auto',
    title: '擲筊後自動開籤',
    subtitle: '請示神明後直接開籤',
    desc: '適合網頁版或不方便搖籤筒時使用，仍保留擲筊請示。',
    badge: Platform.OS === 'web' ? '網頁推薦' : undefined,
    icon: '🌓',
  },
  {
    id: 'direct',
    title: '直接點籤',
    subtitle: '一念既定，直接抽籤',
    desc: '省略擲筊與搖籤，適合快速請示、回顧或操作不便時。',
    icon: '☝️',
  },
  {
    id: 'number',
    title: '心中報數',
    subtitle: '以心中浮現的數字取籤',
    desc: '輸入一個自然浮現的數字，由數字轉成抽籤種子。',
    icon: '🔢',
  },
];

export function DrawMethodSelector({ godName = '神明', onSelect }: DrawMethodSelectorProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>求籤方式</Text>
        <Text style={styles.title}>選擇抽籤方式</Text>
        <Text style={styles.subtitle}>向{godName}請示前，選一種最適合你現在裝置與心境的方式。</Text>
      </View>

      <View style={styles.grid}>
        {methodOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.card, option.badge && styles.cardRecommended]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel={option.title}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.icon}>{option.icon}</Text>
              {option.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{option.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.cardTitle}>{option.title}</Text>
            <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
            <Text style={styles.cardDesc}>{option.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>網頁版提示</Text>
        <Text style={styles.noteText}>如果無法拖曳或晃動籤筒，建議選「擲筊後自動開籤」或「心中報數」。抽籤結果仍會保存、解籤與回訪。</Text>
      </View>
    </ScrollView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    scroll: { padding: TempleSpacing.lg, paddingBottom: TempleSpacing.xxl, alignItems: 'center' },
    header: { alignItems: 'center', marginBottom: TempleSpacing.lg, maxWidth: 620 },
    eyebrow: { color: theme.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 6 },
    title: { color: theme.goldLight, fontSize: TempleFonts.subtitle, fontWeight: '900', marginBottom: 8 },
    subtitle: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 22, textAlign: 'center' },
    grid: { width: '100%', maxWidth: 760, gap: TempleSpacing.sm },
    card: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '30',
      padding: TempleSpacing.md,
    },
    cardRecommended: { borderColor: theme.gold + '88', backgroundColor: theme.goldDark + '18' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    icon: { fontSize: 28 },
    badge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: theme.goldDark + '55' },
    badgeText: { color: theme.goldLight, fontSize: 11, fontWeight: '800' },
    cardTitle: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '900', marginBottom: 4 },
    cardSubtitle: { color: theme.textLight, fontSize: TempleFonts.small, fontWeight: '700', marginBottom: 6 },
    cardDesc: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 20 },
    noteCard: {
      width: '100%',
      maxWidth: 760,
      marginTop: TempleSpacing.md,
      padding: TempleSpacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.warning + '45',
      backgroundColor: theme.warning + '12',
    },
    noteTitle: { color: theme.goldLight, fontSize: TempleFonts.small, fontWeight: '900', marginBottom: 5 },
    noteText: { color: theme.textMuted, fontSize: 12, lineHeight: 19 },
  });
}