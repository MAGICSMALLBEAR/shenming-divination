// 煙火慶祝特效 - 上上籤 / 大吉 時觸發
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface BurstConfig {
  x: number;
  y: number;
  colors: string[];
  delay: number;
}

interface FireworksEffectProps {
  active: boolean;
}

const BURSTS_CONFIG: BurstConfig[] = [
  { x: 0.25, y: 0.25, colors: ['#FFD700', '#FFA500', '#FF6347'], delay: 0 },
  { x: 0.75, y: 0.20, colors: ['#FF69B4', '#FF1493', '#C71585'], delay: 300 },
  { x: 0.50, y: 0.15, colors: ['#00BFFF', '#1E90FF', '#4169E1'], delay: 150 },
  { x: 0.15, y: 0.35, colors: ['#7CFC00', '#32CD32', '#228B22'], delay: 450 },
  { x: 0.85, y: 0.30, colors: ['#FF4500', '#FF6347', '#FFD700'], delay: 600 },
];

export function FireworksEffect({ active }: FireworksEffectProps) {
  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {BURSTS_CONFIG.map((b, i) => (
        <BurstView key={i} config={b} />
      ))}
    </View>
  );
}

const SPARK_COUNT = 16;

function BurstView({ config }: { config: BurstConfig }) {
  const sparks = useMemo(() =>
    Array.from({ length: SPARK_COUNT }, (_, i) => ({
      angle: (i / SPARK_COUNT) * Math.PI * 2,
      length: 30 + Math.random() * 50,
      color: config.colors[i % config.colors.length],
      delay: config.delay + Math.random() * 80,
    })), []);

  return (
    <View style={[styles.burst, { left: width * config.x, top: height * config.y }]}>
      {sparks.map((s, i) => <Spark key={i} spark={s} />)}
    </View>
  );
}

function Spark({ spark }: { spark: { angle: number; length: number; color: string; delay: number } }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(spark.delay),
      Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: false }),
    ]).start();
  }, []);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(spark.angle) * spark.length] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(spark.angle) * spark.length + 40] });
  const opacity = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 0.9, 0] });
  const scaleY = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 1.5, 0.2] });

  return (
    <Animated.View
      style={[
        styles.spark,
        {
          backgroundColor: spark.color,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { rotate: `${spark.angle}rad` },
            { scaleY },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },
  burst: {
    position: 'absolute',
    width: 0,
    height: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spark: {
    position: 'absolute',
    width: 4,
    height: 12,
    borderRadius: 2,
  },
});
