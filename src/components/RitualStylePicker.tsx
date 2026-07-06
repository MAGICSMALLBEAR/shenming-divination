import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
}

export function RitualStylePicker({ value, onChange }: RitualStylePickerProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>AI 風格</Text>
      <View style={styles.row}>
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
              onPress={() => onChange(styleKey)}
            >
              <View style={styles.thumbRow}>
                <AtlasThumb crop={styleDef.preview.censer} width={74} height={54} />
                <View style={styles.coinRow}>
                  <AtlasThumb crop={styleDef.preview.round} width={28} height={28} />
                  <AtlasThumb crop={styleDef.preview.flat} width={28} height={28} />
                </View>
              </View>
              <Text style={[styles.title, selected && { color: styleDef.chipColor }]}>
                {styleDef.label}
              </Text>
              <Text style={styles.summary}>{styleDef.summary}</Text>
            </Pressable>
          );
        })}
      </View>
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
  label: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
    marginBottom: TempleSpacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TempleSpacing.sm,
  },
  card: {
    flexBasis: '31%',
    flexGrow: 1,
    minWidth: 108,
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
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.goldLight,
    marginBottom: 4,
  },
  summary: {
    fontSize: 10,
    lineHeight: 14,
    color: theme.textMuted,
  },
  });
}
