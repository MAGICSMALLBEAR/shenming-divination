// 金色粒子爆炸特效 - 聖筊 / 上上籤觸發
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const PARTICLE_COUNT = 24;

interface Particle {
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
}

interface ParticleEffectProps {
  active: boolean;
  type?: 'gold' | 'rainbow';
  onDone?: () => void;
}

const GOLD_COLORS = ['#FFD700', '#FFC200', '#FFAA00', '#FFF0A0', '#C9A96E', '#FFE44D'];
const RAINBOW_COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6BD6', '#FFAA00'];

export function ParticleEffect({ active, type = 'gold', onDone }: ParticleEffectProps) {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (i / PARTICLE_COUNT) * Math.PI * 2,
      distance: 80 + Math.random() * 120,
      size: 6 + Math.random() * 8,
      color: type === 'rainbow'
        ? RAINBOW_COLORS[i % RAINBOW_COLORS.length]
        : GOLD_COLORS[i % GOLD_COLORS.length],
      delay: Math.random() * 100,
    })), [type]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => (
        <ParticleItem key={i} particle={p} onDone={i === 0 ? onDone : undefined} />
      ))}
    </View>
  );
}

function ParticleItem({ particle, onDone }: { particle: Particle; onDone?: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(particle.delay),
      Animated.timing(progress, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => onDone?.());
  }, []);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.cos(particle.angle) * particle.distance],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.sin(particle.angle) * particle.distance],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [1, 1, 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 1.3, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  particle: {
    position: 'absolute',
  },
});
