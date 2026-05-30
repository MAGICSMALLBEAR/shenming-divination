// 擲筊元件 - 含 spring 彈跳動畫 + 三聖筊模式
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { playTossSound, playShengbeiSound, vibrateLight } from '@/services/proceduralSound';
import type { JiaobeiResult } from '@/services/divination';
import { ParticleEffect } from './ParticleEffect';

interface JiaobeiProps {
  onToss: () => JiaobeiResult;
  onShengbei: () => void;
  results: JiaobeiResult[];
  strictMode?: boolean;
}

export function Jiaobei({ onToss, onShengbei, results, strictMode }: JiaobeiProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [currentResult, setCurrentResult] = React.useState<JiaobeiResult | null>(null);
  const [showParticle, setShowParticle] = React.useState(false);
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const resultFade = useRef(new Animated.Value(0)).current;
  const strictCount = results.filter(r => r === 'shengbei').length;

  const handleToss = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentResult(null);
    resultFade.setValue(0);
    vibrateLight();

    // Spring 彈跳動畫
    jumpAnim.setValue(0);
    Animated.sequence([
      Animated.timing(jumpAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.spring(jumpAnim, { toValue: 0, friction: 4, tension: 60, useNativeDriver: false }),
    ]).start(async () => {
      const result = onToss();
      setCurrentResult(result);
      if (result === 'shengbei') {
        await playShengbeiSound();
        setShowParticle(true);
        setTimeout(() => setShowParticle(false), 1000);
      } else {
        await playTossSound();
      }

      Animated.spring(resultFade, { toValue: 1, friction: 6, tension: 40, useNativeDriver: false }).start(() => {
        setIsAnimating(false);
        if (result === 'shengbei' && !(strictMode && strictCount < 2)) {
          setTimeout(onShengbei, 800);
        }
      });
    });
  };

  const translateY = jumpAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -140, 0] });
  const rotate = jumpAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '540deg', '360deg'] });
  const scale = jumpAnim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 1.15, 1] });

  const getResultInfo = (result: JiaobeiResult) => {
    switch (result) {
      case 'shengbei': return { text: '聖筊', emoji: '⛩️', desc: '一平一凸 · 神明應允', color: TempleTheme.success };
      case 'xiaobei': return { text: '笑筊', emoji: '😊', desc: '兩平向上 · 請再誠心默念', color: TempleTheme.warning };
      case 'yinbei': return { text: '陰筊', emoji: '🙏', desc: '兩凸向上 · 請再誠心祈求', color: TempleTheme.danger };
    }
  };

  const resultInfo = currentResult ? getResultInfo(currentResult) : null;
  const strictComplete = strictMode && strictCount >= 2 && currentResult === 'shengbei';

  return (
    <View style={styles.container}>
      <ParticleEffect active={showParticle} type="gold" />
      <Text style={styles.title}>擲筊請示</Text>
      <Text style={styles.attemptText}>
        第 {results.length + 1} 次擲筊
        {strictMode && <Text style={styles.strictHint}>　⛩️ {strictCount + (currentResult === 'shengbei' ? 1 : 0)}/3</Text>}
      </Text>

      <View style={styles.jiaobeiArea}>
        <Animated.View style={[styles.jiaobeiPair, { transform: [{ translateY }, { rotate }, { scale }] }]}>
          <View style={styles.jiaobeiPiece}><Text style={styles.jiaobeiText}>聖</Text></View>
          <View style={[styles.jiaobeiPiece, styles.jiaobeiPieceSecond]}><Text style={styles.jiaobeiText}>筊</Text></View>
        </Animated.View>

        {resultInfo && (
          <Animated.View style={[styles.resultContainer, { opacity: resultFade, transform: [{ scale: resultFade.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }]}>
            <Text style={styles.resultEmoji}>{resultInfo.emoji}</Text>
            <Text style={[styles.resultText, { color: resultInfo.color }]}>{resultInfo.text}</Text>
            <Text style={styles.resultDesc}>{resultInfo.desc}</Text>
            {strictMode && strictComplete && <Text style={styles.strictCompleteText}>🎉 三聖筊圓滿！</Text>}
            {currentResult !== 'shengbei' && !isAnimating && (
              <TouchableOpacity style={styles.retryBtn} onPress={handleToss}>
                <Text style={styles.retryBtnText}>重新擲筊</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </View>

      {!currentResult && !isAnimating && (
        <TouchableOpacity style={styles.tossBtn} onPress={handleToss}>
          <Text style={styles.tossBtnText}>擲筊</Text>
        </TouchableOpacity>
      )}
      {strictMode && currentResult === 'shengbei' && !isAnimating && !strictComplete && (
        <TouchableOpacity style={styles.nextTossBtn} onPress={handleToss}>
          <Text style={styles.nextTossBtnText}>繼續擲筊（{strictCount + 1}/3）</Text>
        </TouchableOpacity>
      )}
      {strictComplete && !isAnimating && (
        <TouchableOpacity style={styles.drawBtn} onPress={onShengbei}>
          <Text style={styles.drawBtnText}>⛩️ 抽籤</Text>
        </TouchableOpacity>
      )}
      {results.length > 0 && (
        <View style={styles.historyStrip}>
          {results.map((r, i) => {
            const info = getResultInfo(r);
            return (
              <View key={i} style={styles.historyItem}>
                <Text style={styles.historyEmoji}>{i + 1}</Text>
                <Text style={[styles.historyText, { color: info.color }]}>{info.text}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: TempleSpacing.md },
  title: { fontSize: TempleFonts.subtitle, fontWeight: '700', color: TempleTheme.goldLight, marginBottom: TempleSpacing.xs },
  attemptText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, marginBottom: TempleSpacing.lg },
  strictHint: { color: TempleTheme.gold, fontWeight: '700' },
  jiaobeiArea: { height: 220, justifyContent: 'center', alignItems: 'center', marginBottom: TempleSpacing.lg },
  jiaobeiPair: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  jiaobeiPiece: {
    width: 56, height: 72, backgroundColor: '#D4A76A', borderRadius: 28,
    borderWidth: 2, borderColor: '#8B6914', justifyContent: 'center', alignItems: 'center',
    transform: [{ rotate: '-5deg' }],
  },
  jiaobeiPieceSecond: { transform: [{ rotate: '5deg' }] },
  jiaobeiText: { fontSize: 18, fontWeight: '900', color: '#5C3D1A' },
  resultContainer: {
    alignItems: 'center', backgroundColor: TempleTheme.bgCard,
    paddingHorizontal: TempleSpacing.xl, paddingVertical: TempleSpacing.md,
    borderRadius: 16, borderWidth: 1, borderColor: TempleTheme.goldDark + '40',
  },
  resultEmoji: { fontSize: 40, marginBottom: TempleSpacing.xs },
  resultText: { fontSize: TempleFonts.subtitle, fontWeight: '900', marginBottom: TempleSpacing.xs },
  resultDesc: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, textAlign: 'center', marginBottom: TempleSpacing.sm },
  retryBtn: {
    paddingHorizontal: TempleSpacing.lg, paddingVertical: TempleSpacing.sm, borderRadius: 8,
    backgroundColor: TempleTheme.warning + '20', borderWidth: 1, borderColor: TempleTheme.warning,
  },
  retryBtnText: { color: TempleTheme.warning, fontWeight: '600' },
  tossBtn: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: TempleTheme.red,
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: TempleTheme.goldDark,
  },
  tossBtnText: { fontSize: TempleFonts.heading, fontWeight: '900', color: TempleTheme.goldLight },
  strictCompleteText: { fontSize: TempleFonts.small, color: TempleTheme.gold, fontWeight: '700', marginTop: TempleSpacing.xs },
  nextTossBtn: {
    paddingHorizontal: TempleSpacing.xl, paddingVertical: TempleSpacing.sm, borderRadius: 10,
    backgroundColor: TempleTheme.goldDark + '30', borderWidth: 1, borderColor: TempleTheme.gold,
  },
  nextTossBtnText: { fontSize: TempleFonts.body, color: TempleTheme.goldLight, fontWeight: '700' },
  drawBtn: {
    paddingHorizontal: TempleSpacing.xxl, paddingVertical: TempleSpacing.md, borderRadius: 16,
    backgroundColor: TempleTheme.red, borderWidth: 2, borderColor: TempleTheme.gold,
  },
  drawBtnText: { fontSize: TempleFonts.heading, fontWeight: '900', color: TempleTheme.goldLight },
  historyStrip: { flexDirection: 'row', gap: TempleSpacing.md, marginTop: TempleSpacing.md },
  historyItem: {
    alignItems: 'center', backgroundColor: TempleTheme.bgCard,
    paddingHorizontal: TempleSpacing.sm, paddingVertical: TempleSpacing.xs,
    borderRadius: 8, borderWidth: 1, borderColor: TempleTheme.goldDark + '20',
  },
  historyEmoji: { fontSize: 12, color: TempleTheme.textMuted },
  historyText: { fontSize: 11, fontWeight: '600' },
});
