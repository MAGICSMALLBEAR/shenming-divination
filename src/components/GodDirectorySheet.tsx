import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { God } from '@/data/gods';
import { getGodCardImage, getGodCloseupImage } from '@/data/godImages';
import { GodPortrait } from '@/components/GodPortrait';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { buildGodDirectory } from '@/services/godDirectory';

type GodDirectorySheetProps = {
  visible: boolean;
  gods: God[];
  categoryId: string;
  /** Desktop shows a panel beside the floating button instead of a bottom sheet. */
  docked?: boolean;
  reducedMotion?: boolean;
  onClose: () => void;
  onJump: (godId: number) => void;
};

/** Lists the gods currently shown in the selector so a name jumps to its card. */
export function GodDirectorySheet({
  visible,
  gods,
  categoryId,
  docked = false,
  reducedMotion = false,
  onClose,
  onJump,
}: GodDirectorySheetProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const directory = useMemo(() => buildGodDirectory(gods, categoryId), [categoryId, gods]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : docked ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="關閉神明名冊" />
      <View style={[styles.panel, docked ? styles.panelDocked : styles.panelSheet]} accessibilityViewIsModal>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>神明名冊</Text>
            <Text style={styles.subtitle}>{directory.title}・{directory.total} 位</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="關閉神明名冊">
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {directory.sections.length === 0 ? (
            <Text style={styles.empty}>目前的搜尋與分類沒有符合的神明。</Text>
          ) : null}
          {directory.sections.map((section) => (
            <View key={section.key} style={styles.section}>
              {categoryId === 'all' ? (
                <Text style={styles.sectionTitle} accessibilityRole="header">
                  {section.icon} {section.title}<Text style={styles.sectionCount}>  {section.gods.length}</Text>
                </Text>
              ) : null}
              {section.gods.map((god) => (
                <TouchableOpacity
                  key={god.id}
                  style={styles.row}
                  onPress={() => onJump(god.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`前往${god.name}`}
                  testID={`god-directory-row-${god.id}`}
                >
                  <GodPortrait
                    source={getGodCloseupImage(god.id) ?? getGodCardImage(god.id)}
                    name={god.name}
                    accentColor={god.accentColor}
                    primaryColor={god.primaryColor}
                    style={[styles.avatar, { borderColor: god.accentColor + '88' }]}
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.rowText}>
                    <Text style={styles.name} numberOfLines={1}>{god.name}</Text>
                    <Text style={styles.tagline} numberOfLines={1}>{god.tagline}</Text>
                  </View>
                  <Text style={[styles.chevron, { color: god.accentColor }]}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: '#000000AA' },
  panel: {
    position: 'absolute',
    backgroundColor: theme.bgCard,
    borderColor: theme.gold + '88',
    borderWidth: 1,
    overflow: 'hidden',
  },
  panelSheet: {
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '72%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  panelDocked: {
    right: TempleSpacing.lg,
    bottom: 132,
    width: 360,
    maxHeight: '70%',
    borderRadius: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TempleSpacing.md,
    paddingTop: TempleSpacing.md,
    paddingBottom: TempleSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.gold + '33',
  },
  headerText: { flex: 1 },
  title: { color: theme.goldLight, fontSize: 18, fontWeight: TempleFonts.heavy },
  subtitle: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  close: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: theme.textMuted, fontSize: 18 },
  list: { paddingHorizontal: TempleSpacing.sm, paddingBottom: TempleSpacing.lg },
  empty: { color: theme.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: TempleSpacing.lg },
  section: { paddingTop: TempleSpacing.sm },
  sectionTitle: {
    color: theme.gold,
    fontSize: 13,
    fontWeight: TempleFonts.heavy,
    paddingHorizontal: TempleSpacing.xs,
    paddingBottom: 4,
  },
  sectionCount: { color: theme.textMuted, fontWeight: TempleFonts.bold },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: TempleSpacing.xs,
    paddingVertical: 6,
    borderRadius: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1 },
  rowText: { flex: 1 },
  name: { color: theme.textLight, fontSize: 15, fontWeight: TempleFonts.bold },
  tagline: { color: theme.textMuted, fontSize: 12, marginTop: 1 },
  chevron: { fontSize: 22, fontWeight: TempleFonts.bold },
});
