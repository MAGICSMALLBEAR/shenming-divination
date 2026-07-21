import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import {
  ritualStyleAtlas,
  ritualStyleAtlasSize,
  ritualStyleOrder,
  ritualStyles,
  type AtlasCrop,
  type RitualStyleKey,
} from '@/constants/ritual-styles';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';

interface RitualStylePickerProps {
  value: RitualStyleKey;
  onChange: (next: RitualStyleKey) => void;
  /** When true, renders a compact one-line summary that expands on tap instead of the full card row. */
  compact?: boolean;
}

export function RitualStylePicker({ value, onChange, compact = false }: RitualStylePickerProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [expanded, setExpanded] = useState(false);
  const selectedDef = ritualStyles[value];

  if (compact && !expanded) {
    return (
      <Pressable
        style={styles.compactRow}
        onPress={() => setExpanded(true)}
        accessibilityRole="button"
        accessibilityLabel={`\u76ee\u524d\u5100\u5f0f\u8cea\u611f\uff1a${selectedDef.label}\uff0c\u9ede\u64ca\u66f4\u63db`}
      >
        <AtlasThumb crop={selectedDef.preview.censer} width={36} height={26} />
        <View style={styles.compactTextWrap}>
          <Text style={styles.compactLabel}>{'\u76ee\u524d\u8cea\u611f\uff1a'}{selectedDef.label}</Text>
        </View>
        <Text style={styles.compactChange}>{'\u66f4\u63db'}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{'\u9078\u64c7\u5100\u5f0f\u8cea\u611f'}</Text>
        {compact ? (
          <Pressable onPress={() => setExpanded(false)} accessibilityRole="button" accessibilityLabel="\u6536\u8d77\u5100\u5f0f\u8cea\u611f\u9078\u64c7">
            <Text style={styles.swipeHint}>{'\u6536\u8d77'}</Text>
          </Pressable>
        ) : (
          <Text style={styles.swipeHint}>{'\u5de6\u53f3\u6ed1\u52d5\u9078\u64c7'}</Text>
        )}
      </View>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.selectorScroll}
        contentContainerStyle={styles.row}
      >
        {ritualStyleOrder.map((styleKey) => {
          const styleDef = ritualStyles[styleKey];
          const selected = styleKey === value;

          return (
            <Pressable
              key={styleKey}
              style={[
                styles.card,
                selected && {
                  borderColor: styleDef.chipColor,
                  backgroundColor: styleDef.chipColor + '14',
                },
              ]}
              onPress={() => {
                onChange(styleKey);
                if (compact) setExpanded(false);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={'\u9078\u64c7' + styleDef.label + '\u5100\u5f0f\u8cea\u611f'}
            >
              <View style={styles.thumbRow}>
                <AtlasThumb crop={styleDef.preview.censer} width={74} height={54} />
                <View style={styles.coinRow}>
                  <AtlasThumb crop={styleDef.preview.round} width={28} height={28} />
                  <AtlasThumb crop={styleDef.preview.flat} width={28} height={28} />
                </View>
              </View>
              <View style={styles.titleRow}>
                <Text style={[styles.title, selected && { color: styleDef.chipColor }]}>
                  {styleDef.label}
                </Text>
                {selected ? <Text style={[styles.selectedMark, { color: styleDef.chipColor }]}>✓</Text> : null}
              </View>
              <Text style={styles.summary}>{styleDef.summary}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function AtlasThumb({
  crop,
  width,
  height,
}: {
  crop: AtlasCrop;
  width: number;
  height: number;
}) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scale = Math.max(width / crop.width, height / crop.height);

  return (
    <View style={[styles.thumbViewport, { width, height }]}>
      <Image
        source={ritualStyleAtlas}
        style={{
          position: 'absolute',
          width: ritualStyleAtlasSize.width * scale,
          height: ritualStyleAtlasSize.height * scale,
          transform: [
            { translateX: -crop.x * scale },
            { translateY: -crop.y * scale },
          ],
        }}
        contentFit="fill"
      />
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 420,
    marginBottom: TempleSpacing.md,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TempleSpacing.sm,
    width: '100%',
    maxWidth: 420,
    marginBottom: TempleSpacing.md,
    padding: TempleSpacing.xs,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.goldDark + '28',
    backgroundColor: theme.bgCard,
  },
  compactTextWrap: {
    flex: 1,
  },
  compactLabel: {
    fontSize: TempleFonts.small,
    color: theme.textLight,
    fontWeight: '700',
  },
  compactChange: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.goldLight,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: TempleSpacing.xs,
  },
  label: {
    fontSize: TempleFonts.small,
    color: theme.textLight,
    fontWeight: '700',
  },
  swipeHint: {
    fontSize: 10,
    color: theme.textMuted,
  },
  selectorScroll: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: TempleSpacing.sm,
    paddingRight: TempleSpacing.md,
  },
  card: {
    width: 148,
    minHeight: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.goldDark + '28',
    backgroundColor: theme.bgCard,
    padding: TempleSpacing.sm,
  },
  thumbRow: {
    alignItems: 'center',
    marginBottom: TempleSpacing.xs,
  },
  thumbViewport: {
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#100c0c',
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  coinRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.goldLight,
  },
  selectedMark: {
    fontSize: 13,
    fontWeight: '900',
  },
  summary: {
    fontSize: 10,
    lineHeight: 14,
    color: theme.textMuted,
  },
  });
}
