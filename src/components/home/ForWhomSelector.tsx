import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TempleTheme, TempleSpacing } from '@/constants/temple-theme';
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

const famStyle = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: TempleSpacing.md, paddingVertical: 6, backgroundColor: TempleTheme.bgMedium },
  label: { color: TempleTheme.textMuted, fontSize: 13, marginRight: 6, flexShrink: 0 },
  chips: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  chip: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: TempleTheme.gold },
  chipActive: { backgroundColor: TempleTheme.gold },
  chipText: { color: TempleTheme.gold, fontSize: 13 },
  chipTextActive: { color: TempleTheme.bgDark, fontWeight: 'bold' },
  addBtn: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: TempleTheme.goldDark },
  addBtnText: { color: TempleTheme.goldDark, fontSize: 16, lineHeight: 20 },
});
