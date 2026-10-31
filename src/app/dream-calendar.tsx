import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getDreamJournal, type DreamJournalEntry } from '@/services/dreamJournal';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const dayKey = (value: number) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

function formatEntryTime(timestamp: number) {
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function DreamCalendarScreen() {
  const { theme } = useAppTheme();
  const s = useMemo(() => styles(theme), [theme]);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [entries, setEntries] = useState<DreamJournalEntry[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      getDreamJournal().then((data) => {
        setEntries(data);
      });
    }, [])
  );

  const dates = useMemo(() => {
    const offset = month.getDay();
    const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({ length: offset + total }, (_, index) =>
      index < offset ? null : new Date(month.getFullYear(), month.getMonth(), index - offset + 1)
    );
  }, [month]);

  const byDay = useMemo(() => {
    const map = new Map<string, DreamJournalEntry[]>();
    entries.forEach((entry) => {
      const key = dayKey(entry.createdAt);
      map.set(key, [...(map.get(key) ?? []), entry]);
    });
    return map;
  }, [entries]);

  const selectedDayEntries = useMemo(() => {
    if (!selectedDateKey) return [];
    return byDay.get(selectedDateKey) ?? [];
  }, [selectedDateKey, byDay]);

  const handleSelectDay = (date: Date, dayEntries: DreamJournalEntry[]) => {
    const key = dayKey(date.getTime());
    setSelectedDateKey(key);
    setSelectedDateLabel(`${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>‹ 返回</Text>
          </TouchableOpacity>
          <Text style={s.title}>夢境月曆</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* 月份切換 */}
        <View style={s.monthRow}>
          <TouchableOpacity
            onPress={() => {
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
              setSelectedDateKey(null);
            }}
          >
            <Text style={s.arrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.month}>
            {month.getFullYear()} 年 {month.getMonth() + 1} 月
          </Text>
          <TouchableOpacity
            onPress={() => {
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
              setSelectedDateKey(null);
            }}
          >
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 星期標籤 */}
        <View style={s.grid}>
          {WEEKDAYS.map((day) => (
            <Text key={day} style={s.weekday}>
              {day}
            </Text>
          ))}

          {/* 日期格子 */}
          {dates.map((date, index) => {
            if (!date) return <View key={`blank-${index}`} style={s.day} />;
            const key = dayKey(date.getTime());
            const dayEntries = byDay.get(key) ?? [];
            const hasEntry = dayEntries.length > 0;
            const isSelected = selectedDateKey === key;

            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[
                  s.day,
                  hasEntry && s.dayActive,
                  isSelected && s.daySelected,
                ]}
                disabled={!hasEntry}
                onPress={() => handleSelectDay(date, dayEntries)}
              >
                <Text
                  style={[
                    s.dayNumber,
                    hasEntry && s.dayNumberActive,
                    isSelected && s.dayNumberSelected,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {hasEntry ? (
                  <>
                    <View style={s.dotRow}>
                      <Text style={s.dot}>●</Text>
                      {dayEntries.length > 1 && (
                        <Text style={s.badgeCount}>+{dayEntries.length}</Text>
                      )}
                    </View>
                    <Text style={s.symbol} numberOfLines={1}>
                      {dayEntries[0].result.symbols[0] || '夢境'}
                    </Text>
                    {dayEntries[0].feeling ? (
                      <Text style={s.feeling} numberOfLines={1}>
                        {dayEntries[0].feeling}
                      </Text>
                    ) : null}
                  </>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 當日選中夢境清單展示 */}
        {selectedDateKey && selectedDayEntries.length > 0 ? (
          <View style={s.dayListSection}>
            <View style={s.dayListHeader}>
              <Text style={s.dayListTitle}>
                📅 {selectedDateLabel}（共 {selectedDayEntries.length} 則夢境）
              </Text>
            </View>
            {selectedDayEntries.map((entry, idx) => (
              <TouchableOpacity
                key={entry.id}
                style={s.entryCard}
                onPress={() => router.push(`/dream-entry/${entry.id}` as never)}
              >
                <View style={s.entryCardHeader}>
                  <Text style={s.entryTime}>
                    第 {idx + 1} 則・{formatEntryTime(entry.createdAt)}
                  </Text>
                  <View style={s.tagsRow}>
                    {entry.tags.map((t) => (
                      <View key={t} style={s.entryTag}>
                        <Text style={s.entryTagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Text style={s.entryDream} numberOfLines={2}>
                  {entry.dream}
                </Text>
                {entry.feeling ? (
                  <Text style={s.entryFeeling}>感受：{entry.feeling}</Text>
                ) : null}
                <View style={s.entryFooter}>
                  <Text style={s.entrySymbolText}>
                    象徵：{entry.result.symbols.slice(0, 3).join('、') || '生活隱喻'}
                  </Text>
                  <Text style={s.entryArrow}>詳情 ›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={s.hint}>
            💡 點選有金色標記的日期，可於下方檢視該日所有夢境並深入反思。
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bgDark },
    container: {
      width: '100%',
      maxWidth: 760,
      alignSelf: 'center',
      padding: TempleSpacing.md,
      paddingBottom: TempleSpacing.xxl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: TempleSpacing.sm,
    },
    backBtn: { paddingVertical: 6, paddingHorizontal: 4 },
    backText: { color: theme.gold, fontSize: TempleFonts.body, fontWeight: 'bold' },
    title: {
      color: theme.textGold,
      fontSize: TempleFonts.title,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    monthRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: TempleSpacing.md,
    },
    arrow: { color: theme.textGold, fontSize: 34, paddingHorizontal: 12 },
    month: { color: theme.textLight, fontSize: TempleFonts.heading, fontWeight: 'bold' },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    weekday: { color: theme.textMuted, width: '14.285%', textAlign: 'center', marginBottom: 8 },
    day: {
      width: '14.285%',
      aspectRatio: 0.82,
      alignItems: 'center',
      paddingTop: 6,
      borderColor: theme.gold + '18',
      borderWidth: 0.5,
    },
    dayActive: { backgroundColor: theme.gold + '25' },
    daySelected: {
      borderColor: theme.gold,
      borderWidth: 1.5,
      backgroundColor: theme.gold + '40',
    },
    dayNumber: { color: theme.textLight, fontSize: TempleFonts.small },
    dayNumberActive: { color: theme.textGold, fontWeight: 'bold' },
    dayNumberSelected: { color: theme.goldLight, fontWeight: '900' },
    dotRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    dot: { color: theme.gold, fontSize: 9, lineHeight: 12 },
    badgeCount: { color: theme.goldLight, fontSize: 9, fontWeight: 'bold' },
    symbol: { color: theme.textMuted, fontSize: 9, maxWidth: '90%' },
    feeling: { color: theme.textMuted, fontSize: 8, maxWidth: '90%' },
    hint: {
      color: theme.textMuted,
      fontSize: TempleFonts.small,
      textAlign: 'center',
      marginTop: TempleSpacing.lg,
      lineHeight: 20,
    },
    dayListSection: {
      marginTop: TempleSpacing.lg,
      backgroundColor: theme.bgCard,
      borderRadius: 14,
      borderColor: theme.gold + '35',
      borderWidth: 1,
      padding: TempleSpacing.md,
      gap: 10,
    },
    dayListHeader: {
      borderBottomWidth: 1,
      borderBottomColor: theme.gold + '25',
      paddingBottom: 8,
    },
    dayListTitle: {
      color: theme.goldLight,
      fontWeight: 'bold',
      fontSize: TempleFonts.body,
    },
    entryCard: {
      backgroundColor: theme.bgMedium,
      borderRadius: 10,
      padding: TempleSpacing.md,
      borderWidth: 1,
      borderColor: theme.gold + '25',
      gap: 6,
    },
    entryCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    entryTime: {
      color: theme.gold,
      fontWeight: 'bold',
      fontSize: 12,
    },
    tagsRow: {
      flexDirection: 'row',
      gap: 4,
    },
    entryTag: {
      backgroundColor: theme.goldDark + '33',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    entryTagText: {
      color: theme.goldLight,
      fontSize: 10,
    },
    entryDream: {
      color: theme.textLight,
      fontSize: 13,
      lineHeight: 18,
    },
    entryFeeling: {
      color: theme.textMuted,
      fontSize: 11,
    },
    entryFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
    },
    entrySymbolText: {
      color: theme.goldLight,
      fontSize: 11,
    },
    entryArrow: {
      color: theme.gold,
      fontWeight: 'bold',
      fontSize: 12,
    },
  });
