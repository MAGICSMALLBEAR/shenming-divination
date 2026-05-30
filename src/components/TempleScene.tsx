// 廟宇場景背景 - Jiaobei / 冥想時顯示
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { TempleTheme } from '@/constants/temple-theme';

const { width } = Dimensions.get('window');

export function TempleScene() {
  const lanternSwing = useRef(new Animated.Value(0)).current;
  const candleFlicker1 = useRef(new Animated.Value(1)).current;
  const candleFlicker2 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // 燈籠搖擺
    Animated.loop(
      Animated.sequence([
        Animated.timing(lanternSwing, { toValue: 1, duration: 2500, useNativeDriver: false }),
        Animated.timing(lanternSwing, { toValue: -1, duration: 2500, useNativeDriver: false }),
      ])
    ).start();

    // 燭火搖曳
    Animated.loop(
      Animated.sequence([
        Animated.timing(candleFlicker1, { toValue: 0.6, duration: 150, useNativeDriver: false }),
        Animated.timing(candleFlicker1, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.timing(candleFlicker1, { toValue: 0.8, duration: 100, useNativeDriver: false }),
        Animated.timing(candleFlicker1, { toValue: 1, duration: 300, useNativeDriver: false }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(candleFlicker2, { toValue: 1, duration: 180, useNativeDriver: false }),
        Animated.timing(candleFlicker2, { toValue: 0.5, duration: 120, useNativeDriver: false }),
        Animated.timing(candleFlicker2, { toValue: 0.9, duration: 250, useNativeDriver: false }),
        Animated.timing(candleFlicker2, { toValue: 0.7, duration: 180, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const lanternRotate = lanternSwing.interpolate({
    inputRange: [-1, 1], outputRange: ['-8deg', '8deg'],
  });

  return (
    <View style={styles.scene} pointerEvents="none">
      {/* 屋頂輪廓 */}
      <View style={styles.roof}>
        <View style={styles.roofLeft} />
        <View style={styles.roofRight} />
        <View style={styles.roofRidge} />
      </View>

      {/* 紅柱 */}
      <View style={[styles.pillar, { left: width * 0.08 }]} />
      <View style={[styles.pillar, { right: width * 0.08 }]} />

      {/* 懸掛燈籠（左） */}
      <View style={[styles.lanternWire, { left: width * 0.18 }]}>
        <Animated.View style={[styles.lantern, styles.lanternLeft, { transform: [{ rotate: lanternRotate as any }] }]}>
          <View style={styles.lanternBody} />
          <View style={styles.lanternTassel} />
        </Animated.View>
      </View>

      {/* 懸掛燈籠（右） */}
      <View style={[styles.lanternWire, { right: width * 0.18 }]}>
        <Animated.View style={[styles.lantern, styles.lanternRight, { transform: [{ rotate: lanternRotate as any }] }]}>
          <View style={styles.lanternBody} />
          <View style={styles.lanternTassel} />
        </Animated.View>
      </View>

      {/* 燭台（左） */}
      <View style={[styles.candleHolder, { left: width * 0.12 }]}>
        <Animated.View style={[styles.flame, { opacity: candleFlicker1 }]} />
        <View style={styles.candleStick} />
      </View>

      {/* 燭台（右） */}
      <View style={[styles.candleHolder, { right: width * 0.12 }]}>
        <Animated.View style={[styles.flame, { opacity: candleFlicker2 }]} />
        <View style={styles.candleStick} />
      </View>

      {/* 地面 */}
      <View style={styles.floor} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  roof: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 40,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
  },
  roofLeft: {
    width: '50%', height: 36, backgroundColor: TempleTheme.red + '40',
    borderTopLeftRadius: 8, transform: [{ skewX: '20deg' }],
  },
  roofRight: {
    width: '50%', height: 36, backgroundColor: TempleTheme.red + '40',
    borderTopRightRadius: 8, transform: [{ skewX: '-20deg' }],
  },
  roofRidge: {
    position: 'absolute', bottom: 0, width: '60%', height: 6,
    backgroundColor: TempleTheme.goldDark + '60', borderRadius: 3,
  },
  pillar: {
    position: 'absolute', top: 40, bottom: 80,
    width: 14, backgroundColor: TempleTheme.red + '35', borderRadius: 7,
  },
  lanternWire: {
    position: 'absolute', top: 30, width: 1,
    backgroundColor: TempleTheme.goldDark + '50', height: 50,
    alignItems: 'center',
  },
  lantern: { position: 'absolute', top: 20, alignItems: 'center' },
  lanternLeft: {},
  lanternRight: {},
  lanternBody: {
    width: 22, height: 32, backgroundColor: TempleTheme.red + '70',
    borderRadius: 11, borderWidth: 1, borderColor: TempleTheme.goldDark + '60',
  },
  lanternTassel: {
    width: 2, height: 12, backgroundColor: TempleTheme.goldDark + '60',
    borderRadius: 1, marginTop: 2,
  },
  candleHolder: {
    position: 'absolute', bottom: 85, alignItems: 'center',
  },
  flame: {
    width: 10, height: 16, backgroundColor: '#FFD700',
    borderRadius: 5, borderBottomLeftRadius: 1, borderBottomRightRadius: 1,
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8,
  },
  candleStick: {
    width: 8, height: 40, backgroundColor: '#F5F5DC',
    borderRadius: 4, borderWidth: 1, borderColor: '#D2B48C' + '60',
  },
  floor: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
    backgroundColor: TempleTheme.bgCard + '40',
    borderTopWidth: 2, borderTopColor: TempleTheme.goldDark + '20',
  },
});
