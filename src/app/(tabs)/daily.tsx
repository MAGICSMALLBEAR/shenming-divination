import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';
import { getDailyFortune, type DailyFortune } from '@/services/dailyFortune';
import { getDailyPoem, getWeeklyPoems } from '@/services/dailyPoem';
import { calcBazi, parseBirthYear } from '@/services/bazi';
import { calculateTaiSui, getCurrentYearInfo, type TaiSuiResult } from '@/services/taiSui';
import { getSettings } from '@/services/storage';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { getTodayFullLunarInfo, getCurrentShiChen } from '@/data/lunarFullCalendar';
import { getTodayFestival, getUpcomingFestivals } from '@/data/festivals';
import { getYearFortune, getMonthFortune, type YearFortune } from '@/services/yearFortune';
import type { BaziInfo } from '@/services/bazi';

export default function DailyScreen() {
  const layout = useResponsiveLayout();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [fortune, setFortune] = useState<DailyFortune>(() => getDailyFortune());
  const [bazi, setBazi] = useState<BaziInfo | null>(null);
  const [yearFortune, setYearFortune] = useState<YearFortune | null>(null);
  const [taiSui, setTaiSui] = useState<TaiSuiResult | null>(null);
  const [showShiChen, setShowShiChen] = useState(false);
  const [showYearDetail, setShowYearDetail] = useState(false);
  const [activeMonthTab, setActiveMonthTab] = useState(new Date().getMonth() + 1);
  const [foldedSections, setFoldedSections] = useState<Record<string, boolean>>({
    lunar: false,
    festival: true,
    weekly: false,
    mood: true,
  });
  const [moodEmoji, setMoodEmoji] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [moodSaved, setMoodSaved] = useState(false);

  const todayKey = useMemo(() => `@mood_${new Date().toISOString().slice(0, 10)}`, []);

  useEffect(() => {
    AsyncStorage.getItem(todayKey).then(raw => {
      if (!raw) return;
      const saved = JSON.parse(raw);
      setMoodEmoji(saved.emoji || '');
      setMoodNote(saved.note || '');
      setMoodSaved(true);
    }).catch(() => {});
  }, [todayKey]);

  const handleSaveMood = async () => {
    if (!moodEmoji) return;
    await AsyncStorage.setItem(todayKey, JSON.stringify({ emoji: moodEmoji, note: moodNote, timestamp: Date.now() }));
    setMoodSaved(true);
  };

  const lunarInfo = useMemo(() => getTodayFullLunarInfo(), []);
  const todayFestival = useMemo(() => getTodayFestival(), []);
  const upcomingFestivals = useMemo(() => getUpcomingFestivals(30), []);

  useEffect(() => {
    getSettings().then((settings) => {
      if (!settings?.birthDate) return;
      const year = parseBirthYear(settings.birthDate);
      if (!year) return;
      const baziInfo = calcBazi(year);
      setBazi(baziInfo);
      setFortune(getDailyFortune(baziInfo));
      setYearFortune(getYearFortune(baziInfo));
      const ts = calculateTaiSui(year);
      setTaiSui(ts);
    });
  }, []);

  const todayPoem = useMemo(() => getDailyPoem(), []);
  const weeklyPoems = useMemo(() => getWeeklyPoems(), []);

  const currentShiChen = lunarInfo ? getCurrentShiChen(lunarInfo.shiChen) : null;

  const selectedMonthFortune = useMemo(() => {
    if (!bazi) return null;
    return getMonthFortune(bazi, activeMonthTab);
  }, [bazi, activeMonthTab]);

  const SCORE_STARS = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bgDark} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { maxWidth: layout.contentMaxWidth, paddingHorizontal: layout.gutter },
        ]}
      >
        <Text style={styles.pageTitle}>今日專區</Text>

        <View style={[styles.desktopColumns, layout.isDesktop && styles.desktopColumnsRow]}>
          <View style={[styles.desktopLeftCol, layout.isDesktop && styles.desktopLeftColDesktop]}>

        {/* 今日農民曆 */}
        {lunarInfo && (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setFoldedSections(s => ({ ...s, lunar: !s.lunar }))}
              activeOpacity={0.6}
            >
              <Text style={styles.cardTitle}>📅 今日農民曆</Text>
              <Text style={styles.foldIcon}>{foldedSections.lunar ? '▼' : '▲'}</Text>
            </TouchableOpacity>
            {!foldedSections.lunar && (<>
            <View style={styles.lunarRow}>
              <View style={styles.lunarItem}>
                <Text style={styles.lunarLabel}>農曆</Text>
                <Text style={styles.lunarValue}>{lunarInfo.lunarDate}</Text>
              </View>
              <View style={styles.lunarItem}>
                <Text style={styles.lunarLabel}>干支</Text>
                <Text style={styles.lunarValue}>{lunarInfo.ganZhi}</Text>
              </View>
              <View style={styles.lunarItem}>
                <Text style={styles.lunarLabel}>五行納音</Text>
                <Text style={styles.lunarValue}>{lunarInfo.wuxingNaYin}</Text>
              </View>
              <View style={styles.lunarItem}>
                <Text style={styles.lunarLabel}>沖煞</Text>
                <Text style={[styles.lunarValue, { color: '#e57373' }]}>{lunarInfo.chongSha}</Text>
              </View>
            </View>

            <View style={styles.yiJiRow}>
              <View style={styles.yiBlock}>
                <Text style={styles.yiLabel}>宜</Text>
                <Text style={styles.yiText}>{lunarInfo.yi.join('　')}</Text>
              </View>
              <View style={styles.jiBlock}>
                <Text style={styles.jiLabel}>忌</Text>
                <Text style={styles.jiText}>{lunarInfo.ji.join('　')}</Text>
              </View>
            </View>

            <View style={styles.godsRow}>
              <Text style={styles.godsLabel}>吉神：</Text>
              <Text style={styles.godsText}>{lunarInfo.auspiciousGods.join('　')}</Text>
            </View>
            <View style={styles.godsRow}>
              <Text style={[styles.godsLabel, { color: '#e57373' }]}>凶神：</Text>
              <Text style={[styles.godsText, { color: '#e57373aa' }]}>{lunarInfo.inauspiciousGods.join('　')}</Text>
            </View>

            {/* 當前時辰 */}
            {currentShiChen && (
              <View style={styles.shiChenCurrent}>
                <Text style={styles.shiChenCurrentLabel}>
                  當前時辰：{currentShiChen.name}時（{currentShiChen.timeRange}）
                  {currentShiChen.auspicious ? ' 🟡 吉時' : ' ⚫ 平時'}
                </Text>
                <Text style={styles.shiChenCurrentSub}>
                  宜：{currentShiChen.yi.join('、')}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setShowShiChen(v => !v)}
            >
              <Text style={styles.toggleBtnText}>
                {showShiChen ? '▲ 收起十二時辰' : '▼ 展開十二時辰'}
              </Text>
            </TouchableOpacity>

            {showShiChen && (
              <View style={styles.shiChenGrid}>
                {lunarInfo.shiChen.map(sc => (
                  <View
                    key={sc.name}
                    style={[
                      styles.shiChenCell,
                      sc.auspicious && styles.shiChenCellAuspicious,
                    ]}
                  >
                    <Text style={styles.shiChenName}>{sc.name}時</Text>
                    <Text style={styles.shiChenTime}>{sc.timeRange}</Text>
                    <Text style={styles.shiChenWx}>{sc.wuxing}</Text>
                    <Text style={[styles.shiChenStatus, sc.auspicious && { color: theme.gold }]}>
                      {sc.auspicious ? '吉' : '平'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            </>
          )}
          </View>
        )}

        {/* 犯太歲提醒 */}
        <View style={[styles.card, taiSui && !taiSui.isSafe ? { borderColor: '#e5393560', borderWidth: 1.5 } : {}]}>
          <Text style={styles.cardTitle}>🏮 犯太歲提醒</Text>
          {!taiSui ? (
            <Text style={styles.taiSuiHint}>設定出生年份以查看犯太歲提醒</Text>
          ) : taiSui.isSafe ? (
            <View style={styles.taiSuiSafeRow}>
              <Text style={styles.taiSuiSafeEmoji}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.taiSuiSafeTitle}>今年平安，無犯太歲</Text>
                <Text style={styles.taiSuiSafeSub}>
                  生肖屬{taiSui.birthZodiac}者逢{taiSui.yearZodiac}年，無沖無煞，平安吉祥。
                </Text>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.taiSuiYearTitle}>
                {getCurrentYearInfo().emoji} {getCurrentYearInfo().year}年犯太歲提醒
              </Text>
              <Text style={styles.taiSuiZodiac}>
                本命生肖 {taiSui.birthZodiac} · 值年生肖 {taiSui.yearZodiac}{getCurrentYearInfo().emoji}
              </Text>
              {taiSui.offenses.map((off) => (
                <View
                  key={off.type}
                  style={[styles.offenseRow, { borderLeftColor: severityColor(off.severity) }]}
                >
                  <View style={[styles.offenseBadge, { backgroundColor: severityColor(off.severity) }]}>
                    <Text style={styles.offenseBadgeText}>{off.label}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offenseDesc}>{off.description}</Text>
                    <Text style={styles.offenseAdvice}>💡 {off.advice}</Text>
                  </View>
                </View>
              ))}
              <View style={styles.taiSuiOverall}>
                <Text style={styles.taiSuiOverallTitle}>綜合建議</Text>
                <Text style={styles.taiSuiOverallText}>
                  犯太歲之年宜安奉太歲星君，多行善事積德，保持低調謹慎。可至廟宇點太歲燈，祈求平安順遂。
                </Text>
              </View>
            </>
          )}
        </View>

        {/* 每日禁忌提醒 */}
        {lunarInfo && (
          <View style={[styles.card, { borderColor: '#e5737340' }]}>
            <Text style={styles.cardTitle}>⚠️ 每日宜忌沖煞</Text>
            <View style={styles.tabooRow}>
              <View style={styles.tabooBlockYi}>
                <Text style={styles.tabooBlockLabel}>宜</Text>
                <Text style={styles.tabooBlockText}>{lunarInfo.yi.join('　')}</Text>
              </View>
              <View style={styles.tabooBlockJi}>
                <Text style={[styles.tabooBlockLabel, { color: '#ef5350' }]}>忌</Text>
                <Text style={styles.tabooBlockText}>{lunarInfo.ji.join('　')}</Text>
              </View>
            </View>
            <View style={styles.tabooChongSha}>
              <Text style={styles.tabooChongShaLabel}>🐉 沖煞</Text>
              <Text style={styles.tabooChongShaValue}>{lunarInfo.chongSha}</Text>
            </View>
            <View style={styles.tabooGods}>
              <Text style={styles.tabooGodsYi}>吉神：{lunarInfo.auspiciousGods.join('　')}</Text>
              <Text style={styles.tabooGodsJi}>凶神：{lunarInfo.inauspiciousGods.join('　')}</Text>
            </View>
          </View>
        )}

        {/* 今日節慶 */}
        {todayFestival && (
          <View style={[styles.card, { borderColor: todayFestival.color + '60' }]}>
            <Text style={styles.cardTitle}>🎊 今日節慶：{todayFestival.name}</Text>
            <Text style={styles.festivalDesc}>{todayFestival.description}</Text>
            <Text style={styles.festivalGuide}>🙏 {todayFestival.worshipGuide}</Text>
            <View style={styles.offeringsRow}>
              <Text style={styles.offeringsLabel}>供品：</Text>
              <Text style={styles.offeringsText}>{todayFestival.offerings.slice(0, 5).join('、')}</Text>
            </View>
            <View style={styles.offeringsRow}>
              <Text style={styles.offeringsLabel}>祈求：</Text>
              <Text style={styles.offeringsText}>{todayFestival.prayerFor.join('、')}</Text>
            </View>
          </View>
        )}

        {/* 近期節慶預覽（若今日無特定節慶） */}
        {!todayFestival && upcomingFestivals.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📆 近期節慶</Text>
            {upcomingFestivals.slice(0, 3).map(f => (
              <View key={f.id} style={styles.upcomingFestRow}>
                <View style={[styles.festDot, { backgroundColor: f.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.upcomingFestName}>{f.name}</Text>
                  <Text style={styles.upcomingFestDate}>{f.solarDate}{f.lunarDate ? `（${f.lunarDate}）` : ''}</Text>
                </View>
                <Text style={styles.upcomingFestDays}>
                  {Math.ceil((new Date(f.solarDate).getTime() - new Date().getTime()) / 86400000)} 天後
                </Text>
              </View>
            ))}
          </View>
        )}

          </View>
          <View style={[styles.desktopRightCol, layout.isDesktop && styles.desktopRightColDesktop]}>

        <View style={[styles.heroGrid, layout.isDesktop && styles.heroGridDesktop]}>
          {/* 今日運勢 */}
          <View style={[styles.card, layout.isDesktop && styles.heroCard]}>
            <Text style={styles.cardTitle}>今日運勢</Text>
            <Text style={styles.bigValue}>{SCORE_STARS(fortune.overall)}</Text>
            <Text style={styles.subtitle}>
              幸運色：{fortune.luckyColor.name} · 幸運數：{fortune.luckyNumber}
            </Text>
            <Text style={styles.subtitle}>
              吉位：{fortune.luckyDirection} · 吉時：{fortune.auspiciousHour}
            </Text>
            <Text style={styles.advice}>{fortune.advice}</Text>
          </View>

          {/* 今日籤詩 */}
          <View style={[styles.card, layout.isDesktop && styles.heroCard]}>
            <Text style={styles.cardTitle}>今日籤詩</Text>
            <Text style={styles.poemMeta}>
              {todayPoem.date} · {todayPoem.dayOfWeek}
            </Text>
            <Text style={styles.poemTitle}>
              第 {todayPoem.poem.number} 籤 · {todayPoem.poem.level}
            </Text>
            {todayPoem.poem.content.split('\n').map((line) => (
              <Text key={line} style={styles.poemLine}>
                {line}
              </Text>
            ))}
            <Text style={styles.poemMeaning}>{todayPoem.poem.vernacular}</Text>
          </View>
        </View>

        {/* 流年/流月運勢（需有生辰資料） */}
        {yearFortune ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              🌟 {bazi?.zodiac}年生人 · 2026丙午年運勢
            </Text>
            <View style={styles.yearScoreRow}>
              <Text style={styles.yearScore}>{SCORE_STARS(yearFortune.overallScore)}</Text>
              <Text style={styles.yearOverview}>{yearFortune.overview}</Text>
            </View>

            <TouchableOpacity onPress={() => setShowYearDetail(v => !v)}>
              <Text style={styles.toggleBtnText}>
                {showYearDetail ? '▲ 收起年運詳情' : '▼ 展開年運詳情'}
              </Text>
            </TouchableOpacity>

            {showYearDetail && (
              <>
                <View style={styles.dimensionGrid}>
                  {[
                    { label: '事業', data: yearFortune.career },
                    { label: '財運', data: yearFortune.wealth },
                    { label: '感情', data: yearFortune.love },
                    { label: '健康', data: yearFortune.health },
                    { label: '家庭', data: yearFortune.family },
                  ].map(item => (
                    <View key={item.label} style={styles.dimensionCell}>
                      <Text style={styles.dimLabel}>{item.label}</Text>
                      <Text style={styles.dimScore}>{SCORE_STARS(item.data.score)}</Text>
                      <Text style={styles.dimSummary}>{item.data.summary}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.luckyRow}>
                  <Text style={styles.luckyLabel}>吉月：</Text>
                  <Text style={styles.luckyValue}>{yearFortune.luckyMonths.map(m => `${m}月`).join('　')}</Text>
                </View>
                <View style={styles.luckyRow}>
                  <Text style={styles.luckyLabel}>幸運色：</Text>
                  <Text style={styles.luckyValue}>{yearFortune.luckyColors.join('　')}</Text>
                </View>
                <Text style={styles.yearAdvice}>{yearFortune.advice}</Text>
                <Text style={styles.yearBlessing}>{yearFortune.blessing}</Text>
              </>
            )}

            {/* 流月選擇器 */}
            <Text style={[styles.cardTitle, { marginTop: 16, marginBottom: 8 }]}>流月運勢</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.monthTabRow}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.monthTab, activeMonthTab === m && styles.monthTabActive]}
                  onPress={() => setActiveMonthTab(m)}
                >
                  <Text style={[styles.monthTabText, activeMonthTab === m && styles.monthTabTextActive]}>
                    {m}月
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedMonthFortune && (
              <View style={styles.monthDetail}>
                <View style={styles.monthScoreRow}>
                  <Text style={styles.monthGanZhi}>{selectedMonthFortune.monthGanZhi}</Text>
                  <Text style={styles.monthScore}>{SCORE_STARS(selectedMonthFortune.overallScore)}</Text>
                </View>
                <Text style={styles.monthOverview}>{selectedMonthFortune.overview}</Text>
                <View style={styles.monthDimRow}>
                  {[
                    { label: '事業', data: selectedMonthFortune.career },
                    { label: '財運', data: selectedMonthFortune.wealth },
                    { label: '感情', data: selectedMonthFortune.love },
                    { label: '健康', data: selectedMonthFortune.health },
                  ].map(item => (
                    <View key={item.label} style={styles.monthDimCell}>
                      <Text style={styles.monthDimLabel}>{item.label}</Text>
                      <Text style={styles.monthDimStars}>{SCORE_STARS(item.data.score)}</Text>
                      <Text style={styles.monthDimTip}>{item.data.tip}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.monthAdvice}>{selectedMonthFortune.advice}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.card, styles.noBaziCard]}>
            <Text style={styles.noBaziText}>
              💡 前往「設定」填入生辰年份，即可查看個人流年/流月運勢！
            </Text>
          </View>
        )}

        {/* 本週籤詩節奏 */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setFoldedSections(s => ({ ...s, weekly: !s.weekly }))}
            activeOpacity={0.6}
          >
            <Text style={styles.cardTitle}>本週籤詩節奏</Text>
            <Text style={styles.foldIcon}>{foldedSections.weekly ? '▼' : '▲'}</Text>
          </TouchableOpacity>
          {!foldedSections.weekly && (<>
          {weeklyPoems.map((item) => (
            <View key={item.date} style={styles.weekRow}>
              <View style={styles.weekMeta}>
                <Text style={styles.weekDate}>{item.date}</Text>
                <Text style={styles.weekDay}>{item.dayOfWeek}</Text>
              </View>
              <View style={styles.weekContent}>
                <Text style={styles.weekPoemTitle}>第 {item.poem.number} 籤 · {item.poem.level}</Text>
                <Text style={styles.weekPoemText} numberOfLines={1}>
                  {item.poem.content.split('\n')[0]}
                </Text>
              </View>
            </View>
          ))}
          </>
          )}
        </View>

          </View>
        </View>

        {/* 今日心情日記 */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setFoldedSections(s => ({ ...s, mood: !s.mood }))}
            activeOpacity={0.6}
          >
            <Text style={styles.sectionTitle}>今日心情日記</Text>
            <Text style={styles.foldIcon}>{foldedSections.mood ? '▼' : '▲'}</Text>
          </TouchableOpacity>
          {!foldedSections.mood && (<>
          <Text style={styles.sectionSubtitle}>記錄今天的感受，與天地神明共振。</Text>
          <View style={styles.moodRow}>
            {['😊', '😌', '😐', '😟', '😩'].map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={[styles.moodBtn, moodEmoji === emoji && styles.moodBtnActive]}
                onPress={() => { setMoodEmoji(emoji); setMoodSaved(false); }}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {moodEmoji ? (
            <>
              <TextInput
                style={styles.moodInput}
                value={moodNote}
                onChangeText={t => { setMoodNote(t); setMoodSaved(false); }}
                placeholder="今天有什麼想說的…（可選）"
                placeholderTextColor={theme.textMuted}
                multiline
                maxLength={120}
              />
              <TouchableOpacity
                style={[styles.moodSaveBtn, moodSaved && styles.moodSaveBtnDone]}
                onPress={handleSaveMood}
                disabled={moodSaved}
              >
                <Text style={styles.moodSaveBtnText}>{moodSaved ? '✓ 已記錄' : '記錄心情'}</Text>
              </TouchableOpacity>
            </>
          ) : null}
          </>
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function severityColor(severity: number): string {
  if (severity >= 5) return '#d32f2f';
  if (severity >= 4) return '#e53935';
  if (severity >= 3) return '#fb8c00';
  return '#fbc02d';
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bgDark },
  container: { flex: 1 },
  content: { width: '100%', alignSelf: 'center', paddingVertical: TempleSpacing.md },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: theme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.lg,
  },
  card: {
    backgroundColor: theme.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.goldDark + '24',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  heroGrid: {},
  heroGridDesktop: { flexDirection: 'row', gap: TempleSpacing.md },
  heroCard: { flex: 1 },
  desktopColumns: {},
  desktopColumnsRow: { flexDirection: 'row', gap: TempleSpacing.md, alignItems: 'flex-start' },
  desktopLeftCol: {},
  desktopLeftColDesktop: { flex: 1, minWidth: 320 },
  desktopRightCol: {},
  desktopRightColDesktop: { flex: 1, minWidth: 320 },
  cardTitle: {
    color: theme.goldLight,
    fontWeight: '800',
    fontSize: TempleFonts.body,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  foldIcon: {
    color: theme.textMuted,
    fontSize: TempleFonts.small,
  },
  bigValue: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.gold,
    marginBottom: 8,
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: TempleFonts.small,
    marginBottom: 4,
  },
  advice: {
    marginTop: 10,
    color: theme.textLight,
    lineHeight: 22,
  },
  poemMeta: { color: theme.textMuted, fontSize: TempleFonts.small, marginBottom: 6 },
  poemTitle: { color: theme.goldLight, fontWeight: '700', marginBottom: 10 },
  poemLine: { color: theme.textLight, lineHeight: 24, fontSize: TempleFonts.body },
  poemMeaning: { marginTop: 12, color: theme.textMuted, lineHeight: 22, fontSize: TempleFonts.small },

  // 農民曆
  lunarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  lunarItem: {
    minWidth: 80,
    backgroundColor: theme.goldDark + '18',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    flex: 1,
  },
  lunarLabel: { color: theme.textMuted, fontSize: 11, marginBottom: 4 },
  lunarValue: { color: theme.goldLight, fontWeight: '700', fontSize: 13 },
  yiJiRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  yiBlock: {
    flex: 1,
    backgroundColor: '#2d5a2d33',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#4caf5044',
  },
  jiBlock: {
    flex: 1,
    backgroundColor: '#5a2d2d33',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5737344',
  },
  yiLabel: { color: '#81c784', fontWeight: '800', marginBottom: 4, fontSize: 12 },
  jiLabel: { color: '#e57373', fontWeight: '800', marginBottom: 4, fontSize: 12 },
  yiText: { color: '#a5d6a7', fontSize: 12, lineHeight: 18 },
  jiText: { color: '#ef9a9a', fontSize: 12, lineHeight: 18 },
  godsRow: { flexDirection: 'row', marginBottom: 4 },
  godsLabel: { color: theme.gold, fontSize: 12, fontWeight: '700', width: 44 },
  godsText: { color: theme.textMuted, fontSize: 12, flex: 1 },
  shiChenCurrent: {
    backgroundColor: theme.goldDark + '22',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.goldDark + '44',
  },
  shiChenCurrentLabel: { color: theme.gold, fontWeight: '700', fontSize: 13 },
  shiChenCurrentSub: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  toggleBtn: { marginTop: 8 },
  toggleBtnText: { color: theme.gold, fontSize: 13, fontWeight: '600' },
  shiChenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  shiChenCell: {
    width: '23%',
    backgroundColor: theme.bgDark + 'aa',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.goldDark + '22',
  },
  shiChenCellAuspicious: {
    borderColor: theme.gold + '60',
    backgroundColor: theme.goldDark + '18',
  },
  shiChenName: { color: theme.textLight, fontWeight: '700', fontSize: 12 },
  shiChenTime: { color: theme.textMuted, fontSize: 10, marginTop: 2 },
  shiChenWx: { color: theme.textMuted, fontSize: 10 },
  shiChenStatus: { fontSize: 11, fontWeight: '700', marginTop: 2, color: theme.textMuted },

  // 節慶
  festivalDesc: { color: theme.textLight, fontSize: TempleFonts.small, lineHeight: 20, marginBottom: 8 },
  festivalGuide: { color: theme.gold, fontSize: TempleFonts.small, marginBottom: 8, fontWeight: '600' },
  offeringsRow: { flexDirection: 'row', marginBottom: 4 },
  offeringsLabel: { color: theme.textMuted, fontSize: 12, width: 40 },
  offeringsText: { color: theme.textLight, fontSize: 12, flex: 1 },
  upcomingFestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.goldDark + '14',
    gap: 10,
  },
  festDot: { width: 10, height: 10, borderRadius: 5 },
  upcomingFestName: { color: theme.goldLight, fontWeight: '700', fontSize: 13 },
  upcomingFestDate: { color: theme.textMuted, fontSize: 11, marginTop: 2 },
  upcomingFestDays: { color: theme.gold, fontWeight: '700', fontSize: 12 },

  // 流年
  yearScoreRow: { marginBottom: 10 },
  yearScore: { color: theme.gold, fontSize: 20, fontWeight: '900', marginBottom: 6 },
  yearOverview: { color: theme.textLight, fontSize: TempleFonts.small, lineHeight: 20 },
  dimensionGrid: { gap: 10, marginTop: 12 },
  dimensionCell: {
    backgroundColor: theme.bgDark + 'aa',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.goldDark + '22',
  },
  dimLabel: { color: theme.gold, fontWeight: '800', fontSize: 13, marginBottom: 4 },
  dimScore: { color: theme.goldLight, fontSize: 16, marginBottom: 6 },
  dimSummary: { color: theme.textMuted, fontSize: 12, lineHeight: 18 },
  luckyRow: { flexDirection: 'row', marginTop: 10 },
  luckyLabel: { color: theme.textMuted, fontSize: 12, width: 56 },
  luckyValue: { color: theme.goldLight, fontSize: 12, flex: 1 },
  yearAdvice: {
    marginTop: 12,
    color: theme.textLight,
    fontSize: TempleFonts.small,
    lineHeight: 20,
    padding: 10,
    backgroundColor: theme.goldDark + '18',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.gold,
  },
  yearBlessing: {
    marginTop: 8,
    color: theme.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // 流月
  monthTabRow: { gap: 6, paddingBottom: 4 },
  monthTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.goldDark + '40',
  },
  monthTabActive: {
    backgroundColor: theme.goldDark + '55',
    borderColor: theme.gold,
  },
  monthTabText: { color: theme.textMuted, fontSize: 13 },
  monthTabTextActive: { color: theme.gold, fontWeight: '700' },
  monthDetail: {
    marginTop: 12,
    backgroundColor: theme.bgDark + 'aa',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.goldDark + '22',
  },
  monthScoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  monthGanZhi: { color: theme.gold, fontWeight: '800', fontSize: 14 },
  monthScore: { color: theme.goldLight, fontSize: 14 },
  monthOverview: { color: theme.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 10 },
  monthDimRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  monthDimCell: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.goldDark + '18',
    borderRadius: 6,
    padding: 6,
  },
  monthDimLabel: { color: theme.gold, fontWeight: '700', fontSize: 11, marginBottom: 2 },
  monthDimStars: { color: theme.goldLight, fontSize: 12, marginBottom: 2 },
  monthDimTip: { color: theme.textMuted, fontSize: 10, lineHeight: 14 },
  monthAdvice: {
    color: theme.textLight,
    fontSize: 12,
    lineHeight: 18,
    padding: 8,
    backgroundColor: theme.goldDark + '14',
    borderRadius: 6,
  },

  noBaziCard: { alignItems: 'center' },
  noBaziText: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 22, textAlign: 'center' },

  // 週詩
  weekRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.goldDark + '14',
  },
  weekMeta: { width: 72 },
  weekDate: { color: theme.goldLight, fontWeight: '700', fontSize: 12 },
  weekDay: { color: theme.textMuted, fontSize: 11, marginTop: 2 },
  weekContent: { flex: 1 },
  weekPoemTitle: { color: theme.textLight, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  weekPoemText: { color: theme.textMuted, fontSize: 12 },
  // 心情日記
  sectionTitle: { color: theme.textGold, fontWeight: 'bold', fontSize: TempleFonts.body, marginBottom: 4 },
  sectionSubtitle: { color: theme.textMuted, fontSize: TempleFonts.small, marginBottom: 10 },
  moodRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 12 },
  moodBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent', backgroundColor: theme.bgMedium },
  moodBtnActive: { borderColor: theme.goldLight, backgroundColor: theme.bgCard },
  moodEmoji: { fontSize: 26 },
  moodInput: {
    backgroundColor: theme.bgMedium, borderRadius: 10, borderWidth: 1,
    borderColor: theme.gold + '50', padding: 10, color: theme.textLight,
    fontSize: TempleFonts.small, minHeight: 48, marginBottom: 10,
  } as any,
  moodSaveBtn: { backgroundColor: theme.bgMedium, borderRadius: 8, borderWidth: 1, borderColor: theme.gold, paddingVertical: 8, alignItems: 'center' },
  moodSaveBtnDone: { borderColor: theme.success, backgroundColor: theme.success + '22' },
  moodSaveBtnText: { color: theme.textGold, fontSize: TempleFonts.small, fontWeight: 'bold' },

  // 犯太歲
  taiSuiHint: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 22, textAlign: 'center' as any, paddingVertical: 6 },
  taiSuiSafeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taiSuiSafeEmoji: { fontSize: 36 },
  taiSuiSafeTitle: { color: '#81c784', fontWeight: '800', fontSize: TempleFonts.body, marginBottom: 4 },
  taiSuiSafeSub: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 20 },
  taiSuiYearTitle: { color: '#ef5350', fontWeight: '900', fontSize: TempleFonts.heading, marginBottom: 6 },
  taiSuiZodiac: { color: theme.textMuted, fontSize: TempleFonts.small, marginBottom: 12 },
  offenseRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    backgroundColor: theme.bgDark + '88',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 4,
  },
  offenseBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  offenseBadgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  offenseDesc: { color: theme.textLight, fontSize: 12, lineHeight: 18, marginBottom: 4 },
  offenseAdvice: { color: theme.gold, fontSize: 11, lineHeight: 16 },
  taiSuiOverall: {
    marginTop: 10,
    backgroundColor: theme.goldDark + '22',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.goldDark + '44',
  },
  taiSuiOverallTitle: { color: theme.gold, fontWeight: '800', fontSize: 13, marginBottom: 6 },
  taiSuiOverallText: { color: theme.textMuted, fontSize: 12, lineHeight: 18 },

  // 每日禁忌
  tabooRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  tabooBlockYi: {
    flex: 1,
    backgroundColor: '#2d5a2d44',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#4caf5060',
  },
  tabooBlockJi: {
    flex: 1,
    backgroundColor: '#5a2d2d44',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5737360',
  },
  tabooBlockLabel: { color: '#81c784', fontWeight: '900', fontSize: 14, marginBottom: 6 },
  tabooBlockText: { color: '#c8e6c9', fontSize: 12, lineHeight: 20 },
  tabooChongSha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#e5737318',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5737340',
  },
  tabooChongShaLabel: { color: '#ef5350', fontWeight: '800', fontSize: 13, marginRight: 8 },
  tabooChongShaValue: { color: '#ef9a9a', fontSize: 13, fontWeight: '700', flex: 1 },
  tabooGods: { flexDirection: 'row', gap: 12 },
  tabooGodsYi: { color: theme.gold, fontSize: 11, fontWeight: '600', flex: 1 },
  tabooGodsJi: { color: '#e57373aa', fontSize: 11, fontWeight: '600', flex: 1 },
  });
}
