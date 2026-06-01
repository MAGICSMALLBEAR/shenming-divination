// 設定頁面
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, TextInput, Alert, ScrollView } from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { getSettings, saveSettings, type AppSettings } from '@/services/storage';
import { getDailyPoem } from '@/services/dailyPoem';
import { scheduleDailyNotification, scheduleGodBirthdayNotifications, requestPermissions } from '@/services/notifications';
import { getTodayLunarInfo } from '@/data/lunarCalendar';
import { calcBazi, parseBirthYear, ZODIAC_PATRON_GOD } from '@/services/bazi';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({ userName: '', birthDate: '', preferredGodId: 1 });
  const [saved, setSaved] = useState(false);
  const dailyPoem = getDailyPoem();
  const lunarInfo = getTodayLunarInfo();

  const bazi = useMemo(() => {
    const year = parseBirthYear(settings.birthDate);
    return year ? calcBazi(year) : null;
  }, [settings.birthDate]);

  useEffect(() => {
    getSettings().then(s => {
      if (s) setSettings(s);
    });
  }, []);

  const handleSave = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>設定</Text>

        {/* 每日籤預覽 */}
        <View style={styles.dailyCard}>
          <Text style={styles.dailyLabel}>今日籤詩 · {dailyPoem.date} {dailyPoem.dayOfWeek}</Text>
          <Text style={styles.dailyContent} numberOfLines={2}>
            第 {dailyPoem.poem.number} 籤 · {dailyPoem.poem.level} · {dailyPoem.poem.content.split('\n')[0]}
          </Text>
        </View>

        {/* 個人資訊 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>個人資訊</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>稱呼</Text>
            <TextInput
              style={styles.input}
              value={settings.userName}
              onChangeText={(text) => setSettings(prev => ({ ...prev, userName: text }))}
              placeholder="輸入姓名或稱呼"
              placeholderTextColor={TempleTheme.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>出生年份（西元或民國）</Text>
            <TextInput
              style={styles.input}
              value={settings.birthDate}
              onChangeText={(text) => setSettings(prev => ({ ...prev, birthDate: text }))}
              placeholder="例如：1996 或 民國85年"
              placeholderTextColor={TempleTheme.textMuted}
              keyboardType="default"
            />
          </View>

          {/* 生辰八字卡 */}
          {bazi && (
            <View style={[styles.baziCard, bazi.isCurrentYear && styles.baziCardWarning]}>
              <View style={styles.baziRow}>
                <Text style={styles.baziEmoji}>{bazi.zodiacEmoji}</Text>
                <View style={styles.baziInfo}>
                  <Text style={styles.baziMain}>
                    {bazi.ganZhi}年 · 生肖{bazi.zodiac}
                    {bazi.isCurrentYear ? '  ⚠️ 本命年' : ''}
                  </Text>
                  <View style={styles.baziTags}>
                    <View style={[styles.wuxingTag, { backgroundColor: bazi.wuxingColor + '25', borderColor: bazi.wuxingColor }]}>
                      <Text style={[styles.wuxingText, { color: bazi.wuxingColor }]}>{bazi.wuxing}命</Text>
                    </View>
                    <Text style={styles.baziSub}>合：{bazi.compatible.join('、')} · 沖：{bazi.clash}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.baziPatron}>
                守護神明：{[
                  { id: 1, name: '關聖帝君' }, { id: 2, name: '觀世音菩薩' },
                  { id: 3, name: '媽祖' }, { id: 4, name: '王爺' },
                  { id: 5, name: '保生大帝' }, { id: 6, name: '福德正神' },
                  { id: 8, name: '文昌帝君' },
                ].find(g => g.id === bazi.patronGodId)?.name ?? '觀世音菩薩'}
              </Text>
              {bazi.isCurrentYear && (
                <Text style={styles.baziWarning}>
                  今年為本命年，建議多祭拜守護神明、佩戴護身符，諸事宜謹慎。
                </Text>
              )}
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>常用神明</Text>
            <View style={styles.godSelector}>
              {[
                { id: 1, name: '關聖帝君' },
                { id: 2, name: '觀音菩薩' },
                { id: 3, name: '媽祖' },
                { id: 4, name: '王爺' },
                { id: 5, name: '保生大帝' },
                { id: 6, name: '福德正神' },
                { id: 7, name: '註生娘娘' },
                { id: 8, name: '文昌帝君' },
                { id: 9, name: '孔明神數' },
              ].map(god => {
                const isPatron = bazi?.patronGodId === god.id;
                return (
                <TouchableOpacity
                  key={god.id}
                  style={[styles.godChip, settings.preferredGodId === god.id && styles.godChipActive, isPatron && styles.godChipPatron]}
                  onPress={() => setSettings(prev => ({ ...prev, preferredGodId: god.id }))}
                >
                  <Text style={[styles.godChipText, settings.preferredGodId === god.id && styles.godChipTextActive]}>
                    {isPatron ? '🌟 ' : ''}{god.name}
                  </Text>
                </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 擲筊模式 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>擲筊模式</Text>
          <TouchableOpacity
            style={[styles.toggleRow, settings.strictMode && styles.toggleRowActive]}
            onPress={() => setSettings(prev => ({ ...prev, strictMode: !prev.strictMode }))}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>三聖筊嚴格模式</Text>
              <Text style={styles.toggleDesc}>需連續三次聖筊方可抽籤（傳統習俗）</Text>
            </View>
            <View style={[styles.toggleSwitch, settings.strictMode && styles.toggleSwitchOn]}>
              <View style={[styles.toggleKnob, settings.strictMode && styles.toggleKnobOn]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 通知 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知設定</Text>

          {/* 每日籤詩 */}
          <TouchableOpacity
            style={[styles.toggleRow, settings.dailyNotification && styles.toggleRowActive]}
            onPress={async () => {
              const newVal = !settings.dailyNotification;
              setSettings(prev => ({ ...prev, dailyNotification: newVal }));
              if (newVal) {
                await requestPermissions();
                await scheduleDailyNotification();
              }
            }}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>每日籤詩推播</Text>
              <Text style={styles.toggleDesc}>每天早上 7:30 推播今日籤詩</Text>
            </View>
            <View style={[styles.toggleSwitch, settings.dailyNotification && styles.toggleSwitchOn]}>
              <View style={[styles.toggleKnob, settings.dailyNotification && styles.toggleKnobOn]} />
            </View>
          </TouchableOpacity>

          {/* 神明聖誕提醒 */}
          <TouchableOpacity
            style={[styles.toggleRow, settings.birthdayNotification && styles.toggleRowActive]}
            onPress={async () => {
              const newVal = !settings.birthdayNotification;
              setSettings(prev => ({ ...prev, birthdayNotification: newVal }));
              if (newVal) {
                const ok = await requestPermissions();
                if (ok) await scheduleGodBirthdayNotifications();
                Alert.alert('神明聖誕提醒', '已排程未來 60 天內的神明聖誕前晚提醒。');
              }
            }}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>神明聖誕提醒 🙏</Text>
              <Text style={styles.toggleDesc}>聖誕前一晚 20:00 提醒上香祈福</Text>
            </View>
            <View style={[styles.toggleSwitch, settings.birthdayNotification && styles.toggleSwitchOn]}>
              <View style={[styles.toggleKnob, settings.birthdayNotification && styles.toggleKnobOn]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 今日農民曆 */}
        {lunarInfo && (
          <View style={styles.lunarCard}>
            <Text style={styles.lunarTitle}>📅 今日農民曆</Text>
            <Text style={styles.lunarDate}>
              農曆 {lunarInfo.lunarMonth}月{lunarInfo.lunarDay}日
              {lunarInfo.jieqi && <Text style={styles.jieqi}> · {lunarInfo.jieqi}</Text>}
              {lunarInfo.godBirthday && <Text style={styles.godBirthday}> · {lunarInfo.godBirthday}</Text>}
            </Text>
            <View style={styles.lunarRow}>
              <Text style={styles.lunarLabel}>宜：</Text>
              <Text style={styles.lunarValue}>{lunarInfo.yi.join('、')}</Text>
            </View>
            <View style={styles.lunarRow}>
              <Text style={styles.lunarLabel}>忌：</Text>
              <Text style={styles.lunarValue}>{lunarInfo.ji.join('、')}</Text>
            </View>
          </View>
        )}

        {/* 儲存 */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{saved ? '✓ 已儲存' : '儲存設定'}</Text>
        </TouchableOpacity>

        {/* 關於 */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>關於神明占卜</Text>
          <Text style={styles.aboutText}>
            本 App 僅供文化娛樂參考，不具實際占卜效力。{'\n'}
            籤詩內容取自傳統雷雨師百首與六十甲子籤。{'\n'}
            願神明庇佑，心存善念即是好運。
          </Text>
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
    marginBottom: TempleSpacing.md,
  },
  dailyCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
  },
  dailyLabel: {
    fontSize: TempleFonts.small,
    color: TempleTheme.goldLight,
    fontWeight: '600',
    marginBottom: 6,
  },
  dailyContent: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    lineHeight: 20,
  },
  section: {
    marginBottom: TempleSpacing.md,
  },
  sectionTitle: {
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    marginBottom: TempleSpacing.sm,
  },
  fieldGroup: {
    marginBottom: TempleSpacing.sm,
  },
  fieldLabel: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
    borderRadius: 8,
    padding: TempleSpacing.sm,
    fontSize: TempleFonts.body,
    color: TempleTheme.textLight,
  },
  godSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TempleSpacing.xs,
  },
  godChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
  },
  godChipActive: { backgroundColor: TempleTheme.goldDark + '30', borderColor: TempleTheme.gold },
  godChipPatron: { borderColor: TempleTheme.gold + '80', borderWidth: 1.5 },
  godChipText: { fontSize: 12, color: TempleTheme.textMuted },
  godChipTextActive: { color: TempleTheme.goldLight, fontWeight: '600' },
  // 八字卡
  baziCard: {
    backgroundColor: TempleTheme.bgCard, borderRadius: 12, padding: TempleSpacing.md,
    marginTop: TempleSpacing.sm, borderWidth: 1, borderColor: TempleTheme.goldDark + '40',
  },
  baziCardWarning: { borderColor: '#E74C3C80' },
  baziRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  baziEmoji: { fontSize: 36, marginRight: TempleSpacing.md },
  baziInfo: { flex: 1 },
  baziMain: { fontSize: TempleFonts.body, fontWeight: '700', color: TempleTheme.goldLight, marginBottom: 4 },
  baziTags: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  wuxingTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  wuxingText: { fontSize: 12, fontWeight: '700' },
  baziSub: { fontSize: 11, color: TempleTheme.textMuted },
  baziPatron: { fontSize: TempleFonts.small, color: TempleTheme.gold, fontWeight: '600', marginTop: 2 },
  baziWarning: { fontSize: 11, color: '#E74C3C', marginTop: 6, lineHeight: 16 },
  saveBtn: {
    backgroundColor: TempleTheme.red,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: TempleSpacing.lg,
  },
  saveBtnText: {
    color: TempleTheme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '700',
  },
  aboutSection: {
    marginTop: 'auto',
    padding: TempleSpacing.md,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
  },
  aboutTitle: {
    fontSize: TempleFonts.small,
    fontWeight: '600',
    color: TempleTheme.textMuted,
    marginBottom: 6,
  },
  aboutText: { fontSize: 11, color: TempleTheme.textMuted, lineHeight: 18 },
  // Toggle styles
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: TempleTheme.bgCard, borderRadius: 10, padding: TempleSpacing.sm,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '20', marginBottom: TempleSpacing.xs,
  },
  toggleRowActive: { borderColor: TempleTheme.goldDark },
  toggleInfo: { flex: 1, marginRight: TempleSpacing.sm },
  toggleLabel: { fontSize: TempleFonts.small, color: TempleTheme.textLight, fontWeight: '600' },
  toggleDesc: { fontSize: 11, color: TempleTheme.textMuted, marginTop: 2 },
  toggleSwitch: {
    width: 48, height: 28, borderRadius: 14, backgroundColor: TempleTheme.bgDark + '80',
    justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleSwitchOn: { backgroundColor: TempleTheme.goldDark },
  toggleKnob: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: TempleTheme.textMuted,
  },
  toggleKnobOn: { backgroundColor: TempleTheme.goldLight, alignSelf: 'flex-end' },
  // Lunar calendar
  lunarCard: {
    backgroundColor: TempleTheme.bgCard, borderRadius: 12, padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md, borderWidth: 1, borderColor: TempleTheme.goldDark + '20',
  },
  lunarTitle: { fontSize: TempleFonts.small, color: TempleTheme.goldLight, fontWeight: '700', marginBottom: 6 },
  lunarDate: { fontSize: TempleFonts.body, color: TempleTheme.textLight, fontWeight: '600', marginBottom: 8 },
  jieqi: { color: TempleTheme.success, fontWeight: '700' },
  godBirthday: { color: TempleTheme.redLight, fontWeight: '700' },
  lunarRow: { flexDirection: 'row', marginBottom: 4 },
  lunarLabel: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, width: 36 },
  lunarValue: { fontSize: TempleFonts.small, color: TempleTheme.textLight, flex: 1 },
});
