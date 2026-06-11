// 廟宇風格裝飾背景 — 用於所有頁面的統一視覺基底
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TempleTheme } from '@/constants/temple-theme';

interface Props {
  pattern?: 'cloud' | 'wave' | 'diamond';
}

const PATTERNS = {
  cloud: '☁　☁　☁　☁　☁',
  wave: '〰　〰　〰　〰　〰',
  diamond: '◇　◇　◇　◇　◇',
};

export function DecorativeBg({ pattern = 'diamond' }: Props) {
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
  return (
    <View style={div.row}>
      <View style={div.line} />
      <Text style={div.dot}>◇</Text>
      <View style={div.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    opacity: 0.04,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  line: {
    color: TempleTheme.goldLight,
    fontSize: 10,
    letterSpacing: 8,
    textAlign: 'center',
  },
});

const div = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingHorizontal: 24 },
  line: { flex: 1, height: 1, backgroundColor: TempleTheme.goldDark + '30' },
  dot: { color: TempleTheme.goldDark, fontSize: 10, marginHorizontal: 10, opacity: 0.5 },
});
