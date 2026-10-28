import React, { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { deleteDreamEntry, getDreamJournal, type DreamJournalEntry, type DreamTag } from '@/services/dreamJournal';
import { isDreamJournalLocked, unlockDreamJournal } from '@/services/dreamPrivacy';

const TAGS: DreamTag[] = ['惡夢', '好夢', '清醒夢', '反覆夢', '奇異夢'];

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' }).format(timestamp);
}

export default function DreamJournalScreen() {
  const { theme } = useAppTheme();
  const s = useMemo(() => styles(theme), [theme]);
  const [entries, setEntries] = useState<DreamJournalEntry[]>([]);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<DreamTag | '全部'>('全部');
  const [locked, setLocked] = useState(false); const [pin, setPin] = useState(''); const [pinError, setPinError] = useState('');

  const loadEntries = useCallback(async () => { setLocked(await isDreamJournalLocked()); setEntries(await getDreamJournal()); }, []);
  useFocusEffect(useCallback(() => { loadEntries(); }, [loadEntries]));

  const filtered = entries.filter((entry) => {
    const matchesText = `${entry.dream} ${entry.feeling ?? ''} ${entry.result.symbols.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesText && (activeTag === '全部' || entry.tags.includes(activeTag));
  });

  const remove = (entry: DreamJournalEntry) => {
    Alert.alert('刪除這則夢境？', '刪除後無法復原。', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: async () => { await deleteDreamEntry(entry.id); await loadEntries(); } },
    ]);
  };

  if (locked) return <SafeAreaView style={s.safe}><View style={s.lock}><Text style={s.title}>夢境日記已上鎖</Text><Text style={s.subtitle}>輸入 PIN 後查看私密夢境記錄。</Text><TextInput value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry maxLength={6} placeholder="PIN" placeholderTextColor={theme.textMuted} style={s.search}/>{pinError ? <Text style={s.error}>{pinError}</Text> : null}<TouchableOpacity style={s.primaryButton} onPress={async () => { if (await unlockDreamJournal(pin)) { setLocked(false); setPinError(''); } else setPinError('PIN 不正確'); }}><Text style={s.primaryText}>解鎖日記</Text></TouchableOpacity></View></SafeAreaView>;
  return <SafeAreaView style={s.safe}>
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.header}><Text style={s.title}>夢境日記</Text><Text style={s.subtitle}>把夢留下來，才能看見反覆出現的訊息。</Text></View>
      <View style={s.actions}>
        <TouchableOpacity style={s.primaryButton} onPress={() => router.push('/dream')}><Text style={s.primaryText}>＋ 記錄新夢境</Text></TouchableOpacity>
        <TouchableOpacity style={s.secondaryButton} onPress={() => router.push('/dream-dictionary' as never)}><Text style={s.secondaryText}>夢象字典</Text></TouchableOpacity>
      </View>
      <TouchableOpacity style={s.insightsButton} onPress={() => router.push('/dream-insights' as never)}><Text style={s.insightsText}>查看夢境洞察與反覆夢象 →</Text></TouchableOpacity>
      <TouchableOpacity style={s.insightsButton} onPress={() => router.push('/dream-calendar' as never)}><Text style={s.insightsText}>查看夢境月曆 →</Text></TouchableOpacity>
      <View style={s.utilityRow}><TouchableOpacity onPress={() => router.push('/dream-report' as never)}><Text style={s.utility}>匯出夢境報告</Text></TouchableOpacity><TouchableOpacity onPress={() => router.push('/dream-privacy' as never)}><Text style={s.utility}>隱私保護</Text></TouchableOpacity></View>
      <TextInput value={query} onChangeText={setQuery} placeholder="搜尋夢境、感受或夢象" placeholderTextColor={theme.textMuted} style={s.search} accessibilityLabel="搜尋夢境日記" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tagRow}>
        {(['全部', ...TAGS] as const).map((tag) => <TouchableOpacity key={tag} onPress={() => setActiveTag(tag)} style={[s.tag, activeTag === tag && s.tagActive]}><Text style={[s.tagText, activeTag === tag && s.tagTextActive]}>{tag}</Text></TouchableOpacity>)}
      </ScrollView>
      <Text style={s.count}>{filtered.length} 則夢境記錄</Text>
      {filtered.length === 0 ? <View style={s.empty}><Text style={s.emptyTitle}>還沒有符合的夢境</Text><Text style={s.emptyText}>從一段畫面、一個感受開始記錄就好。</Text></View> : filtered.map((entry) => <TouchableOpacity key={entry.id} style={s.card} onPress={() => router.push(`/dream-entry/${entry.id}` as never)} activeOpacity={0.8}>
        <View style={s.cardHeader}><Text style={s.date}>{formatDate(entry.createdAt)}</Text><TouchableOpacity onPress={(event) => { event.stopPropagation(); remove(entry); }} accessibilityLabel="刪除夢境"><Text style={s.delete}>刪除</Text></TouchableOpacity></View>
        <Text style={s.dream} numberOfLines={3}>{entry.dream}</Text>
        {entry.feeling ? <Text style={s.feeling}>感受：{entry.feeling}</Text> : null}
        <View style={s.chipRow}>{entry.tags.map((tag) => <View key={tag} style={s.chip}><Text style={s.chipText}>{tag}</Text></View>)}{entry.result.symbols.slice(0, 4).map((symbol) => <View key={symbol} style={s.symbol}><Text style={s.symbolText}>{symbol}</Text></View>)}</View>
        <Text style={s.summary} numberOfLines={2}>{entry.result.interpretation}</Text>
      </TouchableOpacity>)}
    </ScrollView>
  </SafeAreaView>;
}

const styles = (theme: ReturnType<typeof useAppTheme>['theme']) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgDark }, container: { padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl, maxWidth: 760, width: '100%', alignSelf: 'center' },
  header: { alignItems: 'center', marginVertical: TempleSpacing.md }, title: { color: theme.textGold, fontSize: TempleFonts.title, fontWeight: 'bold' }, subtitle: { color: theme.textMuted, fontSize: TempleFonts.small, marginTop: 6, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginBottom: TempleSpacing.md }, primaryButton: { flex: 1, alignItems: 'center', backgroundColor: theme.gold, borderRadius: 22, paddingVertical: 12 }, primaryText: { color: theme.bgDark, fontWeight: 'bold' }, secondaryButton: { alignItems: 'center', borderColor: theme.gold + '80', borderWidth: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12 }, secondaryText: { color: theme.textGold, fontWeight: '600' },
  insightsButton: { alignItems: 'center', backgroundColor: theme.gold + '18', borderColor: theme.gold + '45', borderWidth: 1, borderRadius: 12, paddingVertical: 10, marginTop: -4, marginBottom: TempleSpacing.md }, insightsText: { color: theme.textGold, fontSize: TempleFonts.small, fontWeight: '600' },
  search: { backgroundColor: theme.bgCard, color: theme.textLight, borderRadius: 12, borderColor: theme.gold + '35', borderWidth: 1, padding: TempleSpacing.md }, tagRow: { gap: 8, paddingVertical: TempleSpacing.md }, tag: { borderColor: theme.gold + '45', borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7 }, tagActive: { backgroundColor: theme.gold }, tagText: { color: theme.textMuted, fontSize: TempleFonts.caption }, tagTextActive: { color: theme.bgDark, fontWeight: 'bold' }, count: { color: theme.textMuted, fontSize: TempleFonts.caption, marginBottom: TempleSpacing.sm },
  card: { backgroundColor: theme.bgCard, borderColor: theme.gold + '30', borderWidth: 1, borderRadius: 14, padding: TempleSpacing.md, marginBottom: 10 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between' }, date: { color: theme.textGold, fontSize: TempleFonts.small, fontWeight: 'bold' }, delete: { color: theme.danger, fontSize: TempleFonts.caption }, dream: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 24, marginTop: 8 }, feeling: { color: theme.textMuted, fontSize: TempleFonts.small, marginTop: 6 }, chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }, chip: { backgroundColor: theme.bgMedium, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }, chipText: { color: theme.textMuted, fontSize: TempleFonts.caption }, symbol: { backgroundColor: theme.gold + '24', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }, symbolText: { color: theme.textGold, fontSize: TempleFonts.caption }, summary: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 20, marginTop: 10 },
  empty: { alignItems: 'center', backgroundColor: theme.bgCard, borderRadius: 14, padding: TempleSpacing.xl, marginTop: TempleSpacing.md }, emptyTitle: { color: theme.textLight, fontWeight: 'bold', fontSize: TempleFonts.heading }, emptyText: { color: theme.textMuted, marginTop: 6, textAlign: 'center' },
  lock: { flex: 1, justifyContent: 'center', padding: TempleSpacing.xl, gap: 12 }, error: { color: theme.danger }, utilityRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: TempleSpacing.md }, utility: { color: theme.textGold, fontSize: TempleFonts.small, fontWeight: 'bold' },
});
