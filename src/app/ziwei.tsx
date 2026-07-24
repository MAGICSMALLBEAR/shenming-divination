// 紫微斗數基礎 — 依生年推算命宮、財帛宮、夫妻宮
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DecorativeBg } from '@/components/DecorativeBg';
import { TempleSpacing, TempleFonts } from '@/constants/temple-theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useI18n } from '@/hooks/useI18n';
import type { ThemeColors } from '@/constants/themes';

// ─── 紫微斗數命宮計算 ─────────────────────────────────────────
// 簡化版：依生年天干地支定命宮，提供三宮基礎解析

const HEAVENLY_STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const EARTHLY_BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// 主星 — 依生年地支（農曆）分配紫微至何宮
const ZIWEI_STAR_BY_BRANCH: Record<string, string> = {
  子: '命宮', 丑: '父母宮', 寅: '福德宮', 卯: '田宅宮',
  辰: '官祿宮', 巳: '交友宮', 午: '遷移宮', 未: '疾厄宮',
  申: '財帛宮', 酉: '子女宮', 戌: '夫妻宮', 亥: '兄弟宮',
};

// 天干 → 命宮主星描述
const MING_BY_STEM: Record<string, { star: string; trait: string; talent: string }> = {
  甲: { star: '廉貞', trait: '剛毅果斷，具有領導才能，但易固執。', talent: '管理與組織能力出眾。' },
  乙: { star: '天機', trait: '思維敏捷，機智過人，善於謀略。', talent: '分析推理與創意規劃。' },
  丙: { star: '太陽', trait: '開朗熱情，慷慨大方，富有正義感。', talent: '人際溝通與公關能力。' },
  丁: { star: '武曲', trait: '重義氣，意志堅強，財運較佳。', talent: '財務管理與執行力。' },
  戊: { star: '天同', trait: '樂觀隨和，享受生活，福氣較厚。', talent: '協調與創意藝術天賦。' },
  己: { star: '文曲', trait: '才華橫溢，多才多藝，感情豐富。', talent: '文藝創作與語言表達。' },
  庚: { star: '天府', trait: '穩重端莊，財富累積力強，注重物質。', talent: '理財投資與商業頭腦。' },
  辛: { star: '太陰', trait: '細膩溫柔，直覺敏銳，感情豐富。', talent: '藝術審美與情感感知。' },
  壬: { star: '貪狼', trait: '多才多藝，欲望旺盛，善於社交。', talent: '多元技能與社交能力。' },
  癸: { star: '巨門', trait: '口才出眾，善於言辭，但口舌是非較多。', talent: '辯論表達與說服力。' },
};

// 財帛宮吉凶 — 依地支
const CAIBO_BY_BRANCH: Record<string, { summary: string; advice: string }> = {
  子: { summary: '財源穩定，適合從事固定薪資或穩健投資。', advice: '宜保守理財，切忌衝動投機。' },
  丑: { summary: '土地財，不動產緣分佳，積累財富較慢但紮實。', advice: '可投資土地、房產，長線操作。' },
  寅: { summary: '財來財去，需防衝動消費，有偏財機緣。', advice: '培養儲蓄習慣，防止財富外流。' },
  卯: { summary: '財運靠人際，協作創業或人脈帶來財富。', advice: '廣結善緣，合作機會多留意。' },
  辰: { summary: '財富豐厚，有積蓄之象，但要防止破財之年。', advice: '做好理財規劃，預留應急準備金。' },
  巳: { summary: '財帛宮有火，偏財運旺，但容易大起大落。', advice: '謹慎對待投機，留守基本盤。' },
  午: { summary: '財運旺但易散，賺錢能力強，花費也大。', advice: '設定預算，控制非必要支出。' },
  未: { summary: '財帛有庫，守財能力佳，適合長期儲蓄。', advice: '定期投資，複利增值是最佳策略。' },
  申: { summary: '財運活躍，適合商業貿易，但錢財易在外流動。', advice: '把握流動資金，適時收割獲利。' },
  酉: { summary: '財源多元，有偏財緣，但需防受騙損財。', advice: '交友謹慎，避免輕信他人投資建議。' },
  戌: { summary: '財帛有磁吸力，晚年財富累積更佳。', advice: '年輕時多儲蓄，老後享受豐收。' },
  亥: { summary: '財運多變，水星財，流動性強但難以留存。', advice: '建立固定投資計畫，避免財富流失。' },
};

