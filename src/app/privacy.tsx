// 隱私權政策與服務條款
import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';

const LAST_UPDATED = '2026-07-05';

function Section({ title, children, styles }: { title: string; children: React.ReactNode; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Paragraph({ children, styles }: { children: React.ReactNode; styles: ReturnType<typeof createStyles> }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

export default function PrivacyScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>隱私權政策與服務條款</Text>
        <Text style={styles.updated}>最後更新：{LAST_UPDATED}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageHeading}>隱私權政策</Text>

        <Section title="1. 我們蒐集哪些資料" styles={styles}>
          <Paragraph styles={styles}>
            神明占卜（以下稱「本 App」）主要將你的求籤紀錄、收藏、願望清單、個人化設定（例如暱稱、出生年份、常用神明）與家人成員資料，儲存在你裝置本機的儲存空間中，不會自動上傳到任何伺服器。
          </Paragraph>
          <Paragraph styles={styles}>
            若你使用「拍照解籤」功能，拍攝或選取的照片會傳送至 AI 影像辨識服務以辨識籤號，辨識完成後不會由本 App 保留該照片。
          </Paragraph>
          <Paragraph styles={styles}>
            若你輸入問題並使用 AI 解籤／AI 追問功能，你的問題內容與籤詩資訊會傳送至第三方 AI 服務供應商（例如 OpenAI、DeepSeek 或你自行設定的相容服務）以產生解籤內容，傳送內容不包含你的真實姓名、聯絡方式等可識別身分資訊，除非你自行將這些資訊寫進問題文字中。
          </Paragraph>
          <Paragraph styles={styles}>
            若你使用「廟宇地圖」的定位功能，本 App 會請求你裝置的 GPS 位置權限，僅用於計算你與廟宇的距離、判斷是否可以打卡，位置資訊不會離開你的裝置或被本 App 儲存。
          </Paragraph>
          <Paragraph styles={styles}>
            若你的裝置已設定並啟用雲端同步（Firebase），部分資料（求籤紀錄、八字資訊、設定）可能會同步到你個人的雲端帳號中，帳號登入方式為匿名登入或 Google 登入；社群交流頁面的貼文內容在啟用雲端同步後，會公開顯示給其他使用者。
          </Paragraph>
        </Section>

        <Section title="2. 資料如何使用" styles={styles}>
          <Paragraph styles={styles}>
            我們使用上述資料的目的僅限於：提供籤詩解讀與個人化建議、計算八字與每日運勢、記錄求籤歷史與應驗追蹤、提供廟宇地圖與打卡功能、以及改善 App 的使用體驗。我們不會將你的個人資料出售或提供給第三方作行銷用途。
          </Paragraph>
        </Section>

        <Section title="3. 第三方服務" styles={styles}>
          <Paragraph styles={styles}>
            本 App 使用的第三方服務可能包括：AI 語言模型供應商（用於籤詩解讀與對話）、Firebase（帳號登入與雲端同步，僅在你的裝置設定中啟用時生效）、地圖服務（顯示廟宇位置）。這些服務各自有其獨立的隱私權政策，建議你也一併參閱。
          </Paragraph>
        </Section>

        <Section title="4. 資料保留與刪除" styles={styles}>
          <Paragraph styles={styles}>
            本機儲存的資料會保留在你的裝置上，直到你在「設定」頁清除歷史紀錄、解除安裝 App，或手動清除瀏覽器/應用程式資料為止。若你已啟用雲端同步，可聯繫我們協助刪除雲端帳號中的資料。
          </Paragraph>
        </Section>

        <Section title="5. 兒童隱私" styles={styles}>
          <Paragraph styles={styles}>
            本 App 內容以命理、宗教文化為主，不特別針對兒童設計，也不會刻意向兒童蒐集個人資料。若你發現本 App 意外蒐集了兒童的個人資料，請與我們聯繫以協助刪除。
          </Paragraph>
        </Section>

        <Section title="6. 政策修改" styles={styles}>
          <Paragraph styles={styles}>
            我們可能不時修訂本政策，修訂後將更新頁面上方的「最後更新」日期。建議你不定期回來查閱本頁面。
          </Paragraph>
        </Section>

        <Text style={styles.pageHeading}>服務條款</Text>

        <Section title="1. 服務性質聲明" styles={styles}>
          <Paragraph styles={styles}>
            本 App 提供的籤詩解讀、AI 解籤、八字命理、紫微斗數、塔羅、易卦等內容，僅供傳統文化參考與娛樂用途，不構成醫療、法律、財務或其他專業建議。任何人生重大決策，請諮詢相關領域的專業人士。
          </Paragraph>
        </Section>

        <Section title="2. 使用者責任" styles={styles}>
          <Paragraph styles={styles}>
            使用本 App 時，請勿上傳違法、侵權、騷擾性或不當內容（尤其是「社群交流」功能）。若你的行為違反本條款，我們保留限制或終止你使用特定功能的權利。
          </Paragraph>
        </Section>

        <Section title="3. 付費訂閱" styles={styles}>
          <Paragraph styles={styles}>
            本 App 目前的付費會員方案僅為功能展示，尚未串接實際金流，不會產生真實扣款。未來如開通真實付費訂閱，將於訂閱頁面清楚列出價格、扣款週期與取消方式，訂閱將自動續費，可隨時在設定中取消。
          </Paragraph>
        </Section>

        <Section title="4. 智慧財產權" styles={styles}>
          <Paragraph styles={styles}>
            本 App 內的籤詩文本、神明插畫、介面設計等內容，除另有標示外，其著作權歸本 App 開發者或授權來源所有，未經同意不得重製或用於商業用途。
          </Paragraph>
        </Section>

        <Section title="5. 免責聲明" styles={styles}>
          <Paragraph styles={styles}>
            本 App 依「現況」提供服務，不保證解籤內容、命理分析或其他預測性內容的準確性。我們不對因使用本 App 內容而做出的任何決定或其後果負責。
          </Paragraph>
        </Section>

        <Section title="6. 條款修改" styles={styles}>
          <Paragraph styles={styles}>
            我們可能不時修訂本條款，修訂後將更新頁面上方的「最後更新」日期，持續使用本 App 即表示你同意最新版本的條款內容。
          </Paragraph>
        </Section>

        <Section title="7. 聯絡我們" styles={styles}>
          <Paragraph styles={styles}>
            若你對本政策或條款有任何疑問，或想申請刪除雲端資料，請透過〔請填入聯絡信箱〕與我們聯繫。
          </Paragraph>
        </Section>

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
    pageHeading: {
      color: theme.gold,
      fontSize: TempleFonts.subtitle,
      fontWeight: '900',
      marginTop: TempleSpacing.lg,
      marginBottom: TempleSpacing.md,
    },
    section: { marginBottom: TempleSpacing.lg },
    sectionTitle: {
      color: theme.goldLight,
      fontSize: TempleFonts.body,
      fontWeight: '800',
      marginBottom: TempleSpacing.sm,
    },
    paragraph: {
      color: theme.textMuted,
      fontSize: TempleFonts.small,
      lineHeight: 22,
      marginBottom: TempleSpacing.sm,
    },
  });
}
