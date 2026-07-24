// 合婚 / 擇日 頁面 — AI 命理分析
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TempleSpacing } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import { useFadeIn } from '@/hooks/useEntranceAnimation';
import type { ThemeColors } from '@/constants/themes';

const API_BASE = 'http://localhost:3001';

type Tab = 'match' | 'date';

const EVENT_TYPES = ['結婚', '開業', '搬家', '動土', '簽約', '出行', '求職', '手術'];
const ZODIAC_LIST = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
const WUXING_LIST = ['木', '火', '土', '金', '水'];

function TabContent({ children }: { children: React.ReactNode }) {
  const fade = useFadeIn({ delay: 0 });
  return (
    <Animated.View style={{ opacity: fade.opacity, transform: [{ translateY: fade.translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function FateScreen() {
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const s = useMemo(() => createStyles(theme), [theme]);
  const [tab, setTab] = useState<Tab>('match');

  // 合婚
  const [p1Year, setP1Year] = useState('');
  const [p1Zodiac, setP1Zodiac] = useState('');
  const [p1Wuxing, setP1Wuxing] = useState('');
  const [p2Year, setP2Year] = useState('');
  const [p2Zodiac, setP2Zodiac] = useState('');
  const [p2Wuxing, setP2Wuxing] = useState('');
  const [matchResult, setMatchResult] = useState('');
  const [matchLoading, setMatchLoading] = useState(false);

  // 擇日
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [preferMonth, setPreferMonth] = useState('');
  const [zodiac1, setZodiac1] = useState('');
  const [zodiac2, setZodiac2] = useState('');
  const [notes, setNotes] = useState('');
  const [dateResult, setDateResult] = useState('');
  const [dateLoading, setDateLoading] = useState(false);

  const zodiacFromYear = (y: string): string => {
    const n = parseInt(y);
    if (!n) return '';
    return ZODIAC_LIST[(n - 4) % 12];
  };

  const handleMatch = async () => {
    const y1 = parseInt(p1Year), y2 = parseInt(p2Year);
    if (!y1 || !y2) return;
    setMatchLoading(true);
    setMatchResult('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const res = await fetch(`${API_BASE}/api/bazi/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1: { birthYear: y1, zodiac: p1Zodiac || zodiacFromYear(p1Year), wuxing: p1Wuxing || '未知' },
          person2: { birthYear: y2, zodiac: p2Zodiac || zodiacFromYear(p2Year), wuxing: p2Wuxing || '未知' },
        }),
      });
      const data = await res.json();
      setMatchResult(data.analysis || data.compatibility || t('fateResultMatch'));
    } catch {
      setMatchResult(t('fateErrorConnect'));
    }
    setMatchLoading(false);
  };

  const handleDateSelect = async () => {
    setDateLoading(true);
    setDateResult('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const res = await fetch(`${API_BASE}/api/择日`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType, preferMonth: preferMonth || '不限',
          year: new Date().getFullYear(),
          zodiac1: zodiac1 || '不限', zodiac2: zodiac2 || '不限',
          notes: notes || '',
        }),
      });
      const data = await res.json();
      setDateResult(data.recommendation || t('fateResultDate'));
    } catch {
      setDateResult(t('fateErrorConnect'));
    }
    setDateLoading(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          <Text style={s.title}>{t('fatePageTitle')}</Text>
          <Text style={s.sub}>{t('fateSubtitle')}</Text>
        </View>

        {/* Tab 切換 */}
        <View style={s.tabs}>
          {(['match', 'date'] as Tab[]).map(tabKey => (
            <TouchableOpacity key={tabKey} style={[s.tab, tab === tabKey && s.tabActive]} onPress={() => setTab(tabKey)}>
              <Text style={[s.tabText, tab === tabKey && s.tabTextActive]}>
                {tabKey === 'match' ? t('fateTabMatch') : t('fateTabDate')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          {tab === 'match' ? (
            <TabContent key="match">
              <View>
              <Text style={s.sectionTitle}>{t('fateMatchTitle')}</Text>
              <Text style={s.desc}>{t('fateMatchDesc')}</Text>

              {/* 甲方 */}
              <View style={s.card}>
                <Text style={s.cardTitle}>{t('fateLabelPartyA')}</Text>
                <View style={s.row}>
                  <View style={s.field}>
                    <Text style={s.label}>{t('fateLabelBirthYear')}</Text>
                    <TextInput style={s.input} placeholder="1990" placeholderTextColor={theme.textMuted}
                      value={p1Year} onChangeText={v => { setP1Year(v); setP1Zodiac(zodiacFromYear(v)); }}
                      keyboardType="number-pad" maxLength={4} />
                  </View>
                  <View style={s.field}>
                    <Text style={s.label}>{t('fateLabelZodiacAuto')}</Text>
                    <View style={s.readOnly}><Text style={s.readOnlyText}>{p1Zodiac || '—'}</Text></View>
                  </View>
                </View>
                <Text style={s.label}>{t('fateLabelDayWuxing')}</Text>
                <View style={s.chipRow}>
                  {WUXING_LIST.map(w => (
                    <TouchableOpacity key={w} style={[s.chip, p1Wuxing === w && s.chipActive]} onPress={() => setP1Wuxing(w)}>
                      <Text style={[s.chipText, p1Wuxing === w && s.chipTextActive]}>{w}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 乙方 */}
              <View style={s.card}>
                <Text style={s.cardTitle}>{t('fateLabelPartyB')}</Text>
                <View style={s.row}>
                  <View style={s.field}>
                    <Text style={s.label}>{t('fateLabelBirthYear')}</Text>
                    <TextInput style={s.input} placeholder="1992" placeholderTextColor={theme.textMuted}
                      value={p2Year} onChangeText={v => { setP2Year(v); setP2Zodiac(zodiacFromYear(v)); }}
                      keyboardType="number-pad" maxLength={4} />
                  </View>
                  <View style={s.field}>
                    <Text style={s.label}>{t('fateLabelZodiacAuto')}</Text>
                    <View style={s.readOnly}><Text style={s.readOnlyText}>{p2Zodiac || '—'}</Text></View>
                  </View>
                </View>
                <Text style={s.label}>{t('fateLabelDayWuxing')}</Text>
                <View style={s.chipRow}>
                  {WUXING_LIST.map(w => (
                    <TouchableOpacity key={w} style={[s.chip, p2Wuxing === w && s.chipActive]} onPress={() => setP2Wuxing(w)}>
                      <Text style={[s.chipText, p2Wuxing === w && s.chipTextActive]}>{w}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[s.btn, (!p1Year || !p2Year) && s.btnDisabled]}
                onPress={handleMatch}
                disabled={matchLoading || !p1Year || !p2Year}
              >
                {matchLoading
                  ? <ActivityIndicator color={theme.bgDark} />
                  : <Text style={s.btnText}>{t('fateButtonMatch')}</Text>}
              </TouchableOpacity>

              {matchResult !== '' && (
                <View style={s.result}>
                  <Text style={s.resultTitle}>{t('fateResultMatch')}</Text>
                  <Text style={s.resultText}>{matchResult}</Text>
                </View>
              )}
            </View>
            </TabContent>
          ) : (
            <TabContent key="date">
              <View>
              <Text style={s.sectionTitle}>{t('fateDateTitle')}</Text>
              <Text style={s.desc}>{t('fateDateDesc')}</Text>

              <View style={s.card}>
                <Text style={s.label}>{t('fateLabelEventType')}</Text>
                <View style={s.chipRow}>
                  {EVENT_TYPES.map(e => (
                    <TouchableOpacity key={e} style={[s.chip, eventType === e && s.chipActive]} onPress={() => setEventType(e)}>
                      <Text style={[s.chipText, eventType === e && s.chipTextActive]}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={s.row}>
                  <View style={s.field}>
                    <Text style={s.label}>{t('fateLabelPreferMonth')}</Text>
                    <TextInput style={s.input} placeholder="如：3（三月）" placeholderTextColor={theme.textMuted}
                      value={preferMonth} onChangeText={setPreferMonth} keyboardType="number-pad" maxLength={2} />
                  </View>
                </View>

                <Text style={s.label}>{t('fateLabelZodiac1')}</Text>
                <View style={s.chipRow}>
                  {ZODIAC_LIST.map(z => (
                    <TouchableOpacity key={z} style={[s.chip, zodiac1 === z && s.chipActive]} onPress={() => setZodiac1(zodiac1 === z ? '' : z)}>
                      <Text style={[s.chipText, zodiac1 === z && s.chipTextActive]}>{z}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={s.label}>{t('fateLabelZodiac2')}</Text>
                <View style={s.chipRow}>
                  {ZODIAC_LIST.map(z => (
                    <TouchableOpacity key={z} style={[s.chip, zodiac2 === z && s.chipActive]} onPress={() => setZodiac2(zodiac2 === z ? '' : z)}>
                      <Text style={[s.chipText, zodiac2 === z && s.chipTextActive]}>{z}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={s.label}>{t('fateLabelNotes')}</Text>
                <TextInput style={[s.input, { height: 64, textAlignVertical: 'top' }]}
                  placeholder={t('fatePlaceholderNotes')} placeholderTextColor={theme.textMuted}
                  value={notes} onChangeText={setNotes} multiline maxLength={100} />
              </View>

              <TouchableOpacity style={s.btn} onPress={handleDateSelect} disabled={dateLoading}>
                {dateLoading
                  ? <ActivityIndicator color={theme.bgDark} />
                  : <Text style={s.btnText}>{t('fateButtonDateSelect')}</Text>}
              </TouchableOpacity>

              {dateResult !== '' && (
                <View style={s.result}>
                  <Text style={s.resultTitle}>{t('fateResultDate')}</Text>
                  <Text style={s.resultText}>{dateResult}</Text>
                </View>
              )}
            </View>
            </TabContent>
          )}

          <View style={s.disclaimer}>
            <Text style={s.disclaimerText}>{t('fateDisclaimer')}</Text>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgDark },
  header: { paddingHorizontal: TempleSpacing.lg, paddingTop: TempleSpacing.md, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#2A2020' },
  title: { color: theme.gold, fontSize: 20, fontWeight: '900' },
  sub: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
  tabs: { flexDirection: 'row', paddingHorizontal: TempleSpacing.md, paddingTop: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#2A2020', alignItems: 'center', backgroundColor: theme.bgCard },
  tabActive: { backgroundColor: theme.gold, borderColor: theme.gold },
  tabText: { color: theme.textMuted, fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: theme.bgDark },
  scroll: { flex: 1 },
  scrollContent: { padding: TempleSpacing.md },
  sectionTitle: { color: theme.gold, fontSize: 16, fontWeight: '900', marginBottom: 4 },
  desc: { color: theme.textMuted, fontSize: 12, marginBottom: 14 },
  card: { backgroundColor: theme.bgCard, borderRadius: 12, borderWidth: 1, borderColor: '#2A2020', padding: TempleSpacing.md, marginBottom: 12 },
  cardTitle: { color: theme.goldLight, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  field: { flex: 1 },
  label: { color: theme.textMuted, fontSize: 12, marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: theme.bgDark, borderWidth: 1, borderColor: '#3A2A20', borderRadius: 8, color: theme.textLight, fontSize: 14, paddingHorizontal: 10, paddingVertical: 8 },
  readOnly: { backgroundColor: '#1E1408', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#2A2010' },
  readOnlyText: { color: theme.gold, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4, marginBottom: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: '#3A2A20', backgroundColor: theme.bgDark },
  chipActive: { backgroundColor: theme.gold, borderColor: theme.gold },
  chipText: { color: theme.textMuted, fontSize: 13 },
  chipTextActive: { color: theme.bgDark, fontWeight: '700' },
  btn: { backgroundColor: theme.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: theme.bgDark, fontSize: 16, fontWeight: '900' },
  result: { backgroundColor: '#1E1A08', borderRadius: 12, borderWidth: 1, borderColor: '#3A2A10', padding: TempleSpacing.md, marginTop: 14 },
  resultTitle: { color: theme.gold, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  resultText: { color: theme.textLight, fontSize: 14, lineHeight: 24 },
  disclaimer: { marginTop: 20, alignItems: 'center' },
  disclaimerText: { color: theme.textMuted, fontSize: 11 },
  });
}
