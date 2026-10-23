import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type ImageSourcePropType, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { Image, type ImageContentFit } from 'expo-image';

type GodPortraitProps = {
  source: ImageSourcePropType | null;
  name: string;
  accentColor: string;
  primaryColor: string;
  style: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  contentPosition?: 'top' | 'center';
  transition?: number;
  cachePolicy?: 'memory-disk' | 'memory' | 'disk' | 'none';
  recyclingKey?: string;
  testID?: string;
};

export function getGodPortraitInitial(name: string): string {
  const compactName = name.replace(/\s/g, '');
  return compactName.slice(0, 2) || '神明';
}

/**
 * Local deity art is normally bundled with the app, but a visible fallback keeps
 * selection and ritual flows usable if an asset is unavailable or fails to decode.
 */
export function GodPortrait({
  source,
  name,
  accentColor,
  primaryColor,
  style,
  contentFit = 'cover',
  contentPosition = 'top',
  transition,
  cachePolicy,
  recyclingKey,
  testID,
}: GodPortraitProps) {
  const [failed, setFailed] = useState(!source);

  useEffect(() => {
    setFailed(!source);
  }, [source]);

  if (failed) {
    return (
      <View
        testID={testID ? `${testID}-fallback` : 'god-portrait-fallback'}
        style={[style as StyleProp<ViewStyle>, styles.fallback, { backgroundColor: primaryColor + 'D9', borderColor: accentColor + '88' }]}
        accessibilityRole="image"
        accessibilityLabel={`${name}神像圖片暫時無法載入`}
      >
        <Text style={[styles.initial, { color: accentColor }]}>{getGodPortraitInitial(name)}</Text>
        <Text style={styles.label}>神像載入中</Text>
      </View>
    );
  }

  return (
    <Image
      testID={testID}
      source={source}
      style={style}
      contentFit={contentFit}
      contentPosition={contentPosition}
      transition={transition}
      cachePolicy={cachePolicy}
      recyclingKey={recyclingKey}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
  },
  initial: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  label: {
    color: '#FFF4D2',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 5,
  },
});
