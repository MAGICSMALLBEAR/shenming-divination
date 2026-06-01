// 抽籤動畫元件
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import type { God } from '@/data/gods';
import { DRAW_ANIMATION_DEFAULT_MS } from '@/constants/divination';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { playDrawSound } from '@/services/proceduralSound';

const STICKS: ReadonlyArray<{ left: number; rotate: string; height: number; selected?: boolean }> = [
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
}

export function DrawAnimation({ god, poemNumber, durationMs = DRAW_ANIMATION_DEFAULT_MS }: DrawAnimationProps) {
  const auraAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const chosenLiftAnim = useRef(new Animated.Value(0)).current;
  const chosenDropAnim = useRef(new Animated.Value(0)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const revealTranslate = useRef(new Animated.Value(16)).current;
  const numberOpacity = useRef(new Animated.Value(0)).current;
  const numberScale = useRef(new Animated.Value(0.84)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [phaseIndex, setPhaseIndex] = useState(0);

  const highlightColor = god?.accentColor || TempleTheme.goldLight;
  const primaryColor = god?.primaryColor || TempleTheme.redLight;
  const auraColor = god?.auraColor || '#F4D39B';
  const ms = Math.max(durationMs, 2600);

  const activePhase = PHASES[phaseIndex] || PHASES[PHASES.length - 1];
  const chosenStickTranslateY = useMemo(() => (
    Animated.add(
      chosenLiftAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -58],
      }),
      chosenDropAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 108],
      })
    )
  ), [chosenDropAnim, chosenLiftAnim]);

  useEffect(() => {
    playDrawSound();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraAnim, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(auraAnim, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 95, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 95, easing: Easing.linear, useNativeDriver: true }),
      ]),
      { iterations: 10 }
    );

    auraLoop.start();
    floatLoop.start();
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: ms,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    numberOpacity.setValue(0);
    numberScale.setValue(0.84);

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
  }, [auraAnim, chosenDropAnim, chosenLiftAnim, floatAnim, ms, numberOpacity, numberScale, progressAnim, revealOpacity, revealTranslate, shakeAnim]);

  const translateX = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-18, 18],
  });

  const rotate = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  });

  const haloScale = auraAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.1],
  });

  const haloOpacity = auraAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.32, 0.72],
  });

  const altarFloat = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const chosenStickRotate = chosenDropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '18deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>抽籤中</Text>
      <Text style={styles.subtitle}>{activePhase}</Text>

      <View style={styles.heroRow}>
        <View style={[styles.godChip, { borderColor: highlightColor + '55' }]}>
          {god?.image ? (
            <Image source={god.image} style={styles.godChipImage} contentFit="cover" transition={200} />
          ) : null}
          <View style={[styles.godChipOverlay, { backgroundColor: primaryColor + '20' }]} />
        </View>
        <View style={styles.godTextWrap}>
          <Text style={styles.godLabel}>恭請 {god?.name || '神明'} 降示</Text>
          <Text style={[styles.godBlessing, { color: highlightColor }]}>
            {god?.tagline || '神籤將現'}
          </Text>
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

        <Animated.View style={[styles.altarGlow, { transform: [{ translateY: altarFloat }] }]}>
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
                borderColor: highlightColor + '88',
                transform: [{ translateX }, { rotate }, { translateY: altarFloat }],
              },
            ]}
          >
            <View style={styles.qiantongLip} />
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
                        backgroundColor: isSelected ? highlightColor : '#E8D7B2',
                        borderColor: isSelected ? highlightColor : '#B08A54',
                      },
                      animatedStyle,
                    ]}
                  >
                    <View style={[styles.stickTip, { backgroundColor: isSelected ? primaryColor : '#AF5C2E' }]} />
                  </Animated.View>
                );
              })}
            </View>
            <Text style={styles.qiantongText}>籤</Text>
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

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: highlightColor }]} />
      </View>

      <Animated.View
        style={[
          styles.numberReveal,
          {
            borderColor: highlightColor + '66',
            opacity: numberOpacity,
            transform: [{ scale: numberScale }],
          },
        ]}
      >
        <Text style={styles.numberRevealLabel}>天定籤號</Text>
        <Text style={[styles.numberRevealValue, { color: highlightColor }]}>
          第 {poemNumber ?? '?'} 籤
        </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: TempleSpacing.lg,
  },
  title: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    marginBottom: TempleSpacing.xs,
  },
  subtitle: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    marginBottom: TempleSpacing.lg,
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
    backgroundColor: TempleTheme.bgCard,
  },
  godChipImage: { width: '100%', height: '100%' },
  godChipOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  godTextWrap: { maxWidth: 220 },
  godLabel: {
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: TempleTheme.textLight,
    marginBottom: 4,
  },
  godBlessing: {
    fontSize: TempleFonts.small,
    fontWeight: '600',
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
  altarGlow: {
    width: 200,
    height: 210,
    justifyContent: 'flex-end',
    alignItems: 'center',
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
    color: TempleTheme.goldLight,
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
    borderColor: TempleTheme.goldDark + '55',
  },
  progressTrack: {
    width: 220,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: TempleTheme.bgCard,
    marginBottom: TempleSpacing.lg,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  numberReveal: {
    minWidth: 170,
    backgroundColor: 'rgba(61,43,31,0.9)',
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: TempleSpacing.lg,
    paddingVertical: TempleSpacing.sm,
    alignItems: 'center',
    marginBottom: TempleSpacing.md,
  },
  numberRevealLabel: {
    fontSize: 11,
    color: TempleTheme.textMuted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  numberRevealValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  revealCard: {
    width: 260,
    backgroundColor: TempleTheme.bgCard,
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
    color: TempleTheme.textMuted,
    textAlign: 'center',
  },
});
