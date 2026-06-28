import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { gods, questionCategories } from '@/data/gods';
import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import {
  clearHistory,
  getFavorites,
  getHistory,
  removeFavorite,
  updateActionProgress,
  updateNote,
  updateVerification,
  type DivinationRecord,
  type VerificationStatus,
} from '@/services/storage';

type Tab = 'favorites' | 'history';
type SortMode = 'newest' | 'oldest';
type VerificationFilter = 'all' | VerificationStatus | 'due';
type LevelFilter = 'all' | 'good' | 'neutral' | 'caution';

const VERIFICATION_LABELS: Record<
  VerificationStatus,
  { text: string; color: string }
> = {
  pending: { text: '待驗證', color: TempleTheme.warning },
  matched: { text: '已應驗', color: TempleTheme.success },
  unmatched: { text: '不太符合', color: TempleTheme.danger },
};

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
function getLevelFilter(level: string): Exclude<LevelFilter, 'all'> {
  if (level.includes('下') || level.includes('凶')) return 'caution';
  if (level.includes('上') || level.includes('吉')) return 'good';
  return 'neutral';
}

function isVerificationDue(record: DivinationRecord): boolean {
  if ((record.verificationStatus ?? 'pending') !== 'pending') return false;
  const now = Date.now();
  return Boolean(
    (record.verificationDueAt && record.verificationDueAt <= now) ||
    (record.verificationFinalDueAt && record.verificationFinalDueAt <= now)
  );
}