// 夫妻宮吉凶 — 依天干
const FUQI_BY_STEM: Record<string, { summary: string; advice: string }> = {
  甲: { summary: '夫妻緣份較強，感情穩定，但易有主導欲。', advice: '學會尊重對方意見，避免控制。' },
  乙: { summary: '感情細膩，浪漫，但容易多愁善感。', advice: '保持溝通，把感情說出口。' },
  丙: { summary: '感情熱烈，緣份來得快，但也需要穩定。', advice: '給感情時間發展，不要過於急躁。' },
  丁: { summary: '感情深厚專一，重視承諾，但有時過於固執。', advice: '保持彈性，允許感情自然成長。' },
  戊: { summary: '夫妻感情和諧，福氣雙全，晚婚更佳。', advice: '不急於一時，緣份自然會來。' },
  己: { summary: '感情豐富多彩，但感情生活較波折。', advice: '理性面對感情，不要過度依賴。' },
  庚: { summary: '感情穩定務實，重視物質基礎。', advice: '在物質之外，也要培養精神交流。' },
  辛: { summary: '感情敏感細膩，對伴侶要求較高。', advice: '學會接受伴侶的不完美。' },
  壬: { summary: '感情多元，易有多段緣分，結婚較晚。', advice: '認清自己真正想要的感情型態。' },
  癸: { summary: '感情有口舌是非，需要多溝通。', advice: '說清楚而非暗示，避免誤解積累。' },
};

interface ZiweiResult {
  year: number;
  stem: string;
  branch: string;
  ganZhi: string;
  mingGong: { star: string; trait: string; talent: string };
  caibo: { summary: string; advice: string };
  fuqi: { summary: string; advice: string };
  ziweiPalace: string;
}

function calcZiwei(year: number): ZiweiResult | null {
  if (year < 1900 || year > 2100) return null;
  const stemIdx = (year - 4) % 10;
  const branchIdx = (year - 4) % 12;
  const stem = HEAVENLY_STEMS[stemIdx < 0 ? stemIdx + 10 : stemIdx];
  const branch = EARTHLY_BRANCHES[branchIdx < 0 ? branchIdx + 12 : branchIdx];
  return {
    year,
    stem,
    branch,
    ganZhi: `${stem}${branch}`,
    mingGong: MING_BY_STEM[stem]!,
    caibo: CAIBO_BY_BRANCH[branch]!,
    fuqi: FUQI_BY_STEM[stem]!,
    ziweiPalace: ZIWEI_STAR_BY_BRANCH[branch]!,
  };
}

function getPalaceColors(theme: ThemeColors): Record<string, string> {
  return {
    '命宮': theme.goldLight,
    '夫妻宮': '#E879A0',
    '財帛宮': theme.success,
  };
}

function PalaceCard({ title, star, summary, advice, color }: {
  title: string; star?: string; summary: string; advice: string; color: string;
}) {
  const { theme } = useAppTheme();
  const pc = useMemo(() => createPcStyles(theme), [theme]);
  return (
    <View style={[pc.card, { borderColor: color + '80' }]}>
      <View style={[pc.titleRow, { backgroundColor: color + '20' }]}>
        <Text style={[pc.title, { color }]}>{title}</Text>
        {star ? <Text style={[pc.star, { color }]}>{star}</Text> : null}
      </View>
      <Text style={pc.summary}>{summary}</Text>
      <View style={pc.adviceRow}>
        <Text style={pc.adviceIcon}>💡</Text>
        <Text style={pc.advice}>{advice}</Text>
      </View>
    </View>
  );
}

function createPcStyles(theme: ThemeColors) {
  return StyleSheet.create({
    card: { backgroundColor: theme.bgCard, borderRadius: 16, borderWidth: 1.5, marginBottom: TempleSpacing.md, overflow: 'hidden' },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: TempleSpacing.sm },
    title: { fontSize: TempleFonts.heading, fontWeight: 'bold' },
    star: { fontSize: TempleFonts.body, fontWeight: '600' },
    summary: { color: theme.textLight, fontSize: TempleFonts.body, lineHeight: 22, padding: TempleSpacing.sm, paddingTop: 4 },
    adviceRow: { flexDirection: 'row', gap: 6, padding: TempleSpacing.sm, paddingTop: 0 },
    adviceIcon: { fontSize: 14, marginTop: 2 },
    advice: { color: theme.textMuted, fontSize: TempleFonts.small, lineHeight: 18, flex: 1 },
  });
}

