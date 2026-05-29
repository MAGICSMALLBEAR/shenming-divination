// 香煙裊裊背景動畫
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { TempleTheme } from '@/constants/temple-theme';

const { width } = Dimensions.get('window');
const PARTICLE_COUNT = 12;

interface Particle {
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export function IncenseSmoke() {
  // 產生穩定不變的粒子配置
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: width * 0.15 + (i / PARTICLE_COUNT) * width * 0.7 + (Math.random() - 0.5) * 40,
      delay: Math.random() * 4000,
      duration: 3000 + Math.random() * 4000,
      size: 20 + Math.random() * 40,
    }));
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => (
        <SmokeParticle key={i} {...p} />
      ))}
    </View>
  );
}

function SmokeParticle({ x, delay, duration, size }: Particle) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.15,
            duration: duration * 0.3,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(scale, {
            toValue: 1.5,
            duration: duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(translateY, {
            toValue: -200,
            duration: duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.4,
            easing: Easing.in(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
        Animated.delay(1000 + Math.random() * 2000),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          width: size,
          height: size * 1.5,
          borderRadius: size / 2,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: TempleTheme.goldDark + '40',
  },
});
