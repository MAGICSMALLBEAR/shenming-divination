import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';

import type { FlowStep } from '@/hooks/useDivination';
import type { God } from '@/data/gods';
import { getGodSoftImage } from '@/data/godImages';
import type { JiaobeiResult } from '@/services/divination';

export type DivinePresenceMode =
  | 'listening'
  | 'offering'
  | 'meditating'
  | 'awaiting'
  | 'approve'
  | 'reconsider'
  | 'decline'
  | 'revealing'
  | 'resting';

type DivinePresenceStageProps = {
  god: God;
  step: FlowStep;
  incenseDone?: boolean;
  lastJiaobei?: JiaobeiResult | null;
  responseKey?: number;
  lowMotion?: boolean;
  compact?: boolean;
};

const GUAN_DI_BLINK = require('@/assets/images/gods/generated/animation/guanshengdijun-blink.webp');

// Soft portraits are 1024×1536 (2:3). Blink window and face position are
// measured on a 250px-wide render and scaled to the actual portrait width.
const ART_ASPECT = 2 / 3;
const ART_BASE_WIDTH = 250;
const BLINK_WINDOW = { left: 44, top: 82, width: 164, height: 48 };
const FACE_CENTER_Y = 104;

const STAGE_BACKGROUND = '#100B08';
const NARROW_STAGE_WIDTH = 480;
const BACKDROP_OPACITY = 0.72;
// Eased steps so the portrait's right edge dissolves into the stage.
const FADE_STEPS = Array.from({ length: 12 }, (_, index) => Number((((index + 1) / 12) ** 1.6).toFixed(3)));

function parseHex(color: string): { rgb: [number, number, number]; alpha: number } {
  const hex = color.replace('#', '');
  const rgb = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)) as [number, number, number];
  const alpha = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
  return { rgb, alpha };
}

