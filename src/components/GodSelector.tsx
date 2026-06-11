import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gods, questionCategories, type God } from '@/data/gods';
import { getGodCardImage } from '@/data/godImages';
import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import { getGodProfile } from '@/data/godProfiles';
import { reviewQuestion, suggestQuestionDrafts } from '@/services/questionAssistant';
import { recommendGods } from '@/services/recommendation';
import { calcBazi, parseBirthYear } from '@/services/bazi';
import { getHistory, getSettings } from '@/services/storage';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface GodSelectorProps {
  onSelectGod: (godId: number) => void;
}

interface QuestionFormProps {
  onSubmit: (question: string, category: string, userName: string) => void;
  selectedGod?: God | null;
  onSwitchGod?: (godId: number) => void;
  forWhom?: string;
}

export function GodSelector({ onSelectGod }: GodSelectorProps) {
  const layout = useResponsiveLayout();
  const [patronGodId, setPatronGodId] = useState<number | null>(null);
  const [preferredGodId, setPreferredGodId] = useState<number | null>(null);
  const [detailGod, setDetailGod] = useState<God | null>(null);
  const isCompact = layout.width < 420;
  const columns = layout.isWideDesktop ? 4 : layout.isDesktop ? 3 : isCompact ? 1 : 2;
  const maxContentWidth = layout.isWideDesktop ? 1180 : layout.contentMaxWidth;
  const gridWidth = Math.min(Math.max(layout.width - layout.gutter * 2, 0), maxContentWidth);
  const cardWidth =
    columns === 1
      ? gridWidth
      : (gridWidth - TempleSpacing.sm * (columns - 1)) / columns;

  useEffect(() => {
    getSettings().then((settings) => {
      setPreferredGodId(settings?.preferredGodId ?? null);
      if (!settings?.birthDate) return;
      const year = parseBirthYear(settings.birthDate);
      if (!year) return;
      setPatronGodId(calcBazi(year).patronGodId);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>選擇要請示的神明</Text>
      <Text style={styles.subtitle}>
        {patronGodId
          ? '已依你的設定標出守護神，若有常拜神明也可以直接選。'
          : '先選一位你想請示的神明，再帶著問題進入求籤。'}
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { maxWidth: maxContentWidth }]}
      >
        <View style={styles.grid}>
          {gods.map((god) => (
            <GodCard
              key={god.id}
              god={god}
              width={cardWidth}
              isPatron={patronGodId === god.id}
              isPreferred={preferredGodId === god.id}
              cardStyle={isCompact && styles.cardWrapperCompact}
              onPress={() => onSelectGod(god.id)}
              onDetail={() => setDetailGod(god)}
            />
          ))}
        </View>
      </ScrollView>

      {detailGod && (
        <GodDetailModal
          god={detailGod}
          onClose={() => setDetailGod(null)}
          onSelect={() => { setDetailGod(null); onSelectGod(detailGod.id); }}
        />
      )}
    </View>
  );
}

function GodCard({
  god,
  width,
  isPatron,
  isPreferred,
  onPress,
  onDetail,
  cardStyle,
}: {
  god: God;
  width: DimensionValue;
  isPatron: boolean;
  isPreferred: boolean;
  onPress: () => void;
  onDetail: () => void;
  cardStyle?: StyleProp<ViewStyle>;
}) {
  const cardImage = getGodCardImage(god.id);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.86} style={[styles.cardWrapper, { width }, cardStyle]}>
      <View style={[styles.godCard, { borderColor: god.accentColor + '66' }]}>
        <View style={styles.badgeRow}>
          {isPatron ? (
            <View style={[styles.badge, { backgroundColor: god.primaryColor }]}>
              <Text style={styles.badgeText}>守護</Text>
            </View>
          ) : null}
          {isPreferred ? (
            <View style={[styles.badge, styles.badgeSecondary]}>
              <Text style={styles.badgeText}>常用</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.godPortrait, { borderColor: god.accentColor + '55', backgroundColor: god.primaryColor + '50' }]}>
          {cardImage ? (
            <Image source={cardImage} style={styles.godPortraitImage} contentFit="cover" contentPosition="top" transition={300} />
          ) : null}
          <View style={[styles.godPortraitOverlay, { backgroundColor: god.primaryColor + '16' }]} />
        </View>

        <Text style={[styles.godTitle, { color: god.accentColor }]}>{god.title}</Text>
        <Text style={styles.godName}>{god.name}</Text>
        <Text style={[styles.godTagline, { color: god.accentColor }]}>{god.tagline}</Text>
        <Text style={styles.godPoem}>
          {god.poemSystem} · {god.totalPoems} 首
        </Text>
        <TouchableOpacity
          style={[styles.detailBtn, { borderColor: god.accentColor + '50' }]}
          onPress={onDetail}
          activeOpacity={0.7}
        >
          <Text style={[styles.detailBtnText, { color: god.accentColor }]}>查看詳細</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function GodDetailModal({ god, onClose, onSelect }: { god: God; onClose: () => void; onSelect: () => void }) {
  const cardImage = getGodCardImage(god.id);
  const profile = getGodProfile(god.id);

  return (
    <Modal visible={true} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={modalStyles.safeArea}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
            <Text style={modalStyles.closeBtnText}>✕ 關閉</Text>
          </TouchableOpacity>
          <Text style={modalStyles.headerTitle}>神明詳情</Text>
          <View style={modalStyles.spacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modalStyles.scrollContent}>
          {/* 大圖 */}
          <View style={[modalStyles.heroWrap, { borderColor: god.accentColor + '66' }]}>
            {cardImage ? (
              <Image source={cardImage} style={modalStyles.heroImage} contentFit="cover" contentPosition="top" transition={300} />
            ) : null}
            <View style={[modalStyles.heroOverlay, { backgroundColor: god.primaryColor + 'BB' }]} />
            <View style={modalStyles.heroContent}>
              <Text style={[modalStyles.heroTitle, { color: god.accentColor }]}>{god.title}</Text>
              <Text style={modalStyles.heroName}>{god.name}</Text>
              <Text style={[modalStyles.heroTagline, { color: god.accentColor }]}>{god.tagline}</Text>
            </View>
          </View>

          {/* 介紹 */}
          <View style={modalStyles.section}>
            <Text style={modalStyles.sectionTitle}>📖 神明介紹</Text>
            <Text style={modalStyles.bodyText}>{god.description}</Text>
          </View>

          {/* 籤詩系統 */}
          <View style={modalStyles.section}>
            <Text style={modalStyles.sectionTitle}>🎋 籤詩系統</Text>
            <View style={modalStyles.infoRow}>
              <View style={[modalStyles.badge, { backgroundColor: god.primaryColor + '30', borderColor: god.accentColor + '50' }]}>
                <Text style={[modalStyles.badgeText, { color: god.accentColor }]}>{god.poemSystem}</Text>
              </View>
              <Text style={modalStyles.muted}>共 {god.totalPoems} 首籤詩</Text>
            </View>
            <Text style={[modalStyles.muted, { marginTop: 8 }]}>{god.blessing}</Text>
          </View>

          {profile && (
            <>
              {/* 主掌範疇 */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>🙏 主掌範疇</Text>
                <View style={modalStyles.chipRow}>
                  {profile.patronages.map((item) => (
                    <View key={item} style={[modalStyles.chip, { borderColor: god.accentColor + '40', backgroundColor: god.primaryColor + '18' }]}>
                      <Text style={[modalStyles.chipText, { color: god.accentColor }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 適合問的題目 */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>💬 適合請示</Text>
                {profile.suitableTopics.map((tip, i) => (
                  <Text key={i} style={modalStyles.bullet}>• {tip}</Text>
                ))}
              </View>

              {/* 參拜提醒 */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>🏮 提問小提醒</Text>
                {profile.worshipTips.map((tip, i) => (
                  <Text key={i} style={modalStyles.bullet}>• {tip}</Text>
                ))}
              </View>

              {/* 別稱 */}
              <View style={modalStyles.section}>
                <Text style={modalStyles.sectionTitle}>🏷️ 別稱</Text>
                <View style={modalStyles.chipRow}>
                  {profile.aliases.map((alias) => (
                    <View key={alias} style={[modalStyles.chip, { borderColor: god.accentColor + '30' }]}>
                      <Text style={[modalStyles.chipText, { color: TempleTheme.goldLight }]}>{alias}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* 選神按鈕 */}
          <TouchableOpacity
            style={[modalStyles.selectBtn, { backgroundColor: god.primaryColor }]}
            onPress={onSelect}
            activeOpacity={0.85}
          >
            <Text style={modalStyles.selectBtnText}>向 {god.name} 求籤</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export function QuestionForm({ onSubmit, selectedGod, onSwitchGod, forWhom }: QuestionFormProps) {
  const layout = useResponsiveLayout();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('general');
  const [userName, setUserName] = useState('');
  const [settingsBirthDate, setSettingsBirthDate] = useState('');
  const [preferredGodId, setPreferredGodId] = useState<number | null>(null);
  const [history, setHistory] = useState<Awaited<ReturnType<typeof getHistory>>>([]);
  const formMaxWidth = layout.narrowMaxWidth;

  useEffect(() => {
    Promise.all([getSettings(), getHistory()]).then(([settings, records]) => {
      setPreferredGodId(settings?.preferredGodId ?? null);
      setSettingsBirthDate(settings?.birthDate ?? '');
      setHistory(records);
      if (settings?.userName) setUserName(settings.userName);
    });
  }, []);

  const reviews = useMemo(() => reviewQuestion(question), [question]);
  const drafts = useMemo(() => suggestQuestionDrafts(question, category), [question, category]);
  const recommendations = useMemo(
    () =>
      recommendGods({
        questionCategory: category,
        birthDate: settingsBirthDate,
        preferredGodId,
        history,
      }),
    [category, history, preferredGodId, settingsBirthDate]
  );

  const alternativeRecommendations = recommendations.filter(
    (item) => item.god.id !== selectedGod?.id
  );

  return (
    <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.formContainer, { maxWidth: formMaxWidth }]}>
        <Text style={styles.title}>整理你的問題</Text>
        {forWhom ? (
          <View style={styles.forWhomBanner}>
            <Text style={styles.forWhomText}>🙏 代替 <Text style={styles.forWhomName}>{forWhom}</Text> 求籤</Text>
          </View>
        ) : null}
        <Text style={styles.subtitle}>題目越聚焦，籤意越容易讀得清楚。</Text>

        {selectedGod ? (
          <View style={[styles.selectedCard, { borderColor: selectedGod.accentColor + '55' }]}>
            {getGodCardImage(selectedGod.id) ? (
              <Image
                source={getGodCardImage(selectedGod.id)}
                style={styles.selectedCardBg}
                contentFit="cover"
                contentPosition="top"
                transition={300}
              />
            ) : null}
            <View style={[styles.selectedCardOverlay, { backgroundColor: selectedGod.primaryColor + 'CC' }]} />
            <View style={styles.selectedCardContent}>
              <Text style={[styles.selectedLabel, { color: selectedGod.accentColor }]}>目前請示對象</Text>
              <Text style={styles.selectedName}>{selectedGod.name}</Text>
              <Text style={[styles.selectedText, { color: selectedGod.accentColor }]}>{selectedGod.tagline}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>稱呼</Text>
          <TextInput
            style={styles.nameTextInput}
            value={userName}
            onChangeText={setUserName}
            placeholder="可輸入名字，或保持空白"
            placeholderTextColor={TempleTheme.textMuted}
          />
          <View style={styles.nameButtons}>
            {['自己', '家人', '朋友'].map((name) => (
              <TouchableOpacity
                key={name}
                style={[styles.nameBtn, userName === name && styles.nameBtnActive]}
                onPress={() => setUserName(name)}
              >
                <Text style={[styles.nameBtnText, userName === name && styles.nameBtnTextActive]}>
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>問題類型</Text>
          <View style={styles.categoryGrid}>
            {questionCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, category === cat.id && styles.categoryChipActive]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[styles.categoryText, category === cat.id && styles.categoryTextActive]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>想問的事情</Text>
          <TextInput
            style={styles.questionInput}
            value={question}
            onChangeText={setQuestion}
            placeholder="例如：我近期是否適合換工作？"
            placeholderTextColor={TempleTheme.textMuted}
            multiline
            numberOfLines={3}
            maxLength={80}
            textAlignVertical="top"
          />
          <Text style={styles.questionCount}>{question.length} / 80</Text>
        </View>

        {reviews.length > 0 ? (
          <View style={styles.assistCard}>
            <Text style={styles.assistTitle}>問題提醒</Text>
            {reviews.map((review) => (
              <View key={review.issue} style={styles.assistRow}>
                <Text style={styles.assistBullet}>•</Text>
                <Text style={styles.assistText}>
                  {review.issue}：{review.suggestion}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.assistCard}>
          <Text style={styles.assistTitle}>問題潤飾</Text>
          {drafts.map((draft) => (
            <TouchableOpacity key={draft} style={styles.draftChip} onPress={() => setQuestion(draft)}>
              <Text style={styles.draftText}>{draft}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.assistCard}>
          <Text style={styles.assistTitle}>本題推薦神明</Text>
          {recommendations.map((item) => (
            <View key={item.god.id} style={styles.recommendationRow}>
              <View style={styles.recommendationMeta}>
                <Text style={styles.recommendationName}>{item.god.name}</Text>
                <Text style={styles.recommendationReason}>{item.reason}</Text>
              </View>
              {onSwitchGod && selectedGod?.id !== item.god.id ? (
                <TouchableOpacity
                  style={styles.switchBtn}
                  onPress={() => onSwitchGod(item.god.id)}
                >
                  <Text style={styles.switchBtnText}>改請示</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>目前</Text>
                </View>
              )}
            </View>
          ))}
          {selectedGod && alternativeRecommendations.length === 0 ? (
            <Text style={styles.recommendationHint}>你目前選的神明就很適合這題。</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !question.trim() && styles.submitBtnDisabled]}
          onPress={() => question.trim() && onSubmit(question.trim(), category, userName.trim())}
          disabled={!question.trim()}
        >
          <Text style={styles.submitBtnText}>開始求籤</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: TempleSpacing.md },
  title: {
    fontSize: TempleFonts.title,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.xs,
  },
  subtitle: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    textAlign: 'center',
    marginBottom: TempleSpacing.lg,
  },
  forWhomBanner: {
    backgroundColor: TempleTheme.bgCard, borderRadius: 10, borderWidth: 1, borderColor: TempleTheme.gold,
    paddingVertical: 6, paddingHorizontal: 14, alignSelf: 'center', marginBottom: TempleSpacing.sm,
  },
  forWhomText: { color: TempleTheme.textLight, fontSize: TempleFonts.small },
  forWhomName: { color: TempleTheme.textGold, fontWeight: 'bold' },
  scrollArea: { flex: 1 },
  scrollContent: { width: '100%', alignSelf: 'center', paddingBottom: TempleSpacing.lg },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: TempleSpacing.sm,
    paddingBottom: TempleSpacing.lg,
  },
  cardWrapper: { flexGrow: 0, flexShrink: 0, width: '46%' },
  cardWrapperCompact: { width: '100%' },
  godCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 16,
    paddingHorizontal: TempleSpacing.sm,
    paddingTop: TempleSpacing.sm,
    paddingBottom: TempleSpacing.md,
    borderWidth: 1.5,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
    marginBottom: 8,
    minHeight: 24,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeSecondary: {
    backgroundColor: TempleTheme.goldDark,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  godPortrait: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginBottom: TempleSpacing.sm,
    backgroundColor: TempleTheme.bgDark,
  },
  godPortraitImage: { width: '100%', height: '100%' },
  godPortraitOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  godTitle: { fontSize: 10, fontWeight: '700', marginBottom: 4, letterSpacing: 1 },
  godName: {
    fontSize: TempleFonts.body,
    fontWeight: '800',
    color: TempleTheme.goldLight,
    marginBottom: 2,
  },
  godTagline: { fontSize: 11, fontWeight: '600', marginBottom: 6 },
  godPoem: { fontSize: 10, color: TempleTheme.textMuted, marginBottom: TempleSpacing.xs },
  godDesc: { fontSize: 10, color: TempleTheme.textMuted, lineHeight: 16 },
  detailBtn: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: TempleTheme.bgDark + '45',
  },
  detailBtnText: { fontSize: 11, fontWeight: '700' },
  formScroll: { flex: 1 },
  formContainer: { width: '100%', alignSelf: 'center', paddingHorizontal: TempleSpacing.md },
  selectedCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: TempleTheme.goldDark + '35',
    height: 140,
    overflow: 'hidden',
    marginBottom: TempleSpacing.md,
  },
  selectedCardBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  selectedCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  selectedCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: TempleSpacing.md,
  },
  selectedLabel: {
    fontSize: 11,
    color: TempleTheme.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  selectedName: {
    fontSize: 22,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    marginBottom: 2,
  },
  selectedText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    fontWeight: '600',
  },
  formGroup: { marginBottom: TempleSpacing.md },
  label: { fontSize: TempleFonts.small, color: TempleTheme.textMuted, marginBottom: TempleSpacing.xs },
  nameTextInput: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 8,
    padding: TempleSpacing.sm,
    fontSize: TempleFonts.body,
    color: TempleTheme.textLight,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
    marginBottom: TempleSpacing.xs,
  },
  nameButtons: { flexDirection: 'row', gap: TempleSpacing.xs, flexWrap: 'wrap' },
  nameBtn: {
    paddingHorizontal: TempleSpacing.md,
    paddingVertical: TempleSpacing.xs,
    borderRadius: 16,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
  },
  nameBtnActive: { backgroundColor: TempleTheme.goldDark + '30', borderColor: TempleTheme.gold },
  nameBtnText: { color: TempleTheme.textMuted, fontSize: TempleFonts.small },
  nameBtnTextActive: { color: TempleTheme.goldLight },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: TempleSpacing.xs },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
    gap: 4,
  },
  categoryChipActive: { backgroundColor: TempleTheme.goldDark + '30', borderColor: TempleTheme.gold },
  categoryIcon: { fontSize: 14 },
  categoryText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  categoryTextActive: { color: TempleTheme.goldLight, fontWeight: '600' },
  questionInput: {
    minHeight: 96,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: TempleTheme.goldDark + '40',
    paddingHorizontal: TempleSpacing.sm,
    paddingVertical: TempleSpacing.sm,
    fontSize: TempleFonts.body,
    color: TempleTheme.textLight,
    lineHeight: 22,
  },
  questionCount: {
    fontSize: 11,
    color: TempleTheme.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  assistCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '25',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  assistTitle: {
    fontSize: TempleFonts.body,
    color: TempleTheme.goldLight,
    fontWeight: '800',
    marginBottom: 10,
  },
  assistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  assistBullet: {
    color: TempleTheme.gold,
    lineHeight: 20,
  },
  assistText: {
    flex: 1,
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    lineHeight: 20,
  },
  draftChip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '22',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: TempleTheme.bgDark + '45',
    marginBottom: 8,
  },
  draftText: {
    color: TempleTheme.textLight,
    fontSize: TempleFonts.small,
    lineHeight: 20,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '14',
  },
  recommendationMeta: { flex: 1 },
  recommendationName: {
    color: TempleTheme.goldLight,
    fontWeight: '700',
    fontSize: TempleFonts.small,
    marginBottom: 2,
  },
  recommendationReason: {
    color: TempleTheme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  switchBtn: {
    borderRadius: 999,
    backgroundColor: TempleTheme.red,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  switchBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  currentBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: TempleTheme.gold,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  currentBadgeText: {
    color: TempleTheme.goldLight,
    fontSize: 12,
    fontWeight: '700',
  },
  recommendationHint: {
    marginTop: 8,
    color: TempleTheme.textMuted,
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: TempleTheme.red,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: TempleSpacing.md,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: {
    color: '#FFF',
    fontSize: TempleFonts.heading,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

const modalStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TempleSpacing.md,
    paddingVertical: TempleSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '20',
  },
  headerTitle: { fontSize: TempleFonts.heading, fontWeight: '700', color: TempleTheme.goldLight },
  spacer: { width: 60 },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '30',
  },
  closeBtnText: { fontSize: 12, color: TempleTheme.textMuted },
  scrollContent: { paddingHorizontal: TempleSpacing.md, paddingTop: TempleSpacing.md },
  heroWrap: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginBottom: TempleSpacing.md,
  },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroContent: { flex: 1, justifyContent: 'flex-end', padding: TempleSpacing.lg },
  heroTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  heroName: { fontSize: 28, fontWeight: '900', color: TempleTheme.goldLight, marginBottom: 4 },
  heroTagline: { fontSize: 14, fontWeight: '700' },
  section: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 14,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
  },
  sectionTitle: {
    fontSize: TempleFonts.body,
    fontWeight: '800',
    color: TempleTheme.goldLight,
    marginBottom: 10,
  },
  bodyText: { fontSize: TempleFonts.small, color: TempleTheme.textLight, lineHeight: 22 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  muted: { fontSize: 12, color: TempleTheme.textMuted, lineHeight: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: TempleTheme.bgDark + '45',
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  bullet: { fontSize: TempleFonts.small, color: TempleTheme.textLight, lineHeight: 22, marginBottom: 4 },
  selectBtn: {
    marginTop: TempleSpacing.sm,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  selectBtnText: { fontSize: TempleFonts.heading, fontWeight: '800', color: '#FFF', letterSpacing: 2 },
});
