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
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import type { ThemeColors } from '@/constants/themes';
import { gods, getPoemsByGod, questionCategories, type God } from '@/data/gods';
import type { Poem } from '@/data/poems/leiyushi';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';

type GodFilter = number | 'all';
type LevelFilter = 'all' | 'good' | 'neutral' | 'caution';

interface LibraryRow {
  god: God;
  poem: Poem;
}

const GOD_CATEGORY_MATCH: Record<string, God['category'][]> = {
  career: ['war', 'growth', 'general'],
  love: ['compassion', 'general'],
  wealth: ['wealth', 'growth', 'general'],
  health: ['health', 'compassion', 'release'],
  study: ['general', 'war', 'growth'],
  family: ['compassion', 'guardian', 'heaven'],
  travel: ['sea', 'growth', 'guardian'],
  blessing: ['heaven', 'release', 'compassion'],
  protection: ['guardian', 'war', 'release'],
  settlement: ['growth', 'guardian', 'sea'],
  general: ['general', 'heaven', 'compassion'],
};

const CATEGORY_TO_JIEYUE: Record<string, keyof NonNullable<Poem['jieYue']>> = {
  career: 'career',
  love: 'marriage',
  wealth: 'wealth',
  health: 'health',
  study: 'study',
  travel: 'travel',
  family: 'general',
  blessing: 'general',
  protection: 'general',
  settlement: 'travel',
  general: 'general',
};

function levelColor(level: string, theme: ThemeColors) {
  if (level.includes('上上') || level.includes('大吉')) return theme.success;
  if (level.includes('吉')) return theme.gold;
  if (level.includes('下') || level.includes('凶')) return theme.danger;
  return theme.textMuted;
}

function levelFilterOf(level: string): Exclude<LevelFilter, 'all'> {
  if (level.includes('下') || level.includes('凶')) return 'caution';
  if (level.includes('上') || level.includes('吉')) return 'good';
  return 'neutral';
}

function matchesGodCategory(god: God, categoryId: string): boolean {
  if (categoryId === 'all') return true;
  const allowed = GOD_CATEGORY_MATCH[categoryId];
  if (!allowed) return true;
  return allowed.includes(god.category);
}

function searchableText(row: LibraryRow): string {
  const catalog = getOracleCatalogByGodId(row.god.id);
  const jieYue = row.poem.jieYue ? Object.values(row.poem.jieYue).join(' ') : '';
  return [
    row.god.name,
    row.god.title,
    row.god.poemSystem,
    catalog.label,
    catalog.sourceType,
    row.poem.number,
    row.poem.ganzhi,
    row.poem.level,
    row.poem.title,
    row.poem.content,
    row.poem.vernacular,
    row.poem.story ?? '',
    jieYue,
  ].join(' ').toLowerCase();
}

