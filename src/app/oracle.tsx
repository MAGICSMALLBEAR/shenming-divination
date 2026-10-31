// 多元占卜 — 易卦六爻變卦 + 塔羅牌陣正逆位 + 靈擺四維能量指引
import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, TextInput, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useFadeIn } from '@/hooks/useEntranceAnimation';
import { getLuckColor, getLuckLabel } from '@/data/iching';
import { castIChing, type IChingDivinationResult } from '@/data/ichingAdv';
import {
  drawTarotSpread,
  TAROT_SPREADS,
  type TarotSpreadType,
  type DrawnTarotCard,
} from '@/data/tarotSpreads';
import { DecorativeBg } from '@/components/DecorativeBg';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import type { ThemeColors } from '@/constants/themes';

type Tab = 'iching' | 'tarot' | 'pendulum';

// ── 易卦六爻動爻與之卦系統 ────────────────────────────────────────────────
function IChingSection() {
  const { theme } = useAppTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const fade = useFadeIn({ delay: 0 });
  const [result, setResult] = useState<IChingDivinationResult | null>(null);
  const [question, setQuestion] = useState('');
  const [shaking, setShaking] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    if (shaking) return;
    setShaking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 250, easing: Easing.linear, useNativeDriver: true }),
    ]).start(() => {
      const res = castIChing();
      setResult(res);
      setShaking(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  }, [shaking, shakeAnim]);

  const rotate = shakeAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '-18deg', '18deg', '-12deg', '0deg'],
  });

  return (
    <Animated.View style={{ flex: 1, opacity: fade.opacity, transform: [{ translateY: fade.translateY }] }}>
      <ScrollView contentContainerStyle={s.section}>
        <Text style={s.sectionTitle}>周易六爻神卦</Text>
        <Text style={s.hint}>三枚銅錢六擲成卦・洞察本卦根基、動爻變化與之卦趨勢</Text>

        <TextInput
          style={s.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="在心中默唸所問之事（如：事業轉職、投資方向、關係進退）…"
          placeholderTextColor={theme.textMuted}
          multiline
          maxLength={80}
        />

        <TouchableOpacity onPress={shake} activeOpacity={0.8} style={s.drawBtn}>
          <Animated.Text style={[s.coinIcon, { transform: [{ rotate }] }]}>☯</Animated.Text>
          <Text style={s.drawBtnText}>{shaking ? '六爻擲幣推演中…' : '搖銅錢六擲成卦'}</Text>
        </TouchableOpacity>

        {result && (
          <View style={s.resultWrapper}>
            {/* 六爻爻象視覺展示圖 (由上爻至初爻呈現) */}
            <View style={s.linesCard}>
              <Text style={s.linesCardTitle}>六爻卦象成式（由下而上疊成）</Text>
              <View style={s.linesContainer}>
                {[...result.lines].reverse().map((line) => (
                  <View key={line.position} style={s.lineRow}>
                    <Text style={s.linePosText}>{line.positionName}</Text>
                    {/* 陰爻 / 陽爻 圖形 */}
                    {line.isYang ? (
                      <View style={[s.solidYao, line.isMoving && s.movingYao]}>
                        <View style={s.solidBar} />
                      </View>
                    ) : (
                      <View style={[s.brokenYao, line.isMoving && s.movingYao]}>
                        <View style={s.brokenBar} />
                        <View style={s.brokenGap} />
                        <View style={s.brokenBar} />
                      </View>
                    )}
                    {/* 爻辭動靜標記 */}
                    <Text style={[s.lineValText, line.isMoving && s.movingLineValText]}>
                      {line.value === 9 ? '老陽 (動 ○)' :
                       line.value === 6 ? '老陰 (動 ✕)' :
                       line.value === 7 ? '少陽 (靜)' : '少陰 (靜)'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 本卦與之卦卡片 */}
            <View style={s.hexagramsRow}>
              {/* 本卦 */}
              <View style={[s.hexCard, { borderColor: getLuckColor(result.primaryHexagram.luck) }]}>
                <Text style={s.hexRoleTag}>【 本卦・當前根本 】</Text>
                <Text style={s.hexSymbol}>{result.primaryHexagram.symbol}</Text>
                <Text style={s.hexNumber}>第 {result.primaryHexagram.number} 卦</Text>
                <Text style={s.hexName}>{result.primaryHexagram.name}卦</Text>
                <Text style={[s.luckBadge, { color: getLuckColor(result.primaryHexagram.luck) }]}>
                  {getLuckLabel(result.primaryHexagram.luck)}
                </Text>
                <Text style={s.hexImage}>卦象：{result.primaryHexagram.image}</Text>
              </View>

              {/* 變卦 */}
              {result.changedHexagram ? (
                <View style={[s.hexCard, { borderColor: getLuckColor(result.changedHexagram.luck) }]}>
                  <Text style={[s.hexRoleTag, { color: '#E57373' }]}>【 之卦・未來趨勢 】</Text>
                  <Text style={s.hexSymbol}>{result.changedHexagram.symbol}</Text>
                  <Text style={s.hexNumber}>第 {result.changedHexagram.number} 卦</Text>
                  <Text style={s.hexName}>{result.changedHexagram.name}卦</Text>
                  <Text style={[s.luckBadge, { color: getLuckColor(result.changedHexagram.luck) }]}>
                    {getLuckLabel(result.changedHexagram.luck)}
                  </Text>
                  <Text style={s.hexImage}>卦象：{result.changedHexagram.image}</Text>
                </View>
              ) : (
                <View style={[s.hexCard, { borderColor: theme.goldDark + '60', justifyContent: 'center' }]}>
                  <Text style={s.hexRoleTag}>【 靜卦無之 】</Text>
                  <Text style={s.noChangeText}>六爻安靜不動</Text>
                  <Text style={s.noChangeSub}>人事處於平穩基調，專注於本卦指示即可。</Text>
                </View>
              )}
            </View>

            {/* 動爻與變動總結 */}
            <View style={s.verdictCard}>
              <Text style={s.verdictTitle}>⚡ 動爻轉變契機</Text>
              <Text style={s.verdictBody}>{result.movingLineSummary}</Text>
              <Text style={s.verdictBody}>{result.overallVerdict}</Text>
            </View>

            {/* 本卦決策指引 */}
            <View style={s.adviceCard}>
              <Text style={s.adviceHeader}>【本卦啟示：{result.primaryHexagram.name}】</Text>
              <Text style={s.guidanceText}>{result.primaryHexagram.guidance}</Text>
              <View style={s.divider} />
              <View style={s.actionRow}>
                <View style={s.actionCol}>
                  <Text style={s.actionLabel}>💡 建議行動</Text>
                  <Text style={s.actionText}>{result.primaryHexagram.action}</Text>
                </View>
                <View style={s.actionCol}>
                  <Text style={s.cautionLabel}>⚠️ 宜加留意</Text>
                  <Text style={s.actionText}>{result.primaryHexagram.caution}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

// ── 塔羅牌陣（單張、時間之流、聖三角）與正逆位系統 ─────────────────────────
function TarotSection() {
  const { theme } = useAppTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const fade = useFadeIn({ delay: 0 });

  const [spreadType, setSpreadType] = useState<TarotSpreadType>('three-time');
  const [drawnCards, setDrawnCards] = useState<DrawnTarotCard[]>([]);
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);
  const [question, setQuestion] = useState('');
  const [drawing, setDrawing] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleDraw = useCallback(() => {
    if (drawing) return;
    setDrawing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    flipAnim.setValue(0);
    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 750,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start(() => {
      const cards = drawTarotSpread(spreadType);
      setDrawnCards(cards);
      setSelectedCardIdx(0);
      setDrawing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  }, [drawing, spreadType, flipAnim]);

  const activeDrawnCard = drawnCards[selectedCardIdx] ?? drawnCards[0];

  return (
    <Animated.View style={{ flex: 1, opacity: fade.opacity, transform: [{ translateY: fade.translateY }] }}>
      <ScrollView contentContainerStyle={s.section}>
        <Text style={s.sectionTitle}>大阿爾克那塔羅牌陣</Text>
        <Text style={s.hint}>正逆位雙向解讀・多牌陣深入觀照過去、現在與未來因緣</Text>

        {/* 牌陣選擇標籤 */}
        <View style={s.spreadSelector}>
          {(['single', 'three-time', 'holy-triangle'] as TarotSpreadType[]).map((type) => {
            const isCur = spreadType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[s.spreadTab, isCur && s.spreadTabActive]}
                onPress={() => { setSpreadType(type); setDrawnCards([]); }}
              >
                <Text style={[s.spreadTabText, isCur && s.spreadTabTextActive]}>
                  {TAROT_SPREADS[type].title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.spreadDesc}>{TAROT_SPREADS[spreadType].description}</Text>

        <TextInput
          style={s.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="凝神專注，心中默唸你想探索的問題（可選）…"
          placeholderTextColor={theme.textMuted}
          multiline
          maxLength={80}
        />

        <TouchableOpacity onPress={handleDraw} activeOpacity={0.8} style={s.drawBtn}>
          <Text style={s.cardBackIcon}>🂠</Text>
          <Text style={s.drawBtnText}>{drawing ? '洗牌抽牌中…' : `洗牌・排開【${TAROT_SPREADS[spreadType].title}】`}</Text>
        </TouchableOpacity>

        {/* 抽牌結果呈現 */}
        {drawnCards.length > 0 && !drawing ? (
          <View style={s.tarotResultContainer}>
            {/* 牌位標籤導覽 */}
            <View style={s.cardsRow}>
              {drawnCards.map((drawn, idx) => {
                const isSelected = idx === selectedCardIdx;
                return (
                  <TouchableOpacity
                    key={`${drawn.card.name}-${idx}`}
                    style={[s.spreadCardItem, isSelected && s.spreadCardItemSelected]}
                    onPress={() => setSelectedCardIdx(idx)}
                  >
                    <Text style={[s.cardPositionBadge, isSelected && s.cardPositionBadgeActive]}>
                      {drawn.position.name}
                    </Text>
                    <Text style={[s.cardMiniSymbol, drawn.isReversed && s.reversedTransform]}>
                      {drawn.card.symbol}
                    </Text>
                    <Text style={s.cardMiniName}>{drawn.card.chineseName}</Text>
                    <View style={[s.orientationPill, drawn.isReversed ? s.reversedPill : s.uprightPill]}>
                      <Text style={s.orientationText}>
                        {drawn.isReversed ? '🔄 逆位' : '⬆️ 正位'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 所選卡牌之深度詳解 */}
            {activeDrawnCard ? (
              <View style={s.tarotDetailCard}>
                <View style={s.tarotDetailHeader}>
                  <Text style={[s.tarotBigSymbol, activeDrawnCard.isReversed && s.reversedTransform]}>
                    {activeDrawnCard.card.symbol}
                  </Text>
                  <View style={s.tarotTitleCol}>
                    <Text style={s.positionSubLabel}>【牌位：{activeDrawnCard.position.name}】</Text>
                    <Text style={s.tarotMainName}>
                      {activeDrawnCard.card.chineseName}
                      <Text style={[s.orientationTextBig, activeDrawnCard.isReversed ? { color: '#E57373' } : { color: '#81C784' }]}>
                        （{activeDrawnCard.isReversed ? '逆位' : '正位'}）
                      </Text>
                    </Text>
                    <Text style={s.tarotEngName}>No.{activeDrawnCard.card.number} {activeDrawnCard.card.name}</Text>
                  </View>
                </View>

                <View style={s.positionContextBox}>
                  <Text style={s.positionContextTitle}>📍 牌位指涉：</Text>
                  <Text style={s.positionContextDesc}>{activeDrawnCard.position.description}</Text>
                </View>

                <Text style={s.tarotInterpretationText}>{activeDrawnCard.interpretation}</Text>

                <View style={s.divider} />

                <View style={s.actionRow}>
                  <View style={s.actionCol}>
                    <Text style={s.actionLabel}>💡 當下行動指引</Text>
                    <Text style={s.actionText}>{activeDrawnCard.actionGuidance}</Text>
                  </View>
                  <View style={s.actionCol}>
                    <Text style={s.cautionLabel}>⚠️ 需留意警示</Text>
                    <Text style={s.actionText}>{activeDrawnCard.card.caution}</Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </Animated.View>
  );
}

// ── 靈擺問卜（四維動力學、調息定心與深層解析） ─────────────────────────────
type PendulumState = 'yes' | 'no' | 'timing' | 'clarify';

const PENDULUM_RESULTS: Record<PendulumState, {
  label: string;
  icon: string;
  motionDesc: string;
  verdict: string;
  advice: string;
  color: string;
}> = {
  yes: {
    label: '順時針旋轉・肯定',
    icon: '✨',
    motionDesc: '靈擺自中心順時針平穩旋轉畫圓，能量順暢合和。',
    verdict: '神明與天地氣場給予肯定：此事契機已備，順應良善心念推進，可得吉助。',
    advice: '堅定信心，保持正向專注，莫因旁人碎語而動搖。',
    color: '#4CAF50',
  },
  no: {
    label: '逆時針旋轉・否定',
    icon: '🛑',
    motionDesc: '靈擺出現逆時針抗性旋轉，或明顯橫向受阻。',
    verdict: '神明指引：當前阻力較大或非最佳路徑，若強行求成易生波折與耗損。',
    advice: '適時踩剎車，重新檢視初衷與現實條件，以退為進方得保全。',
    color: '#E53935',
  },
  timing: {
    label: '前後垂直大幅擺動・時機未到',
    icon: '⏳',
    motionDesc: '靈擺前後大幅直向擺盪，象徵事態正處於演變推移之中。',
    verdict: '因緣條件尚未具足，局勢仍在動態發展，急躁下結論容易生變。',
    advice: '靜待七日或待關鍵人物／資訊明朗後再行決斷，養精蓄銳為宜。',
    color: '#FFB300',
  },
  clarify: {
    label: '微幅橢圓/停滯・意念紛雜',
    icon: '🧘',
    motionDesc: '靈擺微幅顫動或無明確指向，感應場混濁紛擾。',
    verdict: '當前內心雜念較多，或問題邊界過於廣泛模糊，天地靈能無法聚焦投射。',
    advice: '建議先深呼吸三次使心念平靜，將問題收斂為具體的單一選擇後再行問卜。',
    color: '#42A5F5',
  },
};

function PendulumSection() {
  const { theme } = useAppTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const fade = useFadeIn({ delay: 0 });

  const [question, setQuestion] = useState('');
  const [pendulumState, setPendulumState] = useState<PendulumState | null>(null);
  const [resonance, setResonance] = useState(85);
  const [swinging, setSwinging] = useState(false);
  const [meditating, setMeditating] = useState(false);
  const [meditateSeconds, setMeditateSeconds] = useState(3);

  const swingAnim = useRef(new Animated.Value(0)).current;

  // 定心深呼吸調頻引導
  const handleMeditate = () => {
    if (meditating || swinging) return;
    setMeditating(true);
    setMeditateSeconds(3);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const interval = setInterval(() => {
      setMeditateSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setMeditating(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const consult = useCallback(() => {
    if (!question.trim() || swinging) return;
    setPendulumState(null);
    setSwinging(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    swingAnim.setValue(0);

    Animated.sequence([
      Animated.timing(swingAnim, { toValue: 5, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(swingAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      // 四態推演
      const rand = Math.random();
      let state: PendulumState = 'yes';
      if (rand < 0.40) state = 'yes';
      else if (rand < 0.70) state = 'no';
      else if (rand < 0.88) state = 'timing';
      else state = 'clarify';

      const resScore = Math.floor(75 + Math.random() * 23);
      setResonance(resScore);
      setPendulumState(state);
      setSwinging(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  }, [question, swinging, swingAnim]);

  const pendulumRotate = swingAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5],
    outputRange: ['0deg', '28deg', '-28deg', '18deg', '-18deg', '0deg'],
  });

  const activeResult = pendulumState ? PENDULUM_RESULTS[pendulumState] : null;

  return (
    <Animated.View style={{ flex: 1, opacity: fade.opacity, transform: [{ translateY: fade.translateY }] }}>
      <ScrollView contentContainerStyle={s.section}>
        <Text style={s.sectionTitle}>靈擺身心共振問卜</Text>
        <Text style={s.hint}>收攝心神・以微觀物理振動連結內在直覺與神靈感應</Text>

        <TextInput
          style={s.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="請輸入具體的是非問句（如：這項合作方案可行嗎？）…"
          placeholderTextColor={theme.textMuted}
          multiline
          maxLength={70}
        />

        {/* 呼吸定心按鈕 */}
        <TouchableOpacity
          style={[s.meditateBtn, meditating && s.meditateBtnActive]}
          onPress={handleMeditate}
          disabled={meditating || swinging}
        >
          <Text style={s.meditateBtnText}>
            {meditating ? `🌬️ 請緩緩吐氣・靜心調頻中（${meditateSeconds}s）` : '🧘 祈請前定心調頻（深呼吸沉澱心念）'}
          </Text>
        </TouchableOpacity>

        {/* 靈擺動畫 */}
        <View style={s.pendulumContainer}>
          <View style={s.pendulumPivot} />
          <Animated.View style={[s.pendulumArm, { transform: [{ rotate: pendulumRotate }], transformOrigin: 'top center' as any }]}>
            <View style={s.pendulumLine} />
            <View
              style={[
                s.pendulumBob,
                activeResult && { backgroundColor: activeResult.color, shadowColor: activeResult.color },
              ]}
            />
          </Animated.View>
        </View>

        <TouchableOpacity
          onPress={consult}
          activeOpacity={0.8}
          style={[s.drawBtn, (!question.trim() || swinging) && { opacity: 0.6 }]}
          disabled={!question.trim() || swinging}
        >
          <Text style={s.drawBtnText}>{swinging ? '靈性能量感應中…' : '啟動靈擺感應'}</Text>
        </TouchableOpacity>

        {/* 靈擺結果卡片 */}
        {activeResult && !swinging ? (
          <View style={[s.pendulumResultCard, { borderColor: activeResult.color }]}>
            <View style={s.pendulumHeader}>
              <Text style={s.pendulumIcon}>{activeResult.icon}</Text>
              <View>
                <Text style={[s.pendulumStateTitle, { color: activeResult.color }]}>{activeResult.label}</Text>
                <Text style={s.pendulumResonance}>感應共振強度：{resonance}%</Text>
              </View>
            </View>

            <Text style={s.pendulumMotionDesc}>【擺動軌跡】{activeResult.motionDesc}</Text>

            <View style={s.divider} />

            <Text style={s.pendulumVerdict}>{activeResult.verdict}</Text>

            <View style={s.pendulumAdviceBox}>
              <Text style={s.pendulumAdviceTitle}>💡 慈悲處世指引</Text>
              <Text style={s.pendulumAdviceText}>{activeResult.advice}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Animated.View>
  );
}

// ── 主頁面容器 ─────────────────────────────────────────────────────────────
const TABS: { key: Tab; label: string }[] = [
  { key: 'iching', label: '六爻易卦' },
  { key: 'tarot', label: '塔羅牌陣' },
  { key: 'pendulum', label: '靈擺問卜' },
];

export default function OracleScreen() {
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const s = useMemo(() => createStyles(theme), [theme]);
  const [tab, setTab] = useState<Tab>('iching');

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
              <Text style={[s.tabLabel, tab === key && s.tabLabelActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === 'iching' && <IChingSection />}
      {tab === 'tarot' && <TarotSection />}
      {tab === 'pendulum' && <PendulumSection />}
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bgDark },
    header: {
      paddingHorizontal: TempleSpacing.md,
      paddingTop: TempleSpacing.sm,
      paddingBottom: TempleSpacing.sm,
      backgroundColor: theme.bgDark,
    },
    title: { fontSize: TempleFonts.title, fontWeight: 'bold', color: theme.textGold, textAlign: 'center', marginBottom: TempleSpacing.sm },
    tabRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
    tabBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: theme.goldDark + '80', backgroundColor: theme.bgCard },
    tabBtnActive: { backgroundColor: theme.gold, borderColor: theme.gold },
    tabLabel: { color: theme.textMuted, fontSize: TempleFonts.body, fontWeight: '500' },
    tabLabelActive: { color: theme.bgDark, fontWeight: 'bold' },

    section: { padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl },
    sectionTitle: { fontSize: TempleFonts.heading, fontWeight: 'bold', color: theme.textGold, textAlign: 'center', marginBottom: 4 },
    hint: { fontSize: TempleFonts.small, color: theme.textMuted, textAlign: 'center', marginBottom: TempleSpacing.md, lineHeight: 18 },
    input: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '80',
      padding: TempleSpacing.sm,
      color: theme.textLight,
      fontSize: TempleFonts.body,
      marginBottom: TempleSpacing.md,
      minHeight: 52,
    },

    drawBtn: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.gold,
      paddingVertical: TempleSpacing.md,
      paddingHorizontal: TempleSpacing.xl,
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: TempleSpacing.lg,
      minWidth: 200,
    },
    coinIcon: { fontSize: 44, marginBottom: 4 },
    drawBtnText: { color: theme.textGold, fontSize: TempleFonts.body, fontWeight: 'bold' },

    // 易卦樣式
    resultWrapper: { marginTop: 4 },
    linesCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.goldDark + '60',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    linesCardTitle: { color: theme.textGold, fontSize: TempleFonts.small, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
    linesContainer: { gap: 8 },
    lineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    linePosText: { width: 44, color: theme.textMuted, fontSize: 12 },
    solidYao: { flex: 1, marginHorizontal: 12, height: 10, justifyContent: 'center' },
    solidBar: { height: 6, backgroundColor: theme.goldLight, borderRadius: 3 },
    brokenYao: { flex: 1, marginHorizontal: 12, height: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    brokenBar: { flex: 1, height: 6, backgroundColor: theme.goldLight, borderRadius: 3 },
    brokenGap: { width: 14 },
    movingYao: { opacity: 0.95 },
    lineValText: { width: 90, color: theme.textLight, fontSize: 12, textAlign: 'right' },
    movingLineValText: { color: '#E57373', fontWeight: 'bold' },

    hexagramsRow: { flexDirection: 'row', gap: 10, marginBottom: TempleSpacing.md },
    hexCard: {
      flex: 1,
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1.5,
      padding: TempleSpacing.md,
      alignItems: 'center',
    },
    hexRoleTag: { fontSize: 11, fontWeight: 'bold', color: theme.goldLight, marginBottom: 4 },
    hexSymbol: { fontSize: 48, color: theme.textGold, marginVertical: 2 },
    hexNumber: { fontSize: 11, color: theme.textMuted },
    hexName: { fontSize: TempleFonts.heading, fontWeight: 'bold', color: theme.textLight, marginTop: 2 },
    luckBadge: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
    hexImage: { fontSize: 11, color: theme.textMuted, marginTop: 4 },
    noChangeText: { color: theme.textLight, fontSize: TempleFonts.body, fontWeight: 'bold', marginTop: 12 },
    noChangeSub: { color: theme.textMuted, fontSize: 11, textAlign: 'center', marginTop: 6, lineHeight: 16 },

    verdictCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.goldDark + '80',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    verdictTitle: { color: theme.textGold, fontSize: TempleFonts.body, fontWeight: 'bold', marginBottom: 6 },
    verdictBody: { color: theme.textLight, fontSize: 13, lineHeight: 20, marginBottom: 4 },

    adviceCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.goldDark + '60',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    adviceHeader: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: 'bold', marginBottom: 6 },
    guidanceText: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 22 },
    divider: { height: 1, backgroundColor: theme.goldDark + '40', marginVertical: 12 },
    actionRow: { flexDirection: 'row', gap: TempleSpacing.sm },
    actionCol: { flex: 1 },
    actionLabel: { fontSize: TempleFonts.small, fontWeight: 'bold', color: theme.success, marginBottom: 2 },
    cautionLabel: { fontSize: TempleFonts.small, fontWeight: 'bold', color: theme.warning, marginBottom: 2 },
    actionText: { fontSize: TempleFonts.small, color: theme.textMuted, lineHeight: 18 },

    // 塔羅樣式
    spreadSelector: { flexDirection: 'row', gap: 6, marginBottom: 8 },
    spreadTab: {
      flex: 1,
      backgroundColor: theme.bgCard,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.goldDark + '60',
      paddingVertical: 8,
      alignItems: 'center',
    },
    spreadTabActive: { backgroundColor: theme.gold + '25', borderColor: theme.gold },
    spreadTabText: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },
    spreadTabTextActive: { color: theme.textGold, fontWeight: 'bold' },
    spreadDesc: { color: theme.textMuted, fontSize: 11, textAlign: 'center', marginBottom: TempleSpacing.md, lineHeight: 16 },
    cardBackIcon: { fontSize: 44, marginBottom: 4 },

    tarotResultContainer: { marginTop: 4 },
    cardsRow: { flexDirection: 'row', gap: 8, marginBottom: TempleSpacing.md },
    spreadCardItem: {
      flex: 1,
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '60',
      padding: 8,
      alignItems: 'center',
    },
    spreadCardItemSelected: {
      borderColor: theme.gold,
      backgroundColor: theme.gold + '20',
    },
    cardPositionBadge: { color: theme.textMuted, fontSize: 10, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
    cardPositionBadgeActive: { color: theme.textGold },
    cardMiniSymbol: { fontSize: 32, marginVertical: 4 },
    reversedTransform: { transform: [{ rotate: '180deg' }] },
    cardMiniName: { color: theme.textLight, fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
    orientationPill: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
    uprightPill: { backgroundColor: '#2E7D3230' },
    reversedPill: { backgroundColor: '#D32F2F30' },
    orientationText: { fontSize: 9, fontWeight: 'bold', color: theme.textLight },

    tarotDetailCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.gold + '80',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    tarotDetailHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
    tarotBigSymbol: { fontSize: 50 },
    tarotTitleCol: { flex: 1 },
    positionSubLabel: { color: theme.goldLight, fontSize: 12, fontWeight: 'bold' },
    tarotMainName: { color: theme.textLight, fontSize: TempleFonts.heading, fontWeight: 'bold', marginTop: 2 },
    orientationTextBig: { fontSize: 13, fontWeight: 'bold' },
    tarotEngName: { color: theme.textMuted, fontSize: 11, marginTop: 2 },

    positionContextBox: {
      backgroundColor: theme.bgMedium,
      borderRadius: 8,
      padding: 8,
      marginBottom: 10,
    },
    positionContextTitle: { color: theme.textGold, fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
    positionContextDesc: { color: theme.textLight, fontSize: 12, lineHeight: 17 },
    tarotInterpretationText: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 22 },

    // 靈擺樣式
    meditateBtn: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '80',
      paddingVertical: 10,
      paddingHorizontal: 12,
      alignItems: 'center',
      marginBottom: TempleSpacing.md,
    },
    meditateBtnActive: { borderColor: theme.goldLight, backgroundColor: theme.gold + '20' },
    meditateBtnText: { color: theme.textGold, fontSize: 13, fontWeight: '600' },

    pendulumContainer: { alignItems: 'center', height: 160, marginBottom: TempleSpacing.md },
    pendulumPivot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.gold },
    pendulumArm: { alignItems: 'center', position: 'absolute', top: 0 },
    pendulumLine: { width: 2, height: 100, backgroundColor: theme.gold, marginTop: 6 },
    pendulumBob: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.gold,
      marginTop: 2,
      elevation: 4,
    },

    pendulumResultCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1.5,
      padding: TempleSpacing.md,
      marginTop: 4,
    },
    pendulumHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    pendulumIcon: { fontSize: 32 },
    pendulumStateTitle: { fontSize: TempleFonts.heading, fontWeight: 'bold' },
    pendulumResonance: { color: theme.textMuted, fontSize: 11, marginTop: 2 },
    pendulumMotionDesc: { color: theme.textLight, fontSize: 12, lineHeight: 18, marginTop: 4 },
    pendulumVerdict: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 22, marginBottom: 12 },
    pendulumAdviceBox: {
      backgroundColor: theme.bgMedium,
      borderRadius: 10,
      borderLeftWidth: 3,
      borderLeftColor: theme.gold,
      padding: TempleSpacing.sm,
    },
    pendulumAdviceTitle: { color: theme.textGold, fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
    pendulumAdviceText: { color: theme.textMuted, fontSize: 12, lineHeight: 18 },
  });
}
