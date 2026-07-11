// 孔明神數 / 報數取籤 - 數字輸入介面
import React, { useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { getZhugeNumberContext } from '@/data/poems/zhugeShenShu';

interface ZhugeNumberInputProps {
  onSubmit: (number: number) => void;
  title?: string;
  subtitle?: string;
  description?: string;
  confirmLabel?: string;
  tip?: string;
  placeholder?: string;
  showHexagramHint?: boolean;
  showContext?: boolean;
}

export function ZhugeNumberInput({
  onSubmit,
  title = '諸葛神數',
  subtitle = '思之數・報數問卦',
  description = '靜心冥想片刻，\n心中浮現一個數字，\n即為天機所示之卦象。',
  confirmLabel = '報數問卦 →',
  tip = '數字無上限，取模對應 64 卦',
  placeholder = '請報一數',
  showHexagramHint = true,
  showContext = true,
}: ZhugeNumberInputProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [digits, setDigits] = React.useState<string>('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1800, useNativeDriver: false }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, [glowAnim]);

  const handleDigit = (d: string) => {
    if (digits.length >= 6) return;
    setDigits(prev => prev + d);
  };

  const handleDelete = () => setDigits(prev => prev.slice(0, -1));
  const handleClear = () => setDigits('');

  const handleConfirm = () => {
    const n = parseInt(digits, 10);
    if (!digits || isNaN(n) || n <= 0) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      return;
    }
    onSubmit(n);
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.goldDark + '30', theme.gold + '80'],
  });

  const numberContext = React.useMemo(() => {
    if (!showContext) return null;
    const n = parseInt(digits, 10);
    return digits && !isNaN(n) && n > 0 ? getZhugeNumberContext(n) : null;
  }, [digits, showContext]);

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>

      {showHexagramHint ? (
        <View style={styles.hexagramHint}>
          <Text style={styles.hexagramText}>☰ ☱ ☲ ☳ ☴ ☵ ☶ ☷</Text>
          <Text style={styles.hexagramLabel}>六十四卦・易經推演</Text>
        </View>
      ) : null}

      <Animated.View style={[styles.displayBox, { borderColor: glowColor }]}>
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          {digits ? (
            <Text style={styles.displayNumber}>{digits}</Text>
          ) : (
            <Text style={styles.displayPlaceholder}>{placeholder}</Text>
          )}
        </Animated.View>
      </Animated.View>

      {numberContext ? (
        <View style={styles.contextBox}>
          <Text style={styles.contextTitle}>對應第 {numberContext.normalizedNumber} 數 · {numberContext.poem.title}</Text>
          <Text style={styles.contextMeta}>{numberContext.poem.ganzhi} · {numberContext.poem.level}</Text>
        </View>
      ) : null}

      <View style={styles.keypad}>
        {keys.map((key, i) => {
          if (key === '') return <View key={i} style={styles.keyEmpty} />;
          const isDelete = key === '⌫';
          return (
            <TouchableOpacity
              key={i}
              style={[styles.key, isDelete && styles.keyDelete]}
              onPress={() => isDelete ? handleDelete() : handleDigit(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.keyText, isDelete && styles.keyDeleteText]}>
                {key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>清除</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, !digits && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!digits}
        >
          <Text style={styles.confirmBtnText}>{confirmLabel}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tip}>{tip}</Text>
    </ScrollView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  scroll: {
    flexGrow: 1, alignItems: 'center',
    paddingHorizontal: TempleSpacing.lg, paddingVertical: TempleSpacing.md,
  },
  header: { alignItems: 'center', marginBottom: TempleSpacing.md },
  title: {
    fontSize: 28, fontWeight: '900', color: theme.goldLight,
    letterSpacing: 4, marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TempleFonts.body, color: theme.gold,
    fontWeight: '600', letterSpacing: 2, marginBottom: TempleSpacing.sm,
    textAlign: 'center',
  },
  desc: {
    fontSize: TempleFonts.small, color: theme.textMuted,
    textAlign: 'center', lineHeight: 22,
  },
  hexagramHint: {
    alignItems: 'center', marginBottom: TempleSpacing.md,
    backgroundColor: theme.bgCard, borderRadius: 12,
    paddingVertical: TempleSpacing.sm, paddingHorizontal: TempleSpacing.lg,
    borderWidth: 1, borderColor: theme.goldDark + '30',
  },
  hexagramText: { fontSize: 22, color: theme.goldLight, letterSpacing: 8, marginBottom: 4 },
  hexagramLabel: { fontSize: 11, color: theme.textMuted },
  displayBox: {
    width: '100%', height: 72, borderRadius: 16,
    backgroundColor: theme.bgCard, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: TempleSpacing.md,
  },
  displayNumber: {
    fontSize: 40, fontWeight: '700', color: theme.goldLight,
    letterSpacing: 6,
  },
  displayPlaceholder: {
    fontSize: TempleFonts.body, color: theme.textMuted + '60',
    letterSpacing: 3,
  },
  contextBox: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
    backgroundColor: theme.bgCard + 'AA',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: TempleSpacing.md,
    alignItems: 'center',
  },
  contextTitle: {
    fontSize: TempleFonts.small,
    color: theme.goldLight,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 3,
  },
  contextMeta: {
    fontSize: 11,
    color: theme.textMuted,
    textAlign: 'center',
  },
  keypad: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    width: '100%', gap: TempleSpacing.sm, marginBottom: TempleSpacing.md,
  },
  key: {
    width: '28%', aspectRatio: 1.8,
    backgroundColor: theme.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: theme.goldDark + '30',
    justifyContent: 'center', alignItems: 'center',
  },
  keyDelete: { backgroundColor: theme.bgDark },
  keyEmpty: { width: '28%' },
  keyText: { fontSize: 22, color: theme.textLight, fontWeight: '600' },
  keyDeleteText: { fontSize: 20, color: theme.textMuted },
  actions: {
    flexDirection: 'row', gap: TempleSpacing.md,
    width: '100%', marginBottom: TempleSpacing.sm,
  },
  clearBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: theme.goldDark + '40',
    alignItems: 'center',
  },
  clearBtnText: { fontSize: TempleFonts.body, color: theme.textMuted },
  confirmBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    backgroundColor: theme.red, alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { fontSize: TempleFonts.body, fontWeight: '700', color: theme.goldLight, letterSpacing: 2, textAlign: 'center' },
  tip: { fontSize: 11, color: theme.textMuted + '80', marginTop: 4, textAlign: 'center' },
  });
}