import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Poem } from '@/data/poems/leiyushi';
import { TempleTheme } from '@/constants/temple-theme';

interface ShareCardViewProps {
  godName: string;
  poem: Poem;
  aiInterpretation?: string | null;
  question?: string;
  actionPlan?: string[];
}

export const ShareCardView = forwardRef<View, ShareCardViewProps>(function ShareCardView(
  { godName, poem, aiInterpretation, question, actionPlan = [] },
  ref
) {
  const aiSummary = aiInterpretation
    ?.split('\n')
    .filter((line) => line.trim())
    .slice(0, 4)
    .join('\n');

  return (
    <View ref={ref} style={styles.card}>
      <View style={styles.topOrnament}>
        <Text style={styles.ornamentText}>籤</Text>
      </View>

      <Text style={styles.title}>{godName}靈籤</Text>
      <View style={styles.metaRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>第 {poem.number} 籤</Text>
        </View>
        <View style={[styles.badge, styles.levelBadge]}>
          <Text style={styles.badgeText}>{poem.level}</Text>
        </View>
        <Text style={styles.ganzhi}>{poem.ganzhi}</Text>
      </View>

      {question ? (
        <View style={styles.questionBox}>
          <Text style={styles.questionLabel}>請示問題</Text>
          <Text style={styles.questionText} numberOfLines={2}>{question}</Text>
        </View>
      ) : null}
      <View style={styles.poemBox}>
        {poem.content.split('\n').map((line) => (
          <Text key={line} style={styles.poemLine}>
            {line}
          </Text>
        ))}
      </View>

      {poem.story ? <Text style={styles.story}>典故：{poem.story}</Text> : null}

      {aiSummary ? (
        <View style={styles.aiBox}>
          <Text style={styles.aiLabel}>開示摘要</Text>
          <Text style={styles.aiText} numberOfLines={4}>
            {aiSummary}
          </Text>
        </View>
      ) : null}

      {actionPlan.length ? (
        <View style={styles.actionBox}>
          <Text style={styles.aiLabel}>今日三步</Text>
          {actionPlan.slice(0, 3).map((item, index) => (
            <Text key={item} style={styles.actionText} numberOfLines={1}>{index + 1}. {item}</Text>
          ))}
        </View>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.footerText}>神明占卜 App</Text>
        <Text style={styles.footerSub}>誠心請示 · 清明行動</Text>
      </View>
    </View>
  );
});

const CARD_W = 320;
const CARD_H = 520;

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: TempleTheme.bgDark,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: TempleTheme.goldDark,
    alignItems: 'center',
  },
  topOrnament: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TempleTheme.goldDark + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ornamentText: { fontSize: 22, color: TempleTheme.goldLight, fontWeight: '900' },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    letterSpacing: 4,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: TempleTheme.red,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  levelBadge: {
    backgroundColor: TempleTheme.goldDark + '40',
  },
  badgeText: { fontSize: 12, color: '#FFF', fontWeight: '700' },
  ganzhi: { fontSize: 12, color: TempleTheme.textMuted },
  questionBox: {
    width: '100%',
    borderRadius: 10,
    padding: 10,
    backgroundColor: TempleTheme.goldDark + '18',
    marginBottom: 10,
  },
  questionLabel: {
    fontSize: 10,
    color: TempleTheme.goldLight,
    fontWeight: '800',
    marginBottom: 3,
  },
  questionText: {
    fontSize: 11,
    color: TempleTheme.textLight,
    lineHeight: 16,
  },  poemBox: {
    backgroundColor: TempleTheme.bgLight,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D2B48C',
  },
  poemLine: {
    fontSize: 16,
    lineHeight: 28,
    color: '#333',
    fontWeight: '600',
    letterSpacing: 2,
  },
  story: {
    fontSize: 11,
    color: TempleTheme.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
  aiBox: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 10,
    padding: 10,
    width: '100%',
    marginBottom: 8,
  },
  aiLabel: {
    fontSize: 11,
    color: TempleTheme.goldLight,
    fontWeight: '800',
    marginBottom: 4,
  },
  aiText: { fontSize: 11, color: TempleTheme.textLight, lineHeight: 18 },
  actionBox: {
    width: '100%',
    borderRadius: 10,
    padding: 10,
    backgroundColor: TempleTheme.goldDark + '14',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 10,
    color: TempleTheme.textLight,
    lineHeight: 15,
  },  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: TempleTheme.goldDark + '30',
    width: '100%',
  },
  footerText: { fontSize: 12, color: TempleTheme.goldLight, fontWeight: '600' },
  footerSub: { fontSize: 10, color: TempleTheme.textMuted, marginTop: 2 },
});
