import React, { useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import type { ThemeColors } from '@/constants/themes';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getCalendarFeedUrls } from '@/services/deityCalendarFeeds';

interface Props {
  /** 不指定時訂閱全部神明。 */
  godId?: number | null;
  label?: string;
}

export function CalendarSubscribeRow({ godId = null, label = '訂閱到手機行事曆（自動更新）' }: Props) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const urls = useMemo(() => getCalendarFeedUrls(godId), [godId]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(urls.https);
    setCopied(true);
  };

  return (
    <View style={styles.row} accessibilityLabel={label}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openURL(urls.webcal)}
          accessibilityRole={'link'}
          accessibilityLabel={'用 Apple 或 Outlook 行事曆訂閱'}
        >
          <Text style={styles.buttonText}>Apple／Outlook</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openURL(`https://calendar.google.com/calendar/render?cid=${encodeURIComponent(urls.webcal)}`)}
          accessibilityRole={'link'}
          accessibilityLabel={'用 Google 日曆訂閱'}
        >
          <Text style={styles.buttonText}>Google 日曆</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={copy} accessibilityRole={'button'} accessibilityLabel={'複製訂閱網址'}>
          <Text style={styles.buttonText}>{copied ? '已複製' : '複製網址'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    row: { marginBottom: 10 },
    label: { color: theme.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 6 },
    buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    button: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9, borderWidth: 1, borderColor: theme.goldDark + '66' },
    buttonText: { color: theme.gold, fontSize: 11, fontWeight: '800' },
  });
}
