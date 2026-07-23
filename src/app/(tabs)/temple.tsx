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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
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
} from '@/data/lunarCalendar';
import { speakGodBlessing, stopSpeaking, getBlessingText } from '@/services/speech';
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
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

  const columns = layout.isWideDesktop ? 5 : layout.isDesktop ? 5 : layout.isTablet ? 3 : 2;
  const cardGap = TempleSpacing.sm;
  const gridWidth = Math.min(layout.width - layout.gutter * 2, layout.contentMaxWidth);
  const cardWidth = (gridWidth - cardGap * (columns - 1)) / columns;

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
      <StatusBar barStyle="light-content" backgroundColor={theme.bgDark} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { maxWidth: layout.contentMaxWidth, paddingHorizontal: layout.gutter },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.gold} />
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
              placeholderTextColor={theme.textMuted}
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

        {/* 線上法事委辦 */}
        <RitualBookingSection />

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

// ─── 線上法事委辦 ──────────────────────────────────────────────────────────
const RITUAL_SERVICES = [
  { id: 'anTaiSui', name: '安太歲', desc: '化解當年沖煞太歲，保佑平安順遂。', price: 'NT$ 1,200' },
  { id: 'buYun', name: '補運改運', desc: '補足先天運勢不足，扭轉低谷困境。', price: 'NT$ 2,400' },
  { id: 'guangMing', name: '點光明燈', desc: '為自己或家人點燈，照亮前途運程。', price: 'NT$ 800' },
  { id: 'qiFu', name: '祈福法會', desc: '年度集體祈福法會，廣積福田。', price: 'NT$ 600' },
  { id: 'jieXie', name: '解厄消災', desc: '化解流年凶星，消除不良氣場。', price: 'NT$ 1,800' },
];

const RITUAL_BOOKING_KEY = '@ritual_bookings';

interface RitualBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  name: string;
  phone: string;
  date: string;
  timestamp: number;
  status: 'pending' | 'confirmed';
}

