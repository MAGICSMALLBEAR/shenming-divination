// 抄經 — 逐字抄寫《心經》，抄完記一次修持並算當天簽到
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import {
  HEART_SUTRA_CHARS,
  HEART_SUTRA_SOURCE,
  HEART_SUTRA_TEXT,
  HEART_SUTRA_TITLE,
  HEART_SUTRA_TRANSLATOR,
  isHanChar,
  toHanChars,
} from '@/data/heartSutra';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getDailyPractice, recordSutraCopy, saveSutraDraft } from '@/services/dailyPractice';
import type { ThemeColors } from '@/constants/themes';

const DRAFT_SAVE_DELAY_MS = 800;
const NEXT_PREVIEW_LENGTH = 12;

// 經文每個字元對應的漢字序號；標點為 -1
const SUTRA_LAYOUT = Array.from(HEART_SUTRA_TEXT).reduce<{ char: string; hanIndex: number }[]>((acc, char) => {
  const hanCount = acc.filter((item) => item.hanIndex >= 0).length;
  acc.push({ char, hanIndex: isHanChar(char) ? hanCount : -1 });
  return acc;
}, []);

export default function SutraCopyScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [input, setInput] = useState('');
  const [copies, setCopies] = useState(0);
  const [finished, setFinished] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getDailyPractice().then((state) => {
      setCopies(state.sutraCopies.length);
      if (state.sutraDraft?.text) setInput(state.sutraDraft.text);
    }).catch(() => {});
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const typed = toHanChars(input);
  const correctCount = typed.filter((char, index) => char === HEART_SUTRA_CHARS[index]).length;
  const firstWrong = typed.findIndex((char, index) => char !== HEART_SUTRA_CHARS[index]);
  const complete = typed.length >= HEART_SUTRA_CHARS.length && firstWrong === -1;

  const onChangeText = (text: string) => {
    setInput(text);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveSutraDraft(text).catch(() => {});
    }, DRAFT_SAVE_DELAY_MS);
  };

  const finish = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const state = await recordSutraCopy();
    setCopies(state.sutraCopies.length);
    setFinished(true);
  };

  const startAgain = () => {
    setInput('');
    setFinished(false);
  };

  // 經文逐字上色：已抄對、抄錯、下一個要抄的字、尚未抄
  const sutraSpans = SUTRA_LAYOUT.map(({ char, hanIndex: index }, position) => {
    if (index < 0) {
      return <Text key={position} style={styles.punct}>{char}</Text>;
    }
    let style = styles.pending;
    if (index < typed.length) style = typed[index] === char ? styles.correct : styles.wrong;
    else if (index === typed.length) style = styles.next;
    return <Text key={position} style={style}>{char}</Text>;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>抄經・心經</Text>
        <Text style={styles.subtitle}>靜心逐字抄寫，抄完即完成今日修持。已累計抄經 {copies} 部。</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.sutraCard}>
          <Text style={styles.sutraTitle}>{HEART_SUTRA_TITLE}</Text>
          <Text style={styles.translator}>{HEART_SUTRA_TRANSLATOR}</Text>
          <Text style={styles.sutraBody}>{sutraSpans}</Text>
        </View>

        <Text style={styles.progress} accessibilityLiveRegion="polite">
          已抄 {correctCount} / {HEART_SUTRA_CHARS.length} 字
        </Text>
        {firstWrong >= 0 ? (
          <Text style={styles.wrongHint}>
            第 {firstWrong + 1} 字應為「{HEART_SUTRA_CHARS[firstWrong]}」，可以刪掉重寫。
          </Text>
        ) : null}
        {/* 經文很長，手機上抄寫時看不到上方進度，直接在輸入框旁提示接下來的字 */}
        {!finished && firstWrong === -1 && typed.length < HEART_SUTRA_CHARS.length ? (
          <Text style={styles.nextStrip}>
            接下來：
            <Text style={styles.nextStripChar}>{HEART_SUTRA_CHARS[typed.length]}</Text>
            {HEART_SUTRA_CHARS.slice(typed.length + 1, typed.length + NEXT_PREVIEW_LENGTH).join('')}
          </Text>
        ) : null}

        {finished ? (
          <View style={styles.doneCard}>
            <Text style={styles.doneTitle}>功德圓滿</Text>
            <Text style={styles.doneText}>已抄完一部《心經》，今日修持已記錄。累計抄經 {copies} 部。</Text>
            <TouchableOpacity style={styles.secondaryBtn} onPress={startAgain} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>再抄一部</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={onChangeText}
              placeholder="在這裡逐字抄寫經文（標點可以不打）"
              placeholderTextColor={theme.textMuted}
              multiline
              autoCorrect={false}
              accessibilityLabel="抄經輸入"
            />
            <TouchableOpacity
              style={[styles.primaryBtn, !complete && styles.primaryBtnDisabled]}
              onPress={finish}
              disabled={!complete}
              accessibilityRole="button"
              accessibilityLabel={complete ? '圓滿回向' : '抄完全部經文後才能回向'}
            >
              <Text style={styles.primaryBtnText}>圓滿回向</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.sourceNote}>
          經文依 {HEART_SUTRA_SOURCE}。咒語斷句為本 App 所加；台灣常見流通本咒語作「揭諦揭諦，波羅揭諦，波羅僧揭諦，菩提薩婆訶」。
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>
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
    sutraCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.goldDark + '35',
      padding: TempleSpacing.md,
      marginBottom: TempleSpacing.sm,
    },
    sutraTitle: { color: theme.goldLight, fontSize: TempleFonts.body, fontWeight: '900', textAlign: 'center' },
    translator: { color: theme.textMuted, fontSize: 12, textAlign: 'center', marginTop: 2, marginBottom: TempleSpacing.sm },
    sutraBody: { fontSize: 19, lineHeight: 34, letterSpacing: 2 },
    pending: { color: theme.textMuted + '99' },
    next: { color: theme.textLight, textDecorationLine: 'underline', fontWeight: '800' },
    correct: { color: theme.gold, fontWeight: '700' },
    wrong: { color: theme.danger, fontWeight: '800', textDecorationLine: 'line-through' },
    punct: { color: theme.textMuted + '99' },
    progress: { color: theme.textLight, fontSize: TempleFonts.small, fontWeight: '700', marginBottom: 4 },
    wrongHint: { color: theme.danger, fontSize: 12, marginBottom: 6 },
    nextStrip: { color: theme.textMuted, fontSize: TempleFonts.body, letterSpacing: 2, marginTop: 4 },
    nextStripChar: { color: theme.goldLight, fontWeight: '900', textDecorationLine: 'underline' },
    input: {
      backgroundColor: theme.bgCard,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.gold + '50',
      padding: 12,
      color: theme.textLight,
      fontSize: TempleFonts.body,
      minHeight: 140,
      textAlignVertical: 'top',
      marginTop: 6,
      marginBottom: TempleSpacing.md,
    },
    primaryBtn: { backgroundColor: theme.red, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    primaryBtnDisabled: { opacity: 0.5 },
    primaryBtnText: { color: '#FFF', fontWeight: '800', fontSize: TempleFonts.body },
    secondaryBtn: { borderRadius: 10, borderWidth: 1, borderColor: theme.gold + '70', paddingVertical: 10, alignItems: 'center' },
    secondaryBtnText: { color: theme.gold, fontSize: TempleFonts.small, fontWeight: '700' },
    doneCard: {
      backgroundColor: theme.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.gold + '60',
      padding: TempleSpacing.md,
      gap: 10,
      marginTop: 6,
    },
    doneTitle: { color: theme.goldLight, fontSize: TempleFonts.heading, fontWeight: '900', textAlign: 'center' },
    doneText: { color: theme.textLight, fontSize: TempleFonts.small, lineHeight: 22, textAlign: 'center' },
    sourceNote: { color: theme.textMuted, fontSize: 11, lineHeight: 17, marginTop: TempleSpacing.md },
  });
}
