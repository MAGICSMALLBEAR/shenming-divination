import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { questionCategories, gods } from '@/data/gods';
import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import {
  clearHistory,
  getFavorites,
  getHistory,
  removeFavorite,
  updateNote,
  type DivinationRecord,
} from '@/services/storage';

type Tab = 'favorites' | 'history';
type SortMode = 'newest' | 'oldest';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(
    date.getDate()
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

export default function CollectionScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('favorites');
  const [favorites, setFavorites] = useState<DivinationRecord[]>([]);
  const [history, setHistory] = useState<DivinationRecord[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedGod, setSelectedGod] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [notesOnly, setNotesOnly] = useState(false);

  const loadData = useCallback(async () => {
    const [favoriteRecords, historyRecords] = await Promise.all([
      getFavorites(),
      getHistory(),
    ]);
    setFavorites(favoriteRecords);
    setHistory(historyRecords);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentRecords = activeTab === 'favorites' ? favorites : history;

  const availableGods = useMemo(() => {
    const names = new Set(currentRecords.map((record) => record.godName));
    return gods.filter((god) => names.has(god.name));
  }, [currentRecords]);

  const filteredRecords = useMemo(() => {
    const search = normalizeText(searchText);
    const filtered = currentRecords.filter((record) => {
      if (selectedGod !== 'all' && record.godName !== selectedGod) return false;
      if (selectedCategory !== 'all' && record.questionCategory !== selectedCategory) return false;
      if (notesOnly && !record.notes?.trim()) return false;

      if (!search) return true;

      return [
        String(record.poem.number),
        record.poem.title,
        record.poem.content,
        record.poem.level,
        record.godName,
        record.question,
        record.notes ?? '',
        record.aiInterpretation ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(search);
    });

    filtered.sort((left, right) =>
      sortMode === 'newest' ? right.timestamp - left.timestamp : left.timestamp - right.timestamp
    );

    return filtered;
  }, [currentRecords, notesOnly, searchText, selectedCategory, selectedGod, sortMode]);

  const filteredStats = useMemo(() => {
    const withNotes = filteredRecords.filter((record) => record.notes?.trim()).length;
    const uniqueGods = new Set(filteredRecords.map((record) => record.godName)).size;
    return {
      count: filteredRecords.length,
      withNotes,
      uniqueGods,
    };
  }, [filteredRecords]);

  const handleRemoveFavorite = async (id: string) => {
    await removeFavorite(id);
    await loadData();
  };

  const handleClearHistory = () => {
    Alert.alert('清空歷史', '歷史紀錄會全部移除，這個動作不能復原。', [
      { text: '取消', style: 'cancel' },
      {
        text: '清空',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          await loadData();
        },
      },
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

      <View style={styles.recordMetaRow}>
        <Text style={styles.recordLevel}>{record.poem.level}</Text>
        <Text style={styles.recordCategory}>
          {questionCategories.find((category) => category.id === record.questionCategory)?.name ??
            record.questionCategory}
        </Text>
      </View>

      <View style={styles.recordPoem}>
        {record.poem.content.split('\n').map((line, index) => (
          <Text key={index} style={styles.poemLine}>
            {line}
          </Text>
        ))}
      </View>

      <View style={styles.recordFooter}>
        <Text style={styles.recordQuestion}>提問：{record.question}</Text>
        {record.aiInterpretation ? (
          <Text style={styles.recordAi}>
            AI 摘要：{record.aiInterpretation.slice(0, 90)}
            {record.aiInterpretation.length > 90 ? '...' : ''}
          </Text>
        ) : null}
      </View>

      {editingNoteId === record.id ? (
        <View style={styles.noteEditArea}>
          <TextInput
            style={styles.noteInput}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="補上你當下的感受、後續結果，或提醒自己下次回來看什麼。"
            placeholderTextColor={TempleTheme.textMuted}
            multiline
          />
          <View style={styles.noteEditActions}>
            <TouchableOpacity onPress={() => handleSaveNote(record.id)} style={styles.noteSaveBtn}>
              <Text style={styles.noteSaveText}>儲存</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEditingNoteId(null);
                setNoteText('');
              }}
              style={styles.noteCancelBtn}
            >
              <Text style={styles.noteCancelText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : record.notes ? (
        <TouchableOpacity style={styles.noteView} onPress={() => handleStartEditNote(record)}>
          <Text style={styles.noteViewLabel}>筆記</Text>
          <Text style={styles.noteViewText}>{record.notes}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.addNoteBtn} onPress={() => handleStartEditNote(record)}>
          <Text style={styles.addNoteText}>+ 補一段筆記</Text>
        </TouchableOpacity>
      )}

      {isFavorite ? (
        <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveFavorite(record.id)}>
          <Text style={styles.removeBtnText}>移出收藏</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
      <View style={styles.container}>
        <Text style={styles.pageTitle}>求籤檔案</Text>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
              收藏 {favorites.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              歷史 {history.length}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{filteredStats.count}</Text>
            <Text style={styles.summaryLabel}>目前筆數</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{filteredStats.uniqueGods}</Text>
            <Text style={styles.summaryLabel}>涉及神明</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{filteredStats.withNotes}</Text>
            <Text style={styles.summaryLabel}>附筆記</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>搜</Text>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="搜尋籤號、神明、問題、筆記、AI 摘要..."
            placeholderTextColor={TempleTheme.textMuted}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.searchClear}>清除</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filterStrip}>
          <View style={styles.filterContent}>
          <TouchableOpacity
            style={[styles.filterChip, sortMode === 'newest' && styles.filterChipActive]}
            onPress={() => setSortMode(sortMode === 'newest' ? 'oldest' : 'newest')}
          >
            <Text
              style={[styles.filterChipText, sortMode === 'newest' && styles.filterChipTextActive]}
            >
              {sortMode === 'newest' ? '最新優先' : '最舊優先'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, notesOnly && styles.filterChipActive]}
            onPress={() => setNotesOnly((value) => !value)}
          >
            <Text style={[styles.filterChipText, notesOnly && styles.filterChipTextActive]}>
              只看有筆記
            </Text>
          </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterStrip}>
          <View style={styles.filterContent}>
          <TouchableOpacity
            style={[styles.filterChip, selectedGod === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedGod('all')}
          >
            <Text style={[styles.filterChipText, selectedGod === 'all' && styles.filterChipTextActive]}>
              全部神明
            </Text>
          </TouchableOpacity>
          {availableGods.map((god) => (
            <TouchableOpacity
              key={god.id}
              style={[styles.filterChip, selectedGod === god.name && styles.filterChipActive]}
              onPress={() => setSelectedGod(god.name)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedGod === god.name && styles.filterChipTextActive,
                ]}
              >
                {god.name}
              </Text>
            </TouchableOpacity>
          ))}
          </View>
        </View>

        <View style={styles.filterStrip}>
          <View style={styles.filterContent}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === 'all' && styles.filterChipTextActive,
              ]}
            >
              全部問題
            </Text>
          </TouchableOpacity>
          {questionCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterChip,
                selectedCategory === category.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === category.id && styles.filterChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
          </View>
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {!filteredRecords.length ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>檔</Text>
              <Text style={styles.emptyText}>這個篩選條件下還沒有資料</Text>
              <Text style={styles.emptyHint}>可以換個神明、分類或關鍵字再看一次。</Text>
            </View>
          ) : null}

          {filteredRecords.map((record) => renderRecord(record, activeTab === 'favorites'))}

          {activeTab === 'history' && history.length > 0 ? (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearHistory}>
              <Text style={styles.clearBtnText}>清空歷史紀錄</Text>
            </TouchableOpacity>
          ) : null}

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
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: TempleSpacing.sm,
    paddingHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
  },
  tab: {
    paddingHorizontal: TempleSpacing.lg,
    paddingVertical: TempleSpacing.sm,
    borderRadius: 20,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
  },
  tabActive: {
    backgroundColor: TempleTheme.goldDark + '30',
    borderColor: TempleTheme.gold,
  },
  tabText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
  },
  tabTextActive: {
    color: TempleTheme.goldLight,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: TempleSpacing.sm,
    paddingHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: TempleTheme.goldLight,
  },
  summaryLabel: {
    fontSize: 11,
    color: TempleTheme.textMuted,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
    paddingHorizontal: TempleSpacing.sm,
    marginHorizontal: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
  },
  searchIcon: {
    fontSize: 12,
    marginRight: 6,
    color: TempleTheme.textMuted,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: TempleFonts.small,
    color: TempleTheme.textLight,
  },
  searchClear: {
    fontSize: 12,
    color: TempleTheme.textMuted,
    padding: 4,
  },
  filterStrip: {
    marginBottom: TempleSpacing.xs,
  },
  filterContent: {
    paddingHorizontal: TempleSpacing.md,
    gap: TempleSpacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
  },
  filterChipActive: {
    backgroundColor: TempleTheme.goldDark + '24',
    borderColor: TempleTheme.gold,
  },
  filterChipText: {
    fontSize: 12,
    color: TempleTheme.textMuted,
  },
  filterChipTextActive: {
    color: TempleTheme.goldLight,
    fontWeight: '700',
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: TempleSpacing.md },
  recordCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TempleSpacing.xs,
  },
  recordMeta: {
    flex: 1,
    paddingRight: TempleSpacing.sm,
  },
  recordGod: {
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: TempleTheme.goldLight,
  },
  recordDate: {
    fontSize: 11,
    color: TempleTheme.textMuted,
    marginTop: 2,
  },
  recordNumberBadge: {
    backgroundColor: TempleTheme.red + '28',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TempleTheme.red + '60',
  },
  recordNumber: {
    fontSize: 12,
    color: TempleTheme.goldLight,
    fontWeight: '600',
  },
  recordMetaRow: {
    flexDirection: 'row',
    gap: TempleSpacing.xs,
    marginBottom: TempleSpacing.sm,
    flexWrap: 'wrap',
  },
  recordLevel: {
    fontSize: 11,
    color: TempleTheme.goldLight,
    backgroundColor: TempleTheme.goldDark + '26',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  recordCategory: {
    fontSize: 11,
    color: TempleTheme.textLight,
    backgroundColor: TempleTheme.bgDark + '40',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  recordPoem: {
    backgroundColor: TempleTheme.bgLight,
    padding: TempleSpacing.md,
    borderRadius: 8,
    marginBottom: TempleSpacing.sm,
    alignItems: 'center',
  },
  poemLine: {
    fontSize: 15,
    lineHeight: 26,
    color: '#333',
    fontWeight: '600',
  },
  recordFooter: {
    borderTopWidth: 1,
    borderTopColor: TempleTheme.goldDark + '20',
    paddingTop: TempleSpacing.sm,
  },
  recordQuestion: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    lineHeight: 20,
  },
  recordAi: {
    fontSize: 12,
    color: TempleTheme.textLight,
    marginTop: 8,
    lineHeight: 20,
  },
  noteEditArea: { marginTop: TempleSpacing.sm },
  noteInput: {
    backgroundColor: TempleTheme.bgDark + '40',
    borderRadius: 8,
    padding: TempleSpacing.sm,
    fontSize: TempleFonts.small,
    color: TempleTheme.textLight,
    minHeight: 72,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
  },
  noteEditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: TempleSpacing.sm,
    marginTop: 6,
  },
  noteSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: TempleTheme.goldDark + '40',
  },
  noteSaveText: {
    fontSize: 12,
    color: TempleTheme.goldLight,
    fontWeight: '600',
  },
  noteCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: TempleTheme.bgDark + '40',
  },
  noteCancelText: {
    fontSize: 12,
    color: TempleTheme.textMuted,
  },
  noteView: {
    marginTop: TempleSpacing.sm,
    padding: TempleSpacing.sm,
    backgroundColor: TempleTheme.bgDark + '30',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '15',
  },
  noteViewLabel: {
    fontSize: 11,
    color: TempleTheme.goldLight,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteViewText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    lineHeight: 20,
  },
  addNoteBtn: {
    marginTop: TempleSpacing.sm,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
    borderStyle: 'dashed',
  },
  addNoteText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
  },
  removeBtn: {
    marginTop: TempleSpacing.sm,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TempleTheme.danger + '30',
  },
  removeBtnText: {
    fontSize: 12,
    color: TempleTheme.danger,
  },
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
    opacity: 0.7,
  },
  clearBtn: {
    marginTop: TempleSpacing.lg,
    paddingVertical: TempleSpacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TempleTheme.danger + '20',
  },
  clearBtnText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.danger,
  },
});
