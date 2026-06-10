// 真人解籤師諮詢頁（P3）
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { PremiumPaywall } from '@/components/PremiumPaywall';
import { canUseFeature, isPremiumActive } from '@/services/premiumService';

interface Consultant {
  id: string;
  name: string;
  title: string;
  specialty: string[];
  experience: string;
  rating: number;
  reviewCount: number;
  pricePerSession: string;
  duration: string;
  available: boolean;
  description: string;
  badge?: string;
}

const CONSULTANTS: Consultant[] = [
  {
    id: 'master_chen',
    name: '陳明德師父',
    title: '廟宇住持・命理師',
    specialty: ['籤詩解析', '八字命理', '婚姻感情'],
    experience: '30 年',
    rating: 4.9,
    reviewCount: 847,
    pricePerSession: 'NT$800',
    duration: '30 分鐘',
    available: true,
    description: '出身傳統廟宇世家，精通各籤詩系統，擅長以淺顯易懂的方式傳達神明旨意。',
    badge: '熱門',
  },
  {
    id: 'master_lin',
    name: '林靜惠老師',
    title: '命理師・塔羅占卜師',
    specialty: ['流年運勢', '事業財運', '考運'],
    experience: '15 年',
    rating: 4.8,
    reviewCount: 423,
    pricePerSession: 'NT$600',
    duration: '30 分鐘',
    available: true,
    description: '同時擅長東西方命理，以現代心理學輔佐傳統命理，讓解讀更貼近現代生活。',
    badge: '新人推薦',
  },
  {
    id: 'master_wang',
    name: '王天佑道長',
    title: '道教傳承・玄學顧問',
    specialty: ['消災解厄', '合婚分析', '擇日'],
    experience: '22 年',
    rating: 4.7,
    reviewCount: 312,
    pricePerSession: 'NT$1,200',
    duration: '45 分鐘',
    available: false,
    description: '道家第三代傳人，精通奇門遁甲與三式，適合處理複雜的運勢議題與家宅風水。',
  },
  {
    id: 'master_huang',
    name: '黃淑芬老師',
    title: '紫微斗數・八字師',
    specialty: ['紫微斗數', '八字命理', '子女緣'],
    experience: '18 年',
    rating: 4.8,
    reviewCount: 561,
    pricePerSession: 'NT$900',
    duration: '40 分鐘',
    available: true,
    description: '專精紫微斗數，能精準分析人生不同階段的運勢走向，協助規劃重要人生決策。',
  },
];

