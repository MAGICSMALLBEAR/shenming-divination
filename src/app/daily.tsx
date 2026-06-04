import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import { getDailyFortune, type DailyFortune } from '@/services/dailyFortune';
import { getDailyPoem, getWeeklyPoems } from '@/services/dailyPoem';
import { calcBazi, parseBirthYear } from '@/services/bazi';
import { getSettings } from '@/services/storage';

export default function DailyScreen() {
  const [fortune, setFortune] = useState<DailyFortune>(() => getDailyFortune());

  useEffect(() => {
    getSettings().then((settings) => {
      if (!settings?.birthDate) return;
      const year = parseBirthYear(settings.birthDate);
      if (!year) return;
      setFortune(getDailyFortune(calcBazi(year)));
    });
  }, []);

  const todayPoem = useMemo(() => getDailyPoem(), []);
  const weeklyPoems = useMemo(() => getWeeklyPoems(), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>今日專區</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>今日運勢</Text>
          <Text style={styles.bigValue}>{'★'.repeat(fortune.overall)}{'☆'.repeat(5 - fortune.overall)}</Text>
          <Text style={styles.subtitle}>
            幸運色：{fortune.luckyColor.name} · 幸運數：{fortune.luckyNumber}
          </Text>
          <Text style={styles.subtitle}>
            吉位：{fortune.luckyDirection} · 吉時：{fortune.auspiciousHour}
          </Text>
          <Text style={styles.advice}>{fortune.advice}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>今日籤詩</Text>
          <Text style={styles.poemMeta}>
            {todayPoem.date} · {todayPoem.dayOfWeek}
          </Text>
          <Text style={styles.poemTitle}>
            第 {todayPoem.poem.number} 籤 · {todayPoem.poem.level}
          </Text>
          {todayPoem.poem.content.split('\n').map((line) => (
            <Text key={line} style={styles.poemLine}>
              {line}
            </Text>
          ))}
          <Text style={styles.poemMeaning}>{todayPoem.poem.vernacular}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>本週籤詩節奏</Text>
          {weeklyPoems.map((item) => (
            <View key={item.date} style={styles.weekRow}>
              <View style={styles.weekMeta}>
                <Text style={styles.weekDate}>{item.date}</Text>
                <Text style={styles.weekDay}>{item.dayOfWeek}</Text>
              </View>
              <View style={styles.weekContent}>
                <Text style={styles.weekPoemTitle}>第 {item.poem.number} 籤 · {item.poem.level}</Text>
                <Text style={styles.weekPoemText} numberOfLines={1}>
                  {item.poem.content.split('\n')[0]}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  container: { flex: 1 },
  content: { padding: TempleSpacing.md },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.lg,
  },
  card: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '24',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  cardTitle: {
    color: TempleTheme.goldLight,
    fontWeight: '800',
    fontSize: TempleFonts.body,
    marginBottom: 10,
  },
  bigValue: {
    fontSize: 24,
    fontWeight: '900',
    color: TempleTheme.gold,
    marginBottom: 8,
  },
  subtitle: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    marginBottom: 4,
  },
  advice: {
    marginTop: 10,
    color: TempleTheme.textLight,
    lineHeight: 22,
  },
  poemMeta: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    marginBottom: 6,
  },
  poemTitle: {
    color: TempleTheme.goldLight,
    fontWeight: '700',
    marginBottom: 10,
  },
  poemLine: {
    color: TempleTheme.textLight,
    lineHeight: 24,
    fontSize: TempleFonts.body,
  },
  poemMeaning: {
    marginTop: 12,
    color: TempleTheme.textMuted,
    lineHeight: 22,
    fontSize: TempleFonts.small,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '14',
  },
  weekMeta: {
    width: 72,
  },
  weekDate: {
    color: TempleTheme.goldLight,
    fontWeight: '700',
    fontSize: 12,
  },
  weekDay: {
    color: TempleTheme.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  weekContent: {
    flex: 1,
  },
  weekPoemTitle: {
    color: TempleTheme.textLight,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  weekPoemText: {
    color: TempleTheme.textMuted,
    fontSize: 12,
  },
});
