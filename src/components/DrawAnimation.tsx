// 抽籤動畫元件
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, PanResponder } from 'react-native';
import { Image } from 'expo-image';
import type { God } from '@/data/gods';
import { getGodSoftImage } from '@/data/godImages';
import { DRAW_ANIMATION_DEFAULT_MS } from '@/constants/divination';
import {
  drawAnimationStyles,
  getDrawAnimationRitualStyle,
  type DrawAnimationStyleKey,
  type ShakeMode,
} from '@/constants/draw-animation-styles';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { playDrawSound } from '@/services/proceduralSound';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { hashShakeTelemetry, type ShakeTelemetrySample } from '@/services/seededRandom';

const STICKS: readonly { left: number; rotate: string; height: number; selected?: boolean }[] = [
  { left: 8, rotate: '-12deg', height: 112 },
  { left: 24, rotate: '-6deg', height: 124 },
  { left: 42, rotate: '-2deg', height: 132 },
  { left: 61, rotate: '0deg', height: 146, selected: true },
  { left: 80, rotate: '3deg', height: 132 },
  { left: 98, rotate: '8deg', height: 122 },
  { left: 116, rotate: '12deg', height: 110 },
] as const;

const SELECTED_STICK_INDEX = STICKS.findIndex((stick) => stick.selected);

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
  // interactive：true 時籤枝不會自動跳出，使用者必須親自「搖籤筒」
  // （依 shakeMode 用拖曳或長按）才會決定籤詩、進入既有的開籤演出。
  interactive?: boolean;
  shakeMode?: ShakeMode;
  onShakeComplete?: (seed: number) => void;
}

