// 抽籤動畫元件
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, PanResponder, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import type { God } from '@/data/gods';
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
  /** -1（筒口最左）～ 1（最右） */
  spread: number;
  /** 露出筒口的長度，佔最高籤枝的比例 */
  reach: number;
  depth: 'back' | 'middle' | 'front';
  selected?: boolean;
}

const STICKS: readonly StickDefinition[] = Array.from({ length: 19 }, (_, index) => {
  const depthIndex = Math.floor(index / 7);
  const depth: StickDefinition['depth'] = depthIndex === 0 ? 'back' : depthIndex === 1 ? 'middle' : 'front';
  const selected = index === 9;
  const column = selected ? 4.5 : (index % 10) + (depthIndex % 2) * 0.35;
  return {
    spread: Math.min(1, (column / 9) * 2 - 1),
    reach: selected ? 1 : 0.55 + (((index * 17) % 38) / 38) * 0.4,
    depth,
    selected,
  };
});

const SELECTED_STICK_INDEX = STICKS.findIndex((stick) => stick.selected);
// 選中的籤枝最後才畫，搖出時才會在其他籤枝前面
const STICK_DRAW_ORDER = STICKS.map((_, index) => index)
  .filter((index) => index !== SELECTED_STICK_INDEX)
  .concat(SELECTED_STICK_INDEX);

const HOLDER_ASPECT = 900 / 800;
// 籤筒圖不透明區域的下緣，佔圖高的比例
const HOLDER_BOTTOM = 0.967;
// 籤枝下緣藏在筒口前緣以下多深（佔圖高比例），搖晃時才不會露出底端
const STICK_SINK = 0.14;
// 選中的籤枝被搖出時會往上浮，舞台上方要預留空間，才不會蓋到上方文字
const LIFT_HEADROOM = 16;
// 最高的籤枝露出筒口的長度，佔籤筒圖高的比例
const STICK_REACH = 0.3;
// 舞台下方要留給「籤枝落在供桌」與畫面底部的空間
const STAGE_BOTTOM_ROOM = 30;
const SCREEN_BOTTOM_RESERVE = Platform.OS === 'web' ? 16 : 96;
const HOLDER_MIN_WIDTH = 140;
const HOLDER_MAX_WIDTH = 230;

type HolderMouth = ReturnType<typeof getDrawAnimationRitualStyle>['censer']['realisticHolderMouth'];

interface StickLayout {
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: string;
  opacity: number;
}

