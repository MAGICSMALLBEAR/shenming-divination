// 籤詩卡片 - 捲軸展開動畫 + 逐行浮現 + 籤詩配圖 + 解曰高亮 + 複製 + 圖卡分享
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { Poem } from '@/data/poems/leiyushi';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { getPoemTheme, type PoemTheme } from '@/data/poemThemes';
import { PoemComments } from './PoemComments';
import { AskFollowUp } from './AskFollowUp';
import { ShareCardView } from './ShareCardView';
import { captureAndShare } from '@/services/shareCard';

interface PoemCardProps {
  poem: Poem;
  godName: string;
  aiInterpretation?: string | null;
  isLoading?: boolean;
  questionCategory?: string;
  userName?: string;
}

export function PoemCard({ poem, godName, aiInterpretation, isLoading, questionCategory, userName }: PoemCardProps) {
  const poemTheme = getPoemTheme(poem.number, poem.level);

  // 捲軸展開動畫
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const aiFadeAnim = useRef(new Animated.Value(0)).current;

  // 逐行浮現
  const lineAnims = useRef(
    poem.content.split('\n').map(() => new Animated.Value(0))
  ).current;

  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<View>(null);

  useEffect(() => {
    // 重置
    scrollAnim.setValue(0);
    fadeAnim.setValue(0);
    lineAnims.forEach(a => a.setValue(0));

    // 1. 卡片淡入
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: false }).start();

    // 2. 捲軸展開
    Animated.timing(scrollAnim, {
      toValue: 1, duration: 900,
      useNativeDriver: false,
    }).start(() => {
      // 3. 文字逐行浮現
      Animated.stagger(120,
        lineAnims.map(a =>
          Animated.spring(a, { toValue: 1, friction: 8, tension: 60, useNativeDriver: false })
        )
      ).start();
    });
  }, [poem.number]);

  useEffect(() => {
    if (aiInterpretation) {
      aiFadeAnim.setValue(0);
      Animated.timing(aiFadeAnim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
    }
  }, [aiInterpretation]);

  const cardScale = scrollAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const cardOpacity = scrollAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] });

  const levelColor = (level: string) => {
    if (level.includes('上') || level.includes('大吉')) return TempleTheme.success;
    if (level.includes('下')) return TempleTheme.danger;
    return TempleTheme.warning;
  };

  const catToKey: Record<string, string> = {
    career: 'career', love: 'marriage', wealth: 'wealth',
    health: 'health', study: 'study', travel: 'travel',
  };
  const highlightKey = questionCategory ? catToKey[questionCategory] : null;

  const handleShareCard = async () => {
    if (sharing || Platform.OS === 'web') {
      // Web 降級為文字分享
      const text = `【${godName}靈籤】第 ${poem.number} 籤 · ${poem.title} · ${poem.level}\n${poem.ganzhi}\n\n${poem.content}\n\n— 神明占卜`;
      await Clipboard.setStringAsync(text);
      Alert.alert('已複製', '圖卡分享在 Web 上不支援，已複製文字版本。');
      return;
    }
    if (!shareCardRef.current) return;
    setSharing(true);
    try {
      const tag = (shareCardRef.current as any)._nativeTag ?? (shareCardRef.current as any).__nativeTag;
      await captureAndShare(tag, { godName, poem, aiInterpretation });
    } catch {
      Alert.alert('分享失敗', '請稍後再試');
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    let text = `【${godName}靈籤】第 ${poem.number} 籤 · ${poem.title} · ${poem.level}\n`;
    text += `${poem.ganzhi}\n\n`;
    text += `${poem.content}\n\n白話：${poem.vernacular}\n`;
    if (aiInterpretation) text += `\n解籤：\n${aiInterpretation}`;
    try {
      await Clipboard.setStringAsync(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { Alert.alert('請手動選取文字複製'); }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollContent}>

      {/* 籤詩主卡 */}
      <Animated.View style={[
        styles.poemCard,
        {
          opacity: cardOpacity,
          transform: [{ scale: cardScale }],
          borderColor: poemTheme.borderColor,
        }
      ]}>
        {/* 主題圖示與背景色帶 */}
        <View style={[styles.themeHeader, { backgroundColor: poemTheme.bgColor }]}>
          <Text style={styles.themeIcon}>{poemTheme.icon}</Text>
          <View style={styles.themeTags}>
            <Text style={[styles.luckyColor, { backgroundColor: poemTheme.luckyColor + '30', borderColor: poemTheme.luckyColor }]}>
              幸運色 <Text style={{ color: poemTheme.luckyColor, fontWeight: '700' }}>{poemTheme.luckyColorName}</Text>
            </Text>
            <Text style={styles.luckyNumber}>幸運數 <Text style={{ color: TempleTheme.goldLight, fontWeight: '700' }}>{poemTheme.luckyNumber}</Text></Text>
          </View>
        </View>

        {/* 籤頭 */}
        <View style={styles.poemHeader}>
          <View style={styles.poemMetaBlock}>
            <View style={styles.poemMeta}>
              <Text style={styles.poemNumber}>第 {poem.number} 籤</Text>
              <View style={[styles.levelBadge, { backgroundColor: levelColor(poem.level) + '20', borderColor: levelColor(poem.level) }]}>
                <Text style={[styles.levelText, { color: levelColor(poem.level) }]}>{poem.level}</Text>
              </View>
            </View>
            <Text style={styles.poemTitle}>{poem.title}</Text>
          </View>
          <Text style={styles.ganzhi}>{poem.ganzhi}</Text>
        </View>

        {/* 籤詩內容 - 逐行浮現 */}
        <View style={styles.poemContentArea}>
          {poem.content.split('\n').map((line, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.poemLine,
                {
                  opacity: lineAnims[i] || new Animated.Value(1),
                  transform: [{
                    translateY: (lineAnims[i] || new Animated.Value(1)).interpolate({
                      inputRange: [0, 1], outputRange: [16, 0],
                    }),
                  }],
                },
              ]}
            >
              {line}
            </Animated.Text>
          ))}
        </View>

        {/* 典故 */}
        {poem.story ? (
          <View style={styles.storyArea}>
            <Text style={styles.storyLabel}>📜 典故</Text>
            <Text style={styles.storyText}>{poem.story}</Text>
          </View>
        ) : null}

        {/* 白話 */}
        <View style={styles.vernacularArea}>
          <Text style={styles.vernacularLabel}>📖 白話解釋</Text>
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

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.copyBtn, styles.actionBtnHalf]} onPress={handleCopy}>
            <Text style={styles.copyBtnText}>{copied ? '✓ 已複製' : '📋 複製'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareCardBtn, styles.actionBtnHalf]} onPress={handleShareCard} disabled={sharing}>
            <Text style={styles.shareCardBtnText}>{sharing ? '產生中…' : '🖼️ 圖卡分享'}</Text>
          </TouchableOpacity>
        </View>
        {/* 隱藏的圖卡模板，供截圖 */}
        <View style={styles.hiddenCard}>
          <ShareCardView ref={shareCardRef} godName={godName} poem={poem} aiInterpretation={aiInterpretation} />
        </View>
      </Animated.View>

      {/* AI 解籤 */}
      {isLoading && (
        <View style={styles.aiLoading}>
          <Text style={styles.aiLoadingText}>{godName}正在為您解籤...</Text>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map(i => <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.3 }]} />)}
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

      {/* AI 追問 */}
      <AskFollowUp
        godName={godName}
        poemContent={poem.content}
        aiInterpretation={aiInterpretation}
      />

      {/* 社群留言 */}
      <PoemComments poemNumber={poem.number} currentUserName={userName} />

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

