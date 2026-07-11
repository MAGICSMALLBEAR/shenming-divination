import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';

const LAST_UPDATED = '2026-07-11';

const notices = [
  {
    title: 'AI 解籤與命理內容',
    body: 'AI 解籤、籤詩白話、八字、紫微、塔羅與易卦內容，主要用於傳統文化體驗、情緒整理與行動提醒。內容可能有誤，也可能不符合你的實際情境。',
  },
  {
    title: '醫療與身心健康',
    body: '若問題涉及疾病、疼痛、藥物、手術、懷孕、心理危機或自傷風險，請優先尋求合格醫師、心理師或當地緊急資源協助。本 App 不能診斷、治療或取代醫療專業。',
  },
  {
    title: '法律、合約與權利義務',
    body: '若問題涉及訴訟、合約、離婚、債務、刑事或任何權利義務判斷，請諮詢合格律師或相關專業。本 App 內容不構成法律意見。',
  },
  {
    title: '投資、借貸與重大財務',
    body: '若問題涉及投資、借貸、保險、買賣房產、股票、加密資產或高風險財務決策，請自行查證並諮詢合格財務專業。本 App 不提供投資建議，也不保證任何收益。',
  },
  {
    title: '宗教與文化尊重',
    body: '神明、籤詩與廟宇文化在不同地區可能有不同傳承。本 App 以尊重民間信仰與文化整理為目標，但不代表任何特定宮廟或宗教團體的正式立場。',
  },
  {
    title: '使用者自主判斷',
    body: '任何重要決定都應回到現實資訊、專業建議、個人責任與身邊可信任的人際支持。請勿只依賴單次籤詩或 AI 文字做不可逆決策。',
  },
];

export default function DisclaimerScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>免責聲明</Text>
        <Text style={styles.updated}>最後更新：{LAST_UPDATED}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.leadCard}>
          <Text style={styles.leadTitle}>先安定，再判斷</Text>
          <Text style={styles.leadText}>
            本 App 可以陪你整理問題、看見提醒與規劃下一步，但不能取代專業人士、現實證據與你的自主判斷。
          </Text>
        </View>

        {notices.map((notice, index) => (
          <View key={notice.title} style={styles.section}>
            <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
            <View style={styles.sectionBody}>
              <Text style={styles.sectionTitle}>{notice.title}</Text>
              <Text style={styles.paragraph}>{notice.body}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.policyLink} onPress={() => router.push('/privacy' as never)}>
          <Text style={styles.policyLinkText}>查看隱私權政策與服務條款</Text>
        </TouchableOpacity>

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
    updated: { color: theme.textMuted, fontSize: 12, marginTop: 4 },
    content: { padding: TempleSpacing.lg, paddingBottom: 60 },
    leadCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.warning + '45',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.lg,
    },
    leadTitle: { color: theme.goldLight, fontSize: TempleFonts.heading, fontWeight: '900', marginBottom: 8 },
    leadText: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 25 },
    section: {
      flexDirection: 'row',
      gap: TempleSpacing.md,
      paddingVertical: TempleSpacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.goldDark + '18',
    },
    index: { color: theme.gold, fontSize: TempleFonts.small, fontWeight: '900', width: 30 },
    sectionBody: { flex: 1 },
    sectionTitle: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '800', marginBottom: 6 },
    paragraph: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 22 },
    policyLink: {
      marginTop: TempleSpacing.lg,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.goldDark + '45',
      padding: TempleSpacing.md,
      alignItems: 'center',
      backgroundColor: theme.bgCard,
    },
    policyLinkText: { color: theme.goldLight, fontSize: TempleFonts.small, fontWeight: '800' },
  });
}