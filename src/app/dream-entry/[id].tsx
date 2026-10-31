import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  deleteDreamEntry,
  getDreamEntry,
  updateDreamEntry,
  addDreamFollowup,
  type DreamJournalEntry,
  type DreamTag,
} from '@/services/dreamJournal';
import { askDreamFollowup } from '@/services/dreamFollowup';

const ALL_TAGS: DreamTag[] = ['惡夢', '好夢', '清醒夢', '反覆夢', '奇異夢'];

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' }).format(timestamp);
}

export default function DreamEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const s = useMemo(() => styles(theme), [theme]);
  const [entry, setEntry] = useState<DreamJournalEntry | null>(null);
  const [reflection, setReflection] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState('');
  const [asking, setAsking] = useState(false);

  // 編輯模式狀態
  const [isEditing, setIsEditing] = useState(false);
  const [editDream, setEditDream] = useState('');
  const [editFeeling, setEditFeeling] = useState('');
  const [editTags, setEditTags] = useState<DreamTag[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const found = await getDreamEntry(id);
    setEntry(found);
    setReflection(found?.reflection ?? '');
    if (found) {
      setEditDream(found.dream);
      setEditFeeling(found.feeling ?? '');
      setEditTags(found.tags ?? []);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const startEditing = () => {
    if (!entry) return;
    setEditDream(entry.dream);
    setEditFeeling(entry.feeling ?? '');
    setEditTags([...entry.tags]);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (!entry) return;
    setEditDream(entry.dream);
    setEditFeeling(entry.feeling ?? '');
    setEditTags([...entry.tags]);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (!entry || !editDream.trim()) return;
    setEditSaving(true);
    await updateDreamEntry(entry.id, {
      dream: editDream.trim(),
      feeling: editFeeling.trim() || undefined,
      tags: editTags,
    });
    setEntry({
      ...entry,
      dream: editDream.trim(),
      feeling: editFeeling.trim() || undefined,
      tags: editTags,
    });
    setEditSaving(false);
    setIsEditing(false);
  };

  const toggleTag = (tag: DreamTag) => {
    setEditTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const saveReflection = async () => {
    if (!entry) return;
    setSaving(true);
    await updateDreamEntry(entry.id, { reflection: reflection.trim() || undefined });
    setSaving(false);
    setSaved(true);
  };

  const remove = () =>
    Alert.alert('刪除這則夢境？', '刪除後無法復原。', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: async () => {
          if (entry) await deleteDreamEntry(entry.id);
          router.back();
        },
      },
    ]);

  const ask = async () => {
    if (!entry || !question.trim()) return;
    setAsking(true);
    setReply('');
    try {
      const q = question.trim();
      const answer = await askDreamFollowup(entry, q);
      setReply(answer);
      // 持久化儲存追問與回答
      const savedQa = await addDreamFollowup(entry.id, q, answer);
      setEntry((prev) => prev ? {
        ...prev,
        followups: [...(prev.followups || []), savedQa],
      } : prev);
      setQuestion(''); // 清空問題欄位以便繼續追問
    } catch (error) {
      setReply(error instanceof Error ? error.message : 'AI 暫時無法回應，請稍後再試。');
    } finally {
      setAsking(false);
    }
  };

  if (!entry) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loading}>
          <ActivityIndicator color={theme.gold} />
          <Text style={s.loadingText}>正在讀取夢境⋯</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.back}>‹ 返回日記</Text>
          </TouchableOpacity>
          <View style={s.topActions}>
            <TouchableOpacity onPress={isEditing ? cancelEditing : startEditing} style={s.actionBtn}>
              <Text style={s.actionBtnText}>{isEditing ? '取消編輯' : '✏️ 編輯'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={remove} style={[s.actionBtn, s.deleteBtn]}>
              <Text style={s.delete}>刪除</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.title}>夢境詳情</Text>
        <Text style={s.date}>{formatDate(entry.createdAt)}</Text>

        {isEditing ? (
          <View style={s.card}>
            <Text style={s.sectionTitle}>編輯夢境內容</Text>
            <Text style={s.fieldLabel}>夢境過程：</Text>
            <TextInput
              value={editDream}
              onChangeText={setEditDream}
              placeholder="請輸入夢境內容…"
              placeholderTextColor={theme.textMuted}
              multiline
              textAlignVertical="top"
              style={s.editInput}
            />

            <Text style={s.fieldLabel}>醒來感受（可選）：</Text>
            <TextInput
              value={editFeeling}
              onChangeText={setEditFeeling}
              placeholder="例如：心跳很快、安心、若有所思…"
              placeholderTextColor={theme.textMuted}
              style={s.singleInput}
            />

            <Text style={s.fieldLabel}>夢境標籤：</Text>
            <View style={s.chips}>
              {ALL_TAGS.map((tag) => {
                const selected = editTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[s.editTagChip, selected && s.editTagChipSelected]}
                  >
                    <Text style={[s.editTagText, selected && s.editTagTextSelected]}>
                      {tag} {selected ? '✓' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[s.saveButton, (!editDream.trim() || editSaving) && { opacity: 0.6 }]}
              disabled={!editDream.trim() || editSaving}
              onPress={saveEdit}
            >
              <Text style={s.saveText}>{editSaving ? '儲存中⋯' : '儲存修改'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.card}>
            <View style={s.cardHeaderRow}>
              <Text style={s.sectionTitle}>夢境記錄</Text>
              <TouchableOpacity onPress={startEditing}>
                <Text style={s.editLink}>編輯內容 ›</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.dream}>{entry.dream}</Text>
            {entry.feeling ? <Text style={s.feeling}>醒來感受：{entry.feeling}</Text> : null}
            <View style={s.chips}>
              {entry.tags.map((tag) => (
                <View key={tag} style={s.tag}>
                  <Text style={s.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={s.card}>
          <Text style={s.sectionTitle}>出現的夢象</Text>
          <View style={s.chips}>
            {entry.result.symbols.length ? (
              entry.result.symbols.map((symbol) => (
                <View key={symbol} style={s.symbol}>
                  <Text style={s.symbolText}>{symbol}</Text>
                </View>
              ))
            ) : (
              <Text style={s.muted}>這則夢境沒有辨識到特定夢象。</Text>
            )}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>夢境核心解析</Text>
          <Text style={s.body}>{entry.result.interpretation}</Text>
        </View>

        {/* 周公解夢傳統視角 */}
        {entry.result.traditionalView ? (
          <View style={s.card}>
            <Text style={s.sectionTitle}>📜 周公解夢傳統視角</Text>
            <Text style={s.body}>{entry.result.traditionalView}</Text>
          </View>
        ) : null}

        {/* 現代心理覺察視角 */}
        {entry.result.psychologicalView ? (
          <View style={s.card}>
            <Text style={s.sectionTitle}>🧠 現代心理覺察視角</Text>
            <Text style={s.body}>{entry.result.psychologicalView}</Text>
          </View>
        ) : null}

        <View style={s.card}>
          <Text style={s.sectionTitle}>給你的提醒</Text>
          <Text style={s.advice}>{entry.result.advice}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>醒來後的心得</Text>
          <Text style={s.helper}>可以寫下聯想到的近況、人物或之後發生的事，幫助你回看反覆夢境。</Text>
          <TextInput
            value={reflection}
            onChangeText={(value) => {
              setReflection(value);
              setSaved(false);
            }}
            placeholder="例如：這讓我想到最近的工作壓力⋯"
            placeholderTextColor={theme.textMuted}
            multiline
            textAlignVertical="top"
            style={s.input}
            accessibilityLabel="醒來後心得"
          />
          <TouchableOpacity
            style={[s.saveButton, saving && { opacity: 0.6 }]}
            disabled={saving}
            onPress={saveReflection}
          >
            <Text style={s.saveText}>{saving ? '儲存中⋯' : saved ? '已儲存心得' : '儲存心得'}</Text>
          </TouchableOpacity>
        </View>

        {/* 深入追問與反思對話 */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>針對這個夢深入追問</Text>
          <Text style={s.helper}>例如：「這個夢象為什麼反覆出現？」或「這和最近工作或感情有何關聯？」</Text>

          {/* 歷史追問問答清單 */}
          {entry.followups && entry.followups.length > 0 && (
            <View style={s.followupHistoryList}>
              <Text style={s.followupHistoryTitle}>💬 反思問答紀錄 ({entry.followups.length})</Text>
              {entry.followups.map((qa, index) => (
                <View key={qa.id || index} style={s.followupItem}>
                  <View style={s.questionBubble}>
                    <Text style={s.qaRole}>💭 你提問：</Text>
                    <Text style={s.questionText}>{qa.question}</Text>
                  </View>
                  <View style={s.replyBubble}>
                    <Text style={s.qaRoleAi}>💡 AI 導師反思指引：</Text>
                    <Text style={s.replyText}>{qa.reply}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="輸入想深入探索的問題⋯"
            placeholderTextColor={theme.textMuted}
            multiline
            style={s.questionInput}
            accessibilityLabel="夢境追問"
          />
          <TouchableOpacity
            style={[s.saveButton, (!question.trim() || asking) && { opacity: 0.6 }]}
            disabled={!question.trim() || asking}
            onPress={ask}
          >
            <Text style={s.saveText}>{asking ? '思考中⋯' : '請 AI 協助反思'}</Text>
          </TouchableOpacity>
          {reply && (!entry.followups || !entry.followups.some(f => f.reply === reply)) ? (
            <Text style={s.reply}>{reply}</Text>
          ) : null}
        </View>

        <View style={s.notice}>
          <Text style={s.noticeTitle}>溫和提醒</Text>
          <Text style={s.noticeText}>
            夢境解讀是自我探索的線索，不是對未來的預言。若惡夢或睡眠困擾持續影響生活，請考慮與醫療或心理專業人員討論。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bgDark },
    container: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { color: theme.textMuted },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: TempleSpacing.md },
    topActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    actionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.gold + '40' },
    actionBtnText: { color: theme.goldLight, fontSize: TempleFonts.small, fontWeight: 'bold' },
    deleteBtn: { borderColor: theme.danger + '60' },
    back: { color: theme.textGold, fontWeight: 'bold' },
    delete: { color: theme.danger, fontWeight: 'bold', fontSize: TempleFonts.small },
    title: { color: theme.textGold, fontSize: TempleFonts.title, fontWeight: 'bold', textAlign: 'center' },
    date: { color: theme.textMuted, fontSize: TempleFonts.small, textAlign: 'center', marginVertical: TempleSpacing.md },
    card: { backgroundColor: theme.bgCard, borderColor: theme.gold + '30', borderWidth: 1, borderRadius: 14, padding: TempleSpacing.md, marginBottom: 10 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    editLink: { color: theme.gold, fontSize: TempleFonts.small, fontWeight: 'bold' },
    sectionTitle: { color: theme.textGold, fontWeight: 'bold', fontSize: TempleFonts.heading, marginBottom: 8 },
    fieldLabel: { color: theme.goldLight, fontSize: TempleFonts.small, fontWeight: 'bold', marginTop: 10, marginBottom: 6 },
    dream: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 25 },
    feeling: { color: theme.textMuted, marginTop: 10, fontSize: TempleFonts.small },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 6 },
    tag: { backgroundColor: theme.bgMedium, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
    tagText: { color: theme.textMuted, fontSize: TempleFonts.caption },
    editTagChip: { backgroundColor: theme.bgDark, borderWidth: 1, borderColor: theme.gold + '40', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
    editTagChipSelected: { backgroundColor: theme.gold + '30', borderColor: theme.gold },
    editTagText: { color: theme.textMuted, fontSize: TempleFonts.small },
    editTagTextSelected: { color: theme.goldLight, fontWeight: 'bold' },
    symbol: { backgroundColor: theme.gold + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 13 },
    symbolText: { color: theme.textGold, fontSize: TempleFonts.small },
    muted: { color: theme.textMuted, fontSize: TempleFonts.small },
    body: { color: theme.textLight, lineHeight: 24 },
    advice: { color: theme.textLight, lineHeight: 24, borderLeftColor: theme.gold, borderLeftWidth: 3, paddingLeft: 10 },
    helper: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 20, marginBottom: 10 },
    input: { minHeight: 105, color: theme.textLight, backgroundColor: theme.bgMedium, borderColor: theme.gold + '25', borderWidth: 1, borderRadius: 10, padding: TempleSpacing.md, fontSize: TempleFonts.body, lineHeight: 22 },
    editInput: { minHeight: 120, color: theme.textLight, backgroundColor: theme.bgMedium, borderColor: theme.gold + '35', borderWidth: 1, borderRadius: 10, padding: TempleSpacing.md, fontSize: TempleFonts.body, lineHeight: 22 },
    singleInput: { color: theme.textLight, backgroundColor: theme.bgMedium, borderColor: theme.gold + '35', borderWidth: 1, borderRadius: 10, paddingHorizontal: TempleSpacing.md, paddingVertical: 10, fontSize: TempleFonts.body },
    saveButton: { marginTop: 14, alignItems: 'center', borderRadius: 20, backgroundColor: theme.gold, paddingVertical: 11 },
    saveText: { color: theme.bgDark, fontWeight: 'bold' },
    notice: { backgroundColor: theme.gold + '18', borderColor: theme.gold + '45', borderWidth: 1, borderRadius: 14, padding: TempleSpacing.md, marginTop: TempleSpacing.sm },
    noticeTitle: { color: theme.textGold, fontWeight: 'bold', marginBottom: 4 },
    noticeText: { color: theme.textLight, fontSize: TempleFonts.small, lineHeight: 21 },
    questionInput: { minHeight: 80, color: theme.textLight, backgroundColor: theme.bgMedium, borderColor: theme.gold + '25', borderWidth: 1, borderRadius: 10, padding: TempleSpacing.md, fontSize: TempleFonts.body },
    reply: { color: theme.textLight, lineHeight: 24, marginTop: 12, backgroundColor: theme.bgMedium, borderRadius: 10, padding: TempleSpacing.md },

    // 追問歷史問答
    followupHistoryList: {
      marginBottom: TempleSpacing.md,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.gold + '20',
      paddingBottom: TempleSpacing.md,
    },
    followupHistoryTitle: {
      color: theme.goldLight,
      fontWeight: 'bold',
      fontSize: TempleFonts.small,
      marginBottom: 4,
    },
    followupItem: {
      backgroundColor: theme.bgDark,
      borderRadius: 10,
      padding: TempleSpacing.sm,
      gap: 6,
      borderWidth: 1,
      borderColor: theme.gold + '25',
    },
    questionBubble: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 4,
    },
    qaRole: {
      color: theme.gold,
      fontWeight: 'bold',
      fontSize: 12,
    },
    questionText: {
      color: theme.textLight,
      fontSize: 13,
      flex: 1,
      lineHeight: 18,
    },
    replyBubble: {
      marginTop: 2,
      backgroundColor: theme.bgMedium,
      borderRadius: 8,
      padding: 8,
      borderLeftWidth: 2,
      borderLeftColor: theme.gold,
    },
    qaRoleAi: {
      color: theme.goldLight,
      fontWeight: 'bold',
      fontSize: 11,
      marginBottom: 3,
    },
    replyText: {
      color: theme.textLight,
      fontSize: 12,
      lineHeight: 18,
    },
  });
