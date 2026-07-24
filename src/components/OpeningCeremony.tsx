import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';

export const OPENING_VARIANTS = ['temple', 'incense', 'seal', 'lotus', 'radiance'] as const;
export type OpeningVariant = (typeof OPENING_VARIANTS)[number];

const COPY: Record<OpeningVariant, [string, string]> = {
  temple: ['廟門初啟', '入境・靜心・誠問'],
  incense: ['一炷心香', '心誠則靈'],
  seal: ['神印開示', '敬天知命・問心求解'],
  lotus: ['蓮華清淨', '澄心一念・自有明示'],
  radiance: ['金光引路', '所問皆明・所行皆安'],
};

export function pickOpeningVariant(randomValue = Math.random()): OpeningVariant {
  const value = Number.isFinite(randomValue) ? Math.max(0, Math.min(0.999999, randomValue)) : 0;
  return OPENING_VARIANTS[Math.floor(value * OPENING_VARIANTS.length)];
}

export function OpeningCeremony({
  variant: selectedVariant,
  onFinish,
}: {
  variant?: OpeningVariant;
  onFinish?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const variant = useMemo(() => selectedVariant ?? pickOpeningVariant(), [selectedVariant]);
  const [visible, setVisible] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const finishing = useRef(false);

  const finish = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;
    Animated.timing(opacity, {
      toValue: 0,
      duration: reduceMotion ? 100 : 360,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onFinish?.();
    });
  }, [onFinish, opacity, reduceMotion]);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: reduceMotion ? 650 : 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => finished && finish());
    return () => animation.stop();
  }, [finish, progress, reduceMotion]);

  if (!visible) return null;

  const wordsOpacity = progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] });
  const wordsLift = progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [18, 0, 0] });

  return (
    <Animated.View
      accessibilityViewIsModal
      accessibilityLabel={`神明占卜開場動畫：${COPY[variant][0]}`}
      style={[styles.overlay, { opacity }]}
    >
      <View pointerEvents='none' style={styles.glow} />
      <View pointerEvents='none' style={styles.stage}>
        {reduceMotion ? <StaticSeal /> : <OpeningVisual variant={variant} progress={progress} />}
        <Animated.View style={[styles.words, { opacity: wordsOpacity, transform: [{ translateY: wordsLift }] }]}>
          <Text style={styles.eyebrow}>{COPY[variant][0]}</Text>
          <Text style={styles.title}>神明占卜</Text>
          <View style={styles.rule}><View style={styles.line} /><View style={styles.diamond} /><View style={styles.line} /></View>
          <Text style={styles.blessing}>{COPY[variant][1]}</Text>
        </Animated.View>
      </View>
      <TouchableOpacity
        accessibilityRole='button'
        accessibilityLabel='略過開場動畫'
        activeOpacity={0.7}
        onPress={finish}
        style={styles.skip}
      >
        <Text style={styles.skipText}>略過</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function OpeningVisual({ variant, progress }: { variant: OpeningVariant; progress: Animated.Value }) {
  if (variant === 'temple') return <TempleGate progress={progress} />;
  if (variant === 'incense') return <Incense progress={progress} />;
  if (variant === 'seal') return <DivineSeal progress={progress} />;
  if (variant === 'lotus') return <Lotus progress={progress} />;
  return <Radiance progress={progress} />;
}

function TempleGate({ progress }: { progress: Animated.Value }) {
  const travel = Dimensions.get('window').width * 0.56;
  const left = progress.interpolate({ inputRange: [0, 0.12, 0.65, 1], outputRange: [0, 0, -travel, -travel] });
  const sealOpacity = progress.interpolate({ inputRange: [0, 0.12, 0.55, 0.72, 1], outputRange: [0, 1, 1, 0, 0] });
  return (
    <View style={styles.doors}>
      <Animated.View style={[styles.door, { transform: [{ translateX: left }] }]}><DoorStuds /></Animated.View>
      <Animated.View style={[styles.door, { transform: [{ translateX: Animated.multiply(left, -1) }] }]}><DoorStuds /></Animated.View>
      <Animated.View style={[styles.roundSeal, { opacity: sealOpacity }]}><Text style={styles.roundSealText}>啟</Text></Animated.View>
    </View>
  );
}

function DoorStuds() {
  return <View style={styles.studs}>{Array.from({ length: 8 }, (_, i) => <View key={i} style={styles.stud} />)}</View>;
}

function Incense({ progress }: { progress: Animated.Value }) {
  const rise = progress.interpolate({ inputRange: [0, 0.18, 1], outputRange: [36, 36, -88] });
  const smokeOpacity = progress.interpolate({ inputRange: [0, 0.2, 0.6, 1], outputRange: [0, 0.72, 0.46, 0] });
  const bowlScale = progress.interpolate({ inputRange: [0, 0.2, 0.42, 1], outputRange: [0.7, 0.7, 1, 1] });
  return (
    <View style={styles.iconStage}>
      {[0, 1, 2].map(i => <Animated.View key={i} style={[styles.smoke, { left: 68 + i * 27, opacity: smokeOpacity, transform: [{ translateY: rise }, { rotate: `${i % 2 ? -10 : 13}deg` }] }]} />)}
      <Animated.View style={[styles.bowl, { transform: [{ scale: bowlScale }] }]}>
        <View style={styles.stick} /><View style={styles.ember} /><Text style={styles.bowlText}>福</Text>
      </Animated.View>
    </View>
  );
}

function DivineSeal({ progress }: { progress: Animated.Value }) {
  const scale = progress.interpolate({ inputRange: [0, 0.15, 0.43, 0.55, 1], outputRange: [2.7, 2.7, 0.88, 1.08, 1] });
  const sealOpacity = progress.interpolate({ inputRange: [0, 0.13, 0.32, 1], outputRange: [0, 0, 1, 1] });
  const rotate = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-18deg', '2deg', '0deg'] });
  return <Animated.View style={[styles.squareSeal, { opacity: sealOpacity, transform: [{ scale }, { rotate }] }]}><Text style={styles.squareSealText}>神</Text></Animated.View>;
}

function Lotus({ progress }: { progress: Animated.Value }) {
  const scale = progress.interpolate({ inputRange: [0, 0.18, 0.65, 1], outputRange: [0.1, 0.1, 1, 1] });
  const petalOpacity = progress.interpolate({ inputRange: [0, 0.2, 0.5, 1], outputRange: [0, 0, 0.9, 0.9] });
  return (
    <View style={styles.lotus}>
      {Array.from({ length: 10 }, (_, i) => (
        <Animated.View key={i} style={[styles.petalAnchor, { transform: [{ rotate: `${i * 36}deg` }, { scale }] }]}>
          <Animated.View style={[styles.petal, { opacity: petalOpacity }]} />
        </Animated.View>
      ))}
      <Animated.View style={[styles.lotusCore, { transform: [{ scale }] }]}><Text style={styles.coreText}>心</Text></Animated.View>
    </View>
  );
}

function Radiance({ progress }: { progress: Animated.Value }) {
  const scale = progress.interpolate({ inputRange: [0, 0.18, 0.65, 1], outputRange: [0.08, 0.08, 1, 1.08] });
  const rayOpacity = progress.interpolate({ inputRange: [0, 0.2, 0.58, 1], outputRange: [0, 0, 0.56, 0.18] });
  return (
    <View style={styles.radiance}>
      {Array.from({ length: 16 }, (_, i) => <Animated.View key={i} style={[styles.rayAnchor, { opacity: rayOpacity, transform: [{ rotate: `${i * 22.5}deg` }, { scaleY: scale }] }]}><View style={styles.ray} /></Animated.View>)}
      <Animated.View style={[styles.orb, { transform: [{ scale }] }]}><Text style={styles.orbText}>明</Text></Animated.View>
    </View>
  );
}

function StaticSeal() {
  return <View style={styles.staticSeal}><Text style={styles.staticSealText}>神</Text></View>;
}

const gold = '#E7BE6A';
const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 10000, elevation: 10000, backgroundColor: '#160A06', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glow: { position: 'absolute', width: 430, height: 430, borderRadius: 215, backgroundColor: '#5B2112', opacity: 0.26 },
  stage: { width: '100%', maxWidth: 560, height: 480, alignItems: 'center', justifyContent: 'center' },
  words: { position: 'absolute', top: 286, left: 20, right: 20, alignItems: 'center' },
  eyebrow: { color: '#C99A46', fontSize: 12, fontWeight: '700', letterSpacing: 5, marginBottom: 12 },
  title: { color: '#F5D58A', fontFamily: 'serif', fontSize: 42, fontWeight: '900', letterSpacing: 8, textShadowColor: '#A75F2A', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 16 },
  rule: { width: 170, flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  line: { flex: 1, height: 1, backgroundColor: '#8C5A24' },
  diamond: { width: 7, height: 7, marginHorizontal: 9, backgroundColor: '#D5A64E', transform: [{ rotate: '45deg' }] },
  blessing: { color: '#A9977E', fontSize: 13, letterSpacing: 3 },
  skip: { position: 'absolute', right: 20, top: 52, minWidth: 62, minHeight: 42, borderWidth: 1, borderColor: '#6E4A2C', borderRadius: 22, backgroundColor: '#201008', alignItems: 'center', justifyContent: 'center' },
  skipText: { color: '#C4AD86', fontSize: 12, letterSpacing: 2 },
  doors: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, flexDirection: 'row' },
  door: { width: '50%', backgroundColor: '#681A12', borderWidth: 2, borderColor: '#A96E2E', justifyContent: 'center', padding: 22 },
  studs: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 38 },
  stud: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#D6A14B', borderWidth: 1, borderColor: '#F2D183' },
  roundSeal: { position: 'absolute', left: '50%', top: '50%', marginLeft: -34, marginTop: -34, width: 68, height: 68, borderRadius: 34, backgroundColor: '#A32619', borderWidth: 3, borderColor: gold, alignItems: 'center', justifyContent: 'center' },
  roundSealText: { color: '#F4D58C', fontSize: 28, fontWeight: '900' },
  iconStage: { width: 220, height: 220, alignItems: 'center', justifyContent: 'flex-end', marginBottom: 108 },
  bowl: { width: 124, height: 62, borderBottomLeftRadius: 54, borderBottomRightRadius: 54, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderWidth: 2, borderColor: '#C38A3A', backgroundColor: '#5D2118', alignItems: 'center', justifyContent: 'center' },
  bowlText: { color: gold, fontSize: 22, fontWeight: '900' },
  stick: { position: 'absolute', bottom: 52, width: 4, height: 84, backgroundColor: '#A73B25' },
  ember: { position: 'absolute', bottom: 133, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD783' },
  smoke: { position: 'absolute', bottom: 112, width: 22, height: 84, borderRadius: 18, borderLeftWidth: 3, borderColor: '#D8CAB7' },
  squareSeal: { width: 154, height: 154, borderWidth: 5, borderColor: '#D4A553', borderRadius: 18, backgroundColor: '#842019', marginBottom: 132, alignItems: 'center', justifyContent: 'center' },
  squareSealText: { color: '#F0CD84', fontSize: 78, fontWeight: '900', fontFamily: 'serif' },
  lotus: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 126 },
  petalAnchor: { position: 'absolute', width: 42, height: 174, alignItems: 'center' },
  petal: { width: 40, height: 94, borderRadius: 28, backgroundColor: '#9E2931', borderWidth: 1, borderColor: '#E5A55F' },
  lotusCore: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#D39A3B', borderWidth: 2, borderColor: '#F4D58C', alignItems: 'center', justifyContent: 'center' },
  coreText: { color: '#4B170E', fontSize: 30, fontWeight: '900' },
  radiance: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center', marginBottom: 122 },
  rayAnchor: { position: 'absolute', width: 5, height: 230, alignItems: 'center' },
  ray: { width: 3, height: 78, backgroundColor: gold, borderRadius: 3 },
  orb: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: '#8A2317', borderWidth: 2, borderColor: '#EBCB7C', shadowColor: '#F3B94F', shadowOpacity: 0.85, shadowRadius: 28, elevation: 12 },
  orbText: { color: '#F5D58A', fontSize: 48, fontWeight: '900', fontFamily: 'serif' },
  staticSeal: { width: 132, height: 132, marginBottom: 128, borderRadius: 66, borderWidth: 2, borderColor: '#D1A454', backgroundColor: '#7F2118', alignItems: 'center', justifyContent: 'center' },
  staticSealText: { color: '#F2D38A', fontSize: 58, fontWeight: '900', fontFamily: 'serif' },
});
