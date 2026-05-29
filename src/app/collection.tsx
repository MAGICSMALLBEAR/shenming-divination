// 收藏頁面 - 顯示收藏的籤詩、歷史紀錄、筆記
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView, Alert, TextInput
} from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { getFavorites, getHistory, removeFavorite, clearHistory, updateNote, type DivinationRecord } from '@/services/storage';

type Tab = 'favorites' | 'history';

export default function CollectionScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('favorites');
  const [favorites, setFavorites] = useState<DivinationRecord[]>([]);
  const [history, setHistory] = useState<DivinationRecord[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [searchText, setSearchText] = useState('');

  const loadData = useCallback(async () => {
    const favs = await getFavorites();
    const hist = await getHistory();
    setFavorites(favs);
    setHistory(hist);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemoveFavorite = async (id: string) => {
    await removeFavorite(id);
    await loadData();
  };

  const handleClearHistory = () => {
    Alert.alert('清除歷史', '確定要清除所有歷史紀錄嗎？此動作無法復原。', [
      { text: '取消', style: 'cancel' },
      { text: '確定清除', style: 'destructive', onPress: async () => { await clearHistory(); await loadData(); } },
    ]);
  };

  const handleStartEditNote = (record: DivinationRecord) => {
    setEditingNoteId(record.id);
    setNoteText(record.notes || '');
  };

  const handleSaveNote = async (id: string) => {
    await updateNote(id, noteText);
    setEditingNoteId(null);
    setNoteText('');
    await loadData();
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const filterRecords = (records: DivinationRecord[]) => {
    if (!searchText.trim()) return records;
    const s = searchText.toLowerCase();
    return records.filter(r =>
      String(r.poem.number).includes(s) ||
      r.poem.content.includes(s) ||
      r.godName.includes(s) ||
      (r.question && r.question.includes(s)) ||
      (r.notes && r.notes.includes(s))
    );
  };

  const renderRecord = (record: DivinationRecord, isFavorite: boolean) => (
    <View key={record.id} style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordMeta}>
          <Text style={styles.recordGod}>{record.godName}</Text>
          <Text style={styles.recordDate}>{formatDate(record.timestamp)}</Text>
        </View>
        <View style={styles.recordNumberBadge}>
          <Text style={styles.recordNumber}>第 {record.poem.number} 籤</Text>
        </View>
      </View>

      <View style={styles.recordPoem}>
        {record.poem.content.split('\n').map((line, i) => (
          <Text key={i} style={styles.poemLine}>{line}</Text>
        ))}
      </View>

      <View style={styles.recordFooter}>
        <Text style={styles.recordQuestion}>
          📝 {record.questionCategory && <Text style={styles.recordCategory}>[{record.questionCategory}] </Text>}
          {record.question}
        </Text>
      </View>

      {/* 筆記區域 */}
      {editingNoteId === record.id ? (
        <View style={styles.noteEditArea}>
          <TextInput
            style={styles.noteInput}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="寫下你的感悟..."
            placeholderTextColor={TempleTheme.textMuted}
            multiline
          />
          <View style={styles.noteEditActions}>
            <TouchableOpacity onPress={() => handleSaveNote(record.id)} style={styles.noteSaveBtn}>
              <Text style={styles.noteSaveText}>儲存</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingNoteId(null)} style={styles.noteCancelBtn}>
              <Text style={styles.noteCancelText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : record.notes ? (
        <TouchableOpacity style={styles.noteView} onPress={() => handleStartEditNote(record)}>
          <Text style={styles.noteViewLabel}>📔 心得筆記</Text>
          <Text style={styles.noteViewText}>{record.notes}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.addNoteBtn} onPress={() => handleStartEditNote(record)}>
          <Text style={styles.addNoteText}>+ 添加筆記</Text>
        </TouchableOpacity>
      )}

      {isFavorite && (
        <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveFavorite(record.id)}>
          <Text style={styles.removeBtnText}>取消收藏</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
      <View style={styles.container}>
        <Text style={styles.pageTitle}>籤詩閣</Text>

        {/* Tab 切換 */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
              💾 收藏 ({favorites.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              📋 歷史 ({history.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 搜尋欄 */}
        {(activeTab === 'favorites' && favorites.length > 0) || (activeTab === 'history' && history.length > 0) ? (
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="搜尋籤號、神明、關鍵字..."
              placeholderTextColor={TempleTheme.textMuted}
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Text style={styles.searchClear}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {activeTab === 'favorites' && filterRecords(favorites).length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{searchText ? '🔍' : '📭'}</Text>
              <Text style={styles.emptyText}>{searchText ? '無符合結果' : '尚無收藏的籤詩'}</Text>
              <Text style={styles.emptyHint}>{searchText ? '試試其他關鍵字' : '求籤後可將有感應的籤詩收藏於此'}</Text>
            </View>
          )}
          {activeTab === 'history' && filterRecords(history).length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{searchText ? '🔍' : '📜'}</Text>
              <Text style={styles.emptyText}>{searchText ? '無符合結果' : '尚無求籤紀錄'}</Text>
              <Text style={styles.emptyHint}>{searchText ? '試試其他關鍵字' : '開始求籤後，紀錄會顯示於此'}</Text>
            </View>
          )}

          {activeTab === 'favorites' && filterRecords(favorites).map(r => renderRecord(r, true))}
          {activeTab === 'history' && filterRecords(history).map(r => renderRecord(r, false))}

          {activeTab === 'history' && history.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearHistory}>
              <Text style={styles.clearBtnText}>清除歷史紀錄</Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  container: { flex: 1, paddingTop: TempleSpacing.sm },
  pageTitle: {
    fontSize: TempleFonts.subtitle, fontWeight: '900',
    color: TempleTheme.goldLight, textAlign: 'center', marginBottom: TempleSpacing.sm,
  },
  tabBar: {
    flexDirection: 'row', justifyContent: 'center', gap: TempleSpacing.sm,
    paddingHorizontal: TempleSpacing.md, marginBottom: TempleSpacing.sm,
  },
  tab: {
    paddingHorizontal: TempleSpacing.lg, paddingVertical: TempleSpacing.sm, borderRadius: 20,
    backgroundColor: TempleTheme.bgCard, borderWidth: 1, borderColor: TempleTheme.goldDark + '30',
  },
  tabActive: { backgroundColor: TempleTheme.goldDark + '30', borderColor: TempleTheme.gold },
  tabText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  tabTextActive: { color: TempleTheme.goldLight, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: TempleTheme.bgCard, borderRadius: 10, borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20', paddingHorizontal: TempleSpacing.sm,
    marginHorizontal: TempleSpacing.md, marginBottom: TempleSpacing.sm,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: {
    flex: 1, paddingVertical: 8, fontSize: TempleFonts.small, color: TempleTheme.textLight,
  },
  searchClear: { fontSize: 14, color: TempleTheme.textMuted, padding: 4 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: TempleSpacing.md },
  recordCard: {
    backgroundColor: TempleTheme.bgCard, borderRadius: 12, padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm, borderWidth: 1, borderColor: TempleTheme.goldDark + '30',
  },
  recordHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: TempleSpacing.sm,
  },
  recordMeta: {},
  recordGod: { fontSize: TempleFonts.body, fontWeight: '700', color: TempleTheme.goldLight },
  recordDate: { fontSize: 11, color: TempleTheme.textMuted, marginTop: 2 },
  recordNumberBadge: {
    backgroundColor: TempleTheme.red + '30', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: TempleTheme.red + '60',
  },
  recordNumber: { fontSize: 12, color: TempleTheme.goldLight, fontWeight: '600' },
  recordPoem: {
    backgroundColor: TempleTheme.bgLight, padding: TempleSpacing.md, borderRadius: 8,
    marginBottom: TempleSpacing.sm, alignItems: 'center',
  },
  poemLine: { fontSize: 15, lineHeight: 26, color: '#333', fontWeight: '600' },
  recordFooter: {
    borderTopWidth: 1, borderTopColor: TempleTheme.goldDark + '20', paddingTop: TempleSpacing.sm,
  },
  recordQuestion: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  recordCategory: { color: TempleTheme.gold, fontWeight: '600' },
  noteEditArea: { marginTop: TempleSpacing.sm },
  noteInput: {
    backgroundColor: TempleTheme.bgDark + '40', borderRadius: 8, padding: TempleSpacing.sm,
    fontSize: TempleFonts.small, color: TempleTheme.textLight, minHeight: 60, textAlignVertical: 'top',
    borderWidth: 1, borderColor: TempleTheme.goldDark + '30',
  },
  noteEditActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: TempleSpacing.sm, marginTop: 6 },
  noteSaveBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, backgroundColor: TempleTheme.goldDark + '40' },
  noteSaveText: { fontSize: 12, color: TempleTheme.goldLight, fontWeight: '600' },
  noteCancelBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, backgroundColor: TempleTheme.bgDark + '40' },
  noteCancelText: { fontSize: 12, color: TempleTheme.textMuted },
  noteView: {
    marginTop: TempleSpacing.sm, padding: TempleSpacing.sm,
    backgroundColor: TempleTheme.bgDark + '30', borderRadius: 8,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '15',
  },
  noteViewLabel: { fontSize: 11, color: TempleTheme.goldLight, fontWeight: '600', marginBottom: 4 },
  noteViewText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, lineHeight: 20 },
  addNoteBtn: {
    marginTop: TempleSpacing.sm, paddingVertical: 8, alignItems: 'center', borderRadius: 8,
    borderWidth: 1, borderColor: TempleTheme.goldDark + '20', borderStyle: 'dashed',
  },
  addNoteText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  removeBtn: {
    marginTop: TempleSpacing.sm, paddingVertical: 6, alignItems: 'center',
    borderRadius: 8, borderWidth: 1, borderColor: TempleTheme.danger + '30',
  },
  removeBtnText: { fontSize: 12, color: TempleTheme.danger },
  emptyState: { alignItems: 'center', paddingVertical: TempleSpacing.xxl * 2 },
  emptyIcon: { fontSize: 48, marginBottom: TempleSpacing.md },
  emptyText: { fontSize: TempleFonts.body, color: TempleTheme.textMuted },
  emptyHint: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, marginTop: TempleSpacing.xs, opacity: 0.6 },
  clearBtn: {
    marginTop: TempleSpacing.lg, paddingVertical: TempleSpacing.sm, alignItems: 'center',
    borderRadius: 8, borderWidth: 1, borderColor: TempleTheme.danger + '20',
  },
  clearBtnText: { fontSize: TempleFonts.small, color: TempleTheme.danger },
});
