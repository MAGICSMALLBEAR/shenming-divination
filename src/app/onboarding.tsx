// 完整 Onboarding 引導流程（P4）
// 首次開啟 App 時顯示，引導用戶設定生辰、守護神、通知
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import { gods } from '@/data/gods';
import { getGodCardImage } from '@/data/godImages';
import { getSettings, saveSettings } from '@/services/storage';
import { requestPermissions, scheduleDailyNotification } from '@/services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_DONE_KEY = '@onboarding_done_v1';

const { width: SCREEN_W } = Dimensions.get('window');

interface Step {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    title: '歡迎來到神明占卜',
    subtitle: '台灣傳統神明文化 × 現代 AI 解析\n帶你連結神明智慧，指引人生方向',
    emoji: '🏛️',
  },
  {
    id: 'birthdate',
    title: '設定你的生辰年份',
    subtitle: '讓神明依你的生肖與五行，給予最適合你的指引',
    emoji: '🌟',
  },
  {
    id: 'patron',
    title: '認識你的守護神',
    subtitle: '根據你的生肖，這位神明與你特別有緣',
    emoji: '🙏',
  },
  {
    id: 'notifications',
    title: '開啟每日指引通知',
    subtitle: '每天早晨收到今日籤詩與神明祝福\n讓神明陪伴你迎接新的一天',
    emoji: '🔔',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [birthDate, setBirthDate] = useState('');
  const [selectedGodId, setSelectedGodId] = useState<number | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [completing, setCompleting] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const patronGodId = (() => {
    const year = parseInt(birthDate, 10);
    if (!year || year < 1900) return null;
    const zodiacBranch = ((year - 4) % 12 + 12) % 12;
    const zodiacNames = ['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬'];
    const zodiac = zodiacNames[zodiacBranch];
    const patronMap: Record<string, number> = {
      鼠: 2, 牛: 5, 虎: 2, 兔: 3, 龍: 1, 蛇: 2,
      馬: 1, 羊: 3, 猴: 8, 雞: 8, 狗: 4, 豬: 6,
    };
    return patronMap[zodiac] ?? null;
  })();

  const patronGod = patronGodId ? gods.find(g => g.id === patronGodId) : null;

  const goToStep = (index: number) => {
    setCurrentStep(index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_W, animated: true });
    Animated.timing(progressAnim, {
      toValue: (index + 1) / STEPS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const handleEnableNotif = async () => {
    const granted = await requestPermissions();
    if (granted) {
      await scheduleDailyNotification();
      setNotifEnabled(true);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    const settings = await getSettings() ?? {
      userName: '',
      birthDate: '',
      preferredGodId: 1,
    };
    await saveSettings({
      ...settings,
      birthDate: birthDate || settings.birthDate,
      preferredGodId: selectedGodId ?? patronGodId ?? settings.preferredGodId,
    });
    await AsyncStorage.setItem(ONBOARDING_DONE_KEY, '1');
    router.replace('/' as never);
  };

  const step = STEPS[currentStep];
  const canProceed = currentStep === 0 || currentStep === 3 ||
    (currentStep === 1 && birthDate.length >= 4) ||
    (currentStep === 2 && (selectedGodId !== null || patronGodId !== null));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 進度條 */}
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>

      {/* 步驟指示點 */}
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentStep && styles.dotActive, i < currentStep && styles.dotDone]}
          />
        ))}
      </View>

      {/* 內容 */}
      <View style={styles.stepContent}>
        <Text style={styles.emoji}>{step.emoji}</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.subtitle}>{step.subtitle}</Text>

        {/* Step 1: 生辰年份 */}
        {currentStep === 1 && (
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>出生年份（西元）</Text>
            <TextInput
              style={styles.input}
              value={birthDate}
              onChangeText={text => setBirthDate(text.replace(/\D/g, '').slice(0, 4))}
              placeholder="例：1990"
              placeholderTextColor={TempleTheme.textMuted}
              keyboardType="number-pad"
              maxLength={4}
            />
            {birthDate.length === 4 && patronGod && (
              <View style={styles.patronHint}>
                <Text style={styles.patronHintText}>
                  你的守護神是 {patronGod.name}！下一步為你介紹。
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Step 2: 守護神 */}
        {currentStep === 2 && (
          <View style={styles.godBlock}>
            {patronGod && (
              <View style={styles.patronCard}>
                <Image
                  source={getGodCardImage(patronGod.id)}
                  style={styles.patronImage}
                  contentFit="cover"
                />
                <View style={styles.patronInfo}>
                  <Text style={styles.patronName}>{patronGod.name}</Text>
                  <Text style={styles.patronTagline}>{patronGod.tagline}</Text>
                </View>
              </View>
            )}
            <Text style={styles.godListLabel}>或選擇你最信仰的神明：</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.godList}
            >
              {gods.slice(0, 9).map(g => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.godChip,
                    (selectedGodId ?? patronGodId) === g.id && styles.godChipSelected,
                  ]}
                  onPress={() => setSelectedGodId(g.id)}
                >
                  <Text style={styles.godChipText}>{g.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Step 3: 通知 */}
        {currentStep === 3 && (
          <View style={styles.notifBlock}>
            {notifEnabled ? (
              <View style={styles.notifEnabledCard}>
                <Text style={styles.notifEnabledText}>✓ 每日早晨 8 點將收到今日指引</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.notifBtn} onPress={handleEnableNotif}>
                <Text style={styles.notifBtnText}>🔔 開啟每日通知</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.notifSkip}>可稍後在設定中開啟，按「開始使用」跳過</Text>
          </View>
        )}
      </View>

      {/* 底部按鈕 */}
      <View style={styles.footer}>
        {currentStep < STEPS.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canProceed}
          >
            <Text style={styles.nextBtnText}>下一步</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, completing && styles.nextBtnDisabled]}
            onPress={handleComplete}
            disabled={completing}
          >
            <Text style={styles.nextBtnText}>
              {completing ? '設定中...' : '開始使用'}
            </Text>
          </TouchableOpacity>
        )}
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => goToStep(currentStep - 1)}>
            <Text style={styles.backBtnText}>上一步</Text>
          </TouchableOpacity>
        )}
        {currentStep === 0 && (
          <TouchableOpacity style={styles.skipBtn} onPress={handleComplete}>
            <Text style={styles.skipBtnText}>跳過設定</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  progressBar: {
    height: 3,
    backgroundColor: TempleTheme.goldDark + '33',
    marginHorizontal: TempleSpacing.lg,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: TempleTheme.gold,
    borderRadius: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TempleTheme.goldDark + '44',
  },
  dotActive: { backgroundColor: TempleTheme.gold, width: 20 },
  dotDone: { backgroundColor: TempleTheme.goldDark + '88' },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: TempleSpacing.lg,
    paddingTop: TempleSpacing.xl,
  },
  emoji: { fontSize: 64, marginBottom: TempleSpacing.md },
  title: {
    fontSize: TempleFonts.heading,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: TempleSpacing.lg,
  },
  inputBlock: { width: '100%', gap: 10 },
  inputLabel: { color: TempleTheme.textLight, fontWeight: '700', fontSize: TempleFonts.small },
  input: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '55',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: TempleTheme.textLight,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 4,
  },
  patronHint: {
    backgroundColor: TempleTheme.goldDark + '22',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: TempleTheme.gold + '44',
  },
  patronHintText: { color: TempleTheme.gold, fontWeight: '700', textAlign: 'center' },
  godBlock: { width: '100%', gap: 12 },
  patronCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '44',
    padding: TempleSpacing.md,
    alignItems: 'center',
  },
  patronImage: { width: 56, height: 72, borderRadius: 8 },
  patronInfo: { flex: 1 },
  patronName: { color: TempleTheme.gold, fontWeight: '900', fontSize: 16 },
  patronTagline: { color: TempleTheme.textMuted, fontSize: 12, marginTop: 4, lineHeight: 18 },
  godListLabel: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
  },
  godList: { gap: 8, paddingBottom: 4 },
  godChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '44',
    backgroundColor: TempleTheme.bgCard,
  },
  godChipSelected: {
    borderColor: TempleTheme.gold,
    backgroundColor: TempleTheme.goldDark + '33',
  },
  godChipText: { color: TempleTheme.textLight, fontSize: 13 },
  notifBlock: { width: '100%', gap: 12, alignItems: 'center' },
  notifBtn: {
    backgroundColor: TempleTheme.goldDark + '44',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: TempleTheme.gold + '66',
  },
  notifBtnText: { color: TempleTheme.gold, fontWeight: '900', fontSize: TempleFonts.body },
  notifEnabledCard: {
    backgroundColor: '#2d5a2d55',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#4caf5066',
  },
  notifEnabledText: { color: '#81c784', fontWeight: '700', fontSize: TempleFonts.body },
  notifSkip: { color: TempleTheme.textMuted, fontSize: 12, textAlign: 'center' },
  footer: {
    padding: TempleSpacing.md,
    paddingBottom: 32,
    gap: 10,
  },
  nextBtn: {
    backgroundColor: TempleTheme.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { color: TempleTheme.bgDark, fontWeight: '900', fontSize: TempleFonts.body },
  backBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '44',
  },
  backBtnText: { color: TempleTheme.textMuted, fontSize: TempleFonts.body },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipBtnText: { color: TempleTheme.textMuted, fontSize: 13 },
});
