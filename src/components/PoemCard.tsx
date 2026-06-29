// 籤詩卡片 - 捲軸展開動畫 + 逐行浮現 + 籤詩配圖 + 解曰高亮 + 複製 + 圖卡分享
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ScrollView, TouchableOpacity, Alert, Platform, useWindowDimensions, type DimensionValue } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import type { Poem } from '@/data/poems/leiyushi';
import type { God } from '@/data/gods';
import { getGodCloseupImage } from '@/data/godImages';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { getPoemTheme } from '@/data/poemThemes';
import { getGodProfile } from '@/data/godProfiles';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { PoemComments } from './PoemComments';
import { AskFollowUp } from './AskFollowUp';
import { ShareCardView } from './ShareCardView';
import { captureAndShare } from '@/services/shareCard';
import { extractInterpretationSections } from '@/services/interpretation';
import { buildActionPlan } from '@/services/actionPlan';
import { addWish } from '@/services/wishTracker';
import { updateVerification, type DivinationRecord, type VerificationStatus } from '@/services/storage';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PoemCardProps {
  poem: Poem;
  godName: string;
  aiInterpretation?: string | null;
  isLoading?: boolean;
  lowMotion?: boolean;
  questionCategory?: string;
  userName?: string;
  god?: God | null;
  question?: string;
  record?: DivinationRecord | null;
}

const REVEAL_DUST = [
  { left: '12%', top: '16%', delay: 0, size: 5 },
  { left: '28%', top: '11%', delay: 0.16, size: 3 },
  { left: '46%', top: '18%', delay: 0.32, size: 4 },
  { left: '64%', top: '10%', delay: 0.08, size: 5 },
  { left: '82%', top: '17%', delay: 0.24, size: 3 },
  { left: '18%', top: '42%', delay: 0.38, size: 4 },
  { left: '74%', top: '44%', delay: 0.48, size: 5 },
] as const;

