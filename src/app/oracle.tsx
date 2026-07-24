// 多元占卜 — 易卦 64 卦 + 塔羅 22 張 + 靈擺是非
import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, TextInput, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useFadeIn } from '@/hooks/useEntranceAnimation';
import { drawHexagram, getLuckColor, getLuckLabel, type Hexagram } from '@/data/iching';
import { drawTarot, type TarotCard } from '@/data/tarot';
import { DecorativeBg } from '@/components/DecorativeBg';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import type { ThemeColors } from '@/constants/themes';

type Tab = 'iching' | 'tarot' | 'pendulum';

// ── 易卦 ──────────────────────────────────────────────────────────────────
function IChingSection() {
  const { theme } = useAppTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const fade = useFadeIn({ delay: 0 });
  const [result, setResult] = useState<Hexagram | null>(null);
  const [question, setQuestion] = useState('');
  const [shaking, setShaking] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    if (shaking) return;
    setShaking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 200, easing: Easing.linear, useNativeDriver: true }),
    ]).start(() => {
      const hex = drawHexagram(Date.now() + question.length * 37);
      setResult(hex);
      setShaking(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  }, [shaking, question, shakeAnim]);

  const rotate = shakeAnim.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: ['0deg', '-15deg', '15deg', '-10deg', '0deg'] });

  return (
    <Animated.View style={{ flex: 1, opacity: fade.opacity, transform: [{ translateY: fade.translateY }] }}>
      <ScrollView contentContainerStyle={s.section}>
        <Text style={s.sectionTitle}>易卦占卜</Text>
      <Text style={s.hint}>心存問題，搖動銅錢，天地自有答案。</Text>

      <TextInput
        style={s.input}
        value={question}
        onChangeText={setQuestion}
        placeholder="在心中默唸問題…（可選）"
        placeholderTextColor={theme.textMuted}
        multiline
        maxLength={80}
      />

      <TouchableOpacity onPress={shake} activeOpacity={0.8} style={s.drawBtn}>
        <Animated.Text style={[s.coinIcon, { transform: [{ rotate }] }]}>☯</Animated.Text>
        <Text style={s.drawBtnText}>{shaking ? '搖卦中…' : '搖銅錢起卦'}</Text>
      </TouchableOpacity>

      {result && (
        <View style={[s.resultCard, { borderColor: getLuckColor(result.luck) }]}>
          <View style={s.hexRow}>
            <Text style={s.hexSymbol}>{result.symbol}</Text>
            <View style={s.hexNameCol}>
              <Text style={s.hexNum}>第 {result.number} 卦</Text>
              <Text style={s.hexName}>{result.name}卦</Text>
              <Text style={[s.luckBadge, { color: getLuckColor(result.luck) }]}>{getLuckLabel(result.luck)}</Text>
            </View>
          </View>
          <Text style={s.hexImage}>【{result.image}】</Text>
          <Text style={s.guidance}>{result.guidance}</Text>
          <View style={s.divider} />
          <View style={s.actionRow}>
            <View style={s.actionCol}>
              <Text style={s.actionLabel}>建議</Text>
              <Text style={s.actionText}>{result.action}</Text>
            </View>
            <View style={s.actionCol}>
              <Text style={s.cautionLabel}>留意</Text>
              <Text style={s.actionText}>{result.caution}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
    </Animated.View>
  );
}

// ── 塔羅 ──────────────────────────────────────────────────────────────────
function TarotSection() {
  const { theme } = useAppTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const fade = useFadeIn({ delay: 0 });
  const [result, setResult] = useState<TarotCard | null>(null);
  const [question, setQuestion] = useState('');
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flip = useCallback(() => {
    if (flipped) {
      // reset
      setResult(null);
      setFlipped(false);
      flipAnim.setValue(0);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(flipAnim, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }).start(() => {
      const card = drawTarot(Date.now() + question.length * 53);
      setResult(card);
      setFlipped(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  }, [flipped, question, flipAnim]);

  const scaleX = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 1] });

  return (
    <Animated.View style={{ flex: 1, opacity: fade.opacity, transform: [{ translateY: fade.translateY }] }}>
      <ScrollView contentContainerStyle={s.section}>
        <Text style={s.sectionTitle}>塔羅占卜</Text>
      <Text style={s.hint}>專注你的問題，翻開命運之牌。</Text>

      <TextInput
        style={s.input}
        value={question}
        onChangeText={setQuestion}
        placeholder="在心中默唸問題…（可選）"
        placeholderTextColor={theme.textMuted}
        multiline
        maxLength={80}
      />

      <TouchableOpacity onPress={flip} activeOpacity={0.8} style={s.drawBtn}>
        <Animated.View style={[s.cardFace, { transform: [{ scaleX }] }]}>
          <Text style={s.cardBack}>{flipped && result ? result.symbol : '🂠'}</Text>
        </Animated.View>
        <Text style={s.drawBtnText}>{flipped ? '重新洗牌' : '翻牌'}</Text>
      </TouchableOpacity>

      {result && flipped && (
        <View style={[s.resultCard, { borderColor: getLuckColor(result.luck) }]}>
          <View style={s.tarotHeader}>
            <Text style={s.tarotSymbol}>{result.symbol}</Text>
            <View style={s.tarotNameCol}>
              <Text style={s.hexNum}>第 {result.number} 張</Text>
              <Text style={s.hexName}>{result.chineseName}</Text>
              <Text style={s.tarotSubName}>{result.name}</Text>
              <Text style={[s.luckBadge, { color: getLuckColor(result.luck) }]}>{getLuckLabel(result.luck)}</Text>
            </View>
          </View>
          <Text style={s.guidance}>{result.upright}</Text>
          <View style={s.divider} />
          <View style={s.actionRow}>
            <View style={s.actionCol}>
              <Text style={s.actionLabel}>建議</Text>
              <Text style={s.actionText}>{result.action}</Text>
            </View>
            <View style={s.actionCol}>
              <Text style={s.cautionLabel}>留意</Text>
              <Text style={s.actionText}>{result.caution}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
    </Animated.View>
  );
}

// ── 靈擺 ──────────────────────────────────────────────────────────────────
function PendulumSection() {
  const { theme } = useAppTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const fade = useFadeIn({ delay: 0 });
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);
  const [swinging, setSwinging] = useState(false);
  const swingAnim = useRef(new Animated.Value(0)).current;

  const consult = useCallback(() => {
    if (!question.trim() || swinging) return;
    setAnswer(null);
    setSwinging(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    swingAnim.setValue(0);
    // start fast, slow down
    Animated.sequence([
      Animated.timing(swingAnim, { toValue: 5, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(swingAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      const ans = ((Date.now() + question.length * 91) % 2 === 0) ? 'yes' : 'no';
      setAnswer(ans);
      setSwinging(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  }, [question, swinging, swingAnim]);

  const pendulumRotate = swingAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5],
    outputRange: ['0deg', '25deg', '-25deg', '18deg', '-18deg', '0deg'],
  });

  const YES_COLOR = theme.success;
  const NO_COLOR = theme.danger;

  return (
    <Animated.View style={{ flex: 1, opacity: fade.opacity, transform: [{ translateY: fade.translateY }] }}>
      <ScrollView contentContainerStyle={s.section}>
        <Text style={s.sectionTitle}>靈擺問卜</Text>
      <Text style={s.hint}>以是非之問求得神明指引，心誠則靈。</Text>

      <TextInput
        style={s.input}
        value={question}
        onChangeText={setQuestion}
        placeholder="請輸入是非題，例如：我應該…嗎？"
        placeholderTextColor={theme.textMuted}
        multiline
        maxLength={60}
      />

      <View style={s.pendulumContainer}>
        <View style={s.pendulumPivot} />
        <Animated.View style={[s.pendulumArm, { transform: [{ rotate: pendulumRotate }], transformOrigin: 'top center' as any }]}>
          <View style={s.pendulumLine} />
          <View style={[s.pendulumBob, answer && { backgroundColor: answer === 'yes' ? YES_COLOR : NO_COLOR }]} />
        </Animated.View>
      </View>

      <TouchableOpacity
        onPress={consult}
        activeOpacity={0.8}
        style={[s.drawBtn, !question.trim() && { opacity: 0.5 }]}
        disabled={!question.trim() || swinging}
      >
        <Text style={s.drawBtnText}>{swinging ? '靈擺感應中…' : '啟動靈擺'}</Text>
      </TouchableOpacity>

      {answer && !swinging && (
        <View style={[s.resultCard, { borderColor: answer === 'yes' ? YES_COLOR : NO_COLOR, alignItems: 'center' }]}>
          <Text style={[s.pendulumAnswer, { color: answer === 'yes' ? YES_COLOR : NO_COLOR }]}>
            {answer === 'yes' ? '✓ 是' : '✗ 否'}
          </Text>
          <Text style={s.guidance}>
            {answer === 'yes' ? '靈擺向前擺動，神明指引：此事可行，放心前進。' : '靈擺橫向擺動，神明指引：此事需三思，暫緩為宜。'}
          </Text>
        </View>
      )}
    </ScrollView>
    </Animated.View>
  );
}

// ── 主頁面 ─────────────────────────────────────────────────────────────────
const TABS: { key: Tab; label: string }[] = [
  { key: 'iching', label: '易卦' },
  { key: 'tarot', label: '塔羅' },
  { key: 'pendulum', label: '靈擺' },
];

export default function OracleScreen() {
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const s = useMemo(() => createStyles(theme), [theme]);
  const [tab, setTab] = useState<Tab>('iching');

  const TAB_LABELS: Record<Tab, string> = {
    iching: t('oracleTabIching'),
    tarot: t('oracleTabTarot'),
    pendulum: t('oracleTabPendulum'),
  };

  return (
    <SafeAreaView style={s.safe}>
      <DecorativeBg pattern="diamond" />
      <View style={s.header}>
        <Text style={s.title}>{t('oraclePageTitle')}</Text>
        <View style={s.tabRow}>
          {TABS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[s.tabBtn, tab === key && s.tabBtnActive]}
              onPress={() => setTab(key)}
              activeOpacity={0.8}
            >
              <Text style={[s.tabLabel, tab === key && s.tabLabelActive]}>{TAB_LABELS[key]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === 'iching'   && <IChingSection />}
      {tab === 'tarot'    && <TarotSection />}
      {tab === 'pendulum' && <PendulumSection />}
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgDark },
  header: { paddingHorizontal: TempleSpacing.md, paddingTop: TempleSpacing.md, paddingBottom: TempleSpacing.sm, backgroundColor: theme.bgDark },
  title: { fontSize: TempleFonts.subtitle, fontWeight: 'bold', color: theme.textGold, textAlign: 'center', marginBottom: TempleSpacing.sm },
  tabRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  tabBtn: { paddingVertical: 6, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: theme.gold },
  tabBtnActive: { backgroundColor: theme.gold },
  tabLabel: { color: theme.gold, fontSize: TempleFonts.body, fontWeight: '500' },
  tabLabelActive: { color: theme.bgDark, fontWeight: 'bold' },

  section: { padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl },
  sectionTitle: { fontSize: TempleFonts.heading, fontWeight: 'bold', color: theme.textGold, textAlign: 'center', marginBottom: 4 },
  hint: { fontSize: TempleFonts.small, color: theme.textMuted, textAlign: 'center', marginBottom: TempleSpacing.md },
  input: {
    backgroundColor: theme.bgCard,
    borderRadius: 12, borderWidth: 1, borderColor: theme.gold,
    padding: TempleSpacing.sm, color: theme.textLight,
    fontSize: TempleFonts.body, marginBottom: TempleSpacing.md,
    minHeight: 52,
  } as any,

  drawBtn: {
    backgroundColor: theme.bgCard,
    borderRadius: 16, borderWidth: 1.5, borderColor: theme.gold,
    paddingVertical: TempleSpacing.md, paddingHorizontal: TempleSpacing.xl,
    alignItems: 'center', alignSelf: 'center', marginBottom: TempleSpacing.lg,
    minWidth: 180,
  },
  coinIcon: { fontSize: 48, marginBottom: 6 },
  drawBtnText: { color: theme.textGold, fontSize: TempleFonts.body, fontWeight: 'bold' },

  resultCard: {
    backgroundColor: theme.bgCard,
    borderRadius: 16, borderWidth: 1.5,
    padding: TempleSpacing.md, marginTop: 4,
  },
  hexRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: TempleSpacing.sm },
  hexSymbol: { fontSize: 52, color: theme.textGold },
  hexNameCol: {},
  hexNum: { fontSize: TempleFonts.small, color: theme.textMuted },
  hexName: { fontSize: TempleFonts.heading, fontWeight: 'bold', color: theme.textLight },
  hexImage: { fontSize: TempleFonts.small, color: theme.textMuted, marginBottom: TempleSpacing.sm },
  luckBadge: { fontSize: TempleFonts.small, fontWeight: 'bold', marginTop: 2 },
  guidance: { fontSize: TempleFonts.body, color: theme.textLight, lineHeight: 24, marginBottom: TempleSpacing.sm },
  divider: { height: 1, backgroundColor: theme.bgMedium, marginVertical: TempleSpacing.sm },
  actionRow: { flexDirection: 'row', gap: TempleSpacing.sm },
  actionCol: { flex: 1 },
  actionLabel: { fontSize: TempleFonts.small, fontWeight: 'bold', color: theme.success, marginBottom: 2 },
  cautionLabel: { fontSize: TempleFonts.small, fontWeight: 'bold', color: theme.warning, marginBottom: 2 },
  actionText: { fontSize: TempleFonts.small, color: theme.textMuted, lineHeight: 18 },

  // tarot
  cardFace: { width: 64, height: 90, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  cardBack: { fontSize: 56, lineHeight: 72 },
  tarotHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: TempleSpacing.sm },
  tarotSymbol: { fontSize: 52 },
  tarotNameCol: {},
  tarotSubName: { fontSize: TempleFonts.small, color: theme.textMuted },

  // pendulum
  pendulumContainer: { alignItems: 'center', height: 160, marginBottom: TempleSpacing.md },
  pendulumPivot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.gold },
  pendulumArm: { alignItems: 'center', position: 'absolute', top: 0 },
  pendulumLine: { width: 2, height: 100, backgroundColor: theme.gold, marginTop: 6 },
  pendulumBob: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.gold, marginTop: 2 },
  pendulumAnswer: { fontSize: TempleFonts.title, fontWeight: 'bold', marginBottom: TempleSpacing.sm },
  } as const);
}