function JieYueItem({ icon, label, value, highlighted }: { icon: string; label: string; value: string; highlighted?: boolean }) {
  return (
    <View style={[styles.jieYueItem, highlighted && styles.jieYueItemHighlighted]}>
      <Text style={styles.jieYueIcon}>{icon}</Text>
      <Text style={[styles.jieYueItemLabel, highlighted && styles.jieYueItemLabelHL]}>{label}</Text>
      <Text style={[styles.jieYueItemValue, highlighted && styles.jieYueItemValueHL]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: TempleSpacing.md, paddingTop: TempleSpacing.sm },
  poemCard: {
    borderRadius: 16, borderWidth: 1.5,
    marginBottom: TempleSpacing.md, overflow: 'hidden',
    backgroundColor: TempleTheme.bgCard,
  },
  themeHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: TempleSpacing.md, paddingVertical: TempleSpacing.sm,
    gap: TempleSpacing.sm,
  },
  themeIcon: { fontSize: 36 },
  themeTags: { flex: 1, gap: 4 },
  luckyColor: {
    fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    borderWidth: 1, alignSelf: 'flex-start',
    color: TempleTheme.textLight,
  },
  luckyNumber: { fontSize: 11, color: TempleTheme.textMuted },
  poemHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: TempleSpacing.md, paddingTop: TempleSpacing.sm,
    marginBottom: TempleSpacing.sm, paddingBottom: TempleSpacing.sm,
    borderBottomWidth: 1, borderBottomColor: TempleTheme.goldDark + '30',
  },
  poemMetaBlock: { flex: 1, marginRight: TempleSpacing.sm },
  poemMeta: { flexDirection: 'row', alignItems: 'center', gap: TempleSpacing.sm },
  poemNumber: { fontSize: TempleFonts.heading, fontWeight: '700', color: TempleTheme.goldLight },
  poemTitle: { fontSize: TempleFonts.body, color: TempleTheme.textLight, fontWeight: '600', marginTop: 4 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  levelText: { fontSize: 12, fontWeight: '700' },
  ganzhi: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  poemContentArea: {
    backgroundColor: TempleTheme.bgLight, padding: TempleSpacing.lg,
    marginHorizontal: TempleSpacing.md, borderRadius: 12, marginBottom: TempleSpacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: '#D2B48C',
  },
  poemLine: { fontSize: TempleFonts.poem, lineHeight: 34, color: '#2C1810', fontWeight: '700', letterSpacing: 3 },
  storyArea: {
    marginHorizontal: TempleSpacing.md, marginBottom: TempleSpacing.md,
    padding: TempleSpacing.sm, backgroundColor: TempleTheme.bgDark + '40', borderRadius: 8,
  },
  storyLabel: { fontSize: TempleFonts.small, color: TempleTheme.goldLight, fontWeight: '600', marginBottom: 4 },
  storyText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, lineHeight: 20 },
  vernacularArea: { marginHorizontal: TempleSpacing.md, marginBottom: TempleSpacing.md },
  vernacularLabel: { fontSize: TempleFonts.small, color: TempleTheme.goldLight, fontWeight: '600', marginBottom: 4 },
  vernacularText: { fontSize: TempleFonts.body, color: TempleTheme.textLight, lineHeight: 24 },
  jieYueArea: { marginHorizontal: TempleSpacing.md, paddingTop: TempleSpacing.md, borderTopWidth: 1, borderTopColor: TempleTheme.goldDark + '30', marginBottom: TempleSpacing.sm },
  jieYueLabel: { fontSize: TempleFonts.small, color: TempleTheme.goldLight, fontWeight: '700', marginBottom: TempleSpacing.sm },
  jieYueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: TempleSpacing.xs },
  jieYueItem: { width: '30%', backgroundColor: TempleTheme.bgDark + '60', padding: TempleSpacing.sm, borderRadius: 8, alignItems: 'center' },
  jieYueItemHighlighted: { backgroundColor: TempleTheme.goldDark + '25', borderWidth: 1.5, borderColor: TempleTheme.gold },
  jieYueIcon: { fontSize: 16, marginBottom: 2 },
  jieYueItemLabel: { fontSize: 10, color: TempleTheme.textMuted, marginBottom: 2 },
  jieYueItemLabelHL: { color: TempleTheme.goldLight, fontWeight: '700' },
  jieYueItemValue: { fontSize: 10, color: TempleTheme.textLight, textAlign: 'center' },
  jieYueItemValueHL: { color: TempleTheme.goldLight, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: TempleSpacing.sm, marginHorizontal: TempleSpacing.md, marginTop: TempleSpacing.sm, marginBottom: TempleSpacing.xs },
  actionBtnHalf: { flex: 1 },
  copyBtn: { paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: TempleTheme.gold + '50' },
  copyBtnText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  shareCardBtn: { paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: TempleTheme.gold + '50', backgroundColor: TempleTheme.bgCard },
  shareCardBtnText: { fontSize: TempleFonts.small, color: TempleTheme.gold },
  hiddenCard: { position: 'absolute', top: -9999, left: -9999, opacity: 0 },
  aiLoading: { alignItems: 'center', padding: TempleSpacing.lg },
  aiLoadingText: { fontSize: TempleFonts.body, color: TempleTheme.textMuted, marginBottom: TempleSpacing.sm },
  loadingDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: TempleTheme.goldLight },
  aiCard: { backgroundColor: TempleTheme.bgCard, borderRadius: 16, padding: TempleSpacing.lg, borderWidth: 1.5, borderColor: TempleTheme.gold },
  aiLabel: { fontSize: TempleFonts.heading, fontWeight: '700', color: TempleTheme.goldLight, marginBottom: TempleSpacing.md, textAlign: 'center' },
  aiText: { fontSize: TempleFonts.body, color: TempleTheme.textLight, lineHeight: 28, marginBottom: 4 },
  aiHeader: { fontWeight: '700', color: TempleTheme.goldLight, marginTop: TempleSpacing.sm },
  aiBlessing: { fontWeight: '700', color: TempleTheme.gold, textAlign: 'center', marginTop: TempleSpacing.md },
  aiEmpty: { height: 4 },
});
