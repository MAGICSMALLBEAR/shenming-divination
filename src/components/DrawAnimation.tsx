// 抽籤動畫元件
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, PanResponder, Platform, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import type { God } from '@/data/gods';
import { getGodSoftImage } from '@/data/godImages';
import { DRAW_ANIMATION_DEFAULT_MS } from '@/constants/divination';
import { DRAW_TIMELINE } from '@/constants/draw-timeline';
import {
  drawAnimationStyles,
  getDrawAnimationRitualStyle,
  type DrawAnimationStyleKey,
  type ShakeMode,
} from '@/constants/draw-animation-styles';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { playDrawSound, playStickClack } from '@/services/proceduralSound';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { hashShakeTelemetry, type ShakeTelemetrySample } from '@/services/seededRandom';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

interface StickDefinition {
  left: number;
  rotate: string;
  height: number;
  depth: 'back' | 'middle' | 'front';
  width: number;
  selected?: boolean;
}

const STICKS: readonly StickDefinition[] = Array.from({ length: 19 }, (_, index) => {
  const column = index % 10;
  const depthIndex = Math.floor(index / 7);
  const depth: StickDefinition['depth'] = depthIndex === 0 ? 'back' : depthIndex === 1 ? 'middle' : 'front';
  const selected = index === 9;
  return {
    left: 5 + column * 14.2 + (depthIndex % 2) * 3,
    rotate: String(((index * 7) % 19) - 9) + 'deg',
    height: selected ? 150 : 105 + ((index * 17) % 38),
    depth,
    width: depth === 'front' ? 10 : 9,
    selected,
  };
});

const SELECTED_STICK_INDEX = STICKS.findIndex((stick) => stick.selected);

