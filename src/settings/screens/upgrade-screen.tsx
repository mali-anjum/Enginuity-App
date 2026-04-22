import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import {
  fetchSubscriptionStatusThunk,
  openCheckoutThunk,
  selectIsCheckoutLoading,
  selectIsProPlan,
  selectSubscriptionPlan,
} from '@/monetization/state/monetizationSlice';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

type BillingCycle = 'monthly' | 'annual';

const ANNUAL_PRICE = 39;
const ANNUAL_MONTH_EQUIVALENT = ANNUAL_PRICE / 12;

const FEATURE_ROWS = [
  { label: 'Projects, experiments, and hardware', free: 'Limited', pro: 'Unlimited' },
  { label: 'Storage', free: 'Up to 100MB', pro: 'Unlimited' },
  { label: 'CSV data charts', free: 'Not included', pro: 'Included' },
  { label: 'PDF experiment export', free: 'Not included', pro: 'Included' },
  { label: 'Priority support', free: 'Not included', pro: 'Included' },
];

const TESTIMONIALS = [
  'This helped my student team keep every build test in one place. - Mechanical lead',
  'Realtime updates and exports made our reports way easier. - Robotics captain',
  'The Pro plan saved us from juggling multiple tools. - Embedded systems student',
];

export default function UpgradeScreen() {
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const isCheckoutLoading = useAppSelector(selectIsCheckoutLoading);
  const isPro = useAppSelector(selectIsProPlan);
  const plan = useAppSelector(selectSubscriptionPlan);
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const priceLabel = useMemo(() => {
    if (cycle === 'monthly') {
      return '$4.99 / month';
    }
    return '$39 / year';
  }, [cycle]);

  const secondaryPrice = useMemo(() => {
    if (cycle === 'monthly') {
      return 'Billed monthly';
    }
    return `$${ANNUAL_MONTH_EQUIVALENT.toFixed(2)} per month billed annually`;
  }, [cycle]);

  const handleUpgrade = async () => {
    await dispatch(openCheckoutThunk(cycle));
    setIsRefreshing(true);
    await dispatch(fetchSubscriptionStatusThunk());
    setIsRefreshing(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchSubscriptionStatusThunk());
    setIsRefreshing(false);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Upgrade to Pro</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Unlock unlimited usage, advanced exports, and collaboration without free-tier caps.
        </ThemedText>

        <View
          style={[
            styles.planCard,
            { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
          ]}>
          <View style={styles.cycleToggleRow}>
            <Pressable
              onPress={() => setCycle('monthly')}
              style={[
                styles.cycleChip,
                cycle === 'monthly'
                  ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                  : { backgroundColor: themeColors.surface, borderColor: themeColors.border },
              ]}>
              <ThemedText
                lightColor={cycle === 'monthly' ? themeColors.buttonPrimaryText : themeColors.text}
                darkColor={cycle === 'monthly' ? themeColors.buttonPrimaryText : themeColors.text}>
                Monthly
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setCycle('annual')}
              style={[
                styles.cycleChip,
                cycle === 'annual'
                  ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                  : { backgroundColor: themeColors.surface, borderColor: themeColors.border },
              ]}>
              <ThemedText
                lightColor={cycle === 'annual' ? themeColors.buttonPrimaryText : themeColors.text}
                darkColor={cycle === 'annual' ? themeColors.buttonPrimaryText : themeColors.text}>
                Annual (save 35%)
              </ThemedText>
            </Pressable>
          </View>

          <ThemedText type="subtitle">{priceLabel}</ThemedText>
          <ThemedText style={{ color: themeColors.mutedText }}>{secondaryPrice}</ThemedText>
          <ThemedText style={{ color: themeColors.mutedText }}>
            Current plan: {isPro ? plan.replace('_', ' ') : 'free'}
          </ThemedText>

          <Pressable
            style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}
            disabled={isCheckoutLoading}
            onPress={() => void handleUpgrade()}>
            <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
              {isCheckoutLoading ? 'Opening checkout...' : 'Continue to checkout'}
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, { borderColor: themeColors.border }]}
            disabled={isRefreshing}
            onPress={() => void handleRefresh()}>
            <ThemedText>{isRefreshing ? 'Refreshing...' : 'I completed payment - refresh access'}</ThemedText>
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Free vs Pro</ThemedText>
          <View style={[styles.table, { borderColor: themeColors.border }]}>
            <View
              style={[
                styles.tableHeader,
                { borderBottomColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
              ]}>
              <ThemedText type="defaultSemiBold" style={styles.columnFeature}>
                Feature
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.columnPlan}>
                Free
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.columnPlan}>
                Pro
              </ThemedText>
            </View>
            {FEATURE_ROWS.map((row) => (
              <View key={row.label} style={[styles.tableRow, { borderBottomColor: themeColors.border }]}>
                <ThemedText style={styles.columnFeature}>{row.label}</ThemedText>
                <ThemedText style={[styles.columnPlan, { color: themeColors.mutedText }]}>{row.free}</ThemedText>
                <ThemedText style={[styles.columnPlan, { color: themeColors.primary }]}>{row.pro}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">What users say</ThemedText>
          {TESTIMONIALS.map((quote) => (
            <View
              key={quote}
              style={[
                styles.quoteCard,
                { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
              ]}>
              <ThemedText style={{ color: themeColors.mutedText }}>{quote}</ThemedText>
            </View>
          ))}
          <ThemedText style={{ color: themeColors.subtleText, fontSize: 12 }}>
            Placeholder testimonials for v0.7. Replace with real user feedback later.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 44 },
  planCard: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  cycleToggleRow: { flexDirection: 'row', gap: 8 },
  cycleChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryButton: { borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  secondaryButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  section: { gap: 8 },
  table: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 1,
  },
  columnFeature: { flex: 1.6 },
  columnPlan: { flex: 1, textAlign: 'center' },
  quoteCard: { borderWidth: 1, borderRadius: 12, padding: 10 },
});
