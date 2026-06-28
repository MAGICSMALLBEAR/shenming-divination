import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';

import { DRAW_ANIMATION_PRESETS, normalizeDrawAnimationDuration } from '@/constants/divination';
import {
  drawAnimationStyleOrder,
  drawAnimationStyles,
  getDrawAnimationRitualStyle,
  normalizeDrawAnimationStyleKey,
} from '@/constants/draw-animation-styles';
import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import { getDailyPoem } from '@/services/dailyPoem';
import {
  getSettings,
  saveSettings,
  type AppSettings,
} from '@/services/storage';
import {
  cancelDailyNotifications,
  cancelGodBirthdayNotifications,
  cancelFortuneWidgetNotification,
  requestPermissions,
  scheduleDailyNotification,
  scheduleGodBirthdayNotifications,
  scheduleFortuneWidgetNotification,
} from '@/services/notifications';
import { startAmbientSound, stopAmbientSound } from '@/services/proceduralSound';
import { getTodayLunarInfo } from '@/data/lunarCalendar';
import { calcBazi, parseBirthYear, ZODIAC_PATRON_GOD } from '@/services/bazi';
import { gods } from '@/data/gods';
import { exportBackupJson, importBackupJson } from '@/services/backup';
import { useI18n } from '@/hooks/useI18n';
import { setLanguage, type Lang } from '@/services/i18n';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { DrawAnimation } from '@/components/DrawAnimation';
import {
  isPremiumActive,
  getPremiumStatus,
  cancelPlan,
  SUBSCRIPTION_PLANS,
  type PremiumPlan,
} from '@/services/premiumService';
import { THEME_LABELS, type ThemeMode } from '@/constants/themes';

const LANGUAGES: { key: Lang; label: string }[] = [
  { key: 'zh-TW', label: '繁體中文' },
  { key: 'en', label: 'English' },
  { key: 'ja', label: '日本語' },
];