function formatShortDate(timestamp?: number): string {
  if (!timestamp) return '未設定';
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function CollectionScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const layout = useResponsiveLayout();
  const [activeTab, setActiveTab] = useState<Tab>('favorites');
  const [favorites, setFavorites] = useState<DivinationRecord[]>([]);
  const [history, setHistory] = useState<DivinationRecord[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [editingVerificationId, setEditingVerificationId] = useState<string | null>(null);
  const [verificationNoteText, setVerificationNoteText] = useState('');
  const [pendingVerificationStatus, setPendingVerificationStatus] =
    useState<VerificationStatus>('pending');
  const [searchText, setSearchText] = useState('');
  const [selectedGod, setSelectedGod] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<VerificationFilter>('all');
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [notesOnly, setNotesOnly] = useState(false);

  const loadData = useCallback(async () => {
    const [favoriteRecords, historyRecords] = await Promise.all([getFavorites(), getHistory()]);
    setFavorites(favoriteRecords);
    setHistory(historyRecords);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (params.tab === 'history' || params.tab === 'favorites') {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

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
      if (selectedVerification === 'due' && !isVerificationDue(record)) return false;
      if (selectedVerification !== 'all' && selectedVerification !== 'due' && (record.verificationStatus ?? 'pending') !== selectedVerification) return false;
      if (selectedLevel !== 'all' && getLevelFilter(record.poem.level) !== selectedLevel) return false;
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
        record.verificationNotes ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(search);
    });

    filtered.sort((left, right) =>
      sortMode === 'newest' ? right.timestamp - left.timestamp : left.timestamp - right.timestamp
    );

    return filtered;
  }, [currentRecords, notesOnly, searchText, selectedCategory, selectedGod, selectedLevel, selectedVerification, sortMode]);

  const filteredStats = useMemo(() => {
    const withNotes = filteredRecords.filter((record) => record.notes?.trim()).length;
    const matched = filteredRecords.filter((record) => record.verificationStatus === 'matched').length;
    const tracked = filteredRecords.filter(
      (record) => record.verificationStatus && record.verificationStatus !== 'pending'
    ).length;
    const due = filteredRecords.filter(isVerificationDue).length;

    return {
      count: filteredRecords.length,
      withNotes,
      matched,
      tracked,
      due,
    };
  }, [filteredRecords]);

  const hasActiveFilters =
    searchText.trim().length > 0 ||
    selectedGod !== 'all' ||
    selectedCategory !== 'all' ||
    selectedVerification !== 'all' ||
    selectedLevel !== 'all' ||
    notesOnly ||
    sortMode !== 'newest';

  const resetFilters = () => {
    setSearchText('');
    setSelectedGod('all');
    setSelectedCategory('all');
    setSelectedVerification('all');
    setSelectedLevel('all');
    setNotesOnly(false);
    setSortMode('newest');
  };

  const handleRemoveFavorite = async (id: string) => {
    await removeFavorite(id);
    await loadData();
  };

  const handleClearHistory = () => {
    Alert.alert('清空歷史', '這會刪除所有求籤歷史紀錄，確定要繼續嗎？', [
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

  const handleExport = async () => {
    if (!filteredRecords.length) {
      Alert.alert('沒有紀錄', '目前沒有可匯出的籤詩紀錄。');
      return;
    }

    const lines: string[] = [
      '神明占卜 — 籤詩紀錄匯出',
      `匯出時間：${new Date().toLocaleString('zh-TW')}`,
      `共 ${filteredRecords.length} 筆`,
      '═'.repeat(40),
    ];

    filteredRecords.forEach((record, i) => {
      lines.push('');
      lines.push(`【第 ${i + 1} 筆】${formatDate(record.timestamp)}`);
      lines.push(`神明：${record.godName}`);
      lines.push(`籤號：第 ${record.poem.number} 籤・${record.poem.title}・${record.poem.level}`);
      if (record.question) lines.push(`問題：${record.question}`);
      lines.push(`籤文：${record.poem.content}`);
      if (record.poem.vernacular) lines.push(`白話：${record.poem.vernacular}`);
      if (record.aiInterpretation) lines.push(`AI 解讀：${record.aiInterpretation.slice(0, 200)}...`);
      if (record.notes?.trim()) lines.push(`筆記：${record.notes}`);
      if (record.verificationStatus && record.verificationStatus !== 'pending') {
        lines.push(`應驗：${VERIFICATION_LABELS[record.verificationStatus].text}`);
      }
      lines.push('─'.repeat(40));
    });

    const text = lines.join('\n');

    if (Platform.OS === 'web') {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `籤詩紀錄_${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      await Share.share({ message: text, title: '神明占卜籤詩紀錄' }).catch(() => {});
    }
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

  const handleStartVerification = (record: DivinationRecord, status: VerificationStatus) => {
    setEditingVerificationId(record.id);
    setPendingVerificationStatus(status);
    setVerificationNoteText(record.verificationNotes || '');
  };


  const handleToggleAction = async (record: DivinationRecord, index: number) => {
    const done = !record.actionProgress?.[index];
    await updateActionProgress(record.id, index, done);
    await loadData();
  };
  const handleSaveVerification = async (id: string) => {
    await updateVerification(id, pendingVerificationStatus, verificationNoteText);
    setEditingVerificationId(null);
    setVerificationNoteText('');
    await loadData();
  };

  const renderVerification = (record: DivinationRecord) => {
    const status = record.verificationStatus ?? 'pending';
    const statusMeta = VERIFICATION_LABELS[status];

    return (
      <View style={styles.verificationCard}>
        <View style={styles.verificationHeader}>
          <Text style={styles.sectionTitle}>應驗追蹤</Text>
          <View style={[styles.statusBadge, { borderColor: statusMeta.color + '60' }]}>
            <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>
              {statusMeta.text}
            </Text>
          </View>
        </View>

        <View style={styles.verificationButtons}>
          {(['pending', 'matched', 'unmatched'] as VerificationStatus[]).map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.verificationBtn,
                status === item && {
                  borderColor: VERIFICATION_LABELS[item].color,
                  backgroundColor: VERIFICATION_LABELS[item].color + '14',
                },
              ]}
              onPress={() => handleStartVerification(record, item)}
            >
              <Text style={styles.verificationBtnText}>{VERIFICATION_LABELS[item].text}</Text>
            </TouchableOpacity>
          ))}
        </View>


        <Text style={styles.verificationSchedule}>
          回訪：7天 {formatShortDate(record.verificationDueAt)} ・ 30天 {formatShortDate(record.verificationFinalDueAt)}
        </Text>
        {record.verificationNotes ? (
          <Text style={styles.verificationNote}>追蹤筆記：{record.verificationNotes}</Text>
        ) : null}

        {editingVerificationId === record.id ? (
          <View style={styles.noteEditArea}>
            <TextInput
              style={styles.noteInput}
              value={verificationNoteText}
              onChangeText={setVerificationNoteText}
              placeholder="記一下後來發生了什麼，之後回看會很有價值。"
              placeholderTextColor={TempleTheme.textMuted}
              multiline
            />
            <View style={styles.noteEditActions}>
              <TouchableOpacity
                onPress={() => handleSaveVerification(record.id)}
                style={styles.noteSaveBtn}
              >
                <Text style={styles.noteSaveText}>儲存追蹤</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEditingVerificationId(null);
                  setVerificationNoteText('');
                }}
                style={styles.noteCancelBtn}
              >
                <Text style={styles.noteCancelText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  const renderRecord = (record: DivinationRecord, isFavorite: boolean) => (
    <View
      key={record.id}
      style={[styles.recordCard, layout.isDesktop && styles.recordCardDesktop]}
    >
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

      {record.poemConfirmResult ? (
        <View style={[styles.confirmBadge, record.poemConfirmed && styles.confirmBadgeOk]}>
          <Text style={styles.confirmBadgeText}>籤後確認：{record.poemConfirmResult}</Text>
        </View>
      ) : null}
      <View style={styles.recordPoem}>
        {record.poem.content.split('\n').map((line, index) => (
          <Text key={index} style={styles.poemLine}>
            {line}
          </Text>
        ))}
      </View>

      <View style={styles.recordFooter}>
        <Text style={styles.recordQuestion}>問題：{record.question}</Text>
        {record.aiInterpretation ? (
          <Text style={styles.recordAi}>
            AI 摘要：{record.aiInterpretation.replace(/\n+/g, ' ').slice(0, 90)}
            {record.aiInterpretation.length > 90 ? '...' : ''}
          </Text>
        ) : null}
        {record.actionPlan?.length ? (
          <View style={styles.planBlock}>
            {record.actionPlan.map((item, index) => {
              const done = Boolean(record.actionProgress?.[index]);
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.planCheckRow, done && styles.planCheckRowDone]}
                  onPress={() => handleToggleAction(record, index)}
                >
                  <Text style={[styles.planCheckBox, done && styles.planCheckBoxDone]}>
                    {done ? '✓' : ''}
                  </Text>
                  <Text style={[styles.planText, done && styles.planTextDone]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
      </View>

      {renderVerification(record)}

      {editingNoteId === record.id ? (
        <View style={styles.noteEditArea}>
          <TextInput
            style={styles.noteInput}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="寫下你當時的心情、後續觀察，或這支籤對你的提醒。"
            placeholderTextColor={TempleTheme.textMuted}
            multiline
          />
          <View style={styles.noteEditActions}>
            <TouchableOpacity onPress={() => handleSaveNote(record.id)} style={styles.noteSaveBtn}>
              <Text style={styles.noteSaveText}>儲存筆記</Text>
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
          <Text style={styles.noteViewLabel}>個人筆記</Text>
          <Text style={styles.noteViewText}>{record.notes}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.addNoteBtn} onPress={() => handleStartEditNote(record)}>
          <Text style={styles.addNoteText}>+ 補一段自己的心得</Text>
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
      <View
        style={[
          styles.container,
          { maxWidth: layout.contentMaxWidth, paddingHorizontal: layout.gutter },
        ]}
      >
        <Text style={styles.pageTitle}>求籤收藏與回顧</Text>

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
            <Text style={styles.summaryValue}>{filteredStats.tracked}</Text>
            <Text style={styles.summaryLabel}>已追蹤</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{filteredStats.due}</Text>
            <Text style={styles.summaryLabel}>待回訪</Text>
          </View>
        </View>

        {filteredStats.due > 0 ? (
          <TouchableOpacity
            style={styles.reviewCenterBtn}
            onPress={() => {
              setActiveTab('history');
              setSelectedVerification('due');
              setSortMode('oldest');
            }}
          >
            <Text style={styles.reviewCenterText}>查看 {filteredStats.due} 筆待回訪籤詩</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="搜尋籤詩、問題、筆記或 AI 解讀"
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
                {sortMode === 'newest' ? '最新在前' : '最舊在前'}
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
                全部題型
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


        <View style={styles.filterStrip}>
          <View style={styles.filterContent}>
            {[
              { key: 'all', label: '全部應驗' },
              { key: 'due', label: '待回訪' },
              { key: 'pending', label: '待驗證' },
              { key: 'matched', label: '已應驗' },
              { key: 'unmatched', label: '不符合' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.filterChip,
                  selectedVerification === item.key && styles.filterChipActive,
                ]}
                onPress={() => setSelectedVerification(item.key as VerificationFilter)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedVerification === item.key && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterStrip}>
          <View style={styles.filterContent}>
            {[
              { key: 'all', label: '全部籤等' },
              { key: 'good', label: '吉籤' },
              { key: 'neutral', label: '平籤' },
              { key: 'caution', label: '提醒籤' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterChip, selectedLevel === item.key && styles.filterChipActive]}
                onPress={() => setSelectedLevel(item.key as LevelFilter)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedLevel === item.key && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            layout.isDesktop && styles.listContentDesktop,
          ]}
        >
          {!filteredRecords.length ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📜</Text>
              <Text style={styles.emptyText}>
                {currentRecords.length
                  ? '目前沒有符合篩選條件的紀錄'
                  : '目前還沒有任何求籤紀錄'}
              </Text>
              <Text style={styles.emptyHint}>
                {currentRecords.length
                  ? '可以清掉篩選條件，或換個關鍵字再找找看。'
                  : '可以先去求一支籤，之後再回來追蹤應驗與心得。'}
              </Text>
              {hasActiveFilters ? (
                <TouchableOpacity style={styles.emptyActionBtn} onPress={resetFilters}>
                  <Text style={styles.emptyActionText}>清除篩選</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {filteredRecords.map((record) => renderRecord(record, activeTab === 'favorites'))}

          {filteredRecords.length > 0 ? (
            <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
              <Text style={styles.exportBtnText}>匯出目前 {filteredRecords.length} 筆紀錄</Text>
            </TouchableOpacity>
          ) : null}

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
  container: { flex: 1, paddingTop: TempleSpacing.sm, width: '100%', alignSelf: 'center' },
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
  reviewCenterBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TempleTheme.warning + '66',
    backgroundColor: TempleTheme.warning + '14',
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: TempleSpacing.sm,
  },
  reviewCenterText: {
    color: TempleTheme.goldLight,
    fontSize: TempleFonts.small,
    fontWeight: '900',
  },  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
    paddingHorizontal: TempleSpacing.sm,
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
  listContent: {},
  listContentDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TempleSpacing.md,
    alignItems: 'flex-start',
  },
  recordCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
  },
  recordCardDesktop: {
    width: '48.8%',
    marginBottom: 0,
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
  confirmBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: TempleTheme.warning + '70',
    backgroundColor: TempleTheme.warning + '12',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  confirmBadgeOk: {
    borderColor: TempleTheme.success + '70',
    backgroundColor: TempleTheme.success + '12',
  },
  confirmBadgeText: {
    color: TempleTheme.textLight,
    fontSize: 11,
    fontWeight: '700',
  },  recordPoem: {
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
  planBlock: {
    marginTop: TempleSpacing.sm,
    gap: 4,
  },
  planCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 4,
  },
  planCheckRowDone: {
    opacity: 0.72,
  },
  planCheckBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: TempleTheme.gold,
    color: TempleTheme.bgDark,
    textAlign: 'center',
    lineHeight: 16,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
  },
  planCheckBoxDone: {
    backgroundColor: TempleTheme.success,
    borderColor: TempleTheme.success,
    color: TempleTheme.bgDark,
  },  planText: {
    fontSize: 12,
    color: TempleTheme.goldLight,
    lineHeight: 18,
  },
  planTextDone: {
    color: TempleTheme.textMuted,
    textDecorationLine: 'line-through',
  },
  verificationCard: {
    marginTop: TempleSpacing.sm,
    padding: TempleSpacing.sm,
    borderRadius: 10,
    backgroundColor: TempleTheme.bgDark + '38',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '18',
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    color: TempleTheme.goldLight,
    fontWeight: '700',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  verificationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  verificationBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '24',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: TempleTheme.bgCard,
  },
  verificationBtnText: {
    fontSize: 12,
    color: TempleTheme.textLight,
  },
  verificationSchedule: {
    color: TempleTheme.textMuted,
    fontSize: 11,
    marginTop: 8,
  },
  verificationNote: {
    marginTop: 8,
    color: TempleTheme.textMuted,
    fontSize: 12,
    lineHeight: 18,
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
    textAlign: 'center',
  },
  emptyActionBtn: {
    marginTop: TempleSpacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '35',
  },
  emptyActionText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.goldLight,
    fontWeight: '700',
  },
  exportBtn: {
    width: '100%',
    marginTop: TempleSpacing.md,
    paddingVertical: TempleSpacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
    backgroundColor: TempleTheme.bgCard,
  },
  exportBtnText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.goldLight,
  },
  clearBtn: {
    width: '100%',
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
