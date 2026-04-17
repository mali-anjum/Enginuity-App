import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { HardwareForm, type HardwareFormValues } from '@/hardware/components/hardware-form';
import { addHardwareThunk } from '@/hardware/state/hardwareSlice';
import { useAppDispatch } from '@/sharedModules/state/hooks';

const INITIAL_VALUES: HardwareFormValues = {
  name: '',
  type: 'MCU',
  specs: '',
  datasheetUrl: '',
  serialNumber: '',
};

export default function AddHardwareScreen() {
  const [values, setValues] = useState<HardwareFormValues>(INITIAL_VALUES);
  const dispatch = useAppDispatch();
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
            void dispatch(
              addHardwareThunk({
                name: values.name.trim(),
                type: values.type,
                specs: values.specs.trim(),
                datasheetUrl: values.datasheetUrl.trim(),
                serialNumber: values.serialNumber.trim() || undefined,
              }),
            );
            router.replace('/hardware');
          }}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
});
