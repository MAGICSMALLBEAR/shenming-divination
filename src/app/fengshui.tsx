// 風水羅盤 — 互動式羅盤，查看各方位卦象、五行、吉凶
// Web：拖曳旋轉羅盤；Native：可透過 DeviceMotion（若可用）或手動拖曳
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DecorativeBg } from '@/components/DecorativeBg';
import { TempleFonts, TempleSpacing, TempleDuration } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFadeIn, useStaggeredList } from '@/hooks/useEntranceAnimation';
import { useI18n } from '@/hooks/useI18n';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import {
  getDirection,
  getDailyDirection,
  getAllDirections,
  type DirectionResult,
  type DailyDirection,
} from '@/services/fengshuiCompass';
import type { ThemeColors } from '@/constants/themes';

/** 從觸控點計算相對羅盤中心的角度（0=正上方=北，順時針） */
function angleFromPoints(
  centerX: number,
  centerY: number,
  touchX: number,
  touchY: number
): number {
  const dx = touchX - centerX;
  const dy = touchY - centerY;
  // atan2: angle from positive x-axis; adjust so that up=0, clockwise
  let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}

/** 方位角轉文字（北為 0） */
function headingToLabel(heading: number): string {
  const labels = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
  const idx = Math.round(((heading % 360) + 360) % 360 / 45) % 8;
  return labels[idx];
}

