import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import type { FamilyMember } from '@/services/storage';

interface Props {
  familyMembers: FamilyMember[];
  selectedPerson: FamilyMember | null;
  onSelect: (m: FamilyMember | null) => void;
  onAddPress: () => void;
  onRemove: (id: string) => void;
}

export function ForWhomSelector({
  familyMembers,
  selectedPerson,
  onSelect,
  onAddPress,
  onRemove,
}: Props) {
  const { theme } = useAppTheme();
  const famStyle = useMemo(() => createFamStyle(theme), [theme]);
  const isSelf = selectedPerson === null;
  return (
    <View style={famStyle.row}>
      <Text style={famStyle.label}>為誰求籤：</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={famStyle.chips}>
        <TouchableOpacity
          style={[famStyle.chip, isSelf && famStyle.chipActive]}
          onPress={() => onSelect(null)}
        >
          <Text style={[famStyle.chipText, isSelf && famStyle.chipTextActive]}>自己</Text>
        </TouchableOpacity>
        {familyMembers.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[famStyle.chip, selectedPerson?.id === m.id && famStyle.chipActive]}
            onPress={() => onSelect(m)}
            onLongPress={() => onRemove(m.id)}
          >
            <Text style={[famStyle.chipText, selectedPerson?.id === m.id && famStyle.chipTextActive]}>
              {m.relation} {m.name}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={famStyle.addBtn} onPress={onAddPress}>
          <Text style={famStyle.addBtnText}>＋</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function createFamStyle(theme: ThemeColors) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: TempleSpacing.md, paddingVertical: 6, backgroundColor: theme.bgMedium },
    label: { color: theme.textMuted, fontSize: 13, marginRight: 6, flexShrink: 0 },
    chips: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    chip: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: theme.gold },
    chipActive: { backgroundColor: theme.gold },
    chipText: { color: theme.gold, fontSize: 13 },
    chipTextActive: { color: theme.bgDark, fontWeight: 'bold' },
    addBtn: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: theme.goldDark },
    addBtnText: { color: theme.goldDark, fontSize: 16, lineHeight: 20 },
  });
}
