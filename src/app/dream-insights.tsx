import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getDreamJournal } from '@/services/dreamJournal';
import { getDreamInsights, type DreamCount, type DreamInsights } from '@/services/dreamInsights';

function Ranking({ title, items, theme }: { title: string; items: DreamCount[]; theme: ReturnType<typeof useAppTheme>['theme'] }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  return <View style={[styles(theme).section, { marginTop: TempleSpacing.md }]}><Text style={styles(theme).sectionTitle}>{title}</Text>{items.length === 0 ? <Text style={styles(theme).emptySmall}>累積幾則日記後，這裡會開始呈現規律。</Text> : items.map((item) => <View key={item.label} style={styles(theme).rankRow}><Text style={styles(theme).rankLabel} numberOfLines={1}>{item.label}</Text><View style={styles(theme).barTrack}><View style={[styles(theme).bar, { width: `${(item.count / max) * 100}%` }]} /></View><Text style={styles(theme).rankCount}>{item.count}</Text></View>)}</View>;
}

export default function DreamInsightsScreen() {
  const { theme } = useAppTheme(); const s = useMemo(() => styles(theme), [theme]);
  const [insights, setInsights] = useState<DreamInsights>(() => getDreamInsights([]));
  const load = useCallback(async () => setInsights(getDreamInsights(await getDreamJournal())), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const maxWeek = Math.max(...insights.weeks.map((week) => week.count), 1);
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.container}>
    <Text style={s.title}>夢境洞察</Text><Text style={s.subtitle}>從你的記錄看見重複主題與近期節奏。</Text>
    <View style={s.statRow}><View style={s.statCard}><Text style={s.statValue}>{insights.total}</Text><Text style={s.statLabel}>累積夢境</Text></View><View style={s.statCard}><Text style={s.statValue}>{insights.last30Days}</Text><Text style={s.statLabel}>近 30 天</Text></View></View>
    {insights.recurringMessage ? <View style={s.notice}><Text style={s.noticeTitle}>反覆夢象</Text><Text style={s.noticeText}>{insights.recurringMessage}</Text></View> : <View style={s.notice}><Text style={s.noticeTitle}>從第一則開始</Text><Text style={s.noticeText}>同一個夢象出現兩次後，這裡會提醒你回看它和生活近況的關係。</Text></View>}
    <View style={s.section}><Text style={s.sectionTitle}>近 8 週記錄趨勢</Text><View style={s.weekChart}>{insights.weeks.map((week) => <View key={week.key} style={s.week}><Text style={s.weekCount}>{week.count || ''}</Text><View style={s.weekTrack}><View style={[s.weekBar, { height: `${Math.max(week.count / maxWeek * 100, week.count ? 8 : 0)}%` }]} /></View><Text style={s.weekLabel}>{week.label}</Text></View>)}</View></View>
    <Ranking title="常見夢象" items={insights.recurringSymbols} theme={theme} /><Ranking title="醒來時的感受" items={insights.feelings} theme={theme} /><Ranking title="夢境類型" items={insights.tags} theme={theme} />
    <TouchableOpacity style={s.button} onPress={() => router.push('/dream' as never)}><Text style={s.buttonText}>記錄一則新夢境</Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}

const styles = (theme: ReturnType<typeof useAppTheme>['theme']) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgDark }, container: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl }, title: { color: theme.textGold, fontSize: TempleFonts.title, fontWeight: 'bold', textAlign: 'center', marginTop: TempleSpacing.md }, subtitle: { color: theme.textMuted, fontSize: TempleFonts.small, textAlign: 'center', marginVertical: TempleSpacing.md }, statRow: { flexDirection: 'row', gap: 10 }, statCard: { flex: 1, alignItems: 'center', backgroundColor: theme.bgCard, borderColor: theme.gold + '35', borderWidth: 1, borderRadius: 14, padding: TempleSpacing.md }, statValue: { color: theme.textGold, fontSize: 30, fontWeight: 'bold' }, statLabel: { color: theme.textMuted, fontSize: TempleFonts.caption, marginTop: 3 }, notice: { backgroundColor: theme.gold + '18', borderColor: theme.gold + '45', borderWidth: 1, borderRadius: 14, padding: TempleSpacing.md, marginTop: TempleSpacing.md }, noticeTitle: { color: theme.textGold, fontWeight: 'bold', marginBottom: 4 }, noticeText: { color: theme.textLight, lineHeight: 22 }, section: { backgroundColor: theme.bgCard, borderColor: theme.gold + '30', borderWidth: 1, borderRadius: 14, padding: TempleSpacing.md, marginTop: TempleSpacing.md }, sectionTitle: { color: theme.textGold, fontWeight: 'bold', fontSize: TempleFonts.heading, marginBottom: 12 }, weekChart: { flexDirection: 'row', height: 148, alignItems: 'flex-end', justifyContent: 'space-between' }, week: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }, weekCount: { color: theme.textMuted, fontSize: 10, height: 16 }, weekTrack: { height: 96, width: 14, borderRadius: 8, backgroundColor: theme.bgMedium, justifyContent: 'flex-end', overflow: 'hidden' }, weekBar: { width: '100%', backgroundColor: theme.gold, borderRadius: 8 }, weekLabel: { color: theme.textMuted, fontSize: 10, marginTop: 5 }, rankRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 }, rankLabel: { color: theme.textLight, width: 82, fontSize: TempleFonts.small }, barTrack: { flex: 1, height: 8, borderRadius: 5, backgroundColor: theme.bgMedium, overflow: 'hidden' }, bar: { height: '100%', borderRadius: 5, backgroundColor: theme.gold }, rankCount: { color: theme.textGold, width: 18, textAlign: 'right', fontSize: TempleFonts.small }, emptySmall: { color: theme.textMuted, fontSize: TempleFonts.small }, button: { alignItems: 'center', backgroundColor: theme.gold, borderRadius: 22, paddingVertical: 13, marginTop: TempleSpacing.lg }, buttonText: { color: theme.bgDark, fontWeight: 'bold', fontSize: TempleFonts.body },
});