function RitualBookingSection() {
  const { theme } = useAppTheme();
  const rb = useMemo(() => createRbStyles(theme), [theme]);
  const [selectedService, setSelectedService] = useState<typeof RITUAL_SERVICES[0] | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [bookings, setBookings] = useState<RitualBooking[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(RITUAL_BOOKING_KEY).then(raw => {
      if (raw) setBookings(JSON.parse(raw));
    }).catch(() => {});
  }, []);

  const handleBook = async () => {
    if (!selectedService || !name.trim() || !date.trim()) {
      Alert.alert('請填寫完整', '請選擇法事項目並填寫姓名與日期。');
      return;
    }
    const booking: RitualBooking = {
      id: `bk_${Date.now()}`,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      name: name.trim(),
      phone: phone.trim(),
      date: date.trim(),
      timestamp: Date.now(),
      status: 'confirmed',
    };
    const updated = [booking, ...bookings];
    await AsyncStorage.setItem(RITUAL_BOOKING_KEY, JSON.stringify(updated));
    setBookings(updated);
    setName(''); setPhone(''); setDate(''); setSelectedService(null); setShowForm(false);
    Alert.alert('預約成功 🙏', `${booking.serviceName} 已預約，廟方將於 24 小時內確認。\n\n姓名：${booking.name}\n日期：${booking.date}`);
  };

  return (
    <View style={rb.container}>
      <Text style={rb.title}>線上法事委辦</Text>
      <Text style={rb.subtitle}>選擇所需法事，填寫資料後提交，廟方將聯繫確認。</Text>
      <View style={rb.serviceList}>
        {RITUAL_SERVICES.map(svc => (
          <TouchableOpacity
            key={svc.id}
            style={[rb.serviceCard, selectedService?.id === svc.id && rb.serviceCardActive]}
            onPress={() => { setSelectedService(svc); setShowForm(true); }}
          >
            <View style={rb.serviceRow}>
              <Text style={rb.serviceName}>{svc.name}</Text>
              <Text style={rb.servicePrice}>{svc.price}</Text>
            </View>
            <Text style={rb.serviceDesc}>{svc.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {showForm && selectedService && (
        <View style={rb.form}>
          <Text style={rb.formTitle}>預約 {selectedService.name}</Text>
          <TextInput style={rb.input} value={name} onChangeText={setName} placeholder="姓名（必填）" placeholderTextColor={theme.textMuted} />
          <TextInput style={rb.input} value={phone} onChangeText={setPhone} placeholder="聯絡電話（選填）" placeholderTextColor={theme.textMuted} keyboardType="phone-pad" />
          <TextInput style={rb.input} value={date} onChangeText={setDate} placeholder="希望日期（如：2026-07-15）" placeholderTextColor={theme.textMuted} />
          <View style={rb.formBtns}>
            <TouchableOpacity style={rb.cancelBtn} onPress={() => { setShowForm(false); setSelectedService(null); }}>
              <Text style={rb.cancelBtnText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={rb.submitBtn} onPress={handleBook}>
              <Text style={rb.submitBtnText}>確認預約</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {bookings.length > 0 && (
        <View style={rb.bookingList}>
          <Text style={rb.bookingListTitle}>我的預約記錄</Text>
          {bookings.slice(0, 3).map(b => (
            <View key={b.id} style={rb.bookingItem}>
              <Text style={rb.bookingName}>{b.serviceName} · {b.name}</Text>
              <Text style={rb.bookingDate}>{b.date}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function createRbStyles(theme: ThemeColors) {
  return StyleSheet.create({
  container: { marginHorizontal: TempleSpacing.xs, marginBottom: TempleSpacing.md, backgroundColor: theme.bgCard, borderRadius: 16, borderWidth: 1, borderColor: theme.redLight + '40', padding: TempleSpacing.md },
  title: { fontSize: TempleFonts.heading, fontWeight: 'bold', color: theme.redLight, marginBottom: 4 },
  subtitle: { fontSize: TempleFonts.small, color: theme.textMuted, marginBottom: TempleSpacing.md },
  serviceList: { gap: 8 },
  serviceCard: { backgroundColor: theme.bgMedium, borderRadius: 10, borderWidth: 1, borderColor: theme.redLight + '30', padding: TempleSpacing.sm },
  serviceCardActive: { borderColor: theme.redLight, backgroundColor: theme.red + '22' },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  serviceName: { color: theme.textLight, fontWeight: 'bold', fontSize: TempleFonts.body },
  servicePrice: { color: theme.goldLight, fontSize: TempleFonts.small, fontWeight: '600' },
  serviceDesc: { color: theme.textMuted, fontSize: 12 },
  form: { marginTop: TempleSpacing.md, gap: 8 },
  formTitle: { color: theme.textGold, fontWeight: 'bold', fontSize: TempleFonts.body, marginBottom: 4 },
  input: { backgroundColor: theme.bgDark, borderRadius: 8, borderWidth: 1, borderColor: theme.gold + '50', padding: 10, color: theme.textLight, fontSize: TempleFonts.body } as any,
  formBtns: { flexDirection: 'row', gap: 8 },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.textMuted, alignItems: 'center' },
  cancelBtnText: { color: theme.textMuted, fontSize: TempleFonts.body },
  submitBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: theme.red, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: TempleFonts.body },
  bookingList: { marginTop: TempleSpacing.md, borderTopWidth: 1, borderTopColor: theme.goldDark + '30', paddingTop: TempleSpacing.sm },
  bookingListTitle: { color: theme.textGold, fontWeight: 'bold', fontSize: TempleFonts.small, marginBottom: 6 },
  bookingItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  bookingName: { color: theme.textLight, fontSize: 12 },
  bookingDate: { color: theme.textMuted, fontSize: 12 },
  });
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
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, overflow: "hidden" as const, backgroundColor: theme.bgDark },
  container: { flex: 1, overflow: "hidden" as const },
  content: { width: '100%', alignSelf: 'center', paddingVertical: TempleSpacing.md },
  hero: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.goldDark + '28',
    padding: TempleSpacing.lg,
    marginBottom: TempleSpacing.md,
    backgroundColor: theme.bgCard,
  },
  photoBtn: {
    marginTop: TempleSpacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.goldDark + '60',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: theme.bgDark + '80',
  },
  photoBtnText: {
    color: theme.gold,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    letterSpacing: 2,
  },
  todayRecCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.goldDark + '40',
    backgroundColor: theme.bgCard,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  todayRecCardSpecial: {
    borderColor: theme.gold + '80',
    backgroundColor: theme.goldDark + '18',
  },
  todayRecHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 8,
  },
  todayRecEyebrow: {
    color: theme.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  todayRecName: {
    color: theme.goldLight,
    fontSize: 20,
    fontWeight: '900',
  },
  todayRecReason: {
    color: theme.textLight,
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
    borderColor: theme.goldDark + '40',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.bgDark + '55',
  },
  prayerTagText: {
    color: theme.textMuted,
    fontSize: 12,
  },
  todayRecHint: {
    color: theme.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  birthdayToggle: {
    marginBottom: TempleSpacing.sm,
    paddingVertical: 10,
    paddingHorizontal: TempleSpacing.md,
    borderRadius: 12,
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '28',
  },
  birthdayToggleText: {
    color: theme.gold,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  birthdayPanel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.goldDark + '28',
    backgroundColor: theme.bgCard,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    gap: 2,
  },
  birthdayEmpty: {
    color: theme.textMuted,
    fontSize: TempleFonts.small,
    textAlign: 'center',
    paddingVertical: 8,
  },
  birthdayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.goldDark + '14',
    gap: TempleSpacing.sm,
  },
  birthdayInfo: { flex: 1 },
  birthdayGodName: {
    color: theme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '800',
    marginBottom: 3,
  },
  birthdayDate: {
    color: theme.textMuted,
    fontSize: 12,
    marginBottom: 3,
  },
  birthdayOfferings: {
    color: theme.textMuted,
    fontSize: 12,
  },
  birthdayDaysBadge: {
    alignItems: 'center',
    backgroundColor: theme.goldDark + '22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.goldDark + '40',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
  },
  birthdayDaysNum: {
    color: theme.gold,
    fontSize: 20,
    fontWeight: '900',
  },
  birthdayDaysLabel: {
    color: theme.textMuted,
    fontSize: 11,
  },
  blessingBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.goldDark + '55',
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: TempleSpacing.sm,
    backgroundColor: theme.bgDark + '55',
  },
  blessingBtnActive: {
    borderColor: theme.gold,
    backgroundColor: theme.goldDark + '30',
  },
  blessingBtnText: {
    color: theme.gold,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    letterSpacing: 1,
  },
  blessingText: {
    color: theme.textLight,
    fontSize: 13,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: TempleSpacing.md,
    paddingHorizontal: 4,
  },
  pageEyebrow: {
    color: theme.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: theme.goldLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  pageSubtitle: {
    color: theme.textMuted,
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
    backgroundColor: theme.bgCard,
  },
  godCardSelected: {
    shadowColor: theme.goldLight,
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
    color: theme.goldLight,
    fontWeight: '900',
    marginBottom: 4,
  },
  godCardText: {
    color: theme.textLight,
    fontSize: TempleFonts.small,
    marginBottom: 10,
  },
  miniStatRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  miniStat: {
    color: theme.goldLight,
    fontSize: 11,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: theme.goldDark + '40',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: theme.bgDark + '55',
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
    backgroundColor: theme.bgCard,
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
    color: theme.goldLight,
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
    backgroundColor: theme.bgDark + '66',
    borderWidth: 1,
    borderColor: theme.goldDark + '35',
    padding: TempleSpacing.sm,
  },
  statValue: {
    color: theme.goldLight,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  prayerPanel: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.goldDark + '28',
    backgroundColor: theme.bgCard,
    padding: TempleSpacing.lg,
  },
  sectionTitle: {
    color: theme.goldLight,
    fontSize: TempleFonts.heading,
    fontWeight: '900',
    marginBottom: 8,
  },
  sectionText: {
    color: theme.textMuted,
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
    borderColor: theme.gold + '70',
    backgroundColor: theme.goldDark + '22',
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
    color: theme.goldLight,
    fontWeight: '900',
    marginBottom: 6,
  },
  ritualBtnText: {
    color: theme.goldLight,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    lineHeight: 20,
  },
  promptLabel: {
    color: theme.gold,
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
    borderColor: theme.goldDark + '32',
    backgroundColor: theme.bgDark + '45',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  promptText: {
    color: theme.textLight,
    fontSize: 12,
  },
  prayerInput: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
    backgroundColor: theme.bgDark + '45',
    color: theme.textLight,
    padding: TempleSpacing.md,
    fontSize: TempleFonts.body,
    lineHeight: 24,
    textAlignVertical: 'top',
    marginBottom: TempleSpacing.sm,
  },
  prayerSubmitBtn: {
    borderRadius: 14,
    backgroundColor: theme.red,
    alignItems: 'center',
    paddingVertical: 14,
  },
  prayerSubmitText: {
    color: theme.goldLight,
    fontWeight: '900',
    fontSize: TempleFonts.body,
    letterSpacing: 2,
  },
  actionToast: {
    borderRadius: 999,
    backgroundColor: theme.goldDark,
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
    borderColor: theme.goldDark + '55',
    backgroundColor: theme.bgCard,
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
    color: theme.gold,
    fontWeight: '900',
    fontSize: TempleFonts.body,
  },
  premiumBadge: {
    backgroundColor: theme.goldDark + '33',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: theme.gold + '55',
  },
  premiumBadgeText: { color: theme.gold, fontSize: 11, fontWeight: '700' },
  longLightDesc: {
    color: theme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 20,
    marginBottom: 12,
  },
  longLightBtn: {
    backgroundColor: theme.goldDark + '44',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.gold + '66',
  },
  longLightBtnActive: {
    backgroundColor: '#2d5a2d55',
    borderColor: '#4caf5066',
  },
  longLightBtnText: { color: theme.gold, fontWeight: '700', fontSize: TempleFonts.body },

  historyCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.goldDark + '24',
    backgroundColor: theme.bgCard,
    padding: TempleSpacing.md,
  },
  emptyText: {
    color: theme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 22,
  },
  recordRow: {
    flexDirection: 'row',
    gap: TempleSpacing.sm,
    paddingVertical: TempleSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.goldDark + '14',
  },
  recordMeta: { flex: 1 },
  recordTitle: {
    color: theme.goldLight,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    marginBottom: 4,
  },
  recordText: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  recordDate: {
    color: theme.textMuted,
    fontSize: 11,
    minWidth: 62,
    textAlign: 'right',
  },
  });
}