export function PoemCard({ poem, godName, aiInterpretation, isLoading, lowMotion = false, questionCategory, userName, god, question, record }: PoemCardProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = systemReducedMotion || lowMotion;
  const poemTheme = getPoemTheme(poem.number, poem.level);
  const isCompact = width < 480;
  const isTablet = width >= 768;
  const contentMaxWidth = width >= 1280 ? 1000 : isTablet ? 880 : 720;

  // 捲軸展開動畫
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const aiFadeAnim = useRef(new Animated.Value(0)).current;
  const dustAnim = useRef(new Animated.Value(0)).current;

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
    dustAnim.setValue(0);
    lineAnims.forEach(a => a.setValue(0));

    if (reducedMotion) {
      scrollAnim.setValue(1);
      fadeAnim.setValue(1);
      lineAnims.forEach(a => a.setValue(1));
      return;
    }

    const dustLoop = Animated.loop(
      Animated.timing(dustAnim, {
        toValue: 1,
        duration: 2800,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    );
    dustLoop.start();

    // 1. 卡片淡入
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    // 2. 捲軸展開
    Animated.timing(scrollAnim, {
      toValue: 1, duration: 900,
      useNativeDriver: true,
    }).start(() => {
      // 3. 文字逐行浮現
      Animated.stagger(120,
        lineAnims.map(a =>
          Animated.spring(a, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true })
        )
      ).start();
    });

    return () => dustLoop.stop();
  }, [poem.number, dustAnim, fadeAnim, lineAnims, reducedMotion, scrollAnim]);

  useEffect(() => {
    if (aiInterpretation) {
      aiFadeAnim.setValue(0);
      if (reducedMotion) {
        aiFadeAnim.setValue(1);
        return;
      }
      Animated.timing(aiFadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }
  }, [aiFadeAnim, aiInterpretation, reducedMotion]);

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
  const aiSections = useMemo(() => extractInterpretationSections(aiInterpretation), [aiInterpretation]);
  const actionPlan = useMemo(
    () => buildActionPlan({ poem, questionCategory, question }),
    [poem, questionCategory, question]
  );
  const closeupImage = getGodCloseupImage(god?.id);
  const [savedActionIndex, setSavedActionIndex] = useState<number | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    record?.verificationStatus ?? 'pending'
  );

  useEffect(() => {
    setVerificationStatus(record?.verificationStatus ?? 'pending');
  }, [record?.id, record?.verificationStatus]);

  const formatReviewDate = (timestamp?: number) => {
    if (!timestamp) return '未設定';
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const verificationMeta: Record<VerificationStatus, { label: string; color: string }> = {
    pending: { label: '待驗證', color: TempleTheme.warning },
    matched: { label: '已應驗', color: TempleTheme.success },
    unmatched: { label: '不太符合', color: TempleTheme.danger },
  };

  const handleQuickVerification = async (status: VerificationStatus) => {
    if (!record?.id) return;
    try {
      await updateVerification(record.id, status, record.verificationNotes ?? '');
      setVerificationStatus(status);
    } catch {
      Alert.alert('追蹤失敗', '請稍後再試一次。');
    }
  };

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

  const handleSaveActionWish = async (step: string, index: number) => {
    try {
      await addWish({
        content: step,
        godName,
        poemNumber: poem.number,
        poemSummary: poem.vernacular.slice(0, 60),
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });
      setSavedActionIndex(index);
      setTimeout(() => setSavedActionIndex(null), 2000);
    } catch {
      Alert.alert('加入願望失敗', '請稍後再試一次。');
    }
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
        {!reducedMotion ? (
        <View pointerEvents="none" style={styles.revealDustLayer}>
          {REVEAL_DUST.map((item) => {
            const opacity = dustAnim.interpolate({
              inputRange: [0, item.delay, item.delay + 0.26, 1],
              outputRange: [0, 0, 0.9, 0],
            });
            const translateY = dustAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-10, 44],
            });

            return (
              <Animated.View
                key={`${item.left}-${item.top}`}
                style={[
                  styles.revealDust,
                  {
                    left: item.left,
                    top: item.top,
                    width: item.size,
                    height: item.size,
                    borderRadius: item.size / 2,
                    opacity,
                    transform: [{ translateY }],
                  },
                ]}
              />
            );
          })}
        </View>
        ) : null}
        {god ? (
          <View style={[styles.godOracleHeader, isCompact && styles.godOracleHeaderCompact, { borderBottomColor: godAccent + '35' }]}>
            <View style={[styles.godOracleImageWrap, { borderColor: godAccent + '70' }]}>
              {closeupImage ? (
                <Image source={closeupImage} style={styles.godOracleImage} contentFit="cover" contentPosition="top" transition={200} />
              ) : null}
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
          <Text style={styles.metadataSubTitle}>來源與版本</Text>
          <Text style={styles.metadataBullet}>• {oracleCatalog.sourceType}</Text>
          <Text style={styles.metadataBullet}>• {oracleCatalog.editionNote}</Text>
          <Text style={styles.metadataBullet}>• 版本：{oracleCatalog.versionTag}</Text>
          <Text style={styles.metadataSubTitle}>適用題型</Text>
          <Text style={styles.metadataText}>{oracleCatalog.suitabilityNote}</Text>
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
          <View style={styles.scrollRodTop} />
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
          <View style={styles.scrollRodBottom} />
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

        <View style={styles.actionPlanCard}>
          <Text style={styles.actionPlanTitle}>今日可做的三步</Text>
          {actionPlan.map((step, index) => (
            <View key={step} style={styles.actionPlanRow}>
              <View style={styles.actionPlanMeta}>
                <Text style={styles.actionPlanIndex}>{index + 1}</Text>
                <Text style={styles.actionPlanText}>{step}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.actionWishBtn,
                  savedActionIndex === index && styles.actionWishBtnDone,
                ]}
                onPress={() => handleSaveActionWish(step, index)}
              >
                <Text style={styles.actionWishBtnText}>
                  {savedActionIndex === index ? '已加入' : '7天追蹤'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

       
        {record ? (
          <View style={styles.verificationMiniCard}>
            <View style={styles.verificationMiniHeader}>
              <Text style={styles.verificationMiniTitle}>應驗追蹤</Text>
              <Text style={[styles.verificationMiniBadge, { color: verificationMeta[verificationStatus].color, borderColor: verificationMeta[verificationStatus].color + '66' }]}>
                {verificationMeta[verificationStatus].label}
              </Text>
            </View>
            <Text style={styles.verificationMiniText}>
              系統已排定 7 天 {formatReviewDate(record.verificationDueAt)} 與 30 天 {formatReviewDate(record.verificationFinalDueAt)} 回訪。回來標記準不準，之後 AI 解籤會更懂你的脈絡。
            </Text>
            <View style={styles.verificationMiniActions}>
              {(['pending', 'matched', 'unmatched'] as VerificationStatus[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.verificationMiniBtn,
                    verificationStatus === status && { borderColor: verificationMeta[status].color, backgroundColor: verificationMeta[status].color + '14' },
                  ]}
                  onPress={() => handleQuickVerification(status)}
                >
                  <Text style={styles.verificationMiniBtnText}>{verificationMeta[status].label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.verificationMiniLink} onPress={() => router.push('/collection?tab=history' as never)}>
                <Text style={styles.verificationMiniLinkText}>打開回顧</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <View style={[styles.actionRow, isCompact && styles.actionRowCompact]}>
          <TouchableOpacity style={[styles.copyBtn, styles.actionBtnHalf]} onPress={handleCopy}>
            <Text style={styles.copyBtnText}>{copied ? '✓ 已複製' : '📋 複製'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.communityBtn, styles.actionBtnHalf]} onPress={() => router.push('/community' as never)}>
            <Text style={styles.communityBtnText}>💬 社群交流</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareCardBtn, styles.actionBtnHalf]} onPress={handleShareCard} disabled={sharing}>
            <Text style={styles.shareCardBtnText}>{sharing ? '產生中…' : '🖼️ 圖卡分享'}</Text>
          </TouchableOpacity>
        </View>
        {/* 隱藏的圖卡模板，供截圖 */}
        <View style={styles.hiddenCard}>
          <ShareCardView ref={shareCardRef} godName={godName} poem={poem} aiInterpretation={aiInterpretation} question={question} actionPlan={actionPlan} />
        </View>
      </Animated.View>

      {/* AI 解籤 */}
      {isLoading && (
        <View style={styles.aiLoading}>
          <Text style={styles.aiLoadingText}>籤詩已先顯示，{godName}正在補上開示...</Text>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map(i => <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.3 }]} />)}
          </View>
        </View>
      )}

      {aiInterpretation ? (
        <Animated.View style={[styles.aiCard, { opacity: aiFadeAnim }]}>
          <Text style={styles.aiLabel}>{godName}慈悲開示</Text>
          {aiSections.map((section) => (
            <View key={section.key} style={styles.aiSection}>
              <Text style={styles.aiSectionTitle}>{section.title}</Text>
              {section.lines.map((line) => (
                <Text key={line} style={styles.aiText}>
                  {line}
                </Text>
              ))}
            </View>
          ))}
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
    position: 'relative',
  },
  revealDustLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
  },
  revealDust: {
    position: 'absolute',
    backgroundColor: TempleTheme.goldLight,
    shadowColor: TempleTheme.goldLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 8,
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
    width: 140,
    height: 176,
    borderRadius: 20,
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
  scrollRodTop: {
    alignSelf: 'stretch',
    height: 7,
    borderRadius: 999,
    marginBottom: TempleSpacing.md,
    backgroundColor: '#8A5A2B',
    borderWidth: 1,
    borderColor: '#C89B4A',
  },
  scrollRodBottom: {
    alignSelf: 'stretch',
    height: 7,
    borderRadius: 999,
    marginTop: TempleSpacing.md,
    backgroundColor: '#8A5A2B',
    borderWidth: 1,
    borderColor: '#C89B4A',
  },
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
  actionPlanCard: {
    marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    padding: TempleSpacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '24',
    backgroundColor: TempleTheme.bgDark + '45',
  },
  actionPlanTitle: {
    fontSize: TempleFonts.body,
    color: TempleTheme.goldLight,
    fontWeight: '800',
    marginBottom: 10,
  },
  actionPlanRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionPlanMeta: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  actionPlanIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 22,
    backgroundColor: TempleTheme.goldDark + '40',
    color: TempleTheme.goldLight,
    fontSize: 12,
    fontWeight: '700',
  },
  actionPlanText: {
    flex: 1,
    color: TempleTheme.textLight,
    fontSize: TempleFonts.small,
    lineHeight: 20,
  },
  actionWishBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: TempleTheme.gold + '50',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionWishBtnDone: {
    backgroundColor: TempleTheme.success + '18',
    borderColor: TempleTheme.success + '70',
  },
  actionWishBtnText: {
    color: TempleTheme.goldLight,
    fontSize: 12,
    fontWeight: '700',
  },
  verificationMiniCard: {
    marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    padding: TempleSpacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.warning + '35',
    backgroundColor: TempleTheme.bgDark + '50',
  },
  verificationMiniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: TempleSpacing.sm,
    marginBottom: 8,
  },
  verificationMiniTitle: {
    color: TempleTheme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '900',
  },
  verificationMiniBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },
  verificationMiniText: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 20,
    marginBottom: TempleSpacing.sm,
  },
  verificationMiniActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  verificationMiniBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '28',
    backgroundColor: TempleTheme.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  verificationMiniBtnText: {
    color: TempleTheme.textLight,
    fontSize: 12,
    fontWeight: '700',
  },
  verificationMiniLink: {
    borderRadius: 999,
    backgroundColor: TempleTheme.goldDark + '30',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  verificationMiniLinkText: {
    color: TempleTheme.goldLight,
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: { flexDirection: 'row', gap: TempleSpacing.sm, marginHorizontal: TempleSpacing.md, marginTop: TempleSpacing.sm, marginBottom: TempleSpacing.xs },
  actionRowCompact: { flexDirection: 'column', marginHorizontal: 12 },
  actionBtnHalf: { flex: 1 },
  copyBtn: { paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: TempleTheme.gold + '50' },
  copyBtnText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  communityBtn: {
    backgroundColor: TempleTheme.bgDark + '88',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '35',
  },
  communityBtnText: {
    color: TempleTheme.textLight,
    fontSize: TempleFonts.small,
    fontWeight: '800',
  },  shareCardBtn: { paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: TempleTheme.gold + '50', backgroundColor: TempleTheme.bgCard },
  shareCardBtnText: { fontSize: TempleFonts.small, color: TempleTheme.gold },
  hiddenCard: { position: 'absolute', top: -9999, left: -9999, opacity: 0 },
  aiLoading: { alignItems: 'center', padding: TempleSpacing.lg },
  aiLoadingText: { fontSize: TempleFonts.body, color: TempleTheme.textMuted, marginBottom: TempleSpacing.sm },
  loadingDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: TempleTheme.goldLight },
  aiCard: { backgroundColor: TempleTheme.bgCard, borderRadius: 16, padding: TempleSpacing.lg, borderWidth: 1.5, borderColor: TempleTheme.gold },
  aiLabel: { fontSize: TempleFonts.heading, fontWeight: '700', color: TempleTheme.goldLight, marginBottom: TempleSpacing.md, textAlign: 'center' },
  aiSection: {
    marginBottom: TempleSpacing.md,
    paddingBottom: TempleSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '16',
  },
  aiSectionTitle: {
    fontSize: TempleFonts.body,
    color: TempleTheme.gold,
    fontWeight: '800',
    marginBottom: 8,
  },
  aiText: { fontSize: TempleFonts.body, color: TempleTheme.textLight, lineHeight: 28, marginBottom: 4 },
  aiHeader: { fontWeight: '700', color: TempleTheme.goldLight, marginTop: TempleSpacing.sm },
  aiBlessing: { fontWeight: '700', color: TempleTheme.gold, textAlign: 'center', marginTop: TempleSpacing.md },
  aiEmpty: { height: 4 },
});
