import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { DREAM_DICTIONARY_CATEGORIES, EXTENDED_DREAM_SYMBOL_ENTRIES, getDreamSymbolCategory, type DreamDictionaryCategory, type DreamSymbolEntry } from '@/data/dreamSymbolsExtended';

export default function DreamDictionaryScreen() {
  const { theme } = useAppTheme(); const s = useMemo(() => styles(theme), [theme]);
  const [query, setQuery] = useState(''); const [category, setCategory] = useState<DreamDictionaryCategory>('全部'); const [selected, setSelected] = useState<DreamSymbolEntry | null>(null);
  const entries = EXTENDED_DREAM_SYMBOL_ENTRIES.filter((entry) => (category === '全部' || getDreamSymbolCategory(entry) === category) && `${entry.aliases.join(' ')} ${entry.interpretation}`.includes(query.trim()));
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.container}>
    <Text style={s.title}>夢象字典</Text><Text style={s.subtitle}>夢象是自我探索的線索，不是對未來的定論。</Text>
    <TextInput value={query} onChangeText={setQuery} placeholder="搜尋：例如蛇、飛翔、廟宇" placeholderTextColor={theme.textMuted} style={s.search} accessibilityLabel="搜尋夢象字典" />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categoryRow}>{DREAM_DICTIONARY_CATEGORIES.map((item) => <TouchableOpacity key={item} onPress={() => setCategory(item)} style={[s.category, category === item && s.categoryActive]}><Text style={[s.categoryText, category === item && s.categoryTextActive]}>{item}</Text></TouchableOpacity>)}</ScrollView>
    <Text style={s.count}>{entries.length} 個夢象主題</Text>
    {entries.map((entry) => <TouchableOpacity key={entry.aliases[0]} style={s.card} onPress={() => setSelected(selected?.aliases[0] === entry.aliases[0] ? null : entry)} activeOpacity={0.8}>
      <View style={s.cardTitleRow}><Text style={s.cardTitle}>{entry.aliases[0]}</Text><Text style={s.fortune}>{entry.fortune}</Text></View><Text style={s.aliases}>{entry.aliases.slice(1).join('・')}</Text>
      {selected?.aliases[0] === entry.aliases[0] ? <View style={s.detail}><Text style={s.detailLabel}>可能的象徵</Text><Text style={s.detailText}>{entry.interpretation}</Text><Text style={s.detailLabel}>給你的提醒</Text><Text style={s.advice}>{entry.advice}</Text></View> : <Text style={s.preview} numberOfLines={1}>{entry.interpretation}</Text>}
    </TouchableOpacity>)}
    {entries.length === 0 ? <Text style={s.empty}>找不到相符夢象，試試較短的關鍵字。</Text> : null}
  </ScrollView></SafeAreaView>;
}

const styles = (theme: ReturnType<typeof useAppTheme>['theme']) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgDark }, container: { padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl, maxWidth: 760, width: '100%', alignSelf: 'center' }, title: { color: theme.textGold, fontSize: TempleFonts.title, fontWeight: 'bold', textAlign: 'center', marginTop: TempleSpacing.md }, subtitle: { color: theme.textMuted, fontSize: TempleFonts.small, textAlign: 'center', marginVertical: TempleSpacing.md }, search: { backgroundColor: theme.bgCard, color: theme.textLight, borderRadius: 12, borderColor: theme.gold + '35', borderWidth: 1, padding: TempleSpacing.md }, categoryRow: { gap: 8, paddingVertical: TempleSpacing.md }, category: { borderColor: theme.gold + '45', borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7 }, categoryActive: { backgroundColor: theme.gold }, categoryText: { color: theme.textMuted, fontSize: TempleFonts.caption }, categoryTextActive: { color: theme.bgDark, fontWeight: 'bold' }, count: { color: theme.textMuted, fontSize: TempleFonts.caption, marginBottom: TempleSpacing.sm }, card: { backgroundColor: theme.bgCard, borderColor: theme.gold + '30', borderWidth: 1, borderRadius: 14, padding: TempleSpacing.md, marginBottom: 10 }, cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, cardTitle: { color: theme.textLight, fontSize: TempleFonts.heading, fontWeight: 'bold' }, fortune: { color: theme.textGold, borderColor: theme.gold + '70', borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }, aliases: { color: theme.textMuted, fontSize: TempleFonts.caption, marginTop: 3 }, preview: { color: theme.textMuted, fontSize: TempleFonts.small, marginTop: 9 }, detail: { borderTopColor: theme.gold + '25', borderTopWidth: 1, marginTop: 12, paddingTop: 12 }, detailLabel: { color: theme.textGold, fontWeight: 'bold', marginBottom: 4 }, detailText: { color: theme.textLight, lineHeight: 23, marginBottom: 12 }, advice: { color: theme.textLight, lineHeight: 23, borderLeftColor: theme.gold, borderLeftWidth: 3, paddingLeft: 10 }, empty: { color: theme.textMuted, textAlign: 'center', marginTop: TempleSpacing.xl },
});
