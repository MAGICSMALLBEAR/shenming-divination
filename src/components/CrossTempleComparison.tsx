// 跨神明籤詩比對 — 結果頁下方顯示其他神明對同類問題的籤詩
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { TempleTheme, TempleSpacing } from '@/constants/temple-theme';
import { gods } from '@/data/gods';
import { getGodCardImage } from '@/data/godImages';
import { drawPoem } from '@/services/divination';
import type { Poem } from '@/data/poems/leiyushi';

interface CompareItem {
  godId: number;
  godName: string;
  poem: Poem;
}

interface Props {
  currentGodId: number;
  questionCategory: string;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function CrossTempleComparison({ currentGodId, questionCategory }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const comparisons = useMemo((): CompareItem[] => {
    const others = gods.filter(g => g.id !== currentGodId && g.poemSystem !== '諸葛神數');
    const rng = seededRandom(Date.now() % 10000 + currentGodId);
    const shuffled = [...others].sort(() => rng() - 0.5);
    return shuffled.slice(0, 3).map(g => ({
      godId: g.id,
      godName: g.name,
      poem: drawPoem(g.id),
    }));
  }, [currentGodId]);

  const levelColor = (level: string) => {
    if (level.includes('上上') || level.includes('大吉')) return '#FFD700';
    if (level.includes('吉')) return '#7EC850';
    if (level.includes('下') || level.includes('凶')) return '#E05050';
    return '#C9A96E';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>其他神明怎麼說</Text>
        <Text style={styles.subtitle}>同一問題，不同神明視角</Text>
      </View>

      {comparisons.map((item, idx) => {
        const isOpen = expanded === idx;
        return (
          <TouchableOpacity
            key={item.godId}
            style={styles.card}
            onPress={() => setExpanded(isOpen ? null : idx)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Image source={getGodCardImage(item.godId)} style={styles.godImg} contentFit="cover" />
              <View style={styles.cardMeta}>
                <Text style={styles.godName}>{item.godName}</Text>
                <Text style={styles.poemNum}>第 {item.poem.number} 籤</Text>
                <Text style={[styles.level, { color: levelColor(item.poem.level) }]}>{item.poem.level}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.previewLine} numberOfLines={1}>
                  {item.poem.content.split('\n')[0]}
                </Text>
                <Text style={styles.expandHint}>{isOpen ? '收起 ▲' : '展開 ▼'}</Text>
              </View>
            </View>

            {isOpen && (
              <View style={styles.detail}>
                <View style={styles.divider} />
                {item.poem.content.split('\n').map(line => (
                  <Text key={line} style={styles.poemLine}>{line}</Text>
                ))}
                <Text style={styles.vernacular}>{item.poem.vernacular}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <Text style={styles.note}>* 各神明籤詩供參考，最終以誠心求得之籤為主</Text>
    </View>
  );
}

const styles: any = StyleSheet.create({
  container: { marginTop: 24, paddingHorizontal: TempleSpacing.md },
  header: { marginBottom: 12 },
  title: { color: TempleTheme.gold, fontSize: 16, fontWeight: '700' as const },
  subtitle: { color: TempleTheme.textMuted, fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12, borderWidth: 1, borderColor: '#2A2020', marginBottom: 10, padding: 12,
  },
  cardHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 },
  godImg: { width: 44, height: 56, borderRadius: 6, borderWidth: 1, borderColor: '#B8860B33' },
  cardMeta: { width: 72 },
  godName: { color: TempleTheme.goldLight, fontSize: 13, fontWeight: '700' as const },
  poemNum: { color: TempleTheme.textMuted, fontSize: 11, marginTop: 2 },
  level: { fontSize: 11, fontWeight: '700' as const, marginTop: 2 },
  cardRight: { flex: 1, alignItems: 'flex-end' as const },
  previewLine: { color: TempleTheme.textMuted, fontSize: 12, textAlign: 'right' as const },
  expandHint: { color: TempleTheme.textMuted, fontSize: 11, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#2A2020', marginVertical: 10 },
  detail: { marginTop: 4 },
  poemLine: { color: TempleTheme.textLight, fontSize: 14, lineHeight: 24, fontWeight: '600' as const },
  vernacular: { color: TempleTheme.textMuted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  note: { color: TempleTheme.textMuted, fontSize: 10, textAlign: 'center' as const, marginTop: 4 },
}) as any;
