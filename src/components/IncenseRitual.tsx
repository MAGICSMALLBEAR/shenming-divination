import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { RitualStylePicker } from '@/components/RitualStylePicker';
import { ritualStyles, type RitualStyleKey } from '@/constants/ritual-styles';
import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import { playIncenseSound } from '@/services/proceduralSound';

interface IncenseRitualProps {
  godName: string;
  onComplete: () => void;
  ritualStyleKey: RitualStyleKey;
  onStyleChange: (next: RitualStyleKey) => void;
}

type RitualStep = 'idle' | 'lighting' | 'lit' | 'placed';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const HAND_INCENSE_START = { x: 0, y: 0 };

export function IncenseRitual({
  godName,
  onComplete,
  ritualStyleKey,
  onStyleChange,
}: IncenseRitualProps) {
  const [step, setStep] = useState<RitualStep>('idle');
  const [dropZoneRect, setDropZoneRect] = useState<Rect | null>(null);
  const [sceneLayout, setSceneLayout] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const ritualStyle = ritualStyles[ritualStyleKey];

  const dropZoneRef = useRef<View>(null);
  const sceneRef = useRef<View>(null);
  const incensePosition = useRef(new Animated.ValueXY(HAND_INCENSE_START)).current;
  const incenseLift = useRef(new Animated.Value(0)).current;
  const flameAnim = useRef(new Animated.Value(0)).current;
  const smokeAnim = useRef(new Animated.Value(0)).current;
  const ashPressAnim = useRef(new Animated.Value(0)).current;
  const ashBurstAnim = useRef(new Animated.Value(0)).current;

  // Calculate drop zone rect from scene layout + known style offsets
  const calcDropZoneFromLayout = (): Rect | null => {
    if (!sceneLayout) return null;
    // censerWrap: width=230, centered in scene, bottom-aligned
    const cwW = 230;
    const cwH = 196;
    const cwX = (sceneLayout.width - cwW) / 2;
    const cwY = sceneLayout.height - cwH - 34; // marginBottom: 34
    // dropZone: absolute within censerWrap, top=22, width=110, height=82, centered
    const dzW = 110;
    const dzH = 82;
    const dzX = cwX + (cwW - dzW) / 2;
    const dzY = cwY + 22;
    return { x: dzX, y: dzY, width: dzW, height: dzH };
  };

  const measureDropZoneInWindow = () => {
    // Set layout-based rect immediately (reliable fallback for web)
    const fromLayout = calcDropZoneFromLayout();
    if (fromLayout) {
      setDropZoneRect(fromLayout);
    }
    // Also try measureInWindow for screen coordinates (better for drag detection)
    requestAnimationFrame(() => {
      dropZoneRef.current?.measureInWindow((x, y, width, height) => {
        if (width && height) {
          setDropZoneRect({ x, y, width, height });
        }
      });
    });
  };

  useEffect(() => {
    if (step !== 'lit' && step !== 'placed') {
      return;
    }

    const flameLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: false,
        }),
        Animated.timing(flameAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: false,
        }),
      ])
    );

    const smokeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(smokeAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(smokeAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: false,
        }),
      ])
    );

    flameLoop.start();
    smokeLoop.start();

    return () => {
      flameLoop.stop();
      smokeLoop.stop();
    };
  }, [flameAnim, smokeAnim, step]);

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
    if (!sceneLayout) return;

    const { width: sw, height: sh } = sceneLayout;
    const dzCx = sw / 2;
    const dzCy = sh - 167;
    const handCx = sw - 35;
    const handCy = sh - 62;

    // Translation needed: move from hand natural position to drop zone center
    const targetX = dzCx - handCx;
    const targetY = dzCy - handCy - 4; // slight upward nudge

    setStep('placed');
    setIsDragging(false);

    Animated.parallel([
      Animated.spring(incensePosition, {
        toValue: { x: targetX, y: targetY },
        friction: 8,
        tension: 80,
        useNativeDriver: false,
      }),
      Animated.spring(incenseLift, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: false,
      }),
    ]).start(async () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ashPressAnim, {
            toValue: 1,
            duration: 120,
            useNativeDriver: false,
          }),
          Animated.timing(ashBurstAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: false,
          }),
        ]),
        Animated.timing(ashPressAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }),
        Animated.timing(ashBurstAnim, {
          toValue: 0,
          duration: 420,
          useNativeDriver: false,
        }),
      ]).start();

      await playIncenseSound().catch(() => {});
      setTimeout(onComplete, 950);
    });
  };

  const isInsideDropZone = (_screenX: number, _screenY: number) => {
    // Use scene-relative coordinates for reliable cross-platform detection
    if (!sceneLayout) return false;

    const { width: sw, height: sh } = sceneLayout;
    // Drop zone bounds in scene coordinates
    const dzX = (sw - 230) / 2 + (230 - 110) / 2; // centered in censerWrap
    const dzY = sh - 196 - 34 + 22; // censerWrap bottom + dropZone top
    const dzW = 110;
    const dzH = 82;

    // Current incense center in scene coords (natural pos + current drag offset)
     
    const curX = (incensePosition.x as any)._value as number;
     
    const curY = (incensePosition.y as any)._value as number;
     
    const curLift = (incenseLift as any)._value as number;
    const handCx = sw - 35 + curX;
    const handCy = sh - 62 + curY + curLift;

    // Expanded hit area for easier targeting (increased for Web/Mobile ease of use)
    const margin = 140;
    return (
      handCx >= dzX - margin &&
      handCx <= dzX + dzW + margin &&
      handCy >= dzY - margin &&
      handCy <= dzY + dzH + margin
    );
  };

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
        onPanResponderRelease: (_, gestureState) => {
          incensePosition.flattenOffset();
          setIsDragging(false);
          if (isInsideDropZone(gestureState.moveX, gestureState.moveY)) {
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
    [incenseLift, incensePosition, step, dropZoneRect]
  );

  const flameOpacity = flameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });
  const combinedHandTranslateY = Animated.add(incensePosition.y, incenseLift);
  const smokeOpacity = smokeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.38],
  });
  const smokeScale = smokeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.8],
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
          : '\u4e09\u70b7\u9999\u5df2\u5165\u7210\uff0c\u7a0d\u5f8c\u5c31\u80fd\u9032\u5165\u4e0b\u4e00\u6bb5\u5100\u5f0f\u3002';

  const detailText =
    step === 'idle'
      ? '\u5148\u8f15\u9ede\u9999\u675f\uff0c\u5b8c\u6210\u9ede\u9999\u5f8c\u518d\u5c07\u9999\u5949\u5165\u9999\u7210\u3002'
      : step === 'lighting'
        ? '\u8b93\u5fc3\u7dd2\u6162\u4e0b\u4f86\uff0c\u7b49\u9999\u706b\u7a69\u5b9a\u3002'
        : step === 'lit'
          ? '\u628a\u9999\u79fb\u5230\u7210\u53e3\u4e0a\u65b9\uff0c\u63d2\u5165\u6642\u6703\u6709\u9999\u7070\u4e0b\u58d3\u8207\u63da\u7070\u53cd\u61c9\u3002'
          : '\u9999\u5df2\u5b89\u5ea7\uff0c\u8acb\u7a0d\u5019\u795e\u524d\u56de\u61c9\u3002';

  const showHandIncense = step !== 'placed';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{'\u4e0a\u9999\u5100\u5f0f'}</Text>
      <Text style={styles.godName}>{`\u5411 ${godName} \u7a1f\u544a\u5fc3\u610f`}</Text>
      <RitualStylePicker value={ritualStyleKey} onChange={onStyleChange} />

      <View
        ref={sceneRef}
        style={styles.scene}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setSceneLayout({ width, height });
          measureDropZoneInWindow();
        }}
      >
        <View style={[styles.altarGlow, { backgroundColor: ritualStyle.glowColor + '18' }]} />

        <View style={styles.censerWrap}>
          <Pressable
            ref={dropZoneRef}
            style={styles.dropZone}
            onLayout={measureDropZoneInWindow}
            onPress={() => {
              if (step === 'lit') {
                placeIncenseInCenser();
              }
            }}
          />

          {(step === 'lit' || step === 'placed') && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.smokeGroup,
                {
                  opacity: smokeOpacity,
                  transform: [{ scale: smokeScale }, { translateY: -18 }],
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
            <TouchableOpacity activeOpacity={step === 'idle' ? 0.85 : 1} onPress={step === 'idle' ? handleLight : undefined}>
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
                    {step === 'lit' ? (
                      <Animated.View style={[styles.handFlame, { opacity: index === 1 ? flameOpacity : 0.75 }]} />
                    ) : null}
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      </View>

      <Text style={styles.instruction}>{instruction}</Text>

      {step === 'idle' ? (
        <TouchableOpacity style={styles.lightBtn} onPress={handleLight}>
          <Text style={styles.lightBtnText}>{'\u9ede\u71c3\u9999\u706b'}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
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
  godName: {
    fontSize: TempleFonts.body,
    color: TempleTheme.textMuted,
    marginBottom: TempleSpacing.md,
  },
  scene: {
    width: '100%',
    maxWidth: 420,
    height: 360,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: TempleSpacing.md,
  },
  altarGlow: {
    position: 'absolute',
    bottom: 46,
    width: 280,
    height: 140,
    borderRadius: 90,
  },
  censerWrap: {
    width: 230,
    height: 196,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 34,
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
    backgroundColor: TempleTheme.bgDark,
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
    left: 8,
    top: 14,
    right: 8,
    borderRadius: 16,
    padding: TempleSpacing.md,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '28',
  },
  offerPanelTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  offerPanelTitle: {
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: TempleTheme.goldLight,
  },
  offerPanelTag: {
    fontSize: 11,
    fontWeight: '800',
  },
  offerPanelText: {
    fontSize: TempleFonts.small,
    lineHeight: 18,
    color: TempleTheme.textMuted,
  },
  handIncense: {
    position: 'absolute',
    bottom: 6,
    right: 22,
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
  handFlame: {
    position: 'absolute',
    top: -11,
    left: -3,
    width: 10,
    height: 16,
    borderRadius: 6,
    backgroundColor: '#FFB347',
    shadowColor: '#FFD15A',
    shadowOpacity: 0.55,
    shadowRadius: 8,
  },
  instruction: {
    fontSize: TempleFonts.body,
    lineHeight: 22,
    color: TempleTheme.textLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.md,
  },
  lightBtn: {
    paddingHorizontal: TempleSpacing.xl,
    paddingVertical: TempleSpacing.sm,
    borderRadius: 12,
    backgroundColor: TempleTheme.red,
    borderWidth: 1,
    borderColor: TempleTheme.gold,
  },
  lightBtnText: {
    fontSize: TempleFonts.body,
    fontWeight: '800',
    color: TempleTheme.goldLight,
  },
});
