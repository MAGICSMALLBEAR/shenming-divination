// 廟宇風格裝飾背景 — 用於所有頁面的統一視覺基底
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';

interface Props {
  pattern?: 'cloud' | 'wave' | 'diamond';
}

const PATTERNS = {
  cloud: '☁　☁　☁　☁　☁',
  wave: '〰　〰　〰　〰　〰',
  diamond: '◇　◇　◇　◇　◇',
};

export function DecorativeBg({ pattern = 'diamond' }: Props) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={styles.line}>{PATTERNS[pattern]}</Text>
      <Text style={styles.line}>{PATTERNS[pattern]}</Text>
      <Text style={styles.line}>{PATTERNS[pattern]}</Text>
      <Text style={styles.line}>{PATTERNS[pattern]}</Text>
      <Text style={styles.line}>{PATTERNS[pattern]}</Text>
      <Text style={styles.line}>{PATTERNS[pattern]}</Text>
      <Text style={styles.line}>{PATTERNS[pattern]}</Text>
      <Text style={styles.line}>{PATTERNS[pattern]}</Text>
    </View>
  );
}

export function Divider() {
  const { theme } = useAppTheme();
  const div = useMemo(() => createDivStyles(theme), [theme]);
  return (
    <View style={div.row}>
      <View style={div.line} />
      <Text style={div.dot}>◇</Text>
      <View style={div.line} />
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFill,
      opacity: 0.04,
      justifyContent: 'space-between',
      paddingVertical: 60,
    },
    line: {
      color: theme.goldLight,
      fontSize: 10,
      letterSpacing: 8,
      textAlign: 'center',
    },
  });
}

function createDivStyles(theme: ThemeColors) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingHorizontal: 24 },
    line: { flex: 1, height: 1, backgroundColor: theme.goldDark + '30' },
    dot: { color: theme.goldDark, fontSize: 10, marginHorizontal: 10, opacity: 0.5 },
  });
}
