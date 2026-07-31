import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { TempleSpacing } from '@/constants/temple-theme';
import type { ThemeColors } from '@/constants/themes';
import { gods } from '@/data/gods';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  buildDeityCalendarMonthGrid,
  filterDeityOccurrences,
} from '@/services/deityCalendarGrid';
import {
  DEITY_OBSERVANCES,
  getDeityObservancesForSolarMonth,
  getUpcomingDeityObservances,
} from '@/services/lunarDeityCalendar';
import { filterUpcomingForFollowedDeities } from '@/services/deityCalendarFollowing';

interface Props {
  initialDate?: Date;
  onConsult: (godId: number) => void;
  onOpenDetails: (observanceId: string) => void;
  onExportYear: (year: number) => void;
  followedGodIds?: number[];
  onToggleFollow?: (godId: number) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function DeityCalendarExplorer({
  initialDate = new Date(),
  onConsult,
  onOpenDetails,
  onExportYear,
  followedGodIds = [],
  onToggleFollow,
}: Props) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [month, setMonth] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1, 12),
  );
  const [query, setQuery] = useState('');
  const [godId, setGodId] = useState<number | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [onlyFollowed, setOnlyFollowed] = useState(false);
  const followedSet = useMemo(() => new Set(followedGodIds), [followedGodIds]);

  const monthOccurrences = useMemo(
    () => getDeityObservancesForSolarMonth(month.getFullYear(), month.getMonth() + 1),
    [month],
  );
  const grid = useMemo(
    () => buildDeityCalendarMonthGrid(month.getFullYear(), month.getMonth() + 1, initialDate),
    [month, initialDate],
  );
  const agenda = useMemo(() => {
    const filtered = filterDeityOccurrences(monthOccurrences, { query, godId });
    const followed = onlyFollowed
      ? filtered.filter((item) => followedSet.has(item.god.id))
      : filtered;
    return dateKey ? followed.filter((item) => item.dateKey === dateKey) : followed;
  }, [dateKey, followedSet, godId, monthOccurrences, onlyFollowed, query]);
  const deityFilters = useMemo(() => {
    const calendarGodIds = new Set(DEITY_OBSERVANCES.map((item) => item.godId));
    return gods.filter((god) => calendarGodIds.has(god.id));
  }, []);
  const upcomingFollowed = useMemo(
    () => filterUpcomingForFollowedDeities(
      getUpcomingDeityObservances(120, initialDate),
      followedGodIds,
    ).slice(0, 3),
    [followedGodIds, initialDate],
  );

  const navigate = (months: number) => {
    setMonth((value) => new Date(value.getFullYear(), value.getMonth() + months, 1, 12));
    setDateKey(null);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.nav}
          onPress={() => navigate(-12)}
          accessibilityLabel={'查看上一年神明月曆'}
        >
          <Text style={styles.navText}>«</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nav}
          onPress={() => navigate(-1)}
          accessibilityLabel={'查看上個月神明月曆'}
        >
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>神明日曆</Text>
          <Text style={styles.title}>{month.getFullYear()} 年 {month.getMonth() + 1} 月</Text>
        </View>
        <TouchableOpacity
          style={styles.nav}
          onPress={() => navigate(1)}
          accessibilityLabel={'查看下個月神明月曆'}
        >
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nav}
          onPress={() => navigate(12)}
          accessibilityLabel={'查看下一年神明月曆'}
        >
          <Text style={styles.navText}>»</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.subtleButton}
          onPress={() => {
            const now = new Date();
            setMonth(new Date(now.getFullYear(), now.getMonth(), 1, 12));
            setDateKey(null);
          }}
        >
          <Text style={styles.subtleText}>回到本月</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => onExportYear(month.getFullYear())}
          accessibilityLabel={`匯出 ${month.getFullYear()} 年神明日曆`}
        >
          <Text style={styles.exportText}>匯出整年 ICS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.followingPanel} accessibilityLabel={'我的神明日曆'}>
        <View style={styles.followingHeader}>
          <View>
            <Text style={styles.followingTitle}>我的神明日曆</Text>
            <Text style={styles.followingCount}>已關注 {followedGodIds.length} 位神明</Text>
          </View>
          <TouchableOpacity
            style={[styles.followingToggle, onlyFollowed && styles.followingToggleActive]}
            onPress={() => setOnlyFollowed((value) => !value)}
            accessibilityRole={'button'}
            accessibilityState={{ selected: onlyFollowed }}
          >
            <Text style={styles.followingToggleText}>
              {onlyFollowed ? '顯示全部' : '只看已關注'}
            </Text>
          </TouchableOpacity>
        </View>
        {followedGodIds.length === 0 ? (
          <Text style={styles.followingHint}>可在下方紀念日按「☆ 關注」，建立自己的神明日曆。</Text>
        ) : upcomingFollowed.length ? (
          upcomingFollowed.map((item) => (
            <View key={item.godId + '-' + item.solarDate.getTime()} style={styles.upcomingRow}>
              <Text style={styles.upcomingDate}>{item.solarDateStr}</Text>
              <Text style={styles.upcomingTitle}>{item.title}</Text>
              <Text style={styles.upcomingDays}>
                {item.daysUntil === 0 ? '今天' : item.daysUntil + ' 天後'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.followingHint}>未來 120 天內沒有已關注神明的紀念日。</Text>
        )}
      </View>

      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder={'搜尋神明或紀念日'}
        placeholderTextColor={theme.textMuted}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <TouchableOpacity
          style={[styles.chip, godId === null && styles.chipActive]}
          onPress={() => setGodId(null)}
        >
          <Text style={styles.chipText}>全部</Text>
        </TouchableOpacity>
        {deityFilters.map((god) => (
          <TouchableOpacity
            key={god.id}
            style={[styles.chip, godId === god.id && styles.chipActive]}
            onPress={() => setGodId((value) => value === god.id ? null : god.id)}
            accessibilityLabel={`篩選${god.name}`}
          >
            <Text style={styles.chipText}>{god.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}
      </View>
      <View style={styles.grid}>
        {grid.map((day) => {
          const matchingEvents = filterDeityOccurrences(day.occurrences, { query, godId })
            .filter((item) => !onlyFollowed || followedSet.has(item.god.id));
          return (
            <TouchableOpacity
              key={day.dateKey}
              style={[
                styles.day,
                !day.inCurrentMonth && styles.dayOutside,
                day.isToday && styles.dayToday,
                dateKey === day.dateKey && styles.daySelected,
              ]}
              onPress={() => {
                if (!day.inCurrentMonth) {
                  setMonth(new Date(day.date.getFullYear(), day.date.getMonth(), 1, 12));
                }
                setDateKey((value) => value === day.dateKey ? null : day.dateKey);
              }}
              accessibilityLabel={`${day.date.getMonth() + 1}月${day.day}日${matchingEvents.length ? `，${matchingEvents.length}筆紀念日` : ''}`}
            >
              <Text style={styles.dayText}>{day.day}</Text>
              {matchingEvents.length ? <View style={styles.dot} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {dateKey ? (
        <TouchableOpacity style={styles.showMonth} onPress={() => setDateKey(null)}>
          <Text style={styles.showMonthText}>顯示整月紀念日</Text>
        </TouchableOpacity>
      ) : null}

      {agenda.length ? agenda.map((item) => (
        <View key={`${item.dateKey}-${item.observance.id}`} style={styles.agendaRow}>
          <View style={styles.date}>
            <Text style={styles.solarDate}>{item.solarLabel}</Text>
            <Text style={styles.lunarDate}>{item.lunar.label.replace('農曆', '')}</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.observance}>{item.observance.title}</Text>
            <Text style={styles.meta}>{item.god.name} · {item.observance.traditionNote}</Text>
          </View>
          <View>
            {onToggleFollow ? (
              <TouchableOpacity
                style={styles.followButton}
                onPress={() => onToggleFollow(item.god.id)}
                accessibilityRole={'button'}
                accessibilityLabel={(followedSet.has(item.god.id) ? '取消關注' : '關注') + item.god.name}
              >
                <Text style={styles.followText}>
                  {followedSet.has(item.god.id) ? '★ 已關注' : '☆ 關注'}
                </Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => onOpenDetails(item.observance.id)}
              accessibilityLabel={`查看${item.observance.title}詳情`}
            >
              <Text style={styles.detailText}>詳情</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.consultButton}
              onPress={() => onConsult(item.god.id)}
              accessibilityLabel={`向${item.god.name}求籤`}
            >
              <Text style={styles.consultText}>求籤</Text>
            </TouchableOpacity>
          </View>
        </View>
      )) : (
        <Text style={styles.empty}>目前條件沒有符合的紀念日。</Text>
      )}

      <Text style={styles.note}>
        日期依臺灣常用農曆換算；各宮廟、祖廟與法脈可能採不同紀念日，參拜前請以所屬宮廟公告為準。
      </Text>
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    card: { width: '100%', padding: TempleSpacing.md, marginBottom: TempleSpacing.md, borderRadius: 16, borderWidth: 1, borderColor: theme.goldDark + '35', backgroundColor: theme.bgCard },
    header: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    heading: { flex: 1, alignItems: 'center' },
    eyebrow: { color: theme.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    title: { color: theme.goldLight, fontSize: 15, fontWeight: '900', marginTop: 3 },
    nav: { width: 33, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: theme.goldDark + '55' },
    navText: { color: theme.goldLight, fontSize: 23 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
    subtleButton: { padding: 8 },
    subtleText: { color: theme.textMuted, fontSize: 11, fontWeight: '700' },
    exportButton: { padding: 8, borderRadius: 9, borderWidth: 1, borderColor: theme.goldDark + '66', backgroundColor: theme.goldDark + '25' },
    exportText: { color: theme.gold, fontSize: 11, fontWeight: '800' },
    followingPanel: { marginBottom: 10, padding: 10, borderRadius: 11, borderWidth: 1, borderColor: theme.goldDark + '35', backgroundColor: theme.bgDark + '45' },
    followingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    followingTitle: { color: theme.goldLight, fontSize: 13, fontWeight: '900' },
    followingCount: { color: theme.textMuted, fontSize: 10, marginTop: 2 },
    followingToggle: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9, borderWidth: 1, borderColor: theme.goldDark + '55' },
    followingToggleActive: { borderColor: theme.gold, backgroundColor: theme.goldDark + '30' },
    followingToggleText: { color: theme.gold, fontSize: 10, fontWeight: '800' },
    followingHint: { color: theme.textMuted, fontSize: 10, lineHeight: 16, marginTop: 8 },
    upcomingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8 },
    upcomingDate: { color: theme.gold, width: 34, fontSize: 10, fontWeight: '800' },
    upcomingTitle: { color: theme.textLight, flex: 1, fontSize: 11, fontWeight: '700' },
    upcomingDays: { color: theme.textMuted, fontSize: 10 },
    search: { minHeight: 42, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.goldDark + '44', backgroundColor: theme.bgDark + '66', color: theme.textLight },
    filters: { gap: 6, paddingVertical: 10 },
    chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: theme.goldDark + '35' },
    chipActive: { borderColor: theme.gold, backgroundColor: theme.goldDark + '45' },
    chipText: { color: theme.textMuted, fontSize: 11 },
    weekRow: { flexDirection: 'row' },
    weekday: { width: '14.2857%', textAlign: 'center', paddingVertical: 6, color: theme.textMuted, fontSize: 11, fontWeight: '800' },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    day: { width: '14.2857%', minHeight: 43, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: theme.goldDark + '20' },
    dayOutside: { opacity: 0.35 },
    dayToday: { borderWidth: 1.5, borderColor: theme.gold },
    daySelected: { backgroundColor: theme.goldDark + '45' },
    dayText: { color: theme.textLight, fontSize: 12, fontWeight: '700' },
    dot: { width: 5, height: 5, marginTop: 3, borderRadius: 3, backgroundColor: theme.gold },
    showMonth: { alignSelf: 'center', padding: 9 },
    showMonthText: { color: theme.gold, fontSize: 11, fontWeight: '700' },
    agendaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.goldDark + '22' },
    date: { width: 54 },
    solarDate: { color: theme.goldLight, fontSize: 12, fontWeight: '800' },
    lunarDate: { color: theme.textMuted, fontSize: 10, marginTop: 3 },
    details: { flex: 1 },
    observance: { color: theme.textLight, fontSize: 13, fontWeight: '800' },
    meta: { color: theme.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
    detailButton: { paddingHorizontal: 9, paddingVertical: 5 },
    detailText: { color: theme.textMuted, fontSize: 10, fontWeight: '700' },
    followButton: { paddingHorizontal: 9, paddingVertical: 5 },
    followText: { color: theme.goldLight, fontSize: 10, fontWeight: '800' },
    consultButton: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: theme.goldDark + '66' },
    consultText: { color: theme.gold, fontSize: 10, fontWeight: '800' },
    empty: { color: theme.textMuted, textAlign: 'center', padding: 18 },
    note: { color: theme.textMuted, opacity: 0.8, fontSize: 10, lineHeight: 16, marginTop: 8 },
  });
}
