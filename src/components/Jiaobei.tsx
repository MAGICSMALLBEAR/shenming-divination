import React, { useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';

import { ParticleEffect } from '@/components/ParticleEffect';
import { RitualStylePicker } from '@/components/RitualStylePicker';
import { ritualStyles, type RitualStyleKey } from '@/constants/ritual-styles';
import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import type { JiaobeiResult } from '@/services/divination';
import { playShengbeiSound, playTossSound, vibrateLight } from '@/services/proceduralSound';

interface JiaobeiProps {
  onToss: () => JiaobeiResult;
  onShengbei: () => void;
  results: JiaobeiResult[];
  strictMode?: boolean;
  tossSignal?: number;
  lowMotion?: boolean;
  ritualStyleKey: RitualStyleKey;
  onStyleChange: (next: RitualStyleKey) => void;
}

type JiaobeiFace = 'round' | 'flat';

export function Jiaobei({
  onToss,
  onShengbei,
  results,
  strictMode,
  tossSignal,
  lowMotion = false,
  ritualStyleKey,
  onStyleChange,
}: JiaobeiProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [currentResult, setCurrentResult] = React.useState<JiaobeiResult | null>(null);
  const [showParticle, setShowParticle] = React.useState(false);
  const ritualStyle = ritualStyles[ritualStyleKey];

  const tossProgress = useRef(new Animated.Value(0)).current;
  const settleProgress = useRef(new Animated.Value(0)).current;
  const resultFade = useRef(new Animated.Value(0)).current;
  const strictCount = results.filter((result) => result === 'shengbei').length;
  const latestResult = results[results.length - 1] ?? null;
  const visibleStrictCount = Math.min(
    3,
    strictCount + (currentResult === 'shengbei' && latestResult !== 'shengbei' ? 1 : 0)
  );
  const attemptLabel = currentResult && !isAnimating
    ? '已完成 ' + results.length + ' 次擲筊'
    : '第 ' + (results.length + 1) + ' 次擲筊';
  const lastTossSignal = useRef(tossSignal);

  const landingFaces = useMemo(() => getLandingFaces(currentResult), [currentResult]);
  const landingPose = useMemo(() => getLandingPose(currentResult), [currentResult]);

  const handleToss = React.useCallback(() => {
    if (isAnimating) {
      return;
    }

    setIsAnimating(true);
    setCurrentResult(null);
    setShowParticle(false);
    resultFade.setValue(0);
    settleProgress.setValue(0);
    tossProgress.setValue(0);
    vibrateLight();

    Animated.timing(tossProgress, {
      toValue: 1,
      duration: lowMotion ? 420 : 980,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      const result = onToss();
      setCurrentResult(result);
      tossProgress.setValue(0);

      if (result === 'shengbei') {
        await playShengbeiSound().catch(() => {});
        if (!lowMotion) {
          setShowParticle(true);
          setTimeout(() => setShowParticle(false), 1100);
        }
      } else {
        await playTossSound().catch(() => {});
      }

      Animated.parallel([
        Animated.spring(settleProgress, {
          toValue: 1,
          friction: 7,
          tension: 72,
          useNativeDriver: true,
        }),
        Animated.spring(resultFade, {
          toValue: 1,
          friction: 7,
          tension: 62,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
        if (result === 'shengbei' && !(strictMode && strictCount < 2)) {
          setTimeout(onShengbei, 900);
        }
      });
    });
  }, [isAnimating, lowMotion, onShengbei, onToss, resultFade, settleProgress, strictCount, strictMode, tossProgress]);

  React.useEffect(() => {
    if (tossSignal == null || lastTossSignal.current === tossSignal) {
      return;
    }
    lastTossSignal.current = tossSignal;
    handleToss();
  }, [handleToss, tossSignal]);

  const pieceTransforms = [0, 1].map((index) => {
    const direction = index === 0 ? -1 : 1;
    const tossTranslateX = tossProgress.interpolate({
      inputRange: [0, 0.2, 0.7, 1],
      outputRange: [0, direction * 10, direction * 40, direction * 78],
    });
    const tossTranslateY = tossProgress.interpolate({
      inputRange: [0, 0.25, 0.7, 1],
      outputRange: [0, -36, -168, -6],
    });
    const tossRotate = tossProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', `${direction * 780}deg`],
    });
    const tossTilt = tossProgress.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: ['0deg', `${direction * 38}deg`, `${direction * 10}deg`],
    });

    const settleTranslateX = settleProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [direction * 28, landingPose[index].translateX],
    });
    const settleTranslateY = settleProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, landingPose[index].translateY],
    });
    const settleRotate = settleProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [`${direction * 18}deg`, landingPose[index].rotate],
    });

    return isAnimating
      ? {
          transform: [
            { translateX: tossTranslateX },
            { translateY: tossTranslateY },
            { rotate: tossRotate },
            { skewX: tossTilt },
          ],
        }
      : {
          transform: [
            { translateX: settleTranslateX },
            { translateY: settleTranslateY },
            { rotate: settleRotate },
          ],
        };
  });

  const shadowTransforms = [0, 1].map((index) => {
    const direction = index === 0 ? -1 : 1;
    const tossShadowX = tossProgress.interpolate({
      inputRange: [0, 0.2, 0.7, 1],
      outputRange: [0, direction * 4, direction * 20, direction * 38],
    });
    const tossShadowScaleX = tossProgress.interpolate({
      inputRange: [0, 0.35, 0.7, 1],
      outputRange: [1, 0.82, 0.56, 0.94],
    });
    const tossShadowScaleY = tossProgress.interpolate({
      inputRange: [0, 0.35, 0.7, 1],
      outputRange: [1, 0.72, 0.34, 0.92],
    });
    const tossShadowOpacity = tossProgress.interpolate({
      inputRange: [0, 0.35, 0.7, 1],
      outputRange: [0.16, 0.12, 0.05, 0.18],
    });

    const settleShadowX = settleProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [direction * 16, landingPose[index].translateX * 0.8],
    });
    const settleShadowScaleX = settleProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, getShadowScaleX(currentResult, index)],
    });
    const settleShadowScaleY = settleProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.75, getShadowScaleY(currentResult, index)],
    });
    const settleShadowOpacity = settleProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.08, getShadowOpacity(currentResult, index)],
    });

    return isAnimating
      ? {
          opacity: tossShadowOpacity,
          transform: [
            { translateX: tossShadowX },
            { scaleX: tossShadowScaleX },
            { scaleY: tossShadowScaleY },
          ],
        }
      : {
          opacity: settleShadowOpacity,
          transform: [
            { translateX: settleShadowX },
            { scaleX: settleShadowScaleX },
            { scaleY: settleShadowScaleY },
          ],
        };
  });

  const strictComplete = strictMode && visibleStrictCount >= 3 && currentResult === 'shengbei';
  const resultInfo = currentResult ? getResultInfo(currentResult) : null;

  return (
    <View style={styles.container}>
      <ParticleEffect active={showParticle && !lowMotion} type="gold" />

      <Text style={styles.title}>{'\u64f2\u676f\u8acb\u793a'}</Text>
      <Text style={styles.attemptText}>
        {attemptLabel}
        {strictMode ? (
          <Text style={styles.strictHint}>{` | 聖筊 ${visibleStrictCount}/3`}</Text>
        ) : null}
      </Text>
      {strictMode ? (
        <Text style={styles.strictModeNote}>嚴謹模式：需累積三次聖筊才會進入抽籤。</Text>
      ) : null}
      <RitualStylePicker value={ritualStyleKey} onChange={onStyleChange} />

      <View style={styles.stage}>
        <View style={[styles.floorGlow, { backgroundColor: ritualStyle.glowColor + '16' }]} />
        <View style={styles.shadowPlate} />

        {[0, 1].map((index) => (
          <Animated.View key={`shadow-${index}`} style={[styles.shadowWrap, shadowTransforms[index]]}>
            <View style={styles.pieceShadow} />
          </Animated.View>
        ))}

        {[0, 1].map((index) => (
          <Animated.View key={index} style={[styles.pieceWrap, pieceTransforms[index]]}>
            <JiaobeiPiece
              face={landingFaces[index]}
              mirrored={index === 1}
              flying={isAnimating}
              ritualStyleKey={ritualStyleKey}
            />
          </Animated.View>
        ))}

        {resultInfo ? (
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: resultFade,
                transform: [
                  {
                    scale: resultFade.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.resultEmoji}>{resultInfo.emoji}</Text>
            <Text style={[styles.resultText, { color: resultInfo.color }]}>{resultInfo.text}</Text>
            <Text style={styles.resultDesc}>{resultInfo.desc}</Text>
            {strictMode && strictComplete ? (
              <Text style={styles.strictCompleteText}>{'三次聖筊已成，可以請示抽籤。'}</Text>
            ) : null}
            {currentResult !== 'shengbei' && !isAnimating ? (
              <TouchableOpacity style={styles.retryBtn} onPress={handleToss}>
                <Text style={styles.retryBtnText}>{'\u518d\u64f2\u4e00\u6b21'}</Text>
              </TouchableOpacity>
            ) : null}
          </Animated.View>
        ) : null}
      </View>

      {!currentResult && !isAnimating ? (
        <TouchableOpacity style={styles.tossBtn} onPress={handleToss}>
          <Text style={styles.tossBtnText}>{'\u64f2\u676f'}</Text>
        </TouchableOpacity>
      ) : null}

      {strictMode && currentResult === 'shengbei' && !isAnimating && !strictComplete ? (
        <TouchableOpacity style={styles.nextTossBtn} onPress={handleToss}>
          <Text style={styles.nextTossBtnText}>{'繼續擲筊 ' + Math.min(3, visibleStrictCount + 1) + '/3'}</Text>
        </TouchableOpacity>
      ) : null}

      {strictComplete && !isAnimating ? (
        <TouchableOpacity style={styles.drawBtn} onPress={onShengbei}>
          <Text style={styles.drawBtnText}>{'\u8056\u676f\u5df2\u6210\uff0c\u958b\u59cb\u62bd\u7c64'}</Text>
        </TouchableOpacity>
      ) : null}

      {results.length > 0 ? (
        <View style={styles.historyStrip}>
          {results.map((result, index) => {
            const info = getResultInfo(result);
            return (
              <View key={`${result}-${index}`} style={styles.historyItem}>
                <Text style={styles.historyIndex}>{index + 1}</Text>
                <Text style={[styles.historyText, { color: info.color }]}>{info.text}</Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function JiaobeiPiece({
  face,
  mirrored,
  flying,
  ritualStyleKey,
}: {
  face: JiaobeiFace;
  mirrored?: boolean;
  flying?: boolean;
  ritualStyleKey: RitualStyleKey;
}) {
  const palette = ritualStyles[ritualStyleKey].jiaobei;
  const source = face === 'flat' ? palette.flatSprite : palette.roundSprite;

  return (
    <View style={[styles.jiaobeiBody, mirrored && styles.jiaobeiMirrored, flying && styles.jiaobeiFlying]}>
      <Image source={source} style={styles.jiaobeiSprite} contentFit="contain" transition={150} />
    </View>
  );
}

function getLandingFaces(result: JiaobeiResult | null): [JiaobeiFace, JiaobeiFace] {
  switch (result) {
    case 'shengbei':
      return ['flat', 'round'];
    case 'xiaobei':
      return ['round', 'round'];
    case 'yinbei':
      return ['flat', 'flat'];
    default:
      return ['round', 'round'];
  }
}

function getLandingPose(result: JiaobeiResult | null) {
  switch (result) {
    case 'shengbei':
      return [
        { translateX: -46, translateY: 10, rotate: '-24deg' },
        { translateX: 42, translateY: -6, rotate: '22deg' },
      ];
    case 'xiaobei':
      return [
        { translateX: -34, translateY: 2, rotate: '-8deg' },
        { translateX: 34, translateY: 2, rotate: '8deg' },
      ];
    case 'yinbei':
      return [
        { translateX: -42, translateY: 8, rotate: '-15deg' },
        { translateX: 40, translateY: 8, rotate: '15deg' },
      ];
    default:
      return [
        { translateX: -26, translateY: 0, rotate: '-6deg' },
        { translateX: 26, translateY: 0, rotate: '6deg' },
      ];
  }
}

function getShadowScaleX(result: JiaobeiResult | null, index: number) {
  if (result === 'shengbei') {
    return index === 0 ? 0.9 : 1.08;
  }
  if (result === 'xiaobei') {
    return 1.12;
  }
  if (result === 'yinbei') {
    return 0.94;
  }
  return 1;
}

function getShadowScaleY(result: JiaobeiResult | null, index: number) {
  if (result === 'shengbei') {
    return index === 0 ? 0.72 : 0.62;
  }
  if (result === 'xiaobei') {
    return 0.76;
  }
  if (result === 'yinbei') {
    return 0.68;
  }
  return 0.74;
}

function getShadowOpacity(result: JiaobeiResult | null, index: number) {
  if (result === 'shengbei') {
    return index === 0 ? 0.24 : 0.18;
  }
  if (result === 'xiaobei') {
    return 0.2;
  }
  if (result === 'yinbei') {
    return 0.23;
  }
  return 0.18;
}

function getResultInfo(result: JiaobeiResult) {
  switch (result) {
    case 'shengbei':
      return {
        text: '\u8056\u676f',
        emoji: '◎',
        desc: '\u795e\u610f\u5141\u53ef\uff0c\u773c\u524d\u65b9\u5411\u53ef\u4ee5\u7e7c\u7e8c\u5f80\u4e0b\u8d70\u3002',
        color: TempleTheme.success,
      };
    case 'xiaobei':
      return {
        text: '\u7b11\u676f',
        emoji: '○',
        desc: '\u554f\u984c\u9084\u4e0d\u5920\u660e\u78ba\uff0c\u6216\u795e\u660e\u63d0\u9192\u4f60\u5148\u518d\u60f3\u4e00\u5c64\u3002',
        color: TempleTheme.warning,
      };
    case 'yinbei':
      return {
        text: '\u9670\u676f',
        emoji: '△',
        desc: '\u76ee\u524d\u4e0d\u5b9c\u7167\u539f\u8def\u5f91\u524d\u9032\uff0c\u5efa\u8b70\u5148\u505c\u4e00\u4e0b\u518d\u8acb\u793a\u3002',
        color: TempleTheme.danger,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: TempleSpacing.md,
  },
  title: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    marginBottom: TempleSpacing.xs,
  },
  attemptText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    marginBottom: TempleSpacing.md,
  },
  strictHint: {
    color: TempleTheme.gold,
    fontWeight: '700',
  },
  strictModeNote: {
    fontSize: 11,
    color: TempleTheme.textMuted,
    marginTop: -6,
    marginBottom: TempleSpacing.sm,
    textAlign: 'center',
  },
  stage: {
    width: '100%',
    maxWidth: 420,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: TempleSpacing.lg,
  },
  floorGlow: {
    position: 'absolute',
    bottom: 84,
    width: 260,
    height: 88,
    borderRadius: 44,
  },
  shadowPlate: {
    position: 'absolute',
    bottom: 96,
    width: 180,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00000020',
  },
  shadowWrap: {
    position: 'absolute',
    bottom: 96,
  },
  pieceShadow: {
    width: 66,
    height: 18,
    borderRadius: 18,
    backgroundColor: '#00000040',
  },
  pieceWrap: {
    position: 'absolute',
    bottom: 116,
  },
  jiaobeiBody: {
    width: 88,
    height: 124,
    overflow: 'hidden',
  },
  jiaobeiMirrored: {
    transform: [{ scaleX: -1 }],
  },
  jiaobeiFlying: {
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  jiaobeiSprite: {
    width: '100%',
    height: '100%',
  },
  resultCard: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    backgroundColor: TempleTheme.bgCard,
    paddingHorizontal: TempleSpacing.xl,
    paddingVertical: TempleSpacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
  },
  resultEmoji: {
    fontSize: 36,
    marginBottom: TempleSpacing.xs,
    color: TempleTheme.goldLight,
  },
  resultText: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    marginBottom: TempleSpacing.xs,
  },
  resultDesc: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    textAlign: 'center',
    marginBottom: TempleSpacing.sm,
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: TempleSpacing.lg,
    paddingVertical: TempleSpacing.sm,
    borderRadius: 8,
    backgroundColor: TempleTheme.warning + '20',
    borderWidth: 1,
    borderColor: TempleTheme.warning,
  },
  retryBtnText: {
    color: TempleTheme.warning,
    fontWeight: '600',
  },
  tossBtn: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: TempleTheme.red,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: TempleTheme.goldDark,
  },
  tossBtnText: {
    fontSize: TempleFonts.heading,
    fontWeight: '900',
    color: TempleTheme.goldLight,
  },
  strictCompleteText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.gold,
    fontWeight: '700',
    marginTop: TempleSpacing.xs,
  },
  nextTossBtn: {
    paddingHorizontal: TempleSpacing.xl,
    paddingVertical: TempleSpacing.sm,
    borderRadius: 10,
    backgroundColor: TempleTheme.goldDark + '30',
    borderWidth: 1,
    borderColor: TempleTheme.gold,
  },
  nextTossBtnText: {
    fontSize: TempleFonts.body,
    color: TempleTheme.goldLight,
    fontWeight: '700',
  },
  drawBtn: {
    paddingHorizontal: TempleSpacing.xxl,
    paddingVertical: TempleSpacing.md,
    borderRadius: 16,
    backgroundColor: TempleTheme.red,
    borderWidth: 2,
    borderColor: TempleTheme.gold,
  },
  drawBtnText: {
    fontSize: TempleFonts.heading,
    fontWeight: '900',
    color: TempleTheme.goldLight,
  },
  historyStrip: {
    flexDirection: 'row',
    gap: TempleSpacing.md,
    marginTop: TempleSpacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  historyItem: {
    alignItems: 'center',
    backgroundColor: TempleTheme.bgCard,
    paddingHorizontal: TempleSpacing.sm,
    paddingVertical: TempleSpacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
    minWidth: 64,
  },
  historyIndex: {
    fontSize: 12,
    color: TempleTheme.textMuted,
  },
  historyText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
