// 神明選擇卡片 - 含光暈脈衝動畫 + 守護神推薦 + 神明漢字肖像
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Animated } from 'react-native';
import { Image } from 'expo-image';
import { gods, questionCategories, type God } from '@/data/gods';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { getSettings } from '@/services/storage';
import { calcBazi, parseBirthYear } from '@/services/bazi';

interface GodSelectorProps {
  onSelectGod: (godId: number) => void;
}

export function GodSelector({ onSelectGod }: GodSelectorProps) {
  const [patronGodId, setPatronGodId] = useState<number | null>(null);

  useEffect(() => {
    getSettings().then(s => {
      if (s?.birthDate) {
        const year = parseBirthYear(s.birthDate);
        if (year) setPatronGodId(calcBazi(year).patronGodId);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>請選擇神明</Text>
      <Text style={styles.subtitle}>
        {patronGodId ? '金色外框為您的守護神明' : '誠心祈求，心誠則靈'}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.grid}>
          {gods.map(god => (
            <GodCard
              key={god.id}
              god={god}
              color={god.primaryColor}
              isPatron={patronGodId === god.id}
              onPress={() => onSelectGod(god.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function GodCard({ god, color, isPatron, onPress }: { god: God; color: string; isPatron: boolean; onPress: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 2000, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
        ]),
      ])
    ).start();
  }, []);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isPatron ? color + '80' : color + '20', color + 'CC'],
  });
  const shadowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.35] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.cardWrapper}>
      <Animated.View
        style={[
          styles.godCard,
          isPatron && styles.godCardPatron,
          {
            borderColor,
            transform: [{ scale: pulseAnim }],
            shadowColor: color,
            shadowOpacity,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          },
        ]}
      >
        <Animated.View style={[styles.glowBg, { backgroundColor: color + '10', opacity: glowAnim }]} />

        {/* 守護神徽章 */}
        {isPatron && (
          <View style={[styles.patronBadge, { backgroundColor: color }]}>
            <Text style={styles.patronBadgeText}>守護</Text>
          </View>
        )}

        <View style={[styles.godPortrait, { borderColor: god.accentColor + '66' }]}>
          <Image source={god.image} style={styles.godPortraitImage} contentFit="cover" transition={250} />
          <View style={[styles.godPortraitOverlay, { backgroundColor: god.primaryColor + '18' }]} />
          <View style={styles.godPortraitVignette} />
        </View>

        <Text style={[styles.godTitle, { color: god.accentColor }]}>{god.title}</Text>
        <Text style={[styles.godName, { color }]}>{god.name}</Text>
        <Text style={[styles.godTagline, { color: god.accentColor }]}>{god.tagline}</Text>
        <Text style={styles.godPoem}>{god.poemSystem} · {god.totalPoems}首</Text>
        <Text style={styles.godDesc} numberOfLines={2}>
          {god.description.slice(0, 36)}…
        </Text>
      </Animated.View>
    </TouchableOpacity>
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
    <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>向神明稟報</Text>
        <Text style={styles.subtitle}>誠心默念所求之事</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>您的稱呼 / 姓名</Text>
          <TextInput
            style={styles.nameTextInput}
            value={userName}
            onChangeText={setUserName}
            placeholder="輸入姓名或稱呼"
            placeholderTextColor={TempleTheme.textMuted}
          />
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

          {/* 快速選擇 chip */}
          <View style={styles.presetGrid}>
            {['事業順利', '感情順遂', '財運亨通', '身體健康', '考試順利', '家庭和睦', '出行平安', '求子得子'].map(q => (
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

          {/* 自由輸入框 */}
          <View style={styles.questionInputWrapper}>
            <TextInput
              style={styles.questionInput}
              value={question}
              onChangeText={setQuestion}
              placeholder="或直接輸入您的問題…（最多50字）"
              placeholderTextColor={TempleTheme.textMuted}
              maxLength={50}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
            {question.length > 0 && (
              <TouchableOpacity style={styles.questionClear} onPress={() => setQuestion('')}>
                <Text style={styles.questionClearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.questionCount}>{question.length} / 50</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !question.trim() && styles.submitBtnDisabled]}
          onPress={() => question.trim() && onSubmit(question.trim(), category, userName)}
          disabled={!question.trim()}
        >
          <Text style={styles.submitBtnText}>開始求籤</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: TempleSpacing.md },
  title: { fontSize: TempleFonts.title, fontWeight: '900', color: TempleTheme.goldLight, textAlign: 'center', marginBottom: TempleSpacing.xs, letterSpacing: 4 },
  subtitle: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, textAlign: 'center', marginBottom: TempleSpacing.lg },
  scrollArea: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: TempleSpacing.sm, paddingBottom: TempleSpacing.lg },
  cardWrapper: { width: '46%' },
  godCard: {
    backgroundColor: TempleTheme.bgCard, borderRadius: 16,
    paddingHorizontal: TempleSpacing.sm, paddingTop: TempleSpacing.sm, paddingBottom: TempleSpacing.md,
    alignItems: 'center', borderWidth: 1.5, overflow: 'hidden',
  },
  godCardPatron: { borderWidth: 2 },
  glowBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 14 },
  patronBadge: {
    position: 'absolute', top: 8, right: 8,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  patronBadgeText: { fontSize: 9, color: '#FFF', fontWeight: '700' },
  godPortrait: {
    width: '100%', height: 138, borderRadius: 18,
    overflow: 'hidden', borderWidth: 1.5,
    marginBottom: TempleSpacing.sm,
  },
  godPortraitImage: { width: '100%', height: '100%' },
  godPortraitOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  godPortraitVignette: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%',
    backgroundColor: 'rgba(26,18,16,0.35)',
  },
  godTitle: { fontSize: 10, fontWeight: '700', marginBottom: 4, letterSpacing: 1 },
  godName: { fontSize: TempleFonts.body, fontWeight: '700', marginBottom: 2 },
  godTagline: { fontSize: 11, fontWeight: '600', marginBottom: 6 },
  godPoem: { fontSize: 10, color: TempleTheme.textMuted, marginBottom: TempleSpacing.xs },
  godDesc: { fontSize: 10, color: TempleTheme.textMuted, textAlign: 'center', lineHeight: 15 },
  // Form
  formScroll: { flex: 1 },
  formContainer: { paddingHorizontal: TempleSpacing.md },
  formGroup: { marginBottom: TempleSpacing.md },
  label: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, marginBottom: TempleSpacing.xs },
  nameTextInput: {
    backgroundColor: TempleTheme.bgCard, borderRadius: 8, padding: TempleSpacing.sm,
    fontSize: TempleFonts.body, color: TempleTheme.textLight,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '30', marginBottom: TempleSpacing.xs,
  },
  nameButtons: { flexDirection: 'row', gap: TempleSpacing.xs },
  nameBtn: { paddingHorizontal: TempleSpacing.md, paddingVertical: TempleSpacing.xs, borderRadius: 16, backgroundColor: TempleTheme.bgCard, borderWidth: 1, borderColor: TempleTheme.goldDark + '30' },
  nameBtnActive: { backgroundColor: TempleTheme.goldDark + '30', borderColor: TempleTheme.gold },
  nameBtnText: { color: TempleTheme.textMuted, fontSize: TempleFonts.small },
  nameBtnTextActive: { color: TempleTheme.goldLight },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: TempleSpacing.xs },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: TempleTheme.bgCard, borderWidth: 1, borderColor: TempleTheme.goldDark + '20', gap: 4 },
  categoryChipActive: { backgroundColor: TempleTheme.goldDark + '30', borderColor: TempleTheme.gold },
  categoryIcon: { fontSize: 14 },
  categoryText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  categoryTextActive: { color: TempleTheme.goldLight, fontWeight: '600' },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: TempleSpacing.xs, marginBottom: TempleSpacing.sm },
  presetChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: TempleTheme.bgCard, borderWidth: 1, borderColor: TempleTheme.goldDark + '20' },
  presetChipActive: { backgroundColor: TempleTheme.goldDark + '30', borderColor: TempleTheme.gold },
  presetText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  presetTextActive: { color: TempleTheme.goldLight, fontWeight: '600' },
  questionInputWrapper: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: TempleTheme.bgCard, borderRadius: 10,
    borderWidth: 1.5, borderColor: TempleTheme.goldDark + '40',
    paddingHorizontal: TempleSpacing.sm, paddingTop: TempleSpacing.sm, paddingBottom: TempleSpacing.xs,
    minHeight: 64,
  },
  questionInput: {
    flex: 1, fontSize: TempleFonts.body, color: TempleTheme.textLight,
    lineHeight: 22, paddingTop: 0,
  },
  questionClear: { padding: 4, marginLeft: 4 },
  questionClearText: { fontSize: 14, color: TempleTheme.textMuted },
  questionCount: { fontSize: 11, color: TempleTheme.textMuted, textAlign: 'right', marginTop: 4 },
  submitBtn: { backgroundColor: TempleTheme.red, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: TempleSpacing.md },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFF', fontSize: TempleFonts.heading, fontWeight: '700', letterSpacing: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: TempleTheme.bgCard, borderRadius: 8, borderWidth: 1, borderColor: TempleTheme.goldDark + '40', padding: TempleSpacing.sm, marginBottom: TempleSpacing.sm },
  inputIcon: { fontSize: 20, marginRight: TempleSpacing.sm },
  input: { flex: 1, paddingVertical: 4 },
  inputText: { color: TempleTheme.textLight, fontSize: TempleFonts.body },
});
