import React, { useMemo } from 'react';
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import type { ThemeColors } from '@/constants/themes';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  getDeityCalendarSources,
  getDeityObservanceById,
  getDeityWorshipDetails,
  getNextDeityObservanceOccurrence,
} from '@/services/lunarDeityCalendar';
import { gods } from '@/data/gods';
import {
  addDeityOccurrenceToDeviceCalendar,
  exportDeityOccurrences,
} from '@/services/deityCalendarExport';

export default function DeityObservanceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const observance = useMemo(
    () => params.id ? getDeityObservanceById(params.id) : null,
    [params.id],
  );
  const god = observance ? gods.find((item) => item.id === observance.godId) : null;
  const nextOccurrence = useMemo(
    () => observance ? getNextDeityObservanceOccurrence(observance.id) : null,
    [observance],
  );
  const details = observance ? getDeityWorshipDetails(observance.godId) : null;
  const sources = observance ? getDeityCalendarSources(observance) : [];

  const handleAddToCalendar = async () => {
    if (!nextOccurrence) return;
    const result = await addDeityOccurrenceToDeviceCalendar(nextOccurrence);
    if (result.status === 'permission-denied') {
      Alert.alert('需要行事曆權限', '請允許行事曆權限後再試一次。');
    } else if (result.status === 'unsupported') {
      Alert.alert('網頁版不支援直接加入', '請改用「匯出這一筆 ICS」後匯入行事曆。');
    } else if (result.status === 'unavailable') {
      Alert.alert('目前無法開啟', '請使用開發版本或改用 ICS 匯出。');
    } else if (result.status === 'saved') {
      Alert.alert('已加入行事曆', nextOccurrence.observance.title);
    } else if (result.status === 'opened') {
      Alert.alert('行事曆畫面已關閉', 'Android 無法回報最後是否儲存，請到系統行事曆確認。');
    }
  };

  const handleExportOccurrence = async () => {
    if (!nextOccurrence) return;
    const result = await exportDeityOccurrences(
      [nextOccurrence],
      nextOccurrence.observance.id + '-' + nextOccurrence.dateKey + '.ics',
      nextOccurrence.observance.title,
    );
    if (result.status === 'unavailable') {
      Alert.alert('無法匯出', '這台裝置目前不支援分享行事曆檔案。');
    }
  };

  if (!observance || !god || !details) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.title}>找不到這筆神明紀念日</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={'light-content'} backgroundColor={theme.bgDark} />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole={'button'} accessibilityLabel={'返回神明月曆'}>
          <Text style={styles.back}>← 返回神明月曆</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <Image source={god.image} style={styles.image} contentFit={'cover'} contentPosition={'top'} />
          <View style={styles.heroText}>
            <Text style={styles.eyebrow}>神明紀念日</Text>
            <Text style={styles.title}>{observance.title}</Text>
            <Text style={styles.godName}>{god.name} · {god.title}</Text>
            <Text style={styles.lunarDate}>農曆 {observance.lunarMonth} 月 {observance.lunarDay} 日</Text>
            {nextOccurrence ? (
              <Text style={styles.nextDate}>下次日期：{nextOccurrence.solarLabel}（{nextOccurrence.lunar.label}）</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>傳承與日期說明</Text>
          <Text style={styles.body}>{observance.traditionNote}</Text>
          <Text style={styles.meta}>適用範圍：{observance.region}</Text>
          <Text style={styles.meta}>
            校勘狀態：{observance.reviewStatus === 'government-reference' ? '已有政府文史或寺廟調查資料參考' : '常見傳承資料，仍需向所屬宮廟確認'}
          </Text>
          <Text style={styles.meta}>資料檢視日期：{observance.reviewedAt}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>參拜準備</Text>
          <Text style={styles.label}>常見供品</Text>
          <Text style={styles.body}>{details.offerings.join('、')}</Text>
          <Text style={styles.label}>常見祈願方向</Text>
          <Text style={styles.body}>{details.prayerFor.join('、')}</Text>
          <Text style={styles.label}>參拜提醒</Text>
          {details.worshipTips.map((tip) => <Text key={tip} style={styles.listItem}>• {tip}</Text>)}
          <Text style={styles.disclaimer}>供品與科儀沒有單一標準，請以實際參拜宮廟公告及現場人員指引為準。</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>資料來源</Text>
          {sources.map((source) => (
            <TouchableOpacity
              key={source.id}
              style={styles.sourceRow}
              onPress={() => Linking.openURL(source.url)}
              accessibilityRole={'link'}
            >
              <View style={styles.sourceText}>
                <Text style={styles.sourceTitle}>{source.title}</Text>
                <Text style={styles.meta}>{source.organization}</Text>
              </View>
              <Text style={styles.sourceArrow}>↗</Text>
            </TouchableOpacity>
          ))}
        </View>

        {nextOccurrence ? (
          <View style={styles.calendarActions}>
            <TouchableOpacity
              style={styles.calendarButton}
              onPress={handleAddToCalendar}
              accessibilityRole={'button'}
              accessibilityLabel={'加入手機行事曆'}
            >
              <Text style={styles.calendarButtonText}>加入手機行事曆</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.calendarButton}
              onPress={handleExportOccurrence}
              accessibilityRole={'button'}
              accessibilityLabel={'匯出這一筆 ICS'}
            >
              <Text style={styles.calendarButtonText}>匯出這一筆 ICS</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {nextOccurrence ? (
          <Text style={styles.calendarHint}>
            {Platform.OS === 'web'
              ? '網頁版請使用 ICS 匯出；下載後可匯入 Google、Apple 或 Outlook 行事曆。'
              : '直接加入功能需要安裝版 App；事件會先開啟系統畫面供你確認。'}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: god.primaryColor, borderColor: god.accentColor }]}
          onPress={() => router.push({ pathname: '/', params: { godId: String(god.id), source: 'deity-calendar-detail' } })}
          accessibilityRole={'button'}
          accessibilityLabel={`向${god.name}正式求籤`}
        >
          <Text style={styles.primaryButtonText}>向{god.name}正式求籤</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.bgDark },
    content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: TempleSpacing.md, paddingBottom: 40 },
    back: { color: theme.gold, fontSize: 13, fontWeight: '700', marginBottom: TempleSpacing.md },
    hero: { flexDirection: 'row', gap: TempleSpacing.md, alignItems: 'center', marginBottom: TempleSpacing.md },
    image: { width: 112, height: 142, borderRadius: 16, backgroundColor: theme.bgCard },
    heroText: { flex: 1 },
    eyebrow: { color: theme.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    title: { color: theme.goldLight, fontSize: 25, lineHeight: 33, fontWeight: '900', marginTop: 5 },
    godName: { color: theme.textLight, fontSize: 13, marginTop: 6 },
    lunarDate: { color: theme.gold, fontSize: TempleFonts.body, fontWeight: '800', marginTop: 10 },
    nextDate: { color: theme.textMuted, fontSize: 12, marginTop: 5 },
    card: { backgroundColor: theme.bgCard, borderRadius: 16, borderWidth: 1, borderColor: theme.goldDark + '35', padding: TempleSpacing.md, marginBottom: TempleSpacing.md },
    cardTitle: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '900', marginBottom: 10 },
    label: { color: theme.gold, fontSize: 12, fontWeight: '800', marginTop: 10, marginBottom: 4 },
    body: { color: theme.textLight, fontSize: 13, lineHeight: 21 },
    listItem: { color: theme.textLight, fontSize: 13, lineHeight: 22 },
    meta: { color: theme.textMuted, fontSize: 11, lineHeight: 17, marginTop: 5 },
    disclaimer: { color: theme.textMuted, fontSize: 11, lineHeight: 17, marginTop: 12 },
    sourceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.goldDark + '22' },
    sourceText: { flex: 1 },
    sourceTitle: { color: theme.textLight, fontSize: 12, fontWeight: '700' },
    sourceArrow: { color: theme.gold, fontSize: 18 },
    calendarActions: { flexDirection: 'row', gap: 10, marginBottom: TempleSpacing.md },
    calendarButton: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: theme.goldDark, paddingVertical: 12, alignItems: 'center' },
    calendarButtonText: { color: theme.gold, fontSize: 12, fontWeight: '800' },
    calendarHint: { color: theme.textMuted, fontSize: 10, lineHeight: 16, marginTop: -8, marginBottom: TempleSpacing.md },
    primaryButton: { borderRadius: 13, borderWidth: 1, paddingVertical: 14, alignItems: 'center' },
    primaryButtonText: { color: '#FFF8E7', fontSize: 14, fontWeight: '900' },
    secondaryButton: { borderRadius: 12, borderWidth: 1, borderColor: theme.goldDark, paddingHorizontal: 18, paddingVertical: 10, marginTop: 18 },
    secondaryButtonText: { color: theme.gold, fontWeight: '800' },
    notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  });
}
