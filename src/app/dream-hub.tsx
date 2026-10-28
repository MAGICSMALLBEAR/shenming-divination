import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getDreamJournal } from '@/services/dreamJournal';
import { getDreamInsights } from '@/services/dreamInsights';

const features = [
  { route: '/dream', icon: '🌙', title: '立即解夢', desc: '輸入或語音記錄昨晚的夢', primary: true },
  { route: '/dream-journal', icon: '📖', title: '夢境日記', desc: '保存、搜尋與回看每一則夢境' },
  { route: '/dream-dictionary', icon: '🔎', title: '夢象字典', desc: '依類別查閱常見夢象與提醒' },
  { route: '/dream-insights', icon: '📊', title: '夢境洞察', desc: '找出反覆夢象與記錄趨勢' },
  { route: '/dream-calendar', icon: '🗓️', title: '夢境月曆', desc: '按日期回看夢象與感受' },
  { route: '/dream-report', icon: '📝', title: '個人報告', desc: '整理月份或年度的夢境摘要' },
  { route: '/dream-privacy', icon: '🔒', title: '隱私保護', desc: '設定日記 PIN 與查看 AI 資料說明' },
];

export default function DreamHubScreen() {
  const { theme } = useAppTheme(); const s = useMemo(() => styles(theme), [theme]); const [total, setTotal] = useState(0); const [recurring, setRecurring] = useState<string[]>([]);
  useFocusEffect(useCallback(() => { getDreamJournal().then((entries) => { const insights = getDreamInsights(entries); setTotal(entries.length); setRecurring(insights.recurringSymbols.filter((item) => item.count >= 2).slice(0, 3).map((item) => item.label)); }); }, []));
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.container}>
    <Text style={s.title}>夢境專區</Text><Text style={s.subtitle}>記錄、探索、回看，從夢境理解當下的自己。</Text>
    <TouchableOpacity style={s.hero} onPress={() => router.push('/dream' as never)}><Text style={s.heroIcon}>🌙</Text><View style={{ flex: 1 }}><Text style={s.heroTitle}>記下昨晚的夢</Text><Text style={s.heroText}>趁記憶還清楚，從一段畫面或一個感受開始。</Text></View><Text style={s.heroArrow}>›</Text></TouchableOpacity>
    <View style={s.summary}><View><Text style={s.summaryNumber}>{total}</Text><Text style={s.summaryLabel}>累積夢境</Text></View><View style={s.summaryDivider}/><View style={{ flex: 1 }}><Text style={s.summaryLabel}>反覆夢象</Text><Text style={s.summaryText}>{recurring.length ? recurring.join('、') : '累積兩則相同夢象後會顯示'}</Text></View></View>
    <Text style={s.sectionTitle}>探索你的夢境</Text><View style={s.grid}>{features.slice(1).map((item) => <TouchableOpacity key={item.route} style={s.card} onPress={() => router.push(item.route as never)}><Text style={s.icon}>{item.icon}</Text><Text style={s.cardTitle}>{item.title}</Text><Text style={s.cardDesc}>{item.desc}</Text></TouchableOpacity>)}</View>
    <View style={s.note}><Text style={s.noteTitle}>溫和提醒</Text><Text style={s.noteText}>夢境解讀是自我探索的線索，不是未來預言；若惡夢或睡眠困擾持續影響生活，建議尋求專業協助。</Text></View>
  </ScrollView></SafeAreaView>;
}
const styles = (theme: ReturnType<typeof useAppTheme>['theme']) => StyleSheet.create({ safe: { flex: 1, backgroundColor: theme.bgDark }, container: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl }, title: { color: theme.textGold, fontSize: TempleFonts.title, fontWeight: 'bold', textAlign: 'center', marginTop: TempleSpacing.md }, subtitle: { color: theme.textMuted, textAlign: 'center', fontSize: TempleFonts.small, marginVertical: TempleSpacing.md }, hero: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.gold, borderRadius: 18, padding: TempleSpacing.lg }, heroIcon: { fontSize: 32 }, heroTitle: { color: theme.bgDark, fontWeight: 'bold', fontSize: TempleFonts.heading }, heroText: { color: theme.bgDark, opacity: 0.8, fontSize: TempleFonts.small, marginTop: 3 }, heroArrow: { color: theme.bgDark, fontSize: 32 }, summary: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bgCard, borderColor: theme.gold + '30', borderWidth: 1, borderRadius: 14, padding: TempleSpacing.md, marginTop: 12, gap: 16 }, summaryNumber: { color: theme.textGold, fontWeight: 'bold', fontSize: 28, textAlign: 'center' }, summaryLabel: { color: theme.textMuted, fontSize: TempleFonts.caption }, summaryText: { color: theme.textLight, marginTop: 3, fontSize: TempleFonts.small }, summaryDivider: { height: 38, width: 1, backgroundColor: theme.gold + '35' }, sectionTitle: { color: theme.textGold, fontSize: TempleFonts.heading, fontWeight: 'bold', marginTop: TempleSpacing.lg, marginBottom: 10 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, card: { width: '48%', flexGrow: 1, backgroundColor: theme.bgCard, borderColor: theme.gold + '28', borderWidth: 1, borderRadius: 14, padding: TempleSpacing.md, minHeight: 128 }, icon: { fontSize: 25, marginBottom: 7 }, cardTitle: { color: theme.textLight, fontWeight: 'bold', fontSize: TempleFonts.body }, cardDesc: { color: theme.textMuted, fontSize: TempleFonts.caption, lineHeight: 18, marginTop: 4 }, note: { backgroundColor: theme.gold + '18', borderColor: theme.gold + '40', borderWidth: 1, borderRadius: 14, padding: TempleSpacing.md, marginTop: TempleSpacing.lg }, noteTitle: { color: theme.textGold, fontWeight: 'bold', marginBottom: 4 }, noteText: { color: theme.textLight, lineHeight: 21, fontSize: TempleFonts.small } });