/** Solid colour seen where `overlay` (optionally #RRGGBBAA) sits on `base` at `opacity`. */
export function blendOver(base: string, overlay: string, opacity: number): string {
  const bottom = parseHex(base).rgb;
  const top = parseHex(overlay);
  const weight = top.alpha * opacity;
  return '#' + bottom
    .map((channel, index) => Math.round(channel * (1 - weight) + top.rgb[index] * weight))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

const COPY: Record<DivinePresenceMode, { eyebrow: string; title: string }> = {
  listening: { eyebrow: '神前稟明', title: '請定心說明所問之事' },
  offering: { eyebrow: '香煙上達', title: '心意正傳達於神前' },
  meditating: { eyebrow: '屏息凝神', title: '默念姓名與所問之事' },
  awaiting: { eyebrow: '驗籤請示', title: '請確認剛抽出的這支籤' },
  approve: { eyebrow: '聖筊', title: '此支籤的確認正在進行' },
  reconsider: { eyebrow: '笑筊', title: '此支籤未獲確認・請重新抽籤' },
  decline: { eyebrow: '陰筊', title: '此支籤未獲確認・請重新抽籤' },
  revealing: { eyebrow: '神籤將現', title: '請靜心領受籤中指引' },
  resting: { eyebrow: '神意已示', title: '籤意在心・仍須審慎而行' },
};

export function getDivinePresenceMode(
  step: FlowStep,
  lastJiaobei?: JiaobeiResult | null,
  incenseDone = false
): DivinePresenceMode {
  if (step === 'set-question') return 'listening';
  if (step === 'meditate') return incenseDone ? 'meditating' : 'offering';
  if (step === 'verify-poem') {
    if (lastJiaobei === 'shengbei') return 'approve';
    if (lastJiaobei === 'xiaobei') return 'reconsider';
    if (lastJiaobei === 'yinbei') return 'decline';
    return 'awaiting';
  }
  if (step === 'drawing' || step === 'reveal-poem' || step === 'ai-interpret') return 'revealing';
  if (step === 'result') return 'resting';
  return 'awaiting';
}

export function DivinePresenceStage({
  god,
  step,
  incenseDone = false,
  lastJiaobei,
  responseKey = 0,
  lowMotion = false,
  compact = false,
}: DivinePresenceStageProps) {
  const portrait = getGodSoftImage(god.id);
  const mode = getDivinePresenceMode(step, lastJiaobei, incenseDone);
  const copy = COPY[mode];
  const breath = useRef(new Animated.Value(0)).current;
  const aura = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(0)).current;
  const response = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lowMotion) {
      breath.setValue(0);
      aura.setValue(0.45);
      return;
    }

    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(aura, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(aura, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    breathLoop.start();
    auraLoop.start();
    return () => {
      breathLoop.stop();
      auraLoop.stop();
    };
  }, [aura, breath, lowMotion]);

  useEffect(() => {
    if (lowMotion || god.id !== 1) {
      blink.setValue(0);
      return;
    }

    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(3200),
        Animated.timing(blink, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.delay(90),
        Animated.timing(blink, { toValue: 0, duration: 110, useNativeDriver: true }),
        Animated.delay(1700),
        Animated.timing(blink, { toValue: 1, duration: 75, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 0, duration: 95, useNativeDriver: true }),
      ])
    );
    blinkLoop.start();
    return () => blinkLoop.stop();
  }, [blink, god.id, lowMotion]);

  useEffect(() => {
    response.stopAnimation();
    response.setValue(0);
    if (lowMotion || !['approve', 'reconsider', 'decline', 'revealing'].includes(mode)) return;
    Animated.timing(response, {
      toValue: 1,
      duration: mode === 'approve' ? 1100 : 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [lowMotion, mode, response, responseKey]);

  const palette = useMemo(() => getModePalette(mode, god), [god, mode]);
  const portraitScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.018] });
  const portraitLift = breath.interpolate({ inputRange: [0, 1], outputRange: [2, -2] });
  const auraOpacity = aura.interpolate({
    inputRange: [0, 1],
    outputRange: mode === 'decline' ? [0.14, 0.22] : [0.22, 0.48],
  });
  const burstScale = response.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1.65] });
  const burstOpacity = response.interpolate({ inputRange: [0, 0.22, 1], outputRange: [0, 0.8, 0] });
  const portraitResponseScale = response.interpolate({
    inputRange: [0, 0.38, 1],
    outputRange: mode === 'approve' ? [1, 1.035, 1] : [1, 0.985, 1],
  });
  const captionOpacity = response.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: ['approve', 'reconsider', 'decline', 'revealing'].includes(mode)
      ? [0.55, 1, 1]
      : [1, 1, 1],
  });

  // The portrait scales with the stage instead of a fixed 250×360 box, so the
  // blink overlay and halo are placed from the measured width.
  const [portraitBox, setPortraitBox] = useState<{ width: number; height: number } | null>(null);
  const handlePortraitLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setPortraitBox((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
  };
  const artScale = portraitBox ? portraitBox.width / ART_BASE_WIDTH : 1;
  // Art is top-aligned and fills the width while the box is wider than 2:3.
  const artFillsWidth = Boolean(portraitBox && portraitBox.width / portraitBox.height >= ART_ASPECT);
  const haloTop = (portraitBox ? FACE_CENTER_Y * artScale : 104) + (compact ? 0 : 8);
  const fadeColor = blendOver(STAGE_BACKGROUND, palette.backdrop, BACKDROP_OPACITY);
  // On phones the caption column is ~170px; a smaller title keeps the
  // nine-character lines from orphaning their last character.
  const [stageWidth, setStageWidth] = useState(0);
  const narrow = stageWidth > 0 && stageWidth < NARROW_STAGE_WIDTH;

  return (
    <View
      pointerEvents="none"
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${god.name}互動神像。${copy.eyebrow}，${copy.title}`}
      onLayout={(event) => setStageWidth(event.nativeEvent.layout.width)}
      style={[styles.stage, compact && styles.stageCompact, { borderColor: palette.border }]}
    >
      <View style={[styles.backdrop, { backgroundColor: palette.backdrop }]} />

      <Animated.View
        onLayout={handlePortraitLayout}
        style={[
          styles.portraitWrap,
          compact && styles.portraitWrapCompact,
          {
            transform: [
              { translateY: portraitLift },
              { scale: portraitScale },
              { scale: portraitResponseScale },
            ],
          },
        ]}
      >
        {portrait ? (
          <Image
            source={portrait}
            style={styles.portrait}
            contentFit="cover"
            contentPosition="top"
            transition={180}
          />
        ) : null}
        {god.id === 1 && !lowMotion && !compact && portraitBox && artFillsWidth ? (
          <Animated.View
            style={[
              styles.blinkWindow,
              {
                left: BLINK_WINDOW.left * artScale,
                top: BLINK_WINDOW.top * artScale,
                width: BLINK_WINDOW.width * artScale,
                height: BLINK_WINDOW.height * artScale,
                opacity: blink,
              },
            ]}
          >
            <Image
              source={GUAN_DI_BLINK}
              style={{
                position: 'absolute',
                left: -BLINK_WINDOW.left * artScale,
                top: -BLINK_WINDOW.top * artScale,
                width: portraitBox.width,
                height: portraitBox.width / ART_ASPECT,
              }}
              contentFit="cover"
              contentPosition="top"
            />
          </Animated.View>
        ) : null}
        <View style={[styles.portraitShade, { backgroundColor: palette.shade }]} />
        <View style={styles.portraitFade}>
          {FADE_STEPS.map((opacity) => (
            <View key={opacity} style={[styles.portraitFadeStep, { backgroundColor: fadeColor, opacity }]} />
          ))}
        </View>
      </Animated.View>

      {!lowMotion && mode !== 'decline' ? (
        <Animated.View
          style={[
            styles.responseBurst,
            compact && styles.haloAnchorCompact,
            {
              top: haloTop,
              borderColor: palette.ring,
              opacity: burstOpacity,
              transform: [{ scale: burstScale }],
            },
          ]}
        />
      ) : null}
      {!lowMotion
        ? Array.from({ length: mode === 'approve' ? 10 : 6 }, (_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.rayAnchor,
                compact && styles.haloAnchorCompact,
                {
                  top: haloTop,
                  opacity: mode === 'decline' ? 0.08 : auraOpacity,
                  transform: [{ rotate: `${index * (360 / (mode === 'approve' ? 10 : 6))}deg` }],
                },
              ]}
            >
              <View style={[styles.ray, { backgroundColor: palette.ring }]} />
            </Animated.View>
          ))
        : null}

      <Animated.View style={[styles.caption, compact && styles.captionCompact, { opacity: captionOpacity }]}>
        <Text style={[styles.eyebrow, { color: palette.text }]}>{copy.eyebrow}</Text>
        <Text style={[styles.title, narrow && styles.titleNarrow]} numberOfLines={2}>{copy.title}</Text>
        <View style={[styles.rule, { backgroundColor: palette.ring }]} />
        <Text style={styles.godName}>{god.name}</Text>
      </Animated.View>
    </View>
  );
}

function getModePalette(mode: DivinePresenceMode, god: God) {
  if (mode === 'decline') {
    return {
      aura: '#73849A',
      ring: '#A6B0BD',
      border: '#71809655',
      backdrop: '#111821',
      shade: '#1017223A',
      text: '#C7D0DA',
    };
  }
  if (mode === 'reconsider') {
    return {
      aura: '#D89A52',
      ring: '#F0C27A',
      border: '#D89A5266',
      backdrop: '#24170E',
      shade: '#7B3F1422',
      text: '#F0C27A',
    };
  }
  const accent = god.accentColor || '#E7BE6A';
  return {
    aura: mode === 'approve' || mode === 'revealing' ? '#FFD36A' : accent,
    ring: mode === 'approve' ? '#FFE7A1' : accent,
    border: accent + '66',
    backdrop: god.primaryColor + '38',
    shade: god.primaryColor + '1F',
    text: mode === 'approve' ? '#FFE7A1' : accent,
  };
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    maxWidth: 760,
    height: 270,
    alignSelf: 'center',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: STAGE_BACKGROUND,
    marginBottom: 14,
  },
  stageCompact: {
    height: 178,
    marginBottom: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    opacity: BACKDROP_OPACITY,
  },
  responseBurst: {
    position: 'absolute',
    left: '21%',
    width: 90,
    height: 90,
    marginLeft: -45,
    marginTop: -45,
    borderRadius: 45,
    borderWidth: 3,
  },
  rayAnchor: {
    position: 'absolute',
    left: '21%',
    width: 1,
    height: 1,
  },
  haloAnchorCompact: {
    left: '20%',
  },
  ray: {
    position: 'absolute',
    left: -1,
    top: -118,
    width: 2,
    height: 94,
    borderRadius: 2,
    opacity: 0.22,
  },
  portraitWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '42%',
    overflow: 'hidden',
  },
  portraitWrapCompact: {
    width: '40%',
  },
  portrait: {
    width: '100%',
    height: '100%',
  },
  blinkWindow: {
    position: 'absolute',
    overflow: 'hidden',
  },
  portraitShade: {
    ...StyleSheet.absoluteFill,
  },
  portraitFade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '38%',
    flexDirection: 'row',
  },
  portraitFadeStep: {
    flex: 1,
  },
  caption: {
    position: 'absolute',
    left: '45%',
    right: 26,
    top: 54,
    bottom: 30,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  captionCompact: {
    left: '43%',
    top: 22,
    bottom: 18,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 10,
  },
  title: {
    color: '#F7E5C0',
    fontSize: 20,
    lineHeight: 29,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  titleNarrow: {
    fontSize: 17,
    lineHeight: 25,
    letterSpacing: 0.4,
  },
  rule: {
    width: 68,
    height: 1,
    marginVertical: 13,
    opacity: 0.55,
  },
  godName: {
    color: '#C8BBA7',
    fontSize: 12,
    letterSpacing: 3,
  },
});
