// 首頁 - 神明占卜主流程
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Share, Animated, Easing, Modal, TextInput, type ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useDivination } from '@/hooks/useDivination';
import { GodSelector, QuestionForm } from '@/components/GodSelector';
import { MeditationScreen } from '@/components/MeditationScreen';
import { Jiaobei } from '@/components/Jiaobei';
import { DrawAnimation } from '@/components/DrawAnimation';
import { DrawMethodSelector } from '@/components/DrawMethodSelector';
import { PoemCard } from '@/components/PoemCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Onboarding, hasOnboarded } from '@/components/Onboarding';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { speakText, stopSpeaking } from '@/services/speech';
import { IncenseSmoke } from '@/components/IncenseSmoke';
import { IncenseRitual } from '@/components/IncenseRitual';
import { StarBackground } from '@/components/StarBackground';
import { FireworksEffect } from '@/components/FireworksEffect';
import { ZhugeNumberInput } from '@/components/ZhugeNumberInput';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useI18n } from '@/hooks/useI18n';
import { addWish } from '@/services/wishTracker';
import { getDailyFortune, type DailyFortune } from '@/services/dailyFortune';
import { playResultSound, startAmbientSound, stopAmbientSound } from '@/services/proceduralSound';
import { getHistory, getLastPoemContext, getSettings, getFamilyMembers, addFamilyMember, removeFamilyMember, updatePoemConfirmation, getVerificationFollowUps, type AppSettings, type DivinationRecord, type FamilyMember, type VerificationFollowUpSummary } from '@/services/storage';
import { calcBazi, parseBirthYear } from '@/services/bazi';
import { getDefaultRitualStyleKey, type RitualStyleKey } from '@/constants/ritual-styles';
import { gods, type God } from '@/data/gods';
import { tossJiaobei, type JiaobeiResult } from '@/services/divination';
import { getGodCardImage } from '@/data/godImages';
import { recommendGods, type GodRecommendation } from '@/services/recommendation';
import { useShakeDetector } from '@/hooks/useShakeDetector';
import { CrossTempleComparison } from '@/components/CrossTempleComparison';
import { getCurrentSolarTerm } from '@/services/solarTerms';
import * as Haptics from 'expo-haptics';
import { ForWhomSelector } from '@/components/home/ForWhomSelector';
import { DailyFortuneCard } from '@/components/home/DailyFortuneCard';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen() {
  const div = useDivination();
  const router = useRouter();
  const layout = useResponsiveLayout();
  const { t } = useI18n();
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const reducedMotion = useReducedMotion();
  const [strictMode, setStrictMode] = React.useState(false);
  const [lowMotionMode, setLowMotionMode] = React.useState(false);
  const [shakeTossSignal, setShakeTossSignal] = React.useState(0);
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
  const [reviewSummary, setReviewSummary] = React.useState<VerificationFollowUpSummary | null>(null);
  const [showCrossCompare, setShowCrossCompare] = React.useState(false);
  const [poemConfirming, setPoemConfirming] = React.useState(false);
  const [poemConfirmText, setPoemConfirmText] = React.useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = React.useState<FamilyMember[]>([]);
  const [selectedPerson, setSelectedPerson] = React.useState<FamilyMember | null>(null);
  const [showAddFamily, setShowAddFamily] = React.useState(false);
  const [newFamName, setNewFamName] = React.useState('');
  const [newFamRelation, setNewFamRelation] = React.useState('');
  const [settings, setSettings] = React.useState<AppSettings | null>(null);
  const solarTerm = React.useMemo(() => getCurrentSolarTerm(), []);

  // 搖手機求籤：在擲筊步驟偵測搖動
  useShakeDetector(
    React.useCallback(() => {
      if (div.step === 'toss-jiaobei') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShakeTossSignal((value) => value + 1);
      }
    }, [div.step]),
    div.step === 'toss-jiaobei'
  );

  const isCompact = layout.width < 420;
  const isTablet = layout.isTablet;
  const pageMaxWidth = layout.isWideDesktop ? 1180 : layout.isDesktop ? 1080 : layout.contentMaxWidth;
  const selectedGodCardImage = getGodCardImage(div.selectedGod?.id);

  // 設定只在掛載時讀取一次，其餘效果共用同一份，避免重複讀取 AsyncStorage
  React.useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  // 載入設定後產生個人化運勢
  React.useEffect(() => {
    if (!settings?.birthDate) return;
    const year = parseBirthYear(settings.birthDate);
    if (!year) return;
    const bazi = calcBazi(year);
    setFortune(getDailyFortune(bazi));
  }, [settings]);

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

  // 環境音效：冥想 / 擲筊步驟啟動，其他步驟停止
  React.useEffect(() => {
    if (!settings) return;
    const ambientSteps = ['meditate', 'toss-jiaobei'];
    if (settings.ambientSound) {
      if (ambientSteps.includes(div.step)) {
        startAmbientSound().catch(() => {});
      } else {
        stopAmbientSound();
      }
    }
    return () => stopAmbientSound();
  }, [div.step, settings]);

  React.useEffect(() => {
    if (!settings) return;
    setStrictMode(settings.strictMode || false);
    setLowMotionMode(Boolean(settings.lowMotionMode));
  }, [settings]);

  React.useEffect(() => {
    getLastPoemContext().then((context) => setHasLastPoemContext(Boolean(context)));
  }, []);

  React.useEffect(() => {
    if (!settings) return;
    Promise.all([getHistory(), getVerificationFollowUps()]).then(([history, followUps]) => {
      const lastCategory = history[0]?.questionCategory ?? 'general';
      const recommendation = recommendGods({
        questionCategory: lastCategory,
        birthDate: settings.birthDate,
        preferredGodId: settings.preferredGodId,
        history,
      })[0];

      setDailyRecommendation(recommendation ?? null);
      setReviewSummary(followUps);
      setPendingReview(followUps.due[0] ?? followUps.upcoming[0] ?? null);
    });
  }, [settings]);

  // 檢查是否已完成新手引導
  React.useEffect(() => {
    hasOnboarded().then((done) => {
      setShowOnboarding(!done);
    });
  }, []);

  React.useEffect(() => {
    getFamilyMembers().then(setFamilyMembers);
  }, []);

  const handleAddFamilyMember = async () => {
    if (!newFamName.trim()) return;
    const member = await addFamilyMember({ name: newFamName.trim(), relation: newFamRelation.trim() || '家人' });
    setFamilyMembers(prev => [...prev, member]);
    setNewFamName('');
    setNewFamRelation('');
    setShowAddFamily(false);
  };

  const handleRemoveFamilyMember = async (id: string) => {
    await removeFamilyMember(id);
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
    if (selectedPerson?.id === id) setSelectedPerson(null);
  };

  const showBack = div.step === 'set-question' || div.step === 'meditate' || div.step === 'choose-draw-method' || div.step === 'toss-jiaobei' || div.step === 'enter-zhuge-number';

  const handleBack = () => {
    switch (div.step) {
      case 'set-question': div.goToStep('select-god'); break;
      case 'meditate': if (incenseDone) { setIncenseDone(false); } else { div.goToStep('set-question'); } break;
      case 'choose-draw-method': div.goToStep('meditate'); break;
      case 'enter-zhuge-number':
        if (div.selectedGod?.poemSystem === '諸葛神數') {
          div.goToStep('meditate');
        } else {
          div.goToStep('choose-draw-method');
        }
        break;
      case 'toss-jiaobei': div.goToStep('choose-draw-method'); break;
      default: handleReset();
    }
  };
  const handleReset = () => { setIncenseDone(false); setWishAdded(false); setPoemConfirmText(null); setPoemConfirming(false); div.reset(); };
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
      dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
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
      <Text style={styles.appTitle}>🏛️ {t('homeTitle')}</Text>
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
      { key: isZhuge ? 'enter-zhuge-number' : 'choose-draw-method', icon: isZhuge ? '🔢' : '🎛️' },
      { key: 'drawing', icon: '🎋' },
      { key: 'result', icon: '✨' },
    ];
    const stepKey = (s: string) => {
      if (s === 'reveal-poem' || s === 'ai-interpret') return 'result';
      if (!isZhuge && (s === 'toss-jiaobei' || s === 'enter-zhuge-number')) return 'choose-draw-method';
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
            <ForWhomSelector
              familyMembers={familyMembers}
              selectedPerson={selectedPerson}
              onSelect={setSelectedPerson}
              onAddPress={() => setShowAddFamily(true)}
              onRemove={handleRemoveFamilyMember}
            />
            <DailyFortuneCard fortune={fortune} expanded={fortuneExpanded} onToggle={() => setFortuneExpanded(v => !v)} />
            {dailyRecommendation ? (
              <DailyGodRecommendationCard
                recommendation={dailyRecommendation}
                onSelect={() => handleSelectGod(dailyRecommendation.god.id)}
                reducedMotion={reducedMotion || lowMotionMode}
              />
            ) : null}
            {pendingReview ? (
              <PendingReviewCard record={pendingReview} summary={reviewSummary} onPress={handleReviewRecord} reducedMotion={reducedMotion || lowMotionMode} />
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
                reducedMotion={reducedMotion || lowMotionMode}
              />
            )}
            <QuestionForm
              selectedGod={div.selectedGod}
              onSwitchGod={handleSelectGod}
              forWhom={selectedPerson ? `${selectedPerson.relation} ${selectedPerson.name}` : undefined}
              onSubmit={(q, cat, name) => div.startMeditation(q, cat, name)}
            />
          </View>
        );
      case 'meditate':
        if (!incenseDone) {
          return (
            <IncenseRitual
              godId={div.selectedGod?.id}
              godName={div.selectedGod?.name || '神明'}
              onComplete={() => setIncenseDone(true)}
              ritualStyleKey={ritualStyle}
              onStyleChange={setRitualStyle}
            />
          );
        }
        return <MeditationScreen godName={div.selectedGod?.name || '神明'} onComplete={div.finishMeditation} />;
      case 'choose-draw-method':
        return (
          <DrawMethodSelector
            godName={div.selectedGod?.name}
            onSelect={div.chooseDrawMethod}
          />
        );
      case 'enter-zhuge-number': {
        const isZhuge = div.selectedGod?.poemSystem === '諸葛神數';
        return (
          <ZhugeNumberInput
            onSubmit={(n) => div.performNumberDraw(n)}
            title={isZhuge ? undefined : '心中報數'}
            subtitle={isZhuge ? undefined : '以數取籤・無須晃動'}
            description={isZhuge ? undefined : '靜心片刻，心中自然浮現一個數字，\n系統會以這個數字作為本次抽籤的心念種子。'}
            confirmLabel={isZhuge ? undefined : '報數取籤 →'}
            tip={isZhuge ? undefined : '適合網頁版或不方便搖動裝置時使用'}
            placeholder={isZhuge ? undefined : '輸入心中數字'}
            showHexagramHint={isZhuge}
            showContext={isZhuge}
          />
        );
      }
      case 'toss-jiaobei':
        return (
          <View>
            <Jiaobei
              onToss={div.performJiaobei}
              onShengbei={div.drawMethod === 'jiaobei-auto' ? div.performAutoDraw : div.performDraw}
              results={div.jiaobeiResults}
              strictMode={strictMode}
              tossSignal={shakeTossSignal}
              lowMotion={lowMotionMode}
              ritualStyleKey={ritualStyle}
              onStyleChange={setRitualStyle}
            />
            <View style={styles.shakeHint}>
              <Text style={styles.shakeHintText}>{div.drawMethod === 'jiaobei-auto' ? '聖筊後會自動開籤，不需要搖籤筒' : '📳 或搖動手機擲筊'}</Text>
            </View>
          </View>
        );
      case 'drawing':
        return (
          <DrawAnimation
            god={div.selectedGod}
            poemNumber={div.pendingPoem?.number}
            durationMs={div.drawAnimationDurationMs}
            styleKey={div.drawAnimationStyleKey}
            lowMotion={lowMotionMode}
            interactive={div.selectedGod?.poemSystem !== '諸葛神數' && div.drawMethod === 'jiaobei-shake'}
            shakeMode={settings?.shakeMode === 'hold' ? 'hold' : 'drag'}
            onShakeComplete={div.completeShake}
          />
        );
      case 'reveal-poem':
      case 'ai-interpret':
      case 'result':
        return div.drawnPoem ? (
          <View style={{ flex: 1 }}>
            {/* 節氣提示 */}
            <View style={styles.solarTermBadge}>
              <Text style={styles.solarTermText}>
                {solarTerm.name}・{solarTerm.element}行 — {solarTerm.guidance}
              </Text>
            </View>
            <PoemCard
              poem={div.drawnPoem}
              godName={div.selectedGod?.name || '神明'}
              god={div.selectedGod}
              aiInterpretation={div.aiInterpretation}
              isLoading={div.step === 'ai-interpret' && !div.aiInterpretation}
              lowMotion={lowMotionMode}
              questionCategory={div.questionCategory}
              question={div.question}
              record={div.currentRecord}
            />
            {/* 跨神明比對 */}
            {div.step === 'result' && div.selectedGodId != null && (
              <View>
                <TouchableOpacity
                  style={styles.crossCompareToggle}
                  onPress={() => setShowCrossCompare(v => !v)}
                >
                  <Text style={styles.crossCompareToggleText}>
                    {showCrossCompare ? '▲ 收起其他神明' : '🏮 看看其他神明怎麼說'}
                  </Text>
                </TouchableOpacity>
                {showCrossCompare && (
                  <CrossTempleComparison
                    currentGodId={div.selectedGodId}
                    questionCategory={div.questionCategory}
                  />
                )}
              </View>
            )}
          </View>
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

  const isGoodFortune = div.drawnPoem?.level && (
    div.drawnPoem.level.includes('上') ||
    div.drawnPoem.level.includes('大吉') ||
    div.drawnPoem.level.includes('吉')
  );

  const handleShareBlessing = async () => {
    if (!div.drawnPoem) return;
    const godName = div.selectedGod?.name || '神明';
    const line1 = div.drawnPoem.content.split('\n')[0] || div.drawnPoem.content.slice(0, 30);
    const blessing = `🌸 ${godName} 賜福祝卡 🌸\n\n好消息！我在神明占卜求得吉籤：\n\n【第 ${div.drawnPoem.number} 籤 · ${div.drawnPoem.title}】\n"${line1}"\n\n願此福氣也能帶給你 ✨\n祝你諸事順心，好運連連！\n\n— 由神明占卜送出 🏛️`;
    await Share.share({ message: blessing });
  };

  const handleConfirmPoem = async () => {
    if (!div.currentRecord || poemConfirming) return;
    setPoemConfirming(true);
    const result: JiaobeiResult = tossJiaobei();
    const confirmed = result === 'shengbei';
    const label = result === 'shengbei' ? '聖筊，神明允此籤' : result === 'xiaobei' ? '笑筊，請再觀察籤意' : '陰筊，先保守解讀';
    setPoemConfirmText(label);
    await updatePoemConfirmation(div.currentRecord.id, confirmed, label);
    Haptics.notificationAsync(
      confirmed ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
    ).catch(() => {});
    setPoemConfirming(false);
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
          {isGoodFortune ? (
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnBlessing, isCompact && styles.actionBtnCompact, isTablet && styles.actionBtnTablet]} onPress={handleShareBlessing}>
              <Text style={styles.actionBtnIcon}>🌸</Text>
              <Text style={styles.actionBtnText}>送祝福</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={[styles.actionBtn, isCompact && styles.actionBtnCompact, isTablet && styles.actionBtnTablet]} onPress={handleReviewRecord}>
            <Text style={styles.actionBtnIcon}>🧭</Text>
            <Text style={styles.actionBtnText}>回訪</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, isCompact && styles.actionBtnCompact, isTablet && styles.actionBtnTablet]} onPress={handleConfirmPoem} disabled={poemConfirming}>
            <Text style={styles.actionBtnIcon}>筊</Text>
            <Text style={styles.actionBtnText}>{poemConfirmText ? '已確認' : poemConfirming ? '確認中' : '確認此籤'}</Text>
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
        <StatusBar barStyle="light-content" backgroundColor={theme.bgDark} />
        {showOnboarding ? (
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        ) : (
          <>
            {!lowMotionMode ? <StarBackground /> : null}
            {!lowMotionMode && (div.step === 'meditate' || div.step === 'toss-jiaobei') ? <IncenseSmoke /> : null}
            <FireworksEffect active={showFireworks && !lowMotionMode} />
            <WishBindEffect active={showWishBind && !reducedMotion && !lowMotionMode} />
            <Modal visible={showAddFamily} transparent animationType="fade" onRequestClose={() => setShowAddFamily(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>新增家人成員</Text>
                  <TextInput style={styles.modalInput} value={newFamName} onChangeText={setNewFamName} placeholder="姓名" placeholderTextColor={theme.textMuted} />
                  <TextInput style={styles.modalInput} value={newFamRelation} onChangeText={setNewFamRelation} placeholder="關係（媽媽、爸爸…）" placeholderTextColor={theme.textMuted} />
                  <View style={styles.modalBtnRow}>
                    <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAddFamily(false)}>
                      <Text style={styles.modalCancelText}>取消</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleAddFamilyMember}>
                      <Text style={styles.modalConfirmText}>確認新增</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
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

// ─── 為誰求籤選擇器 ───────────────────────────────────────────

	// ─── 運勢折疊卡 ───────────────────────────────────────────
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
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
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
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
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
  summary,
  onPress,
  reducedMotion,
}: {
  record: DivinationRecord;
  summary?: VerificationFollowUpSummary | null;
  onPress: () => void;
  reducedMotion: boolean;
}) {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
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
    outputRange: [theme.warning + '55', theme.goldLight + 'DD'],
  });
  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.warning + '12', theme.goldDark + '1F'],
  });
  const dueCount = summary?.due.length ?? 0;
  const pendingCount = summary?.pending.length ?? 1;
  const daysUntilReview = record.verificationDueAt
    ? Math.max(0, Math.ceil((record.verificationDueAt - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;
  const title = dueCount > 0 ? `${dueCount} 支籤已到回訪時間` : '下一支籤等待回訪';
  const scheduleText = dueCount > 0
    ? `共有 ${pendingCount} 支待驗證，先回來標記準不準。`
    : daysUntilReview === null
      ? `共有 ${pendingCount} 支待驗證。`
      : `約 ${daysUntilReview} 天後可做 7 日回訪。`;

  return (
    <AnimatedTouchable
      style={[styles.pendingReviewCard, { borderColor, backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.86}
    >
      <View style={styles.pendingReviewMeta}>
        <Text style={styles.pendingReviewTitle}>{title}</Text>
        <Text style={styles.pendingReviewText} numberOfLines={2}>
          {record.godName} · 第 {record.poem.number} 籤 · {record.question || record.poem.title}
        </Text>
        <Text style={styles.pendingReviewSchedule}>{scheduleText}</Text>
      </View>
      <Text style={styles.pendingReviewCta}>去驗證</Text>
    </AnimatedTouchable>
  );
}

function WishBindEffect({ active }: { active: boolean }) {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
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

// ─────────────────────────────────────────────────────────────

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bgDark },
  // 搖手機提示
  shakeHint: {
    alignItems: 'center', marginTop: 12, marginBottom: 4,
  },
  shakeHintText: {
    color: theme.textMuted, fontSize: 13,
    borderWidth: 1, borderColor: '#2A2020', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  // 節氣 badge
  solarTermBadge: {
    backgroundColor: '#1E1508', borderRadius: 8, borderWidth: 1,
    borderColor: '#3A2A10', marginHorizontal: TempleSpacing.md,
    marginBottom: 8, paddingHorizontal: 12, paddingVertical: 7,
  },
  solarTermText: { color: '#C9A96E', fontSize: 12, lineHeight: 18 },
  // 跨神明比對
  crossCompareToggle: {
    marginHorizontal: TempleSpacing.md, marginTop: 16,
    borderWidth: 1, borderColor: theme.goldDark, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  crossCompareToggleText: { color: theme.gold, fontSize: 14, fontWeight: '700' },
  container: { flex: 1 },
  pageShell: { flex: 1, width: '100%', alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: TempleSpacing.md,
    paddingVertical: TempleSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.goldDark + '20',
  },
  headerCompact: { paddingHorizontal: 12 },
  appTitle: { fontSize: TempleFonts.heading, fontWeight: '700', color: theme.goldLight },
  appTitleCompact: { fontSize: 17, flex: 1, marginHorizontal: 8, textAlign: 'center' },
  backBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.goldDark + '30', minWidth: 60, alignItems: 'center' },
  backBtnText: { fontSize: 12, color: theme.textMuted },
  backBtnSmall: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, minWidth: 60, alignItems: 'center' },
  backBtnTextSmall: { fontSize: 12, color: theme.goldLight },
  backBtnCompact: { minWidth: 52, paddingHorizontal: 8 },
  backBtnTextCompact: { fontSize: 11 },
  stepIndicator: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: TempleSpacing.sm, paddingHorizontal: TempleSpacing.md,
  },
  stepIndicatorCompact: { paddingHorizontal: 12 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: theme.bgCard,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.goldDark + '30',
  },
  stepDotCompact: { width: 24, height: 24, borderRadius: 12 },
  stepDotActive: { backgroundColor: theme.goldDark + '30', borderColor: theme.goldDark },
  stepDotCurrent: { backgroundColor: theme.red, borderColor: theme.gold, width: 30, height: 30, borderRadius: 15 },
  stepDotCurrentCompact: { width: 28, height: 28, borderRadius: 14 },
  stepIcon: { fontSize: 11 },
  stepIconCompact: { fontSize: 10 },
  stepLine: { width: 12, height: 1, backgroundColor: theme.goldDark + '30', marginHorizontal: 2 },
  stepLineCompact: { width: 8 },
  stepLineActive: { backgroundColor: theme.goldDark },
  content: { flex: 1 },
  fullScreen: { flex: 1 },
  recommendCard: {
    marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
    padding: TempleSpacing.md,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: theme.bgCard,
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
    color: theme.goldLight,
    fontWeight: '900',
    marginBottom: 4,
  },
  recommendReason: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
    lineHeight: 20,
  },
  recommendImageWrap: {
    width: 72,
    height: 96,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: theme.bgDark,
  },
  recommendImage: { width: '100%', height: '100%' },
  pendingReviewCard: {
    marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    padding: TempleSpacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.warning + '55',
    backgroundColor: theme.warning + '12',
    flexDirection: 'row',
    alignItems: 'center',
    gap: TempleSpacing.sm,
  },
  pendingReviewMeta: { flex: 1 },
  pendingReviewTitle: {
    color: theme.goldLight,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    marginBottom: 4,
  },
  pendingReviewText: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  pendingReviewSchedule: {
    color: theme.warning,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    fontWeight: '700',
  },
  pendingReviewCta: {
    color: theme.goldLight,
    fontSize: 12,
    fontWeight: '800',
  },
  followUpShortcut: {
    marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    padding: TempleSpacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.goldDark + '35',
    backgroundColor: theme.bgCard,
  },
  followUpShortcutTitle: {
    fontSize: TempleFonts.body,
    fontWeight: '800',
    color: theme.goldLight,
    marginBottom: 4,
  },
  followUpShortcutText: {
    fontSize: TempleFonts.small,
    lineHeight: 20,
    color: theme.textMuted,
  },
  selectedGodBanner: {
    backgroundColor: theme.bgCard, marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.md, padding: TempleSpacing.md, borderRadius: 12,
    borderWidth: 1, borderColor: theme.goldDark + '40', flexDirection: 'row', alignItems: 'center', gap: TempleSpacing.md,
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
  selectedGodName: { fontSize: TempleFonts.heading, fontWeight: '700', color: theme.goldLight },
  selectedGodNameCompact: { textAlign: 'center' },
  selectedGodTagline: { fontSize: 12, fontWeight: '600', marginTop: 2, marginBottom: 4 },
  selectedGodDesc: { fontSize: TempleFonts.small, color: theme.textMuted, marginTop: 2 },
  selectedGodTextCompact: { textAlign: 'center' },
  actionBar: {
    flexDirection: 'row', justifyContent: 'center', gap: TempleSpacing.sm, flexWrap: 'wrap',
    paddingHorizontal: TempleSpacing.md, paddingVertical: TempleSpacing.sm,
    borderTopWidth: 1, borderTopColor: theme.goldDark + '20', backgroundColor: theme.bgDark,
  },
  actionBarCompact: { paddingHorizontal: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: TempleSpacing.md,
    paddingVertical: TempleSpacing.sm, borderRadius: 10, backgroundColor: theme.bgCard,
    borderWidth: 1, borderColor: theme.goldDark + '30', gap: 6,
  },
  actionBtnCompact: { width: '100%', justifyContent: 'center' },
  actionBtnTablet: { minWidth: 180 },
  actionBtnPrimary: { backgroundColor: theme.red, borderColor: theme.goldDark },
  actionBtnDone: { opacity: 0.6, borderColor: theme.success + '60' },
  actionBtnIcon: { fontSize: 16 },
  actionBtnText: { fontSize: TempleFonts.small, color: theme.textLight, fontWeight: '600' },
  actionBtnTextPrimary: { color: theme.goldLight },
  toast: {
    position: 'absolute', bottom: 100, alignSelf: 'center',
    backgroundColor: theme.goldDark, paddingHorizontal: 24, paddingVertical: 10,
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
    backgroundColor: theme.red,
    borderWidth: 2,
    borderColor: theme.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.goldLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 6,
  },
  wishBindSealText: {
    color: theme.goldLight,
    fontSize: 28,
    fontWeight: '900',
  },
  wishBindSpark: {
    position: 'absolute',
    top: '52%',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.goldLight,
  },
  // 新增家人 Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: theme.bgCard, borderRadius: 16, padding: 24, width: '100%', maxWidth: 360, borderWidth: 1, borderColor: theme.gold },
  modalTitle: { fontSize: TempleFonts.heading, color: theme.textGold, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalInput: { backgroundColor: theme.bgMedium, borderRadius: 8, borderWidth: 1, borderColor: theme.gold, padding: 10, color: theme.textLight, fontSize: TempleFonts.body, marginBottom: 10 } as any,
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalCancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.textMuted, alignItems: 'center' },
  modalCancelText: { color: theme.textMuted, fontSize: TempleFonts.body },
  modalConfirmBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: theme.gold, alignItems: 'center' },
  modalConfirmText: { color: theme.bgDark, fontSize: TempleFonts.body, fontWeight: 'bold' },
  actionBtnBlessing: { borderColor: '#E879A0', backgroundColor: '#E879A033' },
  });
}


