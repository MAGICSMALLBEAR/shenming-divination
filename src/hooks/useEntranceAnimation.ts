// 通用進場動畫 hook — 支援 fade-in、stagger、骨架屏
import { useEffect, useRef, useMemo } from 'react';
import { Animated, Easing } from 'react-native';
import { TempleDuration } from '@/constants/temple-theme';

/** 單一元素 fade-in + slide-up */
export function useFadeIn({
  delay = 0,
  duration = TempleDuration.normal,
  distance = 12,
  disabled = false,
} = {}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    if (disabled) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, disabled, duration, opacity, translateY]);

  return { opacity, translateY };
}

/** 列表 stagger：每個子項依序進場 */
export function useStaggeredList({
  itemCount,
  staggerDelay = 80,
  baseDelay = 0,
  disabled = false,
}: { itemCount: number; staggerDelay?: number; baseDelay?: number; disabled?: boolean }) {
  return useMemo(
    () =>
      Array.from({ length: itemCount }, (_, i) => ({
        delay: disabled ? 0 : baseDelay + i * staggerDelay,
        disabled,
      })),
    [itemCount, staggerDelay, baseDelay, disabled]
  );
}

/** 按鈕按下縮放回饋 */
export function usePressScale(scaleAmount = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: scaleAmount,
      friction: 14,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 8,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return { scale, onPressIn, onPressOut };
}

/** 骨架屏閃爍 */
export function useShimmer() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.4],
  });

  return shimmerOpacity;
}
