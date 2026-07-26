import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
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
import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useI18n } from '@/hooks/useI18n';
import { t as tRaw } from '@/services/i18n';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFadeIn, useStaggeredList } from '@/hooks/useEntranceAnimation';
import { ListItemSkeleton } from '@/components/Skeleton';
import type { ThemeColors } from '@/constants/themes';
import {
  addToFolder,
  clearHistory,
  createFolder,
  deleteFolder,
  getFolderRecords,
  getFolders,
  getFavorites,
  getHistory,
  removeFavorite,
  removeFromFolder,
  updateActionProgress,
  updateNote,
  updateVerification,
  type DivinationRecord,
  type Folder,
  type VerificationStatus,
} from '@/services/storage';

type Tab = 'favorites' | 'history' | 'folders';
type SortMode = 'newest' | 'oldest';
type VerificationFilter = 'all' | VerificationStatus | 'due';
type LevelFilter = 'all' | 'good' | 'neutral' | 'caution';

function getVerificationLabels(theme: ThemeColors, tFn: (key: string) => string): Record<
  VerificationStatus,
  { text: string; color: string }
> {
  return {
    pending: { text: tFn('poemVerifyPending'), color: theme.warning },
    matched: { text: tFn('poemVerified'), color: theme.success },
    unmatched: { text: tFn('poemUnmatched'), color: theme.danger },
  };
}

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
  if (!timestamp) return tRaw('commonNotSet');
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function AnimatedRecordItem({ children, delay }: { children: React.ReactNode; delay: number }) {
  const { opacity, translateY } = useFadeIn({ delay });
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function CollectionScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const layout = useResponsiveLayout();
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const VERIFICATION_LABELS = useMemo(() => getVerificationLabels(theme, t), [theme, t]);
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
  const [loading, setLoading] = useState(true);
  // Folder state
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderRecords, setFolderRecords] = useState<DivinationRecord[]>([]);
  const [folderPickerVisible, setFolderPickerVisible] = useState(false);
  const [folderTargetRecordId, setFolderTargetRecordId] = useState<string | null>(null);
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#C9A96E');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');
  const [folderToast, setFolderToast] = useState<string | null>(null);

  const FOLDER_COLORS = ['#C9A96E', '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F39C12', '#1ABC9C', '#E91E63'];
  const FOLDER_ICONS = ['📁', '💼', '❤️', '💰', '🏥', '📚', '🏠', '✈️', '⭐', '🔥', '💡', '🎯'];

  const loadData = useCallback(async () => {
    const [favoriteRecords, historyRecords, folderData] = await Promise.all([
      getFavorites(),
      getHistory(),
      getFolders(),
    ]);
    setFavorites(favoriteRecords);
    setHistory(historyRecords);
    setFolders(folderData);
    setLoading(false);
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

  const recordDelays = useStaggeredList({ itemCount: filteredRecords.length, staggerDelay: 60 });

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

  // ── Folder handlers ──

  const handleOpenFolder = async (folderId: string) => {
    setSelectedFolderId(folderId);
    const records = await getFolderRecords(folderId);
    setFolderRecords(records);
  };

  const handleBackFromFolder = () => {
    setSelectedFolderId(null);
    setFolderRecords([]);
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    Alert.alert('刪除分類', `確定要刪除「${folderName}」嗎？（籤詩記錄不會被刪除）`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: async () => {
          await deleteFolder(folderId);
          await loadData();
        },
      },
    ]);
  };

  const handleAddToFolder = (recordId: string) => {
    setFolderTargetRecordId(recordId);
    setFolderPickerVisible(true);
  };

  const handleSelectFolderForRecord = async (folderId: string) => {
    if (folderTargetRecordId) {
      await addToFolder(folderId, folderTargetRecordId);
      const folder = folders.find((f) => f.id === folderId);
      setFolderPickerVisible(false);
      setFolderTargetRecordId(null);
      setFolderToast(`已加入「${folder?.name ?? ''}」`);
      setTimeout(() => setFolderToast(null), 2000);
      await loadData();
    }
  };

  const handleCreateAndAddFolder = async () => {
    if (!newFolderName.trim()) return;
    const folder = await createFolder(newFolderName.trim(), newFolderColor, newFolderIcon);
    setNewFolderModalVisible(false);
    setNewFolderName('');
    setNewFolderColor('#C9A96E');
    setNewFolderIcon('📁');
    if (folderTargetRecordId) {
      await addToFolder(folder.id, folderTargetRecordId);
      setFolderPickerVisible(false);
      setFolderTargetRecordId(null);
      setFolderToast(`已加入「${folder.name}」`);
      setTimeout(() => setFolderToast(null), 2000);
    }
    await loadData();
  };

  const handleRemoveFromFolder = async (folderId: string, recordId: string) => {
    await removeFromFolder(folderId, recordId);
    if (selectedFolderId === folderId) {
      const records = await getFolderRecords(folderId);
      setFolderRecords(records);
    }
    await loadData();
  };

  const handleClearHistory = () => {
    Alert.alert(t('collectionClearConfirmTitle'), t('collectionClearConfirmMsg'), [
      { text: t('collectionCancel'), style: 'cancel' },
      {
        text: t('collectionClearConfirmYes'),
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
      Alert.alert(t('collectionNoExport'), t('collectionNoExportMsg'));
      return;
    }

    const lines: string[] = [
      t('collectonExportTitle'),
      t('collectionExportTime', { time: new Date().toLocaleString('zh-TW') }),
      t('collectionExportCount', { count: filteredRecords.length }),
      '═'.repeat(40),
    ];

    filteredRecords.forEach((record, i) => {
      lines.push('');
      lines.push(`【第 ${i + 1} 筆】${formatDate(record.timestamp)}`);
      lines.push(`神明：${record.godName}`);
      lines.push(`籤號：第 ${record.poem.number} 籤・${record.poem.title}・${record.poem.level}`);
      if (record.question) lines.push(t('collectionQuestionLabel', { q: record.question }));
      lines.push(`籤文：${record.poem.content}`);
      if (record.poem.vernacular) lines.push(`白話：${record.poem.vernacular}`);
      if (record.aiInterpretation) lines.push(t('collectionAiSummary', { summary: record.aiInterpretation.slice(0, 200) + '...' }));
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
    setFavorites(prev => prev.map(r =>
      r.id === record.id
        ? { ...r, actionProgress: r.actionProgress ? r.actionProgress.map((p, i) => i === index ? done : p) : [] }
        : r
    ));
    setHistory(prev => prev.map(r =>
      r.id === record.id
        ? { ...r, actionProgress: r.actionProgress ? r.actionProgress.map((p, i) => i === index ? done : p) : [] }
        : r
    ));
    await updateActionProgress(record.id, index, done);
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
          <Text style={styles.sectionTitle}>{t('collectionVerificationTitle')}</Text>
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
          {t('collectionVerifySchedule', { short: formatShortDate(record.verificationDueAt), long: formatShortDate(record.verificationFinalDueAt) })}
        </Text>
        {record.verificationNotes ? (
          <Text style={styles.verificationNote}>{t('collectionVerificationNote', { note: record.verificationNotes })}</Text>
        ) : null}

        {editingVerificationId === record.id ? (
          <View style={styles.noteEditArea}>
            <TextInput
              style={styles.noteInput}
              value={verificationNoteText}
              onChangeText={setVerificationNoteText}
              placeholder={t('collectionVerifyPlaceholder')}
              placeholderTextColor={theme.textMuted}
              multiline
            />
            <View style={styles.noteEditActions}>
              <TouchableOpacity
                onPress={() => handleSaveVerification(record.id)}
                style={styles.noteSaveBtn}
              >
                <Text style={styles.noteSaveText}>{t('collectionSaveTrack')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEditingVerificationId(null);
                  setVerificationNoteText('');
                }}
                style={styles.noteCancelBtn}
              >
                <Text style={styles.noteCancelText}>{t('collectionCancel')}</Text>
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
      style={[styles.recordCard, layout.isTablet && styles.recordCardDesktop]}
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
          <Text style={styles.confirmBadgeText}>{t('collectionConfirmBadgeText', { result: record.poemConfirmResult })}</Text>
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
        <Text style={styles.recordQuestion}>{t('collectionQuestionLabel', { q: record.question })}</Text>
        {record.aiInterpretation ? (
          <Text style={styles.recordAi}>
            {t('collectionAiSummary', { summary: record.aiInterpretation.replace(/\n+/g, ' ').slice(0, 90) + (record.aiInterpretation.length > 90 ? '...' : '') })}
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
            placeholder={t('collectionNotePlaceholder')}
            placeholderTextColor={theme.textMuted}
            multiline
          />
          <View style={styles.noteEditActions}>
            <TouchableOpacity onPress={() => handleSaveNote(record.id)} style={styles.noteSaveBtn}>
              <Text style={styles.noteSaveText}>{t('collectionSaveNote')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEditingNoteId(null);
                setNoteText('');
              }}
              style={styles.noteCancelBtn}
            >
              <Text style={styles.noteCancelText}>{t('collectionCancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : record.notes ? (
        <TouchableOpacity style={styles.noteView} onPress={() => handleStartEditNote(record)}>
          <Text style={styles.noteViewLabel}>{t('collectionPersonalNote')}</Text>
          <Text style={styles.noteViewText}>{record.notes}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.addNoteBtn} onPress={() => handleStartEditNote(record)}>
          <Text style={styles.addNoteText}>{t('collectionAddNote')}</Text>
        </TouchableOpacity>
      )}

      {isFavorite ? (
        <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveFavorite(record.id)}>
          <Text style={styles.removeBtnText}>{t('collectionRemoveFavorite')}</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.folderAddBtn}
        onPress={() => handleAddToFolder(record.id)}
      >
        <Text style={styles.folderAddBtnText}>📁 加入分類</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bgDark} />
      <View
        style={[
          styles.container,
          { maxWidth: layout.contentMaxWidth, paddingHorizontal: layout.gutter },
        ]}
      >
        <Text style={styles.pageTitle}>{t('collectionPageTitle')}</Text>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
              {t('collectionTabFavorites', { count: favorites.length })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              {t('collectionTabHistory', { count: history.length })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'folders' && styles.tabActive]}
            onPress={() => setActiveTab('folders')}
          >
            <Text style={[styles.tabText, activeTab === 'folders' && styles.tabTextActive]}>
              📁 分類 ({folders.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{filteredStats.count}</Text>
            <Text style={styles.summaryLabel}>{t('collectionCountLabel')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{filteredStats.tracked}</Text>
            <Text style={styles.summaryLabel}>{t('collectionTrackedLabel')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{filteredStats.due}</Text>
            <Text style={styles.summaryLabel}>{t('collectionDueLabel')}</Text>
          </View>
        </View>

        {filteredStats.due > 0 && activeTab !== 'folders' ? (
          <TouchableOpacity
            style={styles.reviewCenterBtn}
            onPress={() => {
              setActiveTab('history');
              setSelectedVerification('due');
              setSortMode('oldest');
            }}
          >
            <Text style={styles.reviewCenterText}>{t('collectionViewDue', { count: filteredStats.due })}</Text>
          </TouchableOpacity>
        ) : null}

        {/* ── Folders Tab / Detail View ── */}
        {activeTab === 'folders' && !selectedFolderId ? (
          <View>
            <TouchableOpacity
              style={styles.newFolderMainBtn}
              onPress={() => {
                setFolderTargetRecordId(null);
                setNewFolderModalVisible(true);
              }}
            >
              <Text style={styles.newFolderMainBtnText}>＋ 新增分類</Text>
            </TouchableOpacity>

            {folders.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📁</Text>
                <Text style={styles.emptyText}>尚無收藏分類</Text>
                <Text style={styles.emptyHint}>建立分類來整理你的籤詩收藏</Text>
              </View>
            ) : (
              <View style={styles.folderGrid}>
                {folders.map((folder) => (
                  <TouchableOpacity
                    key={folder.id}
                    style={[styles.folderCard, { borderColor: folder.color + '60' }]}
                    onPress={() => handleOpenFolder(folder.id)}
                    onLongPress={() => handleDeleteFolder(folder.id, folder.name)}
                  >
                    <View style={[styles.folderIconWrap, { backgroundColor: folder.color + '20' }]}>
                      <Text style={styles.folderIconText}>{folder.icon}</Text>
                    </View>
                    <Text style={styles.folderCardName} numberOfLines={1}>{folder.name}</Text>
                    <Text style={styles.folderCardCount}>{folder.recordIds.length} 筆記錄</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.folderBackToMain}
              onPress={() => setActiveTab('favorites')}
            >
              <Text style={styles.folderBackToMainText}>← 返回籤詩收藏</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── Folder Detail ── */}
        {activeTab === 'folders' && selectedFolderId ? (
          <View>
            {(() => {
              const currentFolder = folders.find((f) => f.id === selectedFolderId);
              return (
                <>
                  <View style={styles.folderDetailHeader}>
                    <TouchableOpacity style={styles.folderDetailBack} onPress={handleBackFromFolder}>
                      <Text style={styles.folderDetailBackText}>← 返回分類</Text>
                    </TouchableOpacity>
                    <Text style={styles.folderDetailTitle}>
                      {currentFolder?.icon ?? '📁'} {currentFolder?.name ?? ''}
                    </Text>
                    <TouchableOpacity
                      style={styles.folderDetailDelete}
                      onPress={() => {
                        if (currentFolder) {
                          handleDeleteFolder(currentFolder.id, currentFolder.name);
                          handleBackFromFolder();
                        }
                      }}
                    >
                      <Text style={styles.folderDetailDeleteText}>刪除</Text>
                    </TouchableOpacity>
                  </View>

                  {folderRecords.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyIcon}>📭</Text>
                      <Text style={styles.emptyText}>此分類尚無記錄</Text>
                      <Text style={styles.emptyHint}>將籤詩加入此分類即可在這裡查看</Text>
                    </View>
                  ) : (
                    folderRecords.map((record, i) => (
                      <AnimatedRecordItem key={record.id} delay={recordDelays[i]?.delay ?? 0}>
                        {renderRecord(record, false)}
                        <TouchableOpacity
                          style={[styles.folderRemoveBtn, { marginBottom: TempleSpacing.sm }]}
                          onPress={() => handleRemoveFromFolder(selectedFolderId!, record.id)}
                        >
                          <Text style={styles.folderRemoveBtnText}>從此分類移除</Text>
                        </TouchableOpacity>
                      </AnimatedRecordItem>
                    ))
                  )}
                </>
              );
            })()}
          </View>
        ) : null}

        {/* ── Original tabs content (non-folder) ── */}
        {activeTab !== 'folders' ? (
        <>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('collectionSearchPlaceholder')}
            placeholderTextColor={theme.textMuted}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.searchClear}>{t('collectionSearchClear')}</Text>
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
                {sortMode === 'newest' ? t('collectionSortNewest') : t('collectionSortOldest')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, notesOnly && styles.filterChipActive]}
              onPress={() => setNotesOnly((value) => !value)}
            >
              <Text style={[styles.filterChipText, notesOnly && styles.filterChipTextActive]}>
                {t('collectionNotesOnly')}
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
                {t('allGods')}
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
              { key: 'all', label: t('collectionAllVerifications') },
              { key: 'due', label: t('collectionDueFilter') },
              { key: 'pending', label: t('collectionPendingFilter') },
              { key: 'matched', label: t('collectionMatchedFilter') },
              { key: 'unmatched', label: t('collectionUnmatchedFilter') },
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
              { key: 'all', label: t('collectionAllLevels') },
              { key: 'good', label: t('collectionGoodFilter') },
              { key: 'neutral', label: t('collectionNeutralFilter') },
              { key: 'caution', label: t('collectionCautionFilter') },
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
            layout.isTablet && styles.listContentDesktop,
          ]}
        >
          {loading ? (
            <View style={{ paddingTop: TempleSpacing.md }}>
              <ListItemSkeleton lines={3} />
              <ListItemSkeleton lines={3} />
              <ListItemSkeleton lines={2} />
              <ListItemSkeleton lines={3} />
            </View>
          ) : (
            <Animated.View key={`tab-${activeTab}`}>
              {!filteredRecords.length ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📜</Text>
                  <Text style={styles.emptyText}>
                    {currentRecords.length
                      ? t('collectionNoMatch')
                      : t('collectionNoRecords')}
                  </Text>
                  <Text style={styles.emptyHint}>
                    {currentRecords.length
                      ? t('collectionNoMatchHint')
                      : t('collectionNoRecordsHint')}
                  </Text>
                  {hasActiveFilters ? (
                    <TouchableOpacity style={styles.emptyActionBtn} onPress={resetFilters}>
                      <Text style={styles.emptyActionText}>{t('collectionClearFilters')}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}

              {filteredRecords.map((record, i) => (
                <AnimatedRecordItem key={record.id} delay={recordDelays[i]?.delay ?? 0}>
                  {renderRecord(record, activeTab === 'favorites')}
                </AnimatedRecordItem>
              ))}

              {filteredRecords.length > 0 ? (
                <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
                  <Text style={styles.exportBtnText}>{t('collectionExportBtn', { count: filteredRecords.length })}</Text>
                </TouchableOpacity>
              ) : null}

              {activeTab === 'history' && history.length > 0 ? (
                <TouchableOpacity style={styles.clearBtn} onPress={handleClearHistory}>
                  <Text style={styles.clearBtnText}>{t('collectionClearHistory')}</Text>
                </TouchableOpacity>
              ) : null}
            </Animated.View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
        </>
        ) : null}
      </View>

      {/* ── Folder Picker Modal ── */}
      <Modal
        visible={folderPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFolderPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>加入收藏分類</Text>
              <TouchableOpacity onPress={() => setFolderPickerVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {folders.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: theme.textMuted, marginBottom: 12 }}>尚無分類，請先新增</Text>
                </View>
              ) : (
                folders.map((folder) => (
                  <TouchableOpacity
                    key={folder.id}
                    style={styles.folderPickerRow}
                    onPress={() => handleSelectFolderForRecord(folder.id)}
                  >
                    <View style={[styles.folderPickerIcon, { backgroundColor: folder.color + '20' }]}>
                      <Text>{folder.icon}</Text>
                    </View>
                    <Text style={styles.folderPickerName}>{folder.name}</Text>
                    <Text style={styles.folderPickerCount}>{folder.recordIds.length} 筆</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.newFolderInPickerBtn}
              onPress={() => {
                setFolderPickerVisible(false);
                setTimeout(() => setNewFolderModalVisible(true), 300);
              }}
            >
              <Text style={styles.newFolderInPickerText}>＋ 新增分類</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── New Folder Modal ── */}
      <Modal
        visible={newFolderModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNewFolderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>新增收藏分類</Text>
              <TouchableOpacity onPress={() => setNewFolderModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>分類名稱</Text>
            <TextInput
              style={styles.formInput}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="例如：重要籤詩、感情類"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={styles.formLabel}>選擇顏色</Text>
            <View style={styles.colorRow}>
              {FOLDER_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    newFolderColor === color && styles.colorDotSelected,
                  ]}
                  onPress={() => setNewFolderColor(color)}
                />
              ))}
            </View>

            <Text style={styles.formLabel}>選擇圖示</Text>
            <View style={styles.iconRow}>
              {FOLDER_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconChip,
                    newFolderIcon === icon && { backgroundColor: newFolderColor + '30', borderColor: newFolderColor },
                  ]}
                  onPress={() => setNewFolderIcon(icon)}
                >
                  <Text style={styles.iconChipText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.createFolderConfirmBtn, { backgroundColor: newFolderName.trim() ? newFolderColor : theme.goldDark + '40' }]}
              onPress={handleCreateAndAddFolder}
              disabled={!newFolderName.trim()}
            >
              <Text style={styles.createFolderConfirmText}>建立分類</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Toast ── */}
      {folderToast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{folderToast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, overflow: "hidden" as const, backgroundColor: theme.bgDark },
  container: { flex: 1, overflow: "hidden" as const, paddingTop: TempleSpacing.sm, width: '100%', alignSelf: 'center' },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: theme.goldLight,
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
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
  },
  tabActive: {
    backgroundColor: theme.goldDark + '30',
    borderColor: theme.gold,
  },
  tabText: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
  },
  tabTextActive: {
    color: theme.goldLight,
    fontWeight: '700',
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
    borderColor: theme.goldDark + '20',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.goldLight,
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 4,
  },
  reviewCenterBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.warning + '66',
    backgroundColor: theme.warning + '14',
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: TempleSpacing.sm,
  },
  reviewCenterText: {
    color: theme.goldLight,
    fontSize: TempleFonts.small,
    fontWeight: '900',
  },  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.goldDark + '20',
    paddingHorizontal: TempleSpacing.sm,
    marginBottom: TempleSpacing.sm,
  },
  searchIcon: {
    fontSize: 12,
    marginRight: 6,
    color: theme.textMuted,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: TempleFonts.small,
    color: theme.textLight,
  },
  searchClear: {
    fontSize: 12,
    color: theme.textMuted,
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
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '20',
  },
  filterChipActive: {
    backgroundColor: theme.goldDark + '24',
    borderColor: theme.gold,
  },
  filterChipText: {
    fontSize: 12,
    color: theme.textMuted,
  },
  filterChipTextActive: {
    color: theme.goldLight,
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
    backgroundColor: theme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
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
    color: theme.goldLight,
  },
  recordDate: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 2,
  },
  recordNumberBadge: {
    backgroundColor: theme.red + '28',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.red + '60',
  },
  recordNumber: {
    fontSize: 12,
    color: theme.goldLight,
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
    color: theme.goldLight,
    backgroundColor: theme.goldDark + '26',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  recordCategory: {
    fontSize: 11,
    color: theme.textLight,
    backgroundColor: theme.bgDark + '40',
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
    borderColor: theme.warning + '70',
    backgroundColor: theme.warning + '12',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  confirmBadgeOk: {
    borderColor: theme.success + '70',
    backgroundColor: theme.success + '12',
  },
  confirmBadgeText: {
    color: theme.textLight,
    fontSize: 11,
    fontWeight: '700',
  },  recordPoem: {
    backgroundColor: theme.bgLight,
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
    borderTopColor: theme.goldDark + '20',
    paddingTop: TempleSpacing.sm,
  },
  recordQuestion: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
    lineHeight: 20,
  },
  recordAi: {
    fontSize: 12,
    color: theme.textLight,
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
    borderColor: theme.gold,
    color: theme.bgDark,
    textAlign: 'center',
    lineHeight: 16,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
  },
  planCheckBoxDone: {
    backgroundColor: theme.success,
    borderColor: theme.success,
    color: theme.bgDark,
  },  planText: {
    fontSize: 12,
    color: theme.goldLight,
    lineHeight: 18,
  },
  planTextDone: {
    color: theme.textMuted,
    textDecorationLine: 'line-through',
  },
  verificationCard: {
    marginTop: TempleSpacing.sm,
    padding: TempleSpacing.sm,
    borderRadius: 10,
    backgroundColor: theme.bgDark + '38',
    borderWidth: 1,
    borderColor: theme.goldDark + '18',
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    color: theme.goldLight,
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
    borderColor: theme.goldDark + '24',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.bgCard,
  },
  verificationBtnText: {
    fontSize: 12,
    color: theme.textLight,
  },
  verificationSchedule: {
    color: theme.textMuted,
    fontSize: 11,
    marginTop: 8,
  },
  verificationNote: {
    marginTop: 8,
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  noteEditArea: { marginTop: TempleSpacing.sm },
  noteInput: {
    backgroundColor: theme.bgDark + '40',
    borderRadius: 8,
    padding: TempleSpacing.sm,
    fontSize: TempleFonts.small,
    color: theme.textLight,
    minHeight: 72,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
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
    backgroundColor: theme.goldDark + '40',
  },
  noteSaveText: {
    fontSize: 12,
    color: theme.goldLight,
    fontWeight: '600',
  },
  noteCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: theme.bgDark + '40',
  },
  noteCancelText: {
    fontSize: 12,
    color: theme.textMuted,
  },
  noteView: {
    marginTop: TempleSpacing.sm,
    padding: TempleSpacing.sm,
    backgroundColor: theme.bgDark + '30',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.goldDark + '15',
  },
  noteViewLabel: {
    fontSize: 11,
    color: theme.goldLight,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteViewText: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
    lineHeight: 20,
  },
  addNoteBtn: {
    marginTop: TempleSpacing.sm,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.goldDark + '20',
    borderStyle: 'dashed',
  },
  addNoteText: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
  },
  removeBtn: {
    marginTop: TempleSpacing.sm,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.danger + '30',
  },
  removeBtnText: {
    fontSize: 12,
    color: theme.danger,
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
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyActionBtn: {
    marginTop: TempleSpacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '35',
  },
  emptyActionText: {
    fontSize: TempleFonts.small,
    color: theme.goldLight,
    fontWeight: '700',
  },
  exportBtn: {
    width: '100%',
    marginTop: TempleSpacing.md,
    paddingVertical: TempleSpacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.goldDark + '40',
    backgroundColor: theme.bgCard,
  },
  exportBtnText: {
    fontSize: TempleFonts.small,
    color: theme.goldLight,
  },
  clearBtn: {
    width: '100%',
    marginTop: TempleSpacing.lg,
    paddingVertical: TempleSpacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.danger + '20',
  },
  clearBtnText: {
    fontSize: TempleFonts.small,
    color: theme.danger,
  },
  // ── Folder styles ──
  folderAddBtn: {
    marginTop: TempleSpacing.sm,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
    backgroundColor: theme.bgDark + '20',
  },
  folderAddBtnText: {
    fontSize: 12,
    color: theme.textMuted,
  },
  folderRemoveBtn: {
    marginTop: TempleSpacing.sm,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.warning + '30',
  },
  folderRemoveBtnText: {
    fontSize: 12,
    color: theme.warning,
  },
  newFolderMainBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: theme.goldDark + '24',
    borderWidth: 1,
    borderColor: theme.gold + '40',
    alignItems: 'center',
    marginBottom: TempleSpacing.md,
  },
  newFolderMainBtnText: {
    fontSize: TempleFonts.body,
    color: theme.goldLight,
    fontWeight: '700',
  },
  folderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  folderCard: {
    width: '48%',
    backgroundColor: theme.bgCard,
    borderRadius: 14,
    padding: TempleSpacing.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  folderIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  folderIconText: {
    fontSize: 22,
  },
  folderCardName: {
    fontSize: TempleFonts.body,
    fontWeight: '700',
    color: theme.goldLight,
    marginBottom: 4,
    textAlign: 'center',
  },
  folderCardCount: {
    fontSize: 11,
    color: theme.textMuted,
  },
  folderBackToMain: {
    marginTop: TempleSpacing.lg,
    alignItems: 'center',
    paddingVertical: 8,
  },
  folderBackToMainText: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
  },
  folderDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: TempleSpacing.md,
  },
  folderDetailBack: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
  },
  folderDetailBackText: {
    fontSize: TempleFonts.small,
    color: theme.goldLight,
  },
  folderDetailTitle: {
    fontSize: TempleFonts.heading,
    fontWeight: '800',
    color: theme.goldLight,
  },
  folderDetailDelete: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.danger + '20',
    borderWidth: 1,
    borderColor: theme.danger + '40',
  },
  folderDetailDeleteText: {
    fontSize: TempleFonts.small,
    color: theme.danger,
    fontWeight: '600',
  },
  // ── Modal styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.bgDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: TempleSpacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TempleSpacing.md,
  },
  modalTitle: {
    fontSize: TempleFonts.heading,
    fontWeight: '800',
    color: theme.goldLight,
  },
  modalClose: {
    fontSize: 20,
    color: theme.textMuted,
    padding: 4,
  },
  folderPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.bgCard,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.goldDark + '15',
  },
  folderPickerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  folderPickerName: {
    flex: 1,
    fontSize: TempleFonts.body,
    color: theme.textLight,
    fontWeight: '600',
  },
  folderPickerCount: {
    fontSize: TempleFonts.caption,
    color: theme.textMuted,
  },
  newFolderInPickerBtn: {
    marginTop: TempleSpacing.sm,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.gold + '40',
    borderStyle: 'dashed',
  },
  newFolderInPickerText: {
    fontSize: TempleFonts.body,
    color: theme.goldLight,
    fontWeight: '600',
  },
  formLabel: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
    marginBottom: 8,
    marginTop: 12,
    fontWeight: '600',
  },
  formInput: {
    backgroundColor: theme.bgCard,
    borderRadius: 10,
    padding: 12,
    fontSize: TempleFonts.body,
    color: theme.textLight,
    borderWidth: 1,
    borderColor: theme.goldDark + '30',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.goldDark + '20',
    backgroundColor: theme.bgCard,
  },
  iconChipText: {
    fontSize: 20,
  },
  createFolderConfirmBtn: {
    marginTop: TempleSpacing.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  createFolderConfirmText: {
    fontSize: TempleFonts.body,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: theme.goldDark,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: TempleFonts.small,
    fontWeight: '600',
  },
  });
}
