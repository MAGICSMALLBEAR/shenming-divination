// 籤詩卡片元件 - 含揭示動畫、解曰高亮、一鍵複製
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { Poem } from '@/data/poems/leiyushi';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';

interface PoemCardProps {
  poem: Poem;
  godName: string;
  aiInterpretation?: string | null;
  isLoading?: boolean;
  questionCategory?: string;
}

export function PoemCard({ poem, godName, aiInterpretation, isLoading, questionCategory }: PoemCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const aiFadeAnim = useRef(new Animated.Value(0)).current;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
    ]).start();
  }, [poem.number]);

  useEffect(() => {
    if (aiInterpretation) {
      aiFadeAnim.setValue(0);
      Animated.timing(aiFadeAnim, { toValue: 1, duration: 600, useNativeDriver: false }).start();
    }
  }, [aiInterpretation]);

  const levelColor = (level: string) => {
    if (level.includes('上') || level.includes('大吉')) return TempleTheme.success;
    if (level.includes('下')) return TempleTheme.danger;
    return TempleTheme.warning;
  };

  const handleCopy = async () => {
    let text = `【${godName}靈籤】第 ${poem.number} 籤 · ${poem.level} · ${poem.ganzhi}\n\n`;
    text += `籤詩：\n${poem.content}\n\n`;
    text += `白話：${poem.vernacular}\n\n`;
    if (poem.story) text += `典故：${poem.story}\n\n`;
    if (aiInterpretation) text += `解籤：\n${aiInterpretation}`;

    try {
      await Clipboard.setStringAsync(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('複製失敗', '請手動選取文字複製');
    }
  };

  // 判斷哪個解曰與問事類別相關
  const categoryToJieYueKey: Record<string, string> = {
    career: 'career',
    love: 'marriage',
    wealth: 'wealth',
    health: 'health',
    study: 'study',
    travel: 'travel',
  };
  const highlightKey = questionCategory ? categoryToJieYueKey[questionCategory] : null;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
      <Animated.View style={[styles.poemCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* 籤頭 */}
        <View style={styles.poemHeader}>
          <View style={styles.poemMeta}>
            <Text style={styles.poemNumber}>第 {poem.number} 籤</Text>
            <View style={[styles.levelBadge, { backgroundColor: levelColor(poem.level) + '20', borderColor: levelColor(poem.level) }]}>
              <Text style={[styles.levelText, { color: levelColor(poem.level) }]}>{poem.level}</Text>
            </View>
          </View>
          <Text style={styles.ganzhi}>{poem.ganzhi}</Text>
        </View>

        {/* 籤詩內容 */}
        <View style={styles.poemContentArea}>
          {poem.content.split('\n').map((line, i) => (
            <Text key={i} style={styles.poemLine}>{line}</Text>
          ))}
        </View>

        {/* 典故 */}
        {poem.story ? (
          <View style={styles.storyArea}>
            <Text style={styles.storyLabel}>典故</Text>
            <Text style={styles.storyText}>{poem.story}</Text>
          </View>
        ) : null}

        {/* 白話 */}
        <View style={styles.vernacularArea}>
          <Text style={styles.vernacularLabel}>白話解釋</Text>
          <Text style={styles.vernacularText}>{poem.vernacular}</Text>
        </View>

        {/* 傳統籤解（高亮相關類別） */}
        <View style={styles.jieYueArea}>
          <Text style={styles.jieYueLabel}>{godName}指引</Text>
          <View style={styles.jieYueGrid}>
            <JieYueItem icon="💕" label="婚姻" value={poem.jieYue.marriage} highlighted={highlightKey === 'marriage'} />
            <JieYueItem icon="💰" label="財運" value={poem.jieYue.wealth} highlighted={highlightKey === 'wealth'} />
            <JieYueItem icon="💼" label="事業" value={poem.jieYue.career} highlighted={highlightKey === 'career'} />
            <JieYueItem icon="🏥" label="健康" value={poem.jieYue.health} highlighted={highlightKey === 'health'} />
            <JieYueItem icon="✈️" label="出行" value={poem.jieYue.travel} highlighted={highlightKey === 'travel'} />
            <JieYueItem icon="📚" label="學業" value={poem.jieYue.study} highlighted={highlightKey === 'study'} />
          </View>
        </View>

        {/* 複製按鈕 */}
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
          <Text style={styles.copyBtnText}>{copied ? '✓ 已複製' : '📋 複製籤詩'}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* AI 解籤區域 */}
      {isLoading && (
        <View style={styles.aiLoading}>
          <Text style={styles.aiLoadingText}>{godName}正在為您解籤...</Text>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.3 }]} />
            ))}
          </View>
        </View>
      )}

      {aiInterpretation ? (
        <Animated.View style={[styles.aiCard, { opacity: aiFadeAnim }]}>
          <Text style={styles.aiLabel}>{godName}慈悲開示</Text>
          {aiInterpretation.split('\n').map((line, i) => {
            const isHeader = /^[【\d.]/.test(line);
            const isBlessing = line.includes('保佑') || line.includes('祝福');
            if (line.trim() === '') return <View key={i} style={styles.aiEmpty} />;
            return (
              <Text key={i} style={[styles.aiText, isHeader && styles.aiHeader, isBlessing && styles.aiBlessing]}>
                {line}
              </Text>
            );
          })}
        </Animated.View>
      ) : null}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