export default function ConsultScreen() {
  const layout = useResponsiveLayout();
  const [showPaywall, setShowPaywall] = useState(false);
  const [premiumActive, setPremiumActive] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);

  useEffect(() => {
    isPremiumActive().then(setPremiumActive);
  }, []);

  const handleBook = async (consultant: Consultant) => {
    if (!consultant.available) {
      Alert.alert('目前休假中', `${consultant.name}目前不接受預約，請稍後再試。`);
      return;
    }
    const allowed = await canUseFeature('consult');
    if (!allowed) {
      setShowPaywall(true);
      return;
    }
    Alert.alert(
      `預約 ${consultant.name}`,
      `費用：${consultant.pricePerSession} / ${consultant.duration}\n\n正式上線後可在此預約視訊諮詢。此為展示功能。`,
      [{ text: '了解', style: 'default' }]
    );
  };

  const STARS = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { maxWidth: layout.contentMaxWidth, paddingHorizontal: layout.gutter },
        ]}
      >
        <Text style={styles.pageTitle}>真人解籤諮詢</Text>
        <Text style={styles.pageSubtitle}>
          由資深命理師為你深度解析籤詩，一對一視訊諮詢
        </Text>

        {/* 說明卡 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 諮詢流程</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepDot}><Text style={styles.stepNum}>1</Text></View>
            <Text style={styles.stepText}>選擇命理師，查看專長與評價</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepDot}><Text style={styles.stepNum}>2</Text></View>
            <Text style={styles.stepText}>預約時段，最快當日可約</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepDot}><Text style={styles.stepNum}>3</Text></View>
            <Text style={styles.stepText}>透過視訊進行 30-45 分鐘深度解析</Text>
          </View>
          <View style={[styles.stepRow, { borderBottomWidth: 0 }]}>
            <View style={styles.stepDot}><Text style={styles.stepNum}>4</Text></View>
            <Text style={styles.stepText}>收到文字版解析報告，可隨時回顧</Text>
          </View>

          {!premiumActive && (
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => setShowPaywall(true)}>
              <Text style={styles.upgradeBtnText}>👑 升級年訂閱享首次諮詢免費</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 命理師列表 */}
        <Text style={styles.sectionTitle}>精選命理師</Text>

        {CONSULTANTS.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.consultCard,
              selectedConsultant?.id === c.id && styles.consultCardSelected,
              !c.available && styles.consultCardUnavail,
            ]}
            onPress={() => setSelectedConsultant(prev => prev?.id === c.id ? null : c)}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              {/* 頭像 */}
              <View style={[styles.avatar, { backgroundColor: TempleTheme.goldDark + '33' }]}>
                <Text style={styles.avatarText}>{c.name[0]}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.consultName}>{c.name}</Text>
                  {c.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{c.badge}</Text>
                    </View>
                  )}
                  {!c.available && (
                    <View style={[styles.badge, styles.badgeUnavail]}>
                      <Text style={[styles.badgeText, { color: TempleTheme.textMuted }]}>休假中</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.consultTitle}>{c.title}</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.stars}>{STARS(c.rating)}</Text>
                  <Text style={styles.rating}>{c.rating}</Text>
                  <Text style={styles.reviewCount}>({c.reviewCount} 則評價)</Text>
                </View>
              </View>

              <View style={styles.priceBlock}>
                <Text style={styles.price}>{c.pricePerSession}</Text>
                <Text style={styles.duration}>{c.duration}</Text>
              </View>
            </View>

            <View style={styles.specialtyRow}>
              {c.specialty.map(s => (
                <View key={s} style={styles.specialtyChip}>
                  <Text style={styles.specialtyText}>{s}</Text>
                </View>
              ))}
              <Text style={styles.experienceText}>資歷 {c.experience}</Text>
            </View>

            {/* 展開詳情 */}
            {selectedConsultant?.id === c.id && (
              <View style={styles.expandPanel}>
                <View style={styles.divider} />
                <Text style={styles.consultDesc}>{c.description}</Text>
                <TouchableOpacity
                  style={[styles.bookBtn, !c.available && styles.bookBtnDisabled]}
                  onPress={() => handleBook(c)}
                >
                  <Text style={styles.bookBtnText}>
                    {c.available ? '立即預約諮詢' : '目前休假中'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Q&A */}
        <View style={styles.faqCard}>
          <Text style={styles.faqTitle}>常見問題</Text>
          {[
            { q: '可以帶著抽好的籤詩諮詢嗎？', a: '可以！這是最推薦的方式，命理師會結合你的問題與籤詩做完整解析。' },
            { q: '諮詢語言有限制嗎？', a: '目前命理師均以中文為主，部分師父可以台語溝通，可在預約時說明。' },
            { q: '如果諮詢不滿意可以退款嗎？', a: '諮詢完成後24小時內如有疑慮，可申請客服介入處理。' },
          ].map(item => (
            <View key={item.q} style={styles.faqItem}>
              <Text style={styles.faqQ}>Q：{item.q}</Text>
              <Text style={styles.faqA}>A：{item.a}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      <PremiumPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureName="真人諮詢"
        onActivated={() => { setPremiumActive(true); setShowPaywall(false); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  container: { flex: 1 },
  content: { width: '100%', alignSelf: 'center', paddingVertical: TempleSpacing.md },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  pageSubtitle: {
    color: TempleTheme.textMuted,
    textAlign: 'center',
    fontSize: TempleFonts.small,
    marginBottom: TempleSpacing.md,
  },
  infoCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '24',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.md,
  },
  infoTitle: {
    color: TempleTheme.goldLight,
    fontWeight: '800',
    fontSize: TempleFonts.body,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '14',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: TempleTheme.goldDark + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { color: TempleTheme.gold, fontWeight: '900', fontSize: 12 },
  stepText: { color: TempleTheme.textLight, fontSize: TempleFonts.small, flex: 1 },
  upgradeBtn: {
    marginTop: 12,
    backgroundColor: TempleTheme.goldDark + '44',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TempleTheme.gold + '55',
  },
  upgradeBtnText: { color: TempleTheme.gold, fontWeight: '700', fontSize: 13 },
  sectionTitle: {
    color: TempleTheme.goldLight,
    fontWeight: '800',
    fontSize: TempleFonts.body,
    marginBottom: TempleSpacing.sm,
  },
  consultCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '24',
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
  },
  consultCardSelected: {
    borderColor: TempleTheme.gold + '80',
  },
  consultCardUnavail: { opacity: 0.65 },
  cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 10 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: TempleTheme.goldDark + '60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: TempleTheme.gold, fontWeight: '900', fontSize: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  consultName: { color: TempleTheme.goldLight, fontWeight: '800', fontSize: TempleFonts.body },
  consultTitle: { color: TempleTheme.textMuted, fontSize: 12, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stars: { color: TempleTheme.gold, fontSize: 12 },
  rating: { color: TempleTheme.goldLight, fontWeight: '700', fontSize: 12 },
  reviewCount: { color: TempleTheme.textMuted, fontSize: 11 },
  badge: {
    backgroundColor: TempleTheme.gold + '22',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: TempleTheme.gold + '55',
  },
  badgeUnavail: { backgroundColor: 'transparent', borderColor: TempleTheme.goldDark + '40' },
  badgeText: { color: TempleTheme.gold, fontSize: 10, fontWeight: '700' },
  priceBlock: { alignItems: 'flex-end' },
  price: { color: TempleTheme.gold, fontWeight: '900', fontSize: 16 },
  duration: { color: TempleTheme.textMuted, fontSize: 11, marginTop: 2 },
  specialtyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  specialtyChip: {
    backgroundColor: TempleTheme.goldDark + '22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '44',
  },
  specialtyText: { color: TempleTheme.textMuted, fontSize: 11 },
  experienceText: { color: TempleTheme.textMuted, fontSize: 11, marginLeft: 'auto' },
  expandPanel: { marginTop: 10 },
  divider: {
    height: 1,
    backgroundColor: TempleTheme.goldDark + '30',
    marginBottom: 10,
  },
  consultDesc: {
    color: TempleTheme.textLight,
    fontSize: TempleFonts.small,
    lineHeight: 20,
    marginBottom: 12,
  },
  bookBtn: {
    backgroundColor: TempleTheme.gold,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookBtnDisabled: { backgroundColor: TempleTheme.goldDark + '44' },
  bookBtnText: { color: TempleTheme.bgDark, fontWeight: '900', fontSize: TempleFonts.body },
  faqCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '24',
    padding: TempleSpacing.md,
    marginTop: TempleSpacing.sm,
    marginBottom: TempleSpacing.md,
  },
  faqTitle: {
    color: TempleTheme.goldLight,
    fontWeight: '800',
    fontSize: TempleFonts.body,
    marginBottom: 12,
  },
  faqItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '14',
  },
  faqQ: { color: TempleTheme.textLight, fontWeight: '700', fontSize: 13, marginBottom: 4 },
  faqA: { color: TempleTheme.textMuted, fontSize: 12, lineHeight: 18 },
});
