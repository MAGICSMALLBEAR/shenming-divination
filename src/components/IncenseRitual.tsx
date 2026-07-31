import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { RitualStylePicker } from '@/components/RitualStylePicker';
import { ritualStyles, type RitualStyleKey } from '@/constants/ritual-styles';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { getGodCloseupImage } from '@/data/godImages';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { playIncenseSound } from '@/services/proceduralSound';

interface IncenseRitualProps {
  godId?: number | null;
  godName: string;
  onComplete: () => void;
  ritualStyleKey: RitualStyleKey;
  onStyleChange: (next: RitualStyleKey) => void;
  reducedMotion?: boolean;
}

type RitualStep = 'idle' | 'lighting' | 'lit' | 'inserting' | 'placed';

const HAND_INCENSE_START = { x: 0, y: 0 };
const CENSER_WRAP_WIDTH = 230;
const CENSER_WRAP_HEIGHT = 196;
const CENSER_BOTTOM_MARGIN = 34;
const DROP_ZONE_WIDTH = 110;
const DROP_ZONE_HEIGHT = 82;
const DROP_ZONE_TOP = 22;
const HAND_INCENSE_WIDTH = 26;
const HAND_INCENSE_HEIGHT = 112;
const HAND_INCENSE_RIGHT = 22;
const HAND_INCENSE_BOTTOM = 6;
const DROP_TOLERANCE = 40;

export function isIncenseOverCenser(
  scene: { width: number; height: number },
  translation: { x: number; y: number },
  lift = 0
): boolean {
  const censerX = (scene.width - CENSER_WRAP_WIDTH) / 2;
  const censerY = scene.height - CENSER_WRAP_HEIGHT - CENSER_BOTTOM_MARGIN;
  const dropZone = {
    left: censerX + (CENSER_WRAP_WIDTH - DROP_ZONE_WIDTH) / 2 - DROP_TOLERANCE,
    top: censerY + DROP_ZONE_TOP - DROP_TOLERANCE,
    right: censerX + (CENSER_WRAP_WIDTH + DROP_ZONE_WIDTH) / 2 + DROP_TOLERANCE,
    bottom: censerY + DROP_ZONE_TOP + DROP_ZONE_HEIGHT + DROP_TOLERANCE,
  };
  const incense = {
    left: scene.width - HAND_INCENSE_RIGHT - HAND_INCENSE_WIDTH + translation.x,
    top: scene.height - HAND_INCENSE_BOTTOM - HAND_INCENSE_HEIGHT + translation.y + lift,
    right: scene.width - HAND_INCENSE_RIGHT + translation.x,
    bottom: scene.height - HAND_INCENSE_BOTTOM + translation.y + lift,
  };

  return (
    incense.right >= dropZone.left &&
    incense.left <= dropZone.right &&
    incense.bottom >= dropZone.top &&
    incense.top <= dropZone.bottom
  );
}

