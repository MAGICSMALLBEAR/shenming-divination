// 擲筊問事 — 不抽籤，直接向神明請示一件是非題
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Jiaobei } from '@/components/Jiaobei';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { getDefaultRitualStyleKey, type RitualStyleKey } from '@/constants/ritual-styles';
import { gods } from '@/data/gods';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { tossJiaobei, type JiaobeiResult } from '@/services/divination';
import { getSettings } from '@/services/storage';
import type { ThemeColors } from '@/constants/themes';

const QUESTION_MAX_LENGTH = 80;

export default function JiaobeiAskScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const reducedMotion = useReducedMotion();
  const [godId, setGodId] = useState(gods[0].id);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [round, setRound] = useState(0);
  const [results, setResults] = useState<JiaobeiResult[]>([]);
  const [granted, setGranted] = useState(false);
  const [ritualStyle, setRitualStyle] = useState<RitualStyleKey>(getDefaultRitualStyleKey(gods[0]));

  const god = gods.find((item) => item.id === godId) ?? gods[0];

  const selectGod = (id: number) => {
    setGodId(id);
    setRitualStyle(getDefaultRitualStyleKey(gods.find((item) => item.id === id)));
  };

  useEffect(() => {
    getSettings().then((settings) => {
      const preferred = gods.find((item) => item.id === settings?.preferredGodId);
      if (preferred) {
        setGodId(preferred.id);
        setRitualStyle(getDefaultRitualStyleKey(preferred));
      }
    }).catch(() => {});
  }, []);

  const startAsking = () => {
    if (!question.trim()) return;
    setResults([]);
    setGranted(false);
    setRound((value) => value + 1);
    setAsking(true);
  };

  const toss = (): JiaobeiResult => {
    const result = tossJiaobei();
    setResults((prev) => [...prev, result]);
    return result;
  };

  const askAnother = () => {
    setAsking(false);
    setGranted(false);
    setResults([]);
    setQuestion('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => (asking ? setAsking(false) : router.back())}>
          <Text style={styles.backBtnText}>← {asking ? '修改問題' : '返回'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>擲筊問事</Text>
        <Text style={styles.subtitle}>不抽籤，直接向神明請示一件可以用「是／否」回答的事。</Text>
      </View>

      {asking ? (
        <View style={styles.askingArea}>
          <View style={styles.questionBanner}>
            <Text style={styles.questionBannerLabel}>向{god.name}請示</Text>
            <Text style={styles.questionBannerText}>{question.trim()}</Text>
          </View>
          <View style={styles.jiaobeiArea}>
            <Jiaobei
              key={round}
              onToss={toss}
              onShengbei={() => setGranted(true)}
              results={results}
              lowMotion={reducedMotion}
              ritualStyleKey={ritualStyle}
              onStyleChange={setRitualStyle}
            />
          </View>
          {granted ? (
            <View style={styles.grantedCard}>
              <Text style={styles.grantedText}>聖杯：{god.name}允可這件事。</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={askAnother} accessibilityRole="button">
                <Text style={styles.primaryBtnText}>問下一件事</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>請示哪位神明</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.godRow}>
            {gods.map((item) => {
              const selected = item.id === godId;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.godChip, selected && { borderColor: item.accentColor, backgroundColor: item.primaryColor + '40' }]}
                  onPress={() => selectGod(item.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.godChipText, selected && { color: item.accentColor }]}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionTitle}>想請示的事</Text>
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={(text) => setQuestion(text.slice(0, QUESTION_MAX_LENGTH))}
            placeholder="例如：這週適合去面試嗎？"
            placeholderTextColor={theme.textMuted}
            multiline
            accessibilityLabel="想請示的事"
          />
          <Text style={styles.counter}>{question.length}/{QUESTION_MAX_LENGTH}</Text>

          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>擲筊的意思</Text>
            <Text style={styles.guideText}>聖杯（聖筊，一正一反）：神明允可。</Text>
            <Text style={styles.guideText}>笑杯（笑筊，兩個正面）：神明笑而不答，通常是問題不夠清楚，可以換個問法再擲。</Text>
            <Text style={styles.guideText}>陰杯（陰筊，兩個反面）：神明不允，或時機未到。</Text>
            <Text style={[styles.guideText, { marginTop: 6 }]}>一次只問一件事，問題要具體，答案能用「是」或「否」回答。</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, !question.trim() && styles.primaryBtnDisabled]}
            onPress={startAsking}
            disabled={!question.trim()}
            accessibilityRole="button"
            accessibilityLabel={question.trim() ? '開始請示' : '請先輸入想請示的事'}
          >
            <Text style={styles.primaryBtnText}>開始請示</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.bgDark },
    header: {
      paddingHorizontal: TempleSpacing.lg,
      paddingTop: TempleSpacing.md,
      paddingBottom: TempleSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.goldDark + '28',
    },
    backBtn: { marginBottom: TempleSpacing.sm, alignSelf: 'flex-start' },
    backBtnText: { color: theme.gold, fontSize: TempleFonts.small, fontWeight: '600' },
    title: { color: theme.goldLight, fontSize: TempleFonts.heading, fontWeight: '900' },
    subtitle: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 20, marginTop: 4 },
    content: { padding: TempleSpacing.lg },
    sectionTitle: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '800', marginBottom: 8, marginTop: 4 },
    godRow: { gap: 8, paddingBottom: TempleSpacing.md },
    godChip: { borderRadius: 999, borderWidth: 1, borderColor: theme.goldDark + '40', paddingHorizontal: 12, paddingVertical: 6 },
    godChipText: { color: theme.textLight, fontSize: TempleFonts.small },
    input: {
      backgroundColor: theme.bgCard,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.gold + '50',
      padding: 12,
      color: theme.textLight,
      fontSize: TempleFonts.body,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    counter: { color: theme.textMuted, fontSize: 11, textAlign: 'right', marginTop: 4, marginBottom: TempleSpacing.md },
    guideCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '25',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.md,
    },
    guideTitle: { color: theme.goldLight, fontSize: TempleFonts.small, fontWeight: '800', marginBottom: 6 },
    guideText: { color: theme.textMuted, fontSize: 12, lineHeight: 19 },
    primaryBtn: { backgroundColor: theme.red, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    primaryBtnDisabled: { opacity: 0.5 },
    primaryBtnText: { color: '#FFF', fontWeight: '800', fontSize: TempleFonts.body },
    askingArea: { flex: 1 },
    questionBanner: { paddingHorizontal: TempleSpacing.lg, paddingVertical: TempleSpacing.sm },
    questionBannerLabel: { color: theme.textMuted, fontSize: 12 },
    questionBannerText: { color: theme.textLight, fontSize: TempleFonts.body, fontWeight: '700', marginTop: 2 },
    jiaobeiArea: { flex: 1 },
    grantedCard: {
      margin: TempleSpacing.md,
      padding: TempleSpacing.md,
      borderRadius: 12,
      backgroundColor: theme.bgCard,
      borderWidth: 1,
      borderColor: theme.gold + '60',
      gap: 10,
    },
    grantedText: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '800', textAlign: 'center' },
  });
}
