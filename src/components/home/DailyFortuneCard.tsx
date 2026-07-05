import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import type { DailyFortune } from '@/services/dailyFortune';

// ─── 五行關係標籤 ───────────────────────────────────────────
function getRelationLabel(theme: ThemeColors): Record<string, { text: string; color: string }> {
  return {
    '今日生我': { text: '今日生我 ✦', color: theme.success },
    '我生今日': { text: '我生今日 ◦', color: theme.warning },
    '今日克我': { text: '今日克我 ✕', color: theme.danger },
    '我克今日': { text: '我克今日 ◇', color: '#E67E22' },
    '同行':     { text: '同行平穩 ＝', color: theme.textMuted },
  };
}

// ─── 每日修行建議 ───────────────────────────────────────────
function getDailyPractice(fortune: DailyFortune): string {
  const entries = Object.entries(fortune.scores) as [
    keyof DailyFortune['scores'],
    number,
  ][];
  const [lowestKey] = entries.sort((left, right) => left[1] - right[1])[0];

  const practices: Record<keyof DailyFortune['scores'], string> = {
    wealth: '今日修行：整理一筆支出，先守住資源，再談開展。',
    career: '今日修行：完成一件小交付，不讓事情只停在想法裡。',
    love: '今日修行：少猜一點，多說一句清楚而溫柔的話。',
    health: '今日修行：留一段安靜時間給身體，早一點休息。',
    study: '今日修行：選一個最薄弱的重點，專心複習二十五分鐘。',
  };

  return practices[lowestKey];
}

// ─── 運勢卡片組件 ───────────────────────────────────────────
interface Props {
  fortune: DailyFortune;
  expanded: boolean;
  onToggle: () => void;
}

export function DailyFortuneCard({ fortune, expanded, onToggle }: Props) {
  const { theme } = useAppTheme();
  const fStyles = useMemo(() => createFStyles(theme), [theme]);
  const RELATION_LABEL = useMemo(() => getRelationLabel(theme), [theme]);
  const SCORE_LABELS = [
    { key: 'wealth' as const, label: '財', icon: '💰' },
    { key: 'career' as const, label: '事', icon: '💼' },
    { key: 'love'   as const, label: '愛', icon: '💕' },
    { key: 'health' as const, label: '康', icon: '🏥' },
  ];
  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);
  const overallColor = fortune.overall >= 4 ? theme.success : fortune.overall >= 3 ? theme.warning : theme.danger;
  const relation = fortune.wuxingRelation ? RELATION_LABEL[fortune.wuxingRelation] : null;

  return (
    <View style={fStyles.card}>
      <TouchableOpacity style={fStyles.header} onPress={onToggle} activeOpacity={0.8}>
        <View style={fStyles.headerLeft}>
          <View style={fStyles.titleRow}>
            <Text style={fStyles.title}>今日運勢</Text>
            {fortune.isPersonalized && fortune.zodiacEmoji && (
              <Text style={fStyles.zodiacTag}>{fortune.zodiacEmoji} 屬{fortune.zodiac}</Text>
            )}
          </View>
          <View style={fStyles.overallRow}>
            <Text style={[fStyles.stars, { color: overallColor }]}>{stars(fortune.overall)}</Text>
            <View style={[fStyles.colorDot, { backgroundColor: fortune.luckyColor.hex }]} />
            <Text style={fStyles.colorName}>{fortune.luckyColor.name}</Text>
            {relation && (
              <Text style={[fStyles.relationBadge, { color: relation.color }]}>{relation.text}</Text>
            )}
          </View>
        </View>
        <View style={fStyles.miniScores}>
          {SCORE_LABELS.map(({ key, icon }) => (
            <View key={key} style={fStyles.miniItem}>
              <Text style={fStyles.miniIcon}>{icon}</Text>
              <Text style={[fStyles.miniStar, { color: fortune.scores[key] >= 4 ? theme.success : fortune.scores[key] >= 3 ? theme.warning : theme.danger }]}>
                {'★'.repeat(fortune.scores[key])}
              </Text>
            </View>
          ))}
        </View>
        <Text style={fStyles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={fStyles.body}>
          {fortune.isPersonalized && fortune.wuxingRelation && relation && (
            <View style={[fStyles.wuxingBanner, { borderColor: relation.color + '50' }]}>
              <Text style={[fStyles.wuxingBannerText, { color: relation.color }]}>
                {fortune.userWuxing}命 × 今日{fortune.wuxingToday} — {fortune.wuxingRelation}
              </Text>
            </View>
          )}

          {SCORE_LABELS.map(({ key, label, icon }) => (
            <View key={key} style={fStyles.scoreRow}>
              <Text style={fStyles.scoreIcon}>{icon}</Text>
              <Text style={fStyles.scoreLabel}>{label}運</Text>
              <Text style={[fStyles.scoreStar, { color: fortune.scores[key] >= 4 ? theme.success : fortune.scores[key] >= 3 ? theme.warning : theme.danger }]}>
                {stars(fortune.scores[key])}
              </Text>
            </View>
          ))}
          <View style={fStyles.divider} />
          <View style={fStyles.infoRow}>
            <Text style={fStyles.infoItem}>🧭 吉位：{fortune.luckyDirection}</Text>
            <Text style={fStyles.infoItem}>🔢 幸運數：{fortune.luckyNumber}</Text>
          </View>
          <View style={fStyles.infoRow}>
            <Text style={fStyles.infoItem}>⏰ 吉時：{fortune.auspiciousHour}</Text>
            <Text style={fStyles.infoItem}>🔮 今日五行：{fortune.wuxingToday}</Text>
          </View>
          <Text style={fStyles.advice}>{fortune.advice}</Text>
          <Text style={fStyles.practice}>{getDailyPractice(fortune)}</Text>
        </View>
      )}
    </View>
  );
}