function JieYueItem({ icon, label, value, highlighted }: { icon: string; label: string; value: string; highlighted?: boolean }) {
  return (
    <View style={[styles.jieYueItem, highlighted && styles.jieYueItemHighlighted]}>
      <Text style={styles.jieYueIcon}>{icon}</Text>
      <Text style={[styles.jieYueItemLabel, highlighted && styles.jieYueItemLabelHighlighted]}>{label}</Text>
      <Text style={[styles.jieYueItemValue, highlighted && styles.jieYueItemValueHighlighted]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  poemCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 16,
    padding: TempleSpacing.lg,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
    marginBottom: TempleSpacing.md,
  },
  poemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TempleSpacing.lg,
    paddingBottom: TempleSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '30',
  },
  poemMeta: { flexDirection: 'row', alignItems: 'center', gap: TempleSpacing.sm },
  poemNumber: { fontSize: TempleFonts.heading, fontWeight: '700', color: TempleTheme.goldLight },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  levelText: { fontSize: 12, fontWeight: '700' },
  ganzhi: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  poemContentArea: {
    backgroundColor: TempleTheme.bgLight,
    padding: TempleSpacing.lg,
    borderRadius: 12,
    marginBottom: TempleSpacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D2B48C',
  },
  poemLine: { fontSize: TempleFonts.poem, lineHeight: 32, color: '#333', fontWeight: '600', letterSpacing: 2 },
  storyArea: {
    marginBottom: TempleSpacing.md,
    padding: TempleSpacing.sm,
    backgroundColor: TempleTheme.bgDark + '40',
    borderRadius: 8,
  },
  storyLabel: { fontSize: TempleFonts.small, color: TempleTheme.goldLight, fontWeight: '600', marginBottom: 4 },
  storyText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, lineHeight: 20 },
  vernacularArea: { marginBottom: TempleSpacing.md },
  vernacularLabel: { fontSize: TempleFonts.small, color: TempleTheme.goldLight, fontWeight: '600', marginBottom: 4 },
  vernacularText: { fontSize: TempleFonts.body, color: TempleTheme.textLight, lineHeight: 24 },
  jieYueArea: {
    marginTop: TempleSpacing.sm,
    paddingTop: TempleSpacing.md,
    borderTopWidth: 1,
    borderTopColor: TempleTheme.goldDark + '30',
  },
  jieYueLabel: { fontSize: TempleFonts.small, color: TempleTheme.goldLight, fontWeight: '700', marginBottom: TempleSpacing.sm },
  jieYueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: TempleSpacing.xs },
  jieYueItem: {
    width: '30%',
    backgroundColor: TempleTheme.bgDark + '60',
    padding: TempleSpacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  jieYueItemHighlighted: {
    backgroundColor: TempleTheme.goldDark + '25',
    borderWidth: 1.5,
    borderColor: TempleTheme.gold,
  },
  jieYueIcon: { fontSize: 16, marginBottom: 2 },
  jieYueItemLabel: { fontSize: 10, color: TempleTheme.textMuted, marginBottom: 2 },
  jieYueItemLabelHighlighted: { color: TempleTheme.goldLight, fontWeight: '700' },
  jieYueItemValue: { fontSize: 10, color: TempleTheme.textLight, textAlign: 'center' },
  jieYueItemValueHighlighted: { color: TempleTheme.goldLight, fontWeight: '600' },
  copyBtn: {
    marginTop: TempleSpacing.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TempleTheme.gold + '50',
  },
  copyBtnText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  aiLoading: { alignItems: 'center', padding: TempleSpacing.lg },
  aiLoadingText: { fontSize: TempleFonts.body, color: TempleTheme.textMuted, marginBottom: TempleSpacing.sm },
  loadingDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: TempleTheme.goldLight },
  aiCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 16,
    padding: TempleSpacing.lg,
    borderWidth: 1.5,
    borderColor: TempleTheme.gold,
  },
  aiLabel: {
    fontSize: TempleFonts.heading,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    marginBottom: TempleSpacing.md,
    textAlign: 'center',
  },
  aiText: { fontSize: TempleFonts.body, color: TempleTheme.textLight, lineHeight: 28, marginBottom: 4 },
  aiHeader: { fontWeight: '700', color: TempleTheme.goldLight, fontSize: TempleFonts.body, marginTop: TempleSpacing.sm },
  aiBlessing: { fontWeight: '700', color: TempleTheme.gold, textAlign: 'center', marginTop: TempleSpacing.md },
  aiEmpty: { height: 4 },
});
