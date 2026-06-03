// 籤詩卡片 - 捲軸展開動畫 + 逐行浮現 + 籤詩配圖 + 解曰高亮 + 複製 + 圖卡分享
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity, Alert, Platform, useWindowDimensions, type DimensionValue } from 'react-native';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import type { Poem } from '@/data/poems/leiyushi';
import type { God } from '@/data/gods';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { getPoemTheme, type PoemTheme } from '@/data/poemThemes';
import { getGodProfile } from '@/data/godProfiles';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
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
  god?: God | null;
  question?: string;
}

export function PoemCard({ poem, godName, aiInterpretation, isLoading, questionCategory, userName, god, question }: PoemCardProps) {
  const { width } = useWindowDimensions();
  const poemTheme = getPoemTheme(poem.number, poem.level);
  const isCompact = width < 480;
  const isTablet = width >= 768;
  const contentMaxWidth = width >= 1280 ? 1000 : isTablet ? 880 : 720;

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
  const categoryLabel: Record<string, string> = {
    career: '事業工作',
    love: '感情姻緣',
    wealth: '財運投資',
    health: '健康身體',
    study: '學業考試',
    family: '家庭家運',
    travel: '出行遷移',
    general: '綜合運勢',
  };
  const highlightKey = questionCategory ? catToKey[questionCategory] : null;
  const godAccent = god?.accentColor || TempleTheme.goldLight;
  const godPrimary = god?.primaryColor || TempleTheme.red;
  const godProfile = getGodProfile(god?.id);
  const oracleCatalog = getOracleCatalogByGodId(god?.id);

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
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth }]}
    >

      {/* 籤詩主卡 */}
      <Animated.View style={[
        styles.poemCard,
        {
          opacity: cardOpacity,
          transform: [{ scale: cardScale }],
          borderColor: poemTheme.borderColor,
        }
      ]}>
        {god ? (
          <View style={[styles.godOracleHeader, isCompact && styles.godOracleHeaderCompact, { borderBottomColor: godAccent + '35' }]}>
            <View style={[styles.godOracleImageWrap, { borderColor: godAccent + '70' }]}>
              <Image source={god.image} style={styles.godOracleImage} contentFit="cover" transition={200} />
              <View style={[styles.godOracleImageOverlay, { backgroundColor: godPrimary + '18' }]} />
            </View>
            <View style={[styles.godOracleText, isCompact && styles.godOracleTextCompact]}>
              <Text style={[styles.godOracleEyebrow, { color: godAccent }]}>神明開示</Text>
              <Text style={[styles.godOracleName, isCompact && styles.godOracleTextCompact]}>{god.name}</Text>
              <Text style={[styles.godOracleTagline, isCompact && styles.godOracleTextCompact, { color: godAccent }]}>{god.tagline}</Text>
            </View>
          </View>
        ) : null}

        {(question || questionCategory) ? (
          <View style={[styles.questionSummary, isCompact && styles.questionSummaryCompact]}>
            <Text style={styles.questionSummaryLabel}>
              {categoryLabel[questionCategory || 'general'] || '綜合運勢'}
            </Text>
            <Text style={styles.questionSummaryText} numberOfLines={2}>
              {question || '誠心求問'}
            </Text>
          </View>
        ) : null}

        <View style={styles.metadataCard}>
          <View style={styles.metadataHeader}>
            <Text style={[styles.metadataTitle, { color: godAccent }]}>籤系統資訊</Text>
            <Text style={styles.metadataCount}>{oracleCatalog.totalPoems} 首</Text>
          </View>
          <Text style={styles.metadataLabel}>{oracleCatalog.label}</Text>
          <Text style={styles.metadataText}>{oracleCatalog.sourceNote}</Text>
          <Text style={styles.metadataHint}>{oracleCatalog.completenessNote}</Text>
          <View style={styles.metadataChipRow}>
            {oracleCatalog.strengths.map((item) => (
              <View key={item} style={[styles.metadataChip, { borderColor: godAccent + '50' }]}>
                <Text style={[styles.metadataChipText, { color: godAccent }]}>{item}</Text>
              </View>
            ))}
          </View>
          {godProfile ? (
            <>
              <Text style={styles.metadataSubTitle}>神明適合請示</Text>
              <View style={styles.metadataChipRow}>
                {godProfile.patronages.map((item) => (
                  <View key={item} style={styles.metadataChip}>
                    <Text style={styles.metadataChipText}>{item}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.metadataSubTitle}>提問提醒</Text>
              {godProfile.worshipTips.slice(0, 2).map((tip) => (
                <Text key={tip} style={styles.metadataBullet}>• {tip}</Text>
              ))}
            </>
          ) : null}
        </View>

        {/* 主題圖示與背景色帶 */}
        <View style={[styles.themeHeader, isCompact && styles.themeHeaderCompact, { backgroundColor: poemTheme.bgColor }]}>
          <Text style={[styles.themeIcon, isCompact && styles.themeIconCompact]}>{poemTheme.icon}</Text>
          <View style={styles.themeTags}>
            <Text style={[styles.luckyColor, { backgroundColor: poemTheme.luckyColor + '30', borderColor: poemTheme.luckyColor }]}>
              幸運色 <Text style={{ color: poemTheme.luckyColor, fontWeight: '700' }}>{poemTheme.luckyColorName}</Text>
            </Text>
            <Text style={styles.luckyNumber}>幸運數 <Text style={{ color: TempleTheme.goldLight, fontWeight: '700' }}>{poemTheme.luckyNumber}</Text></Text>
          </View>
        </View>

        {/* 籤頭 */}
        <View style={[styles.poemHeader, isCompact && styles.poemHeaderCompact]}>
          <View style={styles.poemMetaBlock}>
            <View style={styles.poemMeta}>
              <Text style={styles.poemNumber}>第 {poem.number} 籤</Text>
              <View style={[styles.levelBadge, { backgroundColor: levelColor(poem.level) + '20', borderColor: levelColor(poem.level) }]}>
                <Text style={[styles.levelText, { color: levelColor(poem.level) }]}>{poem.level}</Text>
              </View>
            </View>
            <Text style={styles.poemTitle}>{poem.title}</Text>
          </View>
          <Text style={[styles.ganzhi, isCompact && styles.ganzhiCompact]}>{poem.ganzhi}</Text>
        </View>

        {/* 籤詩內容 - 逐行浮現 */}
        <View style={[styles.poemContentArea, isCompact && styles.poemContentAreaCompact]}>
          {poem.content.split('\n').map((line, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.poemLine,
                isCompact && styles.poemLineCompact,
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

        <View style={[styles.actionRow, isCompact && styles.actionRowCompact]}>
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

function JieYueItem({ icon, label, value, highlighted, width }: { icon: string; label: string; value: string; highlighted?: boolean; width?: DimensionValue }) {
  return (
    <View style={[styles.jieYueItem, { width: width ?? '48%' }, highlighted && styles.jieYueItemHighlighted]}>
      <Text style={styles.jieYueIcon}>{icon}</Text>
      <Text style={[styles.jieYueItemLabel, highlighted && styles.jieYueItemLabelHL]}>{label}</Text>
      <Text style={[styles.jieYueItemValue, highlighted && styles.jieYueItemValueHL]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { width: '100%', alignSelf: 'center', paddingHorizontal: TempleSpacing.md, paddingTop: TempleSpacing.sm },
  poemCard: {
    borderRadius: 16, borderWidth: 1.5,
    marginBottom: TempleSpacing.md, overflow: 'hidden',
    backgroundColor: TempleTheme.bgCard,
  },
  godOracleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TempleSpacing.md,
    paddingHorizontal: TempleSpacing.md,
    paddingVertical: TempleSpacing.md,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(26,18,16,0.34)',
  },
  godOracleHeaderCompact: { flexDirection: 'column', alignItems: 'center' },
  godOracleImageWrap: {
    width: 76,
    height: 76,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: TempleTheme.bgDark,
  },
  godOracleImage: {
    width: '100%',
    height: '100%',
  },
  godOracleImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  godOracleText: {
    flex: 1,
  },
  godOracleTextCompact: { textAlign: 'center', alignSelf: 'stretch' },
  godOracleEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 3,
  },
  godOracleName: {
    fontSize: TempleFonts.heading,
    color: TempleTheme.goldLight,
    fontWeight: '900',
    marginBottom: 4,
  },
  godOracleTagline: {
    fontSize: TempleFonts.small,
    fontWeight: '700',
  },
  questionSummary: {
    marginHorizontal: TempleSpacing.md,
    marginTop: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
    paddingHorizontal: TempleSpacing.md,
    paddingVertical: TempleSpacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '35',
    backgroundColor: TempleTheme.bgDark + '45',
  },
  questionSummaryCompact: { marginHorizontal: 12 },
  questionSummaryLabel: {
    color: TempleTheme.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  questionSummaryText: {
    color: TempleTheme.textLight,
    fontSize: TempleFonts.small,
    lineHeight: 20,
  },
  metadataCard: {
    marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    padding: TempleSpacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '22',
    backgroundColor: 'rgba(27,19,17,0.66)',
  },
  metadataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metadataTitle: {
    fontSize: TempleFonts.body,
    fontWeight: '800',
  },
  metadataCount: {
    fontSize: 12,
    color: TempleTheme.textMuted,
  },
  metadataLabel: {
    fontSize: TempleFonts.small,
    color: TempleTheme.goldLight,
    fontWeight: '700',
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 12,
    lineHeight: 18,
    color: TempleTheme.textMuted,
  },
  metadataHint: {
    fontSize: 12,
    lineHeight: 18,
    color: TempleTheme.textMuted,
    marginTop: 4,
  },
  metadataSubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    marginTop: TempleSpacing.sm,
    marginBottom: 6,
  },
  metadataChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  metadataChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
    backgroundColor: TempleTheme.bgDark + '66',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metadataChipText: {
    fontSize: 11,
    color: TempleTheme.textLight,
    fontWeight: '600',
  },
  metadataBullet: {
    fontSize: 12,
    lineHeight: 18,
    color: TempleTheme.textMuted,
  },
  themeHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: TempleSpacing.md, paddingVertical: TempleSpacing.sm,
    gap: TempleSpacing.sm,
  },
  themeHeaderCompact: { alignItems: 'flex-start' },
  themeIcon: { fontSize: 36 },
  themeIconCompact: { fontSize: 30 },
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
  poemHeaderCompact: { alignItems: 'flex-start', gap: TempleSpacing.xs },
  poemMetaBlock: { flex: 1, marginRight: TempleSpacing.sm },
  poemMeta: { flexDirection: 'row', alignItems: 'center', gap: TempleSpacing.sm },
  poemNumber: { fontSize: TempleFonts.heading, fontWeight: '700', color: TempleTheme.goldLight },
  poemTitle: { fontSize: TempleFonts.body, color: TempleTheme.textLight, fontWeight: '600', marginTop: 4 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  levelText: { fontSize: 12, fontWeight: '700' },
  ganzhi: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  ganzhiCompact: { marginTop: 4 },
  poemContentArea: {
    backgroundColor: TempleTheme.bgLight, padding: TempleSpacing.lg,
    marginHorizontal: TempleSpacing.md, borderRadius: 12, marginBottom: TempleSpacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: '#D2B48C',
  },
  poemContentAreaCompact: { padding: TempleSpacing.md, marginHorizontal: 12 },
  poemLine: { fontSize: TempleFonts.poem, lineHeight: 34, color: '#2C1810', fontWeight: '700', letterSpacing: 3 },
  poemLineCompact: { fontSize: 16, lineHeight: 30, letterSpacing: 2 },
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
  jieYueItem: { backgroundColor: TempleTheme.bgDark + '60', padding: TempleSpacing.sm, borderRadius: 8, alignItems: 'center' },
  jieYueItemHighlighted: { backgroundColor: TempleTheme.goldDark + '25', borderWidth: 1.5, borderColor: TempleTheme.gold },
  jieYueIcon: { fontSize: 16, marginBottom: 2 },
  jieYueItemLabel: { fontSize: 10, color: TempleTheme.textMuted, marginBottom: 2 },
  jieYueItemLabelHL: { color: TempleTheme.goldLight, fontWeight: '700' },
  jieYueItemValue: { fontSize: 10, color: TempleTheme.textLight, textAlign: 'center' },
  jieYueItemValueHL: { color: TempleTheme.goldLight, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: TempleSpacing.sm, marginHorizontal: TempleSpacing.md, marginTop: TempleSpacing.sm, marginBottom: TempleSpacing.xs },
  actionRowCompact: { flexDirection: 'column', marginHorizontal: 12 },
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
