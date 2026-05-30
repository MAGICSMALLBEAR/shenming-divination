// 願望追蹤頁面
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView, TextInput, Alert, RefreshControl,
} from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { getWishes, addWish, fulfillWish, removeWish, type Wish } from '@/services/wishTracker';

export default function WishesScreen() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [gratitudeText, setGratitudeText] = useState('');
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const data = await getWishes();
    setWishes(data);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async () => {
    if (!newContent.trim()) return;
    await addWish({
      content: newContent.trim(),
      godName: '神明',
      poemNumber: 0,
      poemSummary: '',
    });
    setNewContent('');
    setShowAdd(false);
    await loadData();
  };

  const handleFulfill = async (id: string) => {
    if (!gratitudeText.trim()) return;
    await fulfillWish(id, gratitudeText.trim());
    setFulfillingId(null);
    setGratitudeText('');
    await loadData();
  };

  const handleDelete = (id: string) => {
    Alert.alert('刪除願望', '確定要刪除這個願望嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: async () => { await removeWish(id); await loadData(); } },
    ]);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const activeWishes = wishes.filter(w => !w.fulfilled);
  const fulfilledWishes = wishes.filter(w => w.fulfilled);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
      <View style={styles.container}>
        <Text style={styles.pageTitle}>願望清單</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAdd(!showAdd)}
        >
          <Text style={styles.addBtnText}>{showAdd ? '取消' : '+ 許下新願望'}</Text>
        </TouchableOpacity>

        {showAdd && (
          <View style={styles.addForm}>
            <TextInput
              style={styles.addInput}
              value={newContent}
              onChangeText={setNewContent}
              placeholder="寫下你的願望..."
              placeholderTextColor={TempleTheme.textMuted}
              multiline
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
              <Text style={styles.submitBtnText}>許願</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={false} onRefresh={loadData} tintColor={TempleTheme.gold} />}>
          {activeWishes.length === 0 && fulfilledWishes.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🙏</Text>
              <Text style={styles.emptyText}>尚無願望</Text>
              <Text style={styles.emptyHint}>求籤後將願望記錄於此，日後還願</Text>
            </View>
          )}

          {activeWishes.map(wish => (
            <View key={wish.id} style={styles.wishCard}>
              <View style={styles.wishHeader}>
                <View style={styles.wishStatus} />
                <Text style={styles.wishDate}>{formatDate(wish.createdAt)}</Text>
              </View>
              <Text style={styles.wishContent}>{wish.content}</Text>
              {wish.poemNumber > 0 && (
                <Text style={styles.wishPoem}>相關籤詩：第 {wish.poemNumber} 籤</Text>
              )}

              {fulfillingId === wish.id ? (
                <View style={styles.gratitudeForm}>
                  <TextInput
                    style={styles.gratitudeInput}
                    value={gratitudeText}
                    onChangeText={setGratitudeText}
                    placeholder="寫下還願感謝文..."
                    placeholderTextColor={TempleTheme.textMuted}
                    multiline
                  />
                  <View style={styles.gratitudeActions}>
                    <TouchableOpacity onPress={() => handleFulfill(wish.id)} style={styles.gratitudeSaveBtn}>
                      <Text style={styles.gratitudeSaveText}>還願</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setFulfillingId(null)}>
                      <Text style={styles.gratitudeCancelText}>取消</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.wishActions}>
                  <TouchableOpacity onPress={() => setFulfillingId(wish.id)} style={styles.fulfillBtn}>
                    <Text style={styles.fulfillBtnText}>✨ 還願</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(wish.id)}>
                    <Text style={styles.deleteBtnText}>刪除</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {fulfilledWishes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>已實現的願望</Text>
              {fulfilledWishes.map(wish => (
                <View key={wish.id} style={[styles.wishCard, styles.wishCardFulfilled]}>
                  <View style={styles.wishHeader}>
                    <View style={styles.wishStatusFulfilled} />
                    <Text style={styles.wishDate}>{formatDate(wish.fulfilledAt!)}</Text>
                  </View>
                  <Text style={styles.wishContent}>{wish.content}</Text>
                  {wish.gratitude && (
                    <Text style={styles.gratitudeText}>💝 {wish.gratitude}</Text>
                  )}
                </View>
              ))}
            </>
          )}

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
    fontSize: TempleFonts.subtitle, fontWeight: '900',
    color: TempleTheme.goldLight, textAlign: 'center', marginBottom: TempleSpacing.md,
  },
  addBtn: {
    paddingVertical: 12, borderRadius: 10, borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30', alignItems: 'center',
    backgroundColor: TempleTheme.bgCard, marginBottom: TempleSpacing.sm,
  },
  addBtnText: { fontSize: TempleFonts.body, color: TempleTheme.goldLight },
  addForm: { marginBottom: TempleSpacing.md },
  addInput: {
    backgroundColor: TempleTheme.bgCard, borderRadius: 8, padding: TempleSpacing.sm,
    fontSize: TempleFonts.body, color: TempleTheme.textLight,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '30', minHeight: 60,
    textAlignVertical: 'top', marginBottom: TempleSpacing.xs,
  },
  submitBtn: {
    backgroundColor: TempleTheme.red, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
  },
  submitBtnText: { color: TempleTheme.goldLight, fontSize: TempleFonts.body, fontWeight: '700' },
  listContent: {},
  emptyState: { alignItems: 'center', paddingVertical: TempleSpacing.xxl * 2 },
  emptyIcon: { fontSize: 48, marginBottom: TempleSpacing.md },
  emptyText: { fontSize: TempleFonts.body, color: TempleTheme.textMuted },
  emptyHint: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, marginTop: TempleSpacing.xs, opacity: 0.6 },
  sectionTitle: {
    fontSize: TempleFonts.body, fontWeight: '700', color: TempleTheme.goldLight,
    marginBottom: TempleSpacing.sm, marginTop: TempleSpacing.md,
  },
  wishCard: {
    backgroundColor: TempleTheme.bgCard, borderRadius: 12, padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm, borderWidth: 1, borderColor: TempleTheme.goldDark + '30',
  },
  wishCardFulfilled: { opacity: 0.7 },
  wishHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: TempleSpacing.xs },
  wishStatus: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: TempleTheme.warning, marginRight: 8,
  },
  wishStatusFulfilled: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: TempleTheme.success, marginRight: 8,
  },
  wishDate: { fontSize: 11, color: TempleTheme.textMuted },
  wishContent: { fontSize: TempleFonts.body, color: TempleTheme.textLight, lineHeight: 24, marginBottom: TempleSpacing.xs },
  wishPoem: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  wishActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: TempleSpacing.md, marginTop: TempleSpacing.sm },
  fulfillBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, backgroundColor: TempleTheme.success + '20' },
  fulfillBtnText: { fontSize: TempleFonts.small, color: TempleTheme.success, fontWeight: '600' },
  deleteBtnText: { fontSize: TempleFonts.small, color: TempleTheme.danger, paddingVertical: 6 },
  gratitudeForm: { marginTop: TempleSpacing.sm },
  gratitudeInput: {
    backgroundColor: TempleTheme.bgDark + '40', borderRadius: 8, padding: TempleSpacing.sm,
    fontSize: TempleFonts.small, color: TempleTheme.textLight, minHeight: 50,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '30', textAlignVertical: 'top',
  },
  gratitudeActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: TempleSpacing.md, marginTop: 6 },
  gratitudeSaveBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6, backgroundColor: TempleTheme.goldDark + '40' },
  gratitudeSaveText: { color: TempleTheme.goldLight, fontWeight: '600' },
  gratitudeCancelText: { color: TempleTheme.textMuted },
  gratitudeText: { fontSize: TempleFonts.small, color: TempleTheme.goldLight, marginTop: TempleSpacing.xs, fontStyle: 'italic' },
});