/** 計算圈上點位 */
function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/** 八方位簡圖標記 */
function CompassMarkers({
  size,
  heading,
  theme,
}: {
  size: number;
  heading: number;
  theme: ThemeColors;
}) {
  const r = size / 2;
  const labelR = r * 0.78;
  const allDirs = getAllDirections();

  return (
    <>
      {allDirs.map((d, i) => {
        const angle = (360 / 8) * i; // i*45 degrees; 0 = 北
        const pos = polarToCartesian(r, r, labelR, angle);
        const isActive =
          Math.abs(((heading % 360) - angle + 540) % 360 - 180) < 22.5;
        return (
          <View
            key={d.direction}
            style={[
              compassStyles.markerOuter,
              {
                left: pos.x - 28,
                top: pos.y - 12,
              },
            ]}
          >
            <Text
              style={[
                compassStyles.markerLabel,
                {
                  color: isActive ? theme.goldLight : theme.textMuted,
                  fontWeight: isActive ? 'bold' : 'normal',
                },
              ]}
            >
              {d.direction}
            </Text>
          </View>
        );
      })}
      {/* 刻度線 */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (360 / 24) * i;
        const inner = polarToCartesian(r, r, r * 0.7, angle);
        const outer = polarToCartesian(r, r, r * 0.66, angle);
        const isMajor = i % 3 === 0;
        return (
          <View
            key={`tick-${i}`}
            style={[
              compassStyles.tick,
              {
                left: inner.x,
                top: inner.y,
                width: isMajor ? 3 : 1.5,
                height: isMajor ? 12 : 6,
                backgroundColor: isMajor ? theme.gold : theme.gold + '60',
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        );
      })}
    </>
  );
}

/** 方向卡片 */
function DirectionCard({
  result,
  delay,
  theme,
}: {
  result: DirectionResult;
  delay: number;
  theme: ThemeColors;
}) {
  const { opacity, translateY } = useFadeIn({ delay, distance: 16 });
  const s = useMemo(() => createStyles(theme), [theme]);

  const fortuneColor =
    result.fortuneType === 'great'
      ? theme.success
      : result.fortuneType === 'good'
        ? theme.warning
        : theme.textMuted;

  return (
    <Animated.View style={[s.directionCard, { opacity, transform: [{ translateY }] }]}>
      {/* 卦名與符號 */}
      <View style={s.cardHeader}>
        <View style={s.baguaCircle}>
          <Text style={s.baguaSymbol}>{result.baguaSymbol}</Text>
        </View>
        <View style={s.cardHeaderText}>
          <Text style={s.directionName}>
            {result.direction} {result.bagua}卦
          </Text>
          <Text style={s.elementLabel}>五行：{result.element}</Text>
        </View>
        <View style={[s.fortuneBadge, { backgroundColor: fortuneColor + '25', borderColor: fortuneColor }]}>
          <Text style={[s.fortuneText, { color: fortuneColor }]}>{result.fortune}</Text>
        </View>
      </View>

      {/* 描述 */}
      <Text style={s.description}>{result.description}</Text>

      {/* 宜忌 */}
      <View style={s.suitableAvoidRow}>
        <View style={[s.tagChip, { backgroundColor: theme.success + '15', borderColor: theme.success + '40' }]}>
          <Text style={[s.tagLabel, { color: theme.success }]}>宜</Text>
          <Text style={s.tagValue}>{result.suitable.replace('宜', '')}</Text>
        </View>
        <View style={[s.tagChip, { backgroundColor: theme.danger + '15', borderColor: theme.danger + '40' }]}>
          <Text style={[s.tagLabel, { color: theme.danger }]}>忌</Text>
          <Text style={s.tagValue}>{result.avoid.replace('忌', '')}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function FengshuiScreen() {
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const layout = useResponsiveLayout();
  const s = useMemo(() => createStyles(theme), [theme]);

  // 羅盤狀態
  const [heading, setHeading] = useState(0);
  const compassRef = useRef<View>(null);
  const compassLayout = useRef({ x: 0, y: 0 });

  // 羅盤尺寸：依螢幕自適應
  const screenW = Dimensions.get('window').width;
  const compassSize = Math.min(screenW - 64, 320);

  // 每日推薦方位
  const dailyDir = useMemo<DailyDirection>(() => getDailyDirection(), []);

  // 當前方位結果
  const currentDir = useMemo<DirectionResult>(() => getDirection(heading), [heading]);

  // 進場動畫
  const fadeIn = useFadeIn({ delay: 0 });
  const titleDelay = useStaggeredList({ itemCount: 2, staggerDelay: 100 });

  // 拖曳手勢
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          compassRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
            compassLayout.current = { x: pageX, y: pageY };
          });
          const { pageX: px, pageY: py } = evt.nativeEvent;
          const cx = compassLayout.current.x + compassSize / 2;
          const cy = compassLayout.current.y + compassSize / 2;
          const angle = angleFromPoints(cx, cy, px, py);
          setHeading(Math.round(angle));
        },
        onPanResponderMove: (evt) => {
          const { pageX: px, pageY: py } = evt.nativeEvent;
          const cx = compassLayout.current.x + compassSize / 2;
          const cy = compassLayout.current.y + compassSize / 2;
          const angle = angleFromPoints(cx, cy, px, py);
          setHeading(Math.round(angle));
        },
      }),
    [compassSize]
  );

  const maxWidth = layout.isDesktop ? 700 : 600;

  return (
    <SafeAreaView style={s.safe}>
      <DecorativeBg pattern="diamond" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scroll,
          { maxWidth, alignSelf: 'center' as any, width: '100%' as any },
        ]}
      >
        {/* 頁面標題 */}
        <Animated.View
          style={{
            opacity: fadeIn.opacity,
            transform: [{ translateY: fadeIn.translateY }],
            alignItems: 'center',
          }}
        >
          <Text style={s.title}>
            <Text style={s.titleIcon}>🧭</Text> 風水羅盤
          </Text>
          <Text style={s.subtitle}>旋轉羅盤，查看各方位的卦象、五行與吉凶</Text>
        </Animated.View>

        {/* 羅盤區 */}
        <Animated.View
          style={{
            opacity: fadeIn.opacity,
            transform: [{ translateY: fadeIn.translateY }],
            alignItems: 'center',
            marginVertical: TempleSpacing.lg,
          }}
        >
          {/* 旋轉提示（Web） */}
          {Platform.OS === 'web' && (
            <Text style={s.webHint}>網頁版請拖曳旋轉羅盤查看各方位</Text>
          )}

          {/* 羅盤本體 */}
          <View
            ref={compassRef}
            {...panResponder.panHandlers}
            style={[
              s.compassOuter,
              { width: compassSize, height: compassSize, borderRadius: compassSize / 2 },
            ]}
          >
            {/* 外圈刻度 */}
            <View
              style={[
                s.compassRing,
                {
                  width: compassSize,
                  height: compassSize,
                  borderRadius: compassSize / 2,
                },
              ]}
            >
              <CompassMarkers size={compassSize} heading={heading} theme={theme} />
            </View>

            {/* 內圈 */}
            <View
              style={[
                s.compassInner,
                {
                  width: compassSize * 0.6,
                  height: compassSize * 0.6,
                  borderRadius: (compassSize * 0.6) / 2,
                },
              ]}
            >
              {/* 指針（依據 heading 旋轉） */}
              <Animated.View
                style={[
                  s.needle,
                  {
                    transform: [{ rotate: `${heading}deg` }],
                  },
                ]}
              >
                <View style={[s.needlePointer, { borderBottomColor: theme.vermilion }]} />
                <View style={[s.needleTail, { borderTopColor: theme.vermilion }]} />
              </Animated.View>

              {/* 中心度數顯示 */}
              <Text style={s.headingDegrees}>{heading}°</Text>
              <Text style={s.headingLabel}>
                {currentDir.direction} {currentDir.bagua}卦
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 當前方位卡片 */}
        <DirectionCard result={currentDir} delay={titleDelay[0]?.delay ?? 0} theme={theme} />

        {/* 每日推薦方位 */}
        <Animated.View
          style={{
            opacity: fadeIn.opacity,
            transform: [{ translateY: fadeIn.translateY }],
          }}
        >
          <View style={s.dailyCard}>
            <Text style={s.dailyTitle}>
              📅 {t('commonToday')}推薦方位
            </Text>
            <View style={s.dailyContent}>
              <View style={s.dailyDirRow}>
                <Text style={s.dailyBaguaSymbol}>{dailyDir.baguaSymbol}</Text>
                <View>
                  <Text style={s.dailyDirName}>
                    {dailyDir.direction}方（{dailyDir.bagua}卦）
                  </Text>
                  <Text style={s.dailyElement}>五行：{dailyDir.element} ｜ {dailyDir.fortune}</Text>
                </View>
              </View>
              <Text style={s.dailyReason}>{dailyDir.reason}</Text>
              <View style={s.suitableAvoidRow}>
                <Text style={[s.dailyTag, { color: theme.success }]}>
                  {dailyDir.suitable}
                </Text>
                <Text style={[s.dailyTag, { color: theme.danger }]}>
                  {dailyDir.avoid}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── 樣式 ── */
