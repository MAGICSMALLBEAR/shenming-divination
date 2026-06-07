// 首頁 - 神明占卜主流程
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Share, Animated, Easing, type ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useDivination } from '@/hooks/useDivination';
import { GodSelector, QuestionForm } from '@/components/GodSelector';
import { MeditationScreen } from '@/components/MeditationScreen';
import { Jiaobei } from '@/components/Jiaobei';
import { DrawAnimation } from '@/components/DrawAnimation';
import { PoemCard } from '@/components/PoemCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Onboarding, hasOnboarded } from '@/components/Onboarding';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { speakText, stopSpeaking } from '@/services/speech';
import { IncenseSmoke } from '@/components/IncenseSmoke';
import { IncenseRitual } from '@/components/IncenseRitual';
import { StarBackground } from '@/components/StarBackground';
import { FireworksEffect } from '@/components/FireworksEffect';
import { ZhugeNumberInput } from '@/components/ZhugeNumberInput';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { addWish } from '@/services/wishTracker';
import { getDailyFortune, type DailyFortune } from '@/services/dailyFortune';
import { playResultSound } from '@/services/proceduralSound';
import { getHistory, getLastPoemContext, getSettings, type DivinationRecord } from '@/services/storage';
import { calcBazi, parseBirthYear } from '@/services/bazi';
import { getDefaultRitualStyleKey, type RitualStyleKey } from '@/constants/ritual-styles';
import { gods, type God } from '@/data/gods';
import { getGodCardImage } from '@/data/godImages';
import { recommendGods, type GodRecommendation } from '@/services/recommendation';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen() {
  const div = useDivination();
  const router = useRouter();
  const layout = useResponsiveLayout();
  const reducedMotion = useReducedMotion();
  const [strictMode, setStrictMode] = React.useState(false);
  const [incenseDone, setIncenseDone] = React.useState(false);
  const [showFireworks, setShowFireworks] = React.useState(false);
  const [showWishBind, setShowWishBind] = React.useState(false);
  const [fortuneExpanded, setFortuneExpanded] = React.useState(false);
  const [fortune, setFortune] = React.useState<DailyFortune>(() => getDailyFortune());
  const [hasLastPoemContext, setHasLastPoemContext] = React.useState(false);
  const [ritualStyle, setRitualStyle] = React.useState<RitualStyleKey>('bronze');
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [dailyRecommendation, setDailyRecommendation] = React.useState<GodRecommendation | null>(null);
  const [pendingReview, setPendingReview] = React.useState<DivinationRecord | null>(null);
  const isCompact = layout.width < 420;
  const isTablet = layout.isTablet;
  const pageMaxWidth = layout.isWideDesktop ? 1180 : layout.isDesktop ? 1080 : layout.contentMaxWidth;
  const selectedGodCardImage = getGodCardImage(div.selectedGod?.id);

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
  React.useEffect(() => {
    getLastPoemContext().then((context) => setHasLastPoemContext(Boolean(context)));
  }, []);

  React.useEffect(() => {
    Promise.all([getSettings(), getHistory()]).then(([settings, history]) => {
      const lastCategory = history[0]?.questionCategory ?? 'general';
      const recommendation = recommendGods({
        questionCategory: lastCategory,
        birthDate: settings?.birthDate,
        preferredGodId: settings?.preferredGodId,
        history,
      })[0];

      setDailyRecommendation(recommendation ?? null);
      setPendingReview(
        history.find((record) => (record.verificationStatus ?? 'pending') === 'pending') ?? null
      );
    });
  }, []);

  // 檢查是否已完成新手引導
  React.useEffect(() => {
    hasOnboarded().then((done) => {
      setShowOnboarding(!done);
    });
  }, []);

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
  const handleSelectGod = (godId: number) => {
    const god = gods.find((item) => item.id === godId);
    if (god) {
      setRitualStyle(getDefaultRitualStyleKey(god));
    }
    div.selectGod(godId);
  };

  const handleAddWish = async () => {
    if (!div.drawnPoem || wishAdded) return;
    await addWish({
      content: div.question || '平安順心',
      godName: div.selectedGod?.name || '神明',
      poemNumber: div.drawnPoem.number,
      poemSummary: div.drawnPoem.vernacular?.slice(0, 60) || div.drawnPoem.content.slice(0, 60),
    });
    setWishAdded(true);
    setShowWishBind(true);
    setTimeout(() => setShowWishBind(false), 1800);
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
            {dailyRecommendation ? (
              <DailyGodRecommendationCard
                recommendation={dailyRecommendation}
                onSelect={() => handleSelectGod(dailyRecommendation.god.id)}
                reducedMotion={reducedMotion}
              />
            ) : null}
            {pendingReview ? (
              <PendingReviewCard record={pendingReview} onPress={handleReviewRecord} reducedMotion={reducedMotion} />
            ) : null}
            {hasLastPoemContext ? (
              <TouchableOpacity style={styles.followUpShortcut} onPress={handleAskFollowUp}>
                <Text style={styles.followUpShortcutTitle}>AI 追問解籤</Text>
                <Text style={styles.followUpShortcutText}>延續上一次的籤詩脈絡，直接追問細節或下一步。</Text>
              </TouchableOpacity>
            ) : null}
            <GodSelector onSelectGod={handleSelectGod} />
          </View>
        );
      case 'set-question':
        return (
          <View style={styles.fullScreen}>
            {div.selectedGod && (
              <SelectedGodEntranceBanner
                god={div.selectedGod}
                image={selectedGodCardImage}
                isCompact={isCompact}
                reducedMotion={reducedMotion}
              />
            )}
            <QuestionForm
              selectedGod={div.selectedGod}
              onSwitchGod={handleSelectGod}
              onSubmit={(q, cat, name) => div.startMeditation(q, cat, name)}
            />
          </View>
        );
      case 'meditate':
        if (!incenseDone) {
          return (
            <IncenseRitual
              godName={div.selectedGod?.name || '神明'}
              onComplete={() => setIncenseDone(true)}
              ritualStyleKey={ritualStyle}
              onStyleChange={setRitualStyle}
            />
          );
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
            ritualStyleKey={ritualStyle}
            onStyleChange={setRitualStyle}
          />
        );
      case 'drawing':
        return (
          <DrawAnimation
            god={div.selectedGod}
            poemNumber={div.pendingPoem?.number}
            durationMs={div.drawAnimationDurationMs}
            styleKey={div.drawAnimationStyleKey}
          />
        );
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
    const actionPlan = div.currentRecord?.actionPlan ?? [];
    const actionText = actionPlan.length
      ? `\n\n今日可做的三步：\n${actionPlan.map((item, index) => `${index + 1}. ${item}`).join('\n')}`
      : '';
    const aiText = div.aiInterpretation
      ? `\n\n開示摘要：${div.aiInterpretation.slice(0, 160)}${div.aiInterpretation.length > 160 ? '...' : ''}`
      : '';
    const text = `【${div.selectedGod?.name || '神明'}靈籤】第 ${div.drawnPoem.number} 籤 · ${div.drawnPoem.title} · ${div.drawnPoem.level}\n${div.drawnPoem.ganzhi}\n\n${div.drawnPoem.content}\n\n白話：${div.drawnPoem.vernacular}${aiText}${actionText}\n\n— 神明占卜`;
    await Share.share({ message: text });
  };

  const handleAskFollowUp = () => {
    router.push('/chat');
  };

  const handleReviewRecord = () => {
    router.push('/collection?tab=history');
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
          <TouchableOpacity style={[styles.actionBtn, isCompact && styles.actionBtnCompact, isTablet && styles.actionBtnTablet]} onPress={handleReviewRecord}>
            <Text style={styles.actionBtnIcon}>🧭</Text>
            <Text style={styles.actionBtnText}>回訪</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, isCompact && styles.actionBtnCompact, isTablet && styles.actionBtnTablet]} onPress={handleAskFollowUp}>
            <Text style={styles.actionBtnIcon}>AI</Text>
            <Text style={styles.actionBtnText}>追問</Text>
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
        {showOnboarding ? (
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        ) : (
          <>
            <StarBackground />
            {div.step === 'meditate' || div.step === 'toss-jiaobei' ? <IncenseSmoke /> : null}
            <FireworksEffect active={showFireworks} />
            <WishBindEffect active={showWishBind && !reducedMotion} />
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
          </>
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

// ─── 今日運勢折疊卡 ───────────────────────────────────────────
function SelectedGodEntranceBanner({
  god,
  image,
  isCompact,
  reducedMotion,
}: {
  god: God;
  image: ImageSourcePropType | null;
  isCompact: boolean;
  reducedMotion: boolean;
}) {
  const reveal = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (reducedMotion) {
      reveal.setValue(1);
      return;
    }
    reveal.setValue(0);
    Animated.timing(reveal, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [god.id, reducedMotion, reveal]);

  const bannerOpacity = reveal.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0.9, 1] });
  const imageScale = reveal.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] });
  const glowScale = reveal.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.72, 1.24, 1.06] });
  const textTranslate = reveal.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const smokeLift = reveal.interpolate({ inputRange: [0, 1], outputRange: [18, -28] });
  const smokeOpacity = reveal.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.55, 0] });

  return (
    <Animated.View
      style={[
        styles.selectedGodBanner,
        isCompact && styles.selectedGodBannerCompact,
        { opacity: bannerOpacity },
      ]}
    >
      <View style={styles.entrancePortraitStage}>
        <Animated.View
          style={[
            styles.entranceGlow,
            { backgroundColor: god.accentColor + '34', transform: [{ scale: glowScale }] },
          ]}
        />
        {[0, 1, 2].map((item) => (
          <Animated.View
            key={item}
            style={[
              styles.entranceSmoke,
              item === 0 && styles.entranceSmokeLeft,
              item === 2 && styles.entranceSmokeRight,
              {
                backgroundColor: god.accentColor + '55',
                opacity: smokeOpacity,
                transform: [{ translateY: smokeLift }, { rotate: item === 1 ? '0deg' : item === 0 ? '-12deg' : '12deg' }],
              },
            ]}
          />
        ))}
        <Animated.View style={{ transform: [{ scale: imageScale }] }}>
          <View style={[styles.selectedGodPortrait, isCompact && styles.selectedGodPortraitCompact, { borderColor: god.accentColor + '55' }]}>
            {image ? (
              <Image source={image} style={styles.selectedGodImage} contentFit="cover" transition={200} />
            ) : null}
            <View style={[styles.selectedGodPortraitOverlay, { backgroundColor: god.primaryColor + '18' }]} />
          </View>
        </Animated.View>
      </View>
      <Animated.View
        style={[
          styles.selectedGodMeta,
          isCompact && styles.selectedGodMetaCompact,
          { opacity: bannerOpacity, transform: [{ translateY: textTranslate }] },
        ]}
      >
        <Text style={[styles.selectedGodTitle, { color: god.accentColor }]}>{god.title}</Text>
        <Text style={[styles.selectedGodName, isCompact && styles.selectedGodNameCompact]}>{god.name}</Text>
        <Text style={[styles.selectedGodTagline, isCompact && styles.selectedGodTextCompact, { color: god.accentColor }]}>{god.tagline}</Text>
        <Text style={[styles.selectedGodDesc, isCompact && styles.selectedGodTextCompact]}>{god.description.slice(0, 60)}...</Text>
      </Animated.View>
    </Animated.View>
  );
}

