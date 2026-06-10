import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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

import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import {
  TEMPLES,
  calcDistanceKm,
  getAllCities,
  sortByDistance,
  type Temple,
} from '@/data/temples';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

export default function MapScreen() {
  const layout = useResponsiveLayout();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('全部');
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);

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
              </View>
              {userLat !== null && userLng !== null && (
                <Text style={styles.distanceText}>
                  {calcDistanceKm(userLat, userLng, temple.lat, temple.lng).toFixed(1)} km
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
                <TouchableOpacity
                  style={styles.mapBtn}
                  onPress={() => handleOpenMap(temple)}
                >
                  <Text style={styles.mapBtnText}>🗺 開啟地圖導航</Text>
                </TouchableOpacity>
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
    borderRadius: 14,
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
  mapBtn: {
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
});
