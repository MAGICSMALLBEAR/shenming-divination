import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import {
  TEMPLES,
  calcDistanceKm,
  getAllCities,
  sortByDistance,
  type Temple,
} from '@/data/temples';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

const CHECKIN_KEY = '@temple_checkins';
const CHECKIN_RADIUS_KM = 0.3;  // 300m

interface CheckInRecord {
  templeId: string;
  templeName: string;
  timestamp: number;
}

const REVIEWS_KEY = '@temple_reviews';

interface TempleReview {
  id: string;
  templeId: string;
  author: string;
  rating: number;   // 1-5
  text: string;
  timestamp: number;
}

async function loadReviews(templeId: string): Promise<TempleReview[]> {
  try {
    const raw = await AsyncStorage.getItem(`${REVIEWS_KEY}:${templeId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveReview(review: TempleReview): Promise<TempleReview[]> {
  const existing = await loadReviews(review.templeId);
  const updated = [review, ...existing];
  await AsyncStorage.setItem(`${REVIEWS_KEY}:${review.templeId}`, JSON.stringify(updated));
  return updated;
}

async function loadCheckIns(): Promise<CheckInRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(CHECKIN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveCheckIn(record: CheckInRecord): Promise<CheckInRecord[]> {
  const existing = await loadCheckIns();
  const updated = [record, ...existing];
  await AsyncStorage.setItem(CHECKIN_KEY, JSON.stringify(updated));
  return updated;
}

export default function MapScreen() {
  const layout = useResponsiveLayout();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('全部');
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [reviews, setReviews] = useState<TempleReview[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewAuthor, setReviewAuthor] = useState('訪客');
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2500);
  }, []);

  useEffect(() => {
    loadCheckIns().then(setCheckIns);
  }, []);

  const getCheckInCount = (templeId: string) =>
    checkIns.filter(c => c.templeId === templeId).length;

  const lastCheckInDate = (templeId: string) => {
    const last = checkIns.find(c => c.templeId === templeId);
    if (!last) return null;
    return new Date(last.timestamp).toLocaleDateString('zh-TW');
  };

  useEffect(() => {
    if (!selectedTemple) { setReviews([]); return; }
    loadReviews(selectedTemple.id).then(setReviews);
  }, [selectedTemple?.id]);

  const handleAddReview = async () => {
    if (!selectedTemple || !reviewText.trim()) return;
    const review: TempleReview = {
      id: `rev_${Date.now()}`,
      templeId: selectedTemple.id,
      author: reviewAuthor.trim() || '訪客',
      rating: reviewRating,
      text: reviewText.trim(),
      timestamp: Date.now(),
    };
    const updated = await saveReview(review);
    setReviews(updated);
    setReviewText('');
    showToast('✅ 評論已發佈');
  };

  const handleCheckIn = async (temple: Temple) => {
    if (userLat === null || userLng === null) {
      Alert.alert('需要定位', '請先點擊「📍 定位」按鈕取得您的位置。');
      return;
    }
    const dist = calcDistanceKm(userLat, userLng, temple.lat, temple.lng);
    if (dist > CHECKIN_RADIUS_KM) {
      Alert.alert('距離太遠', `您距離 ${temple.name} 還有 ${(dist * 1000).toFixed(0)} 公尺，需在 300 公尺以內才能打卡。`);
      return;
    }
    setCheckingIn(temple.id);
    const record: CheckInRecord = { templeId: temple.id, templeName: temple.name, timestamp: Date.now() };
    const updated = await saveCheckIn(record);
    setCheckIns(updated);
    setCheckingIn(null);
    Alert.alert('打卡成功 🙏', `已成功在 ${temple.name} 打卡！\n累計打卡 ${updated.filter(c => c.templeId === temple.id).length} 次。`);
  };

  const cities = ['全部', ...getAllCities()];

  const filteredTemples = useCallback(() => {
    let list = TEMPLES;
    if (selectedCity !== '全部') {
      list = list.filter(t => t.city === selectedCity);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        t =>
          t.name.includes(q) ||
          t.mainGod.includes(q) ||
          t.tags.some(tag => tag.includes(q)) ||
          t.specialty.includes(q)
      );
    }
    if (userLat !== null && userLng !== null) {
      list = sortByDistance(list, userLat, userLng);
    }
    return list;
  }, [search, selectedCity, userLat, userLng]);

  const handleLocate = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocating(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLat(pos.coords.latitude);
      setUserLng(pos.coords.longitude);
    } catch {
      // 定位失敗時靜默處理
    }
    setLocating(false);
  };

  const handleOpenMap = (temple: Temple) => {
    const url = Platform.select({
      ios: `maps://?q=${encodeURIComponent(temple.name)}&ll=${temple.lat},${temple.lng}`,
      android: `geo:${temple.lat},${temple.lng}?q=${encodeURIComponent(temple.name)}`,
      default: `https://www.openstreetmap.org/?mlat=${temple.lat}&mlon=${temple.lng}&zoom=17`,
    });
    if (url) Linking.openURL(url);
  };

  const temples = filteredTemples();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { maxWidth: layout.contentMaxWidth, paddingHorizontal: layout.gutter },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>廟宇地圖</Text>
        <Text style={styles.subtitle}>台灣 {TEMPLES.length} 座主要廟宇</Text>

        {/* 搜尋列 */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜尋廟名、神明、祈求..."
            placeholderTextColor={TempleTheme.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.locateBtn} onPress={handleLocate} disabled={locating}>
            {locating
              ? <ActivityIndicator color={TempleTheme.gold} size="small" />
              : <Text style={styles.locateBtnText}>📍 定位</Text>
            }
          </TouchableOpacity>
        </View>

        {userLat !== null && (
          <Text style={styles.locatedText}>✓ 已定位，顯示最近廟宇</Text>
        )}

        {/* 城市篩選 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cityScroll}
          contentContainerStyle={styles.cityScrollContent}
        >
          {cities.map(city => (
            <TouchableOpacity
              key={city}
              style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}
              onPress={() => setSelectedCity(city)}
            >
              <Text style={[styles.cityChipText, selectedCity === city && styles.cityChipTextActive]}>
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.resultCount}>共 {temples.length} 座廟宇</Text>

        {/* 廟宇列表 */}
        {temples.map(temple => (
          <TouchableOpacity
            key={temple.id}
            style={[styles.card, selectedTemple?.id === temple.id && styles.cardSelected]}
            onPress={() => setSelectedTemple(prev => prev?.id === temple.id ? null : temple)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.templeName}>{temple.name}</Text>
                <Text style={styles.templeCity}>{temple.city}</Text>
                {getCheckInCount(temple.id) > 0 && (
                  <View style={styles.checkInBadge}>
                    <Text style={styles.checkInBadgeText}>打卡 {getCheckInCount(temple.id)}</Text>
                  </View>
                )}
              </View>
              {userLat !== null && userLng !== null && (
                <Text style={[
                  styles.distanceText,
                  calcDistanceKm(userLat, userLng, temple.lat, temple.lng) <= CHECKIN_RADIUS_KM && styles.distanceNear,
                ]}>
                  {calcDistanceKm(userLat, userLng, temple.lat, temple.lng).toFixed(1)} km
                  {calcDistanceKm(userLat, userLng, temple.lat, temple.lng) <= CHECKIN_RADIUS_KM ? ' ✓ 可打卡' : ''}
                </Text>
              )}
            </View>

            <Text style={styles.mainGod}>主祀：{temple.mainGod}</Text>
            <Text style={styles.specialty}>靈驗：{temple.specialty}</Text>

            <View style={styles.tagRow}>
              {temple.tags.slice(0, 4).map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* 展開詳情 */}
            {selectedTemple?.id === temple.id && (
              <View style={styles.detailPanel}>
                <View style={styles.divider} />
                <Text style={styles.detailAddress}>📍 {temple.address}</Text>
                <Text style={styles.detailTime}>🕐 {temple.openHours}</Text>
                {temple.founded && (
                  <Text style={styles.detailFounded}>🏛 建廟：{temple.founded}</Text>
                )}
                <Text style={styles.detailDesc}>{temple.description}</Text>
                <View style={styles.detailBtnRow}>
                  <TouchableOpacity
                    style={styles.mapBtn}
                    onPress={() => handleOpenMap(temple)}
                  >
                    <Text style={styles.mapBtnText}>🗺 導航</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.checkInBtn, checkingIn === temple.id && { opacity: 0.6 }]}
                    onPress={() => handleCheckIn(temple)}
                    disabled={checkingIn === temple.id}
                  >
                    <Text style={styles.checkInBtnText}>
                      {checkingIn === temple.id ? '打卡中…' : '📍 廟宇打卡'}
                    </Text>
                    {lastCheckInDate(temple.id) ? (
                      <Text style={styles.checkInLastDate}>上次：{lastCheckInDate(temple.id)}</Text>
                    ) : null}
                  </TouchableOpacity>
                </View>
              {/* 評論區 */}
              <View style={styles.reviewSection}>
                <Text style={styles.reviewTitle}>廟宇評論</Text>
                {reviews.map(r => (
                  <View key={r.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{r.author}</Text>
                      <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
                      <Text style={styles.reviewDate}>{new Date(r.timestamp).toLocaleDateString('zh-TW')}</Text>
                    </View>
                    <Text style={styles.reviewText}>{r.text}</Text>
                  </View>
                ))}
                {reviews.length === 0 && <Text style={styles.noReviews}>還沒有評論，來第一個留言吧！</Text>}
                <View style={styles.reviewForm}>
                  <View style={styles.reviewRatingRow}>
                    <Text style={styles.reviewLabel}>評分：</Text>
                    {[1,2,3,4,5].map(n => (
                      <TouchableOpacity key={n} onPress={() => setReviewRating(n)}>
                        <Text style={[styles.reviewStar, n <= reviewRating && styles.reviewStarActive]}>★</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput style={styles.reviewInput} value={reviewAuthor} onChangeText={setReviewAuthor} placeholder="您的名字" placeholderTextColor={TempleTheme.textMuted} />
                  <TextInput style={[styles.reviewInput, { minHeight: 56 }] as any} value={reviewText} onChangeText={setReviewText} placeholder="留下您對這座廟宇的感想…" placeholderTextColor={TempleTheme.textMuted} multiline maxLength={200} />
                  <TouchableOpacity style={styles.reviewSubmitBtn} onPress={handleAddReview} disabled={!reviewText.trim()}>
                    <Text style={styles.reviewSubmitText}>發佈評論</Text>
                  </TouchableOpacity>
                </View>
              </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {temples.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>沒有符合條件的廟宇</Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  container: { flex: 1 },
  content: { width: '100%', alignSelf: 'center', paddingVertical: TempleSpacing.md },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: TempleTheme.textMuted,
    textAlign: 'center',
    fontSize: TempleFonts.small,
    marginBottom: TempleSpacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: TempleTheme.textLight,
    fontSize: TempleFonts.body,
  },
  locateBtn: {
    backgroundColor: TempleTheme.goldDark + '33',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '60',
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    minWidth: 80,
    alignItems: 'center',
  },
  locateBtnText: {
    color: TempleTheme.gold,
    fontWeight: '700',
    fontSize: 13,
  },
  locatedText: {
    color: '#4caf50',
    fontSize: TempleFonts.small,
    marginBottom: 8,
    textAlign: 'center',
  },
  cityScroll: { marginBottom: 10 },
  cityScrollContent: { gap: 8, paddingRight: 8 },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
    backgroundColor: 'transparent',
  },
  cityChipActive: {
    backgroundColor: TempleTheme.goldDark + '55',
    borderColor: TempleTheme.gold,
  },
  cityChipText: {
    color: TempleTheme.textMuted,
    fontSize: 13,
  },
  cityChipTextActive: {
    color: TempleTheme.gold,
    fontWeight: '700',
  },
  resultCount: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    marginBottom: 10,
  },
  card: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '24',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
  },
  cardSelected: {
    borderColor: TempleTheme.gold + '80',
    backgroundColor: TempleTheme.bgCard,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitleRow: { flex: 1 },
  templeName: {
    color: TempleTheme.goldLight,
    fontWeight: '800',
    fontSize: TempleFonts.body,
  },
  templeCity: {
    color: TempleTheme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  distanceText: {
    color: TempleTheme.gold,
    fontWeight: '700',
    fontSize: 13,
  },
  mainGod: {
    color: TempleTheme.textLight,
    fontSize: TempleFonts.small,
    marginBottom: 4,
  },
  specialty: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    marginBottom: 8,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: TempleTheme.goldDark + '22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '44',
  },
  tagText: {
    color: TempleTheme.gold,
    fontSize: 11,
    fontWeight: '600',
  },
  detailPanel: { marginTop: 12 },
  divider: {
    height: 1,
    backgroundColor: TempleTheme.goldDark + '30',
    marginBottom: 12,
  },
  detailAddress: {
    color: TempleTheme.textLight,
    fontSize: TempleFonts.small,
    marginBottom: 6,
  },
  detailTime: {
    color: TempleTheme.textLight,
    fontSize: TempleFonts.small,
    marginBottom: 6,
  },
  detailFounded: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    marginBottom: 6,
  },
  detailDesc: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 20,
    marginBottom: 12,
  },
  detailBtnRow: { flexDirection: 'row', gap: 8, marginTop: TempleSpacing.sm },
  mapBtn: {
    flex: 1,
    backgroundColor: TempleTheme.goldDark + '44',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TempleTheme.gold + '60',
  },
  mapBtnText: {
    color: TempleTheme.gold,
    fontWeight: '700',
    fontSize: TempleFonts.body,
  },
  checkInBtn: {
    flex: 1,
    backgroundColor: TempleTheme.red + '33',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TempleTheme.redLight + '80',
  },
  checkInBtnText: { color: TempleTheme.redLight, fontWeight: '700', fontSize: TempleFonts.body },
  checkInLastDate: { color: TempleTheme.textMuted, fontSize: 11, marginTop: 2 },
  checkInBadge: {
    backgroundColor: TempleTheme.red,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 7,
    marginLeft: 6,
  },
  checkInBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  distanceNear: { color: TempleTheme.success },
  // 評論
  reviewSection: { marginTop: TempleSpacing.md, borderTopWidth: 1, borderTopColor: TempleTheme.goldDark + '30', paddingTop: TempleSpacing.sm },
  reviewTitle: { color: TempleTheme.textGold, fontWeight: 'bold', fontSize: TempleFonts.small, marginBottom: TempleSpacing.sm },
  reviewItem: { marginBottom: TempleSpacing.sm, padding: TempleSpacing.sm, backgroundColor: TempleTheme.bgMedium, borderRadius: 8 },
  reviewHeader: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 },
  reviewAuthor: { color: TempleTheme.textLight, fontWeight: 'bold', fontSize: 12, flex: 1 },
  reviewStars: { color: TempleTheme.goldLight, fontSize: 12 },
  reviewDate: { color: TempleTheme.textMuted, fontSize: 11 },
  reviewText: { color: TempleTheme.textMuted, fontSize: 12, lineHeight: 16 },
  noReviews: { color: TempleTheme.textMuted, fontSize: 12, fontStyle: 'italic', marginBottom: TempleSpacing.sm },
  reviewForm: { gap: 8 },
  reviewRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewLabel: { color: TempleTheme.textMuted, fontSize: 12 },
  reviewStar: { fontSize: 22, color: TempleTheme.bgMedium },
  reviewStarActive: { color: TempleTheme.goldLight },
  reviewInput: { backgroundColor: TempleTheme.bgDark, borderRadius: 8, borderWidth: 1, borderColor: TempleTheme.gold + '40', padding: 8, color: TempleTheme.textLight, fontSize: 12 },
  reviewSubmitBtn: { backgroundColor: TempleTheme.gold + '33', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: TempleTheme.gold + '60' },
  reviewSubmitText: { color: TempleTheme.gold, fontWeight: 'bold', fontSize: 12 },
  emptyCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 14,
    padding: TempleSpacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.body,
  },
  toast: {
    position: 'absolute', bottom: 100, alignSelf: 'center',
    backgroundColor: TempleTheme.goldDark, paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 20, elevation: 6,
  },
  toastText: { color: '#FFF', fontSize: TempleFonts.small, fontWeight: '600' },
});
