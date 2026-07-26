// 拜拜指南 — 參拜禮儀知識頁面
import React, { useMemo, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFadeIn } from '@/hooks/useEntranceAnimation';
import { DecorativeBg } from '@/components/DecorativeBg';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import type { ThemeColors } from '@/constants/themes';
import { worshipGuides, type WorshipGuide } from '@/data/worshipGuide';

const GUIDES = worshipGuides;

function ChipItem({
  guide,
  index,
  isActive,
  onPress,
  theme,
}: {
  guide: WorshipGuide;
  index: number;
  isActive: boolean;
  onPress: () => void;
  theme: ThemeColors;
}) {
  const s = useMemo(() => createStyles(theme), [theme]);
  const { opacity, translateY } = useFadeIn({ delay: index * 40 });
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] } as any}>
      <TouchableOpacity
        style={[s.chip, isActive && s.chipActive]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[s.chipText, isActive && s.chipTextActive]}>
          {guide.godName}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function WorshipGuideScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const layout = useResponsiveLayout();
  const s = useMemo(() => createStyles(theme), [theme]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const guide = GUIDES[selectedIndex] ?? GUIDES[0];

  return (
    <SafeAreaView style={s.safe}>
      <DecorativeBg pattern="diamond" />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>🪔 拜拜指南</Text>
        <Text style={s.headerSubtitle}>認識參拜禮儀，誠心敬神有禮數</Text>
      </View>

      {/* God picker chips */}
      <View style={s.chipBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipScroll}
        >
          {GUIDES.map((g, i) => (
            <ChipItem
              key={g.godId}
              guide={g}
              index={i}
              isActive={i === selectedIndex}
              onPress={() => setSelectedIndex(i)}
              theme={theme}
            />
          ))}
        </ScrollView>
      </View>

      {/* Guide card */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.content,
          { maxWidth: layout.contentMaxWidth, alignSelf: 'center', width: '100%' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <GuideCard guide={guide} theme={theme} />
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function GuideCard({ guide, theme }: { guide: WorshipGuide; theme: ThemeColors }) {
  const s = useMemo(() => createStyles(theme), [theme]);
  const { opacity, translateY } = useFadeIn({ delay: 150 });

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }] as any}>
      {/* God name + category badge */}
      <View style={s.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.godName}>{guide.godName}</Text>
        </View>
        <View style={s.categoryBadge}>
          <Text style={s.categoryBadgeText}>{guide.category}</Text>
        </View>
      </View>

      {/* Offerings */}
      <SectionHeader emoji="🍎" title="推薦供品" theme={theme} />
      <View style={s.chipRow}>
        {guide.offerings.map((o, i) => (
          <View key={i} style={s.offeringChip}>
            <Text style={s.offeringChipText}>{o}</Text>
          </View>
        ))}
      </View>

      {/* Avoid offerings */}
      <SectionHeader emoji="🚫" title="避免供品" theme={theme} />
      <View style={s.chipRow}>
        {guide.avoidOfferings.map((o, i) => (
          <View key={i} style={s.avoidChip}>
            <Text style={s.avoidChipText}>{o}</Text>
          </View>
        ))}
      </View>

      {/* Incense count */}
      <SectionHeader emoji="🕯️" title="上香" theme={theme} />
      <Text style={s.infoText}>{guide.incense} 炷香（或三炷香插一爐）</Text>

      {/* Gold paper */}
      <SectionHeader emoji="📜" title="金紙" theme={theme} />
      <View style={s.chipRow}>
        {guide.goldPaper.map((g, i) => (
          <View key={i} style={s.goldChip}>
            <Text style={s.goldChipText}>{g}</Text>
          </View>
        ))}
      </View>

      {/* Steps */}
      <SectionHeader emoji="📋" title="參拜步驟" theme={theme} />
      <View style={s.stepCard}>
        {guide.steps.map((step, i) => (
          <View key={i} style={s.stepRow}>
            <View style={s.stepNum}>
              <Text style={s.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={s.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Taboos */}
      <SectionHeader emoji="⚠️" title="禁忌" theme={theme} />
      <View style={s.tabooCard}>
        {guide.taboos.map((taboo, i) => (
          <View key={i} style={s.tabooRow}>
            <Text style={s.tabooIcon}>⚠</Text>
            <Text style={s.tabooText}>{taboo}</Text>
          </View>
        ))}
      </View>

      {/* Best time */}
      <SectionHeader emoji="📅" title="最佳參拜時間" theme={theme} />
      <Text style={s.infoText}>{guide.bestDays}</Text>
      <Text style={s.infoSubText}>{guide.bestTime}</Text>

      {/* Prayer */}
      <SectionHeader emoji="🙏" title="祝禱文範例" theme={theme} />
      <View style={s.prayerCard}>
        <Text style={s.prayerText}>{guide.prayer}</Text>
      </View>
    </Animated.View>
  );
}

function SectionHeader({ emoji, title, theme }: { emoji: string; title: string; theme: ThemeColors }) {
  const s = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionEmoji}>{emoji}</Text>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bgDark },
    header: {
      paddingHorizontal: TempleSpacing.lg,
      paddingTop: TempleSpacing.md,
      paddingBottom: TempleSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.goldDark + '28',
    },
    backBtn: { marginBottom: TempleSpacing.sm, alignSelf: 'flex-start' },
    backBtnText: { color: theme.gold, fontSize: TempleFonts.small, fontWeight: '600' },
    headerTitle: {
      color: theme.goldLight,
      fontSize: TempleFonts.title,
      fontWeight: '900',
      marginBottom: 4,
    },
    headerSubtitle: {
      color: theme.textMuted,
      fontSize: TempleFonts.small,
      marginBottom: 4,
    },

    // Chip bar
    chipBar: {
      paddingVertical: TempleSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.goldDark + '18',
    },
    chipScroll: {
      flexDirection: 'row',
      paddingHorizontal: TempleSpacing.lg,
      gap: TempleSpacing.sm,
    },
    chip: {
      backgroundColor: theme.bgCard,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.goldDark + '35',
    },
    chipActive: {
      backgroundColor: theme.goldDark,
      borderColor: theme.goldLight,
    },
    chipText: {
      color: theme.textMuted,
      fontSize: TempleFonts.small,
      fontWeight: '600',
    },
    chipTextActive: {
      color: '#FFFFFF',
    },

    // Content
    content: {
      padding: TempleSpacing.lg,
      paddingBottom: 60,
    },

    // Title row
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: TempleSpacing.lg,
    },
    godName: {
      color: theme.goldLight,
      fontSize: TempleFonts.subtitle,
      fontWeight: '900',
    },
    categoryBadge: {
      backgroundColor: theme.red + '20',
      borderWidth: 1,
      borderColor: theme.redLight + '40',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    categoryBadgeText: {
      color: theme.vermilion,
      fontSize: TempleFonts.caption,
      fontWeight: '700',
    },

    // Section
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: TempleSpacing.lg,
      marginBottom: TempleSpacing.sm,
    },
    sectionEmoji: { fontSize: 20 },
    sectionTitle: {
      color: theme.goldLight,
      fontSize: TempleFonts.body,
      fontWeight: '800',
    },

    // Chips
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    offeringChip: {
      backgroundColor: theme.bgCard,
      borderWidth: 1,
      borderColor: theme.gold + '30',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    offeringChipText: {
      color: theme.textLight,
      fontSize: TempleFonts.small,
    },
    avoidChip: {
      backgroundColor: theme.danger + '15',
      borderWidth: 1,
      borderColor: theme.danger + '40',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    avoidChipText: {
      color: theme.danger,
      fontSize: TempleFonts.small,
    },
    goldChip: {
      backgroundColor: theme.bgCard,
      borderWidth: 1,
      borderColor: theme.goldLight + '40',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    goldChipText: {
      color: theme.goldLight,
      fontSize: TempleFonts.small,
    },

    // Info text
    infoText: {
      color: theme.textLight,
      fontSize: TempleFonts.body,
      lineHeight: 24,
    },
    infoSubText: {
      color: theme.textMuted,
      fontSize: TempleFonts.small,
      marginTop: 2,
    },

    // Steps
    stepCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '30',
      padding: TempleSpacing.md,
      gap: 10,
    },
    stepRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
    },
    stepNum: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.goldDark,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumText: {
      color: '#FFFFFF',
      fontSize: TempleFonts.caption,
      fontWeight: '800',
    },
    stepText: {
      flex: 1,
      color: theme.textLight,
      fontSize: TempleFonts.small,
      lineHeight: 22,
      marginTop: 3,
    },

    // Taboos
    tabooCard: {
      backgroundColor: theme.red + '10',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.warning + '35',
      padding: TempleSpacing.md,
      gap: 10,
    },
    tabooRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'flex-start',
    },
    tabooIcon: {
      fontSize: TempleFonts.small,
      color: theme.warning,
    },
    tabooText: {
      flex: 1,
      color: theme.textMuted,
      fontSize: TempleFonts.small,
      lineHeight: 22,
    },

    // Prayer
    prayerCard: {
      backgroundColor: theme.bgLight + '12',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '25',
      padding: TempleSpacing.lg,
    },
    prayerText: {
      color: theme.textMuted,
      fontSize: TempleFonts.small,
      fontStyle: 'italic',
      lineHeight: 26,
    },
  });
}
