import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    id: 'shake',
    title: '完整儀式：搖籤驗籤',
    subtitle: '親自搖籤筒，抽出後驗籤',
    desc: '抽出一支籤後以連續三次聖筊確認；任一次未獲聖筊，就重新抽籤。',
    badge: '完整流程',
    icon: '🎋',
  },
  {
    id: 'auto',
    title: '快捷：自動抽籤',
    subtitle: '無須手動搖籤筒',
    desc: '系統抽出一支籤，之後仍需連續三次聖筊驗籤。',
    icon: '🌓',
  },
  {
    id: 'direct',
    title: '快捷：直接點籤',
    subtitle: '一念既定，直接抽籤',
    desc: '省略搖籤與驗籤，適合快速回顧或操作不便時。',
    icon: '☝️',
  },
  {
    id: 'number',
    title: '快捷：心中報數',
    subtitle: '以心中浮現的數字取籤',
    desc: '輸入一個自然浮現的數字取籤；此方式省略擲筊驗籤。',
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
        <Text style={styles.subtitle}>向{godName}求籤，可選擇適合裝置與心境的方式。</Text>
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
        <Text style={styles.noteText}>若不方便拖曳籤筒，可選「自動抽籤」後驗籤，或以「心中報數」快速取籤。</Text>
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
