// 今日修持：參拜簽到、連續天數與抄經入口
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import type { ThemeColors } from '@/constants/themes';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  calcStreak,
  checkInToday,
  getDailyPractice,
  localDateKey,
  type DailyPracticeState,
} from '@/services/dailyPractice';

export function DailyPracticeCard() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [practice, setPractice] = useState<DailyPracticeState | null>(null);

  // 從抄經頁回來時要重新讀取，數字才會更新
  useFocusEffect(useCallback(() => {
    let active = true;
    getDailyPractice().then((state) => { if (active) setPractice(state); }).catch(() => {});
    return () => { active = false; };
  }, []));

  const today = localDateKey();
  const checkedIn = practice?.checkIns.includes(today) ?? false;
  const streak = practice ? calcStreak(practice.checkIns, today) : 0;
  const totalDays = practice?.checkIns.length ?? 0;
  const copies = practice?.sutraCopies.length ?? 0;
  const copiedToday = practice?.sutraCopies.includes(today) ?? false;

  const handleCheckIn = async () => {
    setPractice(await checkInToday());
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🪔 今日修持</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{streak}</Text>
          <Text style={styles.statLabel}>連續天數</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{totalDays}</Text>
          <Text style={styles.statLabel}>累計參拜</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{copies}</Text>
          <Text style={styles.statLabel}>抄經部數</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.checkInBtn, checkedIn && styles.checkInBtnDone]}
          onPress={handleCheckIn}
          disabled={checkedIn || !practice}
          accessibilityRole="button"
          accessibilityLabel={checkedIn ? '今日已參拜' : '參拜簽到'}
        >
          <Text style={[styles.checkInText, checkedIn && styles.checkInTextDone]}>
            {checkedIn ? '✓ 今日已參拜' : '參拜簽到'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sutraBtn}
          onPress={() => router.push('/sutra-copy' as never)}
          accessibilityRole="button"
          accessibilityLabel="抄寫心經"
        >
          <Text style={styles.sutraText}>{copiedToday ? '✓ 今日已抄經' : '抄寫心經'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>抄完一部心經也會算作今日參拜。紀錄只存在這支手機上。</Text>
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.goldDark + '35',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    title: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '900', marginBottom: TempleSpacing.sm },
    statsRow: { flexDirection: 'row', marginBottom: TempleSpacing.sm },
    stat: { flex: 1, alignItems: 'center' },
    statNumber: { color: theme.gold, fontSize: 24, fontWeight: '900' },
    statLabel: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
    actions: { flexDirection: 'row', gap: 8 },
    checkInBtn: { flex: 1, backgroundColor: theme.red, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    checkInBtnDone: { backgroundColor: theme.bgMedium, borderWidth: 1, borderColor: theme.gold + '50' },
    checkInText: { color: '#FFF', fontWeight: '800', fontSize: TempleFonts.small },
    checkInTextDone: { color: theme.gold },
    sutraBtn: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: theme.gold + '70', paddingVertical: 10, alignItems: 'center' },
    sutraText: { color: theme.gold, fontWeight: '800', fontSize: TempleFonts.small },
    hint: { color: theme.textMuted, fontSize: 11, marginTop: 8 },
  });
}
