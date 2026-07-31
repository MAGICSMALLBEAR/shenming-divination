import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import type { ThemeColors } from '@/constants/themes';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getDeityObservancesForSolarMonth } from '@/services/lunarDeityCalendar';

interface DeityMonthCalendarProps {
  initialDate?: Date;
  onConsult: (godId: number) => void;
  onOpenDetails?: (observanceId: string) => void;
}

export function DeityMonthCalendar({ initialDate = new Date(), onConsult, onOpenDetails }: DeityMonthCalendarProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1, 12),
  );
  const occurrences = useMemo(
    () => getDeityObservancesForSolarMonth(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1),
    [visibleMonth],
  );
  const todayKey = [
    initialDate.getFullYear(),
    String(initialDate.getMonth() + 1).padStart(2, '0'),
    String(initialDate.getDate()).padStart(2, '0'),
  ].join('-');

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1, 12));
  };

  return (
    <View style={styles.card} accessibilityLabel={'神明月曆'}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => moveMonth(-1)}
          accessibilityRole={'button'}
          accessibilityLabel={'查看上個月神明月曆'}
        >
          <Text style={styles.monthButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>神明月曆</Text>
          <Text style={styles.title}>{visibleMonth.getFullYear()} 年 {visibleMonth.getMonth() + 1} 月</Text>
        </View>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => moveMonth(1)}
          accessibilityRole={'button'}
          accessibilityLabel={'查看下個月神明月曆'}
        >
          <Text style={styles.monthButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {occurrences.length === 0 ? (
        <Text style={styles.empty}>本月暫無收錄的神明紀念日。</Text>
      ) : occurrences.map((item) => (
        <View
          key={`${item.dateKey}-${item.observance.id}`}
          style={[styles.row, item.dateKey === todayKey && styles.todayRow]}
        >
          <View style={styles.dateBlock}>
            <Text style={styles.solarDate}>{item.solarLabel}</Text>
            <Text style={styles.lunarDate}>{item.lunar.label.replace('農曆', '')}</Text>
          </View>
          <Image source={item.god.image} style={styles.avatar} contentFit={'cover'} contentPosition={'top'} />
          <View style={styles.details}>
            <Text style={styles.observanceTitle}>{item.observance.title}</Text>
            <Text style={styles.godName}>{item.god.name} · {item.observance.traditionNote}</Text>
          </View>
          <View style={styles.rowActions}>
            {onOpenDetails ? (
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => onOpenDetails(item.observance.id)}
                accessibilityRole={'button'}
                accessibilityLabel={`查看${item.observance.title}詳情`}
              >
                <Text style={styles.detailButtonText}>詳情</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.consultButton}
              onPress={() => onConsult(item.god.id)}
              accessibilityRole={'button'}
              accessibilityLabel={`向${item.god.name}求籤`}
            >
              <Text style={styles.consultButtonText}>求籤</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={styles.note}>
        日期依中華農曆換算；神明聖誕與科儀稱謂會因宮廟、地區及傳承而異，參拜前請以所屬宮廟公告為準。
      </Text>
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    card: {
      width: '100%',
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.goldDark + '35',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    heading: { alignItems: 'center' },
    eyebrow: { color: theme.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    title: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '900', marginTop: 3 },
    monthButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.goldDark + '55',
      backgroundColor: theme.bgDark + '55',
    },
    monthButtonText: { color: theme.goldLight, fontSize: 28, lineHeight: 30 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: theme.goldDark + '22',
    },
    todayRow: {
      backgroundColor: theme.goldDark + '16',
      marginHorizontal: -8,
      paddingHorizontal: 8,
      borderRadius: 10,
    },
    dateBlock: { width: 54 },
    solarDate: { color: theme.goldLight, fontSize: 12, fontWeight: '800' },
    lunarDate: { color: theme.textMuted, fontSize: 10, marginTop: 3 },
    avatar: { width: 38, height: 46, borderRadius: 8, backgroundColor: theme.bgDark },
    details: { flex: 1, minWidth: 0 },
    observanceTitle: { color: theme.textLight, fontSize: 13, fontWeight: '800' },
    godName: { color: theme.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
    rowActions: { gap: 5 },
    detailButton: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
    detailButtonText: { color: theme.textMuted, fontSize: 10, fontWeight: '700', textAlign: 'center' },
    consultButton: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: theme.goldDark + '66',
    },
    consultButtonText: { color: theme.gold, fontSize: 11, fontWeight: '800' },
    empty: { color: theme.textMuted, textAlign: 'center', paddingVertical: 18 },
    note: { color: theme.textMuted, opacity: 0.8, fontSize: 10, lineHeight: 16, marginTop: 8 },
  });
}
