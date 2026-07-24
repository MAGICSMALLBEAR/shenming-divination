// 骨架屏元件 — 用於內容載入中的佔位動畫
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { TempleSpacing } from '@/constants/temple-theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/** 單一骨架區塊（閃爍效果） */
export function SkeletonBlock({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const { theme } = useAppTheme();

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.4] });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.textMuted,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** 神明卡片骨架 */
export function GodCardSkeleton() {
  const { theme } = useAppTheme();
  return (
    <View style={[_styles.card, { backgroundColor: theme.bgCard, borderColor: theme.goldDark + '30' }]}>
      <SkeletonBlock height={140} borderRadius={14} />
      <View style={_styles.cardInfo}>
        <SkeletonBlock width="60%" height={12} />
        <SkeletonBlock width="85%" height={18} style={{ marginTop: 6 }} />
        <SkeletonBlock width="40%" height={10} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

/** 籤詩卡片骨架 */
export function PoemCardSkeleton() {
  const { theme } = useAppTheme();
  return (
    <View style={[_styles.poemCard, { backgroundColor: theme.bgCard, borderColor: theme.goldDark + '30' }]}>
      <SkeletonBlock width="50%" height={24} borderRadius={12} />
      <SkeletonBlock width="80%" height={14} style={{ marginTop: 12 }} />
      <SkeletonBlock width="90%" height={14} style={{ marginTop: 8 }} />
      <SkeletonBlock width="70%" height={14} style={{ marginTop: 8 }} />
      <SkeletonBlock width="40%" height={14} style={{ marginTop: 8 }} />
    </View>
  );
}

/** 列表項目骨架（用於收藏/每日運勢等） */
export function ListItemSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <View style={_styles.listItem}>
      <SkeletonBlock width="30%" height={14} />
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBlock key={i} width={`${85 - i * 10}%`} height={12} style={{ marginTop: 8 }} />
      ))}
    </View>
  );
}

const _styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: TempleSpacing.sm,
    marginBottom: TempleSpacing.cardGap,
  },
  cardInfo: {
    paddingTop: TempleSpacing.sm,
    gap: 2,
  },
  poemCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: TempleSpacing.lg,
    marginBottom: TempleSpacing.md,
  },
  listItem: {
    paddingVertical: TempleSpacing.md,
    paddingHorizontal: TempleSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
});