function createFStyles(theme: ThemeColors) {
  return StyleSheet.create({
  card: {
    marginHorizontal: TempleSpacing.md, marginBottom: TempleSpacing.sm,
    backgroundColor: theme.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: theme.goldDark + '30', overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: TempleSpacing.sm, gap: TempleSpacing.sm },
  headerLeft: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  title: { fontSize: 12, fontWeight: '700', color: theme.goldLight },
  zodiacTag: { fontSize: 10, color: theme.gold, fontWeight: '600' },
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  stars: { fontSize: 11, letterSpacing: 1 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  colorName: { fontSize: 10, color: theme.textMuted },
  relationBadge: { fontSize: 9, fontWeight: '700' },
  miniScores: { flexDirection: 'row', gap: 4 },
  miniItem: { alignItems: 'center' },
  miniIcon: { fontSize: 12 },
  miniStar: { fontSize: 7 },
  chevron: { fontSize: 12, color: theme.textMuted, paddingHorizontal: 4 },
  body: { paddingHorizontal: TempleSpacing.md, paddingBottom: TempleSpacing.md, borderTopWidth: 1, borderTopColor: theme.goldDark + '20' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 6 },
  scoreIcon: { fontSize: 14, width: 20 },
  scoreLabel: { fontSize: 12, color: theme.textMuted, width: 28 },
  scoreStar: { fontSize: 12, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: theme.goldDark + '20', marginVertical: 8 },
  infoRow: { flexDirection: 'row', gap: TempleSpacing.md, marginBottom: 4 },
  infoItem: { fontSize: 11, color: theme.textLight, flex: 1 },
  advice: { fontSize: TempleFonts.small, color: theme.gold, marginTop: 6, fontStyle: 'italic', lineHeight: 18 },
  practice: {
    fontSize: TempleFonts.small,
    color: theme.textLight,
    marginTop: 8,
    lineHeight: 20,
    fontWeight: '700',
  },
  wuxingBanner: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    marginTop: TempleSpacing.sm, marginBottom: 6, alignItems: 'center',
  },
  wuxingBannerText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  });
}
