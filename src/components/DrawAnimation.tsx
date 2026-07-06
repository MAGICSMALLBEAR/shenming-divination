// 抽籤動畫元件
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import type { God } from '@/data/gods';
import { getGodSoftImage } from '@/data/godImages';
import { DRAW_ANIMATION_DEFAULT_MS } from '@/constants/divination';
import {
  drawAnimationStyles,
  getDrawAnimationRitualStyle,
  type DrawAnimationStyleKey,
} from '@/constants/draw-animation-styles';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { playDrawSound } from '@/services/proceduralSound';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const STICKS: readonly { left: number; rotate: string; height: number; selected?: boolean }[] = [
  { left: 8, rotate: '-12deg', height: 112 },
  { left: 24, rotate: '-6deg', height: 124 },
  { left: 42, rotate: '-2deg', height: 132 },
  { left: 61, rotate: '0deg', height: 146, selected: true },
  { left: 80, rotate: '3deg', height: 132 },
  { left: 98, rotate: '8deg', height: 122 },
  { left: 116, rotate: '12deg', height: 110 },
] as const;

const PHASES = [
  '誠心默念，神意匯聚',
  '籤筒漸動，靈籤浮起',
  '天意已定，籤枝落下',
  '聖示將明，請稍候片刻',
];

interface DrawAnimationProps {
  god?: God | null;
  poemNumber?: number | null;
  durationMs?: number;
  styleKey?: DrawAnimationStyleKey;
  lowMotion?: boolean;
  soundEnabled?: boolean;
}

