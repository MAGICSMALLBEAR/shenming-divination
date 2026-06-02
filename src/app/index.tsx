// 首頁 - 神明占卜主流程
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Share, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useDivination } from '@/hooks/useDivination';
import { GodSelector, QuestionForm } from '@/components/GodSelector';
import { MeditationScreen } from '@/components/MeditationScreen';
import { Jiaobei } from '@/components/Jiaobei';
import { DrawAnimation } from '@/components/DrawAnimation';
import { PoemCard } from '@/components/PoemCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { speakText, stopSpeaking } from '@/services/speech';
import { IncenseSmoke } from '@/components/IncenseSmoke';
import { IncenseRitual } from '@/components/IncenseRitual';
import { StarBackground } from '@/components/StarBackground';
import { FireworksEffect } from '@/components/FireworksEffect';
import { ZhugeNumberInput } from '@/components/ZhugeNumberInput';
import { addWish } from '@/services/wishTracker';
import { getDailyFortune, type DailyFortune } from '@/services/dailyFortune';
import { playResultSound } from '@/services/proceduralSound';
import { getSettings } from '@/services/storage';
import { calcBazi, parseBirthYear } from '@/services/bazi';

export default function HomeScreen() {
  const div = useDivination();
  const { width } = useWindowDimensions();
  const [strictMode, setStrictMode] = React.useState(false);
  const [incenseDone, setIncenseDone] = React.useState(false);
  const [showFireworks, setShowFireworks] = React.useState(false);
  const [fortuneExpanded, setFortuneExpanded] = React.useState(false);
  const [fortune, setFortune] = React.useState<DailyFortune>(() => getDailyFortune());
  const isCompact = width < 420;
  const isTablet = width >= 768;
  const isDesktop = width >= 1100;
  const pageMaxWidth = isDesktop ? 1180 : isTablet ? 960 : 760;

  // 載入設定後產生個人化運勢
  React.useEffect(() => {
    getSettings().then(s => {
      if (!s?.birthDate) return;
      const year = parseBirthYear(s.birthDate);
      if (!year) return;
      const bazi = calcBazi(year);
      setFortune(getDailyFortune(bazi));
    });
  }, []);

  // 抽到上上/大吉籤時觸發煙火；進入結果播放音效
  React.useEffect(() => {
    if (div.step === 'result' && div.drawnPoem) {
      playResultSound().catch(() => {});
      const level = div.drawnPoem.level;
      if (level.includes('上') || level.includes('大吉')) {
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 3000);
      }
    }
  }, [div.step, div.drawnPoem]);
  React.useEffect(() => {
    import('@/services/storage').then(({ getSettings }) => {
      getSettings().then(s => {
        if (s) setStrictMode(s.strictMode || false);
      });
    });
  }, []);

  const canGoBack = div.step !== 'select-god' && div.step !== 'drawing' && div.step !== 'ai-interpret';
  const showBack = div.step === 'set-question' || div.step === 'meditate' || div.step === 'toss-jiaobei' || div.step === 'enter-zhuge-number';

  const handleBack = () => {
    switch (div.step) {
      case 'set-question': div.goToStep('select-god'); break;
      case 'meditate': if (incenseDone) { setIncenseDone(false); } else { div.goToStep('set-question'); } break;
      case 'enter-zhuge-number': div.goToStep('meditate'); break;
      case 'toss-jiaobei': div.goToStep('meditate'); break;
      default: handleReset();
    }
  };
  const handleReset = () => { setIncenseDone(false); setWishAdded(false); div.reset(); };

  const handleAddWish = async () => {
    if (!div.drawnPoem || wishAdded) return;
    await addWish({
      content: div.question || '平安順心',
      godName: div.selectedGod?.name || '神明',
      poemNumber: div.drawnPoem.number,
      poemSummary: div.drawnPoem.vernacular?.slice(0, 60) || div.drawnPoem.content.slice(0, 60),
    });
    setWishAdded(true);
    div.showToast('已加入願望清單 🙏');
  };

  const renderHeader = () => (
    <View style={[styles.header, isCompact && styles.headerCompact]}>
      {showBack ? (
        <TouchableOpacity style={[styles.backBtnSmall, isCompact && styles.backBtnCompact]} onPress={handleBack}>
          <Text style={styles.backBtnTextSmall}>← 返回</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.backBtnSmall, isCompact && styles.backBtnCompact]} />
      )}
      <Text style={styles.appTitle}>🏛️ 神明占卜</Text>
      {div.step !== 'select-god' ? (
        <TouchableOpacity style={[styles.backBtn, isCompact && styles.backBtnCompact]} onPress={handleReset}>
          <Text style={styles.backBtnText}>✕ 重來</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.backBtn, isCompact && styles.backBtnCompact]} />
      )}
    </View>
  );

  const renderStepIndicator = () => {
    const isZhuge = div.selectedGod?.poemSystem === '諸葛神數';
    const steps = [
      { key: 'select-god', icon: '🏛️' },
      { key: 'set-question', icon: '📝' },
      { key: 'meditate', icon: '🧘' },
      { key: isZhuge ? 'enter-zhuge-number' : 'toss-jiaobei', icon: isZhuge ? '🔢' : '🎯' },
      { key: 'drawing', icon: '🎋' },
      { key: 'result', icon: '✨' },
    ];
    const stepKey = (s: string) => {
      if (s === 'reveal-poem' || s === 'ai-interpret') return 'result';
      if (s === 'toss-jiaobei' && isZhuge) return 'enter-zhuge-number';
      return s;
    };
    const currentIndex = steps.findIndex(s => s.key === stepKey(div.step));

    return (
      <View style={[styles.stepIndicator, isCompact && styles.stepIndicatorCompact]}>
        {steps.map((s, i) => (
          <View key={s.key} style={styles.stepItem}>
            <View style={[
              styles.stepDot,
              isCompact && styles.stepDotCompact,
              i <= currentIndex && styles.stepDotActive,
              i === currentIndex && styles.stepDotCurrent,
              i === currentIndex && isCompact && styles.stepDotCurrentCompact,
            ]}>
              <Text style={[styles.stepIcon, isCompact && styles.stepIconCompact]}>{s.icon}</Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[styles.stepLine, isCompact && styles.stepLineCompact, i < currentIndex && styles.stepLineActive]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (div.step) {
      case 'select-god':
        return (
          <View style={styles.fullScreen}>
            <DailyFortuneCard fortune={fortune} expanded={fortuneExpanded} onToggle={() => setFortuneExpanded(v => !v)} />
            <GodSelector onSelectGod={div.selectGod} />
          </View>
        );
      case 'set-question':
        return (
          <View style={styles.fullScreen}>
            {div.selectedGod && (
              <View style={[styles.selectedGodBanner, isCompact && styles.selectedGodBannerCompact]}>
                <View style={[styles.selectedGodPortrait, isCompact && styles.selectedGodPortraitCompact, { borderColor: div.selectedGod.accentColor + '55' }]}>
                  <Image source={div.selectedGod.image} style={styles.selectedGodImage} contentFit="cover" transition={200} />
                  <View style={[styles.selectedGodPortraitOverlay, { backgroundColor: div.selectedGod.primaryColor + '18' }]} />
                </View>
                <View style={[styles.selectedGodMeta, isCompact && styles.selectedGodMetaCompact]}>
                  <Text style={[styles.selectedGodTitle, { color: div.selectedGod.accentColor }]}>{div.selectedGod.title}</Text>
                  <Text style={[styles.selectedGodName, isCompact && styles.selectedGodNameCompact]}>{div.selectedGod.name}</Text>
                  <Text style={[styles.selectedGodTagline, isCompact && styles.selectedGodTextCompact, { color: div.selectedGod.accentColor }]}>{div.selectedGod.tagline}</Text>
                  <Text style={[styles.selectedGodDesc, isCompact && styles.selectedGodTextCompact]}>{div.selectedGod.description.slice(0, 60)}...</Text>
                </View>
              </View>
            )}
            <QuestionForm onSubmit={(q, cat, name) => div.startMeditation(q, cat, name)} />
          </View>
        );
      case 'meditate':
        if (!incenseDone) {
          return <IncenseRitual godName={div.selectedGod?.name || '神明'} onComplete={() => setIncenseDone(true)} />;
        }
        return <MeditationScreen godName={div.selectedGod?.name || '神明'} onComplete={div.finishMeditation} />;
      case 'enter-zhuge-number':
        return (
          <ZhugeNumberInput
            onSubmit={(n) => div.performDraw(n)}
          />
        );
      case 'toss-jiaobei':
        return (
          <Jiaobei
            onToss={div.performJiaobei}
            onShengbei={div.performDraw}
            results={div.jiaobeiResults}
            strictMode={strictMode}
          />
        );
      case 'drawing':
        return <DrawAnimation god={div.selectedGod} poemNumber={div.pendingPoem?.number} durationMs={div.drawAnimationDurationMs} />;
      case 'reveal-poem':
      case 'ai-interpret':
      case 'result':
        return div.drawnPoem ? (
          <PoemCard
            poem={div.drawnPoem}
            godName={div.selectedGod?.name || '神明'}
            god={div.selectedGod}
            aiInterpretation={div.aiInterpretation}
            isLoading={div.step === 'ai-interpret' && !div.aiInterpretation}
            questionCategory={div.questionCategory}
            question={div.question}
          />
        ) : null;
      default:
        return null;
    }
  };

  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [wishAdded, setWishAdded] = React.useState(false);

  const handleSpeak = async () => {
    if (!div.drawnPoem) return;
    if (isSpeaking) {
      await stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    const text = `${div.selectedGod?.name || '神明'}靈籤，第${div.drawnPoem.number}籤，${div.drawnPoem.title}。${div.drawnPoem.content}。${div.aiInterpretation || ''}`;
    await speakText(text);
    setIsSpeaking(false);
  };

  const handleShare = async () => {
    if (!div.drawnPoem) return;
    const text = `【${div.selectedGod?.name || '神明'}靈籤】第 ${div.drawnPoem.number} 籤 · ${div.drawnPoem.title} · ${div.drawnPoem.level}\n${div.drawnPoem.ganzhi}\n\n${div.drawnPoem.content}\n\n— 神明占卜`;
    await Share.share({ message: text });
  };

  const renderActions = () => {
    if (div.step === 'result' && div.drawnPoem) {
      return (
        <View style={[styles.actionBar, isCompact && styles.actionBarCompact]}>
          <TouchableOpacity style={[styles.actionBtn, isCompact && styles.actionBtnCompact, isTablet && styles.actionBtnTablet]} onPress={div.toggleFavorite}>
            <Text style={styles.actionBtnIcon}>{div.isFavorited ? '💔' : '💾'}</Text>
            <Text style={styles.actionBtnText}>{div.isFavorited ? '已收藏' : '收藏'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, isCompact && styles.actionBtnCompact, isTablet && styles.actionBtnTablet, wishAdded && styles.actionBtnDone]} onPress={handleAddWish} disabled={wishAdded}>
            <Text style={styles.actionBtnIcon}>{wishAdded ? '✅' : '🙏'}</Text>
            <Text style={styles.actionBtnText}>{wishAdded ? '已許願' : '許願'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, isCompact && styles.actionBtnCompact, isTablet && styles.actionBtnTablet]} onPress={handleSpeak}>
            <Text style={styles.actionBtnIcon}>{isSpeaking ? '⏹️' : '🎙️'}</Text>
            <Text style={styles.actionBtnText}>{isSpeaking ? '停止' : '朗讀'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, isCompact && styles.actionBtnCompact, isTablet && styles.actionBtnTablet]} onPress={handleShare}>
            <Text style={styles.actionBtnIcon}>📤</Text>
            <Text style={styles.actionBtnText}>分享</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary, isCompact && styles.actionBtnCompact, isTablet && styles.actionBtnTablet]} onPress={handleReset}>
            <Text style={styles.actionBtnIcon}>🔄</Text>
            <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>再求一籤</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <ErrorBoundary onReset={handleReset}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
        <StarBackground />
        {div.step === 'meditate' || div.step === 'toss-jiaobei' ? <IncenseSmoke /> : null}
        <FireworksEffect active={showFireworks} />
        <View style={styles.container}>
          <View style={[styles.pageShell, { maxWidth: pageMaxWidth }]}>
            {renderHeader()}
            {renderStepIndicator()}
            <View style={styles.content}>{renderContent()}</View>
            {renderActions()}
          </View>
        </View>
        {div.toastMessage && (
          <View style={[styles.toast, isCompact && styles.toastCompact]}>
            <Text style={styles.toastText}>{div.toastMessage}</Text>
          </View>
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

// ─── 今日運勢折疊卡 ───────────────────────────────────────────
const RELATION_LABEL: Record<string, { text: string; color: string }> = {
  '今日生我': { text: '今日生我 ✦', color: TempleTheme.success },
  '我生今日': { text: '我生今日 ◦', color: TempleTheme.warning },
  '今日克我': { text: '今日克我 ✕', color: TempleTheme.danger },
  '我克今日': { text: '我克今日 ◇', color: '#E67E22' },
  '同行':     { text: '同行平穩 ＝', color: TempleTheme.textMuted },
};

function DailyFortuneCard({ fortune, expanded, onToggle }: { fortune: DailyFortune; expanded: boolean; onToggle: () => void }) {
  const SCORE_LABELS = [
    { key: 'wealth' as const, label: '財', icon: '💰' },
    { key: 'career' as const, label: '事', icon: '💼' },
    { key: 'love'   as const, label: '愛', icon: '💕' },
    { key: 'health' as const, label: '康', icon: '🏥' },
  ];
  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);
  const overallColor = fortune.overall >= 4 ? TempleTheme.success : fortune.overall >= 3 ? TempleTheme.warning : TempleTheme.danger;
  const relation = fortune.wuxingRelation ? RELATION_LABEL[fortune.wuxingRelation] : null;

  return (
    <View style={fStyles.card}>
      <TouchableOpacity style={fStyles.header} onPress={onToggle} activeOpacity={0.8}>
        <View style={fStyles.headerLeft}>
          {/* 標題列：今日運勢 + 生肖（個人化時顯示） */}
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
              <Text style={[fStyles.miniStar, { color: fortune.scores[key] >= 4 ? TempleTheme.success : fortune.scores[key] >= 3 ? TempleTheme.warning : TempleTheme.danger }]}>
                {'★'.repeat(fortune.scores[key])}
              </Text>
            </View>
          ))}
        </View>
        <Text style={fStyles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={fStyles.body}>
          {/* 五行關係說明（個人化時） */}
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
              <Text style={[fStyles.scoreStar, { color: fortune.scores[key] >= 4 ? TempleTheme.success : fortune.scores[key] >= 3 ? TempleTheme.warning : TempleTheme.danger }]}>
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
        </View>
      )}
    </View>
  );
}

