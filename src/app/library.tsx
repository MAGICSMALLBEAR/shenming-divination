// 籤詩查詢圖書館 — 瀏覽/搜尋所有神明的完整籤詩庫，不需抽籤
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { gods, getPoemsByGod } from '@/data/gods';
import type { Poem } from '@/data/poems/leiyushi';

function levelColor(level: string, theme: ThemeColors) {
  if (level.includes('上上') || level.includes('大吉')) return theme.success;
  if (level.includes('吉')) return theme.gold;
  if (level.includes('下') || level.includes('凶')) return theme.danger;
  return theme.textMuted;
}

export default function LibraryScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedGodId, setSelectedGodId] = useState<number>(gods[0]?.id ?? 1);
  const [query, setQuery] = useState('');
  const [expandedNumber, setExpandedNumber] = useState<number | null>(null);

  const selectedGod = gods.find((g) => g.id === selectedGodId) ?? gods[0];
  const allPoems = useMemo(() => getPoemsByGod(selectedGodId) as Poem[], [selectedGodId]);

  const filteredPoems = useMemo(() => {
    const q = query.trim();
    if (!q) return allPoems;
    const asNumber = parseInt(q, 10);
    return allPoems.filter((poem) => {
      if (!isNaN(asNumber) && poem.number === asNumber) return true;
      return (
        poem.title.includes(q) ||
        poem.content.includes(q) ||
        poem.vernacular.includes(q)
      );
    });
  }, [allPoems, query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>籤詩查詢圖書館</Text>
        <Text style={styles.subtitle}>不用抽籤，直接瀏覽或搜尋所有籤詩</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.godScroll}
        contentContainerStyle={styles.godScrollContent}
      >
        {gods.map((god) => (
          <TouchableOpacity
            key={god.id}
            style={[styles.godChip, selectedGodId === god.id && styles.godChipActive]}
            onPress={() => { setSelectedGodId(god.id); setQuery(''); setExpandedNumber(null); }}
          >
            <Text style={[styles.godChipText, selectedGodId === god.id && styles.godChipTextActive]}>
              {god.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="輸入籤號或關鍵字搜尋…"
          placeholderTextColor={theme.textMuted}
        />
      </View>

      <Text style={styles.systemLabel}>
        {selectedGod?.poemSystem} · 共 {allPoems.length} 首，符合 {filteredPoems.length} 首
      </Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filteredPoems.map((poem) => {
          const isOpen = expandedNumber === poem.number;
          return (
            <TouchableOpacity
              key={poem.id}
              style={styles.poemCard}
              onPress={() => setExpandedNumber(isOpen ? null : poem.number)}
              activeOpacity={0.85}
            >
              <View style={styles.poemHeader}>
                <Text style={styles.poemNumber}>第 {poem.number} 籤</Text>
                <Text style={[styles.poemLevel, { color: levelColor(poem.level, theme) }]}>
                  {poem.level}
                </Text>
                <Text style={styles.poemTitle} numberOfLines={1}>{poem.title}</Text>
              </View>

              {isOpen ? (
                <View style={styles.poemDetail}>
                  <View style={styles.divider} />
                  {poem.content.split('\n').map((line, index) => (
                    <Text key={index} style={styles.poemLine}>{line}</Text>
                  ))}
                  <Text style={styles.poemVernacular}>{poem.vernacular}</Text>
                  {poem.story ? (
                    <Text style={styles.poemStory}>典故：{poem.story}</Text>
                  ) : null}
                </View>
              ) : (
                <Text style={styles.poemPreview} numberOfLines={1}>
                  {poem.content.split('\n')[0]}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {filteredPoems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>沒有符合「{query}」的籤詩</Text>
          </View>
        ) : null}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.bgDark },
    header: {
      paddingHorizontal: TempleSpacing.lg,
      paddingTop: TempleSpacing.md,
      paddingBottom: TempleSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.goldDark + '28',
    },
    backBtn: { marginBottom: TempleSpacing.sm, alignSelf: 'flex-start' },
    backBtnText: { color: theme.gold, fontSize: TempleFonts.small, fontWeight: '600' },
    title: { color: theme.goldLight, fontSize: TempleFonts.heading, fontWeight: '900' },
    subtitle: { color: theme.textMuted, fontSize: TempleFonts.small, marginTop: 4 },
    godScroll: { flexGrow: 0, marginTop: TempleSpacing.sm },
    godScrollContent: { paddingHorizontal: TempleSpacing.lg, gap: 8 },
    godChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.goldDark + '40',
      marginRight: 8,
    },
    godChipActive: {
      backgroundColor: theme.goldDark + '55',
      borderColor: theme.gold,
    },
    godChipText: { color: theme.textMuted, fontSize: 13 },
    godChipTextActive: { color: theme.gold, fontWeight: '700' },
    searchRow: { paddingHorizontal: TempleSpacing.lg, marginTop: TempleSpacing.sm },
    searchInput: {
      backgroundColor: theme.bgCard,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.goldDark + '40',
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: theme.textLight,
      fontSize: TempleFonts.body,
    },
    systemLabel: {
      color: theme.textMuted,
      fontSize: 12,
      paddingHorizontal: TempleSpacing.lg,
      marginTop: TempleSpacing.sm,
      marginBottom: 4,
    },
    list: { flex: 1 },
    listContent: { padding: TempleSpacing.lg, paddingTop: TempleSpacing.sm },
    poemCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.goldDark + '24',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.sm,
    },
    poemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    poemNumber: { color: theme.goldLight, fontWeight: '800', fontSize: 13 },
    poemLevel: { fontSize: 12, fontWeight: '700' },
    poemTitle: { color: theme.textLight, fontSize: TempleFonts.small, fontWeight: '600', flex: 1 },
    poemPreview: { color: theme.textMuted, fontSize: 12, marginTop: 6 },
    poemDetail: { marginTop: 8 },
    divider: { height: 1, backgroundColor: theme.goldDark + '20', marginBottom: 10 },
    poemLine: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 24, fontWeight: '600' },
    poemVernacular: { color: theme.textMuted, fontSize: 13, lineHeight: 20, marginTop: 8 },
    poemStory: { color: theme.textMuted, fontSize: 12, lineHeight: 18, marginTop: 8, fontStyle: 'italic' },
    emptyCard: { alignItems: 'center', paddingVertical: TempleSpacing.xl },
    emptyText: { color: theme.textMuted, fontSize: TempleFonts.body },
  });
}