export function DrawAnimation({
  god,
  poemNumber,
  durationMs = DRAW_ANIMATION_DEFAULT_MS,
  styleKey = 'bronze',
  lowMotion = false,
  soundEnabled = true,
}: DrawAnimationProps) {
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = systemReducedMotion || lowMotion;
  const auraAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const chosenLiftAnim = useRef(new Animated.Value(0)).current;
  const chosenDropAnim = useRef(new Animated.Value(0)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const revealTranslate = useRef(new Animated.Value(16)).current;
  const numberOpacity = useRef(new Animated.Value(0)).current;
  const numberScale = useRef(new Animated.Value(0.84)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const paperAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [trackWidth, setTrackWidth] = useState(220);
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const highlightColor = god?.accentColor || theme.goldLight;
  const primaryColor = god?.primaryColor || theme.redLight;
  const auraColor = god?.auraColor || '#F4D39B';
  const drawStyle = drawAnimationStyles[styleKey];
  const ritualStyle = getDrawAnimationRitualStyle(styleKey);
  const motion = drawStyle.motion;
  const ms = Math.max(durationMs, 2600);
  const softImage = getGodSoftImage(god?.id);

  const activePhase = PHASES[phaseIndex] || PHASES[PHASES.length - 1];
  const chosenStickTranslateY = useMemo(() => (
    Animated.add(
      chosenLiftAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, motion.liftDistance],
      }),
      chosenDropAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, motion.dropDistance],
      })
    )
  ), [chosenDropAnim, chosenLiftAnim]);

  useEffect(() => {
    if (soundEnabled) {
      playDrawSound();
    }
    if (reducedMotion) {
      setPhaseIndex(PHASES.length - 1);
      auraAnim.setValue(0.45);
      shakeAnim.setValue(0);
      floatAnim.setValue(0);
      chosenLiftAnim.setValue(1);
      chosenDropAnim.setValue(1);
      revealOpacity.setValue(1);
      revealTranslate.setValue(0);
      numberOpacity.setValue(1);
      numberScale.setValue(1);
      flashAnim.setValue(0);
      paperAnim.setValue(1);
      flipAnim.setValue(1);
      progressAnim.setValue(1);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const auraLoop = Animated.loop(
      Animated.timing(auraAnim, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
    );
    const floatLoop = Animated.loop(
      Animated.timing(floatAnim, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
    );
    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: motion.shakeDuration, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: motion.shakeDuration, easing: Easing.linear, useNativeDriver: true }),
      ]),
      { iterations: motion.shakeIterations }
    );

    auraLoop.start();
    floatLoop.start();
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: ms,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    numberOpacity.setValue(0);
    numberScale.setValue(0.84);
    flashAnim.setValue(0);
    paperAnim.setValue(0);
    flipAnim.setValue(0);

    timers.push(setTimeout(() => setPhaseIndex(1), ms * 0.22));
    timers.push(setTimeout(() => setPhaseIndex(2), ms * 0.57));
    timers.push(setTimeout(() => setPhaseIndex(3), ms * 0.8));
    timers.push(setTimeout(() => shakeLoop.start(), ms * 0.16));
    timers.push(setTimeout(() => {
      Animated.sequence([
        Animated.timing(chosenLiftAnim, {
          toValue: 1,
          duration: ms * 0.2,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(chosenDropAnim, {
          toValue: 1,
          duration: ms * 0.11,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, ms * 0.4));
    timers.push(setTimeout(() => {
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: ms * 0.04, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: ms * 0.12, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, ms * 0.68));
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(paperAnim, { toValue: 1, duration: ms * 0.16, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
        Animated.timing(flipAnim, { toValue: 1, duration: ms * 0.28, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, ms * 0.6));
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(revealOpacity, { toValue: 1, duration: ms * 0.12, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(revealTranslate, { toValue: 0, duration: ms * 0.12, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, ms * 0.73));
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(numberOpacity, { toValue: 1, duration: ms * 0.09, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(numberScale, { toValue: 1, tension: 90, friction: 8, useNativeDriver: true }),
      ]).start();
    }, ms * 0.63));

    return () => {
      timers.forEach(clearTimeout);
      auraLoop.stop();
      floatLoop.stop();
      shakeLoop.stop();
    };
  }, [auraAnim, chosenDropAnim, chosenLiftAnim, flashAnim, flipAnim, floatAnim, motion.dropDistance, motion.liftDistance, motion.shakeDuration, motion.shakeIterations, ms, numberOpacity, numberScale, paperAnim, progressAnim, reducedMotion, revealOpacity, revealTranslate, shakeAnim, soundEnabled]);

  const translateX = useMemo(() => shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-motion.shakeAmplitude, motion.shakeAmplitude],
  }), [shakeAnim, motion.shakeAmplitude]);

  const rotate = useMemo(() => shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  }), [shakeAnim]);

  // auraAnim runs 0→1 in a single loop; bell-curve outputRange recreates the
  // original 0.94→1.1→0.94 pulse without a back-and-forth Animated.sequence
  // (sequences caused the native driver to build an inputRange of [0,0.5,1,0.5,0]).
  const haloScale = useMemo(() => auraAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.94, 1.1, 0.94],
  }), [auraAnim]);

  const haloOpacity = useMemo(() => auraAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.32, 0.72, 0.32],
  }), [auraAnim]);

  // floatAnim runs 0→1 in a single loop; bell-curve gives the same float effect.
  const altarFloat = useMemo(() => floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -motion.floatDistance, 0],
  }), [floatAnim, motion.floatDistance]);

  const chosenStickRotate = useMemo(() => chosenDropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '18deg'],
  }), [chosenDropAnim]);

  const progressScaleX = useMemo(() => progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.001, 1],
  }), [progressAnim]);

  const progressTranslateX = useMemo(() => progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-trackWidth / 2, 0],
  }), [progressAnim, trackWidth]);

  const flashScale = useMemo(() => flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, motion.flashScale],
  }), [flashAnim, motion.flashScale]);

  const flashOpacity = useMemo(() => flashAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.95, 0],
  }), [flashAnim]);

  const paperTranslateY = useMemo(() => paperAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [44, 0],
  }), [paperAnim]);

  const paperScale = useMemo(() => paperAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1],
  }), [paperAnim]);

  const paperOpacity = useMemo(() => paperAnim.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 1, 1],
  }), [paperAnim]);

  const paperRotateX = useMemo(() => flipAnim.interpolate({
    inputRange: [0, 0.52, 1],
    outputRange: [motion.paperRotateStart, '8deg', '0deg'],
  }), [flipAnim, motion.paperRotateStart]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>抽籤中</Text>
      <Text style={styles.subtitle}>{activePhase}</Text>
      <View style={[styles.styleBadge, { borderColor: ritualStyle.chipColor + '66' }]}>
        <Text style={[styles.styleBadgeText, { color: ritualStyle.chipColor }]}>
          {drawStyle.label}
        </Text>
      </View>

      <View style={styles.heroRow}>
        <View style={[styles.godChip, { borderColor: highlightColor + '55' }]}>
          {softImage ? (
            <Image source={softImage} style={styles.godChipImage} contentFit="cover" transition={200} />
          ) : null}
          <View style={[styles.godChipOverlay, { backgroundColor: primaryColor + '20' }]} />
        </View>
        <View style={styles.godTextWrap}>
          <Text style={styles.godLabel}>恭請 {god?.name || '神明'} 降示</Text>
          <Text style={[styles.godBlessing, { color: highlightColor }]}>
            {god?.tagline || '神籤將現'}
          </Text>
          <Text style={styles.styleSummary}>{drawStyle.summary}</Text>
        </View>
      </View>

      <View style={styles.animationStage}>
        <Animated.View
          style={[
            styles.halo,
            {
              backgroundColor: auraColor + '33',
              opacity: haloOpacity,
              transform: [{ scale: haloScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flashRing,
            {
              borderColor: highlightColor,
              backgroundColor: highlightColor + '24',
              opacity: flashOpacity,
              transform: [{ scale: flashScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flashCore,
            {
              backgroundColor: highlightColor + 'CC',
              opacity: flashOpacity,
              transform: [{ scale: flashScale }],
            },
          ]}
        />

        <Animated.View style={[styles.altarGlow, { transform: [{ translateY: altarFloat }] }]}>
          <Image
            source={ritualStyle.censer.placedSprite}
            style={styles.censerSprite}
            contentFit="contain"
            transition={200}
          />
          <View style={styles.stickShadowRow}>
            {STICKS.map((stick, index) => (
              <View
                key={`${stick.left}-${index}`}
                style={[
                  styles.shadowStick,
                  {
                    left: stick.left + 8,
                    height: stick.height - 24,
                    transform: [{ rotate: stick.rotate }],
                  },
                ]}
              />
            ))}
          </View>

          <Animated.View
            style={[
              styles.qiantong,
              {
                backgroundColor: ritualStyle.censer.body,
                borderColor: ritualStyle.censer.border,
                transform: [{ translateX }, { rotate }, { translateY: altarFloat }],
              },
            ]}
          >
            <View style={[styles.qiantongLip, { backgroundColor: ritualStyle.censer.lip }]} />
            <View style={styles.sticksRow}>
              {STICKS.map((stick, index) => {
                const isSelected = Boolean(stick.selected);
                const animatedStyle = isSelected ? {
                  transform: [{ rotate: stick.rotate }, { translateY: chosenStickTranslateY }, { rotate: chosenStickRotate }],
                } : {
                  transform: [{ rotate: stick.rotate }],
                };

                return (
                  <Animated.View
                    key={`${stick.left}-${index}`}
                    style={[
                      styles.stick,
                      {
                        left: stick.left,
                        height: stick.height,
                        backgroundColor: isSelected ? ritualStyle.censer.accent : '#E8D7B2',
                        borderColor: isSelected ? highlightColor : ritualStyle.censer.baseBorder,
                      },
                      animatedStyle,
                    ]}
                  >
                    <View style={[styles.stickTip, { backgroundColor: isSelected ? primaryColor : ritualStyle.censer.ornament }]} />
                  </Animated.View>
                );
              })}
            </View>
            <Text style={[styles.qiantongText, { color: ritualStyle.censer.accent }]}>籤</Text>
          </Animated.View>
        </Animated.View>
      </View>

      <View style={styles.phaseDots}>
        {PHASES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.phaseDot,
              index <= phaseIndex && { backgroundColor: highlightColor, borderColor: highlightColor },
            ]}
          />
        ))}
      </View>

      <View style={styles.progressTrack} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: highlightColor,
              width: trackWidth,
              transform: [{ translateX: progressTranslateX }, { scaleX: progressScaleX }],
            },
          ]}
        />
      </View>

      <Animated.View
        style={[
          styles.fortunePaper,
          {
            borderColor: highlightColor + '66',
            opacity: paperOpacity,
            transform: [
              { perspective: 800 },
              { translateY: paperTranslateY },
              { scale: paperScale },
              { rotateX: paperRotateX },
            ],
          },
        ]}
      >
        <View style={[styles.paperSeal, { backgroundColor: primaryColor }]}>
          <Text style={styles.paperSealText}>籤</Text>
        </View>
        <Text style={styles.paperEyebrow}>天定籤號</Text>
        <Animated.Text
          style={[
            styles.paperNumber,
            {
              color: highlightColor,
              opacity: numberOpacity,
              transform: [{ scale: numberScale }],
            },
          ]}
        >
          第 {poemNumber ?? '?'} 籤
        </Animated.Text>
        <View style={[styles.paperRule, { backgroundColor: highlightColor + '55' }]} />
      </Animated.View>

      <Animated.View
        style={[
          styles.revealCard,
          {
            borderColor: highlightColor + '55',
            opacity: revealOpacity,
            transform: [{ translateY: revealTranslate }],
          },
        ]}
      >
        <Text style={[styles.revealCardTitle, { color: highlightColor }]}>聖意已定</Text>
        <Text style={styles.revealCardText}>靈籤即將揭曉，請保持一念澄明。</Text>
      </Animated.View>
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: TempleSpacing.lg,
  },
  title: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '700',
    color: theme.goldLight,
    marginBottom: TempleSpacing.xs,
  },
  subtitle: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
    marginBottom: TempleSpacing.sm,
  },
  styleBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: theme.bgCard,
    marginBottom: TempleSpacing.lg,
  },
  styleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TempleSpacing.md,
    marginBottom: TempleSpacing.xl,
  },
  godChip: {
    width: 68,
    height: 68,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    backgroundColor: theme.bgCard,
  },
  godChipImage: { width: '100%', height: '100%' },
  godChipOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  godTextWrap: { maxWidth: 220 },
  godLabel: {
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: theme.textLight,
    marginBottom: 4,
  },
  godBlessing: {
    fontSize: TempleFonts.small,
    fontWeight: '600',
  },
  styleSummary: {
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  animationStage: {
    width: 280,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: TempleSpacing.md,
  },
  halo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  flashRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
  },
  flashCore: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  altarGlow: {
    width: 200,
    height: 210,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  censerSprite: {
    position: 'absolute',
    bottom: -28,
    width: 230,
    height: 160,
    opacity: 0.96,
  },
  stickShadowRow: {
    position: 'absolute',
    top: 12,
    width: 150,
    height: 130,
  },
  shadowStick: {
    position: 'absolute',
    bottom: 0,
    width: 11,
    borderRadius: 8,
    backgroundColor: 'rgba(18, 11, 9, 0.28)',
  },
  sticksRow: {
    position: 'absolute',
    top: -114,
    width: 150,
    height: 148,
  },
  qiantong: {
    width: 158,
    height: 152,
    backgroundColor: '#8B4513',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#5C3D1A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
  },
  qiantongLip: {
    position: 'absolute',
    top: 12,
    width: 124,
    height: 18,
    borderRadius: 12,
    backgroundColor: '#6E3415',
  },
  qiantongText: {
    fontSize: 40,
    fontWeight: '900',
    color: theme.goldLight,
    letterSpacing: 4,
  },
  stick: {
    position: 'absolute',
    bottom: 78,
    width: 12,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  stickTip: {
    width: '100%',
    height: 16,
  },
  phaseDots: {
    flexDirection: 'row',
    gap: TempleSpacing.sm,
    marginBottom: TempleSpacing.sm,
  },
  phaseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.goldDark + '55',
  },
  progressTrack: {
    width: 220,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: theme.bgCard,
    marginBottom: TempleSpacing.lg,
  },
  progressFill: {
    width: 220,
    height: '100%',
    borderRadius: 999,
  },
  fortunePaper: {
    width: 190,
    minHeight: 112,
    backgroundColor: theme.bgLight,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: TempleSpacing.lg,
    paddingTop: TempleSpacing.md,
    paddingBottom: TempleSpacing.sm,
    alignItems: 'center',
    marginBottom: TempleSpacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  paperSeal: {
    position: 'absolute',
    top: -14,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F4D7A1',
  },
  paperSealText: {
    color: theme.goldLight,
    fontSize: 18,
    fontWeight: '900',
  },
  paperEyebrow: {
    fontSize: 11,
    color: '#7A4C20',
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 6,
  },
  paperNumber: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  paperRule: {
    width: 92,
    height: 2,
    borderRadius: 999,
    marginTop: TempleSpacing.sm,
  },
  revealCard: {
    width: 260,
    backgroundColor: theme.bgCard,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: TempleSpacing.lg,
    paddingVertical: TempleSpacing.md,
    alignItems: 'center',
  },
  revealCardTitle: {
    fontSize: TempleFonts.heading,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 3,
  },
  revealCardText: {
    fontSize: TempleFonts.small,
    lineHeight: 22,
    color: theme.textMuted,
    textAlign: 'center',
  },
  });
}