export function DrawAnimation({
  god,
  poemNumber,
  durationMs = DRAW_ANIMATION_DEFAULT_MS,
  styleKey = 'bronze',
  lowMotion = false,
  soundEnabled = true,
  interactive = false,
  shakeMode = 'drag',
  onShakeComplete,
}: DrawAnimationProps) {
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = systemReducedMotion || lowMotion;
  const auraAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shakeEnvelope = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const chosenLiftAnim = useRef(new Animated.Value(0)).current;
  const chosenDropAnim = useRef(new Animated.Value(0)).current;
  const impactAnim = useRef(new Animated.Value(1)).current;
  const stickJitterAnims = useRef(STICKS.map(() => new Animated.Value(0))).current;
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

  // ── 互動搖籤前置階段（interactive）用的狀態 ──────────────────────
  // popped：使用者是否已經把籤枝搖出來了。非互動模式一律視為已跳出，
  // 完全維持原本自動播放的行為。
  const [popped, setPopped] = useState(!interactive);
  const energyRef = useRef(0);
  const thresholdRef = useRef(0.55 + Math.random() * 0.35);
  const telemetryRef = useRef<ShakeTelemetrySample[]>([]);
  const phaseStartRef = useRef(Date.now());
  const dragAccumRef = useRef(0);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const isPressedRef = useRef(false);
  const holdStreakRef = useRef(0);
  const peekMilestonesRef = useRef({ p1: false, p2: false });

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

  // 香爐光暈與浮動屬於裝飾性動畫，跟「有沒有搖籤筒」無關，
  // 全程（含互動搖籤前置階段）持續播放，避免搖籤/開籤切換時重啟造成跳動。
  useEffect(() => {
    if (reducedMotion) {
      auraAnim.setValue(0.45);
      floatAnim.setValue(0);
      return;
    }
    const auraLoop = Animated.loop(
      Animated.timing(auraAnim, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
    );
    const floatLoop = Animated.loop(
      Animated.timing(floatAnim, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
    );
    auraLoop.start();
    floatLoop.start();
    return () => {
      auraLoop.stop();
      floatLoop.stop();
    };
  }, [auraAnim, floatAnim, reducedMotion]);

  // 互動搖籤前置階段：等使用者親自搖出籤枝（拖曳或長按皆會累積「晃動能量」），
  // 達到隨機門檻才把操作遙測雜湊成種子，交給下面的開籤演出。
  useEffect(() => {
    if (!interactive || popped) return;

    if (reducedMotion) {
      onShakeComplete?.(hashShakeTelemetry([{ t: 0, effort: 1 }]));
      setPopped(true);
      return;
    }

    phaseStartRef.current = Date.now();
    energyRef.current = 0;
    thresholdRef.current = 0.55 + Math.random() * 0.35;
    telemetryRef.current = [];
    peekMilestonesRef.current = { p1: false, p2: false };
    holdStreakRef.current = 0;
    shakeEnvelope.setValue(0);
    setPhaseIndex(0);

    const idleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: motion.shakeDuration, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: motion.shakeDuration, easing: Easing.linear, useNativeDriver: true }),
      ])
    );
    idleLoop.start();

    const tick = setInterval(() => {
      let effort = 0;
      if (shakeMode === 'hold') {
        if (isPressedRef.current) {
          holdStreakRef.current += 1;
          effort = 0.05 + Math.min(holdStreakRef.current, 20) * 0.004;
        } else {
          holdStreakRef.current = 0;
          effort = -0.03;
        }
      } else {
        const moved = dragAccumRef.current;
        dragAccumRef.current = 0;
        effort = moved > 0 ? Math.min(0.16, moved / 260) : -0.025;
      }

      energyRef.current = Math.max(0, energyRef.current + effort);
      telemetryRef.current.push({ t: Date.now() - phaseStartRef.current, effort });
      if (telemetryRef.current.length > 400) telemetryRef.current.shift();

      const envelope = Math.min(1, energyRef.current / thresholdRef.current);
      shakeEnvelope.setValue(envelope);
      progressAnim.setValue(envelope);

      if (!peekMilestonesRef.current.p1 && envelope >= 0.35) {
        peekMilestonesRef.current.p1 = true;
        setPhaseIndex(1);
        Animated.sequence([
          Animated.timing(chosenLiftAnim, { toValue: 0.22, duration: 130, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(chosenLiftAnim, { toValue: 0.03, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]).start();
      }
      if (!peekMilestonesRef.current.p2 && envelope >= 0.68) {
        peekMilestonesRef.current.p2 = true;
        setPhaseIndex(2);
        Animated.sequence([
          Animated.timing(chosenLiftAnim, { toValue: 0.4, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(chosenLiftAnim, { toValue: 0.08, duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]).start();
      }

      if (energyRef.current >= thresholdRef.current) {
        clearInterval(tick);
        idleLoop.stop();
        const seed = hashShakeTelemetry(telemetryRef.current);
        onShakeComplete?.(seed);
        setPopped(true);
      }
    }, 110);

    return () => {
      clearInterval(tick);
      idleLoop.stop();
    };
  }, [interactive, popped, reducedMotion, shakeMode, motion.shakeDuration, onShakeComplete, chosenLiftAnim, shakeAnim, shakeEnvelope, progressAnim]);

  useEffect(() => {
    if (interactive && !popped) return;
    if (soundEnabled) {
      playDrawSound();
    }
    if (reducedMotion) {
      setPhaseIndex(PHASES.length - 1);
      auraAnim.setValue(0.45);
      shakeAnim.setValue(0);
      shakeEnvelope.setValue(0);
      floatAnim.setValue(0);
      chosenLiftAnim.setValue(1);
      chosenDropAnim.setValue(1);
      impactAnim.setValue(1);
      stickJitterAnims.forEach((anim) => anim.setValue(0));
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
    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: motion.shakeDuration, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: motion.shakeDuration, easing: Easing.linear, useNativeDriver: true }),
      ]),
      { iterations: motion.shakeIterations }
    );
    // 每支未中籤的籤枝各自用不同節奏小幅晃動，讓籤筒看起來像一把籤枝互相碰撞，
    // 而不是整塊硬殼平移。
    const jitterLoops = stickJitterAnims.map((anim, index) => {
      if (index === SELECTED_STICK_INDEX) return null;
      const base = 76 + index * 19;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: base, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(anim, { toValue: -0.8, duration: base + 34, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: base - 12, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: base + 18, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      );
    });

    // 若是互動搖籤流程，籤枝在前置階段已經跳出來了，這裡的 progress bar
    // 改用來表示「開籤演出」本身的進度，所以要從 0 重新開始。
    progressAnim.setValue(0);
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

    if (interactive) {
      // 前置階段已經用搖籤能量把 phaseIndex 帶到 2（天意已定），
      // 這裡直接進到最後一句「聖示將明」。
      setPhaseIndex(3);
    } else {
      timers.push(setTimeout(() => setPhaseIndex(1), ms * 0.22));
      timers.push(setTimeout(() => setPhaseIndex(2), ms * 0.57));
      timers.push(setTimeout(() => setPhaseIndex(3), ms * 0.8));
      // 非互動（自動播放）才需要重新演一次搖籤筒的劇本；互動模式的搖晃
      // 已經是使用者剛剛真的做過的動作，籤枝跳出後不需要再搖一次。
      timers.push(setTimeout(() => {
        shakeLoop.start();
        jitterLoops.forEach((loop) => loop?.start());
        // 搖晃力道由靜到動漸強，而不是一開始就全力晃動。
        Animated.timing(shakeEnvelope, {
          toValue: 1,
          duration: ms * 0.3,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }, ms * 0.16));
    }
    // 天意欲出：籤枝先探頭一下又縮回，製造「快掉出來」的懸念，
    // 再真正彈出、用彈簧效果自然回彈落定。
    timers.push(setTimeout(() => {
      Animated.sequence([
        Animated.timing(chosenLiftAnim, { toValue: 0.24, duration: ms * 0.045, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(chosenLiftAnim, { toValue: 0.04, duration: ms * 0.05, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, ms * 0.31));
    timers.push(setTimeout(() => {
      Animated.sequence([
        Animated.timing(chosenLiftAnim, {
          toValue: 1,
          duration: ms * 0.17,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(chosenDropAnim, {
          toValue: 1,
          friction: 6,
          tension: 55,
          useNativeDriver: true,
        }),
      ]).start();
      Animated.sequence([
        Animated.timing(impactAnim, { toValue: 0.97, duration: 70, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(impactAnim, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
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
      shakeLoop.stop();
      jitterLoops.forEach((loop) => loop?.stop());
    };
  }, [interactive, popped, auraAnim, chosenDropAnim, chosenLiftAnim, flashAnim, flipAnim, floatAnim, impactAnim, motion.dropDistance, motion.liftDistance, motion.shakeDuration, motion.shakeIterations, ms, numberOpacity, numberScale, paperAnim, progressAnim, reducedMotion, revealOpacity, revealTranslate, shakeAnim, shakeEnvelope, soundEnabled, stickJitterAnims]);

  // shakeEnergy = shakeAnim(-1..1) 乘上 shakeEnvelope(0..1)，讓晃動力道從無到有
  // 漸強，而不是一開始就等幅擺動。
  const shakeEnergy = useMemo(
    () => Animated.multiply(shakeAnim, shakeEnvelope),
    [shakeAnim, shakeEnvelope]
  );

  const translateX = useMemo(() => shakeEnergy.interpolate({
    inputRange: [-1, 1],
    outputRange: [-motion.shakeAmplitude, motion.shakeAmplitude],
  }), [shakeEnergy, motion.shakeAmplitude]);

  const rotate = useMemo(() => shakeEnergy.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  }), [shakeEnergy]);


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

  // 中籤的籤枝墜落時會左右擺動、翻轉幾下才定住，而不是筆直落下。
  const chosenStickRotate = useMemo(() => chosenDropAnim.interpolate({
    inputRange: [0, 0.4, 0.7, 1],
    outputRange: ['0deg', '26deg', '10deg', '18deg'],
  }), [chosenDropAnim]);

  const chosenStickTranslateX = useMemo(() => chosenDropAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 9, -5],
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

  const isShaking = interactive && !popped;

  // 拖曳模式跟長按模式共用同一個 PanResponder：
  // - PanResponder 底層同時支援滑鼠與觸控（react-native-web 上兩者都會走 Responder 系統），
  //   如果拖曳跟長按各自只接原生的 mouse/touch 事件，會在特定平台上完全失效（例如長按若只接
  //   onTouchStart，滑鼠使用者在網頁版就永遠按不動）。
  // - 拖曳模式：手指前後來回移動的距離會累積「晃動能量」。
  // - 長按模式：只在乎「有沒有按住」，用 grant/release 切換 isPressedRef。
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => isShaking,
    onMoveShouldSetPanResponder: () => isShaking,
    onPanResponderGrant: (evt) => {
      isPressedRef.current = true;
      lastTouchRef.current = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
    },
    onPanResponderMove: (evt) => {
      if (shakeMode !== 'drag') return;
      const { pageX, pageY } = evt.nativeEvent;
      if (lastTouchRef.current) {
        const dx = pageX - lastTouchRef.current.x;
        const dy = pageY - lastTouchRef.current.y;
        dragAccumRef.current += Math.hypot(dx, dy);
      }
      lastTouchRef.current = { x: pageX, y: pageY };
    },
    onPanResponderRelease: () => { isPressedRef.current = false; lastTouchRef.current = null; },
    onPanResponderTerminate: () => { isPressedRef.current = false; lastTouchRef.current = null; },
  }), [shakeMode, isShaking]);
  const shakeTouchHandlers = panResponder.panHandlers;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>抽籤中</Text>
      <Text style={styles.subtitle}>{activePhase}</Text>
      {isShaking ? (
        <Text style={[styles.shakeInstruction, { color: highlightColor }]}>
          {shakeMode === 'drag' ? '按住籤筒，前後來回搖晃' : '按住籤筒不放，讓它越搖越用力'}
        </Text>
      ) : null}
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
            {...(isShaking ? shakeTouchHandlers : {})}
            style={[
              styles.qiantong,
              {
                backgroundColor: ritualStyle.censer.body,
                borderColor: ritualStyle.censer.border,
                transform: [{ translateX }, { rotate }, { translateY: altarFloat }, { scale: impactAnim }],
              },
            ]}
          >
            <View style={[styles.qiantongLip, { backgroundColor: ritualStyle.censer.lip }]} />
            <View style={styles.sticksRow}>
              {STICKS.map((stick, index) => {
                const isSelected = Boolean(stick.selected);
                const jitter = stickJitterAnims[index];
                const animatedStyle = isSelected ? {
                  transform: [
                    { rotate: stick.rotate },
                    { translateY: chosenStickTranslateY },
                    { translateX: chosenStickTranslateX },
                    { rotate: chosenStickRotate },
                  ],
                } : {
                  transform: [
                    { rotate: stick.rotate },
                    {
                      rotate: Animated.multiply(jitter, shakeEnvelope).interpolate({
                        inputRange: [-1, 1],
                        outputRange: ['-3deg', '3deg'],
                      }),
                    },
                    {
                      translateY: Animated.multiply(jitter, shakeEnvelope).interpolate({
                        inputRange: [-1, 1],
                        outputRange: [-3, 3],
                      }),
                    },
                  ],
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
  shakeInstruction: {
    fontSize: TempleFonts.small,
    fontWeight: '700',
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
