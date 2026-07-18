import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { setItem } from '@/services/storage';

const ONBOARDING_KEY = '@divination_onboarded';

export async function hasOnboarded(): Promise<boolean> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function markOnboarded(): Promise<void> {
  await setItem(ONBOARDING_KEY, 'true');
}

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: '🙏',
    title: '選一位神明，帶著問題來',
    body: '從九位台灣常見神明中選擇你最常參拜或最契合你問題的神明。越聚焦的問題，籤意越容易讀懂。',
  },
  {
    icon: '🧘',
    title: '莊嚴求籤流程',
    body: '上香致敬 → 靜心冥想 → 擲筊請示 → 抽籤揭示。每一步都有音效、動畫輔助，彷彿身在廟中。\n\n部分神明使用報數占卜（如諸葛神數），請輸入心中所想數字。',
  },
  {
    icon: '✨',
    title: 'AI 解籤與追問',
    body: '抽到籤詩後，AI 會為你詳細解讀籤意，並給出當下可做的三步建議。你還可以繼續追問細節，深入理解籤詩指引。',
  },
  {
    icon: '📊',
    title: '更多功能',
    body: '• 收藏與回顧：追蹤籤詩應驗狀況\n• 願望清單：將籤詩建議設為待辦願望\n• 每日運勢：依八字計算當日五行運勢\n• AI 對話：延續籤詩脈絡深入問答',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const isCompact = width < 420;
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = async () => {
    if (isLast) {
      await markOnboarded();
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* 進度指示器 */}
      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < step && styles.dotDone,
              i === step && styles.dotActive,
              i === step && isCompact && styles.dotActiveCompact,
            ]}
          />
        ))}
      </View>

      {/* 主圖 */}
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{current.icon}</Text>
      </View>

      {/* 文字 */}
      <Text style={styles.title}>{current.title}</Text>
      <Text style={styles.body}>{current.body}</Text>

      {/* 按鈕 */}
      <View style={[styles.btnRow, isCompact && styles.btnRowCompact]}>
        {step > 0 && !isCompact && (
          <TouchableOpacity style={styles.prevBtn} onPress={() => setStep((s) => s - 1)}>
            <Text style={styles.prevBtnText}>← 上一步</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.nextBtn, isCompact && styles.nextBtnFull]} onPress={handleNext}>
          <Text style={styles.nextBtnText}>{isLast ? '開始使用' : '下一步 →'}</Text>
        </TouchableOpacity>
      </View>

      {/* 略過（僅非最後一步顯示 desktop） */}
      {!isLast && !isCompact && (
        <TouchableOpacity style={styles.skipBtn} onPress={async () => { await markOnboarded(); onComplete(); }}>
          <Text style={styles.skipBtnText}>略過導覽，直接開始</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: TempleSpacing.xl,
    paddingVertical: TempleSpacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: TempleSpacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.goldDark + '40',
  },
  dotDone: {
    backgroundColor: theme.goldDark,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.gold,
  },
  dotActiveCompact: {
    width: 20,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.goldDark + '18',
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: TempleSpacing.lg,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: TempleFonts.title,
    fontWeight: '900',
    color: theme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.md,
  },
  body: {
    fontSize: TempleFonts.body,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 420,
  },
  btnRow: {
    flexDirection: 'row',
    gap: TempleSpacing.md,
    marginTop: TempleSpacing.xl,
  },
  btnRowCompact: {
    width: '100%',
    flexDirection: 'column',
  },
  prevBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
    backgroundColor: theme.bgCard,
  },
  prevBtnText: {
    fontSize: TempleFonts.body,
    color: theme.textMuted,
  },
  nextBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.red,
    minWidth: 160,
    alignItems: 'center',
  },
  nextBtnFull: {
    width: '100%',
  },
  nextBtnText: {
    fontSize: TempleFonts.body,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  skipBtn: {
    marginTop: TempleSpacing.lg,
    paddingVertical: 8,
  },
  skipBtnText: {
    fontSize: 13,
    color: theme.textMuted,
  },
  });
}
