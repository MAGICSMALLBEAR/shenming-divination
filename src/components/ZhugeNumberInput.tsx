// 孔明神數 - 報數輸入介面
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';

interface ZhugeNumberInputProps {
  onSubmit: (number: number) => void;
}

export function ZhugeNumberInput({ onSubmit }: ZhugeNumberInputProps) {
  const [digits, setDigits] = React.useState<string>('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1800, useNativeDriver: false }),
      ])
    ).start();
  }, []);

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
    outputRange: [TempleTheme.goldDark + '30', TempleTheme.gold + '80'],
  });

  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {/* 說明 */}
      <View style={styles.header}>
        <Text style={styles.title}>諸葛神數</Text>
        <Text style={styles.subtitle}>思之數・報數問卦</Text>
        <Text style={styles.desc}>
          靜心冥想片刻，{'\n'}心中浮現一個數字，{'\n'}即為天機所示之卦象。
        </Text>
      </View>

      {/* 六十四卦示意 */}
      <View style={styles.hexagramHint}>
        <Text style={styles.hexagramText}>☰ ☱ ☲ ☳ ☴ ☵ ☶ ☷</Text>
        <Text style={styles.hexagramLabel}>六十四卦・易經推演</Text>
      </View>

      {/* 數字顯示區 */}
      <Animated.View style={[styles.displayBox, { borderColor: glowColor }]}>
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          {digits ? (
            <Text style={styles.displayNumber}>{digits}</Text>
          ) : (
            <Text style={styles.displayPlaceholder}>請報一數</Text>
          )}
        </Animated.View>
      </Animated.View>

      {/* 數字鍵盤 */}
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

      {/* 操作按鈕 */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>清除</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, !digits && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!digits}
        >
          <Text style={styles.confirmBtnText}>報數問卦 →</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tip}>數字無上限，取模對應 64 卦</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1, alignItems: 'center',
    paddingHorizontal: TempleSpacing.lg, paddingVertical: TempleSpacing.md,
  },
  header: { alignItems: 'center', marginBottom: TempleSpacing.md },
  title: {
    fontSize: 28, fontWeight: '900', color: TempleTheme.goldLight,
    letterSpacing: 6, marginBottom: 4,
  },
  subtitle: {
    fontSize: TempleFonts.body, color: TempleTheme.gold,
    fontWeight: '600', letterSpacing: 3, marginBottom: TempleSpacing.sm,
  },
  desc: {
    fontSize: TempleFonts.small, color: TempleTheme.textMuted,
    textAlign: 'center', lineHeight: 22,
  },
  hexagramHint: {
    alignItems: 'center', marginBottom: TempleSpacing.md,
    backgroundColor: TempleTheme.bgCard, borderRadius: 12,
    paddingVertical: TempleSpacing.sm, paddingHorizontal: TempleSpacing.lg,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '30',
  },
  hexagramText: { fontSize: 22, color: TempleTheme.goldLight, letterSpacing: 8, marginBottom: 4 },
  hexagramLabel: { fontSize: 11, color: TempleTheme.textMuted },
  displayBox: {
    width: '100%', height: 72, borderRadius: 16,
    backgroundColor: TempleTheme.bgCard, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: TempleSpacing.md,
  },
  displayNumber: {
    fontSize: 40, fontWeight: '700', color: TempleTheme.goldLight,
    letterSpacing: 6,
  },
  displayPlaceholder: {
    fontSize: TempleFonts.body, color: TempleTheme.textMuted + '60',
    letterSpacing: 3,
  },
  keypad: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    width: '100%', gap: TempleSpacing.sm, marginBottom: TempleSpacing.md,
  },
  key: {
    width: '28%', aspectRatio: 1.8,
    backgroundColor: TempleTheme.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '30',
    justifyContent: 'center', alignItems: 'center',
  },
  keyDelete: { backgroundColor: TempleTheme.bgDark },
  keyEmpty: { width: '28%' },
  keyText: { fontSize: 22, color: TempleTheme.textLight, fontWeight: '600' },
  keyDeleteText: { fontSize: 20, color: TempleTheme.textMuted },
  actions: {
    flexDirection: 'row', gap: TempleSpacing.md,
    width: '100%', marginBottom: TempleSpacing.sm,
  },
  clearBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '40',
    alignItems: 'center',
  },
  clearBtnText: { fontSize: TempleFonts.body, color: TempleTheme.textMuted },
  confirmBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    backgroundColor: TempleTheme.red, alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { fontSize: TempleFonts.body, fontWeight: '700', color: TempleTheme.goldLight, letterSpacing: 2 },
  tip: { fontSize: 11, color: TempleTheme.textMuted + '80', marginTop: 4 },
});