function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bgDark },
    scroll: { padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl, alignItems: 'center' },

    /* 標題 */
    title: {
      fontSize: TempleFonts.title,
      fontWeight: 'bold',
      color: theme.textGold,
      textAlign: 'center',
      marginBottom: 4,
    },
    titleIcon: { fontSize: TempleFonts.title },
    subtitle: {
      fontSize: TempleFonts.small,
      color: theme.textMuted,
      textAlign: 'center',
      marginBottom: TempleSpacing.sm,
    },
    webHint: {
      fontSize: TempleFonts.caption,
      color: theme.warning,
      textAlign: 'center',
      marginBottom: TempleSpacing.sm,
      fontStyle: 'italic',
    },

    /* 羅盤 */
    compassOuter: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bgMedium,
      borderWidth: 3,
      borderColor: theme.gold,
      shadowColor: theme.gold,
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    compassRing: {
      position: 'absolute',
      borderWidth: 1,
      borderColor: theme.gold + '40',
    },
    compassInner: {
      backgroundColor: theme.bgDark,
      borderWidth: 2,
      borderColor: theme.gold,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* 指針 */
    needle: {
      position: 'absolute',
      width: 4,
      height: '80%' as any,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    needlePointer: {
      width: 0,
      height: 0,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderBottomWidth: 20,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
    },
    needleTail: {
      width: 0,
      height: 0,
      borderLeftWidth: 6,
      borderRightWidth: 6,
      borderTopWidth: 14,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
    },

    /* 中心讀數 */
    headingDegrees: {
      fontSize: 36,
      fontWeight: 'bold',
      color: theme.goldLight,
    },
    headingLabel: {
      fontSize: TempleFonts.small,
      color: theme.textLight,
      marginTop: 2,
    },

    /* 方位卡片 */
    directionCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '40',
      padding: TempleSpacing.lg,
      marginBottom: TempleSpacing.lg,
      width: '100%',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: TempleSpacing.md,
      gap: 12,
    },
    baguaCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.bgMedium,
      borderWidth: 2,
      borderColor: theme.gold + '50',
      alignItems: 'center',
      justifyContent: 'center',
    },
    baguaSymbol: {
      fontSize: 28,
      color: theme.textGold,
    },
    cardHeaderText: {
      flex: 1,
    },
    directionName: {
      fontSize: TempleFonts.heading,
      fontWeight: 'bold',
      color: theme.textLight,
    },
    elementLabel: {
      fontSize: TempleFonts.small,
      color: theme.textMuted,
      marginTop: 2,
    },
    fortuneBadge: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 2,
    },
    fortuneText: {
      fontSize: TempleFonts.heading,
      fontWeight: 'bold',
    },
    description: {
      fontSize: TempleFonts.body,
      color: theme.textLight,
      lineHeight: TempleFonts.body * 1.6,
      marginBottom: TempleSpacing.md,
    },
    suitableAvoidRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: TempleSpacing.sm,
    },
    tagChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      borderWidth: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      gap: 6,
    },
    tagLabel: {
      fontSize: TempleFonts.small,
      fontWeight: 'bold',
    },
    tagValue: {
      fontSize: TempleFonts.small,
      color: theme.textLight,
    },

    /* 每日推薦 */
    dailyCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.gold + '30',
      padding: TempleSpacing.lg,
      marginBottom: TempleSpacing.lg,
      width: '100%',
    },
    dailyTitle: {
      fontSize: TempleFonts.subtitle,
      fontWeight: 'bold',
      color: theme.textGold,
      marginBottom: TempleSpacing.md,
    },
    dailyContent: {},
    dailyDirRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginBottom: TempleSpacing.md,
    },
    dailyBaguaSymbol: {
      fontSize: 40,
      color: theme.textGold,
    },
    dailyDirName: {
      fontSize: TempleFonts.heading,
      fontWeight: 'bold',
      color: theme.textLight,
    },
    dailyElement: {
      fontSize: TempleFonts.small,
      color: theme.textMuted,
      marginTop: 2,
    },
    dailyReason: {
      fontSize: TempleFonts.body,
      color: theme.textLight,
      lineHeight: TempleFonts.body * 1.6,
      fontStyle: 'italic',
    },
    dailyTag: {
      fontSize: TempleFonts.small,
      fontWeight: '600',
    },
  });
}

/* 羅盤標記獨立樣式（非 theme 相依） */
const compassStyles = StyleSheet.create({
  markerOuter: {
    position: 'absolute',
    width: 56,
    alignItems: 'center',
  },
  markerLabel: {
    fontSize: TempleFonts.caption,
    fontWeight: '600',
  },
  tick: {
    position: 'absolute',
    width: 2,
    height: 8,
  },
});
