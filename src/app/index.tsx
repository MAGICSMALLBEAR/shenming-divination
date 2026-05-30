// 首頁 - 神明占卜主流程
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Share } from 'react-native';
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
import { t } from '@/services/i18n';

export default function HomeScreen() {
  const div = useDivination();
  const [strictMode, setStrictMode] = React.useState(false);
  const [incenseDone, setIncenseDone] = React.useState(false);
  const [showFireworks, setShowFireworks] = React.useState(false);

  // 抽到上上/大吉籤時觸發煙火
  React.useEffect(() => {
    if (div.step === 'result' && div.drawnPoem) {
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
  const handleReset = () => { setIncenseDone(false); div.reset(); };

  const renderHeader = () => (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity style={styles.backBtnSmall} onPress={handleBack}>
          <Text style={styles.backBtnTextSmall}>← 返回</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtnSmall} />
      )}
      <Text style={styles.appTitle}>🏛️ 神明占卜</Text>
      {div.step !== 'select-god' ? (
        <TouchableOpacity style={styles.backBtn} onPress={handleReset}>
          <Text style={styles.backBtnText}>✕ 重來</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtn} />
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
      <View style={styles.stepIndicator}>
        {steps.map((s, i) => (
          <View key={s.key} style={styles.stepItem}>
            <View style={[
              styles.stepDot,
              i <= currentIndex && styles.stepDotActive,
              i === currentIndex && styles.stepDotCurrent,
            ]}>
              <Text style={styles.stepIcon}>{s.icon}</Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[styles.stepLine, i < currentIndex && styles.stepLineActive]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (div.step) {
      case 'select-god':
        return <GodSelector onSelectGod={div.selectGod} />;
      case 'set-question':
        return (
          <View style={styles.fullScreen}>
            {div.selectedGod && (
              <View style={styles.selectedGodBanner}>
                <Text style={styles.selectedGodName}>{div.selectedGod.name}</Text>
                <Text style={styles.selectedGodDesc}>{div.selectedGod.description.slice(0, 60)}...</Text>
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
        return <DrawAnimation />;
      case 'reveal-poem':
      case 'ai-interpret':
      case 'result':
        return div.drawnPoem ? (
          <PoemCard
            poem={div.drawnPoem}
            godName={div.selectedGod?.name || '神明'}
            aiInterpretation={div.aiInterpretation}
            isLoading={div.step === 'ai-interpret' && !div.aiInterpretation}
            questionCategory={div.questionCategory}
          />
        ) : null;
      default:
        return null;
    }
  };

  const [isSpeaking, setIsSpeaking] = React.useState(false);

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
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionBtn} onPress={div.toggleFavorite}>
            <Text style={styles.actionBtnIcon}>{div.isFavorited ? '💔' : '💾'}</Text>
            <Text style={styles.actionBtnText}>{div.isFavorited ? '已收藏' : '收藏'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSpeak}>
            <Text style={styles.actionBtnIcon}>{isSpeaking ? '⏹️' : '🎙️'}</Text>
            <Text style={styles.actionBtnText}>{isSpeaking ? '停止' : '朗讀'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Text style={styles.actionBtnIcon}>📤</Text>
            <Text style={styles.actionBtnText}>分享</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={handleReset}>
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
          {renderHeader()}
          {renderStepIndicator()}
          <View style={styles.content}>{renderContent()}</View>
          {renderActions()}
        </View>
        {div.toastMessage && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{div.toastMessage}</Text>
          </View>
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: TempleSpacing.md,
    paddingVertical: TempleSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '20',
  },
  appTitle: { fontSize: TempleFonts.heading, fontWeight: '700', color: TempleTheme.goldLight },
  backBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: TempleTheme.bgCard, borderWidth: 1, borderColor: TempleTheme.goldDark + '30', minWidth: 60, alignItems: 'center' },
  backBtnText: { fontSize: 12, color: TempleTheme.textMuted },
  backBtnSmall: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, minWidth: 60, alignItems: 'center' },
  backBtnTextSmall: { fontSize: 12, color: TempleTheme.goldLight },
  stepIndicator: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: TempleSpacing.sm, paddingHorizontal: TempleSpacing.md,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: TempleTheme.bgCard,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: TempleTheme.goldDark + '30',
  },
  stepDotActive: { backgroundColor: TempleTheme.goldDark + '30', borderColor: TempleTheme.goldDark },
  stepDotCurrent: { backgroundColor: TempleTheme.red, borderColor: TempleTheme.gold, width: 30, height: 30, borderRadius: 15 },
  stepIcon: { fontSize: 11 },
  stepLine: { width: 12, height: 1, backgroundColor: TempleTheme.goldDark + '30', marginHorizontal: 2 },
  stepLineActive: { backgroundColor: TempleTheme.goldDark },
  content: { flex: 1 },
  fullScreen: { flex: 1 },
  selectedGodBanner: {
    backgroundColor: TempleTheme.bgCard, marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.md, padding: TempleSpacing.md, borderRadius: 12,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '40', alignItems: 'center',
  },
  selectedGodName: { fontSize: TempleFonts.heading, fontWeight: '700', color: TempleTheme.goldLight },
  selectedGodDesc: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, marginTop: 4, textAlign: 'center' },
  actionBar: {
    flexDirection: 'row', justifyContent: 'center', gap: TempleSpacing.sm,
    paddingHorizontal: TempleSpacing.md, paddingVertical: TempleSpacing.sm,
    borderTopWidth: 1, borderTopColor: TempleTheme.goldDark + '20', backgroundColor: TempleTheme.bgDark,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: TempleSpacing.md,
    paddingVertical: TempleSpacing.sm, borderRadius: 10, backgroundColor: TempleTheme.bgCard,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '30', gap: 6,
  },
  actionBtnPrimary: { backgroundColor: TempleTheme.red, borderColor: TempleTheme.goldDark },
  actionBtnIcon: { fontSize: 16 },
  actionBtnText: { fontSize: TempleFonts.small, color: TempleTheme.textLight, fontWeight: '600' },
  actionBtnTextPrimary: { color: TempleTheme.goldLight },
  toast: {
    position: 'absolute', bottom: 100, alignSelf: 'center',
    backgroundColor: TempleTheme.goldDark, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 20, elevation: 4,
  },
  toastText: { color: '#FFF', fontSize: TempleFonts.small, fontWeight: '600' },
});
