import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
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

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFadeIn, useStaggeredList } from '@/hooks/useEntranceAnimation';
import { ListItemSkeleton } from '@/components/Skeleton';
import { useI18n } from '@/hooks/useI18n';
import type { ThemeColors } from '@/constants/themes';
import {
  addWish,
  fulfillWish,
  getWishes,
  removeWish,
  type Wish,
} from '@/services/wishTracker';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

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

function AnimatedWishItem({ delay, children }: { delay: number; children: React.ReactNode }) {
  const { opacity, translateY } = useFadeIn({ delay });
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function AnimatedForm({ show, children }: { show: boolean; children: React.ReactNode }) {
  const { opacity, translateY } = useFadeIn({ delay: 0, disabled: !show });
  if (!show) return null;
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function WishesScreen() {
  const layout = useResponsiveLayout();
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [gratitudeText, setGratitudeText] = useState('');
  const [fulfillmentMethod, setFulfillmentMethod] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [reminderDays, setReminderDays] = useState<number>(0);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = useCallback(async () => {
    const data = await getWishes();
    setWishes(data);
  }, []);

  useEffect(() => {
    loadData().finally(() => setInitialLoading(false));
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

  const activeCount = activeWishes.length;
  const fulfilledCount = fulfilledWishes.length;
  const activeDelays = useStaggeredList({ itemCount: Math.max(activeCount, 1), staggerDelay: 60 });
  const fulfilledDelays = useStaggeredList({ itemCount: Math.max(fulfilledCount, 1), staggerDelay: 60 });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bgDark} />
      <View
        style={[
          styles.container,
          { maxWidth: layout.contentMaxWidth, paddingHorizontal: layout.gutter },
        ]}
      >
        <Text style={styles.pageTitle}>{t('wishesPageHeader')}</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.active}</Text>
            <Text style={styles.summaryLabel}>{t('wishesActive')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.reminded}</Text>
            <Text style={styles.summaryLabel}>{t('wishesReminded')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.fulfilled}</Text>
            <Text style={styles.summaryLabel}>{t('wishesFulfilled')}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd((value) => !value)}>
          <Text style={styles.addBtnText}>{showAdd ? t('wishesAddBtnCollapse') : t('wishesAddBtn')}</Text>
        </TouchableOpacity>

        <AnimatedForm show={showAdd}>
          <View style={styles.addForm}>
            <TextInput
              style={styles.addInput}
              value={newContent}
              onChangeText={setNewContent}
              placeholder={t('wishesAddPlaceholder')}
              placeholderTextColor={theme.textMuted}
              multiline
            />

            <Text style={styles.sectionHint}>{t('wishesLabelReminder')}</Text>
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
              <Text style={styles.submitBtnText}>{t('wishesSubmitBtn')}</Text>
            </TouchableOpacity>
          </View>
        </AnimatedForm>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            layout.isDesktop && styles.listContentDesktop,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.gold}
            />
          }
        >
          {initialLoading ? (
            <View style={{ paddingHorizontal: TempleSpacing.sm }}>
              <ListItemSkeleton lines={3} />
              <ListItemSkeleton lines={2} />
              <ListItemSkeleton lines={3} />
            </View>
          ) : !activeWishes.length && !fulfilledWishes.length ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🙏</Text>
              <Text style={styles.emptyText}>{t('wishesEmptyTitle')}</Text>
              <Text style={styles.emptyHint}>可以從求籤結果或自己的生活計畫開始累積。</Text>
            </View>
          ) : null}

          {activeWishes.map((wish, i) => (
            <AnimatedWishItem key={wish.id} delay={activeDelays[i]?.delay ?? 0}>
              <View
                style={[styles.wishCard, layout.isDesktop && styles.wishCardDesktop]}
              >
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
                    placeholderTextColor={theme.textMuted}
                    multiline
                  />
                  <TextInput
                    style={styles.gratitudeInput}
                    value={fulfillmentMethod}
                    onChangeText={setFulfillmentMethod}
                    placeholder="你是怎麼還願或實際落地的？例如：去拜拜、回饋家人、完成計畫。"
                    placeholderTextColor={theme.textMuted}
                    multiline
                  />
                  <TextInput
                    style={styles.gratitudeInput}
                    value={reflectionText}
                    onChangeText={setReflectionText}
                    placeholder="補一段回顧，之後回來看會很有力量。"
                    placeholderTextColor={theme.textMuted}
                    multiline
                  />
                  <View style={styles.gratitudeActions}>
                    <TouchableOpacity
                      onPress={() => handleFulfill(wish.id)}
                      style={styles.gratitudeSaveBtn}
                    >
                      <Text style={styles.gratitudeSaveText}>{t('wishesButtonConfirmFulfill')}</Text>
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
                    <Text style={styles.fulfillBtnText}>{t('wishesButtonFulfill')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(wish.id)}>
                    <Text style={styles.deleteBtnText}>{t('wishesButtonDelete')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            </AnimatedWishItem>
          ))}

          {fulfilledWishes.length ? (
            <>
              <Text style={styles.sectionTitle}>{t('wishesSectionTitleFulfilled')}</Text>
              {fulfilledWishes.map((wish, i) => (
                <AnimatedWishItem key={wish.id} delay={fulfilledDelays[i]?.delay ?? 0}>
                  <View
                    style={[
                      styles.wishCard,
                      styles.wishCardFulfilled,
                      layout.isDesktop && styles.wishCardDesktop,
                    ]}
                  >
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
                </AnimatedWishItem>
              ))}
            </>
          ) : null}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bgDark },
  container: { flex: 1, paddingVertical: TempleSpacing.md, width: '100%', alignSelf: 'center' },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: theme.goldLight,
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
    backgroundColor: theme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: theme.goldDark + '25',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.goldLight,
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 11,
    color: theme.textMuted,
  },
  addBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
    alignItems: 'center',
    backgroundColor: theme.bgCard,
    marginBottom: TempleSpacing.sm,
  },
  addBtnText: {
    fontSize: TempleFonts.body,
    color: theme.goldLight,
    fontWeight: '700',
  },
  addForm: {
    marginBottom: TempleSpacing.md,
    backgroundColor: theme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    borderWidth: 1,
    borderColor: theme.goldDark + '25',
  },
  addInput: {
    backgroundColor: theme.bgDark + '35',
    borderRadius: 8,
    padding: TempleSpacing.sm,
    fontSize: TempleFonts.body,
    color: theme.textLight,
    borderWidth: 1,
    borderColor: theme.goldDark + '25',
    minHeight: 76,
    textAlignVertical: 'top',
  },
  sectionHint: {
    marginTop: TempleSpacing.sm,
    marginBottom: TempleSpacing.xs,
    color: theme.textMuted,
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
    backgroundColor: theme.bgDark + '40',
    borderWidth: 1,
    borderColor: theme.goldDark + '20',
  },
  optionChipActive: {
    backgroundColor: theme.goldDark + '25',
    borderColor: theme.gold,
  },
  optionChipText: {
    fontSize: 12,
    color: theme.textMuted,
  },
  optionChipTextActive: {
    color: theme.goldLight,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: theme.red,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: theme.goldLight,
    fontSize: TempleFonts.body,
    fontWeight: '700',
  },
  listContent: {},
  listContentDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TempleSpacing.md,
    alignItems: 'flex-start',
  },
  emptyState: {
    width: '100%',
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
    color: theme.goldLight,
    backgroundColor: theme.bgCard,
    marginBottom: TempleSpacing.md,
  },
  emptyText: {
    fontSize: TempleFonts.body,
    color: theme.textMuted,
  },
  emptyHint: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
    marginTop: TempleSpacing.xs,
    opacity: 0.75,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    width: '100%',
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: theme.goldLight,
    marginBottom: TempleSpacing.sm,
    marginTop: TempleSpacing.md,
  },
  wishCard: {
    backgroundColor: theme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
  },
  wishCardDesktop: {
    width: '48.8%',
    marginBottom: 0,
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
    backgroundColor: theme.warning,
    marginRight: 8,
  },
  wishStatusFulfilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.success,
    marginRight: 8,
  },
  wishDate: {
    fontSize: 11,
    color: theme.textMuted,
  },
  wishContent: {
    fontSize: TempleFonts.body,
    color: theme.textLight,
    lineHeight: 24,
  },
  wishPoem: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
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
    color: theme.bgDark,
    backgroundColor: theme.gold,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  reminderText: {
    fontSize: TempleFonts.small,
    color: theme.goldLight,
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
    backgroundColor: theme.success + '20',
  },
  fulfillBtnText: {
    fontSize: TempleFonts.small,
    color: theme.success,
    fontWeight: '600',
  },
  deleteBtnText: {
    fontSize: TempleFonts.small,
    color: theme.danger,
    paddingVertical: 6,
  },
  gratitudeForm: {
    marginTop: TempleSpacing.sm,
    gap: TempleSpacing.xs,
  },
  gratitudeInput: {
    backgroundColor: theme.bgDark + '40',
    borderRadius: 8,
    padding: TempleSpacing.sm,
    fontSize: TempleFonts.small,
    color: theme.textLight,
    minHeight: 64,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
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
    backgroundColor: theme.goldDark + '40',
  },
  gratitudeSaveText: {
    color: theme.goldLight,
    fontWeight: '600',
  },
  gratitudeCancelText: {
    color: theme.textMuted,
  },
  fulfillmentMeta: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
    marginTop: TempleSpacing.sm,
    lineHeight: 20,
  },
  gratitudeText: {
    fontSize: TempleFonts.small,
    color: theme.goldLight,
    marginTop: TempleSpacing.sm,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  reflectionText: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
    marginTop: TempleSpacing.xs,
    lineHeight: 20,
  },
  });
}
