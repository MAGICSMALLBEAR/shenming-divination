// 神明選擇卡片元件
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { gods, questionCategories, type God } from '@/data/gods';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';

interface GodSelectorProps {
  onSelectGod: (godId: number) => void;
}

export function GodSelector({ onSelectGod }: GodSelectorProps) {
  const getGodIcon = (god: God) => {
    switch (god.category) {
      case 'war': return '⚔️';
      case 'compassion': return '🪷';
      case 'sea': return '🌊';
      case 'health': return '💊';
      case 'wealth': return '🪙';
      case 'general': return '🏛️';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>請選擇神明</Text>
      <Text style={styles.subtitle}>誠心祈求，心誠則靈</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.grid}>
          {gods.map(god => (
            <TouchableOpacity
              key={god.id}
              style={styles.godCard}
              onPress={() => onSelectGod(god.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.godIcon}>{getGodIcon(god)}</Text>
              <Text style={styles.godName}>{god.name}</Text>
              <Text style={styles.godPoem}>{god.poemSystem}</Text>
              <Text style={styles.godDesc} numberOfLines={2}>
                {god.description.slice(0, 40)}...
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

interface QuestionFormProps {
  onSubmit: (question: string, category: string, userName: string) => void;
}

export function QuestionForm({ onSubmit }: QuestionFormProps) {
  const [question, setQuestion] = React.useState('');
  const [category, setCategory] = React.useState('general');
  const [userName, setUserName] = React.useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>向神明稟報</Text>
      <Text style={styles.subtitle}>誠心默念所求之事</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>您的稱呼 / 姓名</Text>
        <View style={styles.nameInputRow}>
          <TextInput
            style={styles.nameTextInput}
            value={userName}
            onChangeText={setUserName}
            placeholder="輸入姓名或稱呼"
            placeholderTextColor={TempleTheme.textMuted}
          />
        </View>
        <View style={styles.nameButtons}>
          {['善信', '弟子', '信女'].map(name => (
            <TouchableOpacity
              key={name}
              style={[styles.nameBtn, userName === name && styles.nameBtnActive]}
              onPress={() => setUserName(name)}
            >
              <Text style={[styles.nameBtnText, userName === name && styles.nameBtnTextActive]}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>手機號碼（選填，用於還願提醒）</Text>
        <TextInput
          style={styles.nameTextInput}
          value=""
          placeholder="09XX-XXX-XXX"
          placeholderTextColor={TempleTheme.textMuted}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>問事類別</Text>
        <View style={styles.categoryGrid}>
          {questionCategories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, category === cat.id && styles.categoryChipActive]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryText, category === cat.id && styles.categoryTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>所求之事</Text>
        <View style={styles.presetGrid}>
          {['事業順利', '感情順遂', '財運亨通', '身體健康', '考試順利', '家庭和睦'].map(q => (
            <TouchableOpacity
              key={q}
              style={[styles.presetChip, question === q && styles.presetChipActive]}
              onPress={() => setQuestion(q)}
            >
              <Text style={[styles.presetText, question === q && styles.presetTextActive]}>
                {q}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, !question && styles.submitBtnDisabled]}
        onPress={() => question && onSubmit(question, category, userName)}
        disabled={!question}
      >
        <Text style={styles.submitBtnText}>開始求籤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: TempleSpacing.md,
  },
  title: {
    fontSize: TempleFonts.title,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.xs,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    textAlign: 'center',
    marginBottom: TempleSpacing.lg,
  },
  scrollArea: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: TempleSpacing.sm,
  },
  godCard: {
    width: '46%',
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
  },
  godIcon: {
    fontSize: 40,
    marginBottom: TempleSpacing.xs,
  },
  godName: {
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    marginBottom: 2,
  },
  godPoem: {
    fontSize: 11,
    color: TempleTheme.textMuted,
    marginBottom: TempleSpacing.xs,
  },
  godDesc: {
    fontSize: 11,
    color: TempleTheme.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Question Form styles
  formGroup: {
    marginBottom: TempleSpacing.md,
  },
  label: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    marginBottom: TempleSpacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
    padding: TempleSpacing.sm,
    marginBottom: TempleSpacing.sm,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: TempleSpacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 4,
  },
  inputText: {
    color: TempleTheme.textLight,
    fontSize: TempleFonts.body,
  },
  nameButtons: {
    flexDirection: 'row',
    gap: TempleSpacing.xs,
  },
  nameBtn: {
    paddingHorizontal: TempleSpacing.md,
    paddingVertical: TempleSpacing.xs,
    borderRadius: 16,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
  },
  nameBtnActive: {
    backgroundColor: TempleTheme.goldDark + '30',
    borderColor: TempleTheme.gold,
  },
  nameBtnText: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
  },
  nameBtnTextActive: { color: TempleTheme.goldLight },
  nameInputRow: { marginBottom: TempleSpacing.xs },
  nameTextInput: {
    backgroundColor: TempleTheme.bgCard, borderRadius: 8, padding: TempleSpacing.sm,
    fontSize: TempleFonts.body, color: TempleTheme.textLight,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '30', marginBottom: TempleSpacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TempleSpacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: TempleTheme.goldDark + '30',
    borderColor: TempleTheme.gold,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
  },
  categoryTextActive: {
    color: TempleTheme.goldLight,
    fontWeight: '600',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TempleSpacing.xs,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
  },
  presetChipActive: {
    backgroundColor: TempleTheme.goldDark + '30',
    borderColor: TempleTheme.gold,
  },
  presetText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
  },
  presetTextActive: {
    color: TempleTheme.goldLight,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: TempleTheme.red,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: TempleSpacing.md,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: TempleFonts.heading,
    fontWeight: '700',
    letterSpacing: 4,
  },
});
