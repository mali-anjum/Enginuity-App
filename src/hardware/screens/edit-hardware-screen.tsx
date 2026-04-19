import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { HardwareForm, type HardwareFormValues } from '@/hardware/components/hardware-form';
import { selectHardwareById, updateHardwareThunk } from '@/hardware/state/hardwareSlice';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export default function EditHardwareScreen() {
  const { hardwareId } = useLocalSearchParams<{ hardwareId: string }>();
  const hardware = useAppSelector(selectHardwareById(hardwareId ?? ''));
  const dispatch = useAppDispatch();
  const router = useRouter();

  const initialValues = useMemo<HardwareFormValues>(
    () => ({
      name: hardware?.name ?? '',
      category: hardware?.category ?? 'MCU',
      specs: hardware?.specs ?? '',
      datasheetUrl: hardware?.datasheetUrl ?? '',
    }),
    [hardware],
  );
  const [values, setValues] = useState<HardwareFormValues>(initialValues);

  if (!hardware) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>Hardware item not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Edit Hardware</ThemedText>
        <HardwareForm
          values={values}
          onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
          submitLabel="Update Hardware"
          onSubmit={() => {
            if (!values.name.trim()) return;
            void dispatch(
              updateHardwareThunk({
                ...hardware,
                name: values.name.trim(),
                category: values.category,
                specs: values.specs.trim(),
                datasheetUrl: values.datasheetUrl.trim(),
              }),
            );
            router.replace(`/hardware/${hardware.id}`);
          }}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16 },
  content: { gap: 12, paddingBottom: 40 },
});
