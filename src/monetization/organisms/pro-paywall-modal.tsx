import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  isUpgradeLoading?: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export function ProPaywallModal({
  visible,
  title,
  description,
  isUpgradeLoading = false,
  onClose,
  onUpgrade,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.border },
          ]}>
          <ThemedText type="subtitle">{title}</ThemedText>
          <ThemedText style={{ color: themeColors.mutedText }}>{description}</ThemedText>
          <View style={styles.featuresWrap}>
            <ThemedText style={{ color: themeColors.subtleText }}>Pro includes:</ThemedText>
            <ThemedText style={{ color: themeColors.subtleText }}>
              Unlimited projects, experiments, hardware, storage, PDF export, CSV charts, priority support.
            </ThemedText>
          </View>
          <View style={styles.actionsRow}>
            <Pressable
              onPress={onClose}
              style={[
                styles.secondaryButton,
                { borderColor: themeColors.border, backgroundColor: themeColors.surface },
              ]}>
              <ThemedText>Not now</ThemedText>
            </Pressable>
            <Pressable
              onPress={onUpgrade}
              style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}>
              <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
                {isUpgradeLoading ? 'Opening…' : 'Upgrade to Pro'}
              </ThemedText>
            </Pressable>
          </View>
          <ThemedText style={{ color: themeColors.mutedText, fontSize: 12 }}>
            $4.99/month or $39/year
          </ThemedText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  featuresWrap: { gap: 4 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
});
