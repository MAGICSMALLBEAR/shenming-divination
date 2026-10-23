// 一事一籤提醒：同一件事 24 小時內已向同一位神明求過籤
import React, { useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import type { DivinationRecord } from '@/services/storage';

interface SameMatterNoticeProps {
  record: DivinationRecord | null;
  godName: string;
  /** 嚴謹模式下不提供「仍要請示」 */
  allowOverride: boolean;
  onChangeQuestion: () => void;
  onProceed: () => void;
}

function formatElapsed(timestamp: number) {
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return '剛剛';
  if (minutes < 60) return `${minutes} 分鐘前`;
  return `${Math.floor(minutes / 60)} 小時前`;
}

export function SameMatterNotice({ record, godName, allowOverride, onChangeQuestion, onProceed }: SameMatterNoticeProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={record !== null} transparent animationType="fade" onRequestClose={onChangeQuestion}>
      <View style={styles.backdrop}>
        {record ? (
          <View style={styles.sheet} accessibilityViewIsModal>
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.title}>一事一籤</Text>
              <Text style={styles.body}>
                你在{formatElapsed(record.timestamp)}已經向{godName}請示過這件事。傳統上同一件事只求一籤，神明的指示就是上次那一支，不宜一再重抽。
              </Text>
              <View style={styles.poemBox}>
                <Text style={styles.poemMeta}>上次的問題：{record.question}</Text>
                <Text style={styles.poemHeading}>
                  第 {record.poem.number} 籤 · {record.poem.level}{record.poem.title ? ` · ${record.poem.title}` : ''}
                </Text>
                <Text style={styles.poemContent}>{record.poem.content}</Text>
              </View>
              <Text style={styles.hint}>
                {allowOverride
                  ? '如果事情已經有新的變化，可以換個問法，或確認後重新請示。'
                  : '嚴謹模式已開啟：同一件事 24 小時內不能重新求籤，請換一件事再請示。'}
              </Text>
            </ScrollView>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.primaryBtn} onPress={onChangeQuestion} accessibilityRole="button">
                <Text style={styles.primaryBtnText}>換個問題</Text>
              </TouchableOpacity>
              {allowOverride ? (
                <TouchableOpacity style={styles.secondaryBtn} onPress={onProceed} accessibilityRole="button">
                  <Text style={styles.secondaryBtnText}>事情有新變化，仍要請示</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: TempleSpacing.lg },
    sheet: {
      backgroundColor: theme.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.goldDark + '50',
      maxHeight: '85%',
      width: '100%',
      maxWidth: 480,
      alignSelf: 'center',
      overflow: 'hidden',
    },
    content: { padding: TempleSpacing.lg },
    title: { color: theme.goldLight, fontSize: TempleFonts.heading, fontWeight: '900', marginBottom: 8 },
    body: { color: theme.textLight, fontSize: TempleFonts.small, lineHeight: 22, marginBottom: TempleSpacing.md },
    poemBox: {
      backgroundColor: theme.bgMedium,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '30',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    poemMeta: { color: theme.textMuted, fontSize: 12, marginBottom: 6 },
    poemHeading: { color: theme.gold, fontSize: TempleFonts.small, fontWeight: '800', marginBottom: 6 },
    poemContent: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 26 },
    hint: { color: theme.textMuted, fontSize: 12, lineHeight: 18 },
    actions: { padding: TempleSpacing.md, gap: 8, borderTopWidth: 1, borderTopColor: theme.goldDark + '25' },
    primaryBtn: { backgroundColor: theme.red, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    primaryBtnText: { color: '#FFF', fontWeight: '800', fontSize: TempleFonts.body },
    secondaryBtn: { borderRadius: 10, borderWidth: 1, borderColor: theme.textMuted, paddingVertical: 10, alignItems: 'center' },
    secondaryBtnText: { color: theme.textMuted, fontSize: TempleFonts.small },
  });
}
