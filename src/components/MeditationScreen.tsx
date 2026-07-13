// 冥想引導元件
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, useWindowDimensions } from 'react-native';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';

interface MeditationProps {
  godName: string;
  onComplete: () => void;
}

export function MeditationScreen({ godName, onComplete }: MeditationProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
        const next = Math.min(5, prev + 1);
        if (next === 5) {
          clearInterval(timer);
          setIsReady(true);
        }
        return next;
      });
    }, 1000);

    return () => {
      pulse.stop();
      clearInterval(timer);
    };
  }, []);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
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
          {isReady ? '\u5df2\u5b8c\u6210\u975c\u5fc3 \u00b7 \u53ef\u4ee5\u9078\u64c7\u62bd\u7c64\u65b9\u5f0f' : `\u975c\u5fc3\u51a5\u60f3\u4e2d... ${5 - seconds}`}

        </Text>
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, isCompact && styles.continueBtnCompact, isReady && styles.continueBtnActive]}
        onPress={isReady ? onComplete : undefined}
        disabled={!isReady}
      >
        <Text style={[styles.continueBtnText, isReady && styles.continueBtnTextActive]}>
          {isReady ? '\u9078\u64c7\u62bd\u7c64\u65b9\u5f0f' : '\u8acb\u975c\u5fc3\u7b49\u5f85...'}

        </Text>
      </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: TempleSpacing.lg,
    paddingVertical: TempleSpacing.lg,
  },
  containerCompact: {
    paddingHorizontal: TempleSpacing.md,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.goldDark + '15',
    top: '30%',
  },
  godName: {
    fontSize: TempleFonts.title,
    fontWeight: '900',
    color: theme.goldLight,
    marginBottom: TempleSpacing.xl,
    letterSpacing: 6,
  },
  godNameCompact: { fontSize: 28, letterSpacing: 4, textAlign: 'center' },
  instructionBox: {
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    padding: TempleSpacing.lg,
    borderWidth: 1,
    borderColor: theme.goldDark + '40',
    width: '100%',
    marginBottom: TempleSpacing.xl,
  },
  instructionTitle: {
    fontSize: TempleFonts.heading,
    fontWeight: '700',
    color: theme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.md,
  },
  instructionText: {
    fontSize: TempleFonts.body,
    color: theme.textLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.md,
    lineHeight: 24,
  },
  instructionDetail: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
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
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
  },
  progressDotActive: {
    backgroundColor: theme.gold,
    borderColor: theme.goldLight,
  },
  progressText: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
  },
  continueBtn: {
    paddingHorizontal: TempleSpacing.xxl,
    paddingVertical: TempleSpacing.md,
    borderRadius: 12,
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
  },
  continueBtnCompact: { width: '100%', maxWidth: 320, alignItems: 'center' },
  continueBtnActive: {
    backgroundColor: theme.red,
    borderColor: theme.gold,
  },
  continueBtnText: {
    fontSize: TempleFonts.heading,
    fontWeight: '700',
    color: theme.textMuted,
    letterSpacing: 4,
  },
  continueBtnTextActive: {
    color: theme.goldLight,
  },
  });
}
