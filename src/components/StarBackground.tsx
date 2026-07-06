// 星空金箔飄落背景
import React, { useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

const { width, height } = Dimensions.get('window');
const STAR_COUNT = 30;
const FLAKE_COUNT = 8;

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDuration: number;
}

interface Flake {
  x: number;
  size: number;
  duration: number;
  delay: number;
}

export function StarBackground() {
  const stars = useMemo<Star[]>(() =>
    Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 3,
      opacity: 0.2 + Math.random() * 0.5,
      twinkleDuration: 1500 + Math.random() * 3000,
    })), []);

  const flakes = useMemo<Flake[]>(() =>
    Array.from({ length: FLAKE_COUNT }, () => ({
      x: Math.random() * width,
      size: 4 + Math.random() * 8,
      duration: 6000 + Math.random() * 8000,
      delay: Math.random() * 5000,
    })), []);

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((s, i) => <TwinkleStar key={`s${i}`} star={s} />)}
      {flakes.map((f, i) => <GoldFlake key={`f${i}`} flake={f} />)}
    </View>
  );
}

function TwinkleStar({ star }: { star: Star }) {
  const opacity = useRef(new Animated.Value(star.opacity)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: star.opacity * 0.2, duration: star.twinkleDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(opacity, { toValue: star.opacity, duration: star.twinkleDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: star.x,
        top: star.y,
        width: star.size,
        height: star.size,
        borderRadius: star.size / 2,
        backgroundColor: '#FFFFFF',
        opacity,
      }}
    />
  );
}

function GoldFlake({ flake }: { flake: Flake }) {
  const { theme } = useAppTheme();
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      translateY.setValue(-20);
      translateX.setValue(0);
      rotate.setValue(0);
      opacity.setValue(0);

      Animated.sequence([
        Animated.delay(flake.delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: height + 40, duration: flake.duration, easing: Easing.linear, useNativeDriver: false }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.7, duration: 500, useNativeDriver: false }),
            Animated.timing(opacity, { toValue: 0.7, duration: flake.duration - 1000, useNativeDriver: false }),
            Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: false }),
          ]),
          Animated.loop(
            Animated.sequence([
              Animated.timing(translateX, { toValue: 20, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
              Animated.timing(translateX, { toValue: -20, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            ])
          ),
          Animated.timing(rotate, { toValue: 1, duration: flake.duration, easing: Easing.linear, useNativeDriver: false }),
        ]),
      ]).start(() => setTimeout(run, Math.random() * 3000));
    };
    run();
  }, []);

  const rotateStr = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: flake.x,
        top: 0,
        width: flake.size,
        height: flake.size,
        backgroundColor: theme.goldLight,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate: rotateStr as any }],
        borderRadius: 1,
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
  },
});
