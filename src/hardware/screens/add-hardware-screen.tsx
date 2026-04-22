import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { HardwareForm, type HardwareFormValues } from '@/hardware/organisms/hardware-form';
import { addHardwareThunk } from '@/hardware/state/hardwareSlice';
import { ProPaywallModal } from '@/monetization/organisms/pro-paywall-modal';
import {
  openCheckoutThunk,
  selectCanCreateHardware,
  selectIsCheckoutLoading,
} from '@/monetization/state/monetizationSlice';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

const INITIAL_VALUES: HardwareFormValues = {
  name: '',
  category: 'MCU',
  specs: '',
  datasheetUrl: '',
};

export default function AddHardwareScreen() {
  const [values, setValues] = useState<HardwareFormValues>(INITIAL_VALUES);
  const [showPaywall, setShowPaywall] = useState(false);
  const dispatch = useAppDispatch();
  const canCreateHardware = useAppSelector(selectCanCreateHardware);
  const isCheckoutLoading = useAppSelector(selectIsCheckoutLoading);
  const router = useRouter();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Add Hardware</ThemedText>
        <HardwareForm
          values={values}
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
          submitLabel="Save Hardware"
          onSubmit={() => {
            if (!values.name.trim()) return;
            if (!canCreateHardware) {
              setShowPaywall(true);
              return;
            }
            void dispatch(
              addHardwareThunk({
                name: values.name.trim(),
                category: values.category,
                specs: values.specs.trim(),
                datasheetUrl: values.datasheetUrl.trim(),
              }),
            );
            router.replace('/hardware');
          }}
        />
      </ScrollView>
      <ProPaywallModal
        visible={showPaywall}
        title="You've reached 5 hardware components."
        description="Upgrade to Pro for unlimited hardware."
        isUpgradeLoading={isCheckoutLoading}
        onClose={() => setShowPaywall(false)}
        onUpgrade={() => {
          void dispatch(openCheckoutThunk());
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
});