export default function LibraryScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = useMemo(() => createStyles(theme, layout), [theme, layout]);
  const [selectedGodId, setSelectedGodId] = useState<GodFilter>('all');
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const allRows = useMemo<LibraryRow[]>(
    () => gods.flatMap((god) => getPoemsByGod(god.id).map((poem) => ({ god, poem: poem as Poem }))),
    []
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((row) => {
      if (selectedGodId !== 'all' && row.god.id !== selectedGodId) return false;
      if (selectedLevel !== 'all' && levelFilterOf(row.poem.level) !== selectedLevel) return false;
      if (!matchesGodCategory(row.god, selectedCategory)) return false;
      if (!q) return true;
      return searchableText(row).includes(q);
    });
  }, [allRows, query, selectedCategory, selectedGodId, selectedLevel]);

  const selectedGod = selectedGodId === 'all' ? null : gods.find((god) => god.id === selectedGodId) ?? null;
  const selectedCatalog = selectedGod ? getOracleCatalogByGodId(selectedGod.id) : null;
  const categoryFilters = useMemo(
    () => [{ id: 'all', name: '全部題型', icon: '⌘' }, ...questionCategories],
    []
  );
  const levelFilters: { id: LevelFilter; label: string }[] = [
    { id: 'all', label: '全部吉凶' },
    { id: 'good', label: '吉籤' },
    { id: 'neutral', label: '平籤' },
    { id: 'caution', label: '慎行' },
  ];

  const resetFilters = () => {
    setSelectedGodId('all');
    setSelectedLevel('all');
    setSelectedCategory('all');
    setQuery('');
    setExpandedKey(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>籤詩查詢圖書館</Text>
        <Text style={styles.subtitle}>搜尋神明、籤號、籤文、典故或白話解讀</Text>
      </View>

      {layout.isDesktop ? (
        <View style={styles.desktopBody}>
          <ScrollView style={styles.filterSidebar} contentContainerStyle={styles.filterSidebarContent}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="輸入籤號、神明、關鍵字或一句籤文"
              placeholderTextColor={theme.textMuted}
            />
            <Text style={[styles.systemLabel, { fontSize: 13 }]}>神明</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              <TouchableOpacity
                style={[styles.godChip, selectedGodId === 'all' && styles.godChipActive]}
                onPress={() => { setSelectedGodId('all'); setExpandedKey(null); }}
              >
                <Text style={[styles.godChipText, selectedGodId === 'all' && styles.godChipTextActive]}>全部</Text>
              </TouchableOpacity>
              {gods.map((god) => (
                <TouchableOpacity
                  key={god.id}
                  style={[styles.godChip, selectedGodId === god.id && styles.godChipActive]}
                  onPress={() => { setSelectedGodId(god.id); setExpandedKey(null); }}
                >
                  <Text style={[styles.godChipText, selectedGodId === god.id && styles.godChipTextActive]}>
                    {god.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.systemLabel, { fontSize: 13 }]}>題型</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {categoryFilters.map((category) => {
                const active = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => { setSelectedCategory(category.id); setExpandedKey(null); }}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{category.icon} {category.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.systemLabel, { fontSize: 13 }]}>吉凶</Text>
            <View style={styles.levelRow}>
              {levelFilters.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.levelChip, selectedLevel === item.id && styles.levelChipActive]}
                  onPress={() => { setSelectedLevel(item.id); setExpandedKey(null); }}
                >
                  <Text style={[styles.levelChipText, selectedLevel === item.id && styles.levelChipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.systemLabel}>
                {selectedGod ? `${selectedGod.name} · ${selectedGod.poemSystem}` : '全部神明籤詩庫'}
              </Text>
              <Text style={styles.systemMeta}>共 {allRows.length} 首，符合 {filteredRows.length} 首</Text>
              {selectedCatalog ? (
                <Text style={styles.systemHint}>{selectedCatalog.label} · {selectedCatalog.sourceType} · {selectedCatalog.versionTag}</Text>
              ) : (
                <Text style={styles.systemHint}>可跨神明與籤系統搜尋，展開後可看來源版本與適用題型。</Text>
              )}
              {(query || selectedGodId !== 'all' || selectedCategory !== 'all' || selectedLevel !== 'all') ? (
                <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                  <Text style={styles.resetBtnText}>清除篩選</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
          <ScrollView style={styles.poemArea} contentContainerStyle={styles.listContent}>
            {filteredRows.map((row) => {
              const key = `${row.god.id}-${row.poem.number}`;
              const isOpen = expandedKey === key;
              const catalog = getOracleCatalogByGodId(row.god.id);
              const adviceKey = CATEGORY_TO_JIEYUE[selectedCategory] ?? 'general';
              const categoryAdvice = row.poem.jieYue?.[adviceKey] ?? row.poem.jieYue?.general;

              return (
                <TouchableOpacity
                  key={key}
                  style={styles.poemCard}
                  onPress={() => setExpandedKey(isOpen ? null : key)}
                  activeOpacity={0.85}
                >
                  <View style={styles.poemHeader}>
                    <View style={styles.poemTitleGroup}>
                      <Text style={styles.poemGod}>{row.god.name}</Text>
                      <Text style={styles.poemTitle} numberOfLines={1}>第 {row.poem.number} 籤 · {row.poem.title}</Text>
                    </View>
                    <Text style={[styles.poemLevel, { color: levelColor(row.poem.level, theme), borderColor: levelColor(row.poem.level, theme) + '55' }]}>
                      {row.poem.level}
                    </Text>
                  </View>

                  {isOpen ? (
                    <View style={styles.poemDetail}>
                      <View style={styles.divider} />
                      <Text style={styles.catalogLabel}>{catalog.label} · {catalog.versionTag}</Text>
                      {row.poem.content.split('\n').map((line, index) => (
                        <Text key={index} style={styles.poemLine}>{line}</Text>
                      ))}
                      <Text style={styles.poemVernacular}>{row.poem.vernacular}</Text>
                      {categoryAdvice ? <Text style={styles.poemAdvice}>問事提示：{categoryAdvice}</Text> : null}
                      {row.poem.story ? <Text style={styles.poemStory}>典故：{row.poem.story}</Text> : null}
                      <Text style={styles.sourceNote}>來源版本：{catalog.sourceType}。{catalog.editionNote}</Text>
                    </View>
                  ) : (
                    <Text style={styles.poemPreview} numberOfLines={1}>
                      {row.poem.content.split('\n')[0]}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {filteredRows.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>沒有符合「{query || '目前篩選'}」的籤詩</Text>
                <TouchableOpacity style={styles.emptyResetBtn} onPress={resetFilters}>
                  <Text style={styles.emptyResetText}>重設條件</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      ) : (
        <>
          <ScrollView style={styles.filters} contentContainerStyle={styles.filtersContent}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="輸入籤號、神明、關鍵字或一句籤文"
              placeholderTextColor={theme.textMuted}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContent}>
              <TouchableOpacity
                style={[styles.godChip, selectedGodId === 'all' && styles.godChipActive]}
                onPress={() => { setSelectedGodId('all'); setExpandedKey(null); }}
              >
                <Text style={[styles.godChipText, selectedGodId === 'all' && styles.godChipTextActive]}>全部神明</Text>
              </TouchableOpacity>
              {gods.map((god) => (
                <TouchableOpacity
                  key={god.id}
                  style={[styles.godChip, selectedGodId === god.id && styles.godChipActive]}
                  onPress={() => { setSelectedGodId(god.id); setExpandedKey(null); }}
                >
                  <Text style={[styles.godChipText, selectedGodId === god.id && styles.godChipTextActive]}>
                    {god.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContent}>
              {categoryFilters.map((category) => {
                const active = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => { setSelectedCategory(category.id); setExpandedKey(null); }}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{category.icon} {category.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.levelRow}>
              {levelFilters.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.levelChip, selectedLevel === item.id && styles.levelChipActive]}
                  onPress={() => { setSelectedLevel(item.id); setExpandedKey(null); }}
                >
                  <Text style={[styles.levelChipText, selectedLevel === item.id && styles.levelChipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.systemLabel}>
                {selectedGod ? `${selectedGod.name} · ${selectedGod.poemSystem}` : '全部神明籤詩庫'}
              </Text>
              <Text style={styles.systemMeta}>共 {allRows.length} 首，符合 {filteredRows.length} 首</Text>
              {selectedCatalog ? (
                <Text style={styles.systemHint}>{selectedCatalog.label} · {selectedCatalog.sourceType} · {selectedCatalog.versionTag}</Text>
              ) : (
                <Text style={styles.systemHint}>可跨神明與籤系統搜尋，展開後可看來源版本與適用題型。</Text>
              )}
              {(query || selectedGodId !== 'all' || selectedCategory !== 'all' || selectedLevel !== 'all') ? (
                <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                  <Text style={styles.resetBtnText}>清除篩選</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {filteredRows.map((row) => {
              const key = `${row.god.id}-${row.poem.number}`;
              const isOpen = expandedKey === key;
              const catalog = getOracleCatalogByGodId(row.god.id);
              const adviceKey = CATEGORY_TO_JIEYUE[selectedCategory] ?? 'general';
              const categoryAdvice = row.poem.jieYue?.[adviceKey] ?? row.poem.jieYue?.general;

              return (
                <TouchableOpacity
                  key={key}
                  style={styles.poemCard}
                  onPress={() => setExpandedKey(isOpen ? null : key)}
                  activeOpacity={0.85}
                >
                  <View style={styles.poemHeader}>
                    <View style={styles.poemTitleGroup}>
                      <Text style={styles.poemGod}>{row.god.name}</Text>
                      <Text style={styles.poemTitle} numberOfLines={1}>第 {row.poem.number} 籤 · {row.poem.title}</Text>
                    </View>
                    <Text style={[styles.poemLevel, { color: levelColor(row.poem.level, theme), borderColor: levelColor(row.poem.level, theme) + '55' }]}>
                      {row.poem.level}
                    </Text>
                  </View>

                  {isOpen ? (
                    <View style={styles.poemDetail}>
                      <View style={styles.divider} />
                      <Text style={styles.catalogLabel}>{catalog.label} · {catalog.versionTag}</Text>
                      {row.poem.content.split('\n').map((line, index) => (
                        <Text key={index} style={styles.poemLine}>{line}</Text>
                      ))}
                      <Text style={styles.poemVernacular}>{row.poem.vernacular}</Text>
                      {categoryAdvice ? <Text style={styles.poemAdvice}>問事提示：{categoryAdvice}</Text> : null}
                      {row.poem.story ? <Text style={styles.poemStory}>典故：{row.poem.story}</Text> : null}
                      <Text style={styles.sourceNote}>來源版本：{catalog.sourceType}。{catalog.editionNote}</Text>
                    </View>
                  ) : (
                    <Text style={styles.poemPreview} numberOfLines={1}>
                      {row.poem.content.split('\n')[0]}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {filteredRows.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>沒有符合「{query || '目前篩選'}」的籤詩</Text>
                <TouchableOpacity style={styles.emptyResetBtn} onPress={resetFilters}>
                  <Text style={styles.emptyResetText}>重設條件</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={{ height: 60 }} />
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors, layout: ReturnType<typeof useResponsiveLayout>) {
  const poemColumns = layout.isDesktop ? 3 : layout.isTablet ? 2 : 1;
  const poemCardWidth = poemColumns > 1
    ? `${Math.floor(100 / poemColumns)}%` as any
    : '100%' as any;

  return StyleSheet.create({
    safeArea: { flex: 1, overflow: "hidden" as const, backgroundColor: theme.bgDark },
    header: {
      paddingHorizontal: layout.gutter,
      paddingTop: TempleSpacing.md,
      paddingBottom: TempleSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.goldDark + '28',
      maxWidth: layout.contentMaxWidth,
      alignSelf: 'center',
      width: '100%',
    },
    desktopBody: {
      flex: 1,
      flexDirection: 'row',
      maxWidth: layout.contentMaxWidth,
      alignSelf: 'center',
      width: '100%',
    },
    filterSidebar: {
      width: 220,
      borderRightWidth: 1,
      borderRightColor: theme.goldDark + '28',
      flexGrow: 0,
    },
    filterSidebarContent: {
      padding: TempleSpacing.md,
      gap: 10,
    },
    poemArea: { flex: 1 },
    backBtn: { marginBottom: TempleSpacing.sm, alignSelf: 'flex-start' },
    backBtnText: { color: theme.gold, fontSize: TempleFonts.small, fontWeight: '600' },
    title: { color: theme.goldLight, fontSize: TempleFonts.heading, fontWeight: '900' },
    subtitle: { color: theme.textMuted, fontSize: TempleFonts.small, marginTop: 4 },
    filters: { flexGrow: 0, maxHeight: layout.isDesktop ? undefined : 260, borderBottomWidth: layout.isDesktop ? 0 : 1, borderBottomColor: theme.goldDark + '22' },
    filtersContent: { padding: TempleSpacing.lg, gap: 10 },
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
    chipScrollContent: { gap: 8, paddingRight: TempleSpacing.lg },
    godChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.goldDark + '40',
      backgroundColor: theme.bgCard,
    },
    godChipActive: { backgroundColor: theme.goldDark + '55', borderColor: theme.gold },
    godChipText: { color: theme.textMuted, fontSize: 13, fontWeight: '700' },
    godChipTextActive: { color: theme.goldLight },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.goldDark + '35',
      backgroundColor: theme.bgCard,
    },
    filterChipActive: { backgroundColor: theme.goldDark + '45', borderColor: theme.gold },
    filterChipText: { color: theme.textMuted, fontSize: 12, fontWeight: '700' },
    filterChipTextActive: { color: theme.goldLight },
    levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    levelChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.goldDark + '35',
      backgroundColor: theme.bgCard,
    },
    levelChipActive: { borderColor: theme.gold, backgroundColor: theme.goldDark + '45' },
    levelChipText: { color: theme.textMuted, fontSize: 12, fontWeight: '700' },
    levelChipTextActive: { color: theme.goldLight },
    summaryCard: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.goldDark + '30',
      backgroundColor: theme.bgCard,
      padding: TempleSpacing.sm,
    },
    systemLabel: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '800' },
    systemMeta: { color: theme.textLight, fontSize: 12, marginTop: 2 },
    systemHint: { color: theme.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
    resetBtn: { alignSelf: 'flex-start', marginTop: 8, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: theme.goldDark + '35' },
    resetBtnText: { color: theme.goldLight, fontSize: 12, fontWeight: '800' },
    list: { flex: 1 },
    listContent: {
      padding: TempleSpacing.lg,
      paddingTop: TempleSpacing.sm,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: poemColumns > 1 ? TempleSpacing.sm : 0,
    },
    poemCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '24',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.sm,
      width: poemCardWidth,
    },
    poemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    poemTitleGroup: { flex: 1 },
    poemGod: { color: theme.goldLight, fontWeight: '800', fontSize: 12, marginBottom: 3 },
    poemTitle: { color: theme.textLight, fontSize: TempleFonts.small, fontWeight: '700' },
    poemLevel: { fontSize: 12, fontWeight: '800', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
    poemPreview: { color: theme.textMuted, fontSize: 12, marginTop: 8 },
    poemDetail: { marginTop: 8 },
    divider: { height: 1, backgroundColor: theme.goldDark + '20', marginBottom: 10 },
    catalogLabel: { color: theme.gold, fontSize: 12, fontWeight: '800', marginBottom: 8 },
    poemLine: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 24, fontWeight: '600' },
    poemVernacular: { color: theme.textMuted, fontSize: 13, lineHeight: 20, marginTop: 8 },
    poemAdvice: { color: theme.goldLight, fontSize: 13, lineHeight: 20, marginTop: 8, fontWeight: '700' },
    poemStory: { color: theme.textMuted, fontSize: 12, lineHeight: 18, marginTop: 8, fontStyle: 'italic' },
    sourceNote: { color: theme.textMuted, fontSize: 11, lineHeight: 17, marginTop: 8 },
    emptyCard: { alignItems: 'center', paddingVertical: TempleSpacing.xl, gap: 10 },
    emptyText: { color: theme.textMuted, fontSize: TempleFonts.body },
    emptyResetBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.goldDark + '45' },
    emptyResetText: { color: theme.goldLight, fontSize: 12, fontWeight: '800' },
  });
}
