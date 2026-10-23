// 池府千歲文化藥籤典藏 — 僅目錄與原始條目連結，不提供藥方或醫療建議
import React, { useMemo } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import {
  CHIFU_MEDICINE_ARCHIVE_DISCLAIMER,
  CHIFU_MEDICINE_ARCHIVE_PUBLISHER,
  CHIFU_MEDICINE_ARCHIVE_REVIEWED_AT,
  chifuMedicineLotArchive,
} from '@/data/chifuMedicineLotArchive';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';

export default function ChifuMedicineArchiveScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>池府千歲文化藥籤典藏</Text>
        <Text style={styles.subtitle}>虎尾德興宮藥籤的文物目錄，只提供籤號與原始典藏連結。</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warningCard} accessibilityRole="alert">
          <Text style={styles.warningTitle}>⚠️ 非醫療建議</Text>
          <Text style={styles.warningText}>{CHIFU_MEDICINE_ARCHIVE_DISCLAIMER}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>文物背景</Text>
          <Text style={styles.bodyText}>
            雲林虎尾德興宮相傳於清雍正 11 年（1733 年）由先民奉池府千歲神像來臺建廟，舊稱「大崙腳王爺廟」。池府千歲在民間被視為醫藥神，廟方至今仍保有不分科的藥籤。
          </Text>
          <Text style={styles.bodyText}>
            這批藥籤是民間醫療文化的歷史紀錄，反映過去缺醫年代的信仰與求助方式。藥籤上的部分藥材在現代已知具有毒性或已禁止使用，不能當作處方。
          </Text>
          <Text style={styles.metaText}>背景說明改寫自國家文化記憶庫條目（政府資料開放授權條款第 1 版）。</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>來源與權利</Text>
          <Text style={styles.metaText}>建檔單位：{CHIFU_MEDICINE_ARCHIVE_PUBLISHER}</Text>
          <Text style={styles.metaText}>典藏平台：國家文化記憶庫</Text>
          <Text style={styles.metaText}>數位影像：公眾領域標章（PDM）</Text>
          <Text style={styles.metaText}>說明文字：政府資料開放授權條款第 1 版（OGDL 1.0）</Text>
          <Text style={styles.metaText}>收錄範圍：第 1–{chifuMedicineLotArchive.length} 首，連號無缺（{CHIFU_MEDICINE_ARCHIVE_REVIEWED_AT} 查核）</Text>
        </View>

        <Text style={styles.listNote}>
          點選會開啟國家文化記憶庫的原始條目。條目內含歷史方文，僅供文化研究參考，切勿照方配藥或服用。
        </Text>

        {chifuMedicineLotArchive.map((lot) => (
          <TouchableOpacity
            key={lot.lotNumber}
            style={styles.row}
            onPress={() => Linking.openURL(lot.sourceUrl)}
            accessibilityRole="link"
            accessibilityLabel={`${lot.title}，開啟國家文化記憶庫原始條目`}
          >
            <Text style={styles.rowNumber}>{lot.lotNumber}</Text>
            <Text style={styles.rowTitle}>{lot.title}</Text>
            <Text style={styles.rowLink}>↗</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.bgDark },
    header: {
      paddingHorizontal: TempleSpacing.lg,
      paddingTop: TempleSpacing.md,
      paddingBottom: TempleSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.goldDark + '28',
    },
    backBtn: { marginBottom: TempleSpacing.sm, alignSelf: 'flex-start' },
    backBtnText: { color: theme.gold, fontSize: TempleFonts.small, fontWeight: '600' },
    title: { color: theme.goldLight, fontSize: TempleFonts.heading, fontWeight: '900' },
    subtitle: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 20, marginTop: 4 },
    content: { padding: TempleSpacing.lg, paddingBottom: 60 },
    warningCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.danger + '80',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    warningTitle: { color: theme.danger, fontSize: TempleFonts.body, fontWeight: '900', marginBottom: 6 },
    warningText: { color: theme.textLight, fontSize: TempleFonts.small, lineHeight: 22 },
    card: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '25',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    cardTitle: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '900', marginBottom: 8 },
    bodyText: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 22, marginBottom: 8 },
    metaText: { color: theme.textMuted, fontSize: 12, lineHeight: 19 },
    listNote: { color: theme.warning, fontSize: 12, lineHeight: 19, marginBottom: TempleSpacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: TempleSpacing.sm,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.goldDark + '20',
    },
    rowNumber: { color: theme.gold, fontSize: 12, fontWeight: '800', width: 32, textAlign: 'right' },
    rowTitle: { flex: 1, color: theme.textLight, fontSize: TempleFonts.small },
    rowLink: { color: theme.gold, fontSize: TempleFonts.small },
  });
}