const PHASES = [
  '誠心默念，神意匯聚',
  '籤筒漸動，靈籤浮起',
  '天意已定，靈籤出筒',
  '靈籤飛落供桌',
  '靈籤落定，翻面示號',
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
  onComplete?: () => void;
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
  onComplete,
}: DrawAnimationProps) {
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = systemReducedMotion || lowMotion;
  const auraAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shakeEnvelope = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const chosenLiftAnim = useRef(new Animated.Value(0)).current;
  const chosenDropAnim = useRef(new Animated.Value(0)).current;
  const impactAnim = useRef(new Animated.Value(0)).current;
  const cylinderRecoilAnim = useRef(new Animated.Value(0)).current;
  const stickJitterAnims = useRef(STICKS.map(() => new Animated.Value(0))).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const revealTranslate = useRef(new Animated.Value(16)).current;
  const numberOpacity = useRef(new Animated.Value(0)).current;
  const numberScale = useRef(new Animated.Value(0.84)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const paperAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const flightAnim = useRef(new Animated.Value(0)).current;
  const flightFlipAnim = useRef(new Animated.Value(0)).current;
  const flightExitAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const particleProgress = useRef(new Animated.Value(0)).current;
  const beamOpacity = useRef(new Animated.Value(0)).current;
  const ringExpandScale = useRef(new Animated.Value(0)).current;
  const ringExpandOpacity = useRef(new Animated.Value(0)).current;
  const phaseTextOpacity = useRef(new Animated.Value(1)).current;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const prevPhaseRef = useRef(0);
  const [displayPhase, setDisplayPhase] = useState(PHASES[interactive ? 0 : 0]);
  const [trackWidth, setTrackWidth] = useState(220);
  const [effortHint, setEffortHint] = useState('捧穩籤筒，緩緩來回搖動');
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // ── 金色粒子配置（僅在搖籤階段顯示）──────────────────────────────
  const particles = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    x: (Math.random() - 0.5) * 110,
    size: 2 + Math.random() * 4,
    baseDelay: i / 18,
    speed: 0.55 + Math.random() * 1.3,
    color: Math.random() > 0.3 ? '#FFD700' : (Math.random() > 0.5 ? '#FFC200' : '#FFEAA0'),
  })), []);

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
  const lastClackRef = useRef(0);
  const completedRef = useRef(false);

  const highlightColor = god?.accentColor || theme.goldLight;
  const primaryColor = god?.primaryColor || theme.redLight;
  const auraColor = god?.auraColor || '#F4D39B';
  const drawStyle = drawAnimationStyles[styleKey];
  const ritualStyle = getDrawAnimationRitualStyle(styleKey);
  const motion = drawStyle.motion;
  const ms = Math.max(durationMs, 2600);
  const softImage = getGodSoftImage(god?.id);

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
      Animated.timing(auraAnim, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE_DRIVER })
    );
    const floatLoop = Animated.loop(
      Animated.timing(floatAnim, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE_DRIVER })
    );
    auraLoop.start();
    floatLoop.start();
    return () => {
      auraLoop.stop();
      floatLoop.stop();
    };
  }, [auraAnim, floatAnim, reducedMotion]);

  // ── 金色粒子循環 ─────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion) return;
    const particleLoop = Animated.loop(
      Animated.timing(particleProgress, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: USE_NATIVE_DRIVER })
    );
    particleLoop.start();
    return () => particleLoop.stop();
  }, [particleProgress, reducedMotion]);

  // ── 階段文字淡入淡出 ────────────────────────────────────────────
  useEffect(() => {
    if (phaseIndex === prevPhaseRef.current) return;
    prevPhaseRef.current = phaseIndex;
    phaseTextOpacity.setValue(0);
    setDisplayPhase(PHASES[phaseIndex] || PHASES[PHASES.length - 1]);
    Animated.timing(phaseTextOpacity, {
      toValue: 1,
      duration: reducedMotion ? 0 : 280,
      easing: Easing.out(Easing.quad),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [phaseIndex, reducedMotion, phaseTextOpacity]);

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
        Animated.timing(shakeAnim, { toValue: 1, duration: motion.shakeDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(shakeAnim, { toValue: -1, duration: motion.shakeDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE_DRIVER }),
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
      const now = Date.now();
      if (soundEnabled && effort > 0.025 && now - lastClackRef.current > 420) {
        lastClackRef.current = now;
        playStickClack(envelope).catch(() => {});
      }
      shakeEnvelope.setValue(envelope);
      progressAnim.setValue(envelope);

      if (envelope < 0.18) setEffortHint(effort > 0 ? '很好，保持來回的節奏' : '請按住籤筒開始搖動');
      else if (envelope < 0.62) setEffortHint('節奏正好，請繼續');
      else setEffortHint('靈籤漸起，保持平穩');

      if (!peekMilestonesRef.current.p1 && envelope >= 0.35) {
        peekMilestonesRef.current.p1 = true;
        setPhaseIndex(1);
        Haptics.selectionAsync().catch(() => {});
        Animated.sequence([
          Animated.timing(chosenLiftAnim, { toValue: 0.22, duration: 130, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(chosenLiftAnim, { toValue: 0.03, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
        ]).start();
      }
      if (!peekMilestonesRef.current.p2 && envelope >= 0.68) {
        peekMilestonesRef.current.p2 = true;
        setPhaseIndex(2);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        Animated.sequence([
          Animated.timing(chosenLiftAnim, { toValue: 0.4, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(chosenLiftAnim, { toValue: 0.08, duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
        ]).start();
      }

      if (energyRef.current >= thresholdRef.current) {
        clearInterval(tick);
        idleLoop.stop();
        const seed = hashShakeTelemetry(telemetryRef.current);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onShakeComplete?.(seed);
        setPopped(true);
      }
    }, 110);

    return () => {
      clearInterval(tick);
      idleLoop.stop();
    };
  }, [interactive, popped, reducedMotion, shakeMode, motion.shakeDuration, onShakeComplete, chosenLiftAnim, shakeAnim, shakeEnvelope, progressAnim]);



  // 互動搖籤前置階段：等使用者親自搖出籤枝（拖曳或長按皆會累積「晃動能量」），
  // 達到隨機門檻才把操作遙測雜湊成種子，交給下面的開籤演出。
  useEffect(() => {
    if (interactive && !popped) return;
    completedRef.current = false;
    if (soundEnabled) playDrawSound();

    if (reducedMotion) {
      setPhaseIndex(PHASES.length - 1);
      auraAnim.setValue(0.45);
      shakeAnim.setValue(0);
      shakeEnvelope.setValue(0);
      floatAnim.setValue(0);
      chosenLiftAnim.setValue(1);
      chosenDropAnim.setValue(1);
      impactAnim.setValue(0);
      cylinderRecoilAnim.setValue(0);
      stickJitterAnims.forEach((anim) => anim.setValue(0));
      revealOpacity.setValue(1);
      revealTranslate.setValue(0);
      numberOpacity.setValue(1);
      numberScale.setValue(1);
      flashAnim.setValue(0);
      beamOpacity.setValue(0);
      ringExpandScale.setValue(0);
      ringExpandOpacity.setValue(1);
      paperAnim.setValue(1);
      flipAnim.setValue(1);
      flightAnim.setValue(1);
      flightFlipAnim.setValue(1);
      flightExitAnim.setValue(1);
      progressAnim.setValue(1);
      const reducedTimer = setTimeout(() => {
        if (!completedRef.current) { completedRef.current = true; onComplete?.(); }
      }, 0);
      return () => clearTimeout(reducedTimer);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: motion.shakeDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(shakeAnim, { toValue: -1, duration: motion.shakeDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE_DRIVER }),
      ]),
      { iterations: motion.shakeIterations }
    );
    const jitterLoops = stickJitterAnims.map((anim, index) => {
      if (index === SELECTED_STICK_INDEX || index % 2 === 1 || STICKS[index].depth === 'back') return null;
      const base = 84 + index * 17;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: base, easing: Easing.inOut(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(anim, { toValue: -0.8, duration: base + 34, easing: Easing.inOut(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(anim, { toValue: 0.3, duration: base - 12, easing: Easing.inOut(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(anim, { toValue: 0, duration: base + 18, easing: Easing.inOut(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
        ])
      );
    });

    progressAnim.setValue(0);
    Animated.timing(progressAnim, { toValue: 1, duration: ms * DRAW_TIMELINE.finish, easing: Easing.linear, useNativeDriver: USE_NATIVE_DRIVER }).start();
    chosenLiftAnim.setValue(interactive ? 0.08 : 0);
    chosenDropAnim.setValue(0);
    impactAnim.setValue(0);
    cylinderRecoilAnim.setValue(0);
    revealOpacity.setValue(0);
    revealTranslate.setValue(16);
    numberOpacity.setValue(0);
    numberScale.setValue(0.84);
    flashAnim.setValue(0);
    beamOpacity.setValue(0);
    ringExpandScale.setValue(0);
    ringExpandOpacity.setValue(1);
    paperAnim.setValue(0);
    flipAnim.setValue(0);
    flightAnim.setValue(0);
    flightFlipAnim.setValue(0);
    flightExitAnim.setValue(0);
    setPhaseIndex(interactive ? 1 : 0);

    if (!interactive) {
      timers.push(setTimeout(() => {
        setPhaseIndex(1);
        shakeLoop.start();
        jitterLoops.forEach((loop) => loop?.start());
        Animated.timing(shakeEnvelope, {
          toValue: 1, duration: ms * 0.24, easing: Easing.in(Easing.cubic), useNativeDriver: USE_NATIVE_DRIVER,
        }).start();
      }, ms * DRAW_TIMELINE.shakeStart));
      timers.push(setTimeout(() => {
        Animated.sequence([
          Animated.timing(chosenLiftAnim, { toValue: 0.24, duration: ms * 0.045, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(chosenLiftAnim, { toValue: 0.04, duration: ms * 0.05, easing: Easing.in(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
        ]).start();
      }, ms * DRAW_TIMELINE.peek));
    } else {
      Animated.parallel([
        Animated.timing(shakeEnvelope, { toValue: 0, duration: ms * 0.12, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(shakeAnim, { toValue: 0, duration: ms * 0.12, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
      ]).start();
    }

    timers.push(setTimeout(() => {
      setPhaseIndex(2);
      shakeLoop.stop();
      jitterLoops.forEach((loop) => loop?.stop());
      Animated.parallel([
        Animated.timing(shakeEnvelope, { toValue: 0, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
      ]).start();
      // 神光從上方照射
      Animated.timing(beamOpacity, { toValue: 1, duration: ms * 0.12, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }).start();
      // 籤筒反作用力：籤枝射出時筒身微微下沉（牛頓第三定律）
      Animated.sequence([
        Animated.timing(cylinderRecoilAnim, { toValue: -6, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.spring(cylinderRecoilAnim, { toValue: 0, friction: 6, tension: 140, useNativeDriver: USE_NATIVE_DRIVER }),
      ]).start();
      Animated.sequence([
        Animated.timing(chosenLiftAnim, { toValue: 1, duration: ms * 0.1, easing: Easing.out(Easing.cubic), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(flightAnim, { toValue: 1, duration: ms * 0.25, easing: Easing.inOut(Easing.cubic), useNativeDriver: USE_NATIVE_DRIVER }),
      ]).start(({ finished }) => {
        if (!finished) return;
        setPhaseIndex(4);
        playStickClack(1).catch(() => {});
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        Animated.sequence([
          Animated.timing(impactAnim, { toValue: 1, duration: 65, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.spring(impactAnim, { toValue: 0, friction: 5, tension: 150, useNativeDriver: USE_NATIVE_DRIVER }),
        ]).start();
      });
    }, ms * DRAW_TIMELINE.launch));
    timers.push(setTimeout(() => setPhaseIndex(3), ms * DRAW_TIMELINE.flight));
    timers.push(setTimeout(() => {
      Animated.timing(flightFlipAnim, { toValue: 1, duration: ms * 0.14, easing: Easing.inOut(Easing.cubic), useNativeDriver: USE_NATIVE_DRIVER }).start();
    }, ms * DRAW_TIMELINE.land));
    timers.push(setTimeout(() => {
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: ms * 0.04, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(flashAnim, { toValue: 0, duration: ms * 0.12, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
      ]).start();
      // 神光淡出 + 擴散光圈
      Animated.parallel([
        Animated.timing(beamOpacity, { toValue: 0, duration: ms * 0.14, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(ringExpandScale, { toValue: 1, duration: ms * 0.2, easing: Easing.out(Easing.cubic), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(ringExpandOpacity, { toValue: 0, duration: ms * 0.2, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
      ]).start();
    }, ms * DRAW_TIMELINE.flash));

    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(flightExitAnim, { toValue: 1, duration: ms * DRAW_TIMELINE.flyingExitDuration, easing: Easing.in(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(paperAnim, { toValue: 1, duration: ms * 0.14, easing: Easing.out(Easing.back(1.25)), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(flipAnim, { toValue: 1, duration: ms * DRAW_TIMELINE.paperFlipDuration, easing: Easing.inOut(Easing.cubic), useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.sequence([
          Animated.delay(ms * DRAW_TIMELINE.numberDelay),
          Animated.parallel([
            Animated.timing(numberOpacity, { toValue: 1, duration: ms * DRAW_TIMELINE.finalRevealDuration, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
            Animated.spring(numberScale, { toValue: 1, tension: 90, friction: 8, useNativeDriver: USE_NATIVE_DRIVER }),
          ]),
        ]),
      ]).start(({ finished }) => {
        if (!finished) return;
        Animated.parallel([
          Animated.timing(revealOpacity, { toValue: 1, duration: ms * DRAW_TIMELINE.finalRevealDuration, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
          Animated.timing(revealTranslate, { toValue: 0, duration: ms * DRAW_TIMELINE.finalRevealDuration, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }),
        ]).start(({ finished: revealFinished }) => {
          if (!revealFinished || completedRef.current) return;
          completedRef.current = true;
          onComplete?.();
        });
      });
    }, ms * DRAW_TIMELINE.handoff));

    return () => {
      timers.forEach(clearTimeout);
      shakeLoop.stop();
      jitterLoops.forEach((loop) => loop?.stop());
    };
  }, [interactive, popped, onComplete, auraAnim, chosenDropAnim, chosenLiftAnim, cylinderRecoilAnim, flashAnim, flightAnim, flightExitAnim, flightFlipAnim, flipAnim, floatAnim, impactAnim, motion.shakeDuration, motion.shakeIterations, ms, numberOpacity, numberScale, paperAnim, progressAnim, reducedMotion, revealOpacity, revealTranslate, shakeAnim, shakeEnvelope, soundEnabled, stickJitterAnims]);
  // shakeEnergy = shakeAnim(-1..1) 乘上 shakeEnvelope(0..1)，讓晃動力道從無到有
  // 漸強，而不是一開始就等幅擺動。
  const shakeEnergy = useMemo(
    () => Animated.multiply(shakeAnim, shakeEnvelope),
    [shakeAnim, shakeEnvelope]
  );

  // 主要晃動改為上下（垂直彈跳），左右搖擺僅保留輕微的自然手晃。
  const translateY = useMemo(() => shakeEnergy.interpolate({
    inputRange: [-1, 1],
    outputRange: [8, -12],
  }), [shakeEnergy]);

  const translateX = useMemo(() => shakeEnergy.interpolate({
    inputRange: [-1, 1],
    outputRange: [-motion.shakeAmplitude * 0.25, motion.shakeAmplitude * 0.25],
  }), [shakeEnergy, motion.shakeAmplitude]);

  const rotate = useMemo(() => shakeEnergy.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-2deg', '3deg'],
  }), [shakeEnergy]);

  // 選中籤枝隨著搖晃力道逐漸浮出籤筒口
  const chosenPeekTranslateY = useMemo(() => shakeEnvelope.interpolate({
    inputRange: [0, 0.35, 0.7, 1],
    outputRange: [0, -8, -20, -34],
    extrapolate: 'clamp',
  }), [shakeEnvelope]);


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

  const ringScale = useMemo(() => ringExpandScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 2.8],
  }), [ringExpandScale]);

  const ringOpacity = useMemo(() => ringExpandOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0],
  }), [ringExpandOpacity]);

  // 粒子容器只在搖動時顯示
  const particleContainerOpacity = useMemo(() => shakeEnvelope.interpolate({
    inputRange: [0, 0.08, 1],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  }), [shakeEnvelope]);

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

  const flightExitOpacity = useMemo(() => flightExitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  }), [flightExitAnim]);

  const flyingStickOpacity = useMemo(() => Animated.multiply(
    flightAnim.interpolate({ inputRange: [0, 0.04, 1], outputRange: [0, 1, 1] }),
    flightExitOpacity
  ), [flightAnim, flightExitOpacity]);

  const landingBounceY = useMemo(() => impactAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  }), [impactAnim]);

  // 籤筒垂直位移 = 主彈跳 + 供桌浮動 + 籤枝射出時的反作用力
  const cylinderTranslateY = useMemo(() =>
    Animated.add(
      Animated.add(translateY, altarFloat),
      cylinderRecoilAnim
    ),
    [translateY, altarFloat, cylinderRecoilAnim]
  );

  const flyingShadowOpacity = useMemo(() => Animated.multiply(
    flightAnim.interpolate({ inputRange: [0, 0.45, 0.82, 1], outputRange: [0, 0.08, 0.28, 0.5] }),
    flightExitOpacity
  ), [flightAnim, flightExitOpacity]);
  const flyingShadowScaleX = useMemo(() => flightAnim.interpolate({
    inputRange: [0, 0.45, 0.82, 1], outputRange: [0.35, 0.55, 1.15, 1.35],
  }), [flightAnim]);
  const flyingShadowScaleY = useMemo(() => impactAnim.interpolate({
    inputRange: [0, 1], outputRange: [1, 0.58],
  }), [impactAnim]);
  const flyingStickX = useMemo(() => flightAnim.interpolate({
    inputRange: [0, 0.42, 1],
    outputRange: [0, 22, -12],
  }), [flightAnim]);

  const flyingStickY = useMemo(() => flightAnim.interpolate({
    inputRange: [0, 0.38, 0.82, 1],
    outputRange: [0, -48, 118, 126],
  }), [flightAnim]);

  const flyingStickRotate = useMemo(() => flightAnim.interpolate({
    inputRange: [0, 0.4, 0.82, 1],
    outputRange: ['0deg', '30deg', '96deg', '90deg'],
  }), [flightAnim]);

  const flyingStickScale = useMemo(() => flightAnim.interpolate({
    inputRange: [0, 0.45, 0.88, 1],
    outputRange: [1, 1.08, 0.98, 1],
  }), [flightAnim]);

  const flyingStickFlip = useMemo(() => flightFlipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '180deg'],
  }), [flightFlipAnim]);

  const flyingNumberOpacity = useMemo(() => flightFlipAnim.interpolate({
    inputRange: [0, 0.54, 0.72, 1],
    outputRange: [0, 0, 1, 1],
  }), [flightFlipAnim]);

  const selectedIn筒Opacity = useMemo(() => flightAnim.interpolate({
    inputRange: [0, 0.06, 1],
    outputRange: [1, 0, 0],
  }), [flightAnim]);

  const chosenTotalTranslateY = useMemo(() =>
    Animated.add(chosenStickTranslateY, chosenPeekTranslateY),
    [chosenStickTranslateY, chosenPeekTranslateY]
  );

  const stickAnimatedStyles = useMemo(() => STICKS.map((stick, index) => {
    if (stick.selected) {
      return {
        opacity: selectedIn筒Opacity,
        transform: [
          { rotate: stick.rotate },
          { translateY: chosenTotalTranslateY },
          { translateX: chosenStickTranslateX },
          { rotate: chosenStickRotate },
        ],
      };
    }
    const jitterEnergy = Animated.multiply(stickJitterAnims[index], shakeEnvelope);
    return {
      transform: [
        { rotate: stick.rotate },
        { translateY: jitterEnergy.interpolate({ inputRange: [-1, 1], outputRange: [6, -4] }) },
      ],
    };
  }), [chosenStickRotate, chosenStickTranslateX, chosenTotalTranslateY, selectedIn筒Opacity, shakeEnvelope, stickJitterAnims]);
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!isShaking}
    >
      <Text style={styles.title}>抽籤中</Text>
      <Animated.Text style={[styles.subtitle, { opacity: phaseTextOpacity }]}>
        ◈ {displayPhase} ◈
      </Animated.Text>
      {isShaking ? (
        <Text style={[styles.shakeInstruction, { color: highlightColor }]}>
          {shakeMode === 'drag' ? effortHint : '按住籤筒不放，讓它越搖越用力'}
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
        {/* 暈影覆蓋層 */}
        <View style={styles.vignette} pointerEvents="none" />
        {/* 神光從天而降 */}
        <Animated.View
          pointerEvents="none"
          style={[styles.lightBeam, { opacity: beamOpacity }]}
        >
          <View style={[styles.lightBeamGlow, { backgroundColor: highlightColor + '12' }]} />
          <View style={[styles.lightBeamCore, { backgroundColor: highlightColor + '28' }]} />
        </Animated.View>
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
        <Animated.View
          pointerEvents="none"
          style={[
            styles.expandRing,
            {
              borderColor: highlightColor + '88',
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />

        {/* 金色粒子 */}
        <Animated.View
          pointerEvents="none"
          style={[styles.particleContainer, { opacity: particleContainerOpacity }]}
        >
          {particles.map((p, i) => {
            const particleY = particleProgress.interpolate({
              inputRange: [p.baseDelay, Math.min(1, p.baseDelay + 0.28 * p.speed)],
              outputRange: [0, -90],
              extrapolate: 'clamp',
            });
            const particleOpacity = particleProgress.interpolate({
              inputRange: [p.baseDelay, p.baseDelay + 0.04, Math.min(1, p.baseDelay + 0.24 * p.speed), Math.min(1, p.baseDelay + 0.28 * p.speed)],
              outputRange: [0, 1, 1, 0],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.particle,
                  {
                    width: p.size,
                    height: p.size,
                    borderRadius: p.size / 2,
                    backgroundColor: p.color,
                    left: p.x + 75,
                    opacity: particleOpacity,
                    transform: [{ translateY: particleY }],
                  },
                ]}
              />
            );
          })}
        </Animated.View>

        <Animated.View style={[styles.altarGlow, { transform: [{ translateY: altarFloat }] }]}>

          <View style={styles.stickShadowRow}>
            {STICKS.filter((_, index) => index % 2 === 0).map((stick, index) => (
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

          <View style={styles.contactShadow} />
          <Animated.View
            {...(isShaking ? shakeTouchHandlers : {})}
            style={[
              styles.qiantong,
              {
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                transform: [{ translateX }, { rotate }, { translateY: cylinderTranslateY }],
              },
            ]}
          >
            <Image
              source={ritualStyle.censer.realisticHolderSprite}
              style={styles.realisticHolder}
              contentFit={'fill'}
              cachePolicy="memory-disk"
            />
            <View style={[styles.qiantongInner, { backgroundColor: ritualStyle.censer.border }]} />
            <View style={styles.sticksRow}>
              {STICKS.map((stick, index) => {
                const isSelected = Boolean(stick.selected);
                const animatedStyle = stickAnimatedStyles[index];
                return (
                  <Animated.View
                    key={`${stick.left}-${index}`}
                    style={[
                      styles.stick,
                      {
                        left: stick.left,
                        height: stick.height,
                        width: stick.width,
                        opacity: stick.depth === 'back' ? 0.72 : stick.depth === 'middle' ? 0.88 : 1,
                        zIndex: isSelected ? 40 : stick.depth === 'front' ? 30 : stick.depth === 'middle' ? 20 : 10,
                        backgroundColor: 'transparent',
                        borderColor: 'transparent',
                      },
                      animatedStyle,
                    ]}
                  >
                    <Image
                      source={ritualStyle.censer.realisticStickSprite}
                      style={styles.realisticStick}
                      contentFit={'fill'}
              cachePolicy="memory-disk"
                    />
                  </Animated.View>
                );
              })}
            </View>
            <View style={[styles.qiantongLip, { backgroundColor: ritualStyle.censer.lip }]} />
            <View style={[styles.qiantongSheen, { borderColor: ritualStyle.censer.accent + '55' }]} />

          </Animated.View>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[styles.flyingGroundShadow, { opacity: flyingShadowOpacity, transform: [{ scaleX: flyingShadowScaleX }, { scaleY: flyingShadowScaleY }] }]}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.flyingStick,
            {
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              opacity: flyingStickOpacity,
              transform: [
                { perspective: 700 },
                { translateX: flyingStickX },
                { translateY: flyingStickY },
                { translateY: landingBounceY },
                { rotateZ: flyingStickRotate },
                { rotateY: flyingStickFlip },
                { scale: flyingStickScale },
              ],
            },
          ]}
        >
          <Image
            source={ritualStyle.censer.realisticStickSprite}
            style={styles.realisticFlyingStick}
            contentFit={'fill'}
            cachePolicy="memory-disk"
          />
          <Animated.View style={[styles.flyingNumberPlate, { opacity: flyingNumberOpacity }]}>
            <Text style={styles.flyingNumberLabel}>第 {poemNumber ?? '?'} 籤</Text>
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
        <Text style={styles.revealCardText}>第 {poemNumber ?? '?'} 籤已落定，請恭讀聖意。</Text>
      </Animated.View>
    </ScrollView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  scroll: {
    flex: 1,
    width: '100%',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: TempleSpacing.lg,
    paddingVertical: TempleSpacing.lg,
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
    width: '100%',
    maxWidth: 320,
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
  realisticHolder: {
    position: 'absolute',
    width: 158,
    height: 172,
    bottom: -12,
    zIndex: 0,
  },
  realisticStick: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  realisticFlyingStick: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  contactShadow: {
    position: 'absolute',
    bottom: 2,
    width: 142,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(12, 7, 4, 0.38)',
    transform: [{ scaleX: 1.12 }],
  },
  qiantongInner: {
    position: 'absolute',
    top: 7,
    width: 136,
    height: 22,
    borderRadius: 14,
    opacity: 0.92,
    zIndex: 1,
  },
  qiantongSheen: {
    position: 'absolute',
    top: 34,
    bottom: 18,
    left: 13,
    width: 24,
    borderLeftWidth: 2,
    borderRadius: 18,
    opacity: 0.62,
    zIndex: 62,
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
  stickGrain: {
    position: 'absolute',
    top: 22,
    bottom: 8,
    left: 2,
    width: 1,
    backgroundColor: 'rgba(112, 73, 32, 0.22)',
  },
  flyingGroundShadow: {
    position: 'absolute',
    top: 231,
    left: 91,
    width: 98,
    height: 13,
    borderRadius: 999,
    backgroundColor: 'rgba(10, 6, 3, 0.62)',
    zIndex: 80,
  },
  flyingStick: {
    position: 'absolute',
    top: 42,
    left: 133,
    width: 14,
    height: 148,
    borderRadius: 7,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.34,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 18,
  },
  flyingStickTip: {
    width: '100%',
    height: 18,
  },
  flyingStickGrain: {
    position: 'absolute',
    top: 24,
    bottom: 10,
    left: 3,
    width: 1,
    backgroundColor: 'rgba(90, 54, 22, 0.25)',
  },
  flyingNumberPlate: {
    position: 'absolute',
    top: 32,
    bottom: 10,
    left: 1,
    right: 1,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotateY: '180deg' }],
  },
  flyingNumberLabel: {
    color: '#5B260F',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    textAlign: 'center',
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
  // ── 暈影（聚焦效果）──────────────────────────────────────────
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 900,
    // 模擬徑向漸層：外圍深色，中央透明
    borderWidth: 80,
    borderColor: theme.bgDark + 'AA',
    borderRadius: 999,
  },
  // ── 神光從天而降 ──────────────────────────────────────────────
  lightBeam: {
    position: 'absolute',
    top: -20,
    left: '50%',
    zIndex: 50,
    width: 50,
    height: 210,
    marginLeft: -25,
    alignItems: 'center',
  },
  lightBeamGlow: {
    position: 'absolute',
    top: 0,
    width: 80,
    height: '100%',
    borderRadius: 40,
  },
  lightBeamCore: {
    position: 'absolute',
    top: 0,
    width: 34,
    height: '100%',
    borderRadius: 17,
  },
  // ── 擴散光圈（靈籤顯現時）────────────────────────────────────
  expandRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2.5,
    zIndex: 60,
  },
  // ── 金色粒子 ──────────────────────────────────────────────────
  particleContainer: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 45,
  },
  particle: {
    position: 'absolute',
    top: 130,
  },
  });
}


