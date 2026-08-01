// 神明詳細頁 — 單一神明完整資訊
import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { gods } from '@/data/gods';
import { getGodCardImage } from '@/data/godImages';
import { getGodProfile } from '@/data/godProfiles';
import { getGodQuestionGuide } from '@/data/godQuestionGuides';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { getHistory, type DivinationRecord } from '@/services/storage';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { DecorativeBg } from '@/components/DecorativeBg';

export default function GodDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ godId?: string }>();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const layout = useResponsiveLayout();
  const reducedMotion = useReducedMotion();
  const contentMaxWidth = layout.narrowMaxWidth;

  const godId = params.godId ? Number(params.godId) : undefined;
  const god = useMemo(() => gods.find((g) => g.id === godId), [godId]);
  const cardImage = god ? getGodCardImage(god.id) : null;
  const profile = god ? getGodProfile(god.id) : null;
  const questionGuide = god ? getGodQuestionGuide(god.id) : null;
  const oracleCatalog = god ? getOracleCatalogByGodId(god.id) : null;

  const [historyRecords, setHistoryRecords] = React.useState<DivinationRecord[]>([]);
  const fadeContent = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (god) {
      getHistory().then((records) => {
        setHistoryRecords(
          records.filter((r) => r.godName === god.name).slice(0, 10)
        );
      });
    }
  }, [god]);

  React.useEffect(() => {
    if (reducedMotion) {
      fadeContent.setValue(1);
      return;
    }
    fadeContent.setValue(0);
    Animated.timing(fadeContent, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [godId, reducedMotion, fadeContent]);

  if (!god) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>找不到神明資料</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← 返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statCount = historyRecords.length;
  const recentDraws = historyRecords.slice(0, 3);

  const handleStartDivination = () => {
    router.replace({ pathname: '/(tabs)', params: { godId: String(god.id) } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBg />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
          <Text style={styles.headerBackText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{god.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth }]}
      >
        {/* Hero 大圖 */}
        <Animated.View style={{ opacity: fadeContent }}>
          <View style={[styles.heroWrap, { borderColor: god.accentColor + '66' }]}>
            {cardImage ? (
              <Image source={cardImage} style={styles.heroImage} contentFit="cover" contentPosition="top" transition={300} />
            ) : null}
            <View style={[styles.heroOverlay, { backgroundColor: god.primaryColor + 'CC' }]} />
            <View style={styles.heroContent}>
              <Text style={[styles.heroTitle, { color: god.accentColor }]}>{god.title}</Text>
              <Text style={styles.heroName}>{god.name}</Text>
              <Text style={[styles.heroTagline, { color: god.accentColor }]}>{god.tagline}</Text>
            </View>
          </View>

          {/* 介紹 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📖 神明介紹</Text>
            <Text style={styles.bodyText}>{god.description}</Text>
            <Text style={[styles.blessing, { color: god.accentColor }]}>&ldquo;{god.blessing}&rdquo;</Text>
          </View>

          {/* 主掌領域 */}
          {profile?.patronages && profile.patronages.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏛️ 主掌領域</Text>
              <View style={styles.chipRow}>
                {profile.patronages.map((item) => (
                  <View key={item} style={[styles.chip, { borderColor: god.accentColor + '40', backgroundColor: god.primaryColor + '18' }]}>
                    <Text style={[styles.chipText, { color: god.accentColor }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* 籤詩系統 */}
          {oracleCatalog ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📜 籤詩系統</Text>
              <View style={styles.infoRow}>
                <View style={[styles.badge, { backgroundColor: god.primaryColor + '30', borderColor: god.accentColor + '50' }]}>
                  <Text style={[styles.badgeText, { color: god.accentColor }]}>{god.poemSystem}</Text>
                </View>
                <Text style={styles.muted}>共 {god.totalPoems} 首籤詩</Text>
              </View>
              {oracleCatalog.sourceNote ? (
                <Text style={[styles.muted, { marginTop: 8 }]}>{oracleCatalog.sourceNote}</Text>
              ) : null}
              {oracleCatalog.suitabilityNote ? (
                <Text style={[styles.muted, { marginTop: 4 }]}>{oracleCatalog.suitabilityNote}</Text>
              ) : null}
              {oracleCatalog.strengths && oracleCatalog.strengths.length > 0 ? (
                <View style={[styles.chipRow, { marginTop: 8 }]}>
                  {oracleCatalog.strengths.map((s) => (
                    <View key={s} style={[styles.chip, { borderColor: god.accentColor + '30' }]}>
                      <Text style={[styles.chipText, { color: god.accentColor }]}>✓ {s}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* 參拜建議 */}
          {profile?.worshipTips && profile.worshipTips.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🙏 參拜建議</Text>
              {profile.worshipTips.map((tip, i) => (
                <Text key={i} style={styles.bullet}>• {tip}</Text>
              ))}
            </View>
          ) : null}

          {/* 適合問的問題 */}
          {questionGuide ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 適合問的問題</Text>
              <Text style={styles.bodyText}>{questionGuide.intro}</Text>
              {questionGuide.prompts && questionGuide.prompts.length > 0 ? (
                <View style={styles.promptList}>
                  {questionGuide.prompts.map((p, i) => (
                    <View key={i} style={styles.promptItem}>
                      <Text style={styles.promptText}>{p.text}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* 你的求籤統計 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 你的求籤統計</Text>
            {statCount > 0 ? (
              <>
                <View style={styles.statRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{statCount}</Text>
                    <Text style={styles.statLabel}>總求籤次數</Text>
                  </View>
                </View>
                {recentDraws.length > 0 ? (
                  <View style={styles.recentSection}>
                    <Text style={styles.recentTitle}>近期求籤紀錄</Text>
                    {recentDraws.map((record, i) => (
                      <View key={record.id} style={styles.recentItem}>
                        <Text style={styles.recentPoem}>第 {record.poem.number} 籤 · {record.poem.title}</Text>
                        <Text style={styles.recentQuestion}>{record.question || '未記錄問題'}</Text>
                        <Text style={styles.recentDate}>
                          {new Date(record.timestamp).toLocaleDateString('zh-TW')}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </>
            ) : (
              <Text style={styles.bodyText}>尚未向{god.name}求過籤，快去求一支吧！</Text>
            )}
          </View>

          {/* 開始求籤按鈕 */}
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: god.primaryColor }]}
            onPress={handleStartDivination}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>🔗 開始求籤</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.bgDark },
    notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: TempleSpacing.lg },
    notFoundTitle: { fontSize: TempleFonts.heading, color: theme.goldLight, marginBottom: TempleSpacing.md },
    backBtn: {
      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
      backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.goldDark + '30',
    },
    backBtnText: { color: theme.goldLight, fontSize: TempleFonts.small },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: TempleSpacing.md,
      paddingVertical: TempleSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.goldDark + '20',
    },
    headerBackBtn: {
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
      backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.goldDark + '30',
    },
    headerBackText: { color: theme.goldLight, fontSize: 12 },
    headerTitle: { fontSize: TempleFonts.hero, fontWeight: TempleFonts.heavy, color: theme.goldLight },
    headerSpacer: { width: 60 },
    scrollContent: { width: '100%', alignSelf: 'center', paddingHorizontal: TempleSpacing.md, paddingTop: TempleSpacing.md },
    heroWrap: {
      height: 240,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1.5,
      marginBottom: TempleSpacing.md,
    },
    heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    heroContent: { flex: 1, justifyContent: 'flex-end', padding: TempleSpacing.lg },
    heroTitle: { fontSize: 12, fontWeight: TempleFonts.bold, letterSpacing: 2, marginBottom: 4 },
    heroName: { fontSize: 30, fontWeight: TempleFonts.black, color: theme.goldLight, marginBottom: 4 },
    heroTagline: { fontSize: 15, fontWeight: TempleFonts.bold },
    section: {
      backgroundColor: theme.bgCard,
      borderRadius: 14,
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.sm,
      borderWidth: 1,
      borderColor: theme.goldDark + '20',
    },
    sectionTitle: {
      fontSize: TempleFonts.body,
      fontWeight: TempleFonts.heavy,
      color: theme.goldLight,
      marginBottom: 10,
    },
    bodyText: { fontSize: TempleFonts.small, color: theme.textLight, lineHeight: 22 },
    blessing: {
      fontSize: TempleFonts.small,
      fontStyle: 'italic',
      lineHeight: 22,
      marginTop: TempleSpacing.sm,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.bgDark + '45',
    },
    chipText: { fontSize: 12, fontWeight: TempleFonts.semibold },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    badge: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    badgeText: { fontSize: 12, fontWeight: TempleFonts.bold },
    muted: { fontSize: 12, color: theme.textMuted, lineHeight: 20 },
    bullet: { fontSize: TempleFonts.small, color: theme.textLight, lineHeight: 22, marginBottom: 4 },
    promptList: { marginTop: TempleSpacing.sm, gap: 8 },
    promptItem: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.goldDark + '24',
      backgroundColor: theme.bgDark + '44',
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    promptText: { color: theme.goldLight, fontSize: TempleFonts.small, lineHeight: 20 },
    statRow: { flexDirection: 'row', gap: TempleSpacing.sm, marginBottom: TempleSpacing.sm },
    statBox: {
      flex: 1,
      backgroundColor: theme.bgDark + '55',
      borderRadius: 10,
      padding: TempleSpacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.goldDark + '25',
    },
    statNumber: { fontSize: TempleFonts.title, fontWeight: TempleFonts.black, color: theme.goldLight },
    statLabel: { fontSize: 11, color: theme.textMuted, marginTop: 2 },
    recentSection: { marginTop: TempleSpacing.xs },
    recentTitle: {
      fontSize: TempleFonts.small,
      fontWeight: TempleFonts.bold,
      color: theme.goldLight,
      marginBottom: 8,
    },
    recentItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.goldDark + '15',
      paddingVertical: 8,
      gap: 2,
    },
    recentPoem: { fontSize: TempleFonts.small, color: theme.goldLight, fontWeight: TempleFonts.semibold },
    recentQuestion: { fontSize: 12, color: theme.textLight },
    recentDate: { fontSize: 10, color: theme.textMuted },
    startBtn: {
      marginTop: TempleSpacing.sm,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
    },
    startBtnText: { fontSize: TempleFonts.hero, fontWeight: TempleFonts.heavy, color: '#FFF', letterSpacing: 2 },
  });
}
