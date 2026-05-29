// 上香儀式互動元件
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder } from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';

interface IncenseRitualProps {
  godName: string;
  onComplete: () => void;
}

export function IncenseRitual({ godName, onComplete }: IncenseRitualProps) {
  const [step, setStep] = useState<'idle' | 'lighting' | 'lit' | 'placed'>('idle');
  const [litCount, setLitCount] = useState(0);
  const flameAnim = useRef(new Animated.Value(0)).current;
  const smokeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step === 'lit') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.timing(flameAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(smokeAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
          Animated.timing(smokeAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
        ])
      ).start();
    }
  }, [step]);

  const handleLight = () => {
    if (step === 'idle') {
      setStep('lighting');
      setTimeout(() => {
        setStep('lit');
        setLitCount(prev => prev + 1);
      }, 600);
    }
  };

  const handlePlace = () => {
    if (litCount >= 1) {
      setStep('placed');
      setTimeout(onComplete, 800);
    }
  };

  const flameOpacity = flameAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const smokeOpacity = smokeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.4] });
  const smokeScale = smokeAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 3] });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>上香祈福</Text>
      <Text style={styles.godName}>{godName}</Text>

      <View style={styles.scene}>
        {/* 香爐 */}
        <View style={styles.censer}>
          <View style={styles.censerBody} />
          <View style={styles.censerBase} />

          {/* 煙霧 */}
          {step === 'lit' && (
            <Animated.View style={[styles.smoke, { opacity: smokeOpacity, transform: [{ scale: smokeScale }, { translateY: -40 }] }]}>
              <View style={styles.smokeParticle} />
            </Animated.View>
          )}

          {/* 已插的香 */}
          {litCount > 0 && (
            <View style={styles.stickGroup}>
              {Array.from({ length: Math.min(litCount, 3) }).map((_, i) => (
                <View key={i} style={[styles.stick, { left: 20 + i * 12 }]}>
                  <View style={styles.stickBody} />
                  <Animated.View style={[styles.flame, { opacity: step === 'lit' && i === litCount - 1 ? flameOpacity : 0.5 }]} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 手持香 */}
        {step !== 'placed' && (
          <TouchableOpacity
            style={styles.handStick}
            onPress={step === 'idle' ? handleLight : step === 'lit' ? handlePlace : undefined}
          >
            <View style={styles.handStickBody} />
            {step === 'lit' && (
              <Animated.View style={[styles.flame, styles.handFlame, { opacity: flameOpacity }]} />
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.instruction}>
        {step === 'idle' && '點擊點燃線香'}
        {step === 'lighting' && '點燃中...'}
        {step === 'lit' && `已點燃 ${litCount} 炷香 · 點擊插入香爐`}
        {step === 'placed' && '上香完成 🙏'}
      </Text>

      {step === 'idle' && (
        <TouchableOpacity style={styles.lightBtn} onPress={handleLight}>
          <Text style={styles.lightBtnText}>點香</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: TempleSpacing.md },
  title: { fontSize: TempleFonts.subtitle, fontWeight: '700', color: TempleTheme.goldLight, marginBottom: TempleSpacing.xs },
  godName: { fontSize: TempleFonts.body, color: TempleTheme.textMuted, marginBottom: TempleSpacing.lg },
  scene: { height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: TempleSpacing.md },
  censer: { alignItems: 'center' },
  censerBody: { width: 100, height: 40, backgroundColor: '#8B6914', borderRadius: 20, borderWidth: 2, borderColor: '#5C3D1A' },
  censerBase: { width: 120, height: 10, backgroundColor: '#5C3D1A', borderRadius: 5, marginTop: 2 },
  smoke: { position: 'absolute', top: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: TempleTheme.goldDark + '30' },
  smokeParticle: { width: '100%', height: '100%', borderRadius: 40 },
  stickGroup: { position: 'absolute', top: -40 },
  stick: { position: 'absolute' },
  stickBody: { width: 3, height: 45, backgroundColor: '#D4A76A', borderRadius: 1 },
  flame: { width: 10, height: 15, borderRadius: 5, backgroundColor: TempleTheme.goldLight, position: 'absolute', top: -12, left: -3 },
  handStick: { position: 'absolute', bottom: 20, left: '50%', marginLeft: -1 },
  handStickBody: { width: 3, height: 50, backgroundColor: '#D4A76A', borderRadius: 1 },
  handFlame: { position: 'absolute', top: -10, left: -3 },
  instruction: { fontSize: TempleFonts.body, color: TempleTheme.textLight, textAlign: 'center', marginBottom: TempleSpacing.md },
  lightBtn: {
    paddingHorizontal: TempleSpacing.xxl, paddingVertical: TempleSpacing.md,
    borderRadius: 12, backgroundColor: TempleTheme.red, borderWidth: 1, borderColor: TempleTheme.goldDark,
  },
  lightBtnText: { fontSize: TempleFonts.heading, fontWeight: '700', color: TempleTheme.goldLight },
});
