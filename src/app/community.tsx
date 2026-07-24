// 社群討論版 — 用戶分享籤詩心得，Firebase 支援（降級為本機 mock）
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useFadeIn, useStaggeredList } from '@/hooks/useEntranceAnimation';
import { ListItemSkeleton } from '@/components/Skeleton';
import type { ThemeColors } from '@/constants/themes';
import { isFirebaseConfigured } from '@/services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Post {
  id: string;
  godName: string;
  poemNumber: number;
  poemLevel: string;
  comment: string;
  timestamp: number;
  likes: number;
  likedByMe?: boolean;
}

const LOCAL_KEY = '@community_posts_v1';
const MAX_LOCAL = 30;

// 預設示範貼文
const SEED_POSTS: Post[] = [
  { id: 's1', godName: '媽祖', poemNumber: 12, poemLevel: '上上籤', comment: '求感情求到上上籤！媽祖保佑真的很靈，一個月後就和好了 🙏', timestamp: Date.now() - 86400000 * 2, likes: 14 },
  { id: 's2', godName: '關聖帝君', poemNumber: 38, poemLevel: '中平籤', comment: '求事業求到中平，關帝說要穩紮穩打，果然沒過多久升職了', timestamp: Date.now() - 86400000 * 5, likes: 8 },
  { id: 's3', godName: '土地公', poemNumber: 7, poemLevel: '吉籤', comment: '買房前來求籤，求到吉籤，最後真的順利過戶！感恩福德正神', timestamp: Date.now() - 86400000 * 8, likes: 21 },
  { id: 's4', godName: '觀世音菩薩', poemNumber: 51, poemLevel: '上吉籤', comment: '家人生病求菩薩保佑，求到上吉，後來手術很順利，南無觀世音菩薩', timestamp: Date.now() - 86400000 * 12, likes: 35 },
];

function levelColor(level: string) {
  if (level.includes('上上') || level.includes('大吉')) return '#FFD700';
  if (level.includes('吉')) return '#7EC850';
  if (level.includes('下') || level.includes('凶')) return '#E05050';
  return '#C9A96E';
}

