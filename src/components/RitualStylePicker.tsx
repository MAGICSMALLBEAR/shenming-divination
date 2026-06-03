import React from 'react';
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
import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';

interface RitualStylePickerProps {
  value: RitualStyleKey;
  onChange: (next: RitualStyleKey) => void;
}

export function RitualStylePicker({ value, onChange }: RitualStylePickerProps) {
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 420,
    marginBottom: TempleSpacing.md,
  },
  label: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
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
    borderColor: TempleTheme.goldDark + '28',
    backgroundColor: TempleTheme.bgCard,
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
    color: TempleTheme.goldLight,
    marginBottom: 4,
  },
  summary: {
    fontSize: 10,
    lineHeight: 14,
    color: TempleTheme.textMuted,
  },
});