const fStyles = StyleSheet.create({
  card: {
    marginHorizontal: TempleSpacing.md, marginBottom: TempleSpacing.sm,
    backgroundColor: TempleTheme.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '30', overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: TempleSpacing.sm, gap: TempleSpacing.sm },
  headerLeft: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  title: { fontSize: 12, fontWeight: '700', color: TempleTheme.goldLight },
  zodiacTag: { fontSize: 10, color: TempleTheme.gold, fontWeight: '600' },
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  stars: { fontSize: 11, letterSpacing: 1 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  colorName: { fontSize: 10, color: TempleTheme.textMuted },
  relationBadge: { fontSize: 9, fontWeight: '700' },
  miniScores: { flexDirection: 'row', gap: 4 },
  miniItem: { alignItems: 'center' },
  miniIcon: { fontSize: 12 },
  miniStar: { fontSize: 7 },
  chevron: { fontSize: 12, color: TempleTheme.textMuted, paddingHorizontal: 4 },
  body: { paddingHorizontal: TempleSpacing.md, paddingBottom: TempleSpacing.md, borderTopWidth: 1, borderTopColor: TempleTheme.goldDark + '20' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 6 },
  scoreIcon: { fontSize: 14, width: 20 },
  scoreLabel: { fontSize: 12, color: TempleTheme.textMuted, width: 28 },
  scoreStar: { fontSize: 12, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: TempleTheme.goldDark + '20', marginVertical: 8 },
  infoRow: { flexDirection: 'row', gap: TempleSpacing.md, marginBottom: 4 },
  infoItem: { fontSize: 11, color: TempleTheme.textLight, flex: 1 },
  advice: { fontSize: TempleFonts.small, color: TempleTheme.gold, marginTop: 6, fontStyle: 'italic', lineHeight: 18 },
  wuxingBanner: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    marginTop: TempleSpacing.sm, marginBottom: 6, alignItems: 'center',
  },
  wuxingBannerText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
});
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  container: { flex: 1 },
  pageShell: { flex: 1, width: '100%', alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: TempleSpacing.md,
    paddingVertical: TempleSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '20',
  },
  headerCompact: { paddingHorizontal: 12 },
  appTitle: { fontSize: TempleFonts.heading, fontWeight: '700', color: TempleTheme.goldLight },
  appTitleCompact: { fontSize: 17, flex: 1, marginHorizontal: 8, textAlign: 'center' },
  backBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: TempleTheme.bgCard, borderWidth: 1, borderColor: TempleTheme.goldDark + '30', minWidth: 60, alignItems: 'center' },
  backBtnText: { fontSize: 12, color: TempleTheme.textMuted },
  backBtnSmall: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, minWidth: 60, alignItems: 'center' },
  backBtnTextSmall: { fontSize: 12, color: TempleTheme.goldLight },
  backBtnCompact: { minWidth: 52, paddingHorizontal: 8 },
  backBtnTextCompact: { fontSize: 11 },
  stepIndicator: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: TempleSpacing.sm, paddingHorizontal: TempleSpacing.md,
  },
  stepIndicatorCompact: { paddingHorizontal: 12 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: TempleTheme.bgCard,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: TempleTheme.goldDark + '30',
  },
  stepDotCompact: { width: 24, height: 24, borderRadius: 12 },
  stepDotActive: { backgroundColor: TempleTheme.goldDark + '30', borderColor: TempleTheme.goldDark },
  stepDotCurrent: { backgroundColor: TempleTheme.red, borderColor: TempleTheme.gold, width: 30, height: 30, borderRadius: 15 },
  stepDotCurrentCompact: { width: 28, height: 28, borderRadius: 14 },
  stepIcon: { fontSize: 11 },
  stepIconCompact: { fontSize: 10 },
  stepLine: { width: 12, height: 1, backgroundColor: TempleTheme.goldDark + '30', marginHorizontal: 2 },
  stepLineCompact: { width: 8 },
  stepLineActive: { backgroundColor: TempleTheme.goldDark },
  content: { flex: 1 },
  fullScreen: { flex: 1 },
  selectedGodBanner: {
    backgroundColor: TempleTheme.bgCard, marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.md, padding: TempleSpacing.md, borderRadius: 12,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '40', flexDirection: 'row', alignItems: 'center', gap: TempleSpacing.md,
  },
  selectedGodBannerCompact: { flexDirection: 'column', alignItems: 'center' },
  selectedGodPortrait: {
    width: 88,
    height: 88,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  selectedGodPortraitCompact: { width: 110, height: 110, borderRadius: 24 },
  selectedGodImage: { width: '100%', height: '100%' },
  selectedGodPortraitOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  selectedGodMeta: { flex: 1 },
  selectedGodMetaCompact: { alignSelf: 'stretch' },
  selectedGodTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  selectedGodName: { fontSize: TempleFonts.heading, fontWeight: '700', color: TempleTheme.goldLight },
  selectedGodNameCompact: { textAlign: 'center' },
  selectedGodTagline: { fontSize: 12, fontWeight: '600', marginTop: 2, marginBottom: 4 },
  selectedGodDesc: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, marginTop: 2 },
  selectedGodTextCompact: { textAlign: 'center' },
  actionBar: {
    flexDirection: 'row', justifyContent: 'center', gap: TempleSpacing.sm, flexWrap: 'wrap',
    paddingHorizontal: TempleSpacing.md, paddingVertical: TempleSpacing.sm,
    borderTopWidth: 1, borderTopColor: TempleTheme.goldDark + '20', backgroundColor: TempleTheme.bgDark,
  },
  actionBarCompact: { paddingHorizontal: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: TempleSpacing.md,
    paddingVertical: TempleSpacing.sm, borderRadius: 10, backgroundColor: TempleTheme.bgCard,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '30', gap: 6,
  },
  actionBtnCompact: { width: '100%', justifyContent: 'center' },
  actionBtnTablet: { minWidth: 180 },
  actionBtnPrimary: { backgroundColor: TempleTheme.red, borderColor: TempleTheme.goldDark },
  actionBtnDone: { opacity: 0.6, borderColor: TempleTheme.success + '60' },
  actionBtnIcon: { fontSize: 16 },
  actionBtnText: { fontSize: TempleFonts.small, color: TempleTheme.textLight, fontWeight: '600' },
  actionBtnTextPrimary: { color: TempleTheme.goldLight },
  toast: {
    position: 'absolute', bottom: 100, alignSelf: 'center',
    backgroundColor: TempleTheme.goldDark, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 20, elevation: 4,
  },
  toastCompact: { left: 16, right: 16, bottom: 88 },
  toastText: { color: '#FFF', fontSize: TempleFonts.small, fontWeight: '600' },
});
