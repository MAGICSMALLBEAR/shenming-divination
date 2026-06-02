// 冥想引導元件
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';

interface MeditationProps {
  godName: string;
  onComplete: () => void;
}

export function MeditationScreen({ godName, onComplete }: MeditationProps) {
  const { width } = useWindowDimensions();
  const [seconds, setSeconds] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isCompact = width < 420;
  const contentMaxWidth = width >= 960 ? 720 : 560;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 2000, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
      ])
    );
    pulse.start();

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev >= 5) {
          clearInterval(timer);
          setIsReady(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      pulse.stop();
      clearInterval(timer);
    };
  }, []);

  return (
    <Animated.View style={[styles.container, isCompact && styles.containerCompact, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.glow, { transform: [{ scale: pulseAnim }] }]} />

      <Text style={[styles.godName, isCompact && styles.godNameCompact]}>{godName}</Text>

      <View style={[styles.instructionBox, { maxWidth: contentMaxWidth }]}>
        <Text style={styles.instructionTitle}>靜心冥想</Text>
        <Text style={styles.instructionText}>請閉上雙眼，深呼吸三次</Text>
        <Text style={styles.instructionDetail}>
          心中默念您的姓名、生辰、住址{'\n'}
          以及今日所求之事{'\n'}
          專注心神，以至誠之心感應神明
        </Text>
      </View>

      <View style={styles.progressArea}>
        <View style={styles.progressDots}>
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} style={[styles.progressDot, i <= seconds && styles.progressDotActive]} />
          ))}
        </View>
        <Text style={styles.progressText}>
          {isReady ? '已完成靜心 · 可以擲筊' : `靜心冥想中... ${5 - seconds}`}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, isCompact && styles.continueBtnCompact, isReady && styles.continueBtnActive]}
        onPress={isReady ? onComplete : undefined}
        disabled={!isReady}
      >
        <Text style={[styles.continueBtnText, isReady && styles.continueBtnTextActive]}>
          {isReady ? '開始擲筊' : '請靜心等待...'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: TempleSpacing.lg,
  },
  containerCompact: {
    paddingHorizontal: TempleSpacing.md,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: TempleTheme.goldDark + '15',
    top: '30%',
  },
  godName: {
    fontSize: TempleFonts.title,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    marginBottom: TempleSpacing.xl,
    letterSpacing: 6,
  },
  godNameCompact: { fontSize: 28, letterSpacing: 4, textAlign: 'center' },
  instructionBox: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 16,
    padding: TempleSpacing.lg,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
    width: '100%',
    marginBottom: TempleSpacing.xl,
  },
  instructionTitle: {
    fontSize: TempleFonts.heading,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.md,
  },
  instructionText: {
    fontSize: TempleFonts.body,
    color: TempleTheme.textLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.md,
    lineHeight: 24,
  },
  instructionDetail: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressArea: {
    alignItems: 'center',
    marginBottom: TempleSpacing.xl,
  },
  progressDots: {
    flexDirection: 'row',
    gap: TempleSpacing.sm,
    marginBottom: TempleSpacing.sm,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
  },
  progressDotActive: {
    backgroundColor: TempleTheme.gold,
    borderColor: TempleTheme.goldLight,
  },
  progressText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
  },
  continueBtn: {
    paddingHorizontal: TempleSpacing.xxl,
    paddingVertical: TempleSpacing.md,
    borderRadius: 12,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
  },
  continueBtnCompact: { width: '100%', maxWidth: 320, alignItems: 'center' },
  continueBtnActive: {
    backgroundColor: TempleTheme.red,
    borderColor: TempleTheme.gold,
  },
  continueBtnText: {
    fontSize: TempleFonts.heading,
    fontWeight: '700',
    color: TempleTheme.textMuted,
    letterSpacing: 4,
  },
  continueBtnTextActive: {
    color: TempleTheme.goldLight,
  },
});