function DailyGodRecommendationCard({
  recommendation,
  onSelect,
  reducedMotion,
}: {
  recommendation: GodRecommendation;
  onSelect: () => void;
  reducedMotion: boolean;
}) {
  const cardImage = getGodCardImage(recommendation.god.id);
  const glowAnim = React.useRef(new Animated.Value(0)).current;
  const pressAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (reducedMotion) {
      glowAnim.setValue(0);
      pressAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 2600,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [glowAnim, pressAnim, reducedMotion]);

  const handlePressIn = () => {
    if (reducedMotion) return;
    Animated.spring(pressAnim, { toValue: 1.025, friction: 7, tension: 70, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    if (reducedMotion) return;
    Animated.spring(pressAnim, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }).start();
  };

  const shimmerTranslate = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [-130, 360] });
  const shimmerOpacity = glowAnim.interpolate({ inputRange: [0, 0.18, 0.5, 0.82, 1], outputRange: [0, 0, 0.42, 0, 0] });

  return (
    <AnimatedTouchable
      style={[
        styles.recommendCard,
        { borderColor: recommendation.god.accentColor + '45', transform: [{ scale: pressAnim }] },
      ]}
      onPress={onSelect}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.86}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.recommendShimmer,
          {
            backgroundColor: recommendation.god.accentColor + '35',
            opacity: shimmerOpacity,
            transform: [{ translateX: shimmerTranslate }, { rotate: '-18deg' }],
          },
        ]}
      />
      <View style={styles.recommendText}>
        <Text style={[styles.recommendEyebrow, { color: recommendation.god.accentColor }]}>
          今日適合請示
        </Text>
        <Text style={styles.recommendName}>{recommendation.god.name}</Text>
        <Text style={styles.recommendReason}>{recommendation.reason}</Text>
      </View>
      <View style={[styles.recommendImageWrap, { borderColor: recommendation.god.accentColor + '55' }]}>
        {cardImage ? (
          <Image source={cardImage} style={styles.recommendImage} contentFit="cover" contentPosition="top" />
        ) : null}
      </View>
    </AnimatedTouchable>
  );
}