export default function ZiweiScreen() {
  const { theme } = useAppTheme();
  const { t } = useI18n();
  const s = useMemo(() => createStyles(theme), [theme]);
  const PALACE_COLORS = useMemo(() => getPalaceColors(theme), [theme]);
  const [birthYear, setBirthYear] = useState('');
  const [result, setResult] = useState<ZiweiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalc = () => {
    const y = parseInt(birthYear);
    if (!y || y < 1900 || y > 2100) { setError(t('ziweiErrorYearRange')); return; }
    setLoading(true);
    setError('');
    // Simulate brief calculation delay for UX
    setTimeout(() => {
      const r = calcZiwei(y);
      if (!r) { setError(t('ziweiErrorCalcFailed')); setLoading(false); return; }
      setResult(r);
      setLoading(false);
    }, 400);
  };

  return (
    <SafeAreaView style={s.safe}>
      <DecorativeBg pattern="diamond" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.title}>{t('ziweiPageTitle')}</Text>
          <Text style={s.subtitle}>{t('ziweiSubtitle')}</Text>

          <View style={s.inputCard}>
            <Text style={s.inputLabel}>{t('ziweiLabelBirthYear')}</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                value={birthYear}
                onChangeText={v => { setBirthYear(v); setError(''); }}
                placeholder={t('ziweiPlaceholderYear')}
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
              <TouchableOpacity style={s.calcBtn} onPress={handleCalc}>
                <Text style={s.calcBtnText}>{t('ziweiButtonCalc')}</Text>
              </TouchableOpacity>
            </View>
            {error ? <Text style={s.error}>{error}</Text> : null}
          </View>

          {loading ? (
            <View style={s.loadingCard}>
              <Text style={s.loadingIcon}>⭐</Text>
              <Text style={s.loadingText}>{t('ziweiLoading')}</Text>
            </View>
          ) : null}

          {result && (
            <>
              <View style={s.summaryCard}>
                <Text style={s.ganZhi}>{result.ganZhi} 年生</Text>
                <Text style={s.summaryText}>天干：{result.stem} 地支：{result.branch}</Text>
                <Text style={s.summaryText}>紫微星落於：<Text style={s.highlight}>{result.ziweiPalace}</Text></Text>
                <Text style={s.summaryText}>命宮主星：<Text style={s.highlight}>{result.mingGong.star}星</Text></Text>
              </View>

              <PalaceCard
                title={t('ziweiPalaceMing')}
                star={`主星：${result.mingGong.star}`}
                summary={result.mingGong.trait + '\n\n' + result.mingGong.talent}
                advice={'發揮天賦才能，走適合自己個性的道路。'}
                color={PALACE_COLORS['命宮']}
              />

              <PalaceCard
                title={t('ziweiPalaceCaibo')}
                summary={result.caibo.summary}
                advice={result.caibo.advice}
                color={PALACE_COLORS['財帛宮']}
              />

              <PalaceCard
                title={t('ziweiPalaceFuqi')}
                summary={result.fuqi.summary}
                advice={result.fuqi.advice}
                color={PALACE_COLORS['夫妻宮']}
              />

              <View style={s.disclaimer}>
                <Text style={s.disclaimerText}>
                  {t('ziweiDisclaimer')}
                </Text>
              </View>
            </>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bgDark },
  scroll: { padding: TempleSpacing.md, paddingBottom: TempleSpacing.xxl },
  title: { fontSize: TempleFonts.subtitle, fontWeight: 'bold', color: theme.textGold, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: TempleFonts.small, color: theme.textMuted, textAlign: 'center', marginBottom: TempleSpacing.lg, lineHeight: 18 },
  inputCard: { backgroundColor: theme.bgCard, borderRadius: 16, borderWidth: 1, borderColor: theme.gold + '40', padding: TempleSpacing.md, marginBottom: TempleSpacing.md },
  inputLabel: { color: theme.textGold, fontSize: TempleFonts.body, marginBottom: TempleSpacing.sm },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: theme.bgMedium, borderRadius: 10, borderWidth: 1, borderColor: theme.gold, padding: 12, color: theme.textLight, fontSize: TempleFonts.heading, textAlign: 'center' } as any,
  calcBtn: { backgroundColor: theme.gold, borderRadius: 10, paddingHorizontal: TempleSpacing.lg, justifyContent: 'center', alignItems: 'center' },
  calcBtnText: { color: theme.bgDark, fontWeight: 'bold', fontSize: TempleFonts.body },
  error: { color: theme.danger, fontSize: TempleFonts.small, marginTop: 6 },
  loadingCard: { backgroundColor: theme.bgCard, borderRadius: 16, borderWidth: 1, borderColor: theme.gold + '40', padding: TempleSpacing.xl, marginBottom: TempleSpacing.md, alignItems: 'center' },
  loadingIcon: { fontSize: 32, marginBottom: 8 },
  loadingText: { color: theme.textGold, fontSize: TempleFonts.body },
  summaryCard: { backgroundColor: theme.bgCard, borderRadius: 16, borderWidth: 1, borderColor: theme.goldDark + '60', padding: TempleSpacing.md, marginBottom: TempleSpacing.md, alignItems: 'center' },
  ganZhi: { fontSize: TempleFonts.title, fontWeight: 'bold', color: theme.goldLight, marginBottom: 6 },
  summaryText: { fontSize: TempleFonts.body, color: theme.textLight, marginBottom: 4 },
  highlight: { color: theme.goldLight, fontWeight: 'bold' },
  disclaimer: { backgroundColor: theme.bgMedium, borderRadius: 10, padding: TempleSpacing.sm, marginTop: 4 },
  disclaimerText: { color: theme.textMuted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  });
}