export default function SettingsScreen() {
  const { lang, t } = useI18n();
  const layout = useResponsiveLayout();
  const [settings, setSettings] = useState<AppSettings>({
    userName: '',
    birthDate: '',
    preferredGodId: 1,
    drawAnimationDurationMs: DRAW_ANIMATION_PRESETS[1].durationMs,
    drawAnimationMode: 'random',
    drawAnimationStyleKey: 'bronze',
    lowMotionMode: false,
    language: lang,
  });
  const [saved, setSaved] = useState(false);
  const [backupText, setBackupText] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [premiumActive, setPremiumActive] = useState(false);
  const [premiumPlan, setPremiumPlan] = useState<PremiumPlan>('free');
  const [showDrawPreview, setShowDrawPreview] = useState(false);

  useEffect(() => {
    getPremiumStatus().then(s => {
      setPremiumPlan(s.plan);
      isPremiumActive().then(setPremiumActive);
    });
  }, []);

  const dailyPoem = useMemo(() => getDailyPoem(), []);
  const previewGod = useMemo(
    () => gods.find((god) => god.id === settings.preferredGodId) ?? gods[0],
    [settings.preferredGodId]
  );
  const lunarInfo = useMemo(() => getTodayLunarInfo(), []);

  const bazi = useMemo(() => {
    const year = parseBirthYear(settings.birthDate);
    return year ? calcBazi(year) : null;
  }, [settings.birthDate]);

  const loadStoredSettings = async () => {
    const stored = await getSettings();
    if (!stored) return;
    setSettings((prev) => ({
      ...prev,
      ...stored,
      drawAnimationDurationMs: normalizeDrawAnimationDuration(stored.drawAnimationDurationMs),
    }));
  };

  useEffect(() => {
    loadStoredSettings();
  }, []);

  const handleSave = async () => {
    await saveSettings(settings);
    if (settings.language && settings.language !== lang) {
      setLanguage(settings.language);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportBackup = async () => {
    const raw = await exportBackupJson();
    await Clipboard.setStringAsync(raw);
    setBackupText(raw);
    Alert.alert('已複製備份', '備份 JSON 已複製到剪貼簿，也顯示在下方文字框。');
  };

  const handleImportBackup = async () => {
    if (!backupText.trim()) {
      Alert.alert('尚未貼上內容', '請先貼上備份 JSON。');
      return;
    }

    try {
      await importBackupJson(backupText);
      await loadStoredSettings();
      setSaved(false);
      Alert.alert('已還原備份', '設定資料已重新載入，其他頁面也會讀到新的本機資料。');
    } catch (error) {
      Alert.alert('還原失敗', error instanceof Error ? error.message : '請確認備份內容格式。');
    }
  };

  const handleToggleDailyNotification = async () => {
    const nextValue = !settings.dailyNotification;

    if (!nextValue) {
      setSettings((prev) => ({ ...prev, dailyNotification: false }));
      await cancelDailyNotifications();
      return;
    }

    const ok = await requestPermissions();
    if (!ok) {
      setSettings((prev) => ({ ...prev, dailyNotification: false }));
      Alert.alert('無法開啟提醒', '這個平台或裝置目前沒有提供每日推播提醒。');
      return;
    }

    await scheduleDailyNotification();
    setSettings((prev) => ({ ...prev, dailyNotification: true }));
    Alert.alert('提醒已開啟', '每天 7:30 會提醒你查看今日籤詩。');
  };

  const handleToggleBirthdayNotification = async () => {
    const nextValue = !settings.birthdayNotification;

    if (!nextValue) {
      setSettings((prev) => ({ ...prev, birthdayNotification: false }));
      await cancelGodBirthdayNotifications();
      return;
    }

    const ok = await requestPermissions();
    if (!ok) {
      setSettings((prev) => ({ ...prev, birthdayNotification: false }));
      Alert.alert('無法開啟提醒', '這個平台或裝置目前沒有提供神明聖誕提醒。');
      return;
    }

    await scheduleGodBirthdayNotifications();
    setSettings((prev) => ({ ...prev, birthdayNotification: true }));
    Alert.alert('提醒已開啟', '會在未來 60 天內的聖誕日前一天提醒你。');
  };

  const handleToggleFortuneWidget = async () => {
    const nextValue = !(settings as any).fortuneWidget;

    if (!nextValue) {
      await cancelFortuneWidgetNotification();
      setSettings((prev) => ({ ...prev, fortuneWidget: false } as any));
      return;
    }

    const ok = await requestPermissions();
    if (!ok) {
      Alert.alert('無法開啟提醒', '請在系統設定中允許通知權限。');
      return;
    }

    await scheduleFortuneWidgetNotification();
    setSettings((prev) => ({ ...prev, fortuneWidget: true } as any));
    Alert.alert('每日運勢通知已開啟', '每天 08:00 會推送今日節氣、神諭與宜忌，讓通知中心成為你的運勢看板。');
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
      >
        <Text style={styles.pageTitle}>{t('settingsTitle')}</Text>

        <View style={styles.dailyCard}>
          <Text style={styles.dailyLabel}>
            今日籤詩 · {dailyPoem.date} {dailyPoem.dayOfWeek}
          </Text>
          <Text style={styles.dailyContent}>
            第 {dailyPoem.poem.number} 籤 · {dailyPoem.poem.level}
          </Text>
          <Text style={styles.dailyHint}>{dailyPoem.poem.content.split('\n')[0]}</Text>
        </View>

        <View style={[styles.sectionGrid, layout.isDesktop && styles.sectionGridDesktop]}>
          <View style={[styles.section, layout.isDesktop && styles.sectionGridItem]}>
            <Text style={styles.sectionTitle}>語言 / Language</Text>
            <View style={styles.godSelector}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.key}
                  style={[
                    styles.godChip,
                    settings.language === l.key && styles.godChipActive,
                  ]}
                  onPress={() => setSettings((prev) => ({ ...prev, language: l.key }))}
                >
                  <Text
                    style={[
                      styles.godChipText,
                      settings.language === l.key && styles.godChipTextActive,
                    ]}
                  >
                    {l.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.section, layout.isDesktop && styles.sectionGridItem]}>
            <Text style={styles.sectionTitle}>個人化設定</Text>

            <FieldLabel text="稱呼" />
            <TextInput
              style={styles.input}
              value={settings.userName}
              onChangeText={(value) => setSettings((prev) => ({ ...prev, userName: value }))}
              placeholder="輸入名字或暱稱"
              placeholderTextColor={TempleTheme.textMuted}
            />

            <FieldLabel text="出生年份" />
            <TextInput
              style={styles.input}
              value={settings.birthDate}
              onChangeText={(value) => setSettings((prev) => ({ ...prev, birthDate: value }))}
              placeholder="例如：1996 或 民國 85"
              placeholderTextColor={TempleTheme.textMuted}
            />

          {bazi ? (
            <View style={styles.baziCard}>
              <Text style={styles.baziTitle}>
                {bazi.zodiacEmoji} {bazi.ganZhi}年 · 屬{bazi.zodiac}
              </Text>
              <Text style={styles.baziText}>五行：{bazi.wuxing}</Text>
              <Text style={styles.baziText}>
                守護神：{gods.find((god) => god.id === bazi.patronGodId)?.name ?? '神明'}
              </Text>
            </View>
          ) : null}

            <FieldLabel text="常用神明" />
            <View style={styles.godSelector}>
              {gods.map((god) => {
                const isPatron =
                  bazi && ZODIAC_PATRON_GOD[bazi.zodiac] === god.id;
                return (
                  <TouchableOpacity
                    key={god.id}
                    style={[
                      styles.godChip,
                      settings.preferredGodId === god.id && styles.godChipActive,
                      isPatron && styles.godChipPatron,
                    ]}
                    onPress={() =>
                      setSettings((prev) => ({ ...prev, preferredGodId: god.id }))
                    }
                  >
                    <Text
                      style={[
                        styles.godChipText,
                        settings.preferredGodId === god.id && styles.godChipTextActive,
                      ]}
                    >
                      {isPatron ? '守護 · ' : ''}
                      {god.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={[styles.section, layout.isDesktop && styles.fullWidthSection]}>
          <Text style={styles.sectionTitle}>求籤流程</Text>
          <ToggleRow
            label="嚴謹擲筊模式"
            description="開啟後需累積三次聖筊，才會進入抽籤。"
            value={Boolean(settings.strictMode)}
            onToggle={() =>
              setSettings((prev) => ({ ...prev, strictMode: !prev.strictMode }))
            }
          />

          <ToggleRow
            label="低動畫 / 省電模式"
            description="減少背景、煙霧、粒子與長動畫，低階手機會更穩。"
            value={Boolean(settings.lowMotionMode)}
            onToggle={() =>
              setSettings((prev) => ({ ...prev, lowMotionMode: !prev.lowMotionMode }))
            }
          />

          <FieldLabel text="抽籤動畫長度" />
          <View style={styles.durationGrid}>
            {DRAW_ANIMATION_PRESETS.map((preset) => {
              const active =
                normalizeDrawAnimationDuration(settings.drawAnimationDurationMs) ===
                preset.durationMs;

              return (
                <TouchableOpacity
                  key={preset.durationMs}
                  style={[styles.durationCard, active && styles.durationCardActive]}
                  onPress={() =>
                    setSettings((prev) => ({
                      ...prev,
                      drawAnimationDurationMs: preset.durationMs,
                    }))
                  }
                >
                  <Text style={[styles.durationTitle, active && styles.durationTitleActive]}>
                    {preset.label} · {(preset.durationMs / 1000).toFixed(1)} 秒
                  </Text>
                  <Text style={[styles.durationDesc, active && styles.durationDescActive]}>
                    {preset.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FieldLabel text="抽籤筒動畫風格" />
          <View style={styles.animationModeRow}>
            {[
              { key: 'random', label: '隨機輪播', desc: '每次求籤自動換一種香爐與籤筒動畫。' },
              { key: 'fixed', label: '固定風格', desc: '永遠使用下方指定的一種抽籤格式。' },
            ].map((mode) => {
              const active = settings.drawAnimationMode === mode.key;

              return (
                <TouchableOpacity
                  key={mode.key}
                  style={[styles.animationModeCard, active && styles.animationModeCardActive]}
                  onPress={() =>
                    setSettings((prev) => ({
                      ...prev,
                      drawAnimationMode: mode.key as AppSettings['drawAnimationMode'],
                    }))
                  }
                >
                  <Text style={[styles.animationModeTitle, active && styles.animationModeTitleActive]}>
                    {mode.label}
                  </Text>
                  <Text style={styles.animationModeDesc}>{mode.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.drawStyleGrid}>
            {drawAnimationStyleOrder.map((key) => {
              const style = drawAnimationStyles[key];
              const ritualStyle = getDrawAnimationRitualStyle(key);
              const active = settings.drawAnimationStyleKey === key;

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.drawStyleCard,
                    { borderColor: active ? ritualStyle.chipColor : TempleTheme.goldDark + '25' },
                    active && styles.drawStyleCardActive,
                  ]}
                  onPress={() =>
                    setSettings((prev) => ({
                      ...prev,
                      drawAnimationMode: 'fixed',
                      drawAnimationStyleKey: key,
                    }))
                  }
                >
                  <Image
                    source={ritualStyle.censer.placedSprite}
                    style={styles.drawStyleImage}
                    contentFit="contain"
                  />
                  <Text style={[styles.drawStyleTitle, { color: ritualStyle.chipColor }]}>
                    {style.label}
                  </Text>
                  <Text style={styles.drawStyleText}>{style.summary}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={styles.previewToggleBtn}
            onPress={() => setShowDrawPreview((value) => !value)}
          >
            <Text style={styles.previewToggleText}>
              {showDrawPreview ? '收起動畫預覽' : '預覽目前抽籤動畫'}
            </Text>
          </TouchableOpacity>

          {showDrawPreview ? (
            <View style={styles.drawPreviewPanel}>
              <DrawAnimation
                god={previewGod}
                poemNumber={dailyPoem.poem.number}
                durationMs={settings.lowMotionMode ? 3000 : normalizeDrawAnimationDuration(settings.drawAnimationDurationMs)}
                styleKey={normalizeDrawAnimationStyleKey(settings.drawAnimationStyleKey)}
                lowMotion={Boolean(settings.lowMotionMode)}
                soundEnabled={false}
              />
            </View>
          ) : null}
        </View>

        <View style={[styles.section, layout.isDesktop && styles.fullWidthSection]}>
          <Text style={styles.sectionTitle}>通知</Text>

          <ToggleRow
            label="每日籤詩提醒"
            description="每天 7:30 推送今日籤詩與提醒。"
            value={Boolean(settings.dailyNotification)}
            onToggle={handleToggleDailyNotification}
          />

          <ToggleRow
            label="神明聖誕提醒"
            description="在神明聖誕前一天晚間提醒你。"
            value={Boolean(settings.birthdayNotification)}
            onToggle={handleToggleBirthdayNotification}
          />

          <ToggleRow
            label="每日運勢看板（Widget 替代）"
            description="每天 08:00 推送節氣、神諭與宜忌，在通知中心提供類 Widget 體驗。"
            value={Boolean((settings as any).fortuneWidget)}
            onToggle={handleToggleFortuneWidget}
          />

          <ToggleRow
            label="廟宇環境音效"
            description="冥想與求籤步驟播放低頻鐘鳴環境音，營造廟宇氛圍。"
            value={Boolean(settings.ambientSound)}
            onToggle={async () => {
              const next = !settings.ambientSound;
              setSettings(prev => ({ ...prev, ambientSound: next }));
              await saveSettings({ ...settings, ambientSound: next });
              if (next) startAmbientSound(); else stopAmbientSound();
            }}
          />
        </View>

        {lunarInfo ? (
          <View style={styles.lunarCard}>
            <Text style={styles.sectionTitle}>今日農曆</Text>
            <Text style={styles.lunarDate}>
              農曆 {lunarInfo.lunarMonth}月{lunarInfo.lunarDay}日
            </Text>
            <Text style={styles.lunarText}>宜：{lunarInfo.yi.join('、')}</Text>
            <Text style={styles.lunarText}>忌：{lunarInfo.ji.join('、')}</Text>
            {lunarInfo.jieqi ? <Text style={styles.lunarText}>節氣：{lunarInfo.jieqi}</Text> : null}
            {lunarInfo.godBirthday ? (
              <Text style={styles.lunarText}>神明聖誕：{lunarInfo.godBirthday}</Text>
            ) : null}
          </View>
        ) : null}

        {/* AI 設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI 解籤設定</Text>
          <Text style={styles.backupHint}>
            可自訂 AI 伺服器網址，或直接填入 API Key 讓 App 繞過後端直連 AI（需支援 Anthropic/OpenAI 相容 API）。
          </Text>
          <TextInput
            style={styles.aiInput}
            value={(settings as any).aiServerUrl || ''}
            onChangeText={v => setSettings(prev => ({ ...prev, aiServerUrl: v || undefined }) as any)}
            placeholder="AI 伺服器網址（選填）"
            placeholderTextColor={TempleTheme.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.aiInput}
            value={(settings as any).aiApiKey || ''}
            onChangeText={v => setSettings(prev => ({ ...prev, aiApiKey: v || undefined }) as any)}
            placeholder="API Key（選填，例如 sk-ant-...）"
            placeholderTextColor={TempleTheme.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>備份與還原</Text>
          <Text style={styles.backupHint}>
            可將資料匯出成 JSON 備份字串，之後再貼回來還原。
          </Text>
          <View style={[styles.backupActions, layout.isDesktop && styles.backupActionsDesktop]}>
            <TouchableOpacity style={styles.backupBtn} onPress={handleExportBackup}>
              <Text style={styles.backupBtnText}>匯出並複製備份</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backupBtnSecondary} onPress={handleImportBackup}>
              <Text style={styles.backupBtnText}>貼上內容並還原</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.backupInput}
            value={backupText}
            onChangeText={setBackupText}
            placeholder="備份 JSON 會顯示在這裡，也可以手動貼上舊備份。"
            placeholderTextColor={TempleTheme.textMuted}
            multiline
          />
        </View>

        {/* Premium 訂閱 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👑 Premium 訂閱</Text>
          {premiumActive ? (
            <View style={styles.premiumActiveCard}>
              <Text style={styles.premiumActiveTitle}>
                ✓ 你是 Premium 會員（{SUBSCRIPTION_PLANS.find(p => p.id === premiumPlan)?.name ?? ''}）
              </Text>
              <Text style={styles.premiumActiveDesc}>解鎖所有功能，享受完整命理體驗</Text>
              <TouchableOpacity
                style={styles.premiumCancelBtn}
                onPress={async () => {
                  await cancelPlan();
                  setPremiumActive(false);
                  setPremiumPlan('free');
                }}
              >
                <Text style={styles.premiumCancelBtnText}>取消訂閱</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.premiumFreeCard}>
              <Text style={styles.premiumFreeTitle}>目前為免費版</Text>
              <Text style={styles.premiumFreeDesc}>每日 3 次求籤・基礎 AI 解析</Text>
              <TouchableOpacity style={styles.premiumUpgradeBtn} onPress={() => setShowPaywall(true)}>
                <Text style={styles.premiumUpgradeBtnText}>升級 Premium — 解鎖完整功能</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 主題設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 外觀主題</Text>
          <View style={styles.godSelector}>
            {(Object.entries(THEME_LABELS) as [ThemeMode, string][]).map(([mode, label]) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.godChip,
                  (settings.theme ?? 'dark') === mode && styles.godChipActive,
                ]}
                onPress={() => setSettings(prev => ({ ...prev, theme: mode }))}
              >
                <Text style={[
                  styles.godChipText,
                  (settings.theme ?? 'dark') === mode && styles.godChipTextActive,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.themeNote}>* 淺色主題仍在優化中，部分頁面可能顯示深色</Text>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{saved ? '已儲存設定' : '儲存設定'}</Text>
        </TouchableOpacity>

        <PremiumPaywall
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onActivated={() => {
            setShowPaywall(false);
            setPremiumActive(true);
            getPremiumStatus().then(s => setPremiumPlan(s.plan));
          }}
        />

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>關於這個版本</Text>
          <Text style={styles.aboutText}>
            目前已加入應驗追蹤、問題潤飾、神明推薦、行動清單、每日專區，以及本機備份還原。
          </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldLabel({ text }: { text: string }) {
  return <Text style={styles.fieldLabel}>{text}</Text>;
}

function ToggleRow({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void | Promise<void>;
}) {
  return (
    <TouchableOpacity
      style={[styles.toggleRow, value && styles.toggleRowActive]}
      onPress={onToggle}
    >
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <View style={[styles.toggleSwitch, value && styles.toggleSwitchOn]}>
        <View style={[styles.toggleKnob, value && styles.toggleKnobOn]} />
      </View>
    </TouchableOpacity>
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
    fontSize: TempleFonts.body,
    color: TempleTheme.goldLight,
    fontWeight: '700',
  },
  dailyHint: {
    marginTop: 6,
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    lineHeight: 20,
  },
  section: {
    marginBottom: TempleSpacing.md,
  },
  sectionGrid: {},
  sectionGridDesktop: {
    flexDirection: 'row',
    gap: TempleSpacing.md,
    alignItems: 'flex-start',
  },
  sectionGridItem: {
    flex: 1,
    minWidth: 320,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '22',
    padding: TempleSpacing.md,
  },
  fullWidthSection: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '22',
    padding: TempleSpacing.md,
  },
  sectionTitle: {
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    marginBottom: TempleSpacing.sm,
  },
  fieldLabel: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    marginBottom: 6,
    marginTop: 2,
  },
  input: {
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
    borderRadius: 8,
    padding: TempleSpacing.sm,
    fontSize: TempleFonts.body,
    color: TempleTheme.textLight,
    marginBottom: TempleSpacing.sm,
  },
  baziCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
  },
  baziTitle: {
    fontSize: TempleFonts.body,
    color: TempleTheme.goldLight,
    fontWeight: '800',
    marginBottom: 4,
  },
  baziText: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 20,
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
  durationGrid: {
    gap: TempleSpacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  durationCard: {
    flex: 1,
    minWidth: 190,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '25',
    borderRadius: 12,
    padding: TempleSpacing.sm,
  },
  durationCardActive: {
    borderColor: TempleTheme.gold,
    backgroundColor: TempleTheme.goldDark + '25',
  },
  durationTitle: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textLight,
    fontWeight: '700',
    marginBottom: 4,
  },
  durationTitleActive: {
    color: TempleTheme.goldLight,
  },
  durationDesc: {
    fontSize: 11,
    color: TempleTheme.textMuted,
  },
  durationDescActive: {
    color: TempleTheme.textGold,
  },
  animationModeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TempleSpacing.xs,
    marginBottom: TempleSpacing.sm,
  },
  animationModeCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '24',
    borderRadius: 12,
    padding: TempleSpacing.sm,
  },
  animationModeCardActive: {
    borderColor: TempleTheme.gold,
    backgroundColor: TempleTheme.goldDark + '22',
  },
  animationModeTitle: {
    color: TempleTheme.textLight,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    marginBottom: 4,
  },
  animationModeTitleActive: {
    color: TempleTheme.goldLight,
  },
  animationModeDesc: {
    color: TempleTheme.textMuted,
    fontSize: 11,
    lineHeight: 17,
  },
  drawStyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TempleSpacing.sm,
  },
  drawStyleCard: {
    flex: 1,
    minWidth: 190,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderRadius: 14,
    padding: TempleSpacing.sm,
  },
  drawStyleCardActive: {
    backgroundColor: TempleTheme.goldDark + '18',
  },
  drawStyleImage: {
    width: '100%',
    height: 86,
    marginBottom: 6,
  },
  drawStyleTitle: {
    fontSize: TempleFonts.small,
    fontWeight: '900',
    marginBottom: 4,
  },
  drawStyleText: {
    color: TempleTheme.textMuted,
    fontSize: 11,
    lineHeight: 17,
  },
  previewToggleBtn: {
    marginTop: TempleSpacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TempleTheme.gold,
    backgroundColor: TempleTheme.goldDark + '22',
    paddingVertical: TempleSpacing.sm,
    alignItems: 'center',
  },
  previewToggleText: {
    color: TempleTheme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '800',
  },
  drawPreviewPanel: {
    height: 640,
    marginTop: TempleSpacing.md,
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '35',
    backgroundColor: TempleTheme.bgDark,
  },  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 10,
    padding: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
    marginBottom: TempleSpacing.xs,
  },
  toggleRowActive: { borderColor: TempleTheme.goldDark },
  toggleInfo: { flex: 1, marginRight: TempleSpacing.sm },
  toggleLabel: { fontSize: TempleFonts.small, color: TempleTheme.textLight, fontWeight: '600' },
  toggleDesc: { fontSize: 11, color: TempleTheme.textMuted, marginTop: 2 },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: TempleTheme.bgDark + '80',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleSwitchOn: { backgroundColor: TempleTheme.goldDark },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: TempleTheme.textMuted,
  },
  toggleKnobOn: { backgroundColor: TempleTheme.goldLight, alignSelf: 'flex-end' },
  lunarCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
  },
  lunarDate: {
    fontSize: TempleFonts.body,
    color: TempleTheme.textLight,
    fontWeight: '600',
    marginBottom: 8,
  },
  lunarText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    marginBottom: 4,
  },
  backupHint: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 20,
    marginBottom: 8,
  },
  backupActions: {
    gap: TempleSpacing.xs,
    marginBottom: TempleSpacing.sm,
  },
  backupActionsDesktop: {
    flexDirection: 'row',
  },
  backupBtn: {
    flex: 1,
    backgroundColor: TempleTheme.red,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  backupBtnSecondary: {
    flex: 1,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '25',
  },
  backupBtnText: {
    color: TempleTheme.goldLight,
    fontWeight: '700',
  },
  aiInput: {
    backgroundColor: TempleTheme.bgCard, borderWidth: 1, borderColor: TempleTheme.goldDark + '40',
    borderRadius: 10, padding: TempleSpacing.sm, color: TempleTheme.textLight,
    fontSize: TempleFonts.small, marginBottom: TempleSpacing.sm,
  } as any,
  backupInput: {
    minHeight: 160,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '25',
    borderRadius: 10,
    padding: TempleSpacing.sm,
    color: TempleTheme.textLight,
    textAlignVertical: 'top',
  },
  // Premium styles
  premiumActiveCard: {
    backgroundColor: '#2d5a2d55',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4caf5066',
    padding: TempleSpacing.md,
    gap: 6,
  },
  premiumActiveTitle: { color: '#81c784', fontWeight: '800', fontSize: TempleFonts.body },
  premiumActiveDesc: { color: '#a5d6a7', fontSize: TempleFonts.small },
  premiumCancelBtn: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '44',
  },
  premiumCancelBtnText: { color: TempleTheme.textMuted, fontSize: 13 },
  premiumFreeCard: {
    backgroundColor: TempleTheme.bgMedium,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '33',
    padding: TempleSpacing.md,
    gap: 6,
  },
  premiumFreeTitle: { color: TempleTheme.textLight, fontWeight: '700', fontSize: TempleFonts.body },
  premiumFreeDesc: { color: TempleTheme.textMuted, fontSize: TempleFonts.small },
  premiumUpgradeBtn: {
    marginTop: 8,
    backgroundColor: TempleTheme.gold,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  premiumUpgradeBtnText: { color: TempleTheme.bgDark, fontWeight: '900', fontSize: TempleFonts.body },
  themeNote: { color: TempleTheme.textMuted, fontSize: 11, marginTop: 6 },

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
});
