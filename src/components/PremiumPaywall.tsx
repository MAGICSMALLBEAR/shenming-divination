// 付費牆元件：功能受限時顯示升級提示
import React, { useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import {
  SUBSCRIPTION_PLANS,
  activatePlan,
  isPremiumActive,
  type PremiumPlan,
} from '@/services/premiumService';

interface Props {
  visible: boolean;
  onClose: () => void;
  featureName?: string;
  onActivated?: () => void;
}

export function PremiumPaywall({ visible, onClose, featureName, onActivated }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>('yearly');
  const [activating, setActivating] = useState(false);
  const [alreadyPremium, setAlreadyPremium] = useState(false);

  useEffect(() => {
    if (visible) {
      isPremiumActive().then(setAlreadyPremium);
    }
  }, [visible]);

  const handleActivate = async () => {
    setActivating(true);
    await activatePlan(selectedPlan);
    setActivating(false);
    onActivated?.();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* 標題 */}
          <View style={styles.header}>
            <Text style={styles.crown}>👑</Text>
            <Text style={styles.title}>神明占卜 Premium</Text>
            {featureName && (
              <Text style={styles.featureHint}>「{featureName}」為付費功能</Text>
            )}
            <Text style={styles.subtitle}>解鎖完整命理體驗，讓神明完整指引你的人生</Text>
          </View>

          {alreadyPremium && (
            <View style={styles.alreadyPremiumBanner}>
              <Text style={styles.alreadyPremiumText}>✓ 你已是 Premium 會員，享有所有功能</Text>
            </View>
          )}

          {/* 方案卡片 */}
          {SUBSCRIPTION_PLANS.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                plan.highlight && styles.planCardHighlight,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, plan.highlight && styles.planNameHighlight]}>
                    {plan.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.planPrice, plan.highlight && styles.planPriceHighlight]}>
                      {plan.price}
                    </Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                </View>
                {plan.badge && (
                  <View style={[styles.badge, plan.highlight && styles.badgeHighlight]}>
                    <Text style={styles.badgeText}>{plan.badge}</Text>
                  </View>
                )}
                <View style={[styles.radio, selectedPlan === plan.id && styles.radioSelected]} />
              </View>
              <View style={styles.featureList}>
                {plan.features.slice(0, 5).map(f => (
                  <Text key={f} style={styles.featureItem}>✓ {f}</Text>
                ))}
                {plan.features.length > 5 && (
                  <Text style={styles.featureMore}>+{plan.features.length - 5} 項更多功能</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* 功能對比 */}
          <View style={styles.compareCard}>
            <Text style={styles.compareTitle}>功能對比</Text>
            <View style={styles.compareRow}>
              <Text style={styles.compareFeature}>每日求籤</Text>
              <Text style={styles.compareFree}>免費：3次</Text>
              <Text style={styles.comparePaid}>付費：無限</Text>
            </View>
            <View style={styles.compareRow}>
              <Text style={styles.compareFeature}>AI 解析</Text>
              <Text style={styles.compareFree}>免費：基礎</Text>
              <Text style={styles.comparePaid}>付費：完整+追問</Text>
            </View>
            <View style={styles.compareRow}>
              <Text style={styles.compareFeature}>流年運勢</Text>
              <Text style={styles.compareFree}>免費：—</Text>
              <Text style={styles.comparePaid}>付費：✓</Text>
            </View>
            <View style={styles.compareRow}>
              <Text style={styles.compareFeature}>合婚/擇日</Text>
              <Text style={styles.compareFree}>免費：—</Text>
              <Text style={styles.comparePaid}>付費：✓</Text>
            </View>
            <View style={[styles.compareRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.compareFeature}>線上點燈</Text>
              <Text style={styles.compareFree}>免費：—</Text>
              <Text style={styles.comparePaid}>付費：✓</Text>
            </View>
          </View>

          <Text style={styles.legalNote}>
            訂閱將自動續費，可隨時在設定中取消。{'\n'}
            ※ 目前為展示版本，不會實際扣款
          </Text>
        </ScrollView>

        {/* 底部按鈕 */}
        <View style={styles.footer}>
          {!alreadyPremium && (
            <TouchableOpacity
              style={[styles.activateBtn, activating && styles.activateBtnDisabled]}
              onPress={handleActivate}
              disabled={activating}
            >
              <Text style={styles.activateBtnText}>
                {activating ? '處理中...' : `升級 ${SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name}`}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>
              {alreadyPremium ? '關閉' : '暫不升級'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  content: { padding: TempleSpacing.md, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: TempleSpacing.lg },
  crown: { fontSize: 48, marginBottom: 8 },
  title: {
    fontSize: TempleFonts.heading,
    fontWeight: '900',
    color: TempleTheme.gold,
    marginBottom: 6,
  },
  featureHint: {
    color: TempleTheme.vermilion,
    fontWeight: '700',
    fontSize: TempleFonts.small,
    marginBottom: 6,
  },
  subtitle: {
    color: TempleTheme.textMuted,
    fontSize: TempleFonts.small,
    textAlign: 'center',
    lineHeight: 20,
  },
  alreadyPremiumBanner: {
    backgroundColor: '#2d5a2d55',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4caf5066',
    padding: 12,
    marginBottom: TempleSpacing.md,
    alignItems: 'center',
  },
  alreadyPremiumText: { color: '#81c784', fontWeight: '700' },
  planCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: TempleTheme.goldDark + '30',
    padding: TempleSpacing.md,
    marginBottom: 12,
  },
  planCardSelected: {
    borderColor: TempleTheme.gold,
    backgroundColor: TempleTheme.goldDark + '18',
  },
  planCardHighlight: {
    borderColor: TempleTheme.gold + '88',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  planName: { color: TempleTheme.textLight, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  planNameHighlight: { color: TempleTheme.gold },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  planPrice: { color: TempleTheme.goldLight, fontWeight: '900', fontSize: 22 },
  planPriceHighlight: { color: TempleTheme.gold },
  planPeriod: { color: TempleTheme.textMuted, fontSize: 12 },
  badge: {
    backgroundColor: TempleTheme.goldDark + '44',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '88',
  },
  badgeHighlight: { backgroundColor: TempleTheme.gold + '22', borderColor: TempleTheme.gold },
  badgeText: { color: TempleTheme.gold, fontWeight: '700', fontSize: 11 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: TempleTheme.textMuted,
  },
  radioSelected: { borderColor: TempleTheme.gold, backgroundColor: TempleTheme.gold },
  featureList: { gap: 4 },
  featureItem: { color: TempleTheme.textLight, fontSize: 13 },
  featureMore: { color: TempleTheme.textMuted, fontSize: 12 },
  compareCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '24',
    padding: TempleSpacing.md,
    marginBottom: 12,
  },
  compareTitle: {
    color: TempleTheme.goldLight,
    fontWeight: '800',
    fontSize: TempleFonts.body,
    marginBottom: 10,
  },
  compareRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '14',
    gap: 8,
  },
  compareFeature: { flex: 1.2, color: TempleTheme.textLight, fontSize: 13 },
  compareFree: { flex: 1, color: TempleTheme.textMuted, fontSize: 12 },
  comparePaid: { flex: 1, color: TempleTheme.gold, fontSize: 12, fontWeight: '600' },
  legalNote: {
    color: TempleTheme.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: TempleSpacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: TempleSpacing.md,
    paddingBottom: 32,
    backgroundColor: TempleTheme.bgDark,
    borderTopWidth: 1,
    borderTopColor: TempleTheme.goldDark + '24',
    gap: 8,
  },
  activateBtn: {
    backgroundColor: TempleTheme.gold,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activateBtnDisabled: { opacity: 0.6 },
  activateBtnText: {
    color: TempleTheme.bgDark,
    fontWeight: '900',
    fontSize: TempleFonts.body,
  },
  closeBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '44',
  },
  closeBtnText: { color: TempleTheme.textMuted, fontSize: TempleFonts.body },
});
