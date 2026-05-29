// 抽籤動畫元件
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { playDrawSound } from '@/services/proceduralSound';

export function DrawAnimation() {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    playDrawSound();
    const shake = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 120, easing: Easing.linear, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 120, easing: Easing.linear, useNativeDriver: false }),
      ]),
      { iterations: 5 }
    );

    shake.start();
    return () => shake.stop();
  }, []);

  const translateX = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-25, 25],
  });

  const rotate = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-8deg', '8deg'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>抽籤中</Text>
      <Text style={styles.subtitle}>籤筒搖晃，神靈指引...</Text>

      <Animated.View
        style={[styles.qiantong, { transform: [{ translateX }, { rotate }] }]}
      >
        <Text style={styles.qiantongText}>籤</Text>
      </Animated.View>

      <View style={styles.fallingPoem}>
        <View style={styles.fallingStick}>
          <Text style={styles.fallingText}>第 ? 籤</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: TempleSpacing.lg,
  },
  title: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    marginBottom: TempleSpacing.xs,
  },
  subtitle: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    marginBottom: TempleSpacing.xxl,
  },
  qiantong: {
    width: 100,
    height: 140,
    backgroundColor: '#8B4513',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#5C3D1A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    marginBottom: TempleSpacing.lg,
  },
  qiantongText: {
    fontSize: 40,
    fontWeight: '900',
    color: TempleTheme.goldLight,
  },
  fallingPoem: {
    position: 'absolute',
    bottom: '30%',
  },
  fallingStick: {
    backgroundColor: TempleTheme.bgLight,
    paddingHorizontal: TempleSpacing.lg,
    paddingVertical: TempleSpacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D2B48C',
    transform: [{ rotate: '15deg' }],
  },
  fallingText: {
    fontSize: TempleFonts.body,
    color: '#8B4513',
    fontWeight: '700',
  },
});
