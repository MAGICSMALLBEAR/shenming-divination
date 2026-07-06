// 更多工具 — 次要功能入口網格
import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DecorativeBg } from '@/components/DecorativeBg';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';

interface ToolEntry {
  route: string;
  label: string;
  icon: string;
  desc: string;
}

const TOOLS: ToolEntry[] = [
  { route: '/library', label: '籤詩圖書館', icon: '📖', desc: '瀏覽・搜尋全部籤詩' },
  { route: '/oracle', label: '多元占卜', icon: '☯', desc: '易卦・塔羅・靈擺' },
  { route: '/bazi', label: '八字命盤', icon: '📜', desc: '四柱・五行・大運' },
  { route: '/ziwei', label: '紫微斗數', icon: '⭐', desc: '命宮・財帛・夫妻' },
  { route: '/fate', label: '合婚擇日', icon: '💞', desc: '八字配對・吉日查詢' },
  { route: '/consult', label: '真人諮詢', icon: '👩‍🏫', desc: '命理師一對一預約' },
  { route: '/community', label: '社群交流', icon: '💬', desc: '籤詩討論・經驗分享' },
  { route: '/stats', label: '統計分析', icon: '📊', desc: '求籤記錄・趨勢圖表' },
  { route: '/wishes', label: '願望清單', icon: '🙏', desc: '許願・還願進度' },
  { route: '/map', label: '廟宇地圖', icon: '🗺️', desc: 'GPS 定位・打卡評論' },
];

export default function MoreScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const { theme } = useAppTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  const columns = layout.isDesktop ? 3 : 2;

  return (
    <SafeAreaView style={s.safe}>
      <DecorativeBg pattern="diamond" />
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>更多工具</Text>
        <Text style={s.subtitle}>探索所有占卜與命理功能</Text>
        <View style={[s.grid, { maxWidth: 600 }]}>
          {TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.route}
              style={[s.card, { width: `${100 / columns}%` as any }]}
              onPress={() => router.push(tool.route as any)}
              activeOpacity={0.7}
            >
              <Text style={s.cardIcon}>{tool.icon}</Text>
              <Text style={s.cardLabel}>{tool.label}</Text>
              <Text style={s.cardDesc}>{tool.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgDark },
  scroll: { padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl, alignItems: 'center' },
  title: { fontSize: TempleFonts.subtitle, fontWeight: 'bold', color: theme.textGold, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: TempleFonts.small, color: theme.textMuted, textAlign: 'center', marginBottom: TempleSpacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', width: '100%' },
  card: {
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.gold + '30',
    padding: TempleSpacing.md,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  cardIcon: { fontSize: 36, marginBottom: 8 },
  cardLabel: { color: theme.textLight, fontWeight: 'bold', fontSize: TempleFonts.body, marginBottom: 4 },
  cardDesc: { color: theme.textMuted, fontSize: TempleFonts.small, textAlign: 'center' },
  });
}
