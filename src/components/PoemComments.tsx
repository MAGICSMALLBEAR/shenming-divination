// 籤詩社群留言元件 - 嵌入 PoemCard 底部
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { getComments, addComment, deleteComment, type Comment } from '@/services/commentsService';

interface PoemCommentsProps {
  poemNumber: number;
  currentUserName?: string;
}

export function PoemComments({ poemNumber, currentUserName }: PoemCommentsProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const list = await getComments(poemNumber);
    setComments(list);
    setIsLoading(false);
  }, [poemNumber]);

  useEffect(() => {
    if (expanded) load();
  }, [expanded, load]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    await addComment(poemNumber, currentUserName || '匿名信眾', newComment.trim());
    setNewComment('');
    await load();
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    await deleteComment(id);
    await load();
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.toggleBtn} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.toggleText}>
          💬 信眾留言 {comments.length > 0 ? `(${comments.length})` : ''}
        </Text>
        <Text style={styles.toggleArrow}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.panel}>
          {/* 輸入欄 */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="留下你的感悟..."
              placeholderTextColor={theme.textMuted}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!newComment.trim() || isSubmitting) && styles.sendBtnDisabled]}
              onPress={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting
                ? <ActivityIndicator size="small" color={theme.goldLight} />
                : <Text style={styles.sendBtnText}>送出</Text>
              }
            </TouchableOpacity>
          </View>

          {/* 留言列表 */}
          {isLoading ? (
            <ActivityIndicator color={theme.goldLight} style={{ margin: TempleSpacing.md }} />
          ) : comments.length === 0 ? (
            <Text style={styles.empty}>目前還沒有留言，成為第一個留言的信眾吧！</Text>
          ) : (
            comments.map(c => (
              <View key={c.id} style={styles.comment}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>🙏 {c.author}</Text>
                  <Text style={styles.commentTime}>{formatTime(c.timestamp)}</Text>
                </View>
                <Text style={styles.commentContent}>{c.content}</Text>
                {c.author === (currentUserName || '匿名信眾') && (
                  <TouchableOpacity onPress={() => handleDelete(c.id)}>
                    <Text style={styles.deleteText}>刪除</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  container: { marginTop: TempleSpacing.md },
  toggleBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: TempleSpacing.sm, paddingHorizontal: TempleSpacing.md,
    backgroundColor: theme.bgCard, borderRadius: 10,
    borderWidth: 1, borderColor: theme.goldDark + '20',
  },
  toggleText: { fontSize: TempleFonts.small, color: theme.textLight },
  toggleArrow: { fontSize: 10, color: theme.textMuted },
  panel: {
    marginTop: TempleSpacing.xs,
    backgroundColor: theme.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: theme.goldDark + '15',
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row', padding: TempleSpacing.sm, gap: TempleSpacing.xs,
    borderBottomWidth: 1, borderBottomColor: theme.goldDark + '15',
  },
  input: {
    flex: 1, backgroundColor: theme.bgDark + '50', borderRadius: 8,
    padding: 8, fontSize: TempleFonts.small, color: theme.textLight, minHeight: 36,
  },
  sendBtn: {
    paddingHorizontal: TempleSpacing.md, paddingVertical: 8, borderRadius: 8,
    backgroundColor: theme.goldDark, alignSelf: 'flex-end',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#FFF', fontSize: TempleFonts.small, fontWeight: '700' },
  empty: {
    fontSize: TempleFonts.small, color: theme.textMuted,
    textAlign: 'center', padding: TempleSpacing.lg,
  },
  comment: {
    paddingHorizontal: TempleSpacing.md, paddingVertical: TempleSpacing.sm,
    borderBottomWidth: 1, borderBottomColor: theme.goldDark + '10',
  },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentAuthor: { fontSize: 12, color: theme.goldLight, fontWeight: '600' },
  commentTime: { fontSize: 11, color: theme.textMuted },
  commentContent: { fontSize: TempleFonts.small, color: theme.textLight, lineHeight: 20 },
  deleteText: { fontSize: 11, color: theme.danger, marginTop: 4, alignSelf: 'flex-end' },
  });
}
