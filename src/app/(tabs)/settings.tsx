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
import { useRouter } from 'expo-router';

import { DRAW_ANIMATION_PRESETS, normalizeDrawAnimationDuration } from '@/constants/divination';
import {
  drawAnimationStyleOrder,
  drawAnimationStyles,
  getDrawAnimationRitualStyle,
  normalizeDrawAnimationStyleKey,
  normalizeShakeMode,
} from '@/constants/draw-animation-styles';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
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
import { THEME_LABELS, type ThemeMode, type ThemeColors } from '@/constants/themes';
import { onAuthChange, signInAnon, signOutUser, type AuthState } from '@/services/authService';
import { getCloudBackupMeta, restoreCloudBackupToLocal, uploadLocalBackupToCloud, type CloudBackupMeta } from '@/services/syncService';

const LANGUAGES: { key: Lang; label: string }[] = [
  { key: 'zh-TW', label: '繁體中文' },
  { key: 'en', label: 'English' },
  { key: 'ja', label: '日本語' },
];

export default function SettingsScreen() {
  const { lang, t } = useI18n();
  const layout = useResponsiveLayout();
  const router = useRouter();
  const { theme, mode: activeThemeMode, setMode } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [cloudMeta, setCloudMeta] = useState<CloudBackupMeta | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  useEffect(() => {
    getPremiumStatus().then(s => {
      setPremiumPlan(s.plan);
      isPremiumActive().then(setPremiumActive);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange((state) => {
      setAuthState(state);
      getCloudBackupMeta().then(setCloudMeta);
    });
    getCloudBackupMeta().then(setCloudMeta);
    return unsubscribe;
  }, []);

  const dailyPoem = useMemo(() => getDailyPoem(), []);
  const [previewShakeKey, setPreviewShakeKey] = useState(0);
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

  const refreshCloudMeta = async () => {
    setCloudMeta(await getCloudBackupMeta());
  };

  const handleAnonymousSyncLogin = async () => {
    setSyncBusy(true);
    try {
      await signInAnon();
      await refreshCloudMeta();
      Alert.alert('已啟用匿名同步', '現在可以把本機資料備份到雲端。');
    } catch (error) {
      Alert.alert('登入失敗', error instanceof Error ? error.message : '請稍後再試一次。');
    } finally {
      setSyncBusy(false);
    }
  };

  const handleCloudUpload = async () => {
    setSyncBusy(true);
    try {
      const meta = await uploadLocalBackupToCloud();
      setCloudMeta(meta);
      Alert.alert('已上傳雲端備份', '目前本機資料已保存到雲端最新備份。');
    } catch (error) {
      Alert.alert('上傳失敗', error instanceof Error ? error.message : '請稍後再試一次。');
    } finally {
      setSyncBusy(false);
    }
  };

  const handleCloudRestore = async () => {
    Alert.alert('從雲端還原', '這會用雲端最新備份覆蓋本機資料，確定要繼續嗎？', [
      { text: t('commonCancel'), style: 'cancel' },
      {
        text: '還原',
        onPress: async () => {
          setSyncBusy(true);
          try {
            await restoreCloudBackupToLocal();
            await loadStoredSettings();
            await refreshCloudMeta();
            Alert.alert('已還原雲端備份', '設定與紀錄已重新載入。');
          } catch (error) {
            Alert.alert('還原失敗', error instanceof Error ? error.message : '請稍後再試一次。');
          } finally {
            setSyncBusy(false);
          }
        },
      },
    ]);
  };

  const handleCloudSignOut = async () => {
    setSyncBusy(true);
    try {
      await signOutUser();
      await refreshCloudMeta();
    } finally {
      setSyncBusy(false);
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
      <StatusBar barStyle="light-content" backgroundColor={theme.bgDark} />
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
            {t('todayPoem')} · {dailyPoem.date} {dailyPoem.dayOfWeek}
          </Text>
          <Text style={styles.dailyContent}>
            第 {dailyPoem.poem.number} 籤 · {dailyPoem.poem.level}
          </Text>
          <Text style={styles.dailyHint}>{dailyPoem.poem.content.split('\n')[0]}</Text>
        </View>

        <View style={[styles.desktopSettingsRow, layout.isDesktop && styles.desktopSettingsRowActive]}>
          <View style={[styles.desktopSettingsCol, layout.isDesktop && styles.desktopSettingsColActive]}>

        <View style={[styles.sectionGrid, layout.isDesktop && styles.sectionGridDesktop]}>
          <View style={[styles.section, layout.isDesktop && styles.sectionGridItem]}>
            <Text style={styles.sectionTitle}>{t('settingsLanguageLabel')}</Text>
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
            <Text style={styles.sectionTitle}>{t('settingsPersonalization')}</Text>

            <FieldLabel text={t('settingsUserNameLabel')} />
            <TextInput
              style={styles.input}
              value={settings.userName}
              onChangeText={(value) => setSettings((prev) => ({ ...prev, userName: value }))}
              placeholder={t('settingsUserNamePlaceholder')}
              placeholderTextColor={theme.textMuted}
            />

            <FieldLabel text={t('settingsBirthYearLabel')} />
            <TextInput
              style={styles.input}
              value={settings.birthDate}
              onChangeText={(value) => setSettings((prev) => ({ ...prev, birthDate: value }))}
              placeholder={t('settingsBirthYearPlaceholder')}
              placeholderTextColor={theme.textMuted}
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

            <FieldLabel text={t('settingsPreferredGod')} />
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
                      {isPatron ? `${t('settingsPatronPrefix')}` : ''}
                      {god.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

          </View>
          <View style={[styles.desktopSettingsCol, layout.isDesktop && styles.desktopSettingsColActive]}>

        <View style={[styles.section, layout.isDesktop && styles.fullWidthSection]}>
          <Text style={styles.sectionTitle}>{t('settingsDivinationFlow')}</Text>
          <ToggleRow
            label={t('settingsStrictMode')}
            description={t('settingsStrictModeDesc')}
            value={Boolean(settings.strictMode)}
            onToggle={() =>
              setSettings((prev) => ({ ...prev, strictMode: !prev.strictMode }))
            }
          />

          <ToggleRow
            label={t('settingsLowMotion')}
            description={t('settingsLowMotionDesc')}
            value={Boolean(settings.lowMotionMode)}
            onToggle={() =>
              setSettings((prev) => ({ ...prev, lowMotionMode: !prev.lowMotionMode }))
            }
          />

          <FieldLabel text={t('settingsAnimDuration')} />
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

          <FieldLabel text={t('settingsShakeMode')} />
          <View style={styles.animationModeRow}>
            {[
              { key: 'drag', label: t('shakeModeDrag'), desc: t('shakeModeDragDesc') },
              { key: 'hold', label: t('shakeModeHold'), desc: t('shakeModeHoldDesc') },
            ].map((mode) => {
              const active = normalizeShakeMode(settings.shakeMode) === mode.key;

              return (
                <TouchableOpacity
                  key={mode.key}
                  style={[styles.animationModeCard, active && styles.animationModeCardActive]}
                  onPress={() =>
                    setSettings((prev) => ({
                      ...prev,
                      shakeMode: mode.key as AppSettings['shakeMode'],
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

          <FieldLabel text={t('settingsAnimStyle')} />
          <View style={styles.animationModeRow}>
            {[
              { key: 'random', label: t('animModeRandom'), desc: t('animModeRandomDesc') },
              { key: 'fixed', label: t('animModeFixed'), desc: t('animModeFixedDesc') },
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
                    { borderColor: active ? ritualStyle.chipColor : theme.goldDark + '25' },
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
              {showDrawPreview ? t('previewAnimToggleHide') : t('previewAnimToggle')}
            </Text>
          </TouchableOpacity>

          {showDrawPreview ? (
            <View style={styles.drawPreviewPanel}>
              <DrawAnimation
                key={`preview-${normalizeShakeMode(settings.shakeMode)}-${previewShakeKey}`}
                god={previewGod}
                poemNumber={dailyPoem.poem.number}
                durationMs={settings.lowMotionMode ? 3000 : normalizeDrawAnimationDuration(settings.drawAnimationDurationMs)}
                styleKey={normalizeDrawAnimationStyleKey(settings.drawAnimationStyleKey)}
                lowMotion={Boolean(settings.lowMotionMode)}
                soundEnabled={false}
                interactive
                shakeMode={normalizeShakeMode(settings.shakeMode)}
                onShakeComplete={() => {}}
              />
              <TouchableOpacity
                style={styles.previewToggleBtn}
                onPress={() => setPreviewShakeKey((value) => value + 1)}
              >
                <Text style={styles.previewToggleText}>{t('previewAnimRetry')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

          </View>
        </View>

        <View style={[styles.section, layout.isDesktop && styles.fullWidthSection]}>
          <Text style={styles.sectionTitle}>{t('settingsNotifications')}</Text>

          <ToggleRow
            label={t('settingsDailyNotif')}
            description={t('settingsDailyNotifDesc')}
            value={Boolean(settings.dailyNotification)}
            onToggle={handleToggleDailyNotification}
          />

          <ToggleRow
            label={t('settingsBirthdayNotif')}
            description={t('settingsBirthdayNotifDesc')}
            value={Boolean(settings.birthdayNotification)}
            onToggle={handleToggleBirthdayNotification}
          />

          <ToggleRow
            label={t('settingsFortuneWidget')}
            description={t('settingsFortuneWidgetDesc')}
            value={Boolean((settings as any).fortuneWidget)}
            onToggle={handleToggleFortuneWidget}
          />

          <ToggleRow
            label={t('settingsAmbientSound')}
            description={t('settingsAmbientSoundDesc')}
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
            <Text style={styles.sectionTitle}>{t('settingsLunarToday')}</Text>
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
          <Text style={styles.sectionTitle}>{t('settingsAiTitle')}</Text>
          <Text style={styles.backupHint}>
            {t('settingsAiDesc')}
          </Text>
          <TextInput
            style={styles.aiInput}
            value={(settings as any).aiServerUrl || ''}
            onChangeText={v => setSettings(prev => ({ ...prev, aiServerUrl: v || undefined }) as any)}
            placeholder={t('settingsAiServerPlaceholder')}
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.aiInput}
            value={(settings as any).aiApiKey || ''}
            onChangeText={v => setSettings(prev => ({ ...prev, aiApiKey: v || undefined }) as any)}
            placeholder={t('settingsAiKeyPlaceholder')}
            placeholderTextColor={theme.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settingsCloudSync')}</Text>
          <View style={styles.syncStatusCard}>
            <Text style={styles.syncStatusTitle}>
              {cloudMeta?.configured ? (authState?.isSignedIn ? t('settingsCloudEnabled') : t('settingsCloudNotSignedIn')) : t('settingsCloudNotConfigured')}
            </Text>
            <Text style={styles.syncStatusText}>
              {cloudMeta?.configured
                ? authState?.isSignedIn
                  ? `同步 ID：${authState.uid?.slice(0, 8) ?? 'anonymous'} · 最新備份 ${cloudMeta.exportedAt ? new Date(cloudMeta.exportedAt).toLocaleString('zh-TW') : '尚未上傳'}`
                  : '可用匿名登入先啟用跨裝置備份；正式版可再接 Google / Apple 登入。'
                : '請先在 src/services/firebaseConfig.ts 填入 Firebase 專案設定。'}
            </Text>
          </View>

          <View style={[styles.backupActions, layout.isDesktop && styles.backupActionsDesktop]}>
            {!authState?.isSignedIn ? (
              <TouchableOpacity
                style={[styles.backupBtn, (!cloudMeta?.configured || syncBusy) && styles.disabledBtn]}
                onPress={handleAnonymousSyncLogin}
                disabled={!cloudMeta?.configured || syncBusy}
              >
                <Text style={styles.backupBtnText}>{syncBusy ? t('settingsProcessing') : t('settingsCloudEnableBtn')}</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={[styles.backupBtn, syncBusy && styles.disabledBtn]} onPress={handleCloudUpload} disabled={syncBusy}>
                  <Text style={styles.backupBtnText}>{syncBusy ? t('settingsSyncing') : t('settingsCloudUploadBtn')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.backupBtnSecondary, syncBusy && styles.disabledBtn]} onPress={handleCloudRestore} disabled={syncBusy}>
                  <Text style={styles.backupBtnText}>{t('settingsCloudRestoreBtn')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.syncSignOutBtn} onPress={handleCloudSignOut} disabled={syncBusy}>
                  <Text style={styles.syncSignOutText}>{t('settingsCloudSignOutBtn')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settingsBackup')}</Text>
          <Text style={styles.backupHint}>
            {t('settingsBackupDesc')}
          </Text>
          <View style={[styles.backupActions, layout.isDesktop && styles.backupActionsDesktop]}>
            <TouchableOpacity style={styles.backupBtn} onPress={handleExportBackup}>
              <Text style={styles.backupBtnText}>{t('settingsExportBtn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backupBtnSecondary} onPress={handleImportBackup}>
              <Text style={styles.backupBtnText}>{t('settingsImportBtn')}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.backupInput}
            value={backupText}
            onChangeText={setBackupText}
            placeholder={t('settingsBackupPlaceholder')}
            placeholderTextColor={theme.textMuted}
            multiline
          />
        </View>

        {/* Premium 訂閱 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settingsPremium')}</Text>
          {premiumActive ? (
            <View style={styles.premiumActiveCard}>
              <Text style={styles.premiumActiveTitle}>
                ✓ 你是 Premium 會員（{SUBSCRIPTION_PLANS.find(p => p.id === premiumPlan)?.name ?? ''}）
              </Text>
              <Text style={styles.premiumActiveDesc}>展示模式已啟用，正式版需接 App Store / Google Play / Stripe 金流</Text>
              <TouchableOpacity
                style={styles.premiumCancelBtn}
                onPress={async () => {
                  await cancelPlan();
                  setPremiumActive(false);
                  setPremiumPlan('free');
                }}
              >
                <Text style={styles.premiumCancelBtnText}>{t('settingsPremiumCancelBtn')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.premiumFreeCard}>
              <Text style={styles.premiumFreeTitle}>{t('settingsPremiumFree')}</Text>
              <Text style={styles.premiumFreeDesc}>{t('settingsPremiumFreeDesc')}</Text>
              <TouchableOpacity style={styles.premiumUpgradeBtn} onPress={() => setShowPaywall(true)}>
                <Text style={styles.premiumUpgradeBtnText}>{t('settingsPremiumUpgradeBtn')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 主題設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settingsTheme')}</Text>
          <View style={styles.godSelector}>
            {(Object.entries(THEME_LABELS) as [ThemeMode, string][]).map(([mode, label]) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.godChip,
                  activeThemeMode === mode && styles.godChipActive,
                ]}
                onPress={() => {
                  setSettings(prev => ({ ...prev, theme: mode }));
                  setMode(mode);
                }}
              >
                <Text style={[
                  styles.godChipText,
                  activeThemeMode === mode && styles.godChipTextActive,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.themeNote}>{t('settingsThemeApplied')}</Text>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{saved ? t('settingsSaved') : t('settingsSaveBtn')}</Text>
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
          <Text style={styles.aboutTitle}>{t('settingsAbout')}</Text>
          <Text style={styles.aboutText}>
            {t('settingsAboutText')}
          </Text>
          <TouchableOpacity onPress={() => router.push('/privacy' as never)}>
            <Text style={styles.privacyLink}>{t('settingsPrivacyLink')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/disclaimer' as never)}>
            <Text style={styles.privacyLink}>{t('settingsDisclaimerLink')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/source-audit' as never)}>
            <Text style={styles.privacyLink}>{t('settingsSourceAuditLink')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldLabel({ text }: { text: string }) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, overflow: "hidden" as const, backgroundColor: theme.bgDark },
  container: { flex: 1, overflow: "hidden" as const },
  content: { width: '100%', alignSelf: 'center', paddingVertical: TempleSpacing.md },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: theme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.md,
  },
  dailyCard: {
    backgroundColor: theme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    borderWidth: 1,
    borderColor: theme.goldDark + '40',
  },
  dailyLabel: {
    fontSize: TempleFonts.small,
    color: theme.goldLight,
    fontWeight: '600',
    marginBottom: 6,
  },
  dailyContent: {
    fontSize: TempleFonts.body,
    color: theme.goldLight,
    fontWeight: '700',
  },
  dailyHint: {
    marginTop: 6,
    fontSize: TempleFonts.small,
    color: theme.textMuted,
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
    backgroundColor: theme.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.goldDark + '22',
    padding: TempleSpacing.md,
  },
  desktopSettingsRow: {},
  desktopSettingsRowActive: {
    flexDirection: 'row',
    gap: TempleSpacing.md,
    alignItems: 'flex-start',
  },
  desktopSettingsCol: {},
  desktopSettingsColActive: {
    flex: 1,
    minWidth: 320,
  },
  fullWidthSection: {
    backgroundColor: theme.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.goldDark + '22',
    padding: TempleSpacing.md,
  },
  sectionTitle: {
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: theme.goldLight,
    marginBottom: TempleSpacing.sm,
  },
  fieldLabel: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
    marginBottom: 6,
    marginTop: 2,
  },
  input: {
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
    borderRadius: 8,
    padding: TempleSpacing.sm,
    fontSize: TempleFonts.body,
    color: theme.textLight,
    marginBottom: TempleSpacing.sm,
    maxWidth: 600,
  },
  baziCard: {
    backgroundColor: theme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: theme.goldDark + '40',
  },
  baziTitle: {
    fontSize: TempleFonts.body,
    color: theme.goldLight,
    fontWeight: '800',
    marginBottom: 4,
  },
  baziText: {
    color: theme.textMuted,
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
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '20',
  },
  godChipActive: { backgroundColor: theme.goldDark + '30', borderColor: theme.gold },
  godChipPatron: { borderColor: theme.gold + '80', borderWidth: 1.5 },
  godChipText: { fontSize: 12, color: theme.textMuted },
  godChipTextActive: { color: theme.goldLight, fontWeight: '600' },
  durationGrid: {
    gap: TempleSpacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  durationCard: {
    flex: 1,
    minWidth: 190,
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '25',
    borderRadius: 12,
    padding: TempleSpacing.sm,
  },
  durationCardActive: {
    borderColor: theme.gold,
    backgroundColor: theme.goldDark + '25',
  },
  durationTitle: {
    fontSize: TempleFonts.small,
    color: theme.textLight,
    fontWeight: '700',
    marginBottom: 4,
  },
  durationTitleActive: {
    color: theme.goldLight,
  },
  durationDesc: {
    fontSize: 11,
    color: theme.textMuted,
  },
  durationDescActive: {
    color: theme.textGold,
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
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '24',
    borderRadius: 12,
    padding: TempleSpacing.sm,
  },
  animationModeCardActive: {
    borderColor: theme.gold,
    backgroundColor: theme.goldDark + '22',
  },
  animationModeTitle: {
    color: theme.textLight,
    fontSize: TempleFonts.small,
    fontWeight: '800',
    marginBottom: 4,
  },
  animationModeTitleActive: {
    color: theme.goldLight,
  },
  animationModeDesc: {
    color: theme.textMuted,
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
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderRadius: 14,
    padding: TempleSpacing.sm,
  },
  drawStyleCardActive: {
    backgroundColor: theme.goldDark + '18',
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
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 17,
  },
  previewToggleBtn: {
    marginTop: TempleSpacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.gold,
    backgroundColor: theme.goldDark + '22',
    paddingVertical: TempleSpacing.sm,
    alignItems: 'center',
  },
  previewToggleText: {
    color: theme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '800',
  },
  drawPreviewPanel: {
    height: 640,
    marginTop: TempleSpacing.md,
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.goldDark + '35',
    backgroundColor: theme.bgDark,
  },  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.bgCard,
    borderRadius: 10,
    padding: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: theme.goldDark + '20',
    marginBottom: TempleSpacing.xs,
  },
  toggleRowActive: { borderColor: theme.goldDark },
  toggleInfo: { flex: 1, marginRight: TempleSpacing.sm },
  toggleLabel: { fontSize: TempleFonts.small, color: theme.textLight, fontWeight: '600' },
  toggleDesc: { fontSize: 11, color: theme.textMuted, marginTop: 2 },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.bgDark + '80',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleSwitchOn: { backgroundColor: theme.goldDark },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.textMuted,
  },
  toggleKnobOn: { backgroundColor: theme.goldLight, alignSelf: 'flex-end' },
  lunarCard: {
    backgroundColor: theme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
    borderWidth: 1,
    borderColor: theme.goldDark + '20',
  },
  lunarDate: {
    fontSize: TempleFonts.body,
    color: theme.textLight,
    fontWeight: '600',
    marginBottom: 8,
  },
  lunarText: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
    marginBottom: 4,
  },
  backupHint: {
    color: theme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 20,
    marginBottom: 8,
  },
  backupActions: {
    gap: TempleSpacing.xs,
    marginBottom: TempleSpacing.sm,
    maxWidth: 600,
    alignSelf: 'center',
  },
  backupActionsDesktop: {
    flexDirection: 'row',
  },
  backupBtn: {
    flex: 1,
    backgroundColor: theme.red,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  backupBtnSecondary: {
    flex: 1,
    backgroundColor: theme.bgCard,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.goldDark + '25',
  },
  backupBtnText: {
    color: theme.goldLight,
    fontWeight: '700',
  },
  disabledBtn: { opacity: 0.45 },
  syncStatusCard: {
    backgroundColor: theme.bgMedium,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
  },
  syncStatusTitle: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '800', marginBottom: 4 },
  syncStatusText: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 20 },
  syncSignOutBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.danger + '55',
  },
  syncSignOutText: { color: theme.danger, fontWeight: '700' },
  aiInput: {
    backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.goldDark + '40',
    borderRadius: 10, padding: TempleSpacing.sm, color: theme.textLight,
    fontSize: TempleFonts.small, marginBottom: TempleSpacing.sm,
    maxWidth: 600,
  } as any,
  backupInput: {
    minHeight: 160,
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '25',
    borderRadius: 10,
    padding: TempleSpacing.sm,
    color: theme.textLight,
    textAlignVertical: 'top',
    maxWidth: 600,
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
    borderColor: theme.goldDark + '44',
  },
  premiumCancelBtnText: { color: theme.textMuted, fontSize: 13 },
  premiumFreeCard: {
    backgroundColor: theme.bgMedium,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.goldDark + '33',
    padding: TempleSpacing.md,
    gap: 6,
  },
  premiumFreeTitle: { color: theme.textLight, fontWeight: '700', fontSize: TempleFonts.body },
  premiumFreeDesc: { color: theme.textMuted, fontSize: TempleFonts.small },
  premiumUpgradeBtn: {
    marginTop: 8,
    backgroundColor: theme.gold,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  premiumUpgradeBtnText: { color: theme.bgDark, fontWeight: '900', fontSize: TempleFonts.body },
  themeNote: { color: theme.textMuted, fontSize: 11, marginTop: 6 },

  saveBtn: {
    backgroundColor: theme.red,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: TempleSpacing.lg,
    maxWidth: 500,
    alignSelf: 'center',
  },
  saveBtnText: {
    color: theme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '700',
  },
  aboutSection: {
    marginTop: 'auto',
    padding: TempleSpacing.md,
    backgroundColor: theme.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.goldDark + '20',
  },
  aboutTitle: {
    fontSize: TempleFonts.small,
    fontWeight: '600',
    color: theme.textMuted,
    marginBottom: 6,
  },
  aboutText: { fontSize: 11, color: theme.textMuted, lineHeight: 18 },
  privacyLink: { fontSize: 12, color: theme.gold, fontWeight: '600', marginTop: 10 },
  });
}



