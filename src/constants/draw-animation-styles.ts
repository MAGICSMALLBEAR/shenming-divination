import {
  ritualStyleOrder,
  ritualStyles,
  type RitualStyleKey,
} from '@/constants/ritual-styles';

export type DrawAnimationMode = 'random' | 'fixed';
export type DrawAnimationStyleKey = RitualStyleKey;

export interface DrawAnimationStyleDefinition {
  key: DrawAnimationStyleKey;
  label: string;
  summary: string;
  motion: {
    shakeAmplitude: number;
    shakeDuration: number;
    shakeIterations: number;
    floatDistance: number;
    liftDistance: number;
    dropDistance: number;
    flashScale: number;
    paperRotateStart: string;
  };
}

export const drawAnimationStyleOrder: DrawAnimationStyleKey[] = ritualStyleOrder;

export const drawAnimationStyles: Record<DrawAnimationStyleKey, DrawAnimationStyleDefinition> = {
  bronze: {
    key: 'bronze',
    label: '青銅龍紋',
    summary: '厚重、莊嚴，籤筒晃動幅度較明顯，像大廟請示。',
    motion: {
      shakeAmplitude: 20,
      shakeDuration: 88,
      shakeIterations: 12,
      floatDistance: 7,
      liftDistance: -64,
      dropDistance: 112,
      flashScale: 1.52,
      paperRotateStart: '82deg',
    },
  },
  celadon: {
    key: 'celadon',
    label: '青瓷蓮紋',
    summary: '溫柔、安定，動作較緩，適合觀音、醫藥與平安感。',
    motion: {
      shakeAmplitude: 10,
      shakeDuration: 150,
      shakeIterations: 8,
      floatDistance: 4,
      liftDistance: -50,
      dropDistance: 92,
      flashScale: 1.26,
      paperRotateStart: '58deg',
    },
  },
  cinnabar: {
    key: 'cinnabar',
    label: '朱漆寺廟',
    summary: '熱鬧、節慶，籤枝彈出更快，金光與紅漆感更強。',
    motion: {
      shakeAmplitude: 24,
      shakeDuration: 68,
      shakeIterations: 14,
      floatDistance: 9,
      liftDistance: -72,
      dropDistance: 122,
      flashScale: 1.62,
      paperRotateStart: '88deg',
    },
  },
  ebony: {
    key: 'ebony',
    label: '黑檀描金',
    summary: '沉穩、內斂，黑檀木紋與描金細節帶出莊重儀式感。',
    motion: {
      shakeAmplitude: 16, shakeDuration: 105, shakeIterations: 11, floatDistance: 5,
      liftDistance: -62, dropDistance: 104, flashScale: 1.38, paperRotateStart: '70deg',
    },
  },
  jade: {
    key: 'jade',
    label: '白玉蓮華',
    summary: '清雅、柔和，白玉蓮華與金邊呈現澄澈平安感。',
    motion: {
      shakeAmplitude: 9, shakeDuration: 145, shakeIterations: 8, floatDistance: 4,
      liftDistance: -54, dropDistance: 94, flashScale: 1.24, paperRotateStart: '54deg',
    },
  },
};

export function normalizeDrawAnimationMode(value?: string | null): DrawAnimationMode {
  return value === 'fixed' ? 'fixed' : 'random';
}

// 搖籤筒互動方式：drag = 手指拖曳搖晃，hold = 按住不放累積搖晃能量
export type ShakeMode = 'drag' | 'hold';

export function normalizeShakeMode(value?: string | null): ShakeMode {
  return value === 'hold' ? 'hold' : 'drag';
}

export function normalizeDrawAnimationStyleKey(
  value?: string | null,
  fallback: DrawAnimationStyleKey = 'bronze'
): DrawAnimationStyleKey {
  return drawAnimationStyleOrder.includes(value as DrawAnimationStyleKey)
    ? (value as DrawAnimationStyleKey)
    : fallback;
}

export function pickRandomDrawAnimationStyleKey(seed = Date.now()): DrawAnimationStyleKey {
  const index = Math.abs(seed) % drawAnimationStyleOrder.length;
  return drawAnimationStyleOrder[index];
}

export function getDrawAnimationRitualStyle(key: DrawAnimationStyleKey) {
  return ritualStyles[key];
}
