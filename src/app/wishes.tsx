import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import {
  addWish,
  fulfillWish,
  getWishes,
  removeWish,
  type Wish,
} from '@/services/wishTracker';

const REMINDER_OPTIONS = [
  { label: '不提醒', days: 0 },
  { label: '3 天後', days: 3 },
  { label: '7 天後', days: 7 },
  { label: '30 天後', days: 30 },
];

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatReminder(timestamp?: number): string | null {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(
    date.getHours()
  ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function WishesScreen() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [gratitudeText, setGratitudeText] = useState('');
  const [fulfillmentMethod, setFulfillmentMethod] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [reminderDays, setReminderDays] = useState<number>(0);

  const loadData = useCallback(async () => {
    const data = await getWishes();
    setWishes(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetFulfillmentForm = () => {
    setFulfillingId(null);
    setGratitudeText('');
    setFulfillmentMethod('');
    setReflectionText('');
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const handleAdd = async () => {
    if (!newContent.trim()) {
      Alert.alert('還沒寫內容', '先寫下你想持續實踐或等待實現的願望。');
      return;
    }

    const dueDate =
      reminderDays > 0 ? Date.now() + reminderDays * 24 * 60 * 60 * 1000 : undefined;

    await addWish({
      content: newContent.trim(),
      godName: '神明',
      poemNumber: 0,
      poemSummary: '',
      dueDate,
    });

    setNewContent('');
    setReminderDays(0);
    setShowAdd(false);
    await loadData();
  };

  const handleFulfill = async (id: string) => {
    if (!gratitudeText.trim()) {
      Alert.alert('補一段感謝', '還願前先寫下一句感謝，之後回看會更有感。');
      return;
    }

    await fulfillWish(id, {
      gratitude: gratitudeText.trim(),
      fulfillmentMethod: fulfillmentMethod.trim(),
      fulfillmentReflection: reflectionText.trim(),
    });

    resetFulfillmentForm();
    await loadData();
  };

  const handleDelete = (id: string) => {
    Alert.alert('刪除願望', '刪除後就無法復原，確定要移除這個願望嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: async () => {
          await removeWish(id);
          if (fulfillingId === id) {
            resetFulfillmentForm();
          }
          await loadData();
        },
      },
    ]);
  };

  const handleStartFulfill = (id: string) => {
    resetFulfillmentForm();
    setFulfillingId(id);
  };

  const activeWishes = useMemo(
    () =>
      wishes
        .filter((wish) => !wish.fulfilled)
        .sort(
          (left, right) =>
            (left.dueDate ?? Number.MAX_SAFE_INTEGER) -
            (right.dueDate ?? Number.MAX_SAFE_INTEGER)
        ),
    [wishes]
  );

  const fulfilledWishes = useMemo(
    () =>
      wishes
        .filter((wish) => wish.fulfilled)
        .sort((left, right) => (right.fulfilledAt ?? 0) - (left.fulfilledAt ?? 0)),
    [wishes]
  );

  const summary = useMemo(
    () => ({
      active: activeWishes.length,
      reminded: activeWishes.filter((wish) => Boolean(wish.dueDate)).length,
      fulfilled: fulfilledWishes.length,
    }),
    [activeWishes, fulfilledWishes]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
      <View style={styles.container}>
        <Text style={styles.pageTitle}>願望與還願</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.active}</Text>
            <Text style={styles.summaryLabel}>進行中</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.reminded}</Text>
            <Text style={styles.summaryLabel}>有提醒</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.fulfilled}</Text>
            <Text style={styles.summaryLabel}>已完成</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd((value) => !value)}>
          <Text style={styles.addBtnText}>{showAdd ? '收起新增表單' : '+ 新增願望'}</Text>
        </TouchableOpacity>

        {showAdd ? (
          <View style={styles.addForm}>
            <TextInput
              style={styles.addInput}
              value={newContent}
              onChangeText={setNewContent}
              placeholder="寫下你想持續實踐、等待實現或提醒自己的事情。"
              placeholderTextColor={TempleTheme.textMuted}
              multiline
            />

            <Text style={styles.sectionHint}>提醒時間</Text>
            <View style={styles.optionRow}>
              {REMINDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.days}
                  style={[
                    styles.optionChip,
                    reminderDays === option.days && styles.optionChipActive,
                  ]}
                  onPress={() => setReminderDays(option.days)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      reminderDays === option.days && styles.optionChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
              <Text style={styles.submitBtnText}>加入願望清單</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={TempleTheme.gold}
            />
          }
        >
          {!activeWishes.length && !fulfilledWishes.length ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🙏</Text>
              <Text style={styles.emptyText}>目前還沒有願望紀錄</Text>
              <Text style={styles.emptyHint}>可以從求籤結果或自己的生活計畫開始累積。</Text>
            </View>
          ) : null}

          {activeWishes.map((wish) => (
            <View key={wish.id} style={styles.wishCard}>
              <View style={styles.wishHeader}>
                <View style={styles.wishStatus} />
                <Text style={styles.wishDate}>建立於 {formatDate(wish.createdAt)}</Text>
              </View>

              <Text style={styles.wishContent}>{wish.content}</Text>
              {wish.poemNumber > 0 ? (
                <Text style={styles.wishPoem}>來自第 {wish.poemNumber} 籤</Text>
              ) : null}
              {wish.dueDate ? (
                <View style={styles.reminderRow}>
                  <Text style={styles.reminderBadge}>提醒</Text>
                  <Text style={styles.reminderText}>{formatReminder(wish.dueDate)}</Text>
                </View>
              ) : null}

              {fulfillingId === wish.id ? (
                <View style={styles.gratitudeForm}>
                  <TextInput
                    style={styles.gratitudeInput}
                    value={gratitudeText}
                    onChangeText={setGratitudeText}
                    placeholder="完成後想感謝什麼？這次學到了什麼？"
                    placeholderTextColor={TempleTheme.textMuted}
                    multiline
                  />
                  <TextInput
                    style={styles.gratitudeInput}
                    value={fulfillmentMethod}
                    onChangeText={setFulfillmentMethod}
                    placeholder="你是怎麼還願或實際落地的？例如：去拜拜、回饋家人、完成計畫。"
                    placeholderTextColor={TempleTheme.textMuted}
                    multiline
                  />
                  <TextInput
                    style={styles.gratitudeInput}
                    value={reflectionText}
                    onChangeText={setReflectionText}
                    placeholder="補一段回顧，之後回來看會很有力量。"
                    placeholderTextColor={TempleTheme.textMuted}
                    multiline
                  />
                  <View style={styles.gratitudeActions}>
                    <TouchableOpacity
                      onPress={() => handleFulfill(wish.id)}
                      style={styles.gratitudeSaveBtn}
                    >
                      <Text style={styles.gratitudeSaveText}>完成還願</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={resetFulfillmentForm}>
                      <Text style={styles.gratitudeCancelText}>取消</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.wishActions}>
                  <TouchableOpacity
                    onPress={() => handleStartFulfill(wish.id)}
                    style={styles.fulfillBtn}
                  >
                    <Text style={styles.fulfillBtnText}>開始還願</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(wish.id)}>
                    <Text style={styles.deleteBtnText}>刪除</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {fulfilledWishes.length ? (
            <>
              <Text style={styles.sectionTitle}>已完成與還願</Text>
              {fulfilledWishes.map((wish) => (
                <View key={wish.id} style={[styles.wishCard, styles.wishCardFulfilled]}>
                  <View style={styles.wishHeader}>
                    <View style={styles.wishStatusFulfilled} />
                    <Text style={styles.wishDate}>
                      完成於 {formatDate(wish.fulfilledAt ?? wish.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.wishContent}>{wish.content}</Text>
                  {wish.fulfillmentMethod ? (
                    <Text style={styles.fulfillmentMeta}>還願方式：{wish.fulfillmentMethod}</Text>
                  ) : null}
                  {wish.gratitude ? (
                    <Text style={styles.gratitudeText}>感謝：{wish.gratitude}</Text>
                  ) : null}
                  {wish.fulfillmentReflection ? (
                    <Text style={styles.reflectionText}>回顧：{wish.fulfillmentReflection}</Text>
                  ) : null}
                </View>
              ))}
            </>
          ) : null}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  container: { flex: 1, padding: TempleSpacing.md },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: TempleSpacing.sm,
    marginBottom: TempleSpacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '25',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: TempleTheme.goldLight,
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 11,
    color: TempleTheme.textMuted,
  },
  addBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
    alignItems: 'center',
    backgroundColor: TempleTheme.bgCard,
    marginBottom: TempleSpacing.sm,
  },
  addBtnText: {
    fontSize: TempleFonts.body,
    color: TempleTheme.goldLight,
    fontWeight: '700',
  },
  addForm: {
    marginBottom: TempleSpacing.md,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '25',
  },
  addInput: {
    backgroundColor: TempleTheme.bgDark + '35',
    borderRadius: 8,
    padding: TempleSpacing.sm,
    fontSize: TempleFonts.body,
    color: TempleTheme.textLight,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '25',
    minHeight: 76,
    textAlignVertical: 'top',
  },
  sectionHint: {
    marginTop: TempleSpacing.sm,
    marginBottom: TempleSpacing.xs,
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TempleSpacing.xs,
    marginBottom: TempleSpacing.md,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: TempleTheme.bgDark + '40',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
  },
  optionChipActive: {
    backgroundColor: TempleTheme.goldDark + '25',
    borderColor: TempleTheme.gold,
  },
  optionChipText: {
    fontSize: 12,
    color: TempleTheme.textMuted,
  },
  optionChipTextActive: {
    color: TempleTheme.goldLight,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: TempleTheme.red,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: TempleTheme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '700',
  },
  listContent: {},
  emptyState: {
    alignItems: 'center',
    paddingVertical: TempleSpacing.xxl * 2,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 52,
    fontSize: 22,
    color: TempleTheme.goldLight,
    backgroundColor: TempleTheme.bgCard,
    marginBottom: TempleSpacing.md,
  },
  emptyText: {
    fontSize: TempleFonts.body,
    color: TempleTheme.textMuted,
  },
  emptyHint: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    marginTop: TempleSpacing.xs,
    opacity: 0.75,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    marginBottom: TempleSpacing.sm,
    marginTop: TempleSpacing.md,
  },
  wishCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
  },
  wishCardFulfilled: {
    opacity: 0.84,
  },
  wishHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TempleSpacing.xs,
  },
  wishStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: TempleTheme.warning,
    marginRight: 8,
  },
  wishStatusFulfilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: TempleTheme.success,
    marginRight: 8,
  },
  wishDate: {
    fontSize: 11,
    color: TempleTheme.textMuted,
  },
  wishContent: {
    fontSize: TempleFonts.body,
    color: TempleTheme.textLight,
    lineHeight: 24,
  },
  wishPoem: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    marginTop: TempleSpacing.xs,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: TempleSpacing.sm,
    gap: 8,
  },
  reminderBadge: {
    fontSize: 11,
    color: TempleTheme.bgDark,
    backgroundColor: TempleTheme.gold,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  reminderText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.goldLight,
  },
  wishActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: TempleSpacing.md,
    marginTop: TempleSpacing.sm,
  },
  fulfillBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: TempleTheme.success + '20',
  },
  fulfillBtnText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.success,
    fontWeight: '600',
  },
  deleteBtnText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.danger,
    paddingVertical: 6,
  },
  gratitudeForm: {
    marginTop: TempleSpacing.sm,
    gap: TempleSpacing.xs,
  },
  gratitudeInput: {
    backgroundColor: TempleTheme.bgDark + '40',
    borderRadius: 8,
    padding: TempleSpacing.sm,
    fontSize: TempleFonts.small,
    color: TempleTheme.textLight,
    minHeight: 64,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
    textAlignVertical: 'top',
  },
  gratitudeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: TempleSpacing.md,
    marginTop: 6,
  },
  gratitudeSaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: TempleTheme.goldDark + '40',
  },
  gratitudeSaveText: {
    color: TempleTheme.goldLight,
    fontWeight: '600',
  },
  gratitudeCancelText: {
    color: TempleTheme.textMuted,
  },
  fulfillmentMeta: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    marginTop: TempleSpacing.sm,
    lineHeight: 20,
  },
  gratitudeText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.goldLight,
    marginTop: TempleSpacing.sm,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  reflectionText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    marginTop: TempleSpacing.xs,
    lineHeight: 20,
  },
});
