// 籤詩分享卡片模板 - 用於 ViewShot 截圖分享
import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Poem } from '@/data/poems/leiyushi';
import { TempleTheme } from '@/constants/temple-theme';

interface ShareCardViewProps {
  godName: string;
  poem: Poem;
  aiInterpretation?: string | null;
}

export const ShareCardView = forwardRef<View, ShareCardViewProps>(
  ({ godName, poem, aiInterpretation }, ref) => {
    return (
      <View ref={ref} style={styles.card}>
        {/* 頂部裝飾 */}
        <View style={styles.topOrnament}>
          <Text style={styles.ornamentText}>⛩️</Text>
        </View>

        {/* 標題 */}
        <Text style={styles.title}>{godName}靈籤</Text>
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>第 {poem.number} 籤</Text>
          </View>
          <View style={[styles.badge, styles.levelBadge]}>
            <Text style={styles.badgeText}>{poem.level}</Text>
          </View>
          <Text style={styles.ganzhi}>{poem.ganzhi}</Text>
        </View>

        {/* 籤詩內容 */}
        <View style={styles.poemBox}>
          {poem.content.split('\n').map((line, i) => (
            <Text key={i} style={styles.poemLine}>{line}</Text>
          ))}
        </View>

        {/* 典故 */}
        {poem.story && (
          <Text style={styles.story}>📜 {poem.story}</Text>
        )}

        {/* AI 解籤摘要 */}
        {aiInterpretation && (
          <View style={styles.aiBox}>
            <Text style={styles.aiText} numberOfLines={4}>
              {aiInterpretation.split('\n').filter(l => l.trim()).slice(0, 4).join('\n')}
            </Text>
          </View>
        )}

        {/* 底部署名 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>— 神明占卜 App</Text>
          <Text style={styles.footerSub}>誠心祈求 · 心誠則靈</Text>
        </View>
      </View>
    );
  }
);

const CARD_W = 320;
const CARD_H = 520;

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: TempleTheme.bgDark,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: TempleTheme.goldDark,
    alignItems: 'center',
  },
  topOrnament: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: TempleTheme.goldDark + '30',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  ornamentText: { fontSize: 24 },
  title: {
    fontSize: 24, fontWeight: '900', color: TempleTheme.goldLight,
    letterSpacing: 6, marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16,
  },
  badge: {
    backgroundColor: TempleTheme.red, paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 10,
  },
  levelBadge: {
    backgroundColor: TempleTheme.goldDark + '40',
  },
  badgeText: { fontSize: 12, color: '#FFF', fontWeight: '700' },
  ganzhi: { fontSize: 12, color: TempleTheme.textMuted },
  poemBox: {
    backgroundColor: TempleTheme.bgLight,
    padding: 16, borderRadius: 12, width: '100%',
    marginBottom: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#D2B48C',
  },
  poemLine: {
    fontSize: 16, lineHeight: 28, color: '#333', fontWeight: '600', letterSpacing: 2,
  },
  story: {
    fontSize: 11, color: TempleTheme.textMuted, textAlign: 'center', marginBottom: 10,
  },
  aiBox: {
    backgroundColor: TempleTheme.bgCard, borderRadius: 10, padding: 10,
    width: '100%', marginBottom: 8,
  },
  aiText: { fontSize: 11, color: TempleTheme.textLight, lineHeight: 18 },
  footer: {
    marginTop: 'auto', alignItems: 'center', paddingTop: 12,
    borderTopWidth: 1, borderTopColor: TempleTheme.goldDark + '30',
    width: '100%',
  },
  footerText: { fontSize: 12, color: TempleTheme.goldLight, fontWeight: '600' },
  footerSub: { fontSize: 10, color: TempleTheme.textMuted, marginTop: 2 },
});
