import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import { gods, type God } from '@/data/gods';
import { getGodCardImage, getGodSoftImage } from '@/data/godImages';
import { getTemplePrayerFlow } from '@/data/templeFlows';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import {
  addTempleRecord,
  getGodTempleStats,
  getTempleRecords,
  type TempleRecord,
} from '@/services/templeService';
import {
  getTodayRecommendedGod,
  getUpcomingGodBirthdays,
  getGodWorshipInfo,
} from '@/data/lunarCalendar';
import { speakGodBlessing, stopSpeaking, isCurrentlySpeaking } from '@/services/speech';
import { getBlessingText } from '@/services/speech';
import { PhotoDivination } from '@/components/PhotoDivination';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { canUseFeature, isPremiumActive } from '@/services/premiumService';

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

function recordTypeLabel(type: TempleRecord['type']): string {
  if (type === 'light') return '點燈';
  if (type === 'flower') return '獻花';
  return '祈願';
}

export default function TempleScreen() {
  const layout = useResponsiveLayout();
  const [records, setRecords] = useState<TempleRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGodId, setSelectedGodId] = useState(gods[0]?.id ?? 1);
  const [prayerText, setPrayerText] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [showPhotoDiv, setShowPhotoDiv] = useState(false);
  const [isSpeakingBlessing, setIsSpeakingBlessing] = useState(false);
  const [shownBlessing, setShownBlessing] = useState<string | null>(null);
  const [showBirthdayPanel, setShowBirthdayPanel] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('線上長明燈');
  const [longLightActive, setLongLightActive] = useState<Record<number, boolean>>({});
  const [premiumActive, setPremiumActive] = useState(false);

  useEffect(() => {
    isPremiumActive().then(setPremiumActive);
  }, []);
  const todayRec = useMemo(() => getTodayRecommendedGod(), []);
  const upcomingBirthdays = useMemo(() => getUpcomingGodBirthdays(60), []);

  const selectedGod = useMemo(
    () => gods.find((god) => god.id === selectedGodId) ?? gods[0],
    [selectedGodId]
  );
  const selectedFlow = useMemo(() => getTemplePrayerFlow(selectedGod), [selectedGod]);
  const selectedStats = useMemo(
    () => getGodTempleStats(records, selectedGod.id),
    [records, selectedGod.id]
  );
  const recentRecords = useMemo(() => records.slice(0, 8), [records]);

  const columns = layout.isWideDesktop ? 4 : layout.isDesktop ? 3 : layout.isPhone ? 1 : 2;
  const cardGap = TempleSpacing.sm;
  const gridWidth = Math.min(layout.width - layout.gutter * 2, layout.contentMaxWidth);
  const cardWidth = columns === 1 ? gridWidth : (gridWidth - cardGap * (columns - 1)) / columns;

  const loadRecords = useCallback(async () => {
    setRecords(await getTempleRecords());
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRecords();
    } finally {
      setRefreshing(false);
    }
  }, [loadRecords]);

  const flashAction = (message: string) => {
    setLastAction(message);
    setTimeout(() => setLastAction(null), 2200);
  };

  const handleSpeak = async () => {
    if (isSpeakingBlessing) {
      await stopSpeaking();
      setIsSpeakingBlessing(false);
      return;
    }
    const text = getBlessingText(selectedGod.id, false);
    setShownBlessing(text);
    setIsSpeakingBlessing(true);
    await speakGodBlessing(selectedGod.id);
    setIsSpeakingBlessing(false);
  };

  const handleLight = async () => {
    await addTempleRecord({
      godId: selectedGod.id,
      godName: selectedGod.name,
      type: 'light',
      title: selectedFlow.lightName,
      content: selectedFlow.offering,
      expiresAt: Date.now() + 7 * DAY_MS,
    });
    await loadRecords();
    flashAction(`${selectedFlow.lightName}已點亮，願光明照路。`);
  };

  const handleLongLight = async () => {
    const allowed = await canUseFeature('online_candle');
    if (!allowed) {
      setPaywallFeature('線上長明燈');
      setShowPaywall(true);
      return;
    }
    await addTempleRecord({
      godId: selectedGod.id,
      godName: selectedGod.name,
      type: 'light',
      title: '長明燈',
      content: `為${selectedGod.name}點上長明燈，燈火不滅，福光庇護30日。`,
      expiresAt: Date.now() + 30 * DAY_MS,
    });
    setLongLightActive(prev => ({ ...prev, [selectedGod.id]: true }));
    await loadRecords();
    flashAction(`${selectedGod.name}的長明燈已點亮，福光庇護30日！`);
  };

  const handleFlower = async () => {
    await addTempleRecord({
      godId: selectedGod.id,
      godName: selectedGod.name,
      type: 'flower',
      title: selectedFlow.flowerName,
      content: '一束清香供花，願心念清淨，善緣開展。',
      expiresAt: Date.now() + DAY_MS,
    });
    await loadRecords();
    flashAction(`${selectedFlow.flowerName}已供上，願心意被安放。`);
  };

  const handlePrayer = async () => {
    const content = prayerText.trim();
    if (!content) {
      Alert.alert('先寫下願心', '請用一兩句話寫下你想向神明稟明的事情。');
      return;
    }

    await addTempleRecord({
      godId: selectedGod.id,
      godName: selectedGod.name,
      type: 'prayer',
      title: selectedFlow.title,
      content,
    });
    setPrayerText('');
    await loadRecords();
    flashAction('祈願已安放在神明殿前。');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { maxWidth: layout.contentMaxWidth, paddingHorizontal: layout.gutter },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={TempleTheme.gold} />
        }
      >
        <View style={styles.hero}>
          <Text style={styles.pageEyebrow}>Virtual Temple</Text>
          <Text style={styles.pageTitle}>神明殿</Text>
          <Text style={styles.pageSubtitle}>
            選一位神明，點燈、獻花，或把願心安放在祂的殿前。
          </Text>
          <TouchableOpacity style={styles.photoBtn} onPress={() => setShowPhotoDiv(true)}>
            <Text style={styles.photoBtnText}>拍照解籤</Text>
          </TouchableOpacity>
        </View>

        {/* 今日推薦禮拜 */}
        {todayRec ? (
          <TouchableOpacity
            style={[
              styles.todayRecCard,
              todayRec.isSpecialDay && styles.todayRecCardSpecial,
            ]}
            onPress={() => setSelectedGodId(todayRec.godId)}
            activeOpacity={0.85}
          >
            <View style={styles.todayRecHeader}>
              <Text style={styles.todayRecEyebrow}>
                {todayRec.isSpecialDay ? '今日聖誕吉日' : '今日推薦禮拜'}
              </Text>
              <Text style={styles.todayRecName}>{todayRec.name}</Text>
            </View>
            <Text style={styles.todayRecReason}>{todayRec.reason}</Text>
            <View style={styles.todayRecTags}>
              {todayRec.prayerFor.slice(0, 3).map(p => (
                <View key={p} style={styles.prayerTag}>
                  <Text style={styles.prayerTagText}>{p}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.todayRecHint}>點此切換到{todayRec.name}</Text>
          </TouchableOpacity>
        ) : null}

        {/* 近期神明聖誕 */}
        <TouchableOpacity
          style={styles.birthdayToggle}
          onPress={() => setShowBirthdayPanel(v => !v)}
          activeOpacity={0.8}
        >
          <Text style={styles.birthdayToggleText}>
            近期神明聖誕 ({upcomingBirthdays.length} 個){showBirthdayPanel ? ' ▲' : ' ▼'}
          </Text>
        </TouchableOpacity>

        {showBirthdayPanel && (
          <View style={styles.birthdayPanel}>
            {upcomingBirthdays.length === 0 ? (
              <Text style={styles.birthdayEmpty}>未來 60 天內無神明聖誕紀錄</Text>
            ) : (
              upcomingBirthdays.map(b => (
                <TouchableOpacity
                  key={b.godId + b.lunarDateStr}
                  style={styles.birthdayRow}
                  onPress={() => setSelectedGodId(b.godId)}
                >
                  <View style={styles.birthdayInfo}>
                    <Text style={styles.birthdayGodName}>{b.name}</Text>
                    <Text style={styles.birthdayDate}>{b.lunarDateStr}｜{b.approxSolarDate}</Text>
                    <Text style={styles.birthdayOfferings}>
                      供品：{b.offerings.slice(0, 3).join('、')}
                    </Text>
                  </View>
                  <View style={styles.birthdayDaysBadge}>
                    <Text style={styles.birthdayDaysNum}>{b.daysUntil}</Text>
                    <Text style={styles.birthdayDaysLabel}>天後</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <View style={styles.templeGrid}>
          {gods.map((god) => (
            <TempleGodCard
              key={god.id}
              god={god}
              width={cardWidth}
              selected={selectedGod.id === god.id}
              stats={getGodTempleStats(records, god.id)}
              onPress={() => setSelectedGodId(god.id)}
            />
          ))}
        </View>

        <View style={[styles.ritualPanel, layout.isDesktop && styles.ritualPanelDesktop]}>
          <View style={[styles.selectedGodPanel, { borderColor: selectedGod.accentColor + '55' }]}>
            <Image
              source={getGodSoftImage(selectedGod.id) ?? getGodCardImage(selectedGod.id) ?? selectedGod.image}
              style={styles.selectedGodImage}
              contentFit="cover"
              contentPosition="top"
            />
            <View style={[styles.selectedGodOverlay, { backgroundColor: selectedGod.primaryColor + 'CC' }]} />
            <View style={styles.selectedGodContent}>
              <Text style={[styles.selectedGodTitle, { color: selectedGod.accentColor }]}>
                {selectedGod.title}
              </Text>
              <Text style={styles.selectedGodName}>{selectedGod.name}</Text>
              <Text style={[styles.selectedGodTagline, { color: selectedGod.accentColor }]}>
                {selectedGod.tagline}
              </Text>
              <View style={styles.statRow}>
                <TempleStat label="燈" value={selectedStats.lights} />
                <TempleStat label="花" value={selectedStats.flowers} />
                <TempleStat label="願" value={selectedStats.prayers} />
              </View>
            </View>
          </View>

          <View style={styles.prayerPanel}>
            <Text style={styles.sectionTitle}>{selectedFlow.title}</Text>
            <Text style={styles.sectionText}>{selectedFlow.offering}</Text>

            <View style={styles.ritualActions}>
              <TouchableOpacity style={styles.lightBtn} onPress={handleLight}>
                <Text style={styles.ritualBtnIcon}>燈</Text>
                <Text style={styles.ritualBtnText}>點亮{selectedFlow.lightName}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.flowerBtn} onPress={handleFlower}>
                <Text style={styles.ritualBtnIcon}>花</Text>
                <Text style={styles.ritualBtnText}>供上{selectedFlow.flowerName}</Text>
              </TouchableOpacity>
            </View>

            {/* 神明祝福語音 */}
            <TouchableOpacity
              style={[styles.blessingBtn, isSpeakingBlessing && styles.blessingBtnActive]}
              onPress={handleSpeak}
            >
              <Text style={styles.blessingBtnText}>
                {isSpeakingBlessing ? '停止朗讀' : `聽${selectedGod.name}祝福語`}
              </Text>
            </TouchableOpacity>
            {shownBlessing ? (
              <Text style={styles.blessingText}>{shownBlessing}</Text>
            ) : null}

            <Text style={styles.promptLabel}>專屬祈願引導</Text>
            <View style={styles.promptGrid}>
              {selectedFlow.prompts.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  style={styles.promptChip}
                  onPress={() => setPrayerText(prompt)}
                >
                  <Text style={styles.promptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.prayerInput}
              value={prayerText}
              onChangeText={setPrayerText}
              placeholder={`向${selectedGod.name}稟明你的願心...`}
              placeholderTextColor={TempleTheme.textMuted}
              multiline
            />
            <TouchableOpacity style={styles.prayerSubmitBtn} onPress={handlePrayer}>
              <Text style={styles.prayerSubmitText}>安放祈願</Text>
            </TouchableOpacity>
          </View>
        </View>

        {lastAction ? (
          <View style={styles.actionToast}>
            <Text style={styles.actionToastText}>{lastAction}</Text>
          </View>
        ) : null}

        {/* 線上長明燈（Premium 功能） */}
        <View style={styles.longLightCard}>
          <View style={styles.longLightHeader}>
            <Text style={styles.longLightTitle}>🕯 線上長明燈</Text>
            {!premiumActive && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>👑 Premium</Text>
              </View>
            )}
          </View>
          <Text style={styles.longLightDesc}>
            點亮長明燈，讓{selectedGod.name}的福光守護你 30 天。
            長明燈會記錄在你的供奉紀錄中，隨時可以查看。
          </Text>
          <TouchableOpacity
            style={[
              styles.longLightBtn,
              longLightActive[selectedGod.id] && styles.longLightBtnActive,
            ]}
            onPress={handleLongLight}
          >
            <Text style={styles.longLightBtnText}>
              {longLightActive[selectedGod.id]
                ? '✓ 長明燈已點亮'
                : premiumActive
                  ? '點亮長明燈（30天）'
                  : '升級解鎖長明燈'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.sectionTitle}>最近供奉紀錄</Text>
          {!recentRecords.length ? (
            <Text style={styles.emptyText}>還沒有點燈、獻花或祈願。先選一位神明開始吧。</Text>
          ) : null}
          {recentRecords.map((record) => (
            <View key={record.id} style={styles.recordRow}>
              <View style={styles.recordMeta}>
                <Text style={styles.recordTitle}>
                  {recordTypeLabel(record.type)} · {record.title}
                </Text>
                <Text style={styles.recordText} numberOfLines={2}>
                  {record.godName}｜{record.content}
                </Text>
              </View>
              <Text style={styles.recordDate}>{formatDate(record.createdAt)}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      <PhotoDivination
        visible={showPhotoDiv}
        onClose={() => setShowPhotoDiv(false)}
      />
      <PremiumPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureName={paywallFeature}
        onActivated={() => { setPremiumActive(true); setShowPaywall(false); }}
      />
    </SafeAreaView>
  );
}

function TempleGodCard({
  god,
  width,
  selected,
  stats,
  onPress,
}: {
  god: God;
  width: number;
  selected: boolean;
  stats: ReturnType<typeof getGodTempleStats>;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.godCard,
        { width, borderColor: selected ? god.accentColor : god.accentColor + '35' },
        selected && styles.godCardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.86}
    >
      <Image
        source={getGodCardImage(god.id) ?? god.image}
        style={styles.godImage}
        contentFit="cover"
        contentPosition="top"
      />
      <View style={[styles.godOverlay, { backgroundColor: god.primaryColor + 'B8' }]} />
      <View style={styles.godCardContent}>
        <Text style={[styles.godCardTitle, { color: god.accentColor }]}>{god.title}</Text>
        <Text style={styles.godCardName}>{god.name}</Text>
        <Text style={styles.godCardText}>{god.tagline}</Text>
        <View style={styles.miniStatRow}>
          <Text style={styles.miniStat}>燈 {stats.lights}</Text>
          <Text style={styles.miniStat}>花 {stats.flowers}</Text>
          <Text style={styles.miniStat}>願 {stats.prayers}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TempleStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  container: { flex: 1 },
  content: { width: '100%', alignSelf: 'center', paddingVertical: TempleSpacing.md },
  hero: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '28',
    padding: TempleSpacing.lg,
    marginBottom: TempleSpacing.md,
    backgroundColor: TempleTheme.bgCard,
  },
  photoBtn: {
    marginTop: TempleSpacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '60',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: TempleTheme.bgDark + '80',
  },
  photoBtnText: {
    color: TempleTheme.gold,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    letterSpacing: 2,
  },
  todayRecCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
    backgroundColor: TempleTheme.bgCard,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  todayRecCardSpecial: {
    borderColor: TempleTheme.gold + '80',
    backgroundColor: TempleTheme.goldDark + '18',
  },
  todayRecHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 8,
  },
  todayRecEyebrow: {
    color: TempleTheme.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  todayRecName: {
    color: TempleTheme.goldLight,
    fontSize: 20,
    fontWeight: '900',
  },
  todayRecReason: {
    color: TempleTheme.textLight,
    fontSize: TempleFonts.small,
    lineHeight: 22,
    marginBottom: 10,
  },
  todayRecTags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  prayerTag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: TempleTheme.bgDark + '55',
  },
  prayerTagText: {
    color: TempleTheme.textMuted,
    fontSize: 12,
  },
  todayRecHint: {
    color: TempleTheme.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  birthdayToggle: {
    marginBottom: TempleSpacing.sm,
    paddingVertical: 10,
    paddingHorizontal: TempleSpacing.md,
    borderRadius: 12,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '28',
  },
  birthdayToggleText: {
    color: TempleTheme.gold,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  birthdayPanel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '28',
    backgroundColor: TempleTheme.bgCard,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    gap: 2,
  },
  birthdayEmpty: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    textAlign: 'center',
    paddingVertical: 8,
  },
  birthdayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '14',
    gap: TempleSpacing.sm,
  },
  birthdayInfo: { flex: 1 },
  birthdayGodName: {
    color: TempleTheme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '800',
    marginBottom: 3,
  },
  birthdayDate: {
    color: TempleTheme.textMuted,
    fontSize: 12,
    marginBottom: 3,
  },
  birthdayOfferings: {
    color: TempleTheme.textMuted,
    fontSize: 12,
  },
  birthdayDaysBadge: {
    alignItems: 'center',
    backgroundColor: TempleTheme.goldDark + '22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
  },
  birthdayDaysNum: {
    color: TempleTheme.gold,
    fontSize: 20,
    fontWeight: '900',
  },
  birthdayDaysLabel: {
    color: TempleTheme.textMuted,
    fontSize: 11,
  },
  blessingBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '55',
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: TempleSpacing.sm,
    backgroundColor: TempleTheme.bgDark + '55',
  },
  blessingBtnActive: {
    borderColor: TempleTheme.gold,
    backgroundColor: TempleTheme.goldDark + '30',
  },
  blessingBtnText: {
    color: TempleTheme.gold,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    letterSpacing: 1,
  },
  blessingText: {
    color: TempleTheme.textLight,
    fontSize: 13,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: TempleSpacing.md,
    paddingHorizontal: 4,
  },
  pageEyebrow: {
    color: TempleTheme.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  pageSubtitle: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.body,
    lineHeight: 24,
    textAlign: 'center',
  },
  templeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: TempleSpacing.sm,
    marginBottom: TempleSpacing.md,
  },
  godCard: {
    height: 250,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: TempleTheme.bgCard,
  },
  godCardSelected: {
    shadowColor: TempleTheme.goldLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.42,
    shadowRadius: 16,
  },
  godImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  godOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  godCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: TempleSpacing.md,
  },
  godCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  godCardName: {
    fontSize: TempleFonts.heading,
    color: TempleTheme.goldLight,
    fontWeight: '900',
    marginBottom: 4,
  },
  godCardText: {
    color: TempleTheme.textLight,
    fontSize: TempleFonts.small,
    marginBottom: 10,
  },
  miniStatRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  miniStat: {
    color: TempleTheme.goldLight,
    fontSize: 11,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: TempleTheme.bgDark + '55',
  },
  ritualPanel: {
    gap: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  ritualPanelDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  selectedGodPanel: {
    flex: 1,
    minHeight: 360,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: TempleTheme.bgCard,
  },
  selectedGodImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  selectedGodOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  selectedGodContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: TempleSpacing.lg,
  },
  selectedGodTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  selectedGodName: {
    fontSize: 32,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    marginBottom: 6,
  },
  selectedGodTagline: {
    fontSize: TempleFonts.body,
    fontWeight: '800',
    marginBottom: TempleSpacing.md,
  },
  statRow: {
    flexDirection: 'row',
    gap: TempleSpacing.sm,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: TempleTheme.bgDark + '66',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '35',
    padding: TempleSpacing.sm,
  },
  statValue: {
    color: TempleTheme.goldLight,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: TempleTheme.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  prayerPanel: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '28',
    backgroundColor: TempleTheme.bgCard,
    padding: TempleSpacing.lg,
  },
  sectionTitle: {
    color: TempleTheme.goldLight,
    fontSize: TempleFonts.heading,
    fontWeight: '900',
    marginBottom: 8,
  },
  sectionText: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 22,
    marginBottom: TempleSpacing.md,
  },
  ritualActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TempleSpacing.sm,
    marginBottom: TempleSpacing.md,
  },
  lightBtn: {
    flex: 1,
    minWidth: 190,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TempleTheme.gold + '70',
    backgroundColor: TempleTheme.goldDark + '22',
    padding: TempleSpacing.md,
  },
  flowerBtn: {
    flex: 1,
    minWidth: 190,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F7C5CC70',
    backgroundColor: '#C95B7322',
    padding: TempleSpacing.md,
  },
  ritualBtnIcon: {
    fontSize: 22,
    color: TempleTheme.goldLight,
    fontWeight: '900',
    marginBottom: 6,
  },
  ritualBtnText: {
    color: TempleTheme.goldLight,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    lineHeight: 20,
  },
  promptLabel: {
    color: TempleTheme.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  promptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: TempleSpacing.sm,
  },
  promptChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '32',
    backgroundColor: TempleTheme.bgDark + '45',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  promptText: {
    color: TempleTheme.textLight,
    fontSize: 12,
  },
  prayerInput: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
    backgroundColor: TempleTheme.bgDark + '45',
    color: TempleTheme.textLight,
    padding: TempleSpacing.md,
    fontSize: TempleFonts.body,
    lineHeight: 24,
    textAlignVertical: 'top',
    marginBottom: TempleSpacing.sm,
  },
  prayerSubmitBtn: {
    borderRadius: 14,
    backgroundColor: TempleTheme.red,
    alignItems: 'center',
    paddingVertical: 14,
  },
  prayerSubmitText: {
    color: TempleTheme.goldLight,
    fontWeight: '900',
    fontSize: TempleFonts.body,
    letterSpacing: 2,
  },
  actionToast: {
    borderRadius: 999,
    backgroundColor: TempleTheme.goldDark,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: TempleSpacing.md,
  },
  actionToastText: {
    color: '#fff',
    fontSize: TempleFonts.small,
    fontWeight: '800',
  },
  // 線上長明燈
  longLightCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: TempleTheme.goldDark + '55',
    backgroundColor: TempleTheme.bgCard,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    marginTop: 4,
  },
  longLightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  longLightTitle: {
    color: TempleTheme.gold,
    fontWeight: '900',
    fontSize: TempleFonts.body,
  },
  premiumBadge: {
    backgroundColor: TempleTheme.goldDark + '33',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: TempleTheme.gold + '55',
  },
  premiumBadgeText: { color: TempleTheme.gold, fontSize: 11, fontWeight: '700' },
  longLightDesc: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 20,
    marginBottom: 12,
  },
  longLightBtn: {
    backgroundColor: TempleTheme.goldDark + '44',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TempleTheme.gold + '66',
  },
  longLightBtnActive: {
    backgroundColor: '#2d5a2d55',
    borderColor: '#4caf5066',
  },
  longLightBtnText: { color: TempleTheme.gold, fontWeight: '700', fontSize: TempleFonts.body },

  historyCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '24',
    backgroundColor: TempleTheme.bgCard,
    padding: TempleSpacing.md,
  },
  emptyText: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 22,
  },
  recordRow: {
    flexDirection: 'row',
    gap: TempleSpacing.sm,
    paddingVertical: TempleSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: TempleTheme.goldDark + '14',
  },
  recordMeta: { flex: 1 },
  recordTitle: {
    color: TempleTheme.goldLight,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    marginBottom: 4,
  },
  recordText: {
    color: TempleTheme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  recordDate: {
    color: TempleTheme.textMuted,
    fontSize: 11,
    minWidth: 62,
    textAlign: 'right',
  },
});