// 籤筒是一張完整的圖，籤枝夾在「原圖」與「挖掉筒口的前層」之間，
// 位置全部依圖內量出的筒口比例換算，換風格或換螢幕尺寸都會對齊。
// availableHeight：舞台頂端到畫面底部的可用高度；籤筒依此縮放，讓整個籤筒一眼看得到。
function computeStageLayout(windowWidth: number, availableHeight: number, mouth: HolderMouth) {
  const stageWidth = Math.min(320, windowWidth - TempleSpacing.lg * 2);
  // 舞台高度 ≈ 籤筒圖高 ×（籤枝露出 + 籤筒本體）+ 上下預留
  const fitHeight = (availableHeight - LIFT_HEADROOM - STAGE_BOTTOM_ROOM) / (STICK_REACH + HOLDER_BOTTOM);
  const holderWidth = Math.round(Math.min(HOLDER_MAX_WIDTH, Math.max(HOLDER_MIN_WIDTH, fitHeight / HOLDER_ASPECT)));
  const holderHeight = holderWidth * HOLDER_ASPECT;
  const holderLeft = (stageWidth - holderWidth) / 2;
  const stickAbove = holderHeight * STICK_REACH;
  const holderTop = Math.round(stickAbove + LIFT_HEADROOM);
  const mouthY = holderTop + mouth.centerY * holderHeight;
  const stickBottom = holderTop + (mouth.frontY + STICK_SINK) * holderHeight;
  const holderBottom = holderTop + HOLDER_BOTTOM * holderHeight;
  const innerHalf = mouth.innerHalfW * holderWidth;
  const bodyHalf = mouth.bodyHalfW * holderWidth;
  const stickWidth = Math.max(9, holderWidth * 0.062);

  const sticks: StickLayout[] = STICKS.map((stick, index) => {
    const height = stickAbove * stick.reach + (stickBottom - mouthY);
    // 以底部為支點，越靠筒邊越往外斜
    const lean = stick.spread * 6 + (((index * 7) % 5) - 2) * 0.6;
    return {
      left: holderWidth / 2 + stick.spread * innerHalf * 0.78 - stickWidth / 2,
      top: stickBottom - height,
      width: stickWidth,
      height,
      rotate: `${stick.selected ? 0 : lean}deg`,
      opacity: stick.depth === 'back' ? 0.78 : stick.depth === 'middle' ? 0.9 : 1,
    };
  });

  return {
    stageWidth,
    stageHeight: Math.round(holderBottom + STAGE_BOTTOM_ROOM),
    holderWidth,
    holderHeight,
    holderLeft,
    holderTop,
    holderBottom,
    centerX: stageWidth / 2,
    mouthY,
    bodyHalf,
    sticks,
  };
}

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
  requiresVerification?: boolean;
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
  requiresVerification = false,
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const holderMouth = ritualStyle.censer.realisticHolderMouth;
  // 舞台在畫面上的頂端位置只量一次（每種螢幕高度各一次）；量到之前先用常見版面估計。
  // 只量一次是因為籤筒縮放會改變內容高度，若每次都重量，置中排版可能來回跳動。
  const stageRef = useRef<View>(null);
  const [measuredStage, setMeasuredStage] = useState<{ windowHeight: number; top: number } | null>(null);
  const stageTop = measuredStage?.windowHeight === windowHeight ? measuredStage.top : 520;
  const stage = useMemo(
    () => computeStageLayout(windowWidth, windowHeight - stageTop - SCREEN_BOTTOM_RESERVE, holderMouth),
    [windowWidth, windowHeight, stageTop, holderMouth]
  );
  const measureStage = () => {
    if (measuredStage?.windowHeight === windowHeight) return;
    stageRef.current?.measureInWindow((_x, y) => {
      if (Number.isFinite(y)) setMeasuredStage({ windowHeight, top: y });
    });
  };
  // 飛出的籤枝從「已被搖出筒口」的位置起飛，落在籤筒前方的供桌上
  const flight = useMemo(() => {
    const selected = stage.sticks[SELECTED_STICK_INDEX];
    const width = selected.width * 1.25;
    const top = selected.top + motion.liftDistance;
    return {
      width,
      height: selected.height,
      left: stage.holderLeft + selected.left - (width - selected.width) / 2,
      top,
      landY: stage.holderBottom + 4 - (top + selected.height / 2),
    };
  }, [stage, motion.liftDistance]);

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

  // 手持搖籤筒：左右搖晃為主、配輕微上下彈跳與傾斜
  const translateX = useMemo(() => shakeEnergy.interpolate({
    inputRange: [-1, 1],
    outputRange: [-motion.shakeAmplitude, motion.shakeAmplitude],
  }), [shakeEnergy, motion.shakeAmplitude]);

  const translateY = useMemo(() => shakeEnergy.interpolate({
    inputRange: [-1, 1],
    outputRange: [-motion.shakeAmplitude * 0.15, motion.shakeAmplitude * 0.15],
  }), [shakeEnergy, motion.shakeAmplitude]);

  const rotate = useMemo(() => shakeEnergy.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-4deg', '4deg'],
  }), [shakeEnergy]);

  // 選中籤枝隨著搖晃力道逐漸浮出籤筒口（更明顯的浮出效果）
  const chosenPeekTranslateY = useMemo(() => shakeEnvelope.interpolate({
    inputRange: [0, 0.3, 0.55, 0.8, 1],
    outputRange: [0, -4, -12, -24, -42],
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
    Animated.add(translateY, cylinderRecoilAnim),
    [translateY, cylinderRecoilAnim]
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
    outputRange: [0, -48, flight.landY * 0.94, flight.landY],
  }), [flightAnim, flight.landY]);

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
    const rest = stage.sticks[index];
    if (stick.selected) {
      return {
        opacity: selectedIn筒Opacity,
        transform: [
          { rotate: rest.rotate },
          { translateY: chosenTotalTranslateY },
          { translateX: chosenStickTranslateX },
          { rotate: chosenStickRotate },
        ],
      };
    }
    const jitterEnergy = Animated.multiply(stickJitterAnims[index], shakeEnvelope);
    return {
      opacity: rest.opacity,
      transform: [
        { rotate: rest.rotate },
        { translateY: jitterEnergy.interpolate({ inputRange: [-1, 1], outputRange: [6, -4] }) },
      ],
    };
  }), [chosenStickRotate, chosenStickTranslateX, chosenTotalTranslateY, selectedIn筒Opacity, shakeEnvelope, stage, stickJitterAnims]);
  const isShaking = interactive && !popped;
  // 只在手指按住籤筒時鎖住捲動；矮螢幕上使用者仍可先捲動把籤筒移到眼前
  const [holdingCylinder, setHoldingCylinder] = useState(false);

  // 拖曳模式跟長按模式共用同一個 PanResponder：
  // - PanResponder 底層同時支援滑鼠與觸控（react-native-web 上兩者都會走 Responder 系統），
  //   如果拖曳跟長按各自只接原生的 mouse/touch 事件，會在特定平台上完全失效（例如長按若只接
  //   onTouchStart，滑鼠使用者在網頁版就永遠按不動）。
  // - 拖曳模式：手指前後來回移動的距離會累積「晃動能量」。
  // - 長按模式：只在乎「有沒有按住」，用 grant/release 切換 isPressedRef。
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => isShaking,
    onMoveShouldSetPanResponder: () => isShaking,
    // 手指按在籤筒上時不讓外層捲動搶走手勢
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (evt) => {
      isPressedRef.current = true;
      setHoldingCylinder(true);
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
    onPanResponderRelease: () => { isPressedRef.current = false; setHoldingCylinder(false); lastTouchRef.current = null; },
    onPanResponderTerminate: () => { isPressedRef.current = false; setHoldingCylinder(false); lastTouchRef.current = null; },
  }), [shakeMode, isShaking]);
  const shakeTouchHandlers = panResponder.panHandlers;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!holdingCylinder}
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>抽籤中</Text>
        <View style={[styles.styleBadge, { borderColor: ritualStyle.chipColor + '66' }]}>
          <Text style={[styles.styleBadgeText, { color: ritualStyle.chipColor }]}>
            {drawStyle.label}
          </Text>
        </View>
      </View>
      <Animated.Text style={[styles.subtitle, { opacity: phaseTextOpacity }]}>
        ◈ {displayPhase} ◈
      </Animated.Text>
      {isShaking ? (
        <Text style={[styles.shakeInstruction, { color: highlightColor }]}>
          {shakeMode === 'drag' ? effortHint : '按住籤筒不放，讓它越搖越用力'}
        </Text>
      ) : null}

      <View
        ref={stageRef}
        onLayout={measureStage}
        style={[styles.animationStage, { width: stage.stageWidth, height: stage.stageHeight }]}
      >
        {/* 神光從天而降 */}
        <Animated.View
          pointerEvents="none"
          style={[styles.lightBeam, { height: stage.mouthY + 24, opacity: beamOpacity }]}
        >
          <View style={[styles.lightBeamGlow, { backgroundColor: highlightColor + '12' }]} />
          <View style={[styles.lightBeamCore, { backgroundColor: highlightColor + '28' }]} />
        </Animated.View>
        {/* 籤筒後方的柔光：三層淡色同心圓疊出由內而外漸淡的效果 */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            {
              left: stage.centerX - stage.bodyHalf * 2.2,
              top: stage.holderTop + stage.holderHeight * 0.48 - stage.bodyHalf * 2.2,
              width: stage.bodyHalf * 4.4,
              height: stage.bodyHalf * 4.4,
              opacity: haloOpacity,
              transform: [{ scale: haloScale }],
            },
          ]}
        >
          {[1, 0.72, 0.46].map((size) => (
            <View
              key={size}
              style={[
                styles.haloLayer,
                {
                  width: `${size * 100}%`,
                  height: `${size * 100}%`,
                  backgroundColor: auraColor + '1A',
                },
              ]}
            />
          ))}
        </Animated.View>
        {/* 籤枝出筒時的閃光，以筒口為中心 */}
        <View pointerEvents="none" style={[styles.mouthAnchor, { left: stage.centerX, top: stage.mouthY }]}>
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
            style={[
              styles.expandRing,
              {
                borderColor: highlightColor + '88',
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
        </View>

        {/* 金色粒子，從筒口往上飄 */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.particleContainer,
            { left: stage.centerX - 75, top: stage.mouthY - 130, opacity: particleContainerOpacity },
          ]}
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

        <Animated.View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { transform: [{ translateY: altarFloat }] }]}>
          <View
            style={[
              styles.contactShadow,
              {
                left: stage.centerX - stage.bodyHalf * 1.15,
                top: stage.holderBottom - 12,
                width: stage.bodyHalf * 2.3,
              },
            ]}
          />
          {/* 籤筒：原圖（後層）→ 籤枝 → 挖掉筒口的前層，三層一起搖晃 */}
          <Animated.View
            style={[
              styles.qiantong,
              {
                left: stage.holderLeft,
                width: stage.holderWidth,
                height: stage.stageHeight,
                transform: [{ translateX }, { rotate }, { translateY: cylinderTranslateY }],
              },
            ]}
          >
            <Image
              source={ritualStyle.censer.realisticHolderSprite}
              style={[styles.holderLayer, { top: stage.holderTop, width: stage.holderWidth, height: stage.holderHeight }]}
              contentFit="fill"
              cachePolicy="memory-disk"
            />
            {STICK_DRAW_ORDER.map((index) => {
              const rest = stage.sticks[index];
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.stick,
                    { left: rest.left, top: rest.top, width: rest.width, height: rest.height },
                    stickAnimatedStyles[index],
                  ]}
                >
                  <Image
                    source={ritualStyle.censer.realisticStickSprite}
                    style={styles.realisticStick}
                    contentFit="fill"
                    cachePolicy="memory-disk"
                  />
                </Animated.View>
              );
            })}
            <Image
              source={ritualStyle.censer.realisticHolderFrontSprite}
              style={[styles.holderLayer, { top: stage.holderTop, width: stage.holderWidth, height: stage.holderHeight }]}
              contentFit="fill"
              cachePolicy="memory-disk"
            />
            {/* 透明觸控層：手勢不能落在圖片上，否則網頁版按住圖片拖曳會觸發瀏覽器的「拖曳圖片」，搖不動籤筒 */}
            <View style={StyleSheet.absoluteFill} {...(isShaking ? shakeTouchHandlers : {})} />
          </Animated.View>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.flyingGroundShadow,
            {
              left: stage.centerX - 61,
              top: stage.holderBottom + flight.width / 2 - 2,
              opacity: flyingShadowOpacity,
              transform: [{ scaleX: flyingShadowScaleX }, { scaleY: flyingShadowScaleY }],
            },
          ]}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.flyingStick,
            {
              left: flight.left,
              top: flight.top,
              width: flight.width,
              height: flight.height,
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
            contentFit="fill"
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
        <Text style={[styles.revealCardTitle, { color: highlightColor }]}>籤號已抽出</Text>
        <Text style={styles.revealCardText}>
          {requiresVerification
            ? `第 ${poemNumber ?? '?'} 籤已抽出，接著請擲筊驗籤。`
            : `第 ${poemNumber ?? '?'} 籤已抽出，請恭讀籤詩。`}
        </Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TempleSpacing.sm,
    marginBottom: TempleSpacing.xs,
  },
  styleBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: theme.bgCard,
  },
  styleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  animationStage: {
    marginBottom: TempleSpacing.md,
  },
  halo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloLayer: {
    position: 'absolute',
    borderRadius: 999,
  },
  mouthAnchor: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
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
  qiantong: {
    position: 'absolute',
    top: 0,
  },
  holderLayer: {
    position: 'absolute',
    left: 0,
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
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(12, 7, 4, 0.42)',
  },
  stick: {
    position: 'absolute',
    // 籤枝以插在筒裡的底端為支點傾斜、晃動
    transformOrigin: 'bottom',
  },
  flyingGroundShadow: {
    position: 'absolute',
    width: 98,
    height: 13,
    borderRadius: 999,
    backgroundColor: 'rgba(10, 6, 3, 0.62)',
    zIndex: 80,
  },
  flyingStick: {
    position: 'absolute',
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.34,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 18,
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
  // ── 神光從天而降 ──────────────────────────────────────────────
  lightBeam: {
    position: 'absolute',
    top: -20,
    left: '50%',
    zIndex: 50,
    width: 50,
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
    width: 150,
    height: 180,
    zIndex: 45,
  },
  particle: {
    position: 'absolute',
    top: 130,
  },
  });
}