export function IncenseRitual({
  godId,
  godName,
  onComplete,
  ritualStyleKey,
  onStyleChange,
  reducedMotion = false,
}: IncenseRitualProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [step, setStep] = useState<RitualStep>('idle');
  const [sceneLayout, setSceneLayout] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const ritualStyle = ritualStyles[ritualStyleKey];
  const godImage = getGodCloseupImage(godId);

  const incensePosition = useRef(new Animated.ValueXY(HAND_INCENSE_START)).current;
  const incenseLift = useRef(new Animated.Value(0)).current;
  const incenseTranslationRef = useRef(HAND_INCENSE_START);
  const placedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 三個不同週期的燃燒抖動來源疊加，組合起來才會像真實火苗不規則跳動，
  // 而不是單一等速明滅。
  const flameFlickerFast = useRef(new Animated.Value(0)).current;
  const flameFlickerMid = useRef(new Animated.Value(0)).current;
  const flameFlickerSlow = useRef(new Animated.Value(0)).current;
  const emberWispAnim = useRef(new Animated.Value(0)).current;
  const smokeAnim = useRef(new Animated.Value(0)).current;
  const ashPressAnim = useRef(new Animated.Value(0)).current;
  const ashBurstAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const xListener = incensePosition.x.addListener(({ value }) => {
      incenseTranslationRef.current = { ...incenseTranslationRef.current, x: value };
    });
    const yListener = incensePosition.y.addListener(({ value }) => {
      incenseTranslationRef.current = { ...incenseTranslationRef.current, y: value };
    });

    return () => {
      incensePosition.x.removeListener(xListener);
      incensePosition.y.removeListener(yListener);
      if (placedTimerRef.current) clearTimeout(placedTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, [incensePosition]);

  useEffect(() => {
    if ((step !== 'lit' && step !== 'inserting' && step !== 'placed') || reducedMotion) {
      return;
    }

    const flicker = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      );

    const flameLoopFast = flicker(flameFlickerFast, 170);
    const flameLoopMid = flicker(flameFlickerMid, 260);
    const flameLoopSlow = flicker(flameFlickerSlow, 380);

    // 香頭的細煙絲：由 0 直接跳回 0 重新升起，模擬持續冒出一縷縷輕煙。
    const emberWispLoop = Animated.loop(
      Animated.timing(emberWispAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );

    const smokeLoop = Animated.loop(
      Animated.timing(smokeAnim, {
        toValue: 1,
        duration: 2600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    );

    flameLoopFast.start();
    flameLoopMid.start();
    flameLoopSlow.start();
    emberWispLoop.start();
    smokeLoop.start();

    return () => {
      flameLoopFast.stop();
      flameLoopMid.stop();
      flameLoopSlow.stop();
      emberWispLoop.stop();
      smokeLoop.stop();
    };
  }, [emberWispAnim, flameFlickerFast, flameFlickerMid, flameFlickerSlow, reducedMotion, smokeAnim, step]);

  const resetIncensePosition = () => {
    Animated.parallel([
      Animated.spring(incensePosition, {
        toValue: HAND_INCENSE_START,
        friction: 7,
        tension: 70,
        useNativeDriver: false,
      }),
      Animated.spring(incenseLift, {
        toValue: 0,
        friction: 7,
        tension: 70,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleLight = () => {
    if (step !== 'idle') {
      return;
    }

    setStep('lighting');
    Animated.sequence([
      Animated.timing(incenseLift, {
        toValue: -8,
        duration: 180,
        useNativeDriver: false,
      }),
      Animated.timing(incenseLift, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setStep('lit');
    });
  };

  const placeIncenseInCenser = () => {
    // Calculate target position in scene-relative coordinates
    // Drop zone center (from layout calculation):
    //   x: centered in scene → sceneWidth/2
    //   y: censer at bottom, drop zone at top:22 within coverWrap
    //      dropZoneCy = sceneH - 196 - 34 + 22 + 82/2 = sceneH - 167
    // Hand incense natural center:
    //   position: absolute, bottom: 6, right: 22, bundleWrap: 26x112
    //   handCx = sceneW - 22 - 13 = sceneW - 35
    //   handCy = sceneH - 6 - 56 = sceneH - 62
    if (!sceneLayout || step !== 'lit') return;

    const { width: sw, height: sh } = sceneLayout;
    const dzCx = sw / 2;
    const dzCy = sh - 167;
    const handCx = sw - 35;
    const handCy = sh - 62;

    // Translation needed: move from hand natural position to drop zone center
    const targetX = dzCx - handCx;
    const targetY = dzCy - handCy - 4; // slight upward nudge

    setStep('inserting');
    setIsDragging(false);

    const approachDuration = reducedMotion ? 1 : 260;
    const insertDuration = reducedMotion ? 1 : 160;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(incensePosition, {
          toValue: { x: targetX, y: targetY - 18 },
          duration: approachDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(incenseLift, {
          toValue: 0,
          duration: approachDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(incensePosition, {
        toValue: { x: targetX, y: targetY },
        duration: insertDuration,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ashPressAnim, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(ashBurstAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(ashPressAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(ashBurstAnim, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]).start();

      void playIncenseSound().catch(() => {});
      placedTimerRef.current = setTimeout(() => setStep('placed'), reducedMotion ? 1 : 180);
      completeTimerRef.current = setTimeout(onComplete, reducedMotion ? 300 : 950);
    });
  };

  const isInsideDropZone = () =>
    sceneLayout !== null && isIncenseOverCenser(sceneLayout, incenseTranslationRef.current, -10);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => step === 'lit',
        onMoveShouldSetPanResponder: () => step === 'lit',
        onPanResponderGrant: () => {
          if (step !== 'lit') {
            return;
          }
          setIsDragging(true);
          incensePosition.extractOffset();
          incenseLift.setValue(-10);
        },
        onPanResponderMove: Animated.event(
          [null, { dx: incensePosition.x, dy: incensePosition.y }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: () => {
          incensePosition.flattenOffset();
          setIsDragging(false);
          if (isInsideDropZone()) {
            placeIncenseInCenser();
          } else {
            resetIncensePosition();
          }
        },
        onPanResponderTerminate: () => {
          incensePosition.flattenOffset();
          setIsDragging(false);
          resetIncensePosition();
        },
      }),
    [incenseLift, incensePosition, sceneLayout, step]
  );

  // 三層疊加：外層柔光呼吸、中層火苗左右搖擺、內層焰心快速跳動，
  // 三者週期互質，組合起來才會像真實火苗不規律地跳。
  const flameGlowOpacity = flameFlickerSlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });
  const flameOuterScaleY = flameFlickerSlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.22],
  });
  const flameOuterScaleX = flameFlickerMid.interpolate({
    inputRange: [0, 1],
    outputRange: [0.84, 1.12],
  });
  const flameSway = flameFlickerMid.interpolate({
    inputRange: [0, 1],
    outputRange: ['-6deg', '6deg'],
  });
  const flameCoreScale = flameFlickerFast.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });
  const flameCoreOpacity = flameFlickerFast.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
  });
  const emberWispTranslateY = emberWispAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -24],
  });
  const emberWispOpacity = emberWispAnim.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 0.4, 0],
  });
  const emberWispScale = emberWispAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.4],
  });
  const combinedHandTranslateY = Animated.add(incensePosition.y, incenseLift);
  const smokeOpacity = smokeAnim.interpolate({
    inputRange: [0, 0.15, 0.75, 1],
    outputRange: [0, 0.34, 0.16, 0],
  });
  const smokeRise = smokeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, -62],
  });
  const smokeDrift = smokeAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-5, 7, -2],
  });
  const smokeScaleX = smokeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1.2],
  });
  const ashPressScaleY = ashPressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.72],
  });
  const ashPressTranslateY = ashPressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5],
  });
  const ashBurstOpacity = ashBurstAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.38, 0],
  });
  const ashBurstScale = ashBurstAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1.55],
  });
  const ashBurstTranslateY = ashBurstAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  const instruction =
    step === 'idle'
      ? '\u5148\u9ede\u71c3\u9999\uff0c\u518d\u5411\u9999\u7210\u4e2d\u592e\u4f9b\u9999\u3002'
      : step === 'lighting'
        ? '\u9999\u706b\u5df2\u8d77\uff0c\u8acb\u7a69\u4f4f\u5fc3\u5ff5\u3002'
      : step === 'lit'
          ? isDragging
            ? '\u628a\u9999\u79fb\u5230\u9999\u7210\u4e2d\u592e\uff0c\u653e\u624b\u5373\u53ef\u63d2\u5165\u3002'
            : '\u5df2\u9ede\u9999\uff0c\u62d6\u66f3\u5230\u9999\u7210\u4e2d\u592e\u6216\u76f4\u63a5\u9ede\u9999\u7210\u3002'
          : step === 'inserting'
            ? '\u6b63\u5c07\u9999\u7a69\u7a69\u5949\u5165\u9999\u7210\u2026'
          : '\u4e09\u70b7\u9999\u5df2\u5165\u7210\uff0c\u7a0d\u5f8c\u5c31\u80fd\u9032\u5165\u4e0b\u4e00\u6bb5\u5100\u5f0f\u3002';

  const detailText =
    step === 'idle'
      ? '\u5148\u8f15\u9ede\u9999\u675f\uff0c\u5b8c\u6210\u9ede\u9999\u5f8c\u518d\u5c07\u9999\u5949\u5165\u9999\u7210\u3002'
      : step === 'lighting'
        ? '\u8b93\u5fc3\u7dd2\u6162\u4e0b\u4f86\uff0c\u7b49\u9999\u706b\u7a69\u5b9a\u3002'
      : step === 'lit'
          ? '\u628a\u9999\u79fb\u5230\u7210\u53e3\u4e0a\u65b9\uff0c\u63d2\u5165\u6642\u6703\u6709\u9999\u7070\u4e0b\u58d3\u8207\u63da\u7070\u53cd\u61c9\u3002'
          : step === 'inserting'
            ? '\u9999\u675f\u5df2\u5c0d\u6e96\u7210\u5fc3\uff0c\u6b63\u7de9\u7de9\u5165\u7210\u3002'
          : '\u9999\u5df2\u5b89\u5ea7\uff0c\u8acb\u7a0d\u5019\u795e\u524d\u56de\u61c9\u3002';

  const showHandIncense = step !== 'placed';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{'\u4e0a\u9999\u5100\u5f0f'}</Text>
      <Text style={styles.godName}>{`\u5411 ${godName} \u7a1f\u544a\u5fc3\u610f`}</Text>
      <RitualStylePicker value={ritualStyleKey} onChange={onStyleChange} />

      <View
        testID={'incense-scene'}
        style={styles.scene}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setSceneLayout({ width, height });
        }}
      >
        <View style={styles.backWall}>
          <View style={styles.wallPanel} />
          <View style={[styles.centerHalo, { backgroundColor: ritualStyle.glowColor + '22' }]} />
          <View style={[styles.ceilingLamp, { borderColor: ritualStyle.chipColor + '66' }]} />
        </View>

        <View style={styles.shrineFrame}>
          <View style={[styles.shrineGlow, { backgroundColor: ritualStyle.glowColor + '28' }]} />
          <View style={styles.godPortraitFrame}>
            {godImage ? (
              <Image source={godImage} style={styles.godPortraitImage} contentFit="cover" contentPosition="top" transition={220} />
            ) : (
              <View style={styles.godPortraitFallback}>
                <Text style={styles.godPortraitFallbackText}>{godName.slice(0, 2)}</Text>
              </View>
            )}
            <View style={[styles.godPortraitVeil, { backgroundColor: ritualStyle.glowColor + '12' }]} />
          </View>
          <View style={styles.nameTablet}>
            <Text style={styles.nameTabletText} numberOfLines={1}>{godName}</Text>
          </View>
        </View>

        <View style={styles.altarGlowLayer}>
          <View style={[styles.altarGlow, { backgroundColor: ritualStyle.glowColor + '20' }]} />
          <View style={[styles.lowGlow, { backgroundColor: ritualStyle.chipColor + '14' }]} />
        </View>

        <View style={styles.sideLanternLeft}>
          <View style={styles.lanternCap} />
          <View style={[styles.sideLanternBody, { borderColor: ritualStyle.chipColor + '88' }]} />
          <View style={styles.lanternTassel} />
        </View>
        <View style={styles.sideLanternRight}>
          <View style={styles.lanternCap} />
          <View style={[styles.sideLanternBody, { borderColor: ritualStyle.chipColor + '88' }]} />
          <View style={styles.lanternTassel} />
        </View>

        <View style={styles.altarTable}>
          <View style={styles.tableBackLip} />
          <View style={styles.tableTop} />
          <View style={styles.tableFront}>
            <View style={styles.drawerLine} />
            <View style={styles.drawerKnob} />
          </View>
        </View>

        <View style={styles.leftCandleSet}>
          <View style={styles.candleFlameGlow} />
          <View style={styles.candleFlame} />
          <View style={styles.candleBody} />
          <View style={styles.candleBase} />
        </View>
        <View style={styles.rightCandleSet}>
          <View style={styles.candleFlameGlow} />
          <View style={styles.candleFlame} />
          <View style={styles.candleBody} />
          <View style={styles.candleBase} />
        </View>

        <View style={styles.offeringsLeft}>
          <View style={styles.plate} />
          <View style={[styles.orange, styles.orangeOne]} />
          <View style={[styles.orange, styles.orangeTwo]} />
          <View style={[styles.orange, styles.orangeThree]} />
        </View>
        <View style={styles.offeringsRight}>
          <View style={styles.vase}>
            <View style={styles.flowerStem} />
            <View style={[styles.flower, styles.flowerTop]} />
            <View style={[styles.flower, styles.flowerLeft]} />
            <View style={[styles.flower, styles.flowerRight]} />
          </View>
        </View>

        <View style={styles.censerWrap}>

          {!reducedMotion && (step === 'lit' || step === 'inserting' || step === 'placed') && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.smokeGroup,
                {
                  opacity: smokeOpacity,
                  transform: [
                    { translateX: smokeDrift },
                    { translateY: smokeRise },
                    { scaleX: smokeScaleX },
                  ],
                },
              ]}
            >
              <View style={[styles.smokePuffLarge, { backgroundColor: ritualStyle.glowColor + '18' }]} />
              <View style={[styles.smokePuffSmall, { backgroundColor: ritualStyle.chipColor + '16' }]} />
            </Animated.View>
          )}

          {step === 'placed' ? (
            <Image source={ritualStyle.censer.placedSprite} style={styles.fullCenserSprite} contentFit="contain" transition={150} />
          ) : (
            <View style={styles.censerSpriteViewport}>
              <Image source={ritualStyle.censer.emptySprite} style={styles.maskedCenserSprite} contentFit="cover" transition={150} />
            </View>
          )}

          {step !== 'placed' ? (
            <>
              <View style={styles.spriteTopMask} />
              <View
                style={[
                  styles.censerTopLip,
                  {
                    backgroundColor: ritualStyle.censer.lip,
                    borderColor: ritualStyle.censer.border,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.ashBurst,
                  {
                    backgroundColor: ritualStyle.censer.ashBurst,
                    opacity: ashBurstOpacity,
                    transform: [{ scale: ashBurstScale }, { translateY: ashBurstTranslateY }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.ashBed,
                  {
                    backgroundColor: ritualStyle.censer.ash,
                    transform: [{ scaleY: ashPressScaleY }, { translateY: ashPressTranslateY }],
                  },
                ]}
              />
            </>
          ) : (
            <Animated.View
              style={[
                styles.ashBurstPlaced,
                {
                  backgroundColor: ritualStyle.censer.ashBurst,
                  opacity: ashBurstOpacity,
                  transform: [{ scale: ashBurstScale }, { translateY: ashBurstTranslateY }],
                },
              ]}
            />
          )}

          <Pressable
            style={styles.dropZone}
            onPress={() => {
              if (step === 'lit') {
                placeIncenseInCenser();
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={step === 'lit' ? '將香奉入香爐' : '香爐'}
          />
        </View>

        <View style={styles.offerPanel}>
          <View style={styles.offerPanelTitleRow}>
            <Text style={styles.offerPanelTitle}>{'\u5100\u5f0f\u72c0\u614b'}</Text>
            <Text style={[styles.offerPanelTag, { color: ritualStyle.chipColor }]}>{ritualStyle.label}</Text>
          </View>
          <Text style={styles.offerPanelText}>{detailText}</Text>
        </View>

        {showHandIncense ? (
          <Animated.View
            style={[
              styles.handIncense,
              {
                transform: [
                  { translateX: incensePosition.x },
                  { translateY: combinedHandTranslateY },
                ],
              },
            ]}
            {...(step === 'lit' ? panResponder.panHandlers : {})}
          >
            <TouchableOpacity
              activeOpacity={step === 'idle' ? 0.85 : 1}
              onPress={step === 'idle' ? handleLight : undefined}
              hitSlop={18}
              accessibilityRole="button"
              accessibilityLabel={step === 'idle' ? '點燃香火' : '已點燃的香'}
            >
              <View style={styles.handPalm} />
              <View style={styles.bundleWrap}>
                {[0, 1, 2].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.handStick,
                      {
                        left: index * 8,
                        transform: [{ rotate: index === 0 ? '-4deg' : index === 2 ? '4deg' : '0deg' }],
                      },
                    ]}
                  >
                    <View style={[styles.handStickBody, { backgroundColor: ritualStyle.censer.accent }]} />
                    {step === 'lit' || step === 'inserting' ? (
                      <View style={styles.flameStack} pointerEvents="none">
                        <Animated.View
                          style={[
                            styles.flameGlow,
                            { opacity: flameGlowOpacity, transform: [{ scaleY: flameOuterScaleY }] },
                          ]}
                        />
                        <Animated.View
                          style={[
                            styles.flameOuter,
                            {
                              transform: [
                                { scaleY: flameOuterScaleY },
                                { scaleX: flameOuterScaleX },
                                { rotate: flameSway },
                              ],
                            },
                          ]}
                        />
                        <Animated.View
                          style={[
                            styles.flameCore,
                            { opacity: flameCoreOpacity, transform: [{ scale: flameCoreScale }] },
                          ]}
                        />
                        <Animated.View
                          style={[
                            styles.emberWisp,
                            {
                              opacity: emberWispOpacity,
                              transform: [{ translateY: emberWispTranslateY }, { scale: emberWispScale }],
                            },
                          ]}
                        />
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      </View>

      <Text style={styles.instruction}>{instruction}</Text>

      <View style={styles.actionRow}>
        {step === 'idle' ? (
          <TouchableOpacity
            style={styles.lightBtn}
            onPress={handleLight}
            accessibilityRole="button"
            accessibilityLabel="點燃香火"
          >
            <Text style={styles.lightBtnText}>{'\u9ede\u71c3\u9999\u706b'}</Text>
          </TouchableOpacity>
        ) : null}

        {step === 'lighting' ? (
          <View style={[styles.lightBtn, styles.lightBtnDisabled]} accessibilityRole="text">
            <Text style={styles.lightBtnText}>{'\u9999\u706b\u9ede\u71c3\u4e2d\u2026'}</Text>
          </View>
        ) : null}

        {step === 'lit' ? (
          <TouchableOpacity
            style={[styles.lightBtn, styles.offerBtn]}
            onPress={placeIncenseInCenser}
            accessibilityRole="button"
            accessibilityLabel="將香奉入香爐"
          >
            <Text style={styles.lightBtnText}>{'\u5c07\u9999\u5949\u5165\u9999\u7210'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
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
    paddingHorizontal: TempleSpacing.md,
    paddingBottom: TempleSpacing.xl,
  },
  title: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '700',
    color: theme.goldLight,
    marginBottom: TempleSpacing.xs,
  },
  godName: {
    fontSize: TempleFonts.body,
    color: theme.textMuted,
    marginBottom: TempleSpacing.md,
  },
  scene: {
    width: '100%',
    maxWidth: 460,
    height: 430,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: TempleSpacing.md,
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.goldDark + '24',
    backgroundColor: '#17100D',
  },
  backWall: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#1B100C',
  },
  wallPanel: {
    position: 'absolute',
    top: 14,
    left: 26,
    right: 26,
    height: 230,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.goldDark + '22',
    backgroundColor: '#2A1710',
  },
  centerHalo: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    width: 260,
    height: 210,
    borderRadius: 130,
  },
  ceilingLamp: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: 132,
    height: 34,
    borderBottomLeftRadius: 66,
    borderBottomRightRadius: 66,
    borderWidth: 1,
    backgroundColor: '#6A2B20',
  },
  shrineFrame: {
    position: 'absolute',
    top: 42,
    width: 176,
    alignItems: 'center',
    zIndex: 2,
  },
  shrineGlow: {
    position: 'absolute',
    top: 8,
    width: 178,
    height: 190,
    borderRadius: 88,
  },
  godPortraitFrame: {
    width: 132,
    height: 172,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: theme.goldDark,
    overflow: 'hidden',
    backgroundColor: '#120A07',
    shadowColor: theme.goldLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 5,
  },
  godPortraitImage: {
    width: '100%',
    height: '100%',
  },
  godPortraitVeil: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  godPortraitFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#342019',
  },
  godPortraitFallbackText: {
    color: theme.goldLight,
    fontSize: 30,
    fontWeight: '900',
  },
  nameTablet: {
    marginTop: -8,
    maxWidth: 166,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.goldDark + '80',
    backgroundColor: '#2B1710',
  },
  nameTabletText: {
    color: theme.goldLight,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  altarGlowLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 48,
    alignItems: 'center',
    zIndex: 1,
  },
  altarGlow: {
    position: 'absolute',
    bottom: 46,
    width: 300,
    height: 150,
    borderRadius: 90,
  },
  lowGlow: {
    position: 'absolute',
    bottom: -20,
    width: 390,
    height: 110,
    borderRadius: 80,
  },
  sideLanternLeft: {
    position: 'absolute',
    top: 58,
    left: 34,
    alignItems: 'center',
    zIndex: 2,
  },
  sideLanternRight: {
    position: 'absolute',
    top: 58,
    right: 34,
    alignItems: 'center',
    zIndex: 2,
  },
  lanternCap: {
    width: 28,
    height: 6,
    borderRadius: 4,
    backgroundColor: theme.goldDark,
  },
  sideLanternBody: {
    width: 34,
    height: 50,
    borderRadius: 17,
    borderWidth: 1,
    backgroundColor: '#AE2E24',
    shadowColor: '#FFB15E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
  },
  lanternTassel: {
    width: 2,
    height: 18,
    backgroundColor: theme.goldDark,
  },
  altarTable: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 28,
    height: 112,
    zIndex: 1,
  },
  tableBackLip: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 0,
    height: 18,
    borderRadius: 8,
    backgroundColor: '#5A2B18',
    borderWidth: 1,
    borderColor: '#9E6737',
  },
  tableTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 12,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#7B3D22',
    borderWidth: 1,
    borderColor: '#B77B42',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.36,
    shadowRadius: 16,
  },
  tableFront: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 42,
    height: 70,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: '#4A2416',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#8A5833',
    alignItems: 'center',
  },
  drawerLine: {
    marginTop: 18,
    width: '72%',
    height: 1,
    backgroundColor: '#A67244',
    opacity: 0.58,
  },
  drawerKnob: {
    marginTop: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.goldDark,
  },
  leftCandleSet: {
    position: 'absolute',
    left: 82,
    bottom: 118,
    alignItems: 'center',
    zIndex: 4,
  },
  rightCandleSet: {
    position: 'absolute',
    right: 82,
    bottom: 118,
    alignItems: 'center',
    zIndex: 4,
  },
  candleFlameGlow: {
    position: 'absolute',
    top: -12,
    width: 32,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#FFB84A55',
  },
  candleFlame: {
    width: 12,
    height: 22,
    borderRadius: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: '#FFD36B',
    shadowColor: '#FFD36B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: 10,
  },
  candleBody: {
    width: 16,
    height: 58,
    borderRadius: 7,
    backgroundColor: '#F3E5BD',
    borderWidth: 1,
    borderColor: '#CDA967',
  },
  candleBase: {
    width: 38,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#6D3A20',
    borderWidth: 1,
    borderColor: '#B98248',
  },
  offeringsLeft: {
    position: 'absolute',
    left: 76,
    bottom: 70,
    width: 82,
    height: 58,
    zIndex: 3,
  },
  plate: {
    position: 'absolute',
    bottom: 0,
    left: 3,
    right: 3,
    height: 18,
    borderRadius: 20,
    backgroundColor: '#D9C7A3',
    borderWidth: 1,
    borderColor: '#9E8354',
  },
  orange: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E98B32',
    borderWidth: 1,
    borderColor: '#F3B46C',
  },
  orangeOne: { left: 9, bottom: 12 },
  orangeTwo: { left: 28, bottom: 22 },
  orangeThree: { right: 8, bottom: 12 },
  offeringsRight: {
    position: 'absolute',
    right: 86,
    bottom: 68,
    width: 64,
    height: 82,
    alignItems: 'center',
    zIndex: 3,
  },
  vase: {
    position: 'absolute',
    bottom: 0,
    width: 30,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#456864',
    borderWidth: 1,
    borderColor: '#A9C9B7',
    alignItems: 'center',
  },
  flowerStem: {
    position: 'absolute',
    bottom: 32,
    width: 3,
    height: 34,
    backgroundColor: '#6E8A54',
  },
  flower: {
    position: 'absolute',
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#D86888',
    borderWidth: 1,
    borderColor: '#F0B5C4',
  },
  flowerTop: { top: -32, left: 23 },
  flowerLeft: { top: -18, left: 5 },
  flowerRight: { top: -14, right: 0 },
  censerWrap: {
    width: 230,
    height: 196,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 34,
    zIndex: 5,
  },
  dropZone: {
    position: 'absolute',
    top: 22,
    width: 110,
    height: 82,
    zIndex: 5,
  },
  smokeGroup: {
    position: 'absolute',
    top: -16,
    alignItems: 'center',
    zIndex: 6,
  },
  smokePuffLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  smokePuffSmall: {
    position: 'absolute',
    top: 10,
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  fullCenserSprite: {
    width: 220,
    height: 180,
  },
  censerSpriteViewport: {
    width: 220,
    height: 150,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  maskedCenserSprite: {
    width: 220,
    height: 180,
    transform: [{ translateY: 26 }],
  },
  spriteTopMask: {
    position: 'absolute',
    top: 32,
    width: 126,
    height: 50,
    borderRadius: 22,
    backgroundColor: theme.bgDark,
    zIndex: 2,
  },
  censerTopLip: {
    position: 'absolute',
    top: 64,
    width: 144,
    height: 16,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 3,
  },
  ashBed: {
    position: 'absolute',
    top: 67,
    width: 92,
    height: 11,
    borderRadius: 8,
    opacity: 0.65,
    zIndex: 4,
  },
  ashBurst: {
    position: 'absolute',
    top: 58,
    width: 118,
    height: 26,
    borderRadius: 16,
    opacity: 0,
    zIndex: 4,
  },
  ashBurstPlaced: {
    position: 'absolute',
    top: 54,
    width: 118,
    height: 26,
    borderRadius: 16,
    opacity: 0,
    zIndex: 6,
  },
  offerPanel: {
    position: 'absolute',
    left: 12,
    top: 12,
    width: 150,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: theme.bgCard + 'E8',
    borderWidth: 1,
    borderColor: theme.goldDark + '38',
    zIndex: 8,
  },
  offerPanelTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  offerPanelTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.goldLight,
  },
  offerPanelTag: {
    fontSize: 11,
    fontWeight: '800',
  },
  offerPanelText: {
    fontSize: 11,
    lineHeight: 16,
    color: theme.textMuted,
  },
  handIncense: {
    position: 'absolute',
    bottom: 6,
    right: 22,
    zIndex: 9,
    touchAction: 'none',
  },
  handPalm: {
    position: 'absolute',
    right: -10,
    bottom: -8,
    width: 50,
    height: 26,
    borderRadius: 18,
    backgroundColor: '#D8A37A',
    opacity: 0.86,
  },
  bundleWrap: {
    width: 26,
    height: 112,
  },
  handStick: {
    position: 'absolute',
    bottom: 0,
  },
  handStickBody: {
    width: 4,
    height: 104,
    borderRadius: 2,
  },
  flameStack: {
    position: 'absolute',
    top: -22,
    left: -9,
    width: 22,
    height: 26,
    alignItems: 'center',
  },
  flameGlow: {
    position: 'absolute',
    top: 0,
    width: 22,
    height: 26,
    borderRadius: 12,
    backgroundColor: '#FFB347',
  },
  flameOuter: {
    position: 'absolute',
    top: 6,
    width: 11,
    height: 18,
    borderRadius: 7,
    borderBottomLeftRadius: 2,
    backgroundColor: '#FF9142',
    shadowColor: '#FFD15A',
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  flameCore: {
    position: 'absolute',
    top: 13,
    width: 5,
    height: 9,
    borderRadius: 3,
    backgroundColor: '#FFE9A0',
  },
  emberWisp: {
    position: 'absolute',
    top: -4,
    width: 6,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#D9CFC2',
  },
  instruction: {
    fontSize: TempleFonts.body,
    lineHeight: 22,
    color: theme.textLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.md,
  },
  lightBtn: {
    paddingHorizontal: TempleSpacing.xl,
    paddingVertical: TempleSpacing.sm,
    borderRadius: 12,
    backgroundColor: theme.red,
    borderWidth: 1,
    borderColor: theme.gold,
  },
  actionRow: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: TempleSpacing.md,
  },
  offerBtn: {
    backgroundColor: '#7A3E17',
  },
  lightBtnDisabled: {
    opacity: 0.68,
  },
  lightBtnText: {
    fontSize: TempleFonts.body,
    fontWeight: '800',
    color: theme.goldLight,
  },
  });
}