function PendingReviewCard({
  record,
  onPress,
  reducedMotion,
}: {
  record: DivinationRecord;
  onPress: () => void;
  reducedMotion: boolean;
}) {
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (reducedMotion) {
      pulseAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim, reducedMotion]);

  const borderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [TempleTheme.warning + '55', TempleTheme.goldLight + 'DD'],
  });
  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [TempleTheme.warning + '12', TempleTheme.goldDark + '1F'],
  });

  return (
    <AnimatedTouchable
      style={[styles.pendingReviewCard, { borderColor, backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.86}
    >
      <View style={styles.pendingReviewMeta}>
        <Text style={styles.pendingReviewTitle}>有一支籤等待回訪</Text>
        <Text style={styles.pendingReviewText} numberOfLines={2}>
          {record.godName} · 第 {record.poem.number} 籤 · {record.question || record.poem.title}
        </Text>
      </View>
      <Text style={styles.pendingReviewCta}>去驗證</Text>
    </AnimatedTouchable>
  );
}

function WishBindEffect({ active }: { active: boolean }) {
  const bindAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!active) return;
    bindAnim.setValue(0);
    Animated.timing(bindAnim, {
      toValue: 1,
      duration: 1600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [active, bindAnim]);

  if (!active) return null;

  const threadOpacity = bindAnim.interpolate({ inputRange: [0, 0.15, 0.72, 1], outputRange: [0, 1, 1, 0] });
  const threadScale = bindAnim.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0.25, 1, 1.05] });
  const sealScale = bindAnim.interpolate({ inputRange: [0, 0.45, 0.72, 1], outputRange: [0.45, 1.16, 1, 0.92] });
  const sealOpacity = bindAnim.interpolate({ inputRange: [0, 0.2, 0.72, 1], outputRange: [0, 1, 1, 0] });
  const sparkLift = bindAnim.interpolate({ inputRange: [0, 1], outputRange: [22, -54] });

  return (
    <View pointerEvents="none" style={styles.wishBindLayer}>
      <Animated.View
        style={[
          styles.wishBindThread,
          styles.wishBindThreadLeft,
          { opacity: threadOpacity, transform: [{ scaleX: threadScale }, { rotate: '24deg' }] },
        ]}
      />
      <Animated.View
        style={[
          styles.wishBindThread,
          styles.wishBindThreadRight,
          { opacity: threadOpacity, transform: [{ scaleX: threadScale }, { rotate: '-24deg' }] },
        ]}
      />
      <Animated.View style={[styles.wishBindSeal, { opacity: sealOpacity, transform: [{ scale: sealScale }] }]}>
        <Text style={styles.wishBindSealText}>願</Text>
      </Animated.View>
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <Animated.View
          key={item}
          style={[
            styles.wishBindSpark,
            {
              left: `${32 + item * 7}%`,
              opacity: sealOpacity,
              transform: [{ translateY: sparkLift }, { scale: item % 2 ? 0.74 : 1 }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const RELATION_LABEL: Record<string, { text: string; color: string }> = {
  '今日生我': { text: '今日生我 ✦', color: TempleTheme.success },
  '我生今日': { text: '我生今日 ◦', color: TempleTheme.warning },
  '今日克我': { text: '今日克我 ✕', color: TempleTheme.danger },
  '我克今日': { text: '我克今日 ◇', color: '#E67E22' },
  '同行':     { text: '同行平穩 ＝', color: TempleTheme.textMuted },
};

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
          <Text style={fStyles.practice}>{getDailyPractice(fortune)}</Text>
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
  practice: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textLight,
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
  recommendCard: {
    marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
    padding: TempleSpacing.md,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: TempleTheme.bgCard,
    flexDirection: 'row',
    alignItems: 'center',
    gap: TempleSpacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  recommendShimmer: {
    position: 'absolute',
    top: -38,
    bottom: -38,
    width: 82,
    borderRadius: 999,
  },
  recommendText: { flex: 1 },
  recommendEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  recommendName: {
    fontSize: TempleFonts.heading,
    color: TempleTheme.goldLight,
    fontWeight: '900',
    marginBottom: 4,
  },
  recommendReason: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    lineHeight: 20,
  },
  recommendImageWrap: {
    width: 72,
    height: 96,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: TempleTheme.bgDark,
  },
  recommendImage: { width: '100%', height: '100%' },
  pendingReviewCard: {
    marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    padding: TempleSpacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.warning + '55',
    backgroundColor: TempleTheme.warning + '12',
    flexDirection: 'row',
    alignItems: 'center',
    gap: TempleSpacing.sm,
  },
  pendingReviewMeta: { flex: 1 },
  pendingReviewTitle: {
    color: TempleTheme.goldLight,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    marginBottom: 4,
  },
  pendingReviewText: {
    color: TempleTheme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  pendingReviewCta: {
    color: TempleTheme.goldLight,
    fontSize: 12,
    fontWeight: '800',
  },
  followUpShortcut: {
    marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    padding: TempleSpacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '35',
    backgroundColor: TempleTheme.bgCard,
  },
  followUpShortcutTitle: {
    fontSize: TempleFonts.body,
    fontWeight: '800',
    color: TempleTheme.goldLight,
    marginBottom: 4,
  },
  followUpShortcutText: {
    fontSize: TempleFonts.small,
    lineHeight: 20,
    color: TempleTheme.textMuted,
  },
  selectedGodBanner: {
    backgroundColor: TempleTheme.bgCard, marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.md, padding: TempleSpacing.md, borderRadius: 12,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '40', flexDirection: 'row', alignItems: 'center', gap: TempleSpacing.md,
    overflow: 'visible',
  },
  selectedGodBannerCompact: { flexDirection: 'column', alignItems: 'center' },
  entrancePortraitStage: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  entranceGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.88,
  },
  entranceSmoke: {
    position: 'absolute',
    bottom: 72,
    width: 10,
    height: 48,
    borderRadius: 999,
  },
  entranceSmokeLeft: { left: 14 },
  entranceSmokeRight: { right: 14 },
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
  wishBindLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishBindThread: {
    position: 'absolute',
    width: 190,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#D93A2B',
    shadowColor: '#FFD56A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
  },
  wishBindThreadLeft: { marginTop: -18 },
  wishBindThreadRight: { marginTop: 18 },
  wishBindSeal: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: TempleTheme.red,
    borderWidth: 2,
    borderColor: TempleTheme.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TempleTheme.goldLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 6,
  },
  wishBindSealText: {
    color: TempleTheme.goldLight,
    fontSize: 28,
    fontWeight: '900',
  },
  wishBindSpark: {
    position: 'absolute',
    top: '52%',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: TempleTheme.goldLight,
  },
});