function AnimatedPostItem({ delay, children }: { delay: number; children: React.ReactNode }) {
  const { opacity, translateY } = useFadeIn({ delay });
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function CommunityScreen() {
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const layout = useResponsiveLayout();
  const styles = useMemo(() => ({ ...createViewStyles(theme, layout), ...createTextStyles(theme) }), [theme, layout]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [godName, setGodName] = useState('');
  const [poemNum, setPoemNum] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const usingFirebase = isFirebaseConfigured();
  const postDelays = useStaggeredList({ itemCount: 30, staggerDelay: 60 });

  const loadPosts = useCallback(async () => {
    if (usingFirebase) {
      try {
        const { getFirebaseApp } = await import('@/services/firebaseConfig');
        const app = getFirebaseApp();
        if (app) {
          const { getFirestore, collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
          const db = getFirestore(app);
          const q = query(collection(db, 'community'), orderBy('timestamp', 'desc'), limit(30));
          const snap = await getDocs(q);
          const items: Post[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
          setPosts(items);
          setLoading(false);
          return;
        }
      } catch { /* fallback */ }
    }
    // 本機模式
    try {
      const raw = await AsyncStorage.getItem(LOCAL_KEY);
      const local: Post[] = raw ? JSON.parse(raw) : [];
      setPosts([...local, ...SEED_POSTS]);
    } catch {
      setPosts(SEED_POSTS);
    }
    setLoading(false);
  }, [usingFirebase]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleSubmit = async () => {
    const text = comment.trim();
    if (!text || text.length < 5) return;
    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newPost: Post = {
      id: `local_${Date.now()}`,
      godName: godName.trim() || t('communityDefaultGodName'),
      poemNumber: parseInt(poemNum) || 0,
      poemLevel: '',
      comment: text,
      timestamp: Date.now(),
      likes: 0,
    };

    if (usingFirebase) {
      try {
        const { getFirebaseApp } = await import('@/services/firebaseConfig');
        const app = getFirebaseApp();
        if (app) {
          const { getFirestore, collection, addDoc } = await import('firebase/firestore');
          const db = getFirestore(app);
          const ref = await addDoc(collection(db, 'community'), newPost);
          newPost.id = ref.id;
        }
      } catch { /* fallback */ }
    } else {
      try {
        const raw = await AsyncStorage.getItem(LOCAL_KEY);
        const local: Post[] = raw ? JSON.parse(raw) : [];
        const updated = [newPost, ...local].slice(0, MAX_LOCAL);
        await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      } catch { /* ignore */ }
    }

    setPosts(prev => [newPost, ...prev]);
    setComment('');
    setGodName('');
    setPoemNum('');
    setShowForm(false);
    setSubmitting(false);
  };

  const handleLike = async (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe }
        : p
    ));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('communityPageTitle')}</Text>
          <Text style={styles.headerSub}>{t('communityHeaderSub')}</Text>
          {!usingFirebase && (
            <View style={styles.localBadge}>
              <Text style={styles.localBadgeText}>{t('communityLocalBadge')}</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainColumn}>
            {/* 新增貼文區 */}
            {!layout.isDesktop && (
              <>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(v => !v)} activeOpacity={0.8}>
                  <Text style={styles.addBtnText}>{showForm ? t('communityAddBtnCollapse') : t('communityAddBtn')}</Text>
                </TouchableOpacity>
                {showForm && (
                  <View style={styles.form}>
                    <View style={styles.formRow}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder={t('communityPlaceholderGod')}
                        placeholderTextColor={theme.textMuted}
                        value={godName}
                        onChangeText={setGodName}
                      />
                      <TextInput
                        style={[styles.input, { width: 80 }]}
                        placeholder={t('communityPlaceholderPoem')}
                        placeholderTextColor={theme.textMuted}
                        value={poemNum}
                        onChangeText={setPoemNum}
                        keyboardType="number-pad"
                        maxLength={3}
                      />
                    </View>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder={t('communityPlaceholderComment')}
                      placeholderTextColor={theme.textMuted}
                      value={comment}
                      onChangeText={setComment}
                      multiline
                      maxLength={200}
                    />
                    <View style={styles.formFooter}>
                      <Text style={styles.charCount}>{comment.length}/200</Text>
                      <TouchableOpacity
                        style={[styles.submitBtn, (!comment.trim() || comment.length < 5) && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting || !comment.trim() || comment.length < 5}
                      >
                        {submitting
                          ? <ActivityIndicator size="small" color={theme.bgDark} />
                          : <Text style={styles.submitBtnText}>{t('communityButtonPublish')}</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* 貼文列表 */}
            {loading ? (
              <View style={{ marginTop: 16 }}>
                <ListItemSkeleton lines={3} />
                <ListItemSkeleton lines={2} />
                <ListItemSkeleton lines={3} />
              </View>
            ) : (
              posts.map((post, i) => (
                <AnimatedPostItem key={post.id} delay={postDelays[i]?.delay ?? 0}>
                  <View style={styles.post}>
                  <View style={styles.postHeader}>
                    <View style={styles.postGodBadge}>
                      <Text style={styles.postGodName}>{post.godName}</Text>
                      {post.poemNumber > 0 && (
                        <Text style={styles.postPoemNum}>第{post.poemNumber}籤</Text>
                      )}
                      {post.poemLevel ? (
                        <Text style={[styles.postLevel, { color: levelColor(post.poemLevel) }]}>
                          {post.poemLevel}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.postTime}>{(() => { const diff = Date.now() - post.timestamp; if (diff < 3600000) return t('communityTimeMinAgo', { n: Math.floor(diff / 60000) }); if (diff < 86400000) return t('communityTimeHourAgo', { n: Math.floor(diff / 3600000) }); return t('communityTimeDayAgo', { n: Math.floor(diff / 86400000) }); })()}</Text>
                  </View>
                  <Text style={styles.postComment}>{post.comment}</Text>
                  <View style={styles.postFooter}>
                    <TouchableOpacity style={styles.likeBtn} onPress={() => handleLike(post.id)}>
                      <Text style={styles.likeBtnText}>
                        {post.likedByMe ? '❤️' : '🤍'} {post.likes}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                </AnimatedPostItem>
              ))
            )}
            <View style={{ height: 40 }} />
          </View>

          {/* 桌面端：表單放在右側 */}
          {layout.isDesktop && (
            <View style={styles.sideColumn}>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(v => !v)} activeOpacity={0.8}>
                <Text style={styles.addBtnText}>{showForm ? t('communityAddBtnCollapse') : t('communityAddBtn')}</Text>
              </TouchableOpacity>
              {showForm && (
                <View style={styles.form}>
                  <View style={styles.formRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="神明名稱（如：媽祖）"
                      placeholderTextColor={theme.textMuted}
                      value={godName}
                      onChangeText={setGodName}
                    />
                    <TextInput
                      style={[styles.input, { width: 80 }]}
                      placeholder="籤號"
                      placeholderTextColor={theme.textMuted}
                      value={poemNum}
                      onChangeText={setPoemNum}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  </View>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="分享你的心得、靈驗故事或請示結果…（最少5字）"
                    placeholderTextColor={theme.textMuted}
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    maxLength={200}
                  />
                  <View style={styles.formFooter}>
                    <Text style={styles.charCount}>{comment.length}/200</Text>
                    <TouchableOpacity
                      style={[styles.submitBtn, (!comment.trim() || comment.length < 5) && styles.submitBtnDisabled]}
                      onPress={handleSubmit}
                      disabled={submitting || !comment.trim() || comment.length < 5}
                    >
                      {submitting
                        ? <ActivityIndicator size="small" color={theme.bgDark} />
                        : <Text style={styles.submitBtnText}>發布</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


function createViewStyles(theme: ThemeColors, layout: ReturnType<typeof useResponsiveLayout>) {
  return StyleSheet.create<Record<string, any>>({
  safe: { flex: 1, backgroundColor: theme.bgDark },
  header: {
    paddingHorizontal: TempleSpacing.lg,
    paddingTop: TempleSpacing.md,
    paddingBottom: TempleSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2020',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  localBadge: {
    marginTop: 6, backgroundColor: '#2A2010', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: TempleSpacing.md,
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    width: '100%',
    flexDirection: layout.isDesktop ? 'row' : 'column',
    gap: layout.isDesktop ? TempleSpacing.md : 0,
  },
  mainColumn: {
    flex: layout.isDesktop ? 2 : 1,
  },
  sideColumn: {
    flex: layout.isDesktop ? 1 : undefined,
    width: layout.isDesktop ? undefined : '100%',
  },
  addBtn: {
    backgroundColor: theme.bgCard,
    borderRadius: 10, borderWidth: 1,
    borderColor: theme.goldDark,
    paddingVertical: 12, alignItems: 'center', marginBottom: 12,
  },
  form: {
    backgroundColor: theme.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: '#2A2020',
    padding: TempleSpacing.md, marginBottom: 16,
  },
  formRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  formFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  submitBtn: {
    backgroundColor: theme.gold, borderRadius: 8,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  submitBtnDisabled: { opacity: 0.4 },
  post: {
    backgroundColor: theme.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: '#2A2020',
    padding: TempleSpacing.md, marginBottom: 10,
  },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  postGodBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  postFooter: { flexDirection: 'row', marginTop: 10 },
  likeBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  });
}


function createTextStyles(theme: ThemeColors) {
  return StyleSheet.create<Record<string, any>>({
  headerTitle: { color: theme.gold, fontSize: 20, fontWeight: '900' },
  headerSub: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
  localBadgeText: { color: '#C9A96E', fontSize: 11 },
  addBtnText: { color: theme.gold, fontSize: 14, fontWeight: '700' },
  input: {
    backgroundColor: theme.bgDark,
    borderWidth: 1, borderColor: '#3A2A20', borderRadius: 8,
    color: theme.textLight, fontSize: 14,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  charCount: { color: theme.textMuted, fontSize: 12 },
  submitBtnText: { color: theme.bgDark, fontWeight: '900', fontSize: 14 },
  postGodName: { color: theme.goldLight, fontSize: 13, fontWeight: '700' },
  postPoemNum: { color: theme.textMuted, fontSize: 11 },
  postLevel: { fontSize: 11, fontWeight: '700' },
  postTime: { color: theme.textMuted, fontSize: 11 },
  postComment: { color: theme.textLight, fontSize: 14, lineHeight: 22 },
  likeBtnText: { color: theme.textMuted, fontSize: 13 },
  });
}
